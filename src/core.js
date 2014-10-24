'use strict';

var marked = require('marked');
var hljs = require('highlight.js');
var assign = require('./assign');

function createRenderer (options) {
  var renderer = new marked.Renderer();
  Object.keys(options).forEach(function map (key) {
    renderer[key] = options[key];
  });
  return renderer;
}

function getHighlightingRenderer (prev) {
  var s = (prev || renderer);
  var renderer = new marked.Renderer();
  var baseCodeRenderer = s.code;
  var baseCodeSpanRenderer = s.codespan;
  Object.keys(prev).forEach(function (key) {
    renderer[key] = prev[key];
  });

  renderer.code = function () {
    var result = baseCodeRenderer.apply(this, arguments);
    var classed = result.replace(/^<pre><code>/i, '<pre class="hljs-pre"><code class="hljs">');
    return classed;
  };
  renderer.codespan = function () {
    var result = baseCodeSpanRenderer.apply(this, arguments);
    var classed = result.replace(/^<code>/i, '<code class="hljs">');
    return classed;
  };
  renderer._highlighting = true;
  return renderer;
}

function ultramarked (src, opt) {
  var options = assign({}, marked.defaults, opt);
  var aliases = options.aliases || ultramarked.aliases;
  var no = 'no-highlight';

  if (options.terminal) {
    delete options.ultralight;
    delete options.ultrasanitize;
  }
  if (options.ultralight) {
    options.langPrefix = 'ultralight-lang-'; // placeholder
    options.highlight = function (code, lang) {
      if (!lang) {
        return code;
      }
      var lower = lang.toLowerCase();
      try {
        return hljs.highlight(aliases[lower] || lower, code).value;
      } catch (ex) {} // marked will know what to do.
    };
    if (!options.renderer || !options.renderer._highlighting) {
      options.renderer = getHighlightingRenderer(options.renderer);
    }
  }

  var tokens = marked.lexer(src, options);
  var result = marked.parser(tokens, options);

  if (options.ultralight) { // fix the language class using common aliases
    result = result.replace(/"ultralight-lang-([\w-]+)"/ig, replacer);
    result = result.replace(/^<pre>/, '<pre class="hljs-pre">');
  }

  function replacer (match, lang) {
    var lower = lang.toLowerCase();
    var result = aliases[lower] || lower || no;

    return '"hljs ' + result + '"';
  }

  if (options.ultrasanitize) {
    result = require('./sanitizer.js')(result, options);
  } else if (options.sanitizer) {
    result = options.sanitizer(result, options);
  }
  return result;
}

hljs.configure({ classPrefix: 'hljs-' });

ultramarked.setOptions = marked.setOptions;
ultramarked.renderer = createRenderer;
ultramarked.aliases = {
  js: 'javascript',
  md: 'markdown',
  html: 'xml', // next best thing
  jade: 'css' // next best thing
};

module.exports = ultramarked;
