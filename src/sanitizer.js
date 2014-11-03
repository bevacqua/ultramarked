/*
 *
 * THIS IS A FORK by @bevacqua
 *
 * HTML Parser By Misko Hevery (misko@hevery.com)
 * based on:  HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 */

 'use strict';

var he = require('he');

// Regular Expressions for parsing tags and attributes
var START_TAG_REGEXP = /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/;
var END_TAG_REGEXP = /^<\s*\/\s*([\w:-]+)[^>]*>/;
var ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g;
var BEGIN_TAG_REGEXP = /^</;
var BEGING_END_TAGE_REGEXP = /^<\s*\//;
var COMMENT_REGEXP = /<!--(.*?)-->/g;
var CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g;
var URI_REGEXP = /^((ftp|https?):\/\/|mailto:|#|\/)/;
var NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g; // Match everything outside of normal chars and " (quote character)


// Good source of info about elements and attributes
// http://dev.w3.org/html5/spec/Overview.html#semantics
// http://simon.html5.org/html-elements

// Safe Void Elements - HTML5
// http://dev.w3.org/html5/spec/Overview.html#void-elements
var voidElements = makeMap('area,br,col,hr,img,wbr');

// Elements that you can, intentionally, leave open (and which close themselves)
// http://dev.w3.org/html5/spec/Overview.html#optional-tags
var optionalEndTagBlockElements = makeMap('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr');
var optionalEndTagInlineElements = makeMap('rp,rt');
var optionalEndTagElements = extend({}, optionalEndTagInlineElements, optionalEndTagBlockElements);

// Safe Block Elements - HTML5
var blockElements = extend({}, optionalEndTagBlockElements, makeMap('address,article,aside,' +
  'blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,' +
  'header,hgroup,hr,ins,map,menu,nav,ol,pre,section,table,ul,iframe'));

// Inline Elements - HTML5
var inlineElements = extend({}, optionalEndTagInlineElements, makeMap('a,abbr,acronym,b,bdi,bdo,' +
  'big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,' +
  'span,strike,strong,sub,sup,time,tt,u,var'));


// Special Elements (can contain anything)
var specialElements = {};

var validElements = extend({}, voidElements, blockElements, inlineElements, optionalEndTagElements);

//Attributes that have href and hence need to be sanitized
var uriAttrs = makeMap('background,cite,href,longdesc,src,usemap');
var validAttrs = extend({}, uriAttrs, makeMap(
  'abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,'+
  'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,'+
  'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,'+
  'scope,scrolling,shape,span,start,summary,target,title,type,'+
  'valign,value,vspace,width,aria-label'));

/**
 * @example
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * @param {string} html string
 * @param {object} handler
 */
function htmlParser( html, handler ) {
  var index, chars, match, stack = [], last = html;

  stack.lastItem = function () {
    return stack[ stack.length - 1 ];
  };

  while ( html ) {
    chars = true;

  // Make sure we're not in a script or style element
  if ( !stack.lastItem() || !specialElements[ stack.lastItem() ] ) {

   // Comment
   if ( html.indexOf('<!--') === 0 ) {
    index = html.indexOf('-->');

    if ( index >= 0 ) {
     if (handler.comment){
      handler.comment( html.substring( 4, index ) );
     }
     html = html.substring( index + 3 );
     chars = false;
    }

   // end tag
   } else if ( BEGING_END_TAGE_REGEXP.test(html) ) {
    match = html.match( END_TAG_REGEXP );

    if ( match ) {
     html = html.substring( match[0].length );
     match[0].replace( END_TAG_REGEXP, parseEndTag );
     chars = false;
    }

   // start tag
   } else if ( BEGIN_TAG_REGEXP.test(html) ) {
    match = html.match( START_TAG_REGEXP );

    if ( match ) {
     html = html.substring( match[0].length );
     match[0].replace( START_TAG_REGEXP, parseStartTag );
     chars = false;
    }
   }

   if ( chars ) {
    index = html.indexOf('<');

    var text = index < 0 ? html : html.substring( 0, index );
    html = index < 0 ? '' : html.substring( index );

    if (handler.chars){
     handler.chars( he.decode(text) );
    }
   }

  } else {
   html = html.replace(new RegExp('(.*)<\\s*\\/\\s*' + stack.lastItem() + '[^>]*>', 'i'), function(all, text){
    text = text.
     replace(COMMENT_REGEXP, '$1').
     replace(CDATA_REGEXP, '$1');

    if (handler.chars){
     handler.chars( he.decode(text) );
    }

    return '';
   });

   parseEndTag( '', stack.lastItem() );
  }

  if ( html == last ) {
   throw 'Parse Error: ' + html;
  }
  last = html;
 }

 // Clean up any remaining tags
 parseEndTag();

 function parseStartTag( tag, tagName, rest, unary ) {
  tagName = lowercase(tagName);
  if ( blockElements[ tagName ] ) {
   while ( stack.lastItem() && inlineElements[ stack.lastItem() ] ) {
    parseEndTag( '', stack.lastItem() );
   }
  }

  if ( optionalEndTagElements[ tagName ] && stack.lastItem() == tagName ) {
   parseEndTag( '', tagName );
  }

  unary = voidElements[ tagName ] || !!unary;

  if ( !unary )
   stack.push( tagName );

  var attrs = {};

  rest.replace(ATTR_REGEXP, function(match, name, doubleQuotedValue, singleQoutedValue, unqoutedValue) {
   var value = doubleQuotedValue
    || singleQoutedValue
    || unqoutedValue
    || '';

   attrs[name] = he.decode(value);
  });
  if (handler.start) handler.start( tagName, attrs, unary );
 }

 function parseEndTag( tag, tagName ) {
  var pos = 0, i;
  tagName = lowercase(tagName);
  if ( tagName )
   // Find the closest opened tag of the same type
   for ( pos = stack.length - 1; pos >= 0; pos-- )
    if ( stack[ pos ] == tagName )
     break;

  if ( pos >= 0 ) {
   // Close all the open elements, up the stack
   for ( i = stack.length - 1; i >= pos; i-- )
    if (handler.end) handler.end( stack[ i ] );

   // Remove the open elements from the stack
   stack.length = pos;
  }
 }
}

function invalidIframeSource (tag, attrs, options) {
  if (tag !== 'iframe') {
    return false;
  }
  if (!options.iframes || !attrs.src) {
    return true;
  }
  return !options.iframes.some(function (value) {
    if (typeof value === 'string') {
      return attrs.src.lastIndexOf(value, 0) === 0;
    }
    return value.test(attrs.src);
  });
}

/**
 * decodes all entities into regular string
 * @param value
 * @returns {string} A string with decoded entities.
 *//*
var hiddenPre=document.createElement('pre');
function decodeEntities(value) {
 hiddenPre.innerHTML=value.replace(/</g,'&lt;');
 return hiddenPre.innerText || hiddenPre.textContent || '';
}*/

/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param value
 * @returns escaped text
 *//*
function encodeEntities(value) {
 return value.
  replace(/&/g, '&amp;').
  replace(NON_ALPHANUMERIC_REGEXP, function(value){
   return '&#' + value.charCodeAt(0) + ';';
  }).
  replace(/</g, '&lt;').
  replace(/>/g, '&gt;');
}*/

/**
 * create an HTML/XML writer which writes to buffer
 * @param {Array} buf use buf.jain('') to get out sanitized html string
 * @returns {object} in the form of {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * }
 */
function htmlSanitizeWriter(buf, options){
 var ignore = false;
 var out = bind(buf, buf.push);
 return {
  start: function(tag, attrs, unary){
   tag = lowercase(tag);
   if (!ignore && specialElements[tag]) {
    ignore = tag;
   }
   if (!ignore && validElements[tag] == true) {
    out('<');
    out(tag);
    if (invalidIframeSource(tag, attrs, options)) {
      delete attrs.src;
    }
    forEach(attrs, function(value, key){
     var lkey=lowercase(key);
     if (validAttrs[lkey]==true && (uriAttrs[lkey]!==true || value.match(URI_REGEXP))) {
      out(' ');
      out(key);
      out('="');
      out(he.encode(value));
      out('"');
     }
    });
    out(unary ? '/>' : '>');
   }
  },
  end: function(tag){
    tag = lowercase(tag);
    if (!ignore && validElements[tag] == true) {
     out('</');
     out(tag);
     out('>');
    }
    if (tag == ignore) {
     ignore = false;
    }
   },
  chars: function(chars){
    if (!ignore) {
     out(he.encode(chars));
    }
   }
 };
}

// utilities

function makeMap(str){
 var obj = {}, items = str.split(','), i;

 for ( i = 0; i < items.length; i++ ){
  obj[ items[i] ] = true;
 }
 return obj;
}

function extend(dst) {
 var args = Array.prototype.slice.call(arguments);
 forEach(args, function(obj){
  if (obj !== dst) {
   forEach(obj, function(value, key){
    dst[key] = value;
   });
  }
 });
 return dst;
}

function forEach(obj, iterator, context) {
 var key;
 if (obj) {
 if (typeof obj === 'function'){
  for (key in obj) {
  if (key !== 'prototype' && key !== 'length' && key !== 'name' && obj.hasOwnProperty(key)) {
   iterator.call(context, obj[key], key);
  }
  }
 } else if (obj.forEach && obj.forEach !== forEach) {
  obj.forEach(iterator, context);
 } else if (Array.isArray(obj)) {
  for (key = 0; key < obj.length; key++){
   iterator.call(context, obj[key], key);
  }
 } else {
   for (key in obj) {
   if (obj.hasOwnProperty(key)) {
    iterator.call(context, obj[key], key);
   }
   }
 }
 }
 return obj;
}

function bind(self, fn) {
 var slice = Array.prototype.slice;
 var curryArgs = arguments.length > 2 ? slice.call(arguments, 2) : [];
 if (typeof fn === 'function' && !(fn instanceof RegExp)) {
 return curryArgs.length
  ? function() {
   return arguments.length
   ? fn.apply(self, curryArgs.concat(slice.call(arguments, 0)))
   : fn.apply(self, curryArgs);
  }
  : function() {
   return arguments.length
   ? fn.apply(self, arguments)
   : fn.call(self);
  };
 } else {
 // in IE, native methods are not functions so they cannot be bound (note: they don't need to be)
 return fn;
 }
}

function lowercase (string) {
  return typeof string === 'string' ? string.toLowerCase() : string;
}

module.exports = function (html, options) {
  var emptyIframe = /<iframe>\s*<\/iframe>/ig;
  var buffer = [];

  htmlParser(html, htmlSanitizeWriter(buffer, options));

  return buffer.join('').replace(emptyIframe, '');
};
