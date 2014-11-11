'use strict';

var marked = require('marked');
var term = require('./terminal');
var core = require('./core');
var assign = require('./assign');

function fwd (src, opt) {
  if (opt && opt.terminal) {
    opt.renderer = term;
  }
  return core(src, opt);
}

fwd.setOptions = function (opt) {
  if (opt && opt.terminal) {
    opt.renderer = term;
  }
  core.setOptions.apply(marked, arguments);
};

function parse (src, opt) {
  var defaults = {
    smartLists: true,
    ultralight: true,
    ultrasanitize: true
  };
  return fwd(src, assign(defaults, opt));
}

fwd.parse = parse;
fwd.renderer = core.renderer;

module.exports = fwd;
