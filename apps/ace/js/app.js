window.addEventListener('DOMContentLoaded', function() {
  'use strict';

  var seButton = document.querySelector('#se'),
      exitButton = document.querySelector('#exit'),
      resultDiv = document.querySelector('#result');

  seButton.onclick = () => {
    resultDiv.textContent = '';
    var startTime = new Date().getTime();

    window.navigator.mozFake.openLogicalChannel()
      .then(() => {
        var endTime = new Date().getTime();
        resultDiv.textContent = 'Channel opened, access granted. Took ' +
                                (endTime - startTime) + ' ms';
      }, (err) => {
        resultDiv.textContent = 'Channel not opened. Error: ' + JSON.stringify(err);
      });
  };

  exitButton.onclick = () => {
    window.close();
  };
});
