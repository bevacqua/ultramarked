'use strict';

var marked = require('marked');
var term = require('./terminal');
var original = marked.setOptions;

marked.setOptions = function (opt) {
	if (opt.terminal) {
		opt.renderer = term;
	}
	original.apply(marked, arguments);
};

module.exports = require('./core');
