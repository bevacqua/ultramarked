'use strict';

var marked = require('marked'),
    hljs = require('highlight.js'),
    exports = module.exports = marked,
    alises = exports.aliases = {
        'js': 'javascript'
    };

function ultramarked(src, options) {
    options = options || {};
    options.gfm = options.gfm !== false;
    
    var aliases = options.aliases || exports.aliases;

    if (options.ultralight){
        options.highlight = function (code, lang) {
            var lower;

            if (lang) {
                try {
                    lower = lang.toLowerCase();
                    return hljs.highlight(aliases[lower] || lower, code).value;
                } catch (ex) {} //let marked automatically escape code in a language we don't speak
            }
        };
    }
    
    var tokens = marked.lexer(src, options),
        result = marked.parser(tokens, options);

    return result;
}

ultramarked.parse = ultramarked;