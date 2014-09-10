function encodeHtml (text) {
  if (!text) {
    return text;
  }
  var ta = document.createElement('textarea');
  ta.innerText = ta.textContent = text;
  return ta.innerHTML;
}

function decodeHtml (html) {
  if (!html) {
    return html;
  }
  var ta = document.createElement('textarea');
  ta.innerHTML = html;
  return ta.innerText || ta.textContent;
}

encodeHtml.options = decodeHtml.options = {};

module.exports = {
  encode: encodeHtml,
  escape: encodeHtml,
  decode: decodeHtml,
  unescape: decodeHtml,
  version: '1.0.0-browser'
};
