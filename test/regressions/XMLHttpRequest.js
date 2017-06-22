// We are hijacking the ajax protocol in order the count the number of pending
// network requests.
// This information can later be used to know if the UI is done processing user
// interactions.

const oldOpen = XMLHttpRequest.prototype.open;
window.openHTTPs = 0;
XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
  window.openHTTPs++;
  this.addEventListener(
    'readystatechange',
    function() {
      if (this.readyState === 4) {
        window.openHTTPs--;
      }
    },
    false
  );
  oldOpen.call(this, method, url, async, user, pass);
};
