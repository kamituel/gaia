/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/* Copyright © 2013, Deutsche Telekom, Inc. */

/* globals dump, BluetoothTransfer, NDEFUtils, NfcConnectSystemDialog,
           NDEF, NfcHandoverManager */
/* exported NfcHandoverManager */
'use strict';

(function(exports) {

  /**
   * NfcHandoverManager handles handovers from other Bluetooth devices according
   * to the specification of the NFC Forum 
   * (Document: NFCForum-TS-ConnectionHandover_1_2.doc). 
   * @class NfcHandoverManager
   */
  function NfcHandoverManager() {}

  NfcHandoverManager.prototype = {
    /** @lends NfcHandoverManager */

    /**
     * Flag which turns on debuging messages
     * @type {boolean}
     * @memberof NfcHandoverManager.prototype
     */
    DEBUG: false,

    /**
     * mozSettings object
     * @type {Object}
     * @memberof NfcHandoverManager.prototype
     */
    settings: null,

    /**
     * mozBluetooth object
     * @type {Object}
     * @memberof NfcHandoverManager.prototype
     */
    bluetooth: null,

    /**
     * mozNfc object
     * @type {Object}
     * @memberof NfcHandoverManager.prototype
     */
    nfc: null,

    /**
     * Default bluetooth adapter
     * @type {Object}
     * @memberof NfcHandoverManager.prototype
     */
    defaultAdapter: null,

    /**
     * Keeps a list of actions that need to be performed after
     * Bluetooth is turned on.
     * @type {Array}
     * @memberof NfcHandoverManager.prototype
     */
    actionQueue: [],

    /**
     * Set whenever an app called peer.sendFile(blob).
     * It will be inspected in the handling of Handover Select messages
     * to distinguish between static and negotiated handovers.
     * @type {Object}
     * @memberof NfcHandoverManager.prototype
     */
    sendFileRequest: null,

    /**
     * Set to true during a file transfer that was initiated by another device.
     * @type {boolean}
     * @memberof NfcHandoverManager.prototype
     */
    incomingFileTransferInProgress: false,

    /**
     * Remembers whether Bluetooth was enabled or disabled prior to a file
     * transfer.
     * @type {boolean}
     * @memberof NfcHandoverManager.prototype
     */
    bluetoothWasEnabled: false,

    /**
     * Used to prevent triggering Settings multiple times.
     * @memberof NfcHandoverManager.prototype
     */
    settingsNotified: false,

    /**
     * Debug method
     * @param {String} msg debug messages
     * @param {Object} opObject object to printed after doing JSON.stringfy
     * @memberof NfcHandoverManager.prototype
     */
    _debug: function _debug(msg, optObject) {
      if (this.DEBUG) {
        var output = '[DEBUG] SYSTEM NFC-HANDOVER: ' + msg;
        if (optObject) {
          output += JSON.stringify(optObject);
        }
        if (typeof dump !== 'undefined') {
          dump(output + '\n');
        } else {
          console.log(output);
        }
      }
    },

    /**
     * Initializes event and message handlers, initializes properties
     * @memberof NfcHandoverManager.prototype
     */
    start: function() {
      var self = this;

      this.settings = navigator.mozSettings;
      this.bluetooth = navigator.mozBluetooth;
      this.nfc = navigator.mozNfc;

      if (this.bluetooth.enabled) {
        this._debug('Bluetooth already enabled on boot');
        var req = this.bluetooth.getDefaultAdapter();
        req.onsuccess = function bt_getAdapterSuccess() {
          self.defaultAdapter = req.result;
          self._debug('MAC address: ' + self.defaultAdapter.address);
          self._debug('MAC name: ' + self.defaultAdapter.name);
        };
      }

      window.addEventListener('bluetooth-adapter-added', this);
      window.navigator.mozSetMessageHandler('nfc-manager-send-file',
        function(msg) {
          self._debug('In New event nfc-manager-send-file' +
                     JSON.stringify(msg));
          self.handleFileTransfer(msg.sessionToken, msg.blob, msg.requestId);
      });
    },

    /**
     * Removes event and message handlers
     * @memberof NfcHandoverManager.prototype
     */
    stop: function() {
      window.removeEventListener('bluetooth-adapter-added', this);
      window.navigator.mozSetMessageHandler('nfc-manager-send-file', null);
    },

    /**
     * Handles bluetooth-adapter-added event
     * @param {DOMEvent} event
     */
    handleEvent: function(event) {
      var self = this;
      this._debug('bluetooth-adapter-added');
      var req = this.bluetooth.getDefaultAdapter();
      req.onsuccess = function bt_getAdapterSuccess() {
        self.settingsNotified = false;
        self.defaultAdapter = req.result;
        self._debug('MAC address: ' + self.defaultAdapter.address);
        self._debug('MAC name: ' + self.defaultAdapter.name);
        /*
         * Call all actions that have queued up while Bluetooth
         * was turned on.
         */
        for (var i = 0; i < self.actionQueue.length; i++) {
          var action = self.actionQueue[i];
          action.callback.apply(self, action.args);
        }
        self.actionQueue = [];
      };
    },

    /**
     * Performs an action once Bluetooth is enabled. If Bluetooth is disabled,
     * it is enabled and the action is queued. If Bluetooth is already enabled,
     * performs the action directly.
     * @param {Object} action action to be performed
     * @param {function} action.callback function to be executed
     * @param {Array} action.args arguments for the function
     * @memberof NfcHandoverManager.prototype
     */
    _doAction: function(action) {
      if (!this.bluetooth.enabled) {
        this._debug('Bluetooth: not yet enabled');
        this.actionQueue.push(action);
        if (this.settingsNotified === false) {
          this.settings.createLock().set({'bluetooth.enabled': true});
          this.settingsNotified = true;
        }
      } else {
        action.callback.apply(this, action.args);
      }
    },

    /**
     * Gets the data about other device taking part in handover proces
     * from NDEF message
     * @param {Array} ndef NDEF message
     * @returns {Object} ssp - object containing info about other devices
     * @returns {string} ssp.mac - mac addres of other devices
     * @returns {string} ssp.localName - local name if present in NDEF message,
     * null otherwise
     * @memberof NfcHandoverManager.prototype
     */
    _getBluetoothSSP: function(ndef) {
      var handover = NDEFUtils.parseHandoverNDEF(ndef);
      if (handover == null) {
        // Bad handover message. Just ignore.
        this._debug('Bad handover messsage');
        return null;
      }
      var btsspRecord = NDEFUtils.searchForBluetoothAC(handover);
      if (btsspRecord == null) {
        // There is no Bluetooth Alternative Carrier record in the
        // Handover Select message. Since we cannot handle WiFi Direct,
        // just ignore.
        this._debug('No BT AC');
        return null;
      }
      return NDEFUtils.parseBluetoothSSP(btsspRecord);
    },

    /**
     * Performs bluetooth pairing with other device
     * @param {string} mac mac of other device 
     * @memberof NfcHandoverManager.prototype
     */
    _doPairing: function(mac) {
      this._debug('_doPairing: ' + mac);
      if (this.defaultAdapter == null) {
        // No BT
        this._debug('No defaultAdapter');
        return;
      }
      var req = this.defaultAdapter.pair(mac);
      var self = this;
      req.onsuccess = function() {
        self._debug('Pairing succeeded');
        self._doConnect(mac);
      };
      req.onerror = function() {
        self._debug('Pairing failed');
      };
    },

    /**
     * Performs bluetooth file transfer if this.sendFileRequest exists
     * to other device
     * @param {string} mac mac of the other device
     * @memberof NfcHandoverManager.prototype
     */
    _doFileTransfer: function(mac) {
      this._debug('_doFileTransfer');
      if (this.sendFileRequest == null) {
        // Nothing to do
        this._debug('No pending sendFileRequest');
        return;
      }
      this._debug('Send blob to ' + mac);
      var blob = this.sendFileRequest.blob;
      BluetoothTransfer.sendFile(mac, blob);
    },

    /**
     * Performs tha actual handover request
     * @param {Array} ndef NDEF message conating the handover request record 
     * @param {string} session  session token
     * @memberof NfcHandoverManager.prototype
     */
    _doHandoverRequest: function(ndef, session) {
      this._debug('_doHandoverRequest');
      if (this._getBluetoothSSP(ndef) == null) {
        /*
         * The handover request didn't contain a valid MAC address. Simply
         * ignore the request.
         */
        return;
      }

      var nfcPeer = this.nfc.getNFCPeer(session);
      var cps = this.bluetooth.enabled ? NDEF.CPS_ACTIVE : NDEF.CPS_ACTIVATING;
      var mac = this.defaultAdapter.address;
      var hs = NDEFUtils.encodeHandoverSelect(mac, cps);
      var req = nfcPeer.sendNDEF(hs);
      var self = this;
      req.onsuccess = function() {
        self._debug('sendNDEF(hs) succeeded');
        self.incomingFileTransferInProgress = true;
      };
      req.onerror = function() {
        self._debug('sendNDEF(hs) failed');
      };
    },

    /**
     * Initiate a file transfer by sending a Handover Request to the
     * remote device.
     * @param session
     * @param blob
     * @param requestId
     * @memberof NfcHandoverManager.prototype
     */
    _initiateFileTransfer: function(session, blob, requestId) {
      var self = this;
      var onsuccess = function() {
        self._dispatchSendFileStatus(0);
      };
      var onerror = function() {
        self._dispatchSendFileStatus(1);
      };
      this.sendFileRequest = {session: session, blob: blob,
                              requestId: requestId,
                              onsuccess: onsuccess, onerror: onerror};
      var nfcPeer = this.nfc.getNFCPeer(session);
      var cps = this.bluetooth.enabled ?
                NDEF.CPS_ACTIVE : NDEF.CPS_ACTIVATING;
      var mac = this.defaultAdapter.address;
      var hr = NDEFUtils.encodeHandoverRequest(mac, cps);
      var req = nfcPeer.sendNDEF(hr);
      req.onsuccess = function() {
        self._debug('sendNDEF(hr) succeeded');
      };
      req.onerror = function() {
        self._debug('sendNDEF(hr) failed');
        onerror();
        self.sendFileRequest = null;
      };
    },

    /**
     * Connects via bluetooth to the paired device
     * @param {string} mac MAC addres of the paired device 
     * @memberof NfcHandoverManager.prototype
     */
    _doConnect: function(mac) {
      this._debug('_doConnect with: ' + mac);
      /*
       * Bug 979427:
       * After pairing we connect to the remote device. The only thing we
       * know here is the MAC address, but the defaultAdapter.connect()
       * requires a BluetoothDevice argument. So we use getPairedDevices()
       * to map the MAC to a BluetoothDevice instance.
       */
      var req = this.defaultAdapter.getPairedDevices();
      var self = this;
      req.onsuccess = function() {
        var devices = req.result;
        self._debug('# devices: ' + devices.length);
        var successCb = function() { self._debug('Connect succeeded'); };
        var errorCb = function() { self._debug('Connect failed'); };
        for (var i = 0; i < devices.length; i++) {
          var device = devices[i];
          self._debug('Address: ' + device.address);
          self._debug('Connected: ' + device.connected);
          if (device.address.toLowerCase() == mac.toLowerCase()) {
                self._debug('Connecting to ' + mac);
                var r = self.defaultAdapter.connect(device);
                r.onsuccess = successCb;
                r.onerror = errorCb;
          }
        }
      };
      req.onerror = function() {
        self._debug('Cannot get paired devices from adapter.');
      };
    },

    /**
     * Dispatches status of file sending to mozNfc
     * @param {number} status status of file send operation
     * @memberof NfcHandoverManager.prototype
     */
    _dispatchSendFileStatus: function(status) {
      this._debug('In _dispatchSendFileStatus ' + status);
      navigator.mozNfc.notifySendFileStatus(status,
                           this.sendFileRequest.requestId);
    },

    /**
     * @param mac
     * @memberof NfcHandoverManager.prototype
     */
    _onRequestConnect: function(btssp) {
      var self = this;
      var onconfirm = function() {
        self._debug('Connect confirmed');
        self._doAction({callback: self._doPairing, args: [btssp.mac]});
      };
      var onabort = function() {
        self._debug('Connect aborted');
      };
      if (!this.nfcConnectSystemDialog) {
        this.nfcConnectSystemDialog = new NfcConnectSystemDialog();
      }
      this.nfcConnectSystemDialog.show(btssp.localName, onconfirm, onabort);
    },

    /**
     * Handles simplified pairing record
     * @param {Array} ndef NDEF message containing simplified pairing record
     * @memberof NfcHandoverManager.prototype
     */
    handleSimplifiedPairingRecord: function(ndef) {
      this._debug('handleSimplifiedPairingRecord');
      var pairingRecord = ndef[0];
      var btssp = NDEFUtils.parseBluetoothSSP(pairingRecord);
      this._debug('Simplified pairing with: ' + btssp.mac);
      this._onRequestConnect(btssp);
    },

    /**
     * Handle NDEF Handover Select message.
     * @param {Array} ndef NDEF message containing handover select record
     * @memberof NfcHandoverManager.prototype
     */
    handleHandoverSelect: function(ndef) {
      this._debug('handleHandoverSelect');
      var btssp = this._getBluetoothSSP(ndef);
      if (btssp == null) {
        return;
      }
      if (this.sendFileRequest != null) {
        // This is the response to a file transfer request (negotiated handover)
        this._doAction({callback: this._doFileTransfer, args: [btssp.mac]});
      } else {
        // This is a static handover
        this._onRequestConnect(btssp);
      }
    },

    /**
     * Handles NDEF Handover Request message.
     * @param {Array} ndef NDEF message containing handover request record
     * @memberof NfcHandoverManager.prototype
     */
    handleHandoverRequest: function(ndef, session) {
      this._debug('handleHandoverRequest');
      this.bluetoothWasEnabled = this.bluetooth.enabled;
      this._doAction({
        callback: this._doHandoverRequest,
        args: [ndef, session]
      });
    },

    /**
     * Trigger a file transfer with a remote device via BT.
     * @param session
     * @param blob
     * @param requestId
     * @memberof NfcHandoverManager.prototype
     */
    handleFileTransfer: function(session, blob, requestId) {
      this._debug('handleFileTransfer');
      this.bluetoothWasEnabled = this.bluetooth.enabled;
      this._doAction({
        callback: this._initiateFileTransfer,
        args: [session, blob, requestId]
      });
    },

    /**
     * Returns true if a handover is in progress. 
     * @returns {boolean} true if handover is progressing
     * @memberof NfcHandoverManager.prototype
     */
    isHandoverInProgress: function isHandoverInProgress() {
      return (this.sendFileRequest != null) ||
             (this.incomingFileTransferInProgress === true);
    },

    /**
     * Tells NfcHandoverManager that a file transfer was completed.
     * @param succeeded
     * @memberof NfcHandoverManager.prototype
     */
    transferComplete: function transferComplete(succeeded) {
      this._debug('transferComplete');
      if (!this.bluetoothWasEnabled) {
        this._debug('Disabling Bluetooth');
        this.settings.createLock().set({'bluetooth.enabled': false});
      }
      if (this.sendFileRequest != null) {
        // Completed an outgoing send file request. Call onsuccess/onerror
        if (succeeded) {
          this.sendFileRequest.onsuccess();
        } else {
          this.sendFileRequest.onerror();
        }
        this.sendFileRequest = null;
        this.incomingFileTransferInProgress = false;
      }
    }
  };

  exports.NfcHandoverManager = NfcHandoverManager;

}(window));

window.NfcHandoverManager = new NfcHandoverManager();
window.NfcHandoverManager.start();
