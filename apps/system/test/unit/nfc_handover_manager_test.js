'use strict';

/* globals MocksHelper,
           NfcBuffer, NDEF, NfcUtils, NfcManagerUtils,
           NfcManager */

require('/shared/test/unit/mocks/mock_settings_listener.js');
require('/shared/test/unit/mocks/mock_navigator_moz_set_message_handler.js');
require('/shared/test/unit/mocks/mock_navigator_moz_settings.js');
requireApp('callscreen/test/unit/mock_mozbluetooth.js');
requireApp('system/js/nfc_handover_manager.js');

suite('NFC Handover Manager', function() {
  var realMozBluetooth;
  var realMozSetMessageHandler;
  var realMozSettings;

  setup(function() {
    realMozBluetooth = navigator.mozBluetooth;
    window.navigator.mozBluetooth = MockMozBluetooth;

    realMozSetMessageHandler = navigator.mozSetMessageHandler;
    navigator.mozSetMessageHandler = window.MockNavigatormozSetMessageHandler;
    navigator.mozSetMessageHandler.mSetup();

    realMozSettings = navigator.mozSettings;
    navigator.mozSettings = MockNavigatorSettings;

    NfcHandoverManager.init();
  });

  teardown(function() {
    NfcHandoverManager.actionQueue.splice(0);

    navigator.mozBluetooth = realMozBluetooth;
    navigator.mozSetMessageHandler = realMozSetMessageHandler;
    navigator.mozSettings = realMozSettings;
  });

  test('Action queuing while Bluetooth disabled', function() {
    assert.equal(0, NfcHandoverManager.actionQueue.length);
    NfcHandoverManager.doAction({});
    assert.equal(1, NfcHandoverManager.actionQueue.length);
  });

  test('Actions from queue executed when Bluetooth turned on', function() {
    var action = {
      callback: this.sinon.spy(),
      args: ['lorem', 100]
    }

    NfcHandoverManager.doAction(action);
    assert.isTrue(action.callback.notCalled);

    dispatchEvent(new CustomEvent('bluetooth-adapter-added'));
    navigator.mozBluetooth.triggerOnGetAdapterSuccess();

    assert.isTrue(action.callback.called);
  });
});
