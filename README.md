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

Syntax highlighting powered by [highlight.js](https://github.com/isagalaev/highlight.js), no extra magic. Classes are prefixed `hljs` for convenience. Note that the `renderer` you choose will be overridden.

### options.ultrasanitize

As of right now, Marked encodes **all** HTML input when `sanitize = true`. Set this option to true to use the [AngularJS Sanitizer](https://github.com/angular/angular.js/blob/master/lib/htmlparser/htmlparser.js) sanitizer, tweaked to disallow script and style tags.

### options.terminal

Prettifies the code for terminal output! Incompatible with `ultralight`, which will be disabled when `terminal` is enabled. Also turns off `ultrasanitize`, because color codes.

![terminal.png][1]

### options.sanitizer

Angular's sanitizer option might be too lenient for you. If that's the case, you can use PageDown's white-list instead, which is much more narrow, and doesn't allow setting class attributes, for example.

```js
ultramarked.setOptions({
	sanitizer: require('pagedown-sanitizer')
});
```

[1]: http://i.imgur.com/fTh1JiD.png