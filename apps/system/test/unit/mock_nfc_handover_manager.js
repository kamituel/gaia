'use strict';
(function(exports) {

  var MockNfcHandoverManager = {
    isHandoverInProgress: function() { return undefined; },
    transferComplete: function(details) {}
  };

  exports.MockNfcHandoverManager = MockNfcHandoverManager;
})(window);
