'use strict';

/* global HardwareButtons, MocksHelper, ScreenManager */

mocha.globals(['HardwareButtons', 'ScreenManager']);

requireApp('system/js/hardware_buttons.js');
requireApp('system/test/unit/mock_screen_manager.js');

var mocksForHardwareButtons = new MocksHelper(['ScreenManager']).init();

suite('system/HardwareButtons', function() {
  mocksForHardwareButtons.attachTestHelpers();

  var hardwareButtons;

  //var realDispatchEvent = window.dispatchEvent;
  var CustomEvent = window.CustomEvent;

  var fireChromeEvent = function(type) {
    var evt = new CustomEvent('mozChromeEvent', {
      detail: {
        type: type
      }
    });

    /**
     * XXX: Instead of dispatch the event through real dispatchEvent here
     * (bypass stub), we call handleEvent() directly to avoid possible conflict
     * within our dirty unit test environment. See bug 864178 for detail.
     */
    //realDispatchEvent.call(window, evt);
    hardwareButtons.handleEvent(evt);
  };

  setup(function() {
    /**
     * Since the script still initialize itself, we should not allow
     * the "global" instance from being responsive in our tests here.
     */
    if (window.hardwareButtons) {
      window.hardwareButtons.stop();
      window.hardwareButtons = null;
    }

    hardwareButtons = new HardwareButtons();
    hardwareButtons.start();

<<<<<<< HEAD
    window.CustomEvent = function MockCustomEvent(type) {
      return { type: type };
=======
    window.CustomEvent = function MockCustomEvent(type, dict) {
      return { type: type, bubbles: dict.bubbles };
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    };
  });

  teardown(function() {
    hardwareButtons.stop();

    ScreenManager.screenEnabled = true;
    window.CustomEvent = CustomEvent;
  });

  test('press and release home (screen enabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    fireChromeEvent('home-button-press');
    fireChromeEvent('home-button-release');

    assert.isTrue(stubDispatchEvent.calledOnce);
<<<<<<< HEAD
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'home' }));
=======
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'home',
                                                 bubbles: true }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.HOLD_INTERVAL);
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and release home (screen disabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    ScreenManager.screenEnabled = false;
    fireChromeEvent('home-button-press');
    fireChromeEvent('home-button-release');

    assert.isTrue(stubDispatchEvent.calledOnce);
<<<<<<< HEAD
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'wake' }));
=======
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'wake',
                                                 bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.HOLD_INTERVAL);
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and release sleep (screen enabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    fireChromeEvent('sleep-button-press');
    fireChromeEvent('sleep-button-release');

    assert.isTrue(stubDispatchEvent.calledOnce);
<<<<<<< HEAD
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'sleep' }));
=======
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'sleep',
                                                 bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.HOLD_INTERVAL);
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and release sleep (screen disabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    ScreenManager.screenEnabled = false;
    fireChromeEvent('sleep-button-press');
    fireChromeEvent('sleep-button-release');

    assert.isTrue(stubDispatchEvent.calledOnce);
<<<<<<< HEAD
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'wake' }));
=======
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'wake',
                                                 bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.HOLD_INTERVAL);
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('hold home and press sleep (screen enabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');

    fireChromeEvent('sleep-button-press');
    fireChromeEvent('home-button-press');
    fireChromeEvent('sleep-button-release');
    fireChromeEvent('home-button-release');

    assert.isTrue(stubDispatchEvent.calledOnce);
<<<<<<< HEAD
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'home+sleep' }));
=======
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'home+sleep',
                                                 bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
  });

  test('hold home and press sleep (screen disabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    ScreenManager.screenEnabled = false;
    fireChromeEvent('sleep-button-press');
    fireChromeEvent('home-button-press');
    fireChromeEvent('sleep-button-release');
    fireChromeEvent('home-button-release');

    assert.isTrue(stubDispatchEvent.calledTwice);
    assert.isTrue(
<<<<<<< HEAD
      stubDispatchEvent.getCall(0).calledWith({ type: 'wake' }));
    assert.isTrue(
      stubDispatchEvent.getCall(1).calledWith({ type: 'home+sleep' }));
=======
      stubDispatchEvent.getCall(0).calledWith({ type: 'wake',
                                                bubbles: false }));
    assert.isTrue(
      stubDispatchEvent.getCall(1).calledWith({ type: 'home+sleep',
                                                bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.HOLD_INTERVAL);
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('hold sleep and press home (screen enabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    fireChromeEvent('home-button-press');
    fireChromeEvent('sleep-button-press');
    fireChromeEvent('sleep-button-release');
    fireChromeEvent('home-button-release');

    assert.isTrue(stubDispatchEvent.calledOnce);
<<<<<<< HEAD
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'home+sleep' }));
=======
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'home+sleep',
                                                 bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.HOLD_INTERVAL);
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('hold sleep and press home (screen disabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    ScreenManager.screenEnabled = false;
    fireChromeEvent('home-button-press');
    fireChromeEvent('sleep-button-press');
    fireChromeEvent('sleep-button-release');
    fireChromeEvent('home-button-release');

    assert.isTrue(stubDispatchEvent.calledTwice);
    assert.isTrue(
<<<<<<< HEAD
      stubDispatchEvent.getCall(0).calledWith({ type: 'wake' }));
    assert.isTrue(
      stubDispatchEvent.getCall(1).calledWith({ type: 'home+sleep' }));
=======
      stubDispatchEvent.getCall(0).calledWith({ type: 'wake',
                                                bubbles: false }));
    assert.isTrue(
      stubDispatchEvent.getCall(1).calledWith({ type: 'home+sleep',
                                                bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.HOLD_INTERVAL);
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and hold home (screen enabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    fireChromeEvent('home-button-press');

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.HOLD_INTERVAL);
    stubSetTimeout.getCall(0).args[0].call(window);

    fireChromeEvent('home-button-release');

    assert.isTrue(stubDispatchEvent.calledOnce);
<<<<<<< HEAD
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'holdhome' }));
=======
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'holdhome',
                                                 bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and hold home (screen disabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    ScreenManager.screenEnabled = false;
    fireChromeEvent('home-button-press');

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.HOLD_INTERVAL);
    stubSetTimeout.getCall(0).args[0].call(window);

    fireChromeEvent('home-button-release');

    assert.isTrue(stubDispatchEvent.calledTwice);
    assert.isTrue(
<<<<<<< HEAD
      stubDispatchEvent.getCall(0).calledWith({ type: 'wake' }));
    assert.isTrue(
      stubDispatchEvent.getCall(1).calledWith({ type: 'holdhome' }));
=======
      stubDispatchEvent.getCall(0).calledWith({ type: 'wake',
                                                bubbles: false }));
    assert.isTrue(
      stubDispatchEvent.getCall(1).calledWith({ type: 'holdhome',
                                                bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and hold sleep (screen enabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    fireChromeEvent('sleep-button-press');

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.HOLD_INTERVAL);
    stubSetTimeout.getCall(0).args[0].call(window);

    fireChromeEvent('sleep-button-release');

    assert.isTrue(stubDispatchEvent.calledOnce);
<<<<<<< HEAD
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'holdsleep' }));
=======
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'holdsleep',
                                                 bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and hold sleep (screen disabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    ScreenManager.screenEnabled = false;
    fireChromeEvent('sleep-button-press');

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.HOLD_INTERVAL);
    stubSetTimeout.getCall(0).args[0].call(window);

    fireChromeEvent('sleep-button-release');

    assert.isTrue(stubDispatchEvent.calledTwice);
    assert.isTrue(
<<<<<<< HEAD
      stubDispatchEvent.getCall(0).calledWith({ type: 'wake' }));
    assert.isTrue(
      stubDispatchEvent.getCall(1).calledWith({ type: 'holdsleep' }));
=======
      stubDispatchEvent.getCall(0).calledWith({ type: 'wake',
                                                bubbles: false }));
    assert.isTrue(
      stubDispatchEvent.getCall(1).calledWith({ type: 'holdsleep',
                                                bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and release volume up (screen enabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    fireChromeEvent('volume-up-button-press');
    fireChromeEvent('volume-up-button-release');

    assert.isTrue(stubDispatchEvent.calledOnce);
<<<<<<< HEAD
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'volumeup' }));
=======
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'volumeup',
                                                 bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.REPEAT_DELAY);
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and release volume up (screen disabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    ScreenManager.screenEnabled = false;
    fireChromeEvent('volume-up-button-press');
    fireChromeEvent('volume-up-button-release');

    assert.isTrue(stubDispatchEvent.calledOnce);
<<<<<<< HEAD
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'volumeup' }));
=======
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'volumeup',
                                                 bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.REPEAT_DELAY);
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and hold volume up (screen enabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    fireChromeEvent('volume-up-button-press');

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.REPEAT_DELAY);
    stubSetTimeout.getCall(0).args[0].call(window);

    assert.isTrue(stubDispatchEvent.calledOnce);
    assert.isTrue(
<<<<<<< HEAD
      stubDispatchEvent.getCall(0).calledWith({ type: 'volumeup' }));
=======
      stubDispatchEvent.getCall(0).calledWith({ type: 'volumeup',
                                                bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b

    assert.isTrue(stubSetTimeout.calledTwice);
    assert.equal(stubSetTimeout.getCall(1).args[1],
      hardwareButtons.REPEAT_INTERVAL);
    stubSetTimeout.getCall(1).args[0].call(window);

    fireChromeEvent('volume-up-button-release');

    assert.isTrue(stubDispatchEvent.calledTwice);
    assert.isTrue(
<<<<<<< HEAD
      stubDispatchEvent.getCall(1).calledWith({ type: 'volumeup' }));
=======
      stubDispatchEvent.getCall(1).calledWith({ type: 'volumeup',
                                                bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and hold volume up (screen disabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    ScreenManager.screenEnabled = false;
    fireChromeEvent('volume-up-button-press');

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.REPEAT_DELAY);
    stubSetTimeout.getCall(0).args[0].call(window);

    assert.isTrue(stubDispatchEvent.calledOnce);
    assert.isTrue(
<<<<<<< HEAD
      stubDispatchEvent.getCall(0).calledWith({ type: 'volumeup' }));
=======
      stubDispatchEvent.getCall(0).calledWith({ type: 'volumeup',
                                                bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b

    assert.isTrue(stubSetTimeout.calledTwice);
    assert.equal(stubSetTimeout.getCall(1).args[1],
      hardwareButtons.REPEAT_INTERVAL);
    stubSetTimeout.getCall(1).args[0].call(window);

    fireChromeEvent('volume-up-button-release');

    assert.isTrue(stubDispatchEvent.calledTwice);
    assert.isTrue(
<<<<<<< HEAD
      stubDispatchEvent.getCall(1).calledWith({ type: 'volumeup' }));
=======
      stubDispatchEvent.getCall(1).calledWith({ type: 'volumeup',
                                                bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and release volume down (screen enabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    fireChromeEvent('volume-down-button-press');
    fireChromeEvent('volume-down-button-release');

    assert.isTrue(stubDispatchEvent.calledOnce);
<<<<<<< HEAD
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'volumedown' }));
=======
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'volumedown',
                                                  bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.REPEAT_DELAY);
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and release volume down (screen disabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    ScreenManager.screenEnabled = false;
    fireChromeEvent('volume-down-button-press');
    fireChromeEvent('volume-down-button-release');

    assert.isTrue(stubDispatchEvent.calledOnce);
<<<<<<< HEAD
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'volumedown' }));
=======
    assert.isTrue(stubDispatchEvent.calledWith({ type: 'volumedown',
                                                 bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.REPEAT_DELAY);
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and hold volume down (screen enabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    fireChromeEvent('volume-down-button-press');

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.REPEAT_DELAY);
    stubSetTimeout.getCall(0).args[0].call(window);

    assert.isTrue(stubDispatchEvent.calledOnce);
    assert.isTrue(
<<<<<<< HEAD
      stubDispatchEvent.getCall(0).calledWith({ type: 'volumedown' }));
=======
      stubDispatchEvent.getCall(0).calledWith({ type: 'volumedown',
                                                bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b

    assert.isTrue(stubSetTimeout.calledTwice);
    assert.equal(stubSetTimeout.getCall(1).args[1],
      hardwareButtons.REPEAT_INTERVAL);
    stubSetTimeout.getCall(1).args[0].call(window);

    fireChromeEvent('volume-down-button-release');

    assert.isTrue(stubDispatchEvent.calledTwice);
    assert.isTrue(
<<<<<<< HEAD
      stubDispatchEvent.getCall(1).calledWith({ type: 'volumedown' }));
=======
      stubDispatchEvent.getCall(1).calledWith({ type: 'volumedown',
                                                bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });

  test('press and hold volume down (screen disabled)', function() {
    var stubDispatchEvent = this.sinon.stub(window, 'dispatchEvent');
    var stubSetTimeout = this.sinon.stub(window, 'setTimeout');
    stubSetTimeout.returns(Math.floor(Math.random() * 10000));
    var stubClearTimeout = this.sinon.stub(window, 'clearTimeout');

    ScreenManager.screenEnabled = false;
    fireChromeEvent('volume-down-button-press');

    assert.isTrue(stubSetTimeout.calledOnce);
    assert.equal(stubSetTimeout.getCall(0).args[1],
      hardwareButtons.REPEAT_DELAY);
    stubSetTimeout.getCall(0).args[0].call(window);

    assert.isTrue(stubDispatchEvent.calledOnce);
    assert.isTrue(
<<<<<<< HEAD
      stubDispatchEvent.getCall(0).calledWith({ type: 'volumedown' }));
=======
      stubDispatchEvent.getCall(0).calledWith({ type: 'volumedown',
                                                bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b

    assert.isTrue(stubSetTimeout.calledTwice);
    assert.equal(stubSetTimeout.getCall(1).args[1],
      hardwareButtons.REPEAT_INTERVAL);
    stubSetTimeout.getCall(1).args[0].call(window);

    fireChromeEvent('volume-down-button-release');

    assert.isTrue(stubDispatchEvent.calledTwice);
    assert.isTrue(
<<<<<<< HEAD
      stubDispatchEvent.getCall(1).calledWith({ type: 'volumedown' }));
=======
      stubDispatchEvent.getCall(1).calledWith({ type: 'volumedown',
                                                bubbles: false }));
>>>>>>> c250da9f8fdc511ad718ba594a0aa60a5959e74b
    assert.isTrue(stubClearTimeout.calledOnce);
    assert.equal(stubClearTimeout.getCall(0).args[0],
      stubSetTimeout.getCall(0).returnValue);
  });
});
