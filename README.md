# ultramarked

[**Marked**](https://github.com/chjj/marked) with built-in syntax highlighting and input sanitizing that doesn't encode all HTML.

**Ultramarked** wraps around marked, so it's essentially Marked, with a few extra options.

## Fetch

    $ npm install ultramarked --save

## Use

    var marked = require('ultramarked');

    marked.setOptions({
        // your options go here
    });

    marked('This is **awesome**!');

## Configure

### options.ultralight

Syntax highlighting powered by [highlight.js](https://github.com/isagalaev/highlight.js), no extra magic.

### options.ultrasanitize

As of right now, Marked encodes **all** HTML input when `sanitize = true`. Set this option to true to use the [AngularJS Sanitizer](https://github.com/angular/angular.js/blob/master/lib/htmlparser/htmlparser.js) sanitizer, tweaked to disallow script and style tags.


### options.ultrasanitize_pagedown

Angular's sanitizer option might be too lenient for you. If that's the case, you can use PageDown's white-list instead, which is much more narrow, and doesn't allow setting class attributes, for example.