'use strict';

var marked = require('marked');
var hljs = require('highlight.js');
var assign = require('./assign');
var exports = module.exports = ultramarked;
var alises = exports.aliases = {
    'js': 'javascript',
    'md': 'markdown',
    'html': 'xml', // next best thing
    'jade': 'css' // next best thing
};


hljs.configure({ classPrefix: 'hljs-' });

function createRenderer (options) {
    var renderer = new marked.Renderer();
    Object.keys(options).forEach(function map (key) {
        renderer[key] = options[key];
    });
    return renderer;
}

function getHighlightingRenderer (prev) {
    var renderer = prev || new marked.Renderer();
    var baseCodeRenderer = renderer.code;
    var baseCodeSpanRenderer = renderer.codespan;

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
    return renderer;
}

function ultramarked(src, opt) {
    var options = assign({}, marked.defaults, opt),
        aliases = options.aliases || exports.aliases,
        no = 'no-highlight';

    if (options.terminal){
        delete options.ultralight;
        delete options.ultrasanitize;
    }
    if (options.ultralight){
        options.langPrefix = 'ultralight-lang-'; // placeholder
        options.highlight = function (code, lang) {
            if (!lang) {
                return code;
            }
            var lower = lang.toLowerCase();
            try{
                return hljs.highlight(aliases[lower] || lower, code).value;
            } catch (ex) {} // marked will know what to do.
        };
        options.renderer = getHighlightingRenderer(options.renderer);
    }

    var tokens = marked.lexer(src, options),
        result = marked.parser(tokens, options);

    if (options.ultralight) { // fix the language class using common aliases
        result = result.replace(/"ultralight-lang-([\w-]+)"/ig, function (match, lang) {
            var lower = lang.toLowerCase(),
                result = aliases[lower] || lower || no;

            return '"hljs ' + result + '"';
        });
        result = result.replace(/^<pre>/, '<pre class="hljs-pre">');
    }

    if(options.ultrasanitize){
        result = require('./sanitizer.js')(result, options);
    }else if(options.sanitizer){
        result = options.sanitizer(result, options);
    }
    return result;
}

ultramarked.setOptions = marked.setOptions;
ultramarked.renderer = createRenderer;
