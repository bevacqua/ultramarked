# ultramarked

[**Marked**](https://github.com/chjj/marked) with built-in syntax highlighting and input sanitizing that doesn't encode all HTML.

**Ultramarked** wraps around marked, so it's essentially Marked, with a few extra options.

## Fetch

    $ npm install ultramarked --save

## Use

    var ultramarked = require('ultramarked');

    ultramarked.setOptions({
        // your options go here
    });

    ultramarked('This is **awesome**!');

## Configure

### options.ultralight

Syntax highlighting powered by `highlight.js`, no extra magic.