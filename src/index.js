'use strict';

var marked = require('marked'),
    hljs = require('highlight.js'),
    exports = module.exports = ultramarked,
    alises = exports.aliases = {
        'js': 'javascript',
        'md': 'markdown'
    };

function merge(obj) {
    var i = 1, target, key;

    for(; i < arguments.length; i++){
        target = arguments[i];

        for(key in target){
            if(Object.prototype.hasOwnProperty.call(target, key)){
                obj[key] = target[key];
            }
        }
    }
    return obj;
}

function ultramarked(src, opt) {
    var options = merge({}, marked.defaults, opt),
        aliases = options.aliases || exports.aliases,
        no = 'no-highlight';

    if (options.ultralight){
        options.langPrefix = 'ultralight-lang-'; // placeholder
        options.highlight = function (code, lang) {
            var lower = (lang || no).toLowerCase();
            try{
                return hljs.highlight(aliases[lower] || lower, code).value;
            } catch (ex) {} // marked will know what to do.
        };
    }

    var tokens = marked.lexer(src, options),
        result = marked.parser(tokens, options);

    if(options.ultralight){ // fix the language class using common aliases
        result = result.replace(/"ultralight-lang-([\w-]+)"/ig, function(match, lang){
            var lower = lang.toLowerCase(),
                result = aliases[lower] || lower || no;

            return '"' + result + '"';
        });
    }

    if(options.ultrasanitize){
        result = require('./sanitizer.js')(result);
    }else if(options.ultrasanitize_pagedown){
        result = require('./sanitizer-pagedown.js')(result);
    }

    return result;
}

ultramarked.setOptions = marked.setOptions;
