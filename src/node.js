'use strict';

var marked = require('marked');
var term = require('./terminal');
var core = require('./core');

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

fwd.parse = fwd;
fwd.renderer = core.renderer;

module.exports = fwd;
