window.addEventListener('DOMContentLoaded', function() {
  'use strict';

  var button = document.querySelector('button'),
      resultDiv = document.querySelector('#result');

  button.onclick = () => {
    window.navigator.mozFake.openLogicalChannel()
      .then(() => {
        resultDiv.textContent = 'Channel opened, access granted.';
      }, (err) => {
        resultDiv.textContent = 'Channel not opened. Error: ' + JSON.stringify(err);
      });
  };
});
