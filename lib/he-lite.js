function encodeHtml (text) {
  if (!text) {
    return text;
  }
  var div = document.createElement('div');
  div.innerText = div.textContent = text;
  return div.innerHTML;
}

function decodeHtml (html) {
  if (!html) {
    return html;
  }
  var div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText || div.textContent;
}

encodeHtml.options = decodeHtml.options = {};

module.exports = {
  encode: encodeHtml,
  escape: encodeHtml,
  decode: decodeHtml,
  unescape: decodeHtml
  version: '1.0.0-browser'
};
