'use strict';

var marked = require('marked');
var chalk = require('chalk');
var wordwrap = require('wordwrap');
var _s = require('underscore.string');
var width = process.stdout.getWindowSize && process.stdout.getWindowSize()[0];

if (!width) {
  width = 90;
}
width = Math.floor(0.85 * width);

function fixWhitespace (body) {
  body = body
    .replace(/\n/g, ' ')
    .replace(/[\s]+/g, ' ');
  body = _s.trim(body);
  return body;
}

function colorize (body, c) {
  return body.split('\n').map(function (item) { return chalk[c](item); }).join('\n');
}

var wrap = wordwrap(3, width);
var indent = wordwrap(9, width);
var paragraph = wordwrap(6, width);

function autolink (href, text) {
  if (href.indexOf && href.indexOf('mailto') !== -1) {
    href = href.slice(7);
  }
  if (href == text || href[0] == '#') {
    return chalk.underline(text);
  } else {
    return chalk.underline(text) + ' (' + href + ')';
  }
}

function get () {
  var renderer = new marked.Renderer();

  renderer.hr = function () {
    var line = (function () {
      var separator = process.platform == 'win32' ? '-' : '⎽';
      return '   ' + new Array(width - 2).join(separator);
    }());
    return line + '\n\n';
  };

  renderer.heading = function (text, level) {
    text = fixWhitespace(text);
    switch (level) {
      case 1: return wrap(chalk.bold.white.underline(text)) + '\n\n';
      case 2: return wrap(chalk.bold.underline(text)) + '\n\n';
      default: return wrap(chalk.bold(text)) + '\n\n';
    }
  };

  renderer.code = function (text, lang) {
    text = indent(text);
    return colorize(text, 'gray') + '\n\n';
  };

  renderer.blockquote = function (body) {
    body = fixWhitespace(body);
    return chalk.gray(indent(body)) + '\n\n';
  };

  renderer.list = function (body, ordered) {
    return body + '\n\n';
  };

  renderer.listitem = function (text) {
    text = fixWhitespace(text);
    return indent(text.replace(/\n/g, ' ')).replace('         ', '       * ') + '\n';
  };

  renderer.paragraph = function (body) {
    body = body
      .replace(/\n/g, ' ')
      .replace(/[\s]+/g, ' ');

    body = _s.trim(body);
    return paragraph(body.replace(/\n/g, ' ').replace(/[\s]+/g, ' ')) + '\n\n';
  };

  renderer.strong = function (text) {
    return chalk.bold(text);
  };

  renderer.em = function (text) {
    return chalk.bold.underline(text);
  };

  renderer.del = function (text) {
    return chalk.strikethrough(text);
  };

  renderer.codespan = function (text) {
    return chalk.gray(text);
  };

  renderer.br = function () {
    return '\n';
  };

  renderer.link = function (href, title, text) {
    return autolink(href, text || title);
  };

  renderer.image = function (href, title, text) {
    return autolink(href, text || title);
  };

  renderer._term = true;

  return renderer;
}

module.exports = get();
