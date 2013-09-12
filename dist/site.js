require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// nothing to see here... no file methods for the browser

},{}],2:[function(require,module,exports){
var process=require("__browserify_process");function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';

},{"__browserify_process":4}],3:[function(require,module,exports){
require=(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){
// UTILITY
var util = require('util');
var Buffer = require("buffer").Buffer;
var pSlice = Array.prototype.slice;

function objectKeys(object) {
  if (Object.keys) return Object.keys(object);
  var result = [];
  for (var name in object) {
    if (Object.prototype.hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// assert.AssertionError instanceof Error

assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

},{"util":2,"buffer":3}],2:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":4}],5:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":6}],"buffer-browserify":[function(require,module,exports){
module.exports=require('q9TxCC');
},{}],"q9TxCC":[function(require,module,exports){
function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.binaryWrite = SlowBuffer.prototype.asciiWrite;

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.binarySlice = SlowBuffer.prototype.asciiSlice;

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

SlowBuffer.prototype.fill = function(value, start, end) {
  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this.parent[i + this.offset] = subject.readUInt8(i);
        }
        else {
          this.parent[i + this.offset] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1];
    }
  } else {
    val = buffer.parent[buffer.offset + offset];
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer.parent[buffer.offset + offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

},{"assert":1,"./buffer_ieee754":5,"base64-js":7}],7:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],8:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],3:[function(require,module,exports){
function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        this.parent[i + this.offset] = subject[i];
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    val |= buffer.parent[buffer.offset + offset + 1];
  } else {
    val = buffer.parent[buffer.offset + offset];
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset + 1] << 16;
    val |= buffer.parent[buffer.offset + offset + 2] << 8;
    val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    val = buffer.parent[buffer.offset + offset + 2] << 16;
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  buffer.parent[buffer.offset + offset] = value;
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset + 1] = value & 0x00ff;
  } else {
    buffer.parent[buffer.offset + offset + 1] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset] = value & 0x00ff;
  }
}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset + 3] = value & 0xff;
  } else {
    buffer.parent[buffer.offset + offset + 3] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset] = value & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

},{"assert":1,"./buffer_ieee754":8,"base64-js":9}],9:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}]},{},[])
;;module.exports=require("buffer-browserify")

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;"use strict";
function objectToString(o) {
  return Object.prototype.toString.call(o);
}

var util = {
  isArray: function (ar) {
    return Array.isArray(ar) || (typeof ar === 'object' && objectToString(ar) === '[object Array]');
  },
  isDate: function (d) {
    return typeof d === 'object' && objectToString(d) === '[object Date]';
  },
  isRegExp: function (re) {
    return typeof re === 'object' && objectToString(re) === '[object RegExp]';
  },
  getRegExpFlags: function (re) {
    var flags = '';
    re.global && (flags += 'g');
    re.ignoreCase && (flags += 'i');
    re.multiline && (flags += 'm');
    return flags;
  }
};

module.exports = clone;

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
*/
function clone(parent, circular) {
  if (typeof circular == 'undefined')
    circular = true;

  var useBuffer = typeof Buffer != 'undefined';

  var circularParent = {};
  var circularResolved = {};
  var circularReplace = [];

  function _clone(parent, context, child, cIndex) {
    var i; // Use local context within this function
    // Deep clone all properties of parent into child
    if (typeof parent == 'object') {
      if (parent == null)
        return parent;
      // Check for circular references
      for(i in circularParent)
        if (circularParent[i] === parent) {
          // We found a circular reference
          circularReplace.push({'resolveTo': i, 'child': child, 'i': cIndex});
          return null; //Just return null for now...
          // we will resolve circular references later
        }

      // Add to list of all parent objects
      circularParent[context] = parent;
      // Now continue cloning...
      if (util.isArray(parent)) {
        child = [];
        for(i in parent)
          child[i] = _clone(parent[i], context + '[' + i + ']', child, i);
      }
      else if (util.isDate(parent))
        child = new Date(parent.getTime());
      else if (util.isRegExp(parent)) {
        child = new RegExp(parent.source, util.getRegExpFlags(parent));
        if (parent.lastIndex) child.lastIndex = parent.lastIndex;
      } else if (useBuffer && Buffer.isBuffer(parent))
      {
        child = new Buffer(parent.length);
        parent.copy(child);
      }
      else {
        child = {};

        // Also copy prototype over to new cloned object
        child.__proto__ = parent.__proto__;
        for(i in parent)
          child[i] = _clone(parent[i], context + '[' + i + ']', child, i);
      }

      // Add to list of all cloned objects
      circularResolved[context] = child;
    }
    else
      child = parent; //Just a simple shallow copy will do
    return child;
  }

  var i;
  if (circular) {
    var cloned = _clone(parent, '*');

    // Now this object has been cloned. Let's check to see if there are any
    // circular references for it
    for(i in circularReplace) {
      var c = circularReplace[i];
      if (c && c.child && c.i in c.child) {
        c.child[c.i] = circularResolved[c.resolveTo];
      }
    }
    return cloned;
  } else {
    // Deep clone all properties of parent into child
    var child;
    if (typeof parent == 'object') {
      if (parent == null)
        return parent;
      if (parent.constructor.name === 'Array') {
        child = [];
        for(i in parent)
          child[i] = clone(parent[i], circular);
      }
      else if (util.isDate(parent))
        child = new Date(parent.getTime() );
      else if (util.isRegExp(parent)) {
        child = new RegExp(parent.source, util.getRegExpFlags(parent));
        if (parent.lastIndex) child.lastIndex = parent.lastIndex;
      } else {
        child = {};
        child.__proto__ = parent.__proto__;
        for(i in parent)
          child[i] = clone(parent[i], circular);
      }
    }
    else
      child = parent; // Just a simple shallow clone will do
    return child;
  }
}

/**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
clone.clonePrototype = function(parent) {
  if (parent === null)
    return null;

  var c = function () {};
  c.prototype = parent;
  return new c();
};

},{"__browserify_Buffer":3}],6:[function(require,module,exports){
if (typeof module !== 'undefined') {
    module.exports = function(d3) {
        return metatable;
    };
}

function metatable() {
    var event = d3.dispatch('change', 'rowfocus');

    function table(selection) {
        selection.each(function(d) {
            var sel = d3.select(this),
                table;

            var keyset = d3.set();
            d.map(Object.keys).forEach(function(k) {
                k.forEach(function(_) {
                    keyset.add(_);
                });
            });

            bootstrap();
            paint();

            function bootstrap() {

                var controls = sel.selectAll('.controls')
                    .data([d])
                    .enter()
                    .append('div')
                    .attr('class', 'controls');

                var colbutton = controls.append('button')
                    .on('click', function() {
                        var name = prompt('column name');
                        if (name) {
                            keyset.add(name);
                            paint();
                        }
                    });
                colbutton.append('span').attr('class', 'icon-plus');
                colbutton.append('span').text(' new column');

                var enter = sel.selectAll('table').data([d]).enter().append('table');
                var thead = enter.append('thead');
                var tbody = enter.append('tbody');
                var tr = thead.append('tr');

                table = sel.select('table');
            }

            function paint() {

                var keys = keyset.values();

                var th = table
                    .select('thead')
                    .select('tr')
                    .selectAll('th')
                    .data(keys, function(d) { return d; });

                var delbutton = th.enter().append('th')
                    .append('span')
                    .text(String)
                    .append('button');

                th.exit().remove();

                var tr = table.select('tbody').selectAll('tr')
                    .data(function(d) { return d; });

                tr.enter()
                    .append('tr');

                tr.exit().remove();

                var td = tr.selectAll('td')
                    .data(keys, function(d) { return d; });

                td.enter()
                    .append('td')
                    .append('input')
                    .attr('field', String);

                td.exit().remove();

                delbutton.on('click', function(d) {
                        var name = d;
                        if (confirm('Delete column ' + name + '?')) {
                            keyset.remove(name);
                            tr.selectAll('input')
                                .data(function(d, i) {
                                    var map = d3.map(d);
                                    map.remove(name);
                                    var reduced = mapToObject(map);
                                    event.change(reduced, i);
                                    return {
                                        data: reduced,
                                        index: i
                                    };
                                });
                            paint();
                        }
                    });
                delbutton.append('span').attr('class', 'icon-minus');
                delbutton.append('span').text(' delete');

                function write(d) {
                    d.data[d3.select(this).attr('field')] =
                        isNaN(this.value) ? this.value : Number(this.value);
                    event.change(d.data, d.index);
                }

                function mapToObject(map) {
                    return map.entries()
                        .reduce(function(memo, d) {
                            memo[d.key] = isNaN(d.value) ? d.value : Number(d.value);
                            return memo;
                        }, {});
                }

                tr.selectAll('input')
                    .data(function(d, i) {
                        var reduced = mapToObject(d3.map(d));
                            
                        return d3.range(keys.length).map(function() {
                            return {
                                data: reduced,
                                index: i
                            };
                        });
                    })
                    .classed('disabled', function(d) {
                        return d.data[d3.select(this).attr('field')] === undefined;
                    })
                    .property('value', function(d) {
                        return d.data[d3.select(this).attr('field')] || '';
                    })
                    .on('keyup', write)
                    .on('change', write)
                    .on('click', function(d) {
                        if (d.data[d3.select(this).attr('field')] === undefined) {
                            d.data[d3.select(this).attr('field')] = '';
                            paint();
                        }
                    })
                    .on('focus', function(d) {
                        event.rowfocus(d.data, d.index);
                    });
            }
        });
    }

    return d3.rebind(table, event, 'on');
}

},{}],7:[function(require,module,exports){
module.exports = function(_, def) {
    def = def === undefined ? 4 : def;
    if (_ === '{}') return '    ';
    var lines = _.split('\n');
    if (lines.length < 2) return null;
    var space = lines[1].match(/^(\s*)/);
    return space[0];
};

},{}],8:[function(require,module,exports){
var jsonlint = require('jsonlint-lines');

function hint(str) {

    var errors = [], gj;

    function root(_) {
        if (!_.type) {
            errors.push({
                message: 'The type property is required and was not found',
                line: _.__line__
            });
        } else if (!types[_.type]) {
            errors.push({
                message: 'The type ' + _.type + ' is unknown',
                line: _.__line__
            });
        } else if (_) {
            types[_.type](_);
        }
    }

    function everyIs(_, type) {
        // make a single exception because typeof null === 'object'
        return _.every(function(x) { return (x !== null) && (typeof x === type); });
    }

    function requiredProperty(_, name, type) {
        if (typeof _[name] == 'undefined') {
            return errors.push({
                message: '"' + name + '" property required',
                line: _.__line__
            });
        } else if (type === 'array') {
            if (!Array.isArray(_[name])) {
                return errors.push({
                    message: '"' + name +
                        '" property should be an array, but is an ' +
                        (typeof _[name]) + ' instead',
                    line: _.__line__
                });
            }
        } else if (type && typeof _[name] !== type) {
            return errors.push({
                message: '"' + name +
                    '" property should be ' + (type) +
                    ', but is an ' + (typeof _[name]) + ' instead',
                line: _.__line__
            });
        }
    }

    // http://geojson.org/geojson-spec.html#feature-collection-objects
    function FeatureCollection(_) {
        crs(_);
        bbox(_);
        if (!requiredProperty(_, 'features', 'array')) {
            if (!everyIs(_.features, 'object')) {
                return errors.push({
                    message: 'Every feature must be an object',
                    line: _.__line__
                });
            }
            _.features.forEach(Feature);
        }
    }

    // http://geojson.org/geojson-spec.html#positions
    function position(_, line) {
        if (!Array.isArray(_)) {
            return errors.push({
                message: 'position should be an array, is a ' + (typeof _) +
                    ' instead',
                line: _.__line__ || line
            });
        } else {
            if (_.length < 2) {
                return errors.push({
                    message: 'position must have 2 or more elements',
                    line: _.__line__ || line
                });
            }
            if (!everyIs(_, 'number')) {
                return errors.push({
                    message: 'each element in a position must be a number',
                    line: _.__line__ || line
                });
            }
        }
    }

    function positionArray(coords, depth, line) {
        if (line === undefined && coords.__line__ !== undefined) {
            line = coords.__line__;
        }
        if (depth === 0) {
            return position(coords, line);
        } else {
            if (!Array.isArray(coords)) {
                return errors.push({
                    message: 'coordinates should be an array, are an ' + (typeof coords) +
                        'instead',
                    line: line
                });
            }
            coords.forEach(function(c) {
                positionArray(c, depth - 1, c.__line__ || line);
            });
        }
    }

    function crs(_) {
        if (!_.crs) return;
        if (typeof _.crs === 'object') {
            var strErr = requiredProperty(_.crs, 'type', 'string'),
                propErr = requiredProperty(_.crs, 'properties', 'object');
            if (!strErr && !propErr) {
                // http://geojson.org/geojson-spec.html#named-crs
                if (_.crs.type == 'name') {
                    requiredProperty(_.crs.properties, 'name', 'string');
                } else if (_.crs.type == 'link') {
                    requiredProperty(_.crs.properties, 'href', 'string');
                }
            }
        }
    }

    function bbox(_) {
        if (!_.bbox) return;
        if (Array.isArray(_.bbox)) {
            if (!everyIs(_.bbox, 'number')) {
                return errors.push({
                    message: 'each element in a bbox property must be a number',
                    line: _.bbox.__line__
                });
            }
        } else {
            errors.push({
                message: 'bbox property must be an array of numbers, but is a ' + (typeof _.bbox),
                line: _.__line__
            });
        }
    }

    // http://geojson.org/geojson-spec.html#point
    function Point(_) {
        crs(_);
        bbox(_);
        if (!requiredProperty(_, 'coordinates', 'array')) {
            position(_.coordinates);
        }
    }

    // http://geojson.org/geojson-spec.html#polygon
    function Polygon(_) {
        crs(_);
        bbox(_);
        if (!requiredProperty(_, 'coordinates', 'array')) {
            positionArray(_.coordinates, 2);
        }
    }

    // http://geojson.org/geojson-spec.html#multipolygon
    function MultiPolygon(_) {
        crs(_);
        bbox(_);
        if (!requiredProperty(_, 'coordinates', 'array')) {
            positionArray(_.coordinates, 3);
        }
    }

    // http://geojson.org/geojson-spec.html#linestring
    function LineString(_) {
        crs(_);
        bbox(_);
        if (!requiredProperty(_, 'coordinates', 'array')) {
            positionArray(_.coordinates, 1);
        }
    }

    // http://geojson.org/geojson-spec.html#multilinestring
    function MultiLineString(_) {
        crs(_);
        bbox(_);
        if (!requiredProperty(_, 'coordinates', 'array')) {
            positionArray(_.coordinates, 2);
        }
    }

    // http://geojson.org/geojson-spec.html#multipoint
    function MultiPoint(_) {
        crs(_);
        bbox(_);
        if (!requiredProperty(_, 'coordinates', 'array')) {
            positionArray(_.coordinates, 1);
        }
    }

    function GeometryCollection(_) {
        crs(_);
        bbox(_);
        if (!requiredProperty(_, 'geometries', 'array')) {
            _.geometries.forEach(function(geometry) {
                if (geometry) root(geometry);
            });
        }
    }

    function Feature(_) {
        crs(_);
        bbox(_);
        if (_.type !== 'Feature') {
            errors.push({
                message: 'GeoJSON features must have a type=feature property',
                line: _.__line__
            });
        }
        requiredProperty(_, 'properties', 'object');
        if (!requiredProperty(_, 'geometry', 'object')) {
            // http://geojson.org/geojson-spec.html#feature-objects
            // tolerate null geometry
            if (_.geometry) root(_.geometry);
        }
    }

    var types = {
        Point: Point,
        Feature: Feature,
        MultiPoint: MultiPoint,
        LineString: LineString,
        MultiLineString: MultiLineString,
        FeatureCollection: FeatureCollection,
        GeometryCollection: GeometryCollection,
        Polygon: Polygon,
        MultiPolygon: MultiPolygon
    };

    if (typeof str !== 'string') {
        return [{
            message: 'Expected string input',
            line: 0
        }];
    }

    try {
        gj = jsonlint.parse(str);
    } catch(e) {
        return e;
    }

    root(gj);

    return errors;
}

module.exports.hint = hint;

},{"jsonlint-lines":9}],9:[function(require,module,exports){
var process=require("__browserify_process");/* parser generated by jison 0.4.6 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var jsonlint = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"JSONString":3,"STRING":4,"JSONNumber":5,"NUMBER":6,"JSONNullLiteral":7,"NULL":8,"JSONBooleanLiteral":9,"TRUE":10,"FALSE":11,"JSONText":12,"JSONValue":13,"EOF":14,"JSONObject":15,"JSONArray":16,"{":17,"}":18,"JSONMemberList":19,"JSONMember":20,":":21,",":22,"[":23,"]":24,"JSONElementList":25,"$accept":0,"$end":1},
terminals_: {2:"error",4:"STRING",6:"NUMBER",8:"NULL",10:"TRUE",11:"FALSE",14:"EOF",17:"{",18:"}",21:":",22:",",23:"[",24:"]"},
productions_: [0,[3,1],[5,1],[7,1],[9,1],[9,1],[12,2],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[15,2],[15,3],[20,3],[19,1],[19,3],[16,2],[16,3],[25,1],[25,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: // replace escaped characters with actual character
          this.$ = yytext.replace(/\\(\\|")/g, "$"+"1")
                     .replace(/\\n/g,'\n')
                     .replace(/\\r/g,'\r')
                     .replace(/\\t/g,'\t')
                     .replace(/\\v/g,'\v')
                     .replace(/\\f/g,'\f')
                     .replace(/\\b/g,'\b');
        
break;
case 2:this.$ = Number(yytext);
break;
case 3:this.$ = null;
break;
case 4:this.$ = true;
break;
case 5:this.$ = false;
break;
case 6:return this.$ = $$[$0-1];
break;
case 13:this.$ = {}; Object.defineProperty(this.$, '__line__', {
            value: this._$.first_line,
            enumerable: false
        })
break;
case 14:this.$ = $$[$0-1]; Object.defineProperty(this.$, '__line__', {
            value: this._$.first_line,
            enumerable: false
        })
break;
case 15:this.$ = [$$[$0-2], $$[$0]];
break;
case 16:this.$ = {}; this.$[$$[$0][0]] = $$[$0][1];
break;
case 17:this.$ = $$[$0-2]; $$[$0-2][$$[$0][0]] = $$[$0][1];
break;
case 18:this.$ = []; Object.defineProperty(this.$, '__line__', {
            value: this._$.first_line,
            enumerable: false
        })
break;
case 19:this.$ = $$[$0-1]; Object.defineProperty(this.$, '__line__', {
            value: this._$.first_line,
            enumerable: false
        })
break;
case 20:this.$ = [$$[$0]];
break;
case 21:this.$ = $$[$0-2]; $$[$0-2].push($$[$0]);
break;
}
},
table: [{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],12:1,13:2,15:7,16:8,17:[1,14],23:[1,15]},{1:[3]},{14:[1,16]},{14:[2,7],18:[2,7],22:[2,7],24:[2,7]},{14:[2,8],18:[2,8],22:[2,8],24:[2,8]},{14:[2,9],18:[2,9],22:[2,9],24:[2,9]},{14:[2,10],18:[2,10],22:[2,10],24:[2,10]},{14:[2,11],18:[2,11],22:[2,11],24:[2,11]},{14:[2,12],18:[2,12],22:[2,12],24:[2,12]},{14:[2,3],18:[2,3],22:[2,3],24:[2,3]},{14:[2,4],18:[2,4],22:[2,4],24:[2,4]},{14:[2,5],18:[2,5],22:[2,5],24:[2,5]},{14:[2,1],18:[2,1],21:[2,1],22:[2,1],24:[2,1]},{14:[2,2],18:[2,2],22:[2,2],24:[2,2]},{3:20,4:[1,12],18:[1,17],19:18,20:19},{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],13:23,15:7,16:8,17:[1,14],23:[1,15],24:[1,21],25:22},{1:[2,6]},{14:[2,13],18:[2,13],22:[2,13],24:[2,13]},{18:[1,24],22:[1,25]},{18:[2,16],22:[2,16]},{21:[1,26]},{14:[2,18],18:[2,18],22:[2,18],24:[2,18]},{22:[1,28],24:[1,27]},{22:[2,20],24:[2,20]},{14:[2,14],18:[2,14],22:[2,14],24:[2,14]},{3:20,4:[1,12],20:29},{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],13:30,15:7,16:8,17:[1,14],23:[1,15]},{14:[2,19],18:[2,19],22:[2,19],24:[2,19]},{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],13:31,15:7,16:8,17:[1,14],23:[1,15]},{18:[2,17],22:[2,17]},{18:[2,15],22:[2,15]},{22:[2,21],24:[2,21]}],
defaultActions: {16:[2,6]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 6
break;
case 2:yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2); return 4
break;
case 3:return 17
break;
case 4:return 18
break;
case 5:return 23
break;
case 6:return 24
break;
case 7:return 22
break;
case 8:return 21
break;
case 9:return 10
break;
case 10:return 11
break;
case 11:return 8
break;
case 12:return 14
break;
case 13:return 'INVALID'
break;
}
},
rules: [/^(?:\s+)/,/^(?:(-?([0-9]|[1-9][0-9]+))(\.[0-9]+)?([eE][-+]?[0-9]+)?\b)/,/^(?:"(?:\\[\\"bfnrt/]|\\u[a-fA-F0-9]{4}|[^\\\0-\x09\x0a-\x1f"])*")/,/^(?:\{)/,/^(?:\})/,/^(?:\[)/,/^(?:\])/,/^(?:,)/,/^(?::)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:null\b)/,/^(?:$)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = jsonlint;
exports.Parser = jsonlint.Parser;
exports.parse = function () { return jsonlint.parse.apply(jsonlint, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
},{"__browserify_process":4,"fs":1,"path":2}],10:[function(require,module,exports){
module.exports = function(d3) {
    var preview = require('static-map-preview')(d3, 'tmcw.map-dsejpecw');

    function gitHubBrowse(d3) {

        return function(token, options) {
            options = options || {};

            var event = d3.dispatch('chosen');

            function filter(d) {
                if (d.type === 'blob') {
                    return d.path.match(/json$/);
                }
                return true;
            }

            function browse(selection) {
                req('/user', token, onuser);

                function onuser(err, user) {
                    reqList('/user/orgs', token, function(err, orgs) {
                        var base = [user];
                        if (orgs && orgs.length) {
                            base = base.concat(orgs);
                        }
                        render({
                            columns: [base],
                            path: [{name:'home'}]
                        });
                    });
                }

                function navigateTo(d, data) {
                    var url;
                    if (d.type && d.type === 'User') {
                        // user
                        url = '/user/repos';
                    } else if (d.login) {
                        // organization
                        url = '/orgs/' + d.login + '/repos';
                    } else if (d.forks !== undefined) {
                        // repository
                        url = '/repos/' + d.full_name + '/branches';
                    } else if (d.type ===  'tree') {
                        url = '/repos/' + data.path[2].full_name + '/git/trees/' + d.sha;
                    } else if (d.name && d.commit) {
                        // branch
                        url = '/repos/' + data.path[2].full_name + '/git/trees/' + d.commit.sha;
                    }
                    selection.classed('loading', true);
                    reqList(url, token, onlist);
                    function onlist(err, repos) {
                        selection.classed('loading', false);
                        if (repos.length === 1 && repos[0].tree) {
                            repos = repos[0].tree.filter(filter);
                        }

                        if (options.sort) {
                            repos.sort(options.sort);
                        }

                        data.path.push(d);
                        data.columns = data.columns.concat([repos]);
                        render(data);
                    }
                }

                var header = selection.append('div')
                    .attr('class', 'header');

                var back = header.append('a')
                    .attr('class', 'back')
                    .text('<');

                var breadcrumbs = header.append('div')
                    .attr('class', 'breadcrumbs');

                var columnsel = selection.append('div')
                    .attr('class', 'column-wrap');

                var mask = selection.append('div')
                    .attr('class', 'mask');

                function render(data) {

                    back.on('click', function(d, i) {
                        if (data.path.length > 1) {
                            data.path.pop();
                            data.columns.pop();
                            render(data);
                        }
                    });

                    var crumbs = breadcrumbs
                        .selectAll('a')
                        .data(data.path);

                    crumbs.exit().remove();

                    crumbs.enter()
                        .append('a')
                        .text(name);

                    var columns = columnsel
                        .selectAll('div.column')
                        .data(data.columns, function(d, i) {
                            return i;
                        });

                    columns.exit().remove();

                    columns
                        .enter()
                        .append('div')
                        .attr('class', 'column');

                    columns
                        .style('transform', transformX)
                        .style('-webkit-transform', transformX);

                    function transformX(d, i) {
                        return 'translateX(' + (i - data.columns.length + 1) * this.offsetWidth + 'px)';
                    }

                    var items = columns
                        .selectAll('a.item')
                        .filter(filter)
                        .data(function(d) { return d; });
                    items.exit().remove();
                    var newitems = items.enter()
                        .append('a')
                        .attr('class', 'item')
                        .text(name)
                        .on('click', function(d) {
                            if (d.type !== 'blob') navigateTo(d, data);
                            else choose(d)();
                        });

                    newitems
                        .filter(function(d) {
                            return d.type === 'blob';
                        })
                        .each(function(d) {
                            var parent = d3.select(this);
                            d3.select(this).append('div')
                                .attr('class', 'fr')
                                .each(function(d) {
                                    var sel = d3.select(this);
                                    sel.selectAll('button')
                                        .data([{
                                            title: 'Preview',
                                            action: quickpreview(d, parent)
                                        }, {
                                            title: 'Open',
                                            action: choose(d)
                                        }])
                                        .enter()
                                        .append('button')
                                        .text(function(d) { return d.title; })
                                        .on('click', function(d) { return d.action(); });
                                });
                        });

                    function quickpreview(d, sel) {
                        return function() {
                            if (!sel.select('.preview').empty()) {
                                return sel.select('.preview').remove();
                            }
                            var mapcontainer = sel.append('div').attr('class', 'preview');
                            reqRaw('/repos/' + data.path[2].full_name + '/git/blobs/' + d.sha, token, onfile);
                            function onfile(err, res) {
                                preview(res, [mapcontainer.node().offsetWidth, 150], function(err, uri) {
                                    if (err) return;
                                    mapcontainer.append('img')
                                        .attr('width', mapcontainer.node().offsetWidth + 'px')
                                        .attr('height', '150px')
                                        .attr('src', uri);
                                });
                            }
                        };
                    }

                    function choose(d) {
                        return function() {
                            event.chosen(d, data);
                        };
                    }

                    (selection.node().parentNode || {}).scrollTop = 0;
                }

                function name(d) {
                    return d.login || d.name || d.path;
                }
            }

            return d3.rebind(browse, event, 'on');
        };
    }

    function gistBrowse(d3) {
        return function(token, options) {
            options = options || {};

            var event = d3.dispatch('chosen');
            var time_format = d3.time.format('%Y/%m/%d');

            function browse(selection) {
                var width = Math.min(640, selection.node().offsetWidth);
                req('/gists', token, function(err, gists) {
                    gists = gists.filter(hasMapFile);

                    if (options.sort) {
                        gists.sort(options.sort);
                    }

                    var item = selection.selectAll('div.item')
                        .data(gists)
                        .enter()
                        .append('div')
                        .attr('class', 'fl item')
                        .style('width', width + 'px')
                        .style('height', 200 + 'px')
                        .on('click', function(d) {
                            event.chosen(d);
                        })
                        .call(mapPreview(token, width));

                    var overlay = item.append('div')
                        .attr('class', 'overlay')
                        .text(function(d) {
                            return d.id + ' | ' + (d.description || 'untitled') +
                                ' | ' + time_format(new Date(d.updated_at));
                        });

                    overlay.append('span')
                        .attr('class', 'files')
                        .selectAll('small')
                        .data(function(d) {
                            return d3.entries(d.files);
                        })
                        .enter()
                        .append('small')
                        .attr('class', 'deemphasize')
                        .text(function(d) {
                            return d.key + ' ';
                        })
                        .attr('title', function(d) {
                            return d.value.type + ', ' + d.value.size + ' bytes';
                        });
                });
            }

            return d3.rebind(browse, event, 'on');
        };
    }

    var base = 'https://api.github.com';

    function reqList(postfix, token, callback, l, url, count) {
        l = l || [];
        count = count || 0;
        authorize(d3.xhr(url || (base + postfix)), token)
            .on('load', function(data) {
                l = l.concat(data.list);
                if (data.next && ++count < 8) {
                    return reqList(postfix, token, callback, l, data.next, count);
                }
                callback(null, l);
            })
            .on('error', function(error) {
                callback(error, null);
            })
            .response(function(request) {
                var nextLink = (request.getResponseHeader('Link') || '').match(/\<([^\>]+)\>\; rel="next"/);
                nextLink = nextLink ? nextLink[1] : null;
                return {
                    list: JSON.parse(request.responseText),
                    next: nextLink
                };
            })
            .get();
    }

    function req(postfix, token, callback) {
        authorize(d3.json((base + postfix)), token)
            .on('load', function(data) {
                callback(null, data);
            })
            .on('error', function(error) {
                callback(error, null);
            })
            .get();
    }

    function reqRaw(postfix, token, callback) {
        authorize(d3.json((base + postfix)), token)
            .on('load', function(data) {
                callback(null, data);
            })
            .on('error', function(error) {
                callback(error, null);
            })
            .header('Accept', 'application/vnd.github.raw')
            .get();
    }

    function mapPreview(token, width) {
        return function(selection) {
            selection.each(function(d) {
                var sel = d3.select(this);
                req('/gists/' + d.id, token, function(err, data) {
                    var geojson = mapFile(data);
                    if (geojson) {
                        preview(geojson, [width, 200], function(err, res) {
                            if (err) return;
                            sel
                                .style('background-image', 'url(' + res + ')')
                                .style('background-size', width + 'px 200px');
                        });
                    }
                });
            });
        };
    }

    return {
        gitHubBrowse: gitHubBrowse(d3),
        gistBrowse: gistBrowse(d3)
    };
};

function authorize(xhr, token) {
    return token ?
        xhr.header('Authorization', 'token ' + token) :
        xhr;
}

function hasMapFile(data) {
    for (var f in data.files) {
        if (f.match(/\.geojson$/)) return true;
    }
}

function mapFile(data) {
    try {
        for (var f in data.files) {
            if (f.match(/\.geojson$/)) return JSON.parse(data.files[f].content);
        }
    } catch(e) {
        return null;
    }
}

},{"static-map-preview":11}],11:[function(require,module,exports){
var scaleCanvas = require('autoscale-canvas');

module.exports = function(d3, mapid) {
    var ratio = window.devicePixelRatio || 1,
        retina = ratio !== 1;

    function staticUrl(cz, wh) {
        var size = retina ? [wh[0] * 2, wh[1] * 2] : wh;
        return 'http://a.tiles.mapbox.com/v3/' + [
            mapid, cz.join(','), size.join('x')].join('/') + '.png';
    }

    return function(geojson, wh, callback) {
        var projection = d3.geo.mercator()
            .precision(0)
            .translate([wh[0]/2, wh[1]/2]);

        path = d3.geo.path().projection(projection);

        var image = d3.select(document.createElement('img')),
            canvas = d3.select(document.createElement('canvas')),
            z = 19;

        canvas.attr('width', wh[0]).attr('height', wh[1]);
        projection.center(projection.invert(path.centroid(geojson)));
        projection.scale((1 << z) / 2 / Math.PI);

        var bounds = path.bounds(geojson);

        while (bounds[1][0] - bounds[0][0] > wh[0] ||
               bounds[1][1] - bounds[0][1] > wh[1]) {
            projection.scale((1 << z) / 2 / Math.PI);
            bounds = path.bounds(geojson);
            z--;
        }

        var ctx = scaleCanvas(canvas.node()).getContext('2d'),
        painter = path.context(ctx);

        ctx.strokeStyle = '#E000F5';
        ctx.lineWidth = 2;

        image.node().crossOrigin = '*';
        image
            .on('load', imageload)
            .on('error', imageerror)
            .attr('src', staticUrl(projection.center().concat([z-6]).map(filterNan), wh));

        function imageload() {
            ctx.drawImage(this, 0, 0);
            painter(geojson);
            ctx.stroke();
            callback(null, canvas.node().toDataURL());
        }

        function imageerror(err) {
            callback(err);
        }
    };

    function filterNan(_) { return isNaN(_) ? 0 : _; }
};

},{"autoscale-canvas":12}],12:[function(require,module,exports){

/**
 * Retina-enable the given `canvas`.
 *
 * @param {Canvas} canvas
 * @return {Canvas}
 * @api public
 */

module.exports = function(canvas){
  var ctx = canvas.getContext('2d');
  var ratio = window.devicePixelRatio || 1;
  if (1 != ratio) {
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width *= ratio;
    canvas.height *= ratio;
    ctx.scale(ratio, ratio);
  }
  return canvas;
};
},{}],13:[function(require,module,exports){
module.exports = isMobile;

function isMobile (ua) {
  if (!ua && typeof navigator != 'undefined') ua = navigator.userAgent;

  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4));
}


},{}],14:[function(require,module,exports){
(function(window) {
	var HAS_HASHCHANGE = (function() {
		var doc_mode = window.documentMode;
		return ('onhashchange' in window) &&
			(doc_mode === undefined || doc_mode > 7);
	})();

	L.Hash = function(map) {
		this.onHashChange = L.Util.bind(this.onHashChange, this);

		if (map) {
			this.init(map);
		}
	};

	L.Hash.parseHash = function(hash) {
		if(hash.indexOf('#') === 0) {
			hash = hash.substr(1);
		}
		var args = hash.split("/");
		if (args.length == 3) {
			var zoom = parseInt(args[0], 10),
			lat = parseFloat(args[1]),
			lon = parseFloat(args[2]);
			if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
				return false;
			} else {
				return {
					center: new L.LatLng(lat, lon),
					zoom: zoom
				};
			}
		} else {
			return false;
		}
	};

	L.Hash.formatHash = function(map) {
		var center = map.getCenter(),
		    zoom = map.getZoom(),
		    precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));

		return "#" + [zoom,
			center.lat.toFixed(precision),
			center.lng.toFixed(precision)
		].join("/");
	},

	L.Hash.prototype = {
		map: null,
		lastHash: null,

		parseHash: L.Hash.parseHash,
		formatHash: L.Hash.formatHash,

		init: function(map) {
			this.map = map;

			// reset the hash
			this.lastHash = null;
			this.onHashChange();

			if (!this.isListening) {
				this.startListening();
			}
		},

		remove: function() {
			if (this.changeTimeout) {
				clearTimeout(this.changeTimeout);
			}

			if (this.isListening) {
				this.stopListening();
			}

			this.map = null;
		},

		onMapMove: function() {
			// bail if we're moving the map (updating from a hash),
			// or if the map is not yet loaded

			if (this.movingMap || !this.map._loaded) {
				return false;
			}

			var hash = this.formatHash(this.map);
			if (this.lastHash != hash) {
				location.replace(hash);
				this.lastHash = hash;
			}
		},

		movingMap: false,
		update: function() {
			var hash = location.hash;
			if (hash === this.lastHash) {
				return;
			}
			var parsed = this.parseHash(hash);
			if (parsed) {
				this.movingMap = true;

				this.map.setView(parsed.center, parsed.zoom);

				this.movingMap = false;
			} else {
				this.onMapMove(this.map);
			}
		},

		// defer hash change updates every 100ms
		changeDefer: 100,
		changeTimeout: null,
		onHashChange: function() {
			// throttle calls to update() so that they only happen every
			// `changeDefer` ms
			if (!this.changeTimeout) {
				var that = this;
				this.changeTimeout = setTimeout(function() {
					that.update();
					that.changeTimeout = null;
				}, this.changeDefer);
			}
		},

		isListening: false,
		hashChangeInterval: null,
		startListening: function() {
			this.map.on("moveend", this.onMapMove, this);

			if (HAS_HASHCHANGE) {
				L.DomEvent.addListener(window, "hashchange", this.onHashChange);
			} else {
				clearInterval(this.hashChangeInterval);
				this.hashChangeInterval = setInterval(this.onHashChange, 50);
			}
			this.isListening = true;
		},

		stopListening: function() {
			this.map.off("moveend", this.onMapMove, this);

			if (HAS_HASHCHANGE) {
				L.DomEvent.removeListener(window, "hashchange", this.onHashChange);
			} else {
				clearInterval(this.hashChangeInterval);
			}
			this.isListening = false;
		}
	};
	L.hash = function(map) {
		return new L.Hash(map);
	};
	L.Map.prototype.addHash = function() {
		this._hash = L.hash(this);
	};
	L.Map.prototype.removeHash = function() {
		this._hash.remove();
	};
})(window);

},{}],15:[function(require,module,exports){
var osm_geojson = {};

osm_geojson.geojson2osm = function(geo, changeset) {
    function togeojson(geo, properties) {
        var nodes = '',
            ways = '',
            relations = '';
        properties = properties || {};

        switch (geo.type) {
            case 'Point':
                var coord = roundCoords([geo.coordinates]);
                nodes += '<node id="' + count + '" lat="' + coord[0][1] +
                '" lon="' + coord[0][0] + '">';
                nodes += propertiesToTags(properties);
                nodes += '</node>';
                count--;
                break;

            case 'MultiPoint':
                break;
            case 'LineString':
                break;
            case 'MultiLineString':
                break;
            case 'Polygon':
                append(polygon(geo, properties));
                break;

            case 'MultiPolygon':
                relations += '<relation id="' + count + '" changeset="' + changeset + '">';
                properties.type = 'multipolygon';
                count--;

                for (var i = 0; i < geo.coordinates.length; i++){

                    poly = polygon({
                        'coordinates': geo.coordinates[i]
                    }, undefined, true);

                    nodes += poly.nodes;
                    ways += poly.ways;
                    relations += poly.relations;
                }

                relations += propertiesToTags(properties);
                relations += '</relation>';
                break;
        }

        function append(obj) {
            nodes += obj.nodes;
            ways += obj.ways;
            relations += obj.relations;
        }

        osm = '<?xml version="1.0" encoding="UTF-8"?><osm version="0.6" generator="geo2osm.js">' +
        nodes + ways + relations + '</osm>';

        return {
            nodes: nodes,
            ways: ways,
            relations: relations,
            osm: osm
        };
    }

    function polygon(geo, properties, multipolygon) {
        var nodes = '',
            ways = '',
            relations = '',
            role = '';
        properties = properties || {};
        multipolygon = multipolygon || false;

        var coords = [];
        if (geo.coordinates.length > 1) {
            // polygon with holes -> multipolygon
            if (!multipolygon) relations += '<relation id="' + count + '" changeset="' + changeset +'">';
            count--;
            properties.type = 'multipolygon';

            for (var i = 0; i < geo.coordinates.length; i++) {

                role = ((i === 0) ? 'outer' : 'inner');

                relations += '<member type="way" ref="' + count + '" role="' + role + '"/>';
                ways += '<way id="' + count + '" changeset="' + changeset + '">';
                count--;
                for (var a = 0; a < geo.coordinates[i].length-1; a++) {
                    coords.push([geo.coordinates[i][a][1], geo.coordinates[i][a][0]]);
                }
                coords = createNodes(coords, true);
                nodes += coords.nodes;
                ways += coords.nds;
                ways += '</way>';
                coords = [];
            }

            if (!multipolygon) {
                relations += propertiesToTags(properties);
                relations += '</relation>';
            }
        } else {
            // polygon -> way
            ways += '<way id="' + count + '" changeset="' + changeset + '">';
            if (multipolygon) relations += '<member type="way" ref="' + count + '" role="outer"/>';
            count--;
            for (var j = 0; j < geo.coordinates[0].length-1; j++) {
                coords.push([geo.coordinates[0][j][1], geo.coordinates[0][j][0]]);
            }
            coords = createNodes(coords, true);
            nodes += coords.nodes;
            ways += coords.nds;
            ways += propertiesToTags(properties);
            ways += '</way>';
        }

        return {
            nodes: nodes,
            ways: ways,
            relations: relations
        };
    }

    function propertiesToTags(properties) {
        var tags = '';
        for (var tag in properties) {
            if (properties[tag] !== null) {
                tags += '<tag k="' + tag + '" v="' + properties[tag] + '"/>';
            }
        }
        return tags;
    }

    function roundCoords(coords){
        for (var a = 0; a < coords.length; a++) {
            coords[a][0] = Math.round(coords[a][0] * 1000000) / 1000000;
            coords[a][1] = Math.round(coords[a][1] * 1000000) / 1000000;
        }
        return coords;
    }

    function createNodes(coords, repeatLastND) {
        var nds = '',
            nodes = '',
            length = coords.length;
        repeatLastND = repeatLastND || false;
            // for polygons

        coords = roundCoords(coords);

        for (var a = 0; a < length; a++) {
            if (repeatLastND && a === 0) repeatLastND = count;

            nds += '<nd ref="' + count + '"/>';
            nodes += '<node id="' + count + '" lat="' + coords[a][0] +'" lon="' + coords[a][1] +
            '" changeset="' + changeset + '"/>';

            if (repeatLastND && a === length-1) nds += '<nd ref="' + repeatLastND + '"/>';
            count--;
        }
        return {'nds': nds, 'nodes': nodes};
    }

    var obj,
        count = -1;
    changeset = changeset || false;

    switch (geo.type) {
        case 'FeatureCollection':
            var temp = {
                nodes: '',
                ways: '',
                relations: ''
            };
            obj = [];
            for (var i = 0; i < geo.features.length; i++){
                obj.push(togeojson(geo.features[i].geometry, geo.features[i].properties));
            }
            temp.osm = '<?xml version="1.0" encoding="UTF-8"?><osm version="0.6" generator="geo2osm.js">';
            for (var n = 0; n < obj.length; n++) {
                temp.nodes += obj[n].nodes;
                temp.ways += obj[n].ways;
                temp.relations += obj[n].relations;
            }
            temp.osm += temp.nodes + temp.ways + temp.relations;
            temp.osm += '</osm>';
            obj = temp.osm;
            break;

        case 'GeometryCollection':
            obj = [];
            for (var j = 0; j < geo.geometries.length; j++){
                obj.push(togeojson(geo.geometries[j]));
            }
            break;

        case 'Feature':
            obj = togeojson(geo.geometry, geo.properties);
            obj = obj.osm;
            break;

        case 'Point':
        case 'MultiPoint':
        case 'LineString':
        case 'MultiLineString':
        case 'Polygon':
        case 'MultiPolygon':
            obj = togeojson(geo);
            obj = obj.osm;
            break;

        default:
            if (console) console.log('Invalid GeoJSON object: GeoJSON object must be one of \"Point\", \"LineString\",' +
                '\"Polygon\", \"MultiPolygon\", \"Feature\", \"FeatureCollection\" or \"GeometryCollection\".');
    }

    return obj;
};

osm_geojson.osm2geojson = function(osm, metaProperties) {

    var xml = parse(osm),
        nodeCache = cacheNodes(),
        wayCache = cacheWays();

    return Bounds({
        type : 'FeatureCollection',
        features : []
            .concat(Points(nodeCache))
            .concat(Ways(wayCache))
            .concat(Ways(Relations))
    }, xml);

    function parse(xml) {
        if (typeof xml !== 'string') return xml;
        return (new DOMParser()).parseFromString(
            new XMLSerializer().serializeToString(xml), 'text/xml');
    }

    function Bounds(geo, xml) {
        var bounds = getBy(xml, 'bounds');
        if (!bounds.length) return geo;
        geo.bbox = [
            attrf(bounds[0], 'minlon'),
            attrf(bounds[0], 'minlat'),
            attrf(bounds[0], 'maxlon'),
            attrf(bounds[0], 'maxlat')
        ];
        return geo;
    }

    function setProperties(element) {
        var props = {},
            tags = element.getElementsByTagName('tag'),
            tags_length = tags.length;

        for (var t = 0; t < tags_length; t++) {
            props[attr(tags[t], 'k')] = isNumber(attr(tags[t], 'v')) ?
                parseFloat(attr(tags[t], 'v')) : attr(tags[t], 'v');
        }

        if (metaProperties) {
            setIf(element, 'id', props, 'osm_id');
            setIf(element, 'user', props, 'osm_lastEditor');
            setIf(element, 'version', props, 'osm_version', true);
            setIf(element, 'changeset', props, 'osm_lastChangeset', true);
            setIf(element, 'timestamp', props, 'osm_lastEdited');
        }

        return sortObject(props);
    }

    function getFeature(element, type, coordinates) {
        return {
            geometry: {
                type: type,
                coordinates: coordinates || []
            },
            type: 'Feature',
            properties: setProperties(element)
        };
    }

    function cacheNodes() {
        var nodes = getBy(xml, 'node'),
            coords = {},
            withTags = [];

        for (var n = 0; n < nodes.length; n++) {
            var tags = getBy(nodes[n], 'tag');
            coords[attr(nodes[n], 'id')] = lonLat(nodes[n]);
            if (tags.length) withTags.push(nodes[n]);
        }

        return {
            coords: coords,
            withTags: withTags
        };
    }

    function Points(nodeCache) {
        var points = nodeCache.withTags,
            features = [];

        for (var p = 0, r = points.length; p < r; p++) {
            var feature = getFeature(points[p], 'Point', lonLat(points[p]));
            features.push(feature);
        }

        return features;
    }

    function cacheWays() {
        var ways = getBy(xml, 'way'),
            out = {};

        for (var w = 0; w < ways.length; w++) {
            var feature = {},
                nds = getBy(ways[w], 'nd');

            if (attr(nds[0], 'ref') === attr(nds[nds.length - 1], 'ref')) {
                feature = getFeature(ways[w], 'Polygon', [[]]);
            } else {
                feature = getFeature(ways[w], 'LineString');
            }

            for (var n = 0; n < nds.length; n++) {
                var cords = nodeCache.coords[attr(nds[n], 'ref')];
                if (feature.geometry.type === 'Polygon') {
                    feature.geometry.coordinates[0].push(cords);
                } else {
                    feature.geometry.coordinates.push(cords);
                }
            }

            out[attr(ways[w], 'id')] = feature;
        }

        return out;
    }

    function Relations() {
        var relations = getBy(xml, 'relation'),
            relations_length = relations.length,
            features = [];

        for (var r = 0; r < relations_length; r++) {
            var feature = getFeature(relations[r], 'MultiPolygon');

            if (feature.properties.type == 'multipolygon') {
                var members = getBy(relations[r], 'member');

                // osm doesn't keep roles in order, so we do this twice
                for (var m = 0; m < members.length; m++) {
                    if (attr(members[m], 'role') == 'outer') assignWay(members[m], feature);
                }

                for (var n = 0; n < members.length; n++) {
                    if (attr(members[n], 'role') == 'inner') assignWay(members[n], feature);
                }

                delete feature.properties.type;
            } else {
                // http://taginfo.openstreetmap.us/relations
            }

            if (feature.geometry.coordinates.length) features.push(feature);
        }

        return features;

        function assignWay(member, feature) {
            var ref = attr(member, 'ref'),
                way = wayCache[ref];

            if (way && way.geometry.type == 'Polygon') {
                if (way && attr(member, 'role') == 'outer') {
                    feature.geometry.coordinates.push(way.geometry.coordinates);
                    if (way.properties) {
                        // exterior polygon properties can move to the multipolygon
                        // but multipolygon (relation) tags take precedence
                        for (var prop in way.properties) {
                            if (!feature.properties[prop]) {
                                feature.properties[prop] = prop;
                            }
                        }
                    }
                } else if (way && attr(member, 'role') == 'inner'){
                    if (feature.geometry.coordinates.length > 1) {
                        // do a point in polygon against each outer
                        // this determines which outer the inner goes with
                        for (var a = 0; a < feature.geometry.coordinates.length; a++) {
                            if (pointInPolygon(
                                way.geometry.coordinates[0][0],
                                feature.geometry.coordinates[a][0])) {
                                feature.geometry.coordinates[a].push(way.geometry.coordinates[0]);
                                break;
                            }
                        }
                    } else {
                        if (feature.geometry.coordinates.length) {
                            feature.geometry.coordinates[0].push(way.geometry.coordinates[0]);
                        }
                    }
                }
            }

            wayCache[ref] = false;
        }
    }

    function Ways(wayCache) {
        var features = [];
        for (var w in wayCache) if (wayCache[w]) features.push(wayCache[w]);
        return features;
    }

    // https://github.com/substack/point-in-polygon/blob/master/index.js
    function pointInPolygon(point, vs) {
        var x = point[0], y = point[1];
        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1],
                xj = vs[j][0], yj = vs[j][1],
                intersect = ((yi > y) != (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // http://stackoverflow.com/a/1359808
    function sortObject(o) {
        var sorted = {}, key, a = [];
        for (key in o) if (o.hasOwnProperty(key)) a.push(key);
        a.sort();
        for (key = 0; key < a.length; key++) sorted[a[key]] = o[a[key]];
        return sorted;
    }

    // http://stackoverflow.com/a/1830844
    function isNumber(n) { return !isNaN(parseFloat(n)) && isFinite(n); }
    function attr(x, y) { return x.getAttribute(y); }
    function attrf(x, y) { return parseFloat(x.getAttribute(y)); }
    function getBy(x, y) { return x.getElementsByTagName(y); }
    function lonLat(elem) { return [attrf(elem, 'lon'), attrf(elem, 'lat')]; }
    function setIf(x, y, o, name, f) {
        if (attr(x, y)) o[name] = f ? parseFloat(attr(x, y)) : attr(x, y);
    }
};

if (typeof module !== 'undefined') module.exports = osm_geojson;

},{}],16:[function(require,module,exports){
var process=require("__browserify_process"),global=self,Buffer=require("__browserify_Buffer").Buffer;!function (t, e) {
    'function' == typeof define && define.amd ? define(e) : 'undefined' != typeof module ? module.exports = e() : t.shp = e();
}(this, function () {
    var requirejs, ___forBrowserify___, define;
    return function (t) {
        function e(t, e) {
            return M.call(t, e);
        }
        function i(t, e) {
            var i, s, r, a, n, h, o, u, l, f, c = e && e.split('/'), p = m.map, d = p && p['*'] || {};
            if (t && '.' === t.charAt(0))
                if (e) {
                    for (c = c.slice(0, c.length - 1), t = c.concat(t.split('/')), u = 0; u < t.length; u += 1)
                        if (f = t[u], '.' === f)
                            t.splice(u, 1), u -= 1;
                        else if ('..' === f) {
                            if (1 === u && ('..' === t[2] || '..' === t[0]))
                                break;
                            u > 0 && (t.splice(u - 1, 2), u -= 2);
                        }
                    t = t.join('/');
                } else
                    0 === t.indexOf('./') && (t = t.substring(2));
            if ((c || d) && p) {
                for (i = t.split('/'), u = i.length; u > 0; u -= 1) {
                    if (s = i.slice(0, u).join('/'), c)
                        for (l = c.length; l > 0; l -= 1)
                            if (r = p[c.slice(0, l).join('/')], r && (r = r[s])) {
                                a = r, n = u;
                                break;
                            }
                    if (a)
                        break;
                    !h && d && d[s] && (h = d[s], o = u);
                }
                !a && h && (a = h, n = o), a && (i.splice(0, n, a), t = i.join('/'));
            }
            return t;
        }
        function s(e, i) {
            return function () {
                return l.apply(t, g.call(arguments, 0).concat([
                    e,
                    i
                ]));
            };
        }
        function r(t) {
            return function (e) {
                return i(e, t);
            };
        }
        function a(t) {
            return function (e) {
                p[t] = e;
            };
        }
        function n(i) {
            if (e(d, i)) {
                var s = d[i];
                delete d[i], y[i] = !0, u.apply(t, s);
            }
            if (!e(p, i) && !e(y, i))
                throw new Error('No ' + i);
            return p[i];
        }
        function h(t) {
            var e, i = t ? t.indexOf('!') : -1;
            return i > -1 && (e = t.substring(0, i), t = t.substring(i + 1, t.length)), [
                e,
                t
            ];
        }
        function o(t) {
            return function () {
                return m && m.config && m.config[t] || {};
            };
        }
        var u, l, f, c, p = {}, d = {}, m = {}, y = {}, M = Object.prototype.hasOwnProperty, g = [].slice;
        f = function (t, e) {
            var s, a = h(t), o = a[0];
            return t = a[1], o && (o = i(o, e), s = n(o)), o ? t = s && s.normalize ? s.normalize(t, r(e)) : i(t, e) : (t = i(t, e), a = h(t), o = a[0], t = a[1], o && (s = n(o))), {
                f: o ? o + '!' + t : t,
                n: t,
                pr: o,
                p: s
            };
        }, c = {
            ___forBrowserify___: function (t) {
                return s(t);
            },
            exports: function (t) {
                var e = p[t];
                return 'undefined' != typeof e ? e : p[t] = {};
            },
            module: function (t) {
                return {
                    id: t,
                    uri: '',
                    exports: p[t],
                    config: o(t)
                };
            }
        }, u = function (i, r, h, o) {
            var u, l, m, M, g, _, b = [];
            if (o = o || i, 'function' == typeof h) {
                for (r = !r.length && h.length ? [
                        'require',
                        'exports',
                        'module'
                    ] : r, g = 0; g < r.length; g += 1)
                    if (M = f(r[g], o), l = M.f, 'require' === l)
                        b[g] = c.___forBrowserify___(i);
                    else if ('exports' === l)
                        b[g] = c.exports(i), _ = !0;
                    else if ('module' === l)
                        u = b[g] = c.module(i);
                    else if (e(p, l) || e(d, l) || e(y, l))
                        b[g] = n(l);
                    else {
                        if (!M.p)
                            throw new Error(i + ' missing ' + l);
                        M.p.load(M.n, s(o, !0), a(l), {}), b[g] = p[l];
                    }
                m = h.apply(p[i], b), i && (u && u.exports !== t && u.exports !== p[i] ? p[i] = u.exports : m === t && _ || (p[i] = m));
            } else
                i && (p[i] = h);
        }, requirejs = ___forBrowserify___ = l = function (e, i, s, r, a) {
            return 'string' == typeof e ? c[e] ? c[e](i) : n(f(e, i).f) : (e.splice || (m = e, i.splice ? (e = i, i = s, s = null) : e = t), i = i || function () {
            }, 'function' == typeof s && (s = r, r = a), r ? u(t, e, i, s) : setTimeout(function () {
                u(t, e, i, s);
            }, 4), l);
        }, l.config = function (t) {
            return m = t, m.deps && l(m.deps, m.callback), l;
        }, requirejs._defined = p, define = function (t, i, s) {
            i.splice || (s = i, i = []), e(p, t) || e(d, t) || (d[t] = [
                t,
                i,
                s
            ]);
        }, define.amd = { jQuery: !0 };
    }(), define('node_modules/almond/almond', function () {
    }), define('proj4/mgrs', [
        'require',
        'exports',
        'module'
    ], function (t, e) {
        function i(t) {
            return t * (Math.PI / 180);
        }
        function s(t) {
            return 180 * (t / Math.PI);
        }
        function r(t) {
            var e, s, r, a, h, o, u, l, f, c = t.lat, p = t.lon, d = 6378137, m = 0.00669438, y = 0.9996, M = i(c), g = i(p);
            f = Math.floor((p + 180) / 6) + 1, 180 === p && (f = 60), c >= 56 && 64 > c && p >= 3 && 12 > p && (f = 32), c >= 72 && 84 > c && (p >= 0 && 9 > p ? f = 31 : p >= 9 && 21 > p ? f = 33 : p >= 21 && 33 > p ? f = 35 : p >= 33 && 42 > p && (f = 37)), e = 6 * (f - 1) - 180 + 3, l = i(e), s = m / (1 - m), r = d / Math.sqrt(1 - m * Math.sin(M) * Math.sin(M)), a = Math.tan(M) * Math.tan(M), h = s * Math.cos(M) * Math.cos(M), o = Math.cos(M) * (g - l), u = d * ((1 - m / 4 - 3 * m * m / 64 - 5 * m * m * m / 256) * M - (3 * m / 8 + 3 * m * m / 32 + 45 * m * m * m / 1024) * Math.sin(2 * M) + (15 * m * m / 256 + 45 * m * m * m / 1024) * Math.sin(4 * M) - 35 * m * m * m / 3072 * Math.sin(6 * M));
            var _ = y * r * (o + (1 - a + h) * o * o * o / 6 + (5 - 18 * a + a * a + 72 * h - 58 * s) * o * o * o * o * o / 120) + 500000, b = y * (u + r * Math.tan(M) * (o * o / 2 + (5 - a + 9 * h + 4 * h * h) * o * o * o * o / 24 + (61 - 58 * a + a * a + 600 * h - 330 * s) * o * o * o * o * o * o / 720));
            return 0 > c && (b += 10000000), {
                northing: Math.round(b),
                easting: Math.round(_),
                zoneNumber: f,
                zoneLetter: n(c)
            };
        }
        function a(t) {
            var e = t.northing, i = t.easting, r = t.zoneLetter, n = t.zoneNumber;
            if (0 > n || n > 60)
                return null;
            var h, o, u, l, f, c, p, d, m, y, M = 0.9996, g = 6378137, _ = 0.00669438, b = (1 - Math.sqrt(1 - _)) / (1 + Math.sqrt(1 - _)), v = i - 500000, j = e;
            'N' > r && (j -= 10000000), d = 6 * (n - 1) - 180 + 3, h = _ / (1 - _), p = j / M, m = p / (g * (1 - _ / 4 - 3 * _ * _ / 64 - 5 * _ * _ * _ / 256)), y = m + (3 * b / 2 - 27 * b * b * b / 32) * Math.sin(2 * m) + (21 * b * b / 16 - 55 * b * b * b * b / 32) * Math.sin(4 * m) + 151 * b * b * b / 96 * Math.sin(6 * m), o = g / Math.sqrt(1 - _ * Math.sin(y) * Math.sin(y)), u = Math.tan(y) * Math.tan(y), l = h * Math.cos(y) * Math.cos(y), f = g * (1 - _) / Math.pow(1 - _ * Math.sin(y) * Math.sin(y), 1.5), c = v / (o * M);
            var x = y - o * Math.tan(y) / f * (c * c / 2 - (5 + 3 * u + 10 * l - 4 * l * l - 9 * h) * c * c * c * c / 24 + (61 + 90 * u + 298 * l + 45 * u * u - 252 * h - 3 * l * l) * c * c * c * c * c * c / 720);
            x = s(x);
            var A = (c - (1 + 2 * u + l) * c * c * c / 6 + (5 - 2 * l + 28 * u - 3 * l * l + 8 * h + 24 * u * u) * c * c * c * c * c / 120) / Math.cos(y);
            A = d + s(A);
            var C;
            if (t.accuracy) {
                var w = a({
                        northing: t.northing + t.accuracy,
                        easting: t.easting + t.accuracy,
                        zoneLetter: t.zoneLetter,
                        zoneNumber: t.zoneNumber
                    });
                C = {
                    top: w.lat,
                    right: w.lon,
                    bottom: x,
                    left: A
                };
            } else
                C = {
                    lat: x,
                    lon: A
                };
            return C;
        }
        function n(t) {
            var e = 'Z';
            return 84 >= t && t >= 72 ? e = 'X' : 72 > t && t >= 64 ? e = 'W' : 64 > t && t >= 56 ? e = 'V' : 56 > t && t >= 48 ? e = 'U' : 48 > t && t >= 40 ? e = 'T' : 40 > t && t >= 32 ? e = 'S' : 32 > t && t >= 24 ? e = 'R' : 24 > t && t >= 16 ? e = 'Q' : 16 > t && t >= 8 ? e = 'P' : 8 > t && t >= 0 ? e = 'N' : 0 > t && t >= -8 ? e = 'M' : -8 > t && t >= -16 ? e = 'L' : -16 > t && t >= -24 ? e = 'K' : -24 > t && t >= -32 ? e = 'J' : -32 > t && t >= -40 ? e = 'H' : -40 > t && t >= -48 ? e = 'G' : -48 > t && t >= -56 ? e = 'F' : -56 > t && t >= -64 ? e = 'E' : -64 > t && t >= -72 ? e = 'D' : -72 > t && t >= -80 && (e = 'C'), e;
        }
        function h(t, e) {
            var i = '' + t.easting, s = '' + t.northing;
            return t.zoneNumber + t.zoneLetter + o(t.easting, t.northing, t.zoneNumber) + i.substr(i.length - 5, e) + s.substr(s.length - 5, e);
        }
        function o(t, e, i) {
            var s = u(i), r = Math.floor(t / 100000), a = Math.floor(e / 100000) % 20;
            return l(r, a, s);
        }
        function u(t) {
            var e = t % m;
            return 0 === e && (e = m), e;
        }
        function l(t, e, i) {
            var s = i - 1, r = y.charCodeAt(s), a = M.charCodeAt(s), n = r + t - 1, h = a + e, o = !1;
            n > j && (n = n - j + g - 1, o = !0), (n === _ || _ > r && n > _ || (n > _ || _ > r) && o) && n++, (n === b || b > r && n > b || (n > b || b > r) && o) && (n++, n === _ && n++), n > j && (n = n - j + g - 1), h > v ? (h = h - v + g - 1, o = !0) : o = !1, (h === _ || _ > a && h > _ || (h > _ || _ > a) && o) && h++, (h === b || b > a && h > b || (h > b || b > a) && o) && (h++, h === _ && h++), h > v && (h = h - v + g - 1);
            var u = String.fromCharCode(n) + String.fromCharCode(h);
            return u;
        }
        function f(t) {
            if (t && 0 === t.length)
                throw 'MGRSPoint coverting from nothing';
            for (var e, i = t.length, s = null, r = '', a = 0; !/[A-Z]/.test(e = t.charAt(a));) {
                if (a >= 2)
                    throw 'MGRSPoint bad conversion from: ' + t;
                r += e, a++;
            }
            var n = parseInt(r, 10);
            if (0 === a || a + 3 > i)
                throw 'MGRSPoint bad conversion from: ' + t;
            var h = t.charAt(a++);
            if ('A' >= h || 'B' === h || 'Y' === h || h >= 'Z' || 'I' === h || 'O' === h)
                throw 'MGRSPoint zone letter ' + h + ' not handled: ' + t;
            s = t.substring(a, a += 2);
            for (var o = u(n), l = c(s.charAt(0), o), f = p(s.charAt(1), o); f < d(h);)
                f += 2000000;
            var m = i - a;
            if (0 !== m % 2)
                throw 'MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters' + t;
            var y, M, g, _, b, v = m / 2, j = 0, x = 0;
            return v > 0 && (y = 100000 / Math.pow(10, v), M = t.substring(a, a + v), j = parseFloat(M) * y, g = t.substring(a + v), x = parseFloat(g) * y), _ = j + l, b = x + f, {
                easting: _,
                northing: b,
                zoneLetter: h,
                zoneNumber: n,
                accuracy: y
            };
        }
        function c(t, e) {
            for (var i = y.charCodeAt(e - 1), s = 100000, r = !1; i !== t.charCodeAt(0);) {
                if (i++, i === _ && i++, i === b && i++, i > j) {
                    if (r)
                        throw 'Bad character: ' + t;
                    i = g, r = !0;
                }
                s += 100000;
            }
            return s;
        }
        function p(t, e) {
            if (t > 'V')
                throw 'MGRSPoint given invalid Northing ' + t;
            for (var i = M.charCodeAt(e - 1), s = 0, r = !1; i !== t.charCodeAt(0);) {
                if (i++, i === _ && i++, i === b && i++, i > v) {
                    if (r)
                        throw 'Bad character: ' + t;
                    i = g, r = !0;
                }
                s += 100000;
            }
            return s;
        }
        function d(t) {
            var e;
            switch (t) {
            case 'C':
                e = 1100000;
                break;
            case 'D':
                e = 2000000;
                break;
            case 'E':
                e = 2800000;
                break;
            case 'F':
                e = 3700000;
                break;
            case 'G':
                e = 4600000;
                break;
            case 'H':
                e = 5500000;
                break;
            case 'J':
                e = 6400000;
                break;
            case 'K':
                e = 7300000;
                break;
            case 'L':
                e = 8200000;
                break;
            case 'M':
                e = 9100000;
                break;
            case 'N':
                e = 0;
                break;
            case 'P':
                e = 800000;
                break;
            case 'Q':
                e = 1700000;
                break;
            case 'R':
                e = 2600000;
                break;
            case 'S':
                e = 3500000;
                break;
            case 'T':
                e = 4400000;
                break;
            case 'U':
                e = 5300000;
                break;
            case 'V':
                e = 6200000;
                break;
            case 'W':
                e = 7000000;
                break;
            case 'X':
                e = 7900000;
                break;
            default:
                e = -1;
            }
            if (e >= 0)
                return e;
            throw 'Invalid zone letter: ' + t;
        }
        var m = 6, y = 'AJSAJS', M = 'AFAFAF', g = 65, _ = 73, b = 79, v = 86, j = 90;
        e.forward = function (t, e) {
            return e = e || 5, h(r({
                lat: t.lat,
                lon: t.lon
            }), e);
        }, e.inverse = function (t) {
            var e = a(f(t.toUpperCase()));
            return [
                e.left,
                e.bottom,
                e.right,
                e.top
            ];
        };
    }), define('proj4/Point', [
        'require',
        'proj4/mgrs'
    ], function (t) {
        function e(t, i, s) {
            if (!(this instanceof e))
                return new e(t, i, s);
            if ('object' == typeof t)
                this.x = t[0], this.y = t[1], this.z = t[2] || 0;
            else if ('string' == typeof t && 'undefined' == typeof i) {
                var r = t.split(',');
                this.x = parseFloat(r[0]), this.y = parseFloat(r[1]), this.z = parseFloat(r[2]) || 0;
            } else
                this.x = t, this.y = i, this.z = s || 0;
            this.clone = function () {
                return new e(this.x, this.y, this.z);
            }, this.toString = function () {
                return 'x=' + this.x + ',y=' + this.y;
            }, this.toShortString = function () {
                return this.x + ', ' + this.y;
            };
        }
        var i = t('proj4/mgrs');
        return e.fromMGRS = function (t) {
            var s = i.inverse(t);
            return new e((s[2] + s[0]) / 2, (s[3] + s[1]) / 2);
        }, e.prototype.toMGRS = function (t) {
            return i.forward({
                lon: this.x,
                lat: this.y
            }, t);
        }, e;
    }), define('proj4/extend', [], function () {
        return function (t, e) {
            t = t || {};
            var i, s;
            if (!e)
                return t;
            for (s in e)
                i = e[s], void 0 !== i && (t[s] = i);
            return t;
        };
    }), define('proj4/common', [], function () {
        var t = {
                PI: 3.141592653589793,
                HALF_PI: 1.5707963267948966,
                TWO_PI: 6.283185307179586,
                FORTPI: 0.7853981633974483,
                R2D: 57.29577951308232,
                D2R: 0.017453292519943295,
                SEC_TO_RAD: 0.00000484813681109536,
                EPSLN: 1e-10,
                MAX_ITER: 20,
                COS_67P5: 0.3826834323650898,
                AD_C: 1.0026,
                PJD_UNKNOWN: 0,
                PJD_3PARAM: 1,
                PJD_7PARAM: 2,
                PJD_GRIDSHIFT: 3,
                PJD_WGS84: 4,
                PJD_NODATUM: 5,
                SRS_WGS84_SEMIMAJOR: 6378137,
                SRS_WGS84_ESQUARED: 0.006694379990141316,
                SIXTH: 0.16666666666666666,
                RA4: 0.04722222222222222,
                RA6: 0.022156084656084655,
                RV4: 0.06944444444444445,
                RV6: 0.04243827160493827,
                msfnz: function (t, e, i) {
                    var s = t * e;
                    return i / Math.sqrt(1 - s * s);
                },
                tsfnz: function (t, e, i) {
                    var s = t * i, r = 0.5 * t;
                    return s = Math.pow((1 - s) / (1 + s), r), Math.tan(0.5 * (this.HALF_PI - e)) / s;
                },
                phi2z: function (t, e) {
                    for (var i, s, r = 0.5 * t, a = this.HALF_PI - 2 * Math.atan(e), n = 0; 15 >= n; n++)
                        if (i = t * Math.sin(a), s = this.HALF_PI - 2 * Math.atan(e * Math.pow((1 - i) / (1 + i), r)) - a, a += s, Math.abs(s) <= 1e-10)
                            return a;
                    return -9999;
                },
                qsfnz: function (t, e) {
                    var i;
                    return t > 1e-7 ? (i = t * e, (1 - t * t) * (e / (1 - i * i) - 0.5 / t * Math.log((1 - i) / (1 + i)))) : 2 * e;
                },
                iqsfnz: function (e, i) {
                    var s = 1 - (1 - e * e) / (2 * e) * Math.log((1 - e) / (1 + e));
                    if (Math.abs(Math.abs(i) - s) < 0.000001)
                        return 0 > i ? -1 * t.HALF_PI : t.HALF_PI;
                    for (var r, a, n, h, o = Math.asin(0.5 * i), u = 0; 30 > u; u++)
                        if (a = Math.sin(o), n = Math.cos(o), h = e * a, r = Math.pow(1 - h * h, 2) / (2 * n) * (i / (1 - e * e) - a / (1 - h * h) + 0.5 / e * Math.log((1 - h) / (1 + h))), o += r, Math.abs(r) <= 1e-10)
                            return o;
                    return 0 / 0;
                },
                asinz: function (t) {
                    return Math.abs(t) > 1 && (t = t > 1 ? 1 : -1), Math.asin(t);
                },
                e0fn: function (t) {
                    return 1 - 0.25 * t * (1 + t / 16 * (3 + 1.25 * t));
                },
                e1fn: function (t) {
                    return 0.375 * t * (1 + 0.25 * t * (1 + 0.46875 * t));
                },
                e2fn: function (t) {
                    return 0.05859375 * t * t * (1 + 0.75 * t);
                },
                e3fn: function (t) {
                    return t * t * t * (35 / 3072);
                },
                mlfn: function (t, e, i, s, r) {
                    return t * r - e * Math.sin(2 * r) + i * Math.sin(4 * r) - s * Math.sin(6 * r);
                },
                imlfn: function (t, e, i, s, r) {
                    var a, n;
                    a = t / e;
                    for (var h = 0; 15 > h; h++)
                        if (n = (t - (e * a - i * Math.sin(2 * a) + s * Math.sin(4 * a) - r * Math.sin(6 * a))) / (e - 2 * i * Math.cos(2 * a) + 4 * s * Math.cos(4 * a) - 6 * r * Math.cos(6 * a)), a += n, Math.abs(n) <= 1e-10)
                            return a;
                    return 0 / 0;
                },
                srat: function (t, e) {
                    return Math.pow((1 - t) / (1 + t), e);
                },
                sign: function (t) {
                    return 0 > t ? -1 : 1;
                },
                adjust_lon: function (t) {
                    return t = Math.abs(t) < this.PI ? t : t - this.sign(t) * this.TWO_PI;
                },
                adjust_lat: function (t) {
                    return t = Math.abs(t) < this.HALF_PI ? t : t - this.sign(t) * this.PI;
                },
                latiso: function (t, e, i) {
                    if (Math.abs(e) > this.HALF_PI)
                        return Number.NaN;
                    if (e === this.HALF_PI)
                        return Number.POSITIVE_INFINITY;
                    if (e === -1 * this.HALF_PI)
                        return Number.NEGATIVE_INFINITY;
                    var s = t * i;
                    return Math.log(Math.tan((this.HALF_PI + e) / 2)) + t * Math.log((1 - s) / (1 + s)) / 2;
                },
                fL: function (t, e) {
                    return 2 * Math.atan(t * Math.exp(e)) - this.HALF_PI;
                },
                invlatiso: function (t, e) {
                    var i = this.fL(1, e), s = 0, r = 0;
                    do
                        s = i, r = t * Math.sin(s), i = this.fL(Math.exp(t * Math.log((1 + r) / (1 - r)) / 2), e);
                    while (Math.abs(i - s) > 1e-12);
                    return i;
                },
                sinh: function (t) {
                    var e = Math.exp(t);
                    return e = (e - 1 / e) / 2;
                },
                cosh: function (t) {
                    var e = Math.exp(t);
                    return e = (e + 1 / e) / 2;
                },
                tanh: function (t) {
                    var e = Math.exp(t);
                    return e = (e - 1 / e) / (e + 1 / e);
                },
                asinh: function (t) {
                    var e = t >= 0 ? 1 : -1;
                    return e * Math.log(Math.abs(t) + Math.sqrt(t * t + 1));
                },
                acosh: function (t) {
                    return 2 * Math.log(Math.sqrt((t + 1) / 2) + Math.sqrt((t - 1) / 2));
                },
                atanh: function (t) {
                    return Math.log((t - 1) / (t + 1)) / 2;
                },
                gN: function (t, e, i) {
                    var s = e * i;
                    return t / Math.sqrt(1 - s * s);
                },
                pj_enfn: function (t) {
                    var e = [];
                    e[0] = this.C00 - t * (this.C02 + t * (this.C04 + t * (this.C06 + t * this.C08))), e[1] = t * (this.C22 - t * (this.C04 + t * (this.C06 + t * this.C08)));
                    var i = t * t;
                    return e[2] = i * (this.C44 - t * (this.C46 + t * this.C48)), i *= t, e[3] = i * (this.C66 - t * this.C68), e[4] = i * t * this.C88, e;
                },
                pj_mlfn: function (t, e, i, s) {
                    return i *= e, e *= e, s[0] * t - i * (s[1] + e * (s[2] + e * (s[3] + e * s[4])));
                },
                pj_inv_mlfn: function (e, i, s) {
                    for (var r = 1 / (1 - i), a = e, n = t.MAX_ITER; n; --n) {
                        var h = Math.sin(a), o = 1 - i * h * h;
                        if (o = (this.pj_mlfn(a, h, Math.cos(a), s) - e) * o * Math.sqrt(o) * r, a -= o, Math.abs(o) < t.EPSLN)
                            return a;
                    }
                    return a;
                },
                nad_intr: function (t, e) {
                    var i, s = {
                            x: (t.x - 1e-7) / e.del[0],
                            y: (t.y - 1e-7) / e.del[1]
                        }, r = {
                            x: Math.floor(s.x),
                            y: Math.floor(s.y)
                        }, a = {
                            x: s.x - 1 * r.x,
                            y: s.y - 1 * r.y
                        }, n = {
                            x: Number.NaN,
                            y: Number.NaN
                        };
                    if (r.x < 0) {
                        if (!(-1 === r.x && a.x > 0.99999999999))
                            return n;
                        r.x++, a.x = 0;
                    } else if (i = r.x + 1, i >= e.lim[0]) {
                        if (!(i === e.lim[0] && a.x < 1e-11))
                            return n;
                        r.x--, a.x = 1;
                    }
                    if (r.y < 0) {
                        if (!(-1 === r.y && a.y > 0.99999999999))
                            return n;
                        r.y++, a.y = 0;
                    } else if (i = r.y + 1, i >= e.lim[1]) {
                        if (!(i === e.lim[1] && a.y < 1e-11))
                            return n;
                        r.y++, a.y = 1;
                    }
                    i = r.y * e.lim[0] + r.x;
                    var h = {
                            x: e.cvs[i][0],
                            y: e.cvs[i][1]
                        };
                    i++;
                    var o = {
                            x: e.cvs[i][0],
                            y: e.cvs[i][1]
                        };
                    i += e.lim[0];
                    var u = {
                            x: e.cvs[i][0],
                            y: e.cvs[i][1]
                        };
                    i--;
                    var l = {
                            x: e.cvs[i][0],
                            y: e.cvs[i][1]
                        }, f = a.x * a.y, c = a.x * (1 - a.y), p = (1 - a.x) * (1 - a.y), d = (1 - a.x) * a.y;
                    return n.x = p * h.x + c * o.x + d * l.x + f * u.x, n.y = p * h.y + c * o.y + d * l.y + f * u.y, n;
                },
                nad_cvt: function (e, i, s) {
                    var r = {
                            x: Number.NaN,
                            y: Number.NaN
                        };
                    if (isNaN(e.x))
                        return r;
                    var a = {
                            x: e.x,
                            y: e.y
                        };
                    a.x -= s.ll[0], a.y -= s.ll[1], a.x = t.adjust_lon(a.x - t.PI) + t.PI;
                    var n = t.nad_intr(a, s);
                    if (i) {
                        if (isNaN(n.x))
                            return r;
                        n.x = a.x + n.x, n.y = a.y - n.y;
                        var h, o, u = 9, l = 1e-12;
                        do {
                            if (o = t.nad_intr(n, s), isNaN(o.x)) {
                                this.reportError('Inverse grid shift iteration failed, presumably at grid edge.  Using first approximation.');
                                break;
                            }
                            h = {
                                x: n.x - o.x - a.x,
                                y: n.y + o.y - a.y
                            }, n.x -= h.x, n.y -= h.y;
                        } while (u-- && Math.abs(h.x) > l && Math.abs(h.y) > l);
                        if (0 > u)
                            return this.reportError('Inverse grid shift iterator failed to converge.'), r;
                        r.x = t.adjust_lon(n.x + s.ll[0]), r.y = n.y + s.ll[1];
                    } else
                        isNaN(n.x) || (r.x = e.x - n.x, r.y = e.y + n.y);
                    return r;
                },
                C00: 1,
                C02: 0.25,
                C04: 0.046875,
                C06: 0.01953125,
                C08: 0.01068115234375,
                C22: 0.75,
                C44: 0.46875,
                C46: 0.013020833333333334,
                C48: 0.007120768229166667,
                C66: 0.3645833333333333,
                C68: 0.005696614583333333,
                C88: 0.3076171875
            };
        return t;
    }), define('proj4/global', [], function () {
        return function (t) {
            t('WGS84', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'), t('EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'), t('EPSG:4269', '+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees'), t('EPSG:3857', '+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs'), t['EPSG:3785'] = t['EPSG:3857'], t.GOOGLE = t['EPSG:3857'], t['EPSG:900913'] = t['EPSG:3857'], t['EPSG:102113'] = t['EPSG:3857'];
        };
    }), define('proj4/constants', [], function () {
        var t = {};
        return t.PrimeMeridian = {
            greenwich: 0,
            lisbon: -9.131906111111,
            paris: 2.337229166667,
            bogota: -74.080916666667,
            madrid: -3.687938888889,
            rome: 12.452333333333,
            bern: 7.439583333333,
            jakarta: 106.807719444444,
            ferro: -17.666666666667,
            brussels: 4.367975,
            stockholm: 18.058277777778,
            athens: 23.7163375,
            oslo: 10.722916666667
        }, t.Ellipsoid = {
            MERIT: {
                a: 6378137,
                rf: 298.257,
                ellipseName: 'MERIT 1983'
            },
            SGS85: {
                a: 6378136,
                rf: 298.257,
                ellipseName: 'Soviet Geodetic System 85'
            },
            GRS80: {
                a: 6378137,
                rf: 298.257222101,
                ellipseName: 'GRS 1980(IUGG, 1980)'
            },
            IAU76: {
                a: 6378140,
                rf: 298.257,
                ellipseName: 'IAU 1976'
            },
            airy: {
                a: 6377563.396,
                b: 6356256.91,
                ellipseName: 'Airy 1830'
            },
            'APL4.': {
                a: 6378137,
                rf: 298.25,
                ellipseName: 'Appl. Physics. 1965'
            },
            NWL9D: {
                a: 6378145,
                rf: 298.25,
                ellipseName: 'Naval Weapons Lab., 1965'
            },
            mod_airy: {
                a: 6377340.189,
                b: 6356034.446,
                ellipseName: 'Modified Airy'
            },
            andrae: {
                a: 6377104.43,
                rf: 300,
                ellipseName: 'Andrae 1876 (Den., Iclnd.)'
            },
            aust_SA: {
                a: 6378160,
                rf: 298.25,
                ellipseName: 'Australian Natl & S. Amer. 1969'
            },
            GRS67: {
                a: 6378160,
                rf: 298.247167427,
                ellipseName: 'GRS 67(IUGG 1967)'
            },
            bessel: {
                a: 6377397.155,
                rf: 299.1528128,
                ellipseName: 'Bessel 1841'
            },
            bess_nam: {
                a: 6377483.865,
                rf: 299.1528128,
                ellipseName: 'Bessel 1841 (Namibia)'
            },
            clrk66: {
                a: 6378206.4,
                b: 6356583.8,
                ellipseName: 'Clarke 1866'
            },
            clrk80: {
                a: 6378249.145,
                rf: 293.4663,
                ellipseName: 'Clarke 1880 mod.'
            },
            clrk58: {
                a: 6378293.645208759,
                rf: 294.2606763692654,
                ellipseName: 'Clarke 1858'
            },
            CPM: {
                a: 6375738.7,
                rf: 334.29,
                ellipseName: 'Comm. des Poids et Mesures 1799'
            },
            delmbr: {
                a: 6376428,
                rf: 311.5,
                ellipseName: 'Delambre 1810 (Belgium)'
            },
            engelis: {
                a: 6378136.05,
                rf: 298.2566,
                ellipseName: 'Engelis 1985'
            },
            evrst30: {
                a: 6377276.345,
                rf: 300.8017,
                ellipseName: 'Everest 1830'
            },
            evrst48: {
                a: 6377304.063,
                rf: 300.8017,
                ellipseName: 'Everest 1948'
            },
            evrst56: {
                a: 6377301.243,
                rf: 300.8017,
                ellipseName: 'Everest 1956'
            },
            evrst69: {
                a: 6377295.664,
                rf: 300.8017,
                ellipseName: 'Everest 1969'
            },
            evrstSS: {
                a: 6377298.556,
                rf: 300.8017,
                ellipseName: 'Everest (Sabah & Sarawak)'
            },
            fschr60: {
                a: 6378166,
                rf: 298.3,
                ellipseName: 'Fischer (Mercury Datum) 1960'
            },
            fschr60m: {
                a: 6378155,
                rf: 298.3,
                ellipseName: 'Fischer 1960'
            },
            fschr68: {
                a: 6378150,
                rf: 298.3,
                ellipseName: 'Fischer 1968'
            },
            helmert: {
                a: 6378200,
                rf: 298.3,
                ellipseName: 'Helmert 1906'
            },
            hough: {
                a: 6378270,
                rf: 297,
                ellipseName: 'Hough'
            },
            intl: {
                a: 6378388,
                rf: 297,
                ellipseName: 'International 1909 (Hayford)'
            },
            kaula: {
                a: 6378163,
                rf: 298.24,
                ellipseName: 'Kaula 1961'
            },
            lerch: {
                a: 6378139,
                rf: 298.257,
                ellipseName: 'Lerch 1979'
            },
            mprts: {
                a: 6397300,
                rf: 191,
                ellipseName: 'Maupertius 1738'
            },
            new_intl: {
                a: 6378157.5,
                b: 6356772.2,
                ellipseName: 'New International 1967'
            },
            plessis: {
                a: 6376523,
                rf: 6355863,
                ellipseName: 'Plessis 1817 (France)'
            },
            krass: {
                a: 6378245,
                rf: 298.3,
                ellipseName: 'Krassovsky, 1942'
            },
            SEasia: {
                a: 6378155,
                b: 6356773.3205,
                ellipseName: 'Southeast Asia'
            },
            walbeck: {
                a: 6376896,
                b: 6355834.8467,
                ellipseName: 'Walbeck'
            },
            WGS60: {
                a: 6378165,
                rf: 298.3,
                ellipseName: 'WGS 60'
            },
            WGS66: {
                a: 6378145,
                rf: 298.25,
                ellipseName: 'WGS 66'
            },
            WGS72: {
                a: 6378135,
                rf: 298.26,
                ellipseName: 'WGS 72'
            },
            WGS84: {
                a: 6378137,
                rf: 298.257223563,
                ellipseName: 'WGS 84'
            },
            sphere: {
                a: 6370997,
                b: 6370997,
                ellipseName: 'Normal Sphere (r=6370997)'
            }
        }, t.Datum = {
            wgs84: {
                towgs84: '0,0,0',
                ellipse: 'WGS84',
                datumName: 'WGS84'
            },
            ch1903: {
                towgs84: '674.374,15.056,405.346',
                ellipse: 'bessel',
                datumName: 'swiss'
            },
            ggrs87: {
                towgs84: '-199.87,74.79,246.62',
                ellipse: 'GRS80',
                datumName: 'Greek_Geodetic_Reference_System_1987'
            },
            nad83: {
                towgs84: '0,0,0',
                ellipse: 'GRS80',
                datumName: 'North_American_Datum_1983'
            },
            nad27: {
                nadgrids: '@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat',
                ellipse: 'clrk66',
                datumName: 'North_American_Datum_1927'
            },
            potsdam: {
                towgs84: '606.0,23.0,413.0',
                ellipse: 'bessel',
                datumName: 'Potsdam Rauenberg 1950 DHDN'
            },
            carthage: {
                towgs84: '-263.0,6.0,431.0',
                ellipse: 'clark80',
                datumName: 'Carthage 1934 Tunisia'
            },
            hermannskogel: {
                towgs84: '653.0,-212.0,449.0',
                ellipse: 'bessel',
                datumName: 'Hermannskogel'
            },
            ire65: {
                towgs84: '482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15',
                ellipse: 'mod_airy',
                datumName: 'Ireland 1965'
            },
            rassadiran: {
                towgs84: '-133.63,-157.5,-158.62',
                ellipse: 'intl',
                datumName: 'Rassadiran'
            },
            nzgd49: {
                towgs84: '59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993',
                ellipse: 'intl',
                datumName: 'New Zealand Geodetic Datum 1949'
            },
            osgb36: {
                towgs84: '446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894',
                ellipse: 'airy',
                datumName: 'Airy 1830'
            },
            s_jtsk: {
                towgs84: '589,76,480',
                ellipse: 'bessel',
                datumName: 'S-JTSK (Ferro)'
            },
            beduaram: {
                towgs84: '-106,-87,188',
                ellipse: 'clrk80',
                datumName: 'Beduaram'
            },
            gunung_segara: {
                towgs84: '-403,684,41',
                ellipse: 'bessel',
                datumName: 'Gunung Segara Jakarta'
            }
        }, t.Datum.OSB36 = t.Datum.OSGB36, t.wktProjections = {
            'Lambert Tangential Conformal Conic Projection': 'lcc',
            Lambert_Conformal_Conic: 'lcc',
            Lambert_Conformal_Conic_2SP: 'lcc',
            Mercator: 'merc',
            'Popular Visualisation Pseudo Mercator': 'merc',
            Mercator_1SP: 'merc',
            Transverse_Mercator: 'tmerc',
            'Transverse Mercator': 'tmerc',
            'Lambert Azimuthal Equal Area': 'laea',
            'Universal Transverse Mercator System': 'utm',
            Hotine_Oblique_Mercator: 'omerc',
            'Hotine Oblique Mercator': 'omerc',
            Hotine_Oblique_Mercator_Azimuth_Natural_Origin: 'omerc',
            Hotine_Oblique_Mercator_Azimuth_Center: 'omerc',
            Van_der_Grinten_I: 'vandg',
            VanDerGrinten: 'vandg',
            Stereographic_North_Pole: 'sterea',
            Oblique_Stereographic: 'sterea',
            Polar_Stereographic: 'sterea',
            Polyconic: 'poly',
            New_Zealand_Map_Grid: 'nzmg',
            Miller_Cylindrical: 'mill',
            Krovak: 'krovak',
            Equirectangular: 'eqc',
            Equidistant_Cylindrical: 'eqc',
            Cassini: 'cass',
            Cassini_Soldner: 'cass',
            Azimuthal_Equidistant: 'aeqd',
            Albers_Conic_Equal_Area: 'aea',
            Albers: 'aea',
            Mollweide: 'moll',
            Lambert_Azimuthal_Equal_Area: 'laea',
            Sinusoidal: 'sinu',
            Equidistant_Conic: 'eqdc',
            Mercator_Auxiliary_Sphere: 'merc'
        }, t.grids = {
            'null': {
                ll: [
                    -3.14159265,
                    -1.57079633
                ],
                del: [
                    3.14159265,
                    1.57079633
                ],
                lim: [
                    3,
                    3
                ],
                count: 9,
                cvs: [
                    [
                        0,
                        0
                    ],
                    [
                        0,
                        0
                    ],
                    [
                        0,
                        0
                    ],
                    [
                        0,
                        0
                    ],
                    [
                        0,
                        0
                    ],
                    [
                        0,
                        0
                    ],
                    [
                        0,
                        0
                    ],
                    [
                        0,
                        0
                    ],
                    [
                        0,
                        0
                    ]
                ]
            }
        }, t;
    }), define('proj4/projString', [
        'require',
        'proj4/common',
        'proj4/constants'
    ], function (t) {
        var e = t('proj4/common'), i = t('proj4/constants');
        return function (t) {
            var s = {}, r = {};
            t.split('+').map(function (t) {
                return t.trim();
            }).filter(function (t) {
                return t;
            }).forEach(function (t) {
                var e = t.split('=');
                '@null' !== e[1] && (e.push(!0), r[e[0].toLowerCase()] = e[1]);
            });
            var a, n, h, o = {
                    proj: 'projName',
                    datum: 'datumCode',
                    rf: function (t) {
                        s.rf = parseFloat(t, 10);
                    },
                    lat_0: function (t) {
                        s.lat0 = t * e.D2R;
                    },
                    lat_1: function (t) {
                        s.lat1 = t * e.D2R;
                    },
                    lat_2: function (t) {
                        s.lat2 = t * e.D2R;
                    },
                    lat_ts: function (t) {
                        s.lat_ts = t * e.D2R;
                    },
                    lon_0: function (t) {
                        s.long0 = t * e.D2R;
                    },
                    lon_1: function (t) {
                        s.long1 = t * e.D2R;
                    },
                    lon_2: function (t) {
                        s.long2 = t * e.D2R;
                    },
                    alpha: function (t) {
                        s.alpha = parseFloat(t) * e.D2R;
                    },
                    lonc: function (t) {
                        s.longc = t * e.D2R;
                    },
                    x_0: function (t) {
                        s.x0 = parseFloat(t, 10);
                    },
                    y_0: function (t) {
                        s.y0 = parseFloat(t, 10);
                    },
                    k_0: function (t) {
                        s.k0 = parseFloat(t, 10);
                    },
                    k: function (t) {
                        s.k0 = parseFloat(t, 10);
                    },
                    r_a: function () {
                        s.R_A = !0;
                    },
                    zone: function (t) {
                        s.zone = parseInt(t, 10);
                    },
                    south: function () {
                        s.utmSouth = !0;
                    },
                    towgs84: function (t) {
                        s.datum_params = t.split(',').map(function (t) {
                            return parseFloat(t, 10);
                        });
                    },
                    to_meter: function (t) {
                        s.to_meter = parseFloat(t, 10);
                    },
                    from_greenwich: function (t) {
                        s.from_greenwich = t * e.D2R;
                    },
                    pm: function (t) {
                        s.from_greenwich = (i.PrimeMeridian[t] ? i.PrimeMeridian[t] : parseFloat(t, 10)) * e.D2R;
                    },
                    axis: function (t) {
                        var e = 'ewnsud';
                        3 === t.length && -1 !== e.indexOf(t.substr(0, 1)) && -1 !== e.indexOf(t.substr(1, 1)) && -1 !== e.indexOf(t.substr(2, 1)) && (s.axis = t);
                    }
                };
            for (a in r)
                n = r[a], a in o ? (h = o[a], 'function' == typeof h ? h(n) : s[h] = n) : s[a] = n;
            return s;
        };
    }), define('proj4/wkt', [
        'require',
        'proj4/common',
        'proj4/constants',
        'proj4/extend'
    ], function (t) {
        function e(t, e, s) {
            t[e] = s.map(function (t) {
                var e = {};
                return i(t, e), e;
            }).reduce(function (t, e) {
                return o(t, e);
            }, {});
        }
        function i(t, s) {
            var r;
            return Array.isArray(t) ? (r = t.shift(), 'PARAMETER' === r && (r = t.shift()), 1 === t.length ? Array.isArray(t[0]) ? (s[r] = {}, i(t[0], s[r])) : s[r] = t[0] : t.length ? 'TOWGS84' === r ? s[r] = t : (s[r] = {}, [
                'UNIT',
                'PRIMEM',
                'VERT_DATUM'
            ].indexOf(r) > -1 ? (s[r] = {
                name: t[0].toLowerCase(),
                convert: t[1]
            }, 3 === t.length && (s[r].auth = t[2])) : 'SPHEROID' === r ? (s[r] = {
                name: t[0],
                a: t[1],
                rf: t[2]
            }, 4 === t.length && (s[r].auth = t[3])) : [
                'GEOGCS',
                'GEOCCS',
                'DATUM',
                'VERT_CS',
                'COMPD_CS',
                'LOCAL_CS',
                'FITTED_CS',
                'LOCAL_DATUM'
            ].indexOf(r) > -1 ? (t[0] = [
                'name',
                t[0]
            ], e(s, r, t)) : t.every(function (t) {
                return Array.isArray(t);
            }) ? e(s, r, t) : i(t, s[r])) : s[r] = !0, void 0) : (s[t] = !0, void 0);
        }
        function s(t, e) {
            var i = e[0], s = e[1];
            !(i in t) && s in t && (t[i] = t[s], 3 === e.length && (t[i] = e[2](t[i])));
        }
        function r(t) {
            return t * n.D2R;
        }
        function a(t) {
            function e(e) {
                var i = t.to_meter || 1;
                return parseFloat(e, 10) * i;
            }
            'GEOGCS' === t.type ? t.projName = 'longlat' : 'LOCAL_CS' === t.type ? (t.projName = 'identity', t.local = !0) : t.projName = 'object' == typeof t.PROJECTION ? h.wktProjections[Object.keys(t.PROJECTION)[0]] : h.wktProjections[t.PROJECTION], t.UNIT && (t.units = t.UNIT.name.toLowerCase(), 'metre' === t.units && (t.units = 'meter'), t.UNIT.convert && (t.to_meter = parseFloat(t.UNIT.convert, 10))), t.GEOGCS && (t.datumCode = t.GEOGCS.DATUM ? t.GEOGCS.DATUM.name.toLowerCase() : t.GEOGCS.name.toLowerCase(), 'd_' === t.datumCode.slice(0, 2) && (t.datumCode = t.datumCode.slice(2)), ('new_zealand_geodetic_datum_1949' === t.datumCode || 'new_zealand_1949' === t.datumCode) && (t.datumCode = 'nzgd49'), 'wgs_1984' === t.datumCode && ('Mercator_Auxiliary_Sphere' === t.PROJECTION && (t.sphere = !0), t.datumCode = 'wgs84'), '_ferro' === t.datumCode.slice(-6) && (t.datumCode = t.datumCode.slice(0, -6)), '_jakarta' === t.datumCode.slice(-8) && (t.datumCode = t.datumCode.slice(0, -8)), t.GEOGCS.DATUM && t.GEOGCS.DATUM.SPHEROID && (t.ellps = t.GEOGCS.DATUM.SPHEROID.name.replace('_19', '').replace(/[Cc]larke\_18/, 'clrk'), 'international' === t.ellps.toLowerCase().slice(0, 13) && (t.ellps = 'intl'), t.a = t.GEOGCS.DATUM.SPHEROID.a, t.rf = parseFloat(t.GEOGCS.DATUM.SPHEROID.rf, 10))), t.b && !isFinite(t.b) && (t.b = t.a);
            var i = function (e) {
                    return s(t, e);
                }, a = [
                    [
                        'standard_parallel_1',
                        'Standard_Parallel_1'
                    ],
                    [
                        'standard_parallel_2',
                        'Standard_Parallel_2'
                    ],
                    [
                        'false_easting',
                        'False_Easting'
                    ],
                    [
                        'false_northing',
                        'False_Northing'
                    ],
                    [
                        'central_meridian',
                        'Central_Meridian'
                    ],
                    [
                        'latitude_of_origin',
                        'Latitude_Of_Origin'
                    ],
                    [
                        'scale_factor',
                        'Scale_Factor'
                    ],
                    [
                        'k0',
                        'scale_factor'
                    ],
                    [
                        'latitude_of_center',
                        'Latitude_of_center'
                    ],
                    [
                        'lat0',
                        'latitude_of_center',
                        r
                    ],
                    [
                        'longitude_of_center',
                        'Longitude_Of_Center'
                    ],
                    [
                        'longc',
                        'longitude_of_center',
                        r
                    ],
                    [
                        'x0',
                        'false_easting',
                        e
                    ],
                    [
                        'y0',
                        'false_northing',
                        e
                    ],
                    [
                        'long0',
                        'central_meridian',
                        r
                    ],
                    [
                        'lat0',
                        'latitude_of_origin',
                        r
                    ],
                    [
                        'lat0',
                        'standard_parallel_1',
                        r
                    ],
                    [
                        'lat1',
                        'standard_parallel_1',
                        r
                    ],
                    [
                        'lat2',
                        'standard_parallel_2',
                        r
                    ],
                    [
                        'alpha',
                        'azimuth',
                        r
                    ],
                    [
                        'srsCode',
                        'name'
                    ]
                ];
            a.forEach(i), t.long0 || !t.longc || 'Albers_Conic_Equal_Area' !== t.PROJECTION && 'Lambert_Azimuthal_Equal_Area' !== t.PROJECTION || (t.long0 = t.longc);
        }
        var n = t('proj4/common'), h = t('proj4/constants'), o = t('proj4/extend');
        return function (t, e) {
            var s = JSON.parse((',' + t).replace(/\s*\,\s*([A-Z_0-9]+?)(\[)/g, ',["$1",').slice(1).replace(/\s*\,\s*([A-Z_0-9]+?)\]/g, ',"$1"]')), r = s.shift(), n = s.shift();
            s.unshift([
                'name',
                n
            ]), s.unshift([
                'type',
                r
            ]), s.unshift('output');
            var h = {};
            return i(s, h), a(h.output), o(e, h.output);
        };
    }), define('proj4/defs', [
        'require',
        'proj4/global',
        'proj4/projString',
        'proj4/wkt'
    ], function (t) {
        function e(t) {
            var i = this;
            if (2 === arguments.length)
                e[t] = '+' === arguments[1][0] ? s(arguments[1]) : r(arguments[1]);
            else if (1 === arguments.length)
                return Array.isArray(t) ? t.map(function (t) {
                    Array.isArray(t) ? e.apply(i, t) : e(t);
                }) : ('string' == typeof t || ('EPSG' in t ? e['EPSG:' + t.EPSG] = t : 'ESRI' in t ? e['ESRI:' + t.ESRI] = t : 'IAU2000' in t ? e['IAU2000:' + t.IAU2000] = t : console.log(t)), void 0);
        }
        var i = t('proj4/global'), s = t('proj4/projString'), r = t('proj4/wkt');
        return i(e), e;
    }), define('proj4/datum', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common'), i = function (t) {
                if (!(this instanceof i))
                    return new i(t);
                if (this.datum_type = e.PJD_WGS84, t) {
                    if (t.datumCode && 'none' === t.datumCode && (this.datum_type = e.PJD_NODATUM), t.datum_params) {
                        for (var s = 0; s < t.datum_params.length; s++)
                            t.datum_params[s] = parseFloat(t.datum_params[s]);
                        (0 !== t.datum_params[0] || 0 !== t.datum_params[1] || 0 !== t.datum_params[2]) && (this.datum_type = e.PJD_3PARAM), t.datum_params.length > 3 && (0 !== t.datum_params[3] || 0 !== t.datum_params[4] || 0 !== t.datum_params[5] || 0 !== t.datum_params[6]) && (this.datum_type = e.PJD_7PARAM, t.datum_params[3] *= e.SEC_TO_RAD, t.datum_params[4] *= e.SEC_TO_RAD, t.datum_params[5] *= e.SEC_TO_RAD, t.datum_params[6] = t.datum_params[6] / 1000000 + 1);
                    }
                    this.datum_type = t.grids ? e.PJD_GRIDSHIFT : this.datum_type, this.a = t.a, this.b = t.b, this.es = t.es, this.ep2 = t.ep2, this.datum_params = t.datum_params, this.datum_type === e.PJD_GRIDSHIFT && (this.grids = t.grids);
                }
            };
        return i.prototype = {
            compare_datums: function (t) {
                return this.datum_type !== t.datum_type ? !1 : this.a !== t.a || Math.abs(this.es - t.es) > 5e-11 ? !1 : this.datum_type === e.PJD_3PARAM ? this.datum_params[0] === t.datum_params[0] && this.datum_params[1] === t.datum_params[1] && this.datum_params[2] === t.datum_params[2] : this.datum_type === e.PJD_7PARAM ? this.datum_params[0] === t.datum_params[0] && this.datum_params[1] === t.datum_params[1] && this.datum_params[2] === t.datum_params[2] && this.datum_params[3] === t.datum_params[3] && this.datum_params[4] === t.datum_params[4] && this.datum_params[5] === t.datum_params[5] && this.datum_params[6] === t.datum_params[6] : this.datum_type === e.PJD_GRIDSHIFT || t.datum_type === e.PJD_GRIDSHIFT ? this.nadgrids === t.nadgrids : !0;
            },
            geodetic_to_geocentric: function (t) {
                var i, s, r, a, n, h, o, u = t.x, l = t.y, f = t.z ? t.z : 0, c = 0;
                if (l < -e.HALF_PI && l > -1.001 * e.HALF_PI)
                    l = -e.HALF_PI;
                else if (l > e.HALF_PI && l < 1.001 * e.HALF_PI)
                    l = e.HALF_PI;
                else if (l < -e.HALF_PI || l > e.HALF_PI)
                    return null;
                return u > e.PI && (u -= 2 * e.PI), n = Math.sin(l), o = Math.cos(l), h = n * n, a = this.a / Math.sqrt(1 - this.es * h), i = (a + f) * o * Math.cos(u), s = (a + f) * o * Math.sin(u), r = (a * (1 - this.es) + f) * n, t.x = i, t.y = s, t.z = r, c;
            },
            geocentric_to_geodetic: function (t) {
                var i, s, r, a, n, h, o, u, l, f, c, p, d, m, y, M, g, _ = 1e-12, b = _ * _, v = 30, j = t.x, x = t.y, A = t.z ? t.z : 0;
                if (d = !1, i = Math.sqrt(j * j + x * x), s = Math.sqrt(j * j + x * x + A * A), i / this.a < _) {
                    if (d = !0, y = 0, s / this.a < _)
                        return M = e.HALF_PI, g = -this.b, void 0;
                } else
                    y = Math.atan2(x, j);
                r = A / s, a = i / s, n = 1 / Math.sqrt(1 - this.es * (2 - this.es) * a * a), u = a * (1 - this.es) * n, l = r * n, m = 0;
                do
                    m++, o = this.a / Math.sqrt(1 - this.es * l * l), g = i * u + A * l - o * (1 - this.es * l * l), h = this.es * o / (o + g), n = 1 / Math.sqrt(1 - h * (2 - h) * a * a), f = a * (1 - h) * n, c = r * n, p = c * u - f * l, u = f, l = c;
                while (p * p > b && v > m);
                return M = Math.atan(c / Math.abs(f)), t.x = y, t.y = M, t.z = g, t;
            },
            geocentric_to_geodetic_noniter: function (t) {
                var i, s, r, a, n, h, o, u, l, f, c, p, d, m, y, M, g, _ = t.x, b = t.y, v = t.z ? t.z : 0;
                if (_ = parseFloat(_), b = parseFloat(b), v = parseFloat(v), g = !1, 0 !== _)
                    i = Math.atan2(b, _);
                else if (b > 0)
                    i = e.HALF_PI;
                else if (0 > b)
                    i = -e.HALF_PI;
                else if (g = !0, i = 0, v > 0)
                    s = e.HALF_PI;
                else {
                    if (!(0 > v))
                        return s = e.HALF_PI, r = -this.b, void 0;
                    s = -e.HALF_PI;
                }
                return n = _ * _ + b * b, a = Math.sqrt(n), h = v * e.AD_C, u = Math.sqrt(h * h + n), f = h / u, p = a / u, c = f * f * f, o = v + this.b * this.ep2 * c, M = a - this.a * this.es * p * p * p, l = Math.sqrt(o * o + M * M), d = o / l, m = M / l, y = this.a / Math.sqrt(1 - this.es * d * d), r = m >= e.COS_67P5 ? a / m - y : m <= -e.COS_67P5 ? a / -m - y : v / d + y * (this.es - 1), g === !1 && (s = Math.atan(d / m)), t.x = i, t.y = s, t.z = r, t;
            },
            geocentric_to_wgs84: function (t) {
                if (this.datum_type === e.PJD_3PARAM)
                    t.x += this.datum_params[0], t.y += this.datum_params[1], t.z += this.datum_params[2];
                else if (this.datum_type === e.PJD_7PARAM) {
                    var i = this.datum_params[0], s = this.datum_params[1], r = this.datum_params[2], a = this.datum_params[3], n = this.datum_params[4], h = this.datum_params[5], o = this.datum_params[6], u = o * (t.x - h * t.y + n * t.z) + i, l = o * (h * t.x + t.y - a * t.z) + s, f = o * (-n * t.x + a * t.y + t.z) + r;
                    t.x = u, t.y = l, t.z = f;
                }
            },
            geocentric_from_wgs84: function (t) {
                if (this.datum_type === e.PJD_3PARAM)
                    t.x -= this.datum_params[0], t.y -= this.datum_params[1], t.z -= this.datum_params[2];
                else if (this.datum_type === e.PJD_7PARAM) {
                    var i = this.datum_params[0], s = this.datum_params[1], r = this.datum_params[2], a = this.datum_params[3], n = this.datum_params[4], h = this.datum_params[5], o = this.datum_params[6], u = (t.x - i) / o, l = (t.y - s) / o, f = (t.z - r) / o;
                    t.x = u + h * l - n * f, t.y = -h * u + l + a * f, t.z = n * u - a * l + f;
                }
            }
        }, i;
    }), define('proj4/projCode/longlat', [
        'require',
        'exports',
        'module'
    ], function (t, e) {
        function i(t) {
            return t;
        }
        e.init = function () {
        }, e.forward = i, e.inverse = i;
    }), define('proj4/projCode/tmerc', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                this.e0 = e.e0fn(this.es), this.e1 = e.e1fn(this.es), this.e2 = e.e2fn(this.es), this.e3 = e.e3fn(this.es), this.ml0 = this.a * e.mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0);
            },
            forward: function (t) {
                var i, s, r, a = t.x, n = t.y, h = e.adjust_lon(a - this.long0), o = Math.sin(n), u = Math.cos(n);
                if (this.sphere) {
                    var l = u * Math.sin(h);
                    if (Math.abs(Math.abs(l) - 1) < 1e-10)
                        return 93;
                    s = 0.5 * this.a * this.k0 * Math.log((1 + l) / (1 - l)), i = Math.acos(u * Math.cos(h) / Math.sqrt(1 - l * l)), 0 > n && (i = -i), r = this.a * this.k0 * (i - this.lat0);
                } else {
                    var f = u * h, c = Math.pow(f, 2), p = this.ep2 * Math.pow(u, 2), d = Math.tan(n), m = Math.pow(d, 2);
                    i = 1 - this.es * Math.pow(o, 2);
                    var y = this.a / Math.sqrt(i), M = this.a * e.mlfn(this.e0, this.e1, this.e2, this.e3, n);
                    s = this.k0 * y * f * (1 + c / 6 * (1 - m + p + c / 20 * (5 - 18 * m + Math.pow(m, 2) + 72 * p - 58 * this.ep2))) + this.x0, r = this.k0 * (M - this.ml0 + y * d * c * (0.5 + c / 24 * (5 - m + 9 * p + 4 * Math.pow(p, 2) + c / 30 * (61 - 58 * m + Math.pow(m, 2) + 600 * p - 330 * this.ep2)))) + this.y0;
                }
                return t.x = s, t.y = r, t;
            },
            inverse: function (t) {
                var i, s, r, a, n, h, o = 6;
                if (this.sphere) {
                    var u = Math.exp(t.x / (this.a * this.k0)), l = 0.5 * (u - 1 / u), f = this.lat0 + t.y / (this.a * this.k0), c = Math.cos(f);
                    i = Math.sqrt((1 - c * c) / (1 + l * l)), n = e.asinz(i), 0 > f && (n = -n), h = 0 === l && 0 === c ? this.long0 : e.adjust_lon(Math.atan2(l, c) + this.long0);
                } else {
                    var p = t.x - this.x0, d = t.y - this.y0;
                    for (i = (this.ml0 + d / this.k0) / this.a, s = i, a = 0; !0 && (r = (i + this.e1 * Math.sin(2 * s) - this.e2 * Math.sin(4 * s) + this.e3 * Math.sin(6 * s)) / this.e0 - s, s += r, !(Math.abs(r) <= e.EPSLN)); a++)
                        if (a >= o)
                            return 95;
                    if (Math.abs(s) < e.HALF_PI) {
                        var m = Math.sin(s), y = Math.cos(s), M = Math.tan(s), g = this.ep2 * Math.pow(y, 2), _ = Math.pow(g, 2), b = Math.pow(M, 2), v = Math.pow(b, 2);
                        i = 1 - this.es * Math.pow(m, 2);
                        var j = this.a / Math.sqrt(i), x = j * (1 - this.es) / i, A = p / (j * this.k0), C = Math.pow(A, 2);
                        n = s - j * M * C / x * (0.5 - C / 24 * (5 + 3 * b + 10 * g - 4 * _ - 9 * this.ep2 - C / 30 * (61 + 90 * b + 298 * g + 45 * v - 252 * this.ep2 - 3 * _))), h = e.adjust_lon(this.long0 + A * (1 - C / 6 * (1 + 2 * b + g - C / 20 * (5 - 2 * g + 28 * b - 3 * _ + 8 * this.ep2 + 24 * v))) / y);
                    } else
                        n = e.HALF_PI * e.sign(d), h = this.long0;
                }
                return t.x = h, t.y = n, t;
            }
        };
    }), define('proj4/projCode/utm', [
        'require',
        'proj4/common',
        'proj4/projCode/tmerc'
    ], function (t) {
        var e = t('proj4/common'), i = t('proj4/projCode/tmerc');
        return {
            dependsOn: 'tmerc',
            init: function () {
                this.zone && (this.lat0 = 0, this.long0 = (6 * Math.abs(this.zone) - 183) * e.D2R, this.x0 = 500000, this.y0 = this.utmSouth ? 10000000 : 0, this.k0 = 0.9996, i.init.apply(this), this.forward = i.forward, this.inverse = i.inverse);
            }
        };
    }), define('proj4/projCode/gauss', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                var t = Math.sin(this.lat0), i = Math.cos(this.lat0);
                i *= i, this.rc = Math.sqrt(1 - this.es) / (1 - this.es * t * t), this.C = Math.sqrt(1 + this.es * i * i / (1 - this.es)), this.phic0 = Math.asin(t / this.C), this.ratexp = 0.5 * this.C * this.e, this.K = Math.tan(0.5 * this.phic0 + e.FORTPI) / (Math.pow(Math.tan(0.5 * this.lat0 + e.FORTPI), this.C) * e.srat(this.e * t, this.ratexp));
            },
            forward: function (t) {
                var i = t.x, s = t.y;
                return t.y = 2 * Math.atan(this.K * Math.pow(Math.tan(0.5 * s + e.FORTPI), this.C) * e.srat(this.e * Math.sin(s), this.ratexp)) - e.HALF_PI, t.x = this.C * i, t;
            },
            inverse: function (t) {
                for (var i = 1e-14, s = t.x / this.C, r = t.y, a = Math.pow(Math.tan(0.5 * r + e.FORTPI) / this.K, 1 / this.C), n = e.MAX_ITER; n > 0 && (r = 2 * Math.atan(a * e.srat(this.e * Math.sin(t.y), -0.5 * this.e)) - e.HALF_PI, !(Math.abs(r - t.y) < i)); --n)
                    t.y = r;
                return n ? (t.x = s, t.y = r, t) : null;
            }
        };
    }), define('proj4/projCode/sterea', [
        'require',
        'proj4/common',
        'proj4/projCode/gauss'
    ], function (t) {
        var e = t('proj4/common'), i = t('proj4/projCode/gauss');
        return {
            init: function () {
                i.init.apply(this), this.rc && (this.sinc0 = Math.sin(this.phic0), this.cosc0 = Math.cos(this.phic0), this.R2 = 2 * this.rc, this.title || (this.title = 'Oblique Stereographic Alternative'));
            },
            forward: function (t) {
                var s, r, a, n;
                return t.x = e.adjust_lon(t.x - this.long0), i.forward.apply(this, [t]), s = Math.sin(t.y), r = Math.cos(t.y), a = Math.cos(t.x), n = this.k0 * this.R2 / (1 + this.sinc0 * s + this.cosc0 * r * a), t.x = n * r * Math.sin(t.x), t.y = n * (this.cosc0 * s - this.sinc0 * r * a), t.x = this.a * t.x + this.x0, t.y = this.a * t.y + this.y0, t;
            },
            inverse: function (t) {
                var s, r, a, n, h;
                if (t.x = (t.x - this.x0) / this.a, t.y = (t.y - this.y0) / this.a, t.x /= this.k0, t.y /= this.k0, h = Math.sqrt(t.x * t.x + t.y * t.y)) {
                    var o = 2 * Math.atan2(h, this.R2);
                    s = Math.sin(o), r = Math.cos(o), n = Math.asin(r * this.sinc0 + t.y * s * this.cosc0 / h), a = Math.atan2(t.x * s, h * this.cosc0 * r - t.y * this.sinc0 * s);
                } else
                    n = this.phic0, a = 0;
                return t.x = a, t.y = n, i.inverse.apply(this, [t]), t.x = e.adjust_lon(t.x + this.long0), t;
            }
        };
    }), define('proj4/projCode/somerc', [], function () {
        return {
            init: function () {
                var t = this.lat0;
                this.lambda0 = this.long0;
                var e = Math.sin(t), i = this.a, s = this.rf, r = 1 / s, a = 2 * r - Math.pow(r, 2), n = this.e = Math.sqrt(a);
                this.R = this.k0 * i * Math.sqrt(1 - a) / (1 - a * Math.pow(e, 2)), this.alpha = Math.sqrt(1 + a / (1 - a) * Math.pow(Math.cos(t), 4)), this.b0 = Math.asin(e / this.alpha);
                var h = Math.log(Math.tan(Math.PI / 4 + this.b0 / 2)), o = Math.log(Math.tan(Math.PI / 4 + t / 2)), u = Math.log((1 + n * e) / (1 - n * e));
                this.K = h - this.alpha * o + this.alpha * n / 2 * u;
            },
            forward: function (t) {
                var e = Math.log(Math.tan(Math.PI / 4 - t.y / 2)), i = this.e / 2 * Math.log((1 + this.e * Math.sin(t.y)) / (1 - this.e * Math.sin(t.y))), s = -this.alpha * (e + i) + this.K, r = 2 * (Math.atan(Math.exp(s)) - Math.PI / 4), a = this.alpha * (t.x - this.lambda0), n = Math.atan(Math.sin(a) / (Math.sin(this.b0) * Math.tan(r) + Math.cos(this.b0) * Math.cos(a))), h = Math.asin(Math.cos(this.b0) * Math.sin(r) - Math.sin(this.b0) * Math.cos(r) * Math.cos(a));
                return t.y = this.R / 2 * Math.log((1 + Math.sin(h)) / (1 - Math.sin(h))) + this.y0, t.x = this.R * n + this.x0, t;
            },
            inverse: function (t) {
                for (var e = t.x - this.x0, i = t.y - this.y0, s = e / this.R, r = 2 * (Math.atan(Math.exp(i / this.R)) - Math.PI / 4), a = Math.asin(Math.cos(this.b0) * Math.sin(r) + Math.sin(this.b0) * Math.cos(r) * Math.cos(s)), n = Math.atan(Math.sin(s) / (Math.cos(this.b0) * Math.cos(s) - Math.sin(this.b0) * Math.tan(r))), h = this.lambda0 + n / this.alpha, o = 0, u = a, l = -1000, f = 0; Math.abs(u - l) > 1e-7;) {
                    if (++f > 20)
                        return;
                    o = 1 / this.alpha * (Math.log(Math.tan(Math.PI / 4 + a / 2)) - this.K) + this.e * Math.log(Math.tan(Math.PI / 4 + Math.asin(this.e * Math.sin(u)) / 2)), l = u, u = 2 * Math.atan(Math.exp(o)) - Math.PI / 2;
                }
                return t.x = h, t.y = u, t;
            }
        };
    }), define('proj4/projCode/omerc', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                this.no_off = this.no_off || !1, this.no_rot = this.no_rot || !1, isNaN(this.k0) && (this.k0 = 1);
                var t = Math.sin(this.lat0), i = Math.cos(this.lat0), s = this.e * t;
                this.bl = Math.sqrt(1 + this.es / (1 - this.es) * Math.pow(i, 4)), this.al = this.a * this.bl * this.k0 * Math.sqrt(1 - this.es) / (1 - s * s);
                var r = e.tsfnz(this.e, this.lat0, t), a = this.bl / i * Math.sqrt((1 - this.es) / (1 - s * s));
                1 > a * a && (a = 1);
                var n, h;
                if (isNaN(this.longc)) {
                    var o = e.tsfnz(this.e, this.lat1, Math.sin(this.lat1)), u = e.tsfnz(this.e, this.lat2, Math.sin(this.lat2));
                    this.el = this.lat0 >= 0 ? (a + Math.sqrt(a * a - 1)) * Math.pow(r, this.bl) : (a - Math.sqrt(a * a - 1)) * Math.pow(r, this.bl);
                    var l = Math.pow(o, this.bl), f = Math.pow(u, this.bl);
                    n = this.el / l, h = 0.5 * (n - 1 / n);
                    var c = (this.el * this.el - f * l) / (this.el * this.el + f * l), p = (f - l) / (f + l), d = e.adjust_lon(this.long1 - this.long2);
                    this.long0 = 0.5 * (this.long1 + this.long2) - Math.atan(c * Math.tan(0.5 * this.bl * d) / p) / this.bl, this.long0 = e.adjust_lon(this.long0);
                    var m = e.adjust_lon(this.long1 - this.long0);
                    this.gamma0 = Math.atan(Math.sin(this.bl * m) / h), this.alpha = Math.asin(a * Math.sin(this.gamma0));
                } else
                    n = this.lat0 >= 0 ? a + Math.sqrt(a * a - 1) : a - Math.sqrt(a * a - 1), this.el = n * Math.pow(r, this.bl), h = 0.5 * (n - 1 / n), this.gamma0 = Math.asin(Math.sin(this.alpha) / a), this.long0 = this.longc - Math.asin(h * Math.tan(this.gamma0)) / this.bl;
                this.uc = this.no_off ? 0 : this.lat0 >= 0 ? this.al / this.bl * Math.atan2(Math.sqrt(a * a - 1), Math.cos(this.alpha)) : -1 * this.al / this.bl * Math.atan2(Math.sqrt(a * a - 1), Math.cos(this.alpha));
            },
            forward: function (t) {
                var i, s, r, a = t.x, n = t.y, h = e.adjust_lon(a - this.long0);
                if (Math.abs(Math.abs(n) - e.HALF_PI) <= e.EPSLN)
                    r = n > 0 ? -1 : 1, s = this.al / this.bl * Math.log(Math.tan(e.FORTPI + 0.5 * r * this.gamma0)), i = -1 * r * e.HALF_PI * this.al / this.bl;
                else {
                    var o = e.tsfnz(this.e, n, Math.sin(n)), u = this.el / Math.pow(o, this.bl), l = 0.5 * (u - 1 / u), f = 0.5 * (u + 1 / u), c = Math.sin(this.bl * h), p = (l * Math.sin(this.gamma0) - c * Math.cos(this.gamma0)) / f;
                    s = Math.abs(Math.abs(p) - 1) <= e.EPSLN ? Number.POSITIVE_INFINITY : 0.5 * this.al * Math.log((1 - p) / (1 + p)) / this.bl, i = Math.abs(Math.cos(this.bl * h)) <= e.EPSLN ? this.al * this.bl * h : this.al * Math.atan2(l * Math.cos(this.gamma0) + c * Math.sin(this.gamma0), Math.cos(this.bl * h)) / this.bl;
                }
                return this.no_rot ? (t.x = this.x0 + i, t.y = this.y0 + s) : (i -= this.uc, t.x = this.x0 + s * Math.cos(this.alpha) + i * Math.sin(this.alpha), t.y = this.y0 + i * Math.cos(this.alpha) - s * Math.sin(this.alpha)), t;
            },
            inverse: function (t) {
                var i, s;
                this.no_rot ? (s = t.y - this.y0, i = t.x - this.x0) : (s = (t.x - this.x0) * Math.cos(this.alpha) - (t.y - this.y0) * Math.sin(this.alpha), i = (t.y - this.y0) * Math.cos(this.alpha) + (t.x - this.x0) * Math.sin(this.alpha), i += this.uc);
                var r = Math.exp(-1 * this.bl * s / this.al), a = 0.5 * (r - 1 / r), n = 0.5 * (r + 1 / r), h = Math.sin(this.bl * i / this.al), o = (h * Math.cos(this.gamma0) + a * Math.sin(this.gamma0)) / n, u = Math.pow(this.el / Math.sqrt((1 + o) / (1 - o)), 1 / this.bl);
                return Math.abs(o - 1) < e.EPSLN ? (t.x = this.long0, t.y = e.HALF_PI) : Math.abs(o + 1) < e.EPSLN ? (t.x = this.long0, t.y = -1 * e.HALF_PI) : (t.y = e.phi2z(this.e, u), t.x = e.adjust_lon(this.long0 - Math.atan2(a * Math.cos(this.gamma0) - h * Math.sin(this.gamma0), Math.cos(this.bl * i / this.al)) / this.bl)), t;
            }
        };
    }), define('proj4/projCode/lcc', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                if (this.lat2 || (this.lat2 = this.lat1), this.k0 || (this.k0 = 1), !(Math.abs(this.lat1 + this.lat2) < e.EPSLN)) {
                    var t = this.b / this.a;
                    this.e = Math.sqrt(1 - t * t);
                    var i = Math.sin(this.lat1), s = Math.cos(this.lat1), r = e.msfnz(this.e, i, s), a = e.tsfnz(this.e, this.lat1, i), n = Math.sin(this.lat2), h = Math.cos(this.lat2), o = e.msfnz(this.e, n, h), u = e.tsfnz(this.e, this.lat2, n), l = e.tsfnz(this.e, this.lat0, Math.sin(this.lat0));
                    this.ns = Math.abs(this.lat1 - this.lat2) > e.EPSLN ? Math.log(r / o) / Math.log(a / u) : i, isNaN(this.ns) && (this.ns = i), this.f0 = r / (this.ns * Math.pow(a, this.ns)), this.rh = this.a * this.f0 * Math.pow(l, this.ns), this.title || (this.title = 'Lambert Conformal Conic');
                }
            },
            forward: function (t) {
                var i = t.x, s = t.y;
                Math.abs(2 * Math.abs(s) - e.PI) <= e.EPSLN && (s = e.sign(s) * (e.HALF_PI - 2 * e.EPSLN));
                var r, a, n = Math.abs(Math.abs(s) - e.HALF_PI);
                if (n > e.EPSLN)
                    r = e.tsfnz(this.e, s, Math.sin(s)), a = this.a * this.f0 * Math.pow(r, this.ns);
                else {
                    if (n = s * this.ns, 0 >= n)
                        return null;
                    a = 0;
                }
                var h = this.ns * e.adjust_lon(i - this.long0);
                return t.x = this.k0 * a * Math.sin(h) + this.x0, t.y = this.k0 * (this.rh - a * Math.cos(h)) + this.y0, t;
            },
            inverse: function (t) {
                var i, s, r, a, n, h = (t.x - this.x0) / this.k0, o = this.rh - (t.y - this.y0) / this.k0;
                this.ns > 0 ? (i = Math.sqrt(h * h + o * o), s = 1) : (i = -Math.sqrt(h * h + o * o), s = -1);
                var u = 0;
                if (0 !== i && (u = Math.atan2(s * h, s * o)), 0 !== i || this.ns > 0) {
                    if (s = 1 / this.ns, r = Math.pow(i / (this.a * this.f0), s), a = e.phi2z(this.e, r), -9999 === a)
                        return null;
                } else
                    a = -e.HALF_PI;
                return n = e.adjust_lon(u / this.ns + this.long0), t.x = n, t.y = a, t;
            }
        };
    }), define('proj4/projCode/krovak', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                this.a = 6377397.155, this.es = 0.006674372230614, this.e = Math.sqrt(this.es), this.lat0 || (this.lat0 = 0.863937979737193), this.long0 || (this.long0 = 0.4334234309119251), this.k0 || (this.k0 = 0.9999), this.s45 = 0.785398163397448, this.s90 = 2 * this.s45, this.fi0 = this.lat0, this.e2 = this.es, this.e = Math.sqrt(this.e2), this.alfa = Math.sqrt(1 + this.e2 * Math.pow(Math.cos(this.fi0), 4) / (1 - this.e2)), this.uq = 1.04216856380474, this.u0 = Math.asin(Math.sin(this.fi0) / this.alfa), this.g = Math.pow((1 + this.e * Math.sin(this.fi0)) / (1 - this.e * Math.sin(this.fi0)), this.alfa * this.e / 2), this.k = Math.tan(this.u0 / 2 + this.s45) / Math.pow(Math.tan(this.fi0 / 2 + this.s45), this.alfa) * this.g, this.k1 = this.k0, this.n0 = this.a * Math.sqrt(1 - this.e2) / (1 - this.e2 * Math.pow(Math.sin(this.fi0), 2)), this.s0 = 1.37008346281555, this.n = Math.sin(this.s0), this.ro0 = this.k1 * this.n0 / Math.tan(this.s0), this.ad = this.s90 - this.uq;
            },
            forward: function (t) {
                var i, s, r, a, n, h, o, u = t.x, l = t.y, f = e.adjust_lon(u - this.long0);
                return i = Math.pow((1 + this.e * Math.sin(l)) / (1 - this.e * Math.sin(l)), this.alfa * this.e / 2), s = 2 * (Math.atan(this.k * Math.pow(Math.tan(l / 2 + this.s45), this.alfa) / i) - this.s45), r = -f * this.alfa, a = Math.asin(Math.cos(this.ad) * Math.sin(s) + Math.sin(this.ad) * Math.cos(s) * Math.cos(r)), n = Math.asin(Math.cos(s) * Math.sin(r) / Math.cos(a)), h = this.n * n, o = this.ro0 * Math.pow(Math.tan(this.s0 / 2 + this.s45), this.n) / Math.pow(Math.tan(a / 2 + this.s45), this.n), t.y = o * Math.cos(h) / 1, t.x = o * Math.sin(h) / 1, this.czech || (t.y *= -1, t.x *= -1), t;
            },
            inverse: function (t) {
                var e, i, s, r, a, n, h, o, u = t.x;
                t.x = t.y, t.y = u, this.czech || (t.y *= -1, t.x *= -1), n = Math.sqrt(t.x * t.x + t.y * t.y), a = Math.atan2(t.y, t.x), r = a / Math.sin(this.s0), s = 2 * (Math.atan(Math.pow(this.ro0 / n, 1 / this.n) * Math.tan(this.s0 / 2 + this.s45)) - this.s45), e = Math.asin(Math.cos(this.ad) * Math.sin(s) - Math.sin(this.ad) * Math.cos(s) * Math.cos(r)), i = Math.asin(Math.cos(s) * Math.sin(r) / Math.cos(e)), t.x = this.long0 - i / this.alfa, h = e, o = 0;
                var l = 0;
                do
                    t.y = 2 * (Math.atan(Math.pow(this.k, -1 / this.alfa) * Math.pow(Math.tan(e / 2 + this.s45), 1 / this.alfa) * Math.pow((1 + this.e * Math.sin(h)) / (1 - this.e * Math.sin(h)), this.e / 2)) - this.s45), Math.abs(h - t.y) < 1e-10 && (o = 1), h = t.y, l += 1;
                while (0 === o && 15 > l);
                return l >= 15 ? null : t;
            }
        };
    }), define('proj4/projCode/cass', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                this.sphere || (this.e0 = e.e0fn(this.es), this.e1 = e.e1fn(this.es), this.e2 = e.e2fn(this.es), this.e3 = e.e3fn(this.es), this.ml0 = this.a * e.mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0));
            },
            forward: function (t) {
                var i, s, r = t.x, a = t.y;
                if (r = e.adjust_lon(r - this.long0), this.sphere)
                    i = this.a * Math.asin(Math.cos(a) * Math.sin(r)), s = this.a * (Math.atan2(Math.tan(a), Math.cos(r)) - this.lat0);
                else {
                    var n = Math.sin(a), h = Math.cos(a), o = e.gN(this.a, this.e, n), u = Math.tan(a) * Math.tan(a), l = r * Math.cos(a), f = l * l, c = this.es * h * h / (1 - this.es), p = this.a * e.mlfn(this.e0, this.e1, this.e2, this.e3, a);
                    i = o * l * (1 - f * u * (1 / 6 - (8 - u + 8 * c) * f / 120)), s = p - this.ml0 + o * n / h * f * (0.5 + (5 - u + 6 * c) * f / 24);
                }
                return t.x = i + this.x0, t.y = s + this.y0, t;
            },
            inverse: function (t) {
                t.x -= this.x0, t.y -= this.y0;
                var i, s, r = t.x / this.a, a = t.y / this.a;
                if (this.sphere) {
                    var n = a + this.lat0;
                    i = Math.asin(Math.sin(n) * Math.cos(r)), s = Math.atan2(Math.tan(r), Math.cos(n));
                } else {
                    var h = this.ml0 / this.a + a, o = e.imlfn(h, this.e0, this.e1, this.e2, this.e3);
                    if (Math.abs(Math.abs(o) - e.HALF_PI) <= e.EPSLN)
                        return t.x = this.long0, t.y = e.HALF_PI, 0 > a && (t.y *= -1), t;
                    var u = e.gN(this.a, this.e, Math.sin(o)), l = u * u * u / this.a / this.a * (1 - this.es), f = Math.pow(Math.tan(o), 2), c = r * this.a / u, p = c * c;
                    i = o - u * Math.tan(o) / l * c * c * (0.5 - (1 + 3 * f) * c * c / 24), s = c * (1 - p * (f / 3 + (1 + 3 * f) * f * p / 15)) / Math.cos(o);
                }
                return t.x = e.adjust_lon(s + this.long0), t.y = e.adjust_lat(i), t;
            }
        };
    }), define('proj4/projCode/laea', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            S_POLE: 1,
            N_POLE: 2,
            EQUIT: 3,
            OBLIQ: 4,
            init: function () {
                var t = Math.abs(this.lat0);
                if (this.mode = Math.abs(t - e.HALF_PI) < e.EPSLN ? this.lat0 < 0 ? this.S_POLE : this.N_POLE : Math.abs(t) < e.EPSLN ? this.EQUIT : this.OBLIQ, this.es > 0) {
                    var i;
                    switch (this.qp = e.qsfnz(this.e, 1), this.mmf = 0.5 / (1 - this.es), this.apa = this.authset(this.es), this.mode) {
                    case this.N_POLE:
                        this.dd = 1;
                        break;
                    case this.S_POLE:
                        this.dd = 1;
                        break;
                    case this.EQUIT:
                        this.rq = Math.sqrt(0.5 * this.qp), this.dd = 1 / this.rq, this.xmf = 1, this.ymf = 0.5 * this.qp;
                        break;
                    case this.OBLIQ:
                        this.rq = Math.sqrt(0.5 * this.qp), i = Math.sin(this.lat0), this.sinb1 = e.qsfnz(this.e, i) / this.qp, this.cosb1 = Math.sqrt(1 - this.sinb1 * this.sinb1), this.dd = Math.cos(this.lat0) / (Math.sqrt(1 - this.es * i * i) * this.rq * this.cosb1), this.ymf = (this.xmf = this.rq) / this.dd, this.xmf *= this.dd;
                    }
                } else
                    this.mode === this.OBLIQ && (this.sinph0 = Math.sin(this.lat0), this.cosph0 = Math.cos(this.lat0));
            },
            forward: function (t) {
                var i, s, r, a, n, h, o, u, l, f, c = t.x, p = t.y;
                if (c = e.adjust_lon(c - this.long0), this.sphere) {
                    if (n = Math.sin(p), f = Math.cos(p), r = Math.cos(c), this.mode === this.OBLIQ || this.mode === this.EQUIT) {
                        if (s = this.mode === this.EQUIT ? 1 + f * r : 1 + this.sinph0 * n + this.cosph0 * f * r, s <= e.EPSLN)
                            return null;
                        s = Math.sqrt(2 / s), i = s * f * Math.sin(c), s *= this.mode === this.EQUIT ? n : this.cosph0 * n - this.sinph0 * f * r;
                    } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
                        if (this.mode === this.N_POLE && (r = -r), Math.abs(p + this.phi0) < e.EPSLN)
                            return null;
                        s = e.FORTPI - 0.5 * p, s = 2 * (this.mode === this.S_POLE ? Math.cos(s) : Math.sin(s)), i = s * Math.sin(c), s *= r;
                    }
                } else {
                    switch (o = 0, u = 0, l = 0, r = Math.cos(c), a = Math.sin(c), n = Math.sin(p), h = e.qsfnz(this.e, n), (this.mode === this.OBLIQ || this.mode === this.EQUIT) && (o = h / this.qp, u = Math.sqrt(1 - o * o)), this.mode) {
                    case this.OBLIQ:
                        l = 1 + this.sinb1 * o + this.cosb1 * u * r;
                        break;
                    case this.EQUIT:
                        l = 1 + u * r;
                        break;
                    case this.N_POLE:
                        l = e.HALF_PI + p, h = this.qp - h;
                        break;
                    case this.S_POLE:
                        l = p - e.HALF_PI, h = this.qp + h;
                    }
                    if (Math.abs(l) < e.EPSLN)
                        return null;
                    switch (this.mode) {
                    case this.OBLIQ:
                    case this.EQUIT:
                        l = Math.sqrt(2 / l), s = this.mode === this.OBLIQ ? this.ymf * l * (this.cosb1 * o - this.sinb1 * u * r) : (l = Math.sqrt(2 / (1 + u * r))) * o * this.ymf, i = this.xmf * l * u * a;
                        break;
                    case this.N_POLE:
                    case this.S_POLE:
                        h >= 0 ? (i = (l = Math.sqrt(h)) * a, s = r * (this.mode === this.S_POLE ? l : -l)) : i = s = 0;
                    }
                }
                return t.x = this.a * i + this.x0, t.y = this.a * s + this.y0, t;
            },
            inverse: function (t) {
                t.x -= this.x0, t.y -= this.y0;
                var i, s, r, a, n, h, o, u = t.x / this.a, l = t.y / this.a;
                if (this.sphere) {
                    var f, c = 0, p = 0;
                    if (f = Math.sqrt(u * u + l * l), s = 0.5 * f, s > 1)
                        return null;
                    switch (s = 2 * Math.asin(s), (this.mode === this.OBLIQ || this.mode === this.EQUIT) && (p = Math.sin(s), c = Math.cos(s)), this.mode) {
                    case this.EQUIT:
                        s = Math.abs(f) <= e.EPSLN ? 0 : Math.asin(l * p / f), u *= p, l = c * f;
                        break;
                    case this.OBLIQ:
                        s = Math.abs(f) <= e.EPSLN ? this.phi0 : Math.asin(c * this.sinph0 + l * p * this.cosph0 / f), u *= p * this.cosph0, l = (c - Math.sin(s) * this.sinph0) * f;
                        break;
                    case this.N_POLE:
                        l = -l, s = e.HALF_PI - s;
                        break;
                    case this.S_POLE:
                        s -= e.HALF_PI;
                    }
                    i = 0 !== l || this.mode !== this.EQUIT && this.mode !== this.OBLIQ ? Math.atan2(u, l) : 0;
                } else {
                    if (o = 0, this.mode === this.OBLIQ || this.mode === this.EQUIT) {
                        if (u /= this.dd, l *= this.dd, h = Math.sqrt(u * u + l * l), h < e.EPSLN)
                            return t.x = 0, t.y = this.phi0, t;
                        a = 2 * Math.asin(0.5 * h / this.rq), r = Math.cos(a), u *= a = Math.sin(a), this.mode === this.OBLIQ ? (o = r * this.sinb1 + l * a * this.cosb1 / h, n = this.qp * o, l = h * this.cosb1 * r - l * this.sinb1 * a) : (o = l * a / h, n = this.qp * o, l = h * r);
                    } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
                        if (this.mode === this.N_POLE && (l = -l), n = u * u + l * l, !n)
                            return t.x = 0, t.y = this.phi0, t;
                        o = 1 - n / this.qp, this.mode === this.S_POLE && (o = -o);
                    }
                    i = Math.atan2(u, l), s = this.authlat(Math.asin(o), this.apa);
                }
                return t.x = e.adjust_lon(this.long0 + i), t.y = s, t;
            },
            P00: 0.3333333333333333,
            P01: 0.17222222222222222,
            P02: 0.10257936507936508,
            P10: 0.06388888888888888,
            P11: 0.0664021164021164,
            P20: 0.016415012942191543,
            authset: function (t) {
                var e, i = [];
                return i[0] = t * this.P00, e = t * t, i[0] += e * this.P01, i[1] = e * this.P10, e *= t, i[0] += e * this.P02, i[1] += e * this.P11, i[2] = e * this.P20, i;
            },
            authlat: function (t, e) {
                var i = t + t;
                return t + e[0] * Math.sin(i) + e[1] * Math.sin(i + i) + e[2] * Math.sin(i + i + i);
            }
        };
    }), define('proj4/projCode/merc', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                var t = this.b / this.a;
                this.es = 1 - t * t, this.e = Math.sqrt(this.es), this.lat_ts ? this.k0 = this.sphere ? Math.cos(this.lat_ts) : e.msfnz(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) : this.k0 || (this.k0 = this.k ? this.k : 1);
            },
            forward: function (t) {
                var i = t.x, s = t.y;
                if (s * e.R2D > 90 && s * e.R2D < -90 && i * e.R2D > 180 && i * e.R2D < -180)
                    return null;
                var r, a;
                if (Math.abs(Math.abs(s) - e.HALF_PI) <= e.EPSLN)
                    return null;
                if (this.sphere)
                    r = this.x0 + this.a * this.k0 * e.adjust_lon(i - this.long0), a = this.y0 + this.a * this.k0 * Math.log(Math.tan(e.FORTPI + 0.5 * s));
                else {
                    var n = Math.sin(s), h = e.tsfnz(this.e, s, n);
                    r = this.x0 + this.a * this.k0 * e.adjust_lon(i - this.long0), a = this.y0 - this.a * this.k0 * Math.log(h);
                }
                return t.x = r, t.y = a, t;
            },
            inverse: function (t) {
                var i, s, r = t.x - this.x0, a = t.y - this.y0;
                if (this.sphere)
                    s = e.HALF_PI - 2 * Math.atan(Math.exp(-a / (this.a * this.k0)));
                else {
                    var n = Math.exp(-a / (this.a * this.k0));
                    if (s = e.phi2z(this.e, n), -9999 === s)
                        return null;
                }
                return i = e.adjust_lon(this.long0 + r / (this.a * this.k0)), t.x = i, t.y = s, t;
            }
        };
    }), define('proj4/projCode/aea', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                Math.abs(this.lat1 + this.lat2) < e.EPSLN || (this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e3 = Math.sqrt(this.es), this.sin_po = Math.sin(this.lat1), this.cos_po = Math.cos(this.lat1), this.t1 = this.sin_po, this.con = this.sin_po, this.ms1 = e.msfnz(this.e3, this.sin_po, this.cos_po), this.qs1 = e.qsfnz(this.e3, this.sin_po, this.cos_po), this.sin_po = Math.sin(this.lat2), this.cos_po = Math.cos(this.lat2), this.t2 = this.sin_po, this.ms2 = e.msfnz(this.e3, this.sin_po, this.cos_po), this.qs2 = e.qsfnz(this.e3, this.sin_po, this.cos_po), this.sin_po = Math.sin(this.lat0), this.cos_po = Math.cos(this.lat0), this.t3 = this.sin_po, this.qs0 = e.qsfnz(this.e3, this.sin_po, this.cos_po), this.ns0 = Math.abs(this.lat1 - this.lat2) > e.EPSLN ? (this.ms1 * this.ms1 - this.ms2 * this.ms2) / (this.qs2 - this.qs1) : this.con, this.c = this.ms1 * this.ms1 + this.ns0 * this.qs1, this.rh = this.a * Math.sqrt(this.c - this.ns0 * this.qs0) / this.ns0);
            },
            forward: function (t) {
                var i = t.x, s = t.y;
                this.sin_phi = Math.sin(s), this.cos_phi = Math.cos(s);
                var r = e.qsfnz(this.e3, this.sin_phi, this.cos_phi), a = this.a * Math.sqrt(this.c - this.ns0 * r) / this.ns0, n = this.ns0 * e.adjust_lon(i - this.long0), h = a * Math.sin(n) + this.x0, o = this.rh - a * Math.cos(n) + this.y0;
                return t.x = h, t.y = o, t;
            },
            inverse: function (t) {
                var i, s, r, a, n, h;
                return t.x -= this.x0, t.y = this.rh - t.y + this.y0, this.ns0 >= 0 ? (i = Math.sqrt(t.x * t.x + t.y * t.y), r = 1) : (i = -Math.sqrt(t.x * t.x + t.y * t.y), r = -1), a = 0, 0 !== i && (a = Math.atan2(r * t.x, r * t.y)), r = i * this.ns0 / this.a, this.sphere ? h = Math.asin((this.c - r * r) / (2 * this.ns0)) : (s = (this.c - r * r) / this.ns0, h = this.phi1z(this.e3, s)), n = e.adjust_lon(a / this.ns0 + this.long0), t.x = n, t.y = h, t;
            },
            phi1z: function (t, i) {
                var s, r, a, n, h, o = e.asinz(0.5 * i);
                if (t < e.EPSLN)
                    return o;
                for (var u = t * t, l = 1; 25 >= l; l++)
                    if (s = Math.sin(o), r = Math.cos(o), a = t * s, n = 1 - a * a, h = 0.5 * n * n / r * (i / (1 - u) - s / n + 0.5 / t * Math.log((1 - a) / (1 + a))), o += h, Math.abs(h) <= 1e-7)
                        return o;
                return null;
            }
        };
    }), define('proj4/projCode/gnom', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                this.sin_p14 = Math.sin(this.lat0), this.cos_p14 = Math.cos(this.lat0), this.infinity_dist = 1000 * this.a, this.rc = 1;
            },
            forward: function (t) {
                var i, s, r, a, n, h, o, u, l = t.x, f = t.y;
                return r = e.adjust_lon(l - this.long0), i = Math.sin(f), s = Math.cos(f), a = Math.cos(r), h = this.sin_p14 * i + this.cos_p14 * s * a, n = 1, h > 0 || Math.abs(h) <= e.EPSLN ? (o = this.x0 + this.a * n * s * Math.sin(r) / h, u = this.y0 + this.a * n * (this.cos_p14 * i - this.sin_p14 * s * a) / h) : (o = this.x0 + this.infinity_dist * s * Math.sin(r), u = this.y0 + this.infinity_dist * (this.cos_p14 * i - this.sin_p14 * s * a)), t.x = o, t.y = u, t;
            },
            inverse: function (t) {
                var i, s, r, a, n, h;
                return t.x = (t.x - this.x0) / this.a, t.y = (t.y - this.y0) / this.a, t.x /= this.k0, t.y /= this.k0, (i = Math.sqrt(t.x * t.x + t.y * t.y)) ? (a = Math.atan2(i, this.rc), s = Math.sin(a), r = Math.cos(a), h = e.asinz(r * this.sin_p14 + t.y * s * this.cos_p14 / i), n = Math.atan2(t.x * s, i * this.cos_p14 * r - t.y * this.sin_p14 * s), n = e.adjust_lon(this.long0 + n)) : (h = this.phic0, n = 0), t.x = n, t.y = h, t;
            }
        };
    }), define('proj4/projCode/cea', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                this.sphere || (this.k0 = e.msfnz(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)));
            },
            forward: function (t) {
                var i, s, r = t.x, a = t.y, n = e.adjust_lon(r - this.long0);
                if (this.sphere)
                    i = this.x0 + this.a * n * Math.cos(this.lat_ts), s = this.y0 + this.a * Math.sin(a) / Math.cos(this.lat_ts);
                else {
                    var h = e.qsfnz(this.e, Math.sin(a));
                    i = this.x0 + this.a * this.k0 * n, s = this.y0 + 0.5 * this.a * h / this.k0;
                }
                return t.x = i, t.y = s, t;
            },
            inverse: function (t) {
                t.x -= this.x0, t.y -= this.y0;
                var i, s;
                return this.sphere ? (i = e.adjust_lon(this.long0 + t.x / this.a / Math.cos(this.lat_ts)), s = Math.asin(t.y / this.a * Math.cos(this.lat_ts))) : (s = e.iqsfnz(this.e, 2 * t.y * this.k0 / this.a), i = e.adjust_lon(this.long0 + t.x / (this.a * this.k0))), t.x = i, t.y = s, t;
            }
        };
    }), define('proj4/projCode/eqc', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.lat_ts = this.lat_t || 0, this.title = this.title || 'Equidistant Cylindrical (Plate Carre)', this.rc = Math.cos(this.lat_ts);
            },
            forward: function (t) {
                var i = t.x, s = t.y, r = e.adjust_lon(i - this.long0), a = e.adjust_lat(s - this.lat0);
                return t.x = this.x0 + this.a * r * this.rc, t.y = this.y0 + this.a * a, t;
            },
            inverse: function (t) {
                var i = t.x, s = t.y;
                return t.x = e.adjust_lon(this.long0 + (i - this.x0) / (this.a * this.rc)), t.y = e.adjust_lat(this.lat0 + (s - this.y0) / this.a), t;
            }
        };
    }), define('proj4/projCode/poly', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e = Math.sqrt(this.es), this.e0 = e.e0fn(this.es), this.e1 = e.e1fn(this.es), this.e2 = e.e2fn(this.es), this.e3 = e.e3fn(this.es), this.ml0 = this.a * e.mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0);
            },
            forward: function (t) {
                var i, s, r, a = t.x, n = t.y, h = e.adjust_lon(a - this.long0);
                if (r = h * Math.sin(n), this.sphere)
                    Math.abs(n) <= e.EPSLN ? (i = this.a * h, s = -1 * this.a * this.lat0) : (i = this.a * Math.sin(r) / Math.tan(n), s = this.a * (e.adjust_lat(n - this.lat0) + (1 - Math.cos(r)) / Math.tan(n)));
                else if (Math.abs(n) <= e.EPSLN)
                    i = this.a * h, s = -1 * this.ml0;
                else {
                    var o = e.gN(this.a, this.e, Math.sin(n)) / Math.tan(n);
                    i = o * Math.sin(r), s = this.a * e.mlfn(this.e0, this.e1, this.e2, this.e3, n) - this.ml0 + o * (1 - Math.cos(r));
                }
                return t.x = i + this.x0, t.y = s + this.y0, t;
            },
            inverse: function (t) {
                var i, s, r, a, n, h, o, u, l;
                if (r = t.x - this.x0, a = t.y - this.y0, this.sphere)
                    if (Math.abs(a + this.a * this.lat0) <= e.EPSLN)
                        i = e.adjust_lon(r / this.a + this.long0), s = 0;
                    else {
                        h = this.lat0 + a / this.a, o = r * r / this.a / this.a + h * h, u = h;
                        var f;
                        for (n = e.MAX_ITER; n; --n)
                            if (f = Math.tan(u), l = -1 * (h * (u * f + 1) - u - 0.5 * (u * u + o) * f) / ((u - h) / f - 1), u += l, Math.abs(l) <= e.EPSLN) {
                                s = u;
                                break;
                            }
                        i = e.adjust_lon(this.long0 + Math.asin(r * Math.tan(u) / this.a) / Math.sin(s));
                    }
                else if (Math.abs(a + this.ml0) <= e.EPSLN)
                    s = 0, i = e.adjust_lon(this.long0 + r / this.a);
                else {
                    h = (this.ml0 + a) / this.a, o = r * r / this.a / this.a + h * h, u = h;
                    var c, p, d, m, y;
                    for (n = e.MAX_ITER; n; --n)
                        if (y = this.e * Math.sin(u), c = Math.sqrt(1 - y * y) * Math.tan(u), p = this.a * e.mlfn(this.e0, this.e1, this.e2, this.e3, u), d = this.e0 - 2 * this.e1 * Math.cos(2 * u) + 4 * this.e2 * Math.cos(4 * u) - 6 * this.e3 * Math.cos(6 * u), m = p / this.a, l = (h * (c * m + 1) - m - 0.5 * c * (m * m + o)) / (this.es * Math.sin(2 * u) * (m * m + o - 2 * h * m) / (4 * c) + (h - m) * (c * d - 2 / Math.sin(2 * u)) - d), u -= l, Math.abs(l) <= e.EPSLN) {
                            s = u;
                            break;
                        }
                    c = Math.sqrt(1 - this.es * Math.pow(Math.sin(s), 2)) * Math.tan(s), i = e.adjust_lon(this.long0 + Math.asin(r * c / this.a) / Math.sin(s));
                }
                return t.x = i, t.y = s, t;
            }
        };
    }), define('proj4/projCode/nzmg', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            iterations: 1,
            init: function () {
                this.A = [], this.A[1] = 0.6399175073, this.A[2] = -0.1358797613, this.A[3] = 0.063294409, this.A[4] = -0.02526853, this.A[5] = 0.0117879, this.A[6] = -0.0055161, this.A[7] = 0.0026906, this.A[8] = -0.001333, this.A[9] = 0.00067, this.A[10] = -0.00034, this.B_re = [], this.B_im = [], this.B_re[1] = 0.7557853228, this.B_im[1] = 0, this.B_re[2] = 0.249204646, this.B_im[2] = 0.003371507, this.B_re[3] = -0.001541739, this.B_im[3] = 0.04105856, this.B_re[4] = -0.10162907, this.B_im[4] = 0.01727609, this.B_re[5] = -0.26623489, this.B_im[5] = -0.36249218, this.B_re[6] = -0.6870983, this.B_im[6] = -1.1651967, this.C_re = [], this.C_im = [], this.C_re[1] = 1.3231270439, this.C_im[1] = 0, this.C_re[2] = -0.577245789, this.C_im[2] = -0.007809598, this.C_re[3] = 0.508307513, this.C_im[3] = -0.112208952, this.C_re[4] = -0.15094762, this.C_im[4] = 0.18200602, this.C_re[5] = 1.01418179, this.C_im[5] = 1.64497696, this.C_re[6] = 1.9660549, this.C_im[6] = 2.5127645, this.D = [], this.D[1] = 1.5627014243, this.D[2] = 0.5185406398, this.D[3] = -0.03333098, this.D[4] = -0.1052906, this.D[5] = -0.0368594, this.D[6] = 0.007317, this.D[7] = 0.0122, this.D[8] = 0.00394, this.D[9] = -0.0013;
            },
            forward: function (t) {
                var i, s = t.x, r = t.y, a = r - this.lat0, n = s - this.long0, h = 0.00001 * (a / e.SEC_TO_RAD), o = n, u = 1, l = 0;
                for (i = 1; 10 >= i; i++)
                    u *= h, l += this.A[i] * u;
                var f, c, p = l, d = o, m = 1, y = 0, M = 0, g = 0;
                for (i = 1; 6 >= i; i++)
                    f = m * p - y * d, c = y * p + m * d, m = f, y = c, M = M + this.B_re[i] * m - this.B_im[i] * y, g = g + this.B_im[i] * m + this.B_re[i] * y;
                return t.x = g * this.a + this.x0, t.y = M * this.a + this.y0, t;
            },
            inverse: function (t) {
                var i, s, r, a = t.x, n = t.y, h = a - this.x0, o = n - this.y0, u = o / this.a, l = h / this.a, f = 1, c = 0, p = 0, d = 0;
                for (i = 1; 6 >= i; i++)
                    s = f * u - c * l, r = c * u + f * l, f = s, c = r, p = p + this.C_re[i] * f - this.C_im[i] * c, d = d + this.C_im[i] * f + this.C_re[i] * c;
                for (var m = 0; m < this.iterations; m++) {
                    var y, M, g = p, _ = d, b = u, v = l;
                    for (i = 2; 6 >= i; i++)
                        y = g * p - _ * d, M = _ * p + g * d, g = y, _ = M, b += (i - 1) * (this.B_re[i] * g - this.B_im[i] * _), v += (i - 1) * (this.B_im[i] * g + this.B_re[i] * _);
                    g = 1, _ = 0;
                    var j = this.B_re[1], x = this.B_im[1];
                    for (i = 2; 6 >= i; i++)
                        y = g * p - _ * d, M = _ * p + g * d, g = y, _ = M, j += i * (this.B_re[i] * g - this.B_im[i] * _), x += i * (this.B_im[i] * g + this.B_re[i] * _);
                    var A = j * j + x * x;
                    p = (b * j + v * x) / A, d = (v * j - b * x) / A;
                }
                var C = p, w = d, S = 1, I = 0;
                for (i = 1; 9 >= i; i++)
                    S *= C, I += this.D[i] * S;
                var P = this.lat0 + 100000 * I * e.SEC_TO_RAD, E = this.long0 + w;
                return t.x = E, t.y = P, t;
            }
        };
    }), define('proj4/projCode/mill', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
            },
            forward: function (t) {
                var i = t.x, s = t.y, r = e.adjust_lon(i - this.long0), a = this.x0 + this.a * r, n = this.y0 + 1.25 * this.a * Math.log(Math.tan(e.PI / 4 + s / 2.5));
                return t.x = a, t.y = n, t;
            },
            inverse: function (t) {
                t.x -= this.x0, t.y -= this.y0;
                var i = e.adjust_lon(this.long0 + t.x / this.a), s = 2.5 * (Math.atan(Math.exp(0.8 * t.y / this.a)) - e.PI / 4);
                return t.x = i, t.y = s, t;
            }
        };
    }), define('proj4/projCode/sinu', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                this.sphere ? (this.n = 1, this.m = 0, this.es = 0, this.C_y = Math.sqrt((this.m + 1) / this.n), this.C_x = this.C_y / (this.m + 1)) : this.en = e.pj_enfn(this.es);
            },
            forward: function (t) {
                var i, s, r = t.x, a = t.y;
                if (r = e.adjust_lon(r - this.long0), this.sphere) {
                    if (this.m)
                        for (var n = this.n * Math.sin(a), h = e.MAX_ITER; h; --h) {
                            var o = (this.m * a + Math.sin(a) - n) / (this.m + Math.cos(a));
                            if (a -= o, Math.abs(o) < e.EPSLN)
                                break;
                        }
                    else
                        a = 1 !== this.n ? Math.asin(this.n * Math.sin(a)) : a;
                    i = this.a * this.C_x * r * (this.m + Math.cos(a)), s = this.a * this.C_y * a;
                } else {
                    var u = Math.sin(a), l = Math.cos(a);
                    s = this.a * e.pj_mlfn(a, u, l, this.en), i = this.a * r * l / Math.sqrt(1 - this.es * u * u);
                }
                return t.x = i, t.y = s, t;
            },
            inverse: function (t) {
                var i, s, r;
                if (t.x -= this.x0, t.y -= this.y0, i = t.y / this.a, this.sphere)
                    t.y /= this.C_y, i = this.m ? Math.asin((this.m * t.y + Math.sin(t.y)) / this.n) : 1 !== this.n ? Math.asin(Math.sin(t.y) / this.n) : t.y, r = t.x / (this.C_x * (this.m + Math.cos(t.y)));
                else {
                    i = e.pj_inv_mlfn(t.y / this.a, this.es, this.en);
                    var a = Math.abs(i);
                    a < e.HALF_PI ? (a = Math.sin(i), s = this.long0 + t.x * Math.sqrt(1 - this.es * a * a) / (this.a * Math.cos(i)), r = e.adjust_lon(s)) : a - e.EPSLN < e.HALF_PI && (r = this.long0);
                }
                return t.x = r, t.y = i, t;
            }
        };
    }), define('proj4/projCode/moll', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
            },
            forward: function (t) {
                for (var i = t.x, s = t.y, r = e.adjust_lon(i - this.long0), a = s, n = e.PI * Math.sin(s), h = 0; !0; h++) {
                    var o = -(a + Math.sin(a) - n) / (1 + Math.cos(a));
                    if (a += o, Math.abs(o) < e.EPSLN)
                        break;
                }
                a /= 2, e.PI / 2 - Math.abs(s) < e.EPSLN && (r = 0);
                var u = 0.900316316158 * this.a * r * Math.cos(a) + this.x0, l = 1.4142135623731 * this.a * Math.sin(a) + this.y0;
                return t.x = u, t.y = l, t;
            },
            inverse: function (t) {
                var i, s;
                t.x -= this.x0, t.y -= this.y0, s = t.y / (1.4142135623731 * this.a), Math.abs(s) > 0.999999999999 && (s = 0.999999999999), i = Math.asin(s);
                var r = e.adjust_lon(this.long0 + t.x / (0.900316316158 * this.a * Math.cos(i)));
                r < -e.PI && (r = -e.PI), r > e.PI && (r = e.PI), s = (2 * i + Math.sin(2 * i)) / e.PI, Math.abs(s) > 1 && (s = 1);
                var a = Math.asin(s);
                return t.x = r, t.y = a, t;
            }
        };
    }), define('proj4/projCode/eqdc', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                return Math.abs(this.lat1 + this.lat2) < e.EPSLN ? (e.reportError('eqdc:init: Equal Latitudes'), void 0) : (this.lat2 = this.lat2 || this.lat1, this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e = Math.sqrt(this.es), this.e0 = e.e0fn(this.es), this.e1 = e.e1fn(this.es), this.e2 = e.e2fn(this.es), this.e3 = e.e3fn(this.es), this.sinphi = Math.sin(this.lat1), this.cosphi = Math.cos(this.lat1), this.ms1 = e.msfnz(this.e, this.sinphi, this.cosphi), this.ml1 = e.mlfn(this.e0, this.e1, this.e2, this.e3, this.lat1), Math.abs(this.lat1 - this.lat2) < e.EPSLN ? this.ns = this.sinphi : (this.sinphi = Math.sin(this.lat2), this.cosphi = Math.cos(this.lat2), this.ms2 = e.msfnz(this.e, this.sinphi, this.cosphi), this.ml2 = e.mlfn(this.e0, this.e1, this.e2, this.e3, this.lat2), this.ns = (this.ms1 - this.ms2) / (this.ml2 - this.ml1)), this.g = this.ml1 + this.ms1 / this.ns, this.ml0 = e.mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0), this.rh = this.a * (this.g - this.ml0), void 0);
            },
            forward: function (t) {
                var i, s = t.x, r = t.y;
                if (this.sphere)
                    i = this.a * (this.g - r);
                else {
                    var a = e.mlfn(this.e0, this.e1, this.e2, this.e3, r);
                    i = this.a * (this.g - a);
                }
                var n = this.ns * e.adjust_lon(s - this.long0), h = this.x0 + i * Math.sin(n), o = this.y0 + this.rh - i * Math.cos(n);
                return t.x = h, t.y = o, t;
            },
            inverse: function (t) {
                t.x -= this.x0, t.y = this.rh - t.y + this.y0;
                var i, s, r, a;
                this.ns >= 0 ? (s = Math.sqrt(t.x * t.x + t.y * t.y), i = 1) : (s = -Math.sqrt(t.x * t.x + t.y * t.y), i = -1);
                var n = 0;
                if (0 !== s && (n = Math.atan2(i * t.x, i * t.y)), this.sphere)
                    return a = e.adjust_lon(this.long0 + n / this.ns), r = e.adjust_lat(this.g - s / this.a), t.x = a, t.y = r, t;
                var h = this.g - s / this.a;
                return r = e.imlfn(h, this.e0, this.e1, this.e2, this.e3), a = e.adjust_lon(this.long0 + n / this.ns), t.x = a, t.y = r, t;
            }
        };
    }), define('proj4/projCode/vandg', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                this.R = this.a;
            },
            forward: function (t) {
                var i, s, r = t.x, a = t.y, n = e.adjust_lon(r - this.long0);
                Math.abs(a) <= e.EPSLN && (i = this.x0 + this.R * n, s = this.y0);
                var h = e.asinz(2 * Math.abs(a / e.PI));
                (Math.abs(n) <= e.EPSLN || Math.abs(Math.abs(a) - e.HALF_PI) <= e.EPSLN) && (i = this.x0, s = a >= 0 ? this.y0 + e.PI * this.R * Math.tan(0.5 * h) : this.y0 + e.PI * this.R * -Math.tan(0.5 * h));
                var o = 0.5 * Math.abs(e.PI / n - n / e.PI), u = o * o, l = Math.sin(h), f = Math.cos(h), c = f / (l + f - 1), p = c * c, d = c * (2 / l - 1), m = d * d, y = e.PI * this.R * (o * (c - m) + Math.sqrt(u * (c - m) * (c - m) - (m + u) * (p - m))) / (m + u);
                0 > n && (y = -y), i = this.x0 + y;
                var M = u + c;
                return y = e.PI * this.R * (d * M - o * Math.sqrt((m + u) * (u + 1) - M * M)) / (m + u), s = a >= 0 ? this.y0 + y : this.y0 - y, t.x = i, t.y = s, t;
            },
            inverse: function (t) {
                var i, s, r, a, n, h, o, u, l, f, c, p, d;
                return t.x -= this.x0, t.y -= this.y0, c = e.PI * this.R, r = t.x / c, a = t.y / c, n = r * r + a * a, h = -Math.abs(a) * (1 + n), o = h - 2 * a * a + r * r, u = -2 * h + 1 + 2 * a * a + n * n, d = a * a / u + (2 * o * o * o / u / u / u - 9 * h * o / u / u) / 27, l = (h - o * o / 3 / u) / u, f = 2 * Math.sqrt(-l / 3), c = 3 * d / l / f, Math.abs(c) > 1 && (c = c >= 0 ? 1 : -1), p = Math.acos(c) / 3, s = t.y >= 0 ? (-f * Math.cos(p + e.PI / 3) - o / 3 / u) * e.PI : -(-f * Math.cos(p + e.PI / 3) - o / 3 / u) * e.PI, i = Math.abs(r) < e.EPSLN ? this.long0 : e.adjust_lon(this.long0 + e.PI * (n - 1 + Math.sqrt(1 + 2 * (r * r - a * a) + n * n)) / 2 / r), t.x = i, t.y = s, t;
            }
        };
    }), define('proj4/projCode/aeqd', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return {
            init: function () {
                this.sin_p12 = Math.sin(this.lat0), this.cos_p12 = Math.cos(this.lat0);
            },
            forward: function (t) {
                var i, s, r, a, n, h, o, u, l, f, c, p, d, m, y, M, g, _, b, v, j, x, A, C = t.x, w = t.y, S = Math.sin(t.y), I = Math.cos(t.y), P = e.adjust_lon(C - this.long0);
                return this.sphere ? Math.abs(this.sin_p12 - 1) <= e.EPSLN ? (t.x = this.x0 + this.a * (e.HALF_PI - w) * Math.sin(P), t.y = this.y0 - this.a * (e.HALF_PI - w) * Math.cos(P), t) : Math.abs(this.sin_p12 + 1) <= e.EPSLN ? (t.x = this.x0 + this.a * (e.HALF_PI + w) * Math.sin(P), t.y = this.y0 + this.a * (e.HALF_PI + w) * Math.cos(P), t) : (_ = this.sin_p12 * S + this.cos_p12 * I * Math.cos(P), M = Math.acos(_), g = M / Math.sin(M), t.x = this.x0 + this.a * g * I * Math.sin(P), t.y = this.y0 + this.a * g * (this.cos_p12 * S - this.sin_p12 * I * Math.cos(P)), t) : (i = e.e0fn(this.es), s = e.e1fn(this.es), r = e.e2fn(this.es), a = e.e3fn(this.es), Math.abs(this.sin_p12 - 1) <= e.EPSLN ? (n = this.a * e.mlfn(i, s, r, a, e.HALF_PI), h = this.a * e.mlfn(i, s, r, a, w), t.x = this.x0 + (n - h) * Math.sin(P), t.y = this.y0 - (n - h) * Math.cos(P), t) : Math.abs(this.sin_p12 + 1) <= e.EPSLN ? (n = this.a * e.mlfn(i, s, r, a, e.HALF_PI), h = this.a * e.mlfn(i, s, r, a, w), t.x = this.x0 + (n + h) * Math.sin(P), t.y = this.y0 + (n + h) * Math.cos(P), t) : (o = S / I, u = e.gN(this.a, this.e, this.sin_p12), l = e.gN(this.a, this.e, S), f = Math.atan((1 - this.es) * o + this.es * u * this.sin_p12 / (l * I)), c = Math.atan2(Math.sin(P), this.cos_p12 * Math.tan(f) - this.sin_p12 * Math.cos(P)), b = 0 === c ? Math.asin(this.cos_p12 * Math.sin(f) - this.sin_p12 * Math.cos(f)) : Math.abs(Math.abs(c) - e.PI) <= e.EPSLN ? -Math.asin(this.cos_p12 * Math.sin(f) - this.sin_p12 * Math.cos(f)) : Math.asin(Math.sin(P) * Math.cos(f) / Math.sin(c)), p = this.e * this.sin_p12 / Math.sqrt(1 - this.es), d = this.e * this.cos_p12 * Math.cos(c) / Math.sqrt(1 - this.es), m = p * d, y = d * d, v = b * b, j = v * b, x = j * b, A = x * b, M = u * b * (1 - v * y * (1 - y) / 6 + j / 8 * m * (1 - 2 * y) + x / 120 * (y * (4 - 7 * y) - 3 * p * p * (1 - 7 * y)) - A / 48 * m), t.x = this.x0 + M * Math.sin(c), t.y = this.y0 + M * Math.cos(c), t));
            },
            inverse: function (t) {
                t.x -= this.x0, t.y -= this.y0;
                var i, s, r, a, n, h, o, u, l, f, c, p, d, m, y, M, g, _, b, v, j, x, A;
                if (this.sphere) {
                    if (i = Math.sqrt(t.x * t.x + t.y * t.y), i > 2 * e.HALF_PI * this.a)
                        return;
                    return s = i / this.a, r = Math.sin(s), a = Math.cos(s), n = this.long0, Math.abs(i) <= e.EPSLN ? h = this.lat0 : (h = e.asinz(a * this.sin_p12 + t.y * r * this.cos_p12 / i), o = Math.abs(this.lat0) - e.HALF_PI, n = Math.abs(o) <= e.EPSLN ? this.lat0 >= 0 ? e.adjust_lon(this.long0 + Math.atan2(t.x, -t.y)) : e.adjust_lon(this.long0 - Math.atan2(-t.x, t.y)) : e.adjust_lon(this.long0 + Math.atan2(t.x * r, i * this.cos_p12 * a - t.y * this.sin_p12 * r))), t.x = n, t.y = h, t;
                }
                return u = e.e0fn(this.es), l = e.e1fn(this.es), f = e.e2fn(this.es), c = e.e3fn(this.es), Math.abs(this.sin_p12 - 1) <= e.EPSLN ? (p = this.a * e.mlfn(u, l, f, c, e.HALF_PI), i = Math.sqrt(t.x * t.x + t.y * t.y), d = p - i, h = e.imlfn(d / this.a, u, l, f, c), n = e.adjust_lon(this.long0 + Math.atan2(t.x, -1 * t.y)), t.x = n, t.y = h, t) : Math.abs(this.sin_p12 + 1) <= e.EPSLN ? (p = this.a * e.mlfn(u, l, f, c, e.HALF_PI), i = Math.sqrt(t.x * t.x + t.y * t.y), d = i - p, h = e.imlfn(d / this.a, u, l, f, c), n = e.adjust_lon(this.long0 + Math.atan2(t.x, t.y)), t.x = n, t.y = h, t) : (i = Math.sqrt(t.x * t.x + t.y * t.y), M = Math.atan2(t.x, t.y), m = e.gN(this.a, this.e, this.sin_p12), g = Math.cos(M), _ = this.e * this.cos_p12 * g, b = -_ * _ / (1 - this.es), v = 3 * this.es * (1 - b) * this.sin_p12 * this.cos_p12 * g / (1 - this.es), j = i / m, x = j - b * (1 + b) * Math.pow(j, 3) / 6 - v * (1 + 3 * b) * Math.pow(j, 4) / 24, A = 1 - b * x * x / 2 - j * x * x * x / 6, y = Math.asin(this.sin_p12 * Math.cos(x) + this.cos_p12 * Math.sin(x) * g), n = e.adjust_lon(this.long0 + Math.asin(Math.sin(M) * Math.sin(x) / Math.cos(y))), h = Math.atan((1 - this.es * A * this.sin_p12 / Math.sin(y)) * Math.tan(y) / (1 - this.es)), t.x = n, t.y = h, t);
            }
        };
    }), define('proj4/projections', [
        'require',
        'exports',
        'module',
        'proj4/projCode/longlat',
        'proj4/projCode/tmerc',
        'proj4/projCode/utm',
        'proj4/projCode/sterea',
        'proj4/projCode/somerc',
        'proj4/projCode/omerc',
        'proj4/projCode/lcc',
        'proj4/projCode/krovak',
        'proj4/projCode/cass',
        'proj4/projCode/laea',
        'proj4/projCode/merc',
        'proj4/projCode/aea',
        'proj4/projCode/gnom',
        'proj4/projCode/cea',
        'proj4/projCode/eqc',
        'proj4/projCode/poly',
        'proj4/projCode/nzmg',
        'proj4/projCode/mill',
        'proj4/projCode/sinu',
        'proj4/projCode/moll',
        'proj4/projCode/eqdc',
        'proj4/projCode/vandg',
        'proj4/projCode/aeqd',
        'proj4/projCode/longlat'
    ], function (t, e) {
        e.longlat = t('proj4/projCode/longlat'), e.identity = e.longlat, e.tmerc = t('proj4/projCode/tmerc'), e.utm = t('proj4/projCode/utm'), e.sterea = t('proj4/projCode/sterea'), e.somerc = t('proj4/projCode/somerc'), e.omerc = t('proj4/projCode/omerc'), e.lcc = t('proj4/projCode/lcc'), e.krovak = t('proj4/projCode/krovak'), e.cass = t('proj4/projCode/cass'), e.laea = t('proj4/projCode/laea'), e.merc = t('proj4/projCode/merc'), e.aea = t('proj4/projCode/aea'), e.gnom = t('proj4/projCode/gnom'), e.cea = t('proj4/projCode/cea'), e.eqc = t('proj4/projCode/eqc'), e.poly = t('proj4/projCode/poly'), e.nzmg = t('proj4/projCode/nzmg'), e.mill = t('proj4/projCode/mill'), e.sinu = t('proj4/projCode/sinu'), e.moll = t('proj4/projCode/moll'), e.eqdc = t('proj4/projCode/eqdc'), e.vandg = t('proj4/projCode/vandg'), e.aeqd = t('proj4/projCode/aeqd'), e.longlat = t('proj4/projCode/longlat'), e.identity = e.longlat;
    }), define('proj4/Proj', [
        'require',
        'proj4/extend',
        'proj4/common',
        'proj4/defs',
        'proj4/constants',
        'proj4/datum',
        'proj4/projections',
        'proj4/wkt',
        'proj4/projString'
    ], function (t) {
        var e = t('proj4/extend'), i = t('proj4/common'), s = t('proj4/defs'), r = t('proj4/constants'), a = t('proj4/datum'), n = t('proj4/projections'), h = t('proj4/wkt'), o = t('proj4/projString'), u = function l(t) {
                if (!(this instanceof l))
                    return new l(t);
                this.srsCodeInput = t;
                var i;
                'string' == typeof t ? t in s ? (this.deriveConstants(s[t]), e(this, s[t])) : t.indexOf('GEOGCS') >= 0 || t.indexOf('GEOCCS') >= 0 || t.indexOf('PROJCS') >= 0 || t.indexOf('LOCAL_CS') >= 0 ? (i = h(t), this.deriveConstants(i), e(this, i)) : '+' === t[0] && (i = o(t), this.deriveConstants(i), e(this, i)) : (this.deriveConstants(t), e(this, t)), this.initTransforms(this.projName);
            };
        return u.prototype = {
            initTransforms: function (t) {
                if (!(t in u.projections))
                    throw 'unknown projection ' + t;
                e(this, u.projections[t]), this.init();
            },
            deriveConstants: function (t) {
                if (t.nadgrids && 0 === t.nadgrids.length && (t.nadgrids = null), t.nadgrids) {
                    t.grids = t.nadgrids.split(',');
                    var s = null, n = t.grids.length;
                    if (n > 0)
                        for (var h = 0; n > h; h++) {
                            s = t.grids[h];
                            var o = s.split('@');
                            '' !== o[o.length - 1] && (t.grids[h] = {
                                mandatory: 1 === o.length,
                                name: o[o.length - 1],
                                grid: r.grids[o[o.length - 1]]
                            }, t.grids[h].mandatory && !t.grids[h].grid);
                        }
                }
                if (t.datumCode && 'none' !== t.datumCode) {
                    var u = r.Datum[t.datumCode];
                    u && (t.datum_params = u.towgs84 ? u.towgs84.split(',') : null, t.ellps = u.ellipse, t.datumName = u.datumName ? u.datumName : t.datumCode);
                }
                if (!t.a) {
                    var l = r.Ellipsoid[t.ellps] ? r.Ellipsoid[t.ellps] : r.Ellipsoid.WGS84;
                    e(t, l);
                }
                t.rf && !t.b && (t.b = (1 - 1 / t.rf) * t.a), (0 === t.rf || Math.abs(t.a - t.b) < i.EPSLN) && (t.sphere = !0, t.b = t.a), t.a2 = t.a * t.a, t.b2 = t.b * t.b, t.es = (t.a2 - t.b2) / t.a2, t.e = Math.sqrt(t.es), t.R_A && (t.a *= 1 - t.es * (i.SIXTH + t.es * (i.RA4 + t.es * i.RA6)), t.a2 = t.a * t.a, t.b2 = t.b * t.b, t.es = 0), t.ep2 = (t.a2 - t.b2) / t.b2, t.k0 || (t.k0 = 1), t.axis || (t.axis = 'enu'), t.datum = a(t);
            }
        }, u.projections = n, u;
    }), define('proj4/datum_transform', [
        'require',
        'proj4/common'
    ], function (t) {
        var e = t('proj4/common');
        return function (t, i, s) {
            function r(t) {
                return t === e.PJD_3PARAM || t === e.PJD_7PARAM;
            }
            var a, n, h;
            if (t.compare_datums(i))
                return s;
            if (t.datum_type === e.PJD_NODATUM || i.datum_type === e.PJD_NODATUM)
                return s;
            var o = t.a, u = t.es, l = i.a, f = i.es, c = t.datum_type;
            if (c === e.PJD_GRIDSHIFT)
                if (0 === this.apply_gridshift(t, 0, s))
                    t.a = e.SRS_WGS84_SEMIMAJOR, t.es = e.SRS_WGS84_ESQUARED;
                else {
                    if (!t.datum_params)
                        return t.a = o, t.es = t.es, s;
                    for (a = 1, n = 0, h = t.datum_params.length; h > n; n++)
                        a *= t.datum_params[n];
                    if (0 === a)
                        return t.a = o, t.es = t.es, s;
                    c = t.datum_params.length > 3 ? e.PJD_7PARAM : e.PJD_3PARAM;
                }
            return i.datum_type === e.PJD_GRIDSHIFT && (i.a = e.SRS_WGS84_SEMIMAJOR, i.es = e.SRS_WGS84_ESQUARED), (t.es !== i.es || t.a !== i.a || r(c) || r(i.datum_type)) && (t.geodetic_to_geocentric(s), r(t.datum_type) && t.geocentric_to_wgs84(s), r(i.datum_type) && i.geocentric_from_wgs84(s), i.geocentric_to_geodetic(s)), i.datum_type === e.PJD_GRIDSHIFT && this.apply_gridshift(i, 1, s), t.a = o, t.es = u, i.a = l, i.es = f, s;
        };
    }), define('proj4/adjust_axis', [], function () {
        return function (t, e, i) {
            var s, r, a, n = i.x, h = i.y, o = i.z || 0;
            for (a = 0; 3 > a; a++)
                if (!e || 2 !== a || void 0 !== i.z)
                    switch (0 === a ? (s = n, r = 'x') : 1 === a ? (s = h, r = 'y') : (s = o, r = 'z'), t.axis[a]) {
                    case 'e':
                        i[r] = s;
                        break;
                    case 'w':
                        i[r] = -s;
                        break;
                    case 'n':
                        i[r] = s;
                        break;
                    case 's':
                        i[r] = -s;
                        break;
                    case 'u':
                        void 0 !== i[r] && (i.z = s);
                        break;
                    case 'd':
                        void 0 !== i[r] && (i.z = -s);
                        break;
                    default:
                        return null;
                    }
            return i;
        };
    }), define('proj4/transform', [
        'require',
        'proj4/common',
        'proj4/datum_transform',
        'proj4/adjust_axis',
        'proj4/Proj'
    ], function (t) {
        var e = t('proj4/common'), i = t('proj4/datum_transform'), s = t('proj4/adjust_axis'), r = t('proj4/Proj');
        return function (t, a, n) {
            function h(t, i) {
                return (t.datum.datum_type === e.PJD_3PARAM || t.datum.datum_type === e.PJD_7PARAM) && 'WGS84' !== i.datumCode;
            }
            var o;
            return t.datum && a.datum && (h(t, a) || h(a, t)) && (o = new r('WGS84'), this.transform(t, o, n), t = o), 'enu' !== t.axis && s(t, !1, n), 'longlat' === t.projName ? (n.x *= e.D2R, n.y *= e.D2R) : (t.to_meter && (n.x *= t.to_meter, n.y *= t.to_meter), t.inverse(n)), t.from_greenwich && (n.x += t.from_greenwich), n = i(t.datum, a.datum, n), a.from_greenwich && (n.x -= a.from_greenwich), 'longlat' === a.projName ? (n.x *= e.R2D, n.y *= e.R2D) : (a.forward(n), a.to_meter && (n.x /= a.to_meter, n.y /= a.to_meter)), 'enu' !== a.axis && s(a, !0, n), n;
        };
    }), define('proj4/core', [
        'require',
        'proj4/Point',
        'proj4/Proj',
        'proj4/transform'
    ], function (t) {
        var e = t('proj4/Point'), i = t('proj4/Proj'), s = t('proj4/transform'), r = i('WGS84');
        return function (t, a, n) {
            var h = function (i, r, n) {
                var h;
                return Array.isArray(n) ? (h = s(i, r, e(n)), 3 === n.length ? [
                    h.x,
                    h.y,
                    h.z
                ] : [
                    h.x,
                    h.y
                ]) : s(t, a, n);
            };
            return t = t instanceof i ? t : i(t), 'undefined' == typeof a ? (a = t, t = r) : 'string' == typeof a ? a = i(a) : 'x' in a || Array.isArray(a) ? (n = a, a = t, t = r) : a = a instanceof i ? a : i(a), n ? h(t, a, n) : {
                forward: function (e) {
                    return h(t, a, e);
                },
                inverse: function (e) {
                    return h(a, t, e);
                }
            };
        };
    }), define('proj4', [
        'require',
        'proj4/core',
        'proj4/Proj',
        'proj4/Point',
        'proj4/defs',
        'proj4/transform',
        'proj4/mgrs'
    ], function (t) {
        var e = t('proj4/core');
        return e.defaultDatum = 'WGS84', e.Proj = t('proj4/Proj'), e.WGS84 = new e.Proj('WGS84'), e.Point = t('proj4/Point'), e.defs = t('proj4/defs'), e.transform = t('proj4/transform'), e.mgrs = t('proj4/mgrs'), e;
    }), define('jszip/support', [
        'require',
        'exports',
        'module'
    ], function (t, e) {
        if (e.base64 = !0, e.array = !0, e.string = !0, e.arraybuffer = 'undefined' != typeof ArrayBuffer && 'undefined' != typeof Uint8Array, e.nodebuffer = 'undefined' != typeof Buffer, e.uint8array = 'undefined' != typeof Uint8Array, 'undefined' == typeof ArrayBuffer)
            e.blob = !1;
        else {
            var i = new ArrayBuffer(0);
            try {
                e.blob = 0 === new Blob([i], { type: 'application/zip' }).size;
            } catch (s) {
                try {
                    var r = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder, a = new r();
                    a.append(i), e.blob = 0 === a.getBlob('application/zip').size;
                } catch (s) {
                    e.blob = !1;
                }
            }
        }
    }), define('jszip/flate/inflate', [], function () {
        var t = {};
        return function () {
            !function () {
                function t(t, e) {
                    var i = t.split('.'), s = h;
                    !(i[0] in s) && s.execScript && s.execScript('var ' + i[0]);
                    for (var r; i.length && (r = i.shift());)
                        i.length || e === n ? s = s[r] ? s[r] : s[r] = {} : s[r] = e;
                }
                function e(t) {
                    var e, i, s, r, a, n, h, u, l, f = t.length, c = 0, p = Number.POSITIVE_INFINITY;
                    for (u = 0; f > u; ++u)
                        t[u] > c && (c = t[u]), t[u] < p && (p = t[u]);
                    for (e = 1 << c, i = new (o ? Uint32Array : Array)(e), s = 1, r = 0, a = 2; c >= s;) {
                        for (u = 0; f > u; ++u)
                            if (t[u] === s) {
                                for (n = 0, h = r, l = 0; s > l; ++l)
                                    n = n << 1 | 1 & h, h >>= 1;
                                for (l = n; e > l; l += a)
                                    i[l] = s << 16 | u;
                                ++r;
                            }
                        ++s, r <<= 1, a <<= 1;
                    }
                    return [
                        i,
                        c,
                        p
                    ];
                }
                function i(t, e) {
                    switch (this.g = [], this.h = 32768, this.c = this.f = this.d = this.k = 0, this.input = o ? new Uint8Array(t) : t, this.l = !1, this.i = l, this.p = !1, (e || !(e = {})) && (e.index && (this.d = e.index), e.bufferSize && (this.h = e.bufferSize), e.bufferType && (this.i = e.bufferType), e.resize && (this.p = e.resize)), this.i) {
                    case u:
                        this.a = 32768, this.b = new (o ? Uint8Array : Array)(32768 + this.h + 258);
                        break;
                    case l:
                        this.a = 0, this.b = new (o ? Uint8Array : Array)(this.h), this.e = this.u, this.m = this.r, this.j = this.s;
                        break;
                    default:
                        throw Error('invalid inflate mode');
                    }
                }
                function s(t, e) {
                    for (var i, s = t.f, r = t.c, a = t.input, h = t.d; e > r;) {
                        if (i = a[h++], i === n)
                            throw Error('input buffer is broken');
                        s |= i << r, r += 8;
                    }
                    return i = s & (1 << e) - 1, t.f = s >>> e, t.c = r - e, t.d = h, i;
                }
                function r(t, e) {
                    for (var i, s, r, a = t.f, h = t.c, o = t.input, u = t.d, l = e[0], f = e[1]; f > h && (i = o[u++], i !== n);)
                        a |= i << h, h += 8;
                    return s = l[a & (1 << f) - 1], r = s >>> 16, t.f = a >> r, t.c = h - r, t.d = u, 65535 & s;
                }
                function a(t) {
                    function i(t, e, i) {
                        var a, n, h, o;
                        for (o = 0; t > o;)
                            switch (a = r(this, e)) {
                            case 16:
                                for (h = 3 + s(this, 2); h--;)
                                    i[o++] = n;
                                break;
                            case 17:
                                for (h = 3 + s(this, 3); h--;)
                                    i[o++] = 0;
                                n = 0;
                                break;
                            case 18:
                                for (h = 11 + s(this, 7); h--;)
                                    i[o++] = 0;
                                n = 0;
                                break;
                            default:
                                n = i[o++] = a;
                            }
                        return i;
                    }
                    var a, n, h, u, l = s(t, 5) + 257, f = s(t, 5) + 1, c = s(t, 4) + 4, p = new (o ? Uint8Array : Array)(d.length);
                    for (u = 0; c > u; ++u)
                        p[d[u]] = s(t, 3);
                    a = e(p), n = new (o ? Uint8Array : Array)(l), h = new (o ? Uint8Array : Array)(f), t.j(e(i.call(t, l, a, n)), e(i.call(t, f, a, h)));
                }
                var n = void 0, h = this, o = 'undefined' != typeof Uint8Array && 'undefined' != typeof Uint16Array && 'undefined' != typeof Uint32Array, u = 0, l = 1;
                i.prototype.t = function () {
                    for (; !this.l;) {
                        var t = s(this, 3);
                        switch (1 & t && (this.l = !0), t >>>= 1) {
                        case 0:
                            var e = this.input, i = this.d, r = this.b, h = this.a, f = n, c = n, p = n, d = r.length, m = n;
                            if (this.c = this.f = 0, f = e[i++], f === n)
                                throw Error('invalid uncompressed block header: LEN (first byte)');
                            if (c = f, f = e[i++], f === n)
                                throw Error('invalid uncompressed block header: LEN (second byte)');
                            if (c |= f << 8, f = e[i++], f === n)
                                throw Error('invalid uncompressed block header: NLEN (first byte)');
                            if (p = f, f = e[i++], f === n)
                                throw Error('invalid uncompressed block header: NLEN (second byte)');
                            if (p |= f << 8, c === ~p)
                                throw Error('invalid uncompressed block header: length verify');
                            if (i + c > e.length)
                                throw Error('input buffer is broken');
                            switch (this.i) {
                            case u:
                                for (; h + c > r.length;) {
                                    if (m = d - h, c -= m, o)
                                        r.set(e.subarray(i, i + m), h), h += m, i += m;
                                    else
                                        for (; m--;)
                                            r[h++] = e[i++];
                                    this.a = h, r = this.e(), h = this.a;
                                }
                                break;
                            case l:
                                for (; h + c > r.length;)
                                    r = this.e({ o: 2 });
                                break;
                            default:
                                throw Error('invalid inflate mode');
                            }
                            if (o)
                                r.set(e.subarray(i, i + c), h), h += c, i += c;
                            else
                                for (; c--;)
                                    r[h++] = e[i++];
                            this.d = i, this.a = h, this.b = r;
                            break;
                        case 1:
                            this.j(w, I);
                            break;
                        case 2:
                            a(this);
                            break;
                        default:
                            throw Error('unknown BTYPE: ' + t);
                        }
                    }
                    return this.m();
                };
                var f, c, p = [
                        16,
                        17,
                        18,
                        0,
                        8,
                        7,
                        9,
                        6,
                        10,
                        5,
                        11,
                        4,
                        12,
                        3,
                        13,
                        2,
                        14,
                        1,
                        15
                    ], d = o ? new Uint16Array(p) : p, m = [
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        13,
                        15,
                        17,
                        19,
                        23,
                        27,
                        31,
                        35,
                        43,
                        51,
                        59,
                        67,
                        83,
                        99,
                        115,
                        131,
                        163,
                        195,
                        227,
                        258,
                        258,
                        258
                    ], y = o ? new Uint16Array(m) : m, M = [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        1,
                        1,
                        1,
                        2,
                        2,
                        2,
                        2,
                        3,
                        3,
                        3,
                        3,
                        4,
                        4,
                        4,
                        4,
                        5,
                        5,
                        5,
                        5,
                        0,
                        0,
                        0
                    ], g = o ? new Uint8Array(M) : M, _ = [
                        1,
                        2,
                        3,
                        4,
                        5,
                        7,
                        9,
                        13,
                        17,
                        25,
                        33,
                        49,
                        65,
                        97,
                        129,
                        193,
                        257,
                        385,
                        513,
                        769,
                        1025,
                        1537,
                        2049,
                        3073,
                        4097,
                        6145,
                        8193,
                        12289,
                        16385,
                        24577
                    ], b = o ? new Uint16Array(_) : _, v = [
                        0,
                        0,
                        0,
                        0,
                        1,
                        1,
                        2,
                        2,
                        3,
                        3,
                        4,
                        4,
                        5,
                        5,
                        6,
                        6,
                        7,
                        7,
                        8,
                        8,
                        9,
                        9,
                        10,
                        10,
                        11,
                        11,
                        12,
                        12,
                        13,
                        13
                    ], j = o ? new Uint8Array(v) : v, x = new (o ? Uint8Array : Array)(288);
                for (f = 0, c = x.length; c > f; ++f)
                    x[f] = 143 >= f ? 8 : 255 >= f ? 9 : 279 >= f ? 7 : 8;
                var A, C, w = e(x), S = new (o ? Uint8Array : Array)(30);
                for (A = 0, C = S.length; C > A; ++A)
                    S[A] = 5;
                var I = e(S);
                i.prototype.j = function (t, e) {
                    var i = this.b, a = this.a;
                    this.n = t;
                    for (var n, h, o, u, l = i.length - 258; 256 !== (n = r(this, t));)
                        if (256 > n)
                            a >= l && (this.a = a, i = this.e(), a = this.a), i[a++] = n;
                        else
                            for (h = n - 257, u = y[h], 0 < g[h] && (u += s(this, g[h])), n = r(this, e), o = b[n], 0 < j[n] && (o += s(this, j[n])), a >= l && (this.a = a, i = this.e(), a = this.a); u--;)
                                i[a] = i[a++ - o];
                    for (; 8 <= this.c;)
                        this.c -= 8, this.d--;
                    this.a = a;
                }, i.prototype.s = function (t, e) {
                    var i = this.b, a = this.a;
                    this.n = t;
                    for (var n, h, o, u, l = i.length; 256 !== (n = r(this, t));)
                        if (256 > n)
                            a >= l && (i = this.e(), l = i.length), i[a++] = n;
                        else
                            for (h = n - 257, u = y[h], 0 < g[h] && (u += s(this, g[h])), n = r(this, e), o = b[n], 0 < j[n] && (o += s(this, j[n])), a + u > l && (i = this.e(), l = i.length); u--;)
                                i[a] = i[a++ - o];
                    for (; 8 <= this.c;)
                        this.c -= 8, this.d--;
                    this.a = a;
                }, i.prototype.e = function () {
                    var t, e, i = new (o ? Uint8Array : Array)(this.a - 32768), s = this.a - 32768, r = this.b;
                    if (o)
                        i.set(r.subarray(32768, i.length));
                    else
                        for (t = 0, e = i.length; e > t; ++t)
                            i[t] = r[t + 32768];
                    if (this.g.push(i), this.k += i.length, o)
                        r.set(r.subarray(s, s + 32768));
                    else
                        for (t = 0; 32768 > t; ++t)
                            r[t] = r[s + t];
                    return this.a = 32768, r;
                }, i.prototype.u = function (t) {
                    var e, i, s, r, a = 0 | this.input.length / this.d + 1, n = this.input, h = this.b;
                    return t && ('number' == typeof t.o && (a = t.o), 'number' == typeof t.q && (a += t.q)), 2 > a ? (i = (n.length - this.d) / this.n[2], r = 0 | 258 * (i / 2), s = r < h.length ? h.length + r : h.length << 1) : s = h.length * a, o ? (e = new Uint8Array(s), e.set(h)) : e = h, this.b = e;
                }, i.prototype.m = function () {
                    var t, e, i, s, r, a = 0, n = this.b, h = this.g, u = new (o ? Uint8Array : Array)(this.k + (this.a - 32768));
                    if (0 === h.length)
                        return o ? this.b.subarray(32768, this.a) : this.b.slice(32768, this.a);
                    for (e = 0, i = h.length; i > e; ++e)
                        for (t = h[e], s = 0, r = t.length; r > s; ++s)
                            u[a++] = t[s];
                    for (e = 32768, i = this.a; i > e; ++e)
                        u[a++] = n[e];
                    return this.g = [], this.buffer = u;
                }, i.prototype.r = function () {
                    var t, e = this.a;
                    return o ? this.p ? (t = new Uint8Array(e), t.set(this.b.subarray(0, e))) : t = this.b.subarray(0, e) : (this.b.length > e && (this.b.length = e), t = this.b), this.buffer = t;
                }, t('Zlib.RawInflate', i), t('Zlib.RawInflate.prototype.decompress', i.prototype.t);
                var P, E, k, N, z = {
                        ADAPTIVE: l,
                        BLOCK: u
                    };
                if (Object.keys)
                    P = Object.keys(z);
                else
                    for (E in P = [], k = 0, z)
                        P[k++] = E;
                for (k = 0, N = P.length; N > k; ++k)
                    E = P[k], t('Zlib.RawInflate.BufferType.' + E, z[E]);
            }.call(this);
        }.call(t), function (e) {
            var i = new t.Zlib.RawInflate(new Uint8Array(e));
            return i.decompress();
        };
    }), define('jszip/flate/deflate', [], function () {
        var t = {};
        return function () {
            !function () {
                function t(t, e) {
                    var i = t.split('.'), s = p;
                    !(i[0] in s) && s.execScript && s.execScript('var ' + i[0]);
                    for (var r; i.length && (r = i.shift());)
                        i.length || e === f ? s = s[r] ? s[r] : s[r] = {} : s[r] = e;
                }
                function e(t, e) {
                    if (this.index = 'number' == typeof e ? e : 0, this.d = 0, this.buffer = t instanceof (d ? Uint8Array : Array) ? t : new (d ? Uint8Array : Array)(32768), 2 * this.buffer.length <= this.index)
                        throw Error('invalid index');
                    this.buffer.length <= this.index && i(this);
                }
                function i(t) {
                    var e, i = t.buffer, s = i.length, r = new (d ? Uint8Array : Array)(s << 1);
                    if (d)
                        r.set(i);
                    else
                        for (e = 0; s > e; ++e)
                            r[e] = i[e];
                    return t.buffer = r;
                }
                function s(t) {
                    this.buffer = new (d ? Uint16Array : Array)(2 * t), this.length = 0;
                }
                function r(t, e) {
                    this.e = j, this.f = 0, this.input = d && t instanceof Array ? new Uint8Array(t) : t, this.c = 0, e && (e.lazy && (this.f = e.lazy), 'number' == typeof e.compressionType && (this.e = e.compressionType), e.outputBuffer && (this.b = d && e.outputBuffer instanceof Array ? new Uint8Array(e.outputBuffer) : e.outputBuffer), 'number' == typeof e.outputIndex && (this.c = e.outputIndex)), this.b || (this.b = new (d ? Uint8Array : Array)(32768));
                }
                function a(t, e) {
                    this.length = t, this.g = e;
                }
                function n(t, e) {
                    function i(t, e) {
                        var i, s = t.g, r = [], a = 0;
                        i = C[t.length], r[a++] = 65535 & i, r[a++] = 255 & i >> 16, r[a++] = i >> 24;
                        var n;
                        switch (c) {
                        case 1 === s:
                            n = [
                                0,
                                s - 1,
                                0
                            ];
                            break;
                        case 2 === s:
                            n = [
                                1,
                                s - 2,
                                0
                            ];
                            break;
                        case 3 === s:
                            n = [
                                2,
                                s - 3,
                                0
                            ];
                            break;
                        case 4 === s:
                            n = [
                                3,
                                s - 4,
                                0
                            ];
                            break;
                        case 6 >= s:
                            n = [
                                4,
                                s - 5,
                                1
                            ];
                            break;
                        case 8 >= s:
                            n = [
                                5,
                                s - 7,
                                1
                            ];
                            break;
                        case 12 >= s:
                            n = [
                                6,
                                s - 9,
                                2
                            ];
                            break;
                        case 16 >= s:
                            n = [
                                7,
                                s - 13,
                                2
                            ];
                            break;
                        case 24 >= s:
                            n = [
                                8,
                                s - 17,
                                3
                            ];
                            break;
                        case 32 >= s:
                            n = [
                                9,
                                s - 25,
                                3
                            ];
                            break;
                        case 48 >= s:
                            n = [
                                10,
                                s - 33,
                                4
                            ];
                            break;
                        case 64 >= s:
                            n = [
                                11,
                                s - 49,
                                4
                            ];
                            break;
                        case 96 >= s:
                            n = [
                                12,
                                s - 65,
                                5
                            ];
                            break;
                        case 128 >= s:
                            n = [
                                13,
                                s - 97,
                                5
                            ];
                            break;
                        case 192 >= s:
                            n = [
                                14,
                                s - 129,
                                6
                            ];
                            break;
                        case 256 >= s:
                            n = [
                                15,
                                s - 193,
                                6
                            ];
                            break;
                        case 384 >= s:
                            n = [
                                16,
                                s - 257,
                                7
                            ];
                            break;
                        case 512 >= s:
                            n = [
                                17,
                                s - 385,
                                7
                            ];
                            break;
                        case 768 >= s:
                            n = [
                                18,
                                s - 513,
                                8
                            ];
                            break;
                        case 1024 >= s:
                            n = [
                                19,
                                s - 769,
                                8
                            ];
                            break;
                        case 1536 >= s:
                            n = [
                                20,
                                s - 1025,
                                9
                            ];
                            break;
                        case 2048 >= s:
                            n = [
                                21,
                                s - 1537,
                                9
                            ];
                            break;
                        case 3072 >= s:
                            n = [
                                22,
                                s - 2049,
                                10
                            ];
                            break;
                        case 4096 >= s:
                            n = [
                                23,
                                s - 3073,
                                10
                            ];
                            break;
                        case 6144 >= s:
                            n = [
                                24,
                                s - 4097,
                                11
                            ];
                            break;
                        case 8192 >= s:
                            n = [
                                25,
                                s - 6145,
                                11
                            ];
                            break;
                        case 12288 >= s:
                            n = [
                                26,
                                s - 8193,
                                12
                            ];
                            break;
                        case 16384 >= s:
                            n = [
                                27,
                                s - 12289,
                                12
                            ];
                            break;
                        case 24576 >= s:
                            n = [
                                28,
                                s - 16385,
                                13
                            ];
                            break;
                        case 32768 >= s:
                            n = [
                                29,
                                s - 24577,
                                13
                            ];
                            break;
                        default:
                            throw 'invalid distance';
                        }
                        i = n, r[a++] = i[0], r[a++] = i[1], r[a++] = i[2];
                        var h, o;
                        for (h = 0, o = r.length; o > h; ++h)
                            M[g++] = r[h];
                        b[r[0]]++, v[r[3]]++, _ = t.length + e - 1, p = null;
                    }
                    var s, r, a, n, o, u, l, p, m, y = {}, M = d ? new Uint16Array(2 * e.length) : [], g = 0, _ = 0, b = new (d ? Uint32Array : Array)(286), v = new (d ? Uint32Array : Array)(30), j = t.f;
                    if (!d) {
                        for (a = 0; 285 >= a;)
                            b[a++] = 0;
                        for (a = 0; 29 >= a;)
                            v[a++] = 0;
                    }
                    for (b[256] = 1, s = 0, r = e.length; r > s; ++s) {
                        for (a = o = 0, n = 3; n > a && s + a !== r; ++a)
                            o = o << 8 | e[s + a];
                        if (y[o] === f && (y[o] = []), u = y[o], !(0 < _--)) {
                            for (; 0 < u.length && 32768 < s - u[0];)
                                u.shift();
                            if (s + 3 >= r) {
                                for (p && i(p, -1), a = 0, n = r - s; n > a; ++a)
                                    m = e[s + a], M[g++] = m, ++b[m];
                                break;
                            }
                            0 < u.length ? (l = h(e, s, u), p ? p.length < l.length ? (m = e[s - 1], M[g++] = m, ++b[m], i(l, 0)) : i(p, -1) : l.length < j ? p = l : i(l, 0)) : p ? i(p, -1) : (m = e[s], M[g++] = m, ++b[m]);
                        }
                        u.push(s);
                    }
                    return M[g++] = 256, b[256]++, t.j = b, t.i = v, d ? M.subarray(0, g) : M;
                }
                function h(t, e, i) {
                    var s, r, n, h, o, u, l = 0, f = t.length;
                    h = 0, u = i.length;
                    t:
                        for (; u > h; h++) {
                            if (s = i[u - h - 1], n = 3, l > 3) {
                                for (o = l; o > 3; o--)
                                    if (t[s + o - 1] !== t[e + o - 1])
                                        continue t;
                                n = l;
                            }
                            for (; 258 > n && f > e + n && t[s + n] === t[e + n];)
                                ++n;
                            if (n > l && (r = s, l = n), 258 === n)
                                break;
                        }
                    return new a(l, e - r);
                }
                function o(t, e) {
                    var i, r, a, n, h, o = t.length, l = new s(572), f = new (d ? Uint8Array : Array)(o);
                    if (!d)
                        for (n = 0; o > n; n++)
                            f[n] = 0;
                    for (n = 0; o > n; ++n)
                        0 < t[n] && l.push(n, t[n]);
                    if (i = Array(l.length / 2), r = new (d ? Uint32Array : Array)(l.length / 2), 1 === i.length)
                        return f[l.pop().index] = 1, f;
                    for (n = 0, h = l.length / 2; h > n; ++n)
                        i[n] = l.pop(), r[n] = i[n].value;
                    for (a = u(r, r.length, e), n = 0, h = i.length; h > n; ++n)
                        f[i[n].index] = a[n];
                    return f;
                }
                function u(t, e, i) {
                    function s(t) {
                        var i = p[t][m[t]];
                        i === e ? (s(t + 1), s(t + 1)) : --f[i], ++m[t];
                    }
                    var r, a, n, h, o, u = new (d ? Uint16Array : Array)(i), l = new (d ? Uint8Array : Array)(i), f = new (d ? Uint8Array : Array)(e), c = Array(i), p = Array(i), m = Array(i), y = (1 << i) - e, M = 1 << i - 1;
                    for (u[i - 1] = e, a = 0; i > a; ++a)
                        M > y ? l[a] = 0 : (l[a] = 1, y -= M), y <<= 1, u[i - 2 - a] = (0 | u[i - 1 - a] / 2) + e;
                    for (u[0] = l[0], c[0] = Array(u[0]), p[0] = Array(u[0]), a = 1; i > a; ++a)
                        u[a] > 2 * u[a - 1] + l[a] && (u[a] = 2 * u[a - 1] + l[a]), c[a] = Array(u[a]), p[a] = Array(u[a]);
                    for (r = 0; e > r; ++r)
                        f[r] = i;
                    for (n = 0; n < u[i - 1]; ++n)
                        c[i - 1][n] = t[n], p[i - 1][n] = n;
                    for (r = 0; i > r; ++r)
                        m[r] = 0;
                    for (1 === l[i - 1] && (--f[0], ++m[i - 1]), a = i - 2; a >= 0; --a) {
                        for (h = r = 0, o = m[a + 1], n = 0; n < u[a]; n++)
                            h = c[a + 1][o] + c[a + 1][o + 1], h > t[r] ? (c[a][n] = h, p[a][n] = e, o += 2) : (c[a][n] = t[r], p[a][n] = r, ++r);
                        m[a] = 0, 1 === l[a] && s(a);
                    }
                    return f;
                }
                function l(t) {
                    var e, i, s, r, a = new (d ? Uint16Array : Array)(t.length), n = [], h = [], o = 0;
                    for (e = 0, i = t.length; i > e; e++)
                        n[t[e]] = (0 | n[t[e]]) + 1;
                    for (e = 1, i = 16; i >= e; e++)
                        h[e] = o, o += 0 | n[e], o <<= 1;
                    for (e = 0, i = t.length; i > e; e++)
                        for (o = h[t[e]], h[t[e]] += 1, s = a[e] = 0, r = t[e]; r > s; s++)
                            a[e] = a[e] << 1 | 1 & o, o >>>= 1;
                    return a;
                }
                var f = void 0, c = !0, p = this, d = 'undefined' != typeof Uint8Array && 'undefined' != typeof Uint16Array && 'undefined' != typeof Uint32Array;
                e.prototype.a = function (t, e, s) {
                    var r, a = this.buffer, n = this.index, h = this.d, o = a[n];
                    if (s && e > 1 && (t = e > 8 ? (b[255 & t] << 24 | b[255 & t >>> 8] << 16 | b[255 & t >>> 16] << 8 | b[255 & t >>> 24]) >> 32 - e : b[t] >> 8 - e), 8 > e + h)
                        o = o << e | t, h += e;
                    else
                        for (r = 0; e > r; ++r)
                            o = o << 1 | 1 & t >> e - r - 1, 8 === ++h && (h = 0, a[n++] = b[o], o = 0, n === a.length && (a = i(this)));
                    a[n] = o, this.buffer = a, this.d = h, this.index = n;
                }, e.prototype.finish = function () {
                    var t, e = this.buffer, i = this.index;
                    return 0 < this.d && (e[i] <<= 8 - this.d, e[i] = b[e[i]], i++), d ? t = e.subarray(0, i) : (e.length = i, t = e), t;
                };
                var m, y = new (d ? Uint8Array : Array)(256);
                for (m = 0; 256 > m; ++m) {
                    for (var M = m, g = M, _ = 7, M = M >>> 1; M; M >>>= 1)
                        g <<= 1, g |= 1 & M, --_;
                    y[m] = (255 & g << _) >>> 0;
                }
                var b = y;
                s.prototype.getParent = function (t) {
                    return 2 * (0 | (t - 2) / 4);
                }, s.prototype.push = function (t, e) {
                    var i, s, r, a = this.buffer;
                    for (i = this.length, a[this.length++] = e, a[this.length++] = t; i > 0 && (s = this.getParent(i), a[i] > a[s]);)
                        r = a[i], a[i] = a[s], a[s] = r, r = a[i + 1], a[i + 1] = a[s + 1], a[s + 1] = r, i = s;
                    return this.length;
                }, s.prototype.pop = function () {
                    var t, e, i, s, r, a = this.buffer;
                    for (e = a[0], t = a[1], this.length -= 2, a[0] = a[this.length], a[1] = a[this.length + 1], r = 0; (s = 2 * r + 2, !(s >= this.length)) && (s + 2 < this.length && a[s + 2] > a[s] && (s += 2), a[s] > a[r]);)
                        i = a[r], a[r] = a[s], a[s] = i, i = a[r + 1], a[r + 1] = a[s + 1], a[s + 1] = i, r = s;
                    return {
                        index: t,
                        value: e,
                        length: this.length
                    };
                };
                var v, j = 2, x = [];
                for (v = 0; 288 > v; v++)
                    switch (c) {
                    case 143 >= v:
                        x.push([
                            v + 48,
                            8
                        ]);
                        break;
                    case 255 >= v:
                        x.push([
                            v - 144 + 400,
                            9
                        ]);
                        break;
                    case 279 >= v:
                        x.push([
                            v - 256 + 0,
                            7
                        ]);
                        break;
                    case 287 >= v:
                        x.push([
                            v - 280 + 192,
                            8
                        ]);
                        break;
                    default:
                        throw 'invalid literal: ' + v;
                    }
                r.prototype.h = function () {
                    var t, i, s, r, a = this.input;
                    switch (this.e) {
                    case 0:
                        for (s = 0, r = a.length; r > s;) {
                            i = d ? a.subarray(s, s + 65535) : a.slice(s, s + 65535), s += i.length;
                            var h = i, u = s === r, p = f, m = f, y = f, M = f, g = f, _ = this.b, b = this.c;
                            if (d) {
                                for (_ = new Uint8Array(this.b.buffer); _.length <= b + h.length + 5;)
                                    _ = new Uint8Array(_.length << 1);
                                _.set(this.b);
                            }
                            if (p = u ? 1 : 0, _[b++] = 0 | p, m = h.length, y = 65535 & ~m + 65536, _[b++] = 255 & m, _[b++] = 255 & m >>> 8, _[b++] = 255 & y, _[b++] = 255 & y >>> 8, d)
                                _.set(h, b), b += h.length, _ = _.subarray(0, b);
                            else {
                                for (M = 0, g = h.length; g > M; ++M)
                                    _[b++] = h[M];
                                _.length = b;
                            }
                            this.c = b, this.b = _;
                        }
                        break;
                    case 1:
                        var v = new e(d ? new Uint8Array(this.b.buffer) : this.b, this.c);
                        v.a(1, 1, c), v.a(1, 2, c);
                        var A, C, w, S = n(this, a);
                        for (A = 0, C = S.length; C > A; A++)
                            if (w = S[A], e.prototype.a.apply(v, x[w]), w > 256)
                                v.a(S[++A], S[++A], c), v.a(S[++A], 5), v.a(S[++A], S[++A], c);
                            else if (256 === w)
                                break;
                        this.b = v.finish(), this.c = this.b.length;
                        break;
                    case j:
                        var I, P, E, k, N, z, L, O, R, T, q, D, F, U, B, G = new e(d ? new Uint8Array(this.b.buffer) : this.b, this.c), H = [
                                16,
                                17,
                                18,
                                0,
                                8,
                                7,
                                9,
                                6,
                                10,
                                5,
                                11,
                                4,
                                12,
                                3,
                                13,
                                2,
                                14,
                                1,
                                15
                            ], J = Array(19);
                        for (I = j, G.a(1, 1, c), G.a(I, 2, c), P = n(this, a), z = o(this.j, 15), L = l(z), O = o(this.i, 7), R = l(O), E = 286; E > 257 && 0 === z[E - 1]; E--);
                        for (k = 30; k > 1 && 0 === O[k - 1]; k--);
                        var W, Z, Q, V, X, K, Y = E, $ = k, te = new (d ? Uint32Array : Array)(Y + $), ee = new (d ? Uint32Array : Array)(316), ie = new (d ? Uint8Array : Array)(19);
                        for (W = Z = 0; Y > W; W++)
                            te[Z++] = z[W];
                        for (W = 0; $ > W; W++)
                            te[Z++] = O[W];
                        if (!d)
                            for (W = 0, V = ie.length; V > W; ++W)
                                ie[W] = 0;
                        for (W = X = 0, V = te.length; V > W; W += Z) {
                            for (Z = 1; V > W + Z && te[W + Z] === te[W]; ++Z);
                            if (Q = Z, 0 === te[W])
                                if (3 > Q)
                                    for (; 0 < Q--;)
                                        ee[X++] = 0, ie[0]++;
                                else
                                    for (; Q > 0;)
                                        K = 138 > Q ? Q : 138, K > Q - 3 && Q > K && (K = Q - 3), 10 >= K ? (ee[X++] = 17, ee[X++] = K - 3, ie[17]++) : (ee[X++] = 18, ee[X++] = K - 11, ie[18]++), Q -= K;
                            else if (ee[X++] = te[W], ie[te[W]]++, Q--, 3 > Q)
                                for (; 0 < Q--;)
                                    ee[X++] = te[W], ie[te[W]]++;
                            else
                                for (; Q > 0;)
                                    K = 6 > Q ? Q : 6, K > Q - 3 && Q > K && (K = Q - 3), ee[X++] = 16, ee[X++] = K - 3, ie[16]++, Q -= K;
                        }
                        for (t = d ? ee.subarray(0, X) : ee.slice(0, X), T = o(ie, 7), U = 0; 19 > U; U++)
                            J[U] = T[H[U]];
                        for (N = 19; N > 4 && 0 === J[N - 1]; N--);
                        for (q = l(T), G.a(E - 257, 5, c), G.a(k - 1, 5, c), G.a(N - 4, 4, c), U = 0; N > U; U++)
                            G.a(J[U], 3, c);
                        for (U = 0, B = t.length; B > U; U++)
                            if (D = t[U], G.a(q[D], T[D], c), D >= 16) {
                                switch (U++, D) {
                                case 16:
                                    F = 2;
                                    break;
                                case 17:
                                    F = 3;
                                    break;
                                case 18:
                                    F = 7;
                                    break;
                                default:
                                    throw 'invalid code: ' + D;
                                }
                                G.a(t[U], F, c);
                            }
                        var se, re, ae, ne, he, oe, ue, le, fe = [
                                L,
                                z
                            ], ce = [
                                R,
                                O
                            ];
                        for (he = fe[0], oe = fe[1], ue = ce[0], le = ce[1], se = 0, re = P.length; re > se; ++se)
                            if (ae = P[se], G.a(he[ae], oe[ae], c), ae > 256)
                                G.a(P[++se], P[++se], c), ne = P[++se], G.a(ue[ne], le[ne], c), G.a(P[++se], P[++se], c);
                            else if (256 === ae)
                                break;
                        this.b = G.finish(), this.c = this.b.length;
                        break;
                    default:
                        throw 'invalid compression type';
                    }
                    return this.b;
                };
                var A = function () {
                        function t(t) {
                            switch (c) {
                            case 3 === t:
                                return [
                                    257,
                                    t - 3,
                                    0
                                ];
                            case 4 === t:
                                return [
                                    258,
                                    t - 4,
                                    0
                                ];
                            case 5 === t:
                                return [
                                    259,
                                    t - 5,
                                    0
                                ];
                            case 6 === t:
                                return [
                                    260,
                                    t - 6,
                                    0
                                ];
                            case 7 === t:
                                return [
                                    261,
                                    t - 7,
                                    0
                                ];
                            case 8 === t:
                                return [
                                    262,
                                    t - 8,
                                    0
                                ];
                            case 9 === t:
                                return [
                                    263,
                                    t - 9,
                                    0
                                ];
                            case 10 === t:
                                return [
                                    264,
                                    t - 10,
                                    0
                                ];
                            case 12 >= t:
                                return [
                                    265,
                                    t - 11,
                                    1
                                ];
                            case 14 >= t:
                                return [
                                    266,
                                    t - 13,
                                    1
                                ];
                            case 16 >= t:
                                return [
                                    267,
                                    t - 15,
                                    1
                                ];
                            case 18 >= t:
                                return [
                                    268,
                                    t - 17,
                                    1
                                ];
                            case 22 >= t:
                                return [
                                    269,
                                    t - 19,
                                    2
                                ];
                            case 26 >= t:
                                return [
                                    270,
                                    t - 23,
                                    2
                                ];
                            case 30 >= t:
                                return [
                                    271,
                                    t - 27,
                                    2
                                ];
                            case 34 >= t:
                                return [
                                    272,
                                    t - 31,
                                    2
                                ];
                            case 42 >= t:
                                return [
                                    273,
                                    t - 35,
                                    3
                                ];
                            case 50 >= t:
                                return [
                                    274,
                                    t - 43,
                                    3
                                ];
                            case 58 >= t:
                                return [
                                    275,
                                    t - 51,
                                    3
                                ];
                            case 66 >= t:
                                return [
                                    276,
                                    t - 59,
                                    3
                                ];
                            case 82 >= t:
                                return [
                                    277,
                                    t - 67,
                                    4
                                ];
                            case 98 >= t:
                                return [
                                    278,
                                    t - 83,
                                    4
                                ];
                            case 114 >= t:
                                return [
                                    279,
                                    t - 99,
                                    4
                                ];
                            case 130 >= t:
                                return [
                                    280,
                                    t - 115,
                                    4
                                ];
                            case 162 >= t:
                                return [
                                    281,
                                    t - 131,
                                    5
                                ];
                            case 194 >= t:
                                return [
                                    282,
                                    t - 163,
                                    5
                                ];
                            case 226 >= t:
                                return [
                                    283,
                                    t - 195,
                                    5
                                ];
                            case 257 >= t:
                                return [
                                    284,
                                    t - 227,
                                    5
                                ];
                            case 258 === t:
                                return [
                                    285,
                                    t - 258,
                                    0
                                ];
                            default:
                                throw 'invalid length: ' + t;
                            }
                        }
                        var e, i, s = [];
                        for (e = 3; 258 >= e; e++)
                            i = t(e), s[e] = i[2] << 24 | i[1] << 16 | i[0];
                        return s;
                    }(), C = d ? new Uint32Array(A) : A;
                t('Zlib.RawDeflate', r), t('Zlib.RawDeflate.prototype.compress', r.prototype.h);
                var w, S, I, P, E = {
                        NONE: 0,
                        FIXED: 1,
                        DYNAMIC: j
                    };
                if (Object.keys)
                    w = Object.keys(E);
                else
                    for (S in w = [], I = 0, E)
                        w[I++] = S;
                for (I = 0, P = w.length; P > I; ++I)
                    S = w[I], t('Zlib.RawDeflate.CompressionType.' + S, E[S]);
            }.call(this);
        }.call(t), function (e) {
            var i = new t.Zlib.RawDeflate(e);
            return i.compress();
        };
    }), define('jszip/flate/main', [
        'require',
        'exports',
        'module',
        'jszip/flate/inflate',
        'jszip/flate/deflate'
    ], function (t, e) {
        var i = 'undefined' != typeof Uint8Array && 'undefined' != typeof Uint16Array && 'undefined' != typeof Uint32Array;
        e.magic = '\b\0', e.uncompress = t('jszip/flate/inflate'), e.uncompressInputType = i ? 'uint8array' : 'array', e.compress = t('jszip/flate/deflate'), e.compressInputType = i ? 'uint8array' : 'array';
    }), define('jszip/compressions', [
        'require',
        'jszip/flate/main'
    ], function (t) {
        return {
            STORE: {
                magic: '\0\0',
                compress: function (t) {
                    return t;
                },
                uncompress: function (t) {
                    return t;
                },
                compressInputType: null,
                uncompressInputType: null
            },
            DEFLATE: t('jszip/flate/main')
        };
    }), define('jszip/utils', [
        'require',
        'exports',
        'module',
        'jszip/support',
        'jszip/compressions'
    ], function (t, e) {
        function i(t) {
            return t;
        }
        function s(t, e) {
            for (var i = 0; i < t.length; ++i)
                e[i] = 255 & t.charCodeAt(i);
            return e;
        }
        function r(t) {
            for (var i = 65536, s = [], r = t.length, a = e.getTypeOf(t), n = 0; r > n && i > 1;)
                try {
                    'array' === a || 'nodebuffer' === a ? s.push(String.fromCharCode.apply(null, t.slice(n, Math.max(n + i, r)))) : s.push(String.fromCharCode.apply(null, t.subarray(n, n + i))), n += i;
                } catch (h) {
                    i = Math.floor(i / 2);
                }
            return s.join('');
        }
        function a(t, e) {
            for (var i = 0; i < t.length; i++)
                e[i] = t[i];
            return e;
        }
        var n = t('jszip/support'), h = t('jszip/compressions');
        e.string2binary = function (t) {
            for (var e = '', i = 0; i < t.length; i++)
                e += String.fromCharCode(255 & t.charCodeAt(i));
            return e;
        }, e.string2Uint8Array = function (t) {
            return e.transformTo('uint8array', t);
        }, e.uint8Array2String = function (t) {
            return e.transformTo('string', t);
        }, e.string2Blob = function (t) {
            var i = e.transformTo('arraybuffer', t);
            return e.arrayBuffer2Blob(i);
        }, e.arrayBuffer2Blob = function (t) {
            e.checkSupport('blob');
            try {
                return new Blob([t], { type: 'application/zip' });
            } catch (i) {
                try {
                    var s = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder)();
                    return s.append(t), s.getBlob('application/zip');
                } catch (i) {
                    throw new Error('Bug : can\'t construct the Blob.');
                }
            }
        };
        var o = {};
        o.string = {
            string: i,
            array: function (t) {
                return s(t, new Array(t.length));
            },
            arraybuffer: function (t) {
                return o.string.uint8array(t).buffer;
            },
            uint8array: function (t) {
                return s(t, new Uint8Array(t.length));
            },
            nodebuffer: function (t) {
                return s(t, new Buffer(t.length));
            }
        }, o.array = {
            string: r,
            array: i,
            arraybuffer: function (t) {
                return new Uint8Array(t).buffer;
            },
            uint8array: function (t) {
                return new Uint8Array(t);
            },
            nodebuffer: function (t) {
                return new Buffer(t);
            }
        }, o.arraybuffer = {
            string: function (t) {
                return r(new Uint8Array(t));
            },
            array: function (t) {
                return a(new Uint8Array(t), new Array(t.byteLength));
            },
            arraybuffer: i,
            uint8array: function (t) {
                return new Uint8Array(t);
            },
            nodebuffer: function (t) {
                return new Buffer(new Uint8Array(t));
            }
        }, o.uint8array = {
            string: r,
            array: function (t) {
                return a(t, new Array(t.length));
            },
            arraybuffer: function (t) {
                return t.buffer;
            },
            uint8array: i,
            nodebuffer: function (t) {
                return new Buffer(t);
            }
        }, o.nodebuffer = {
            string: r,
            array: function (t) {
                return a(t, new Array(t.length));
            },
            arraybuffer: function (t) {
                return o.nodebuffer.uint8array(t).buffer;
            },
            uint8array: function (t) {
                return a(t, new Uint8Array(t.length));
            },
            nodebuffer: i
        }, e.transformTo = function (t, i) {
            if (i || (i = ''), !t)
                return i;
            e.checkSupport(t);
            var s = e.getTypeOf(i), r = o[s][t](i);
            return r;
        }, e.getTypeOf = function (t) {
            return 'string' == typeof t ? 'string' : t instanceof Array ? 'array' : n.nodebuffer && Buffer.isBuffer(t) ? 'nodebuffer' : n.uint8array && t instanceof Uint8Array ? 'uint8array' : n.arraybuffer && t instanceof ArrayBuffer ? 'arraybuffer' : void 0;
        }, e.checkSupport = function (t) {
            var e = n[t.toLowerCase()];
            if (!e)
                throw new Error(t + ' is not supported by this browser');
        }, e.MAX_VALUE_16BITS = 65535, e.MAX_VALUE_32BITS = -1, e.pretty = function (t) {
            var e, i, s = '';
            for (i = 0; i < (t || '').length; i++)
                e = t.charCodeAt(i), s += '\\x' + (16 > e ? '0' : '') + e.toString(16).toUpperCase();
            return s;
        }, e.findCompression = function (t) {
            for (var e in h)
                if (h.hasOwnProperty(e) && h[e].magic === t)
                    return h[e];
            return null;
        };
    }), define('jszip/signature', [], function () {
        return {
            LOCAL_FILE_HEADER: 'PK\x03\x04',
            CENTRAL_FILE_HEADER: 'PK\x01\x02',
            CENTRAL_DIRECTORY_END: 'PK\x05\x06',
            ZIP64_CENTRAL_DIRECTORY_LOCATOR: 'PK\x06\x07',
            ZIP64_CENTRAL_DIRECTORY_END: 'PK\x06\x06',
            DATA_DESCRIPTOR: 'PK\x07\b'
        };
    }), define('jszip/defaults', [], function () {
        return {
            base64: !1,
            binary: !1,
            dir: !1,
            date: null,
            compression: null
        };
    }), define('jszip/base64', [], function () {
        var t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        return {
            encode: function (e) {
                for (var i, s, r, a, n, h, o, u = '', l = 0; l < e.length;)
                    i = e.charCodeAt(l++), s = e.charCodeAt(l++), r = e.charCodeAt(l++), a = i >> 2, n = (3 & i) << 4 | s >> 4, h = (15 & s) << 2 | r >> 6, o = 63 & r, isNaN(s) ? h = o = 64 : isNaN(r) && (o = 64), u = u + t.charAt(a) + t.charAt(n) + t.charAt(h) + t.charAt(o);
                return u;
            },
            decode: function (e) {
                var i, s, r, a, n, h, o, u = '', l = 0;
                for (e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ''); l < e.length;)
                    a = t.indexOf(e.charAt(l++)), n = t.indexOf(e.charAt(l++)), h = t.indexOf(e.charAt(l++)), o = t.indexOf(e.charAt(l++)), i = a << 2 | n >> 4, s = (15 & n) << 4 | h >> 2, r = (3 & h) << 6 | o, u += String.fromCharCode(i), 64 != h && (u += String.fromCharCode(s)), 64 != o && (u += String.fromCharCode(r));
                return u;
            }
        };
    }), define('jszip/compressedObject', [], function () {
        return CompressedObject = function () {
            this.compressedSize = 0, this.uncompressedSize = 0, this.crc32 = 0, this.compressionMethod = null, this.compressedContent = null;
        }, CompressedObject.prototype = {
            getContent: function () {
                return null;
            },
            getCompressedContent: function () {
                return null;
            }
        }, CompressedObject;
    }), define('jszip/object', [
        'require',
        'jszip/support',
        'jszip/utils',
        'jszip/signature',
        'jszip/defaults',
        'jszip/base64',
        'jszip/compressions',
        'jszip/compressedObject'
    ], function (t) {
        var e = t('jszip/support'), i = t('jszip/utils'), s = t('jszip/signature'), r = t('jszip/defaults'), a = t('jszip/base64'), n = t('jszip/compressions'), h = t('jszip/compressedObject'), o = function (t) {
                if (t._data instanceof h && (t._data = t._data.getContent(), t.options.binary = !0, t.options.base64 = !1, 'uint8array' === i.getTypeOf(t._data))) {
                    var e = t._data;
                    t._data = new Uint8Array(e.length), 0 !== e.length && t._data.set(e, 0);
                }
                return t._data;
            }, u = function (t) {
                var s = o(t), r = i.getTypeOf(s);
                if ('string' === r) {
                    if (!t.options.binary) {
                        if (e.uint8array && 'function' == typeof TextEncoder)
                            return TextEncoder('utf-8').encode(s);
                        if (e.nodebuffer)
                            return new Buffer(s, 'utf-8');
                    }
                    return t.asBinary();
                }
                return s;
            }, l = function (t) {
                var e = o(this);
                return null === e || 'undefined' == typeof e ? '' : (this.options.base64 && (e = a.decode(e)), e = t && this.options.binary ? j.utf8decode(e) : i.transformTo('string', e), t || this.options.binary || (e = j.utf8encode(e)), e);
            }, f = function (t, e, i) {
                this.name = t, this._data = e, this.options = i;
            };
        f.prototype = {
            asText: function () {
                return l.call(this, !0);
            },
            asBinary: function () {
                return l.call(this, !1);
            },
            asNodeBuffer: function () {
                var t = u(this);
                return i.transformTo('nodebuffer', t);
            },
            asUint8Array: function () {
                var t = u(this);
                return i.transformTo('uint8array', t);
            },
            asArrayBuffer: function () {
                return this.asUint8Array().buffer;
            }
        };
        var c = function (t, e) {
                var i, s = '';
                for (i = 0; e > i; i++)
                    s += String.fromCharCode(255 & t), t >>>= 8;
                return s;
            }, p = function () {
                var t, e, i = {};
                for (t = 0; t < arguments.length; t++)
                    for (e in arguments[t])
                        arguments[t].hasOwnProperty(e) && 'undefined' == typeof i[e] && (i[e] = arguments[t][e]);
                return i;
            }, d = function (t) {
                return t = t || {}, t.base64 === !0 && null == t.binary && (t.binary = !0), t = p(t, r), t.date = t.date || new Date(), null !== t.compression && (t.compression = t.compression.toUpperCase()), t;
            }, m = function (t, e, s) {
                var r = y(t), a = i.getTypeOf(e);
                if (r && M.call(this, r), s = d(s), s.dir || null === e || 'undefined' == typeof e)
                    s.base64 = !1, s.binary = !1, e = null;
                else if ('string' === a)
                    s.binary && !s.base64 && s.optimizedBinaryString !== !0 && (e = i.string2binary(e));
                else {
                    if (s.base64 = !1, s.binary = !0, !(a || e instanceof h))
                        throw new Error('The data of \'' + t + '\' is in an unsupported format !');
                    'arraybuffer' === a && (e = i.transformTo('uint8array', e));
                }
                return this.files[t] = new f(t, e, s);
            }, y = function (t) {
                '/' == t.slice(-1) && (t = t.substring(0, t.length - 1));
                var e = t.lastIndexOf('/');
                return e > 0 ? t.substring(0, e) : '';
            }, M = function (t) {
                return '/' != t.slice(-1) && (t += '/'), this.files[t] || m.call(this, t, null, { dir: !0 }), this.files[t];
            }, g = function (t, e) {
                var s, r = new h();
                return t._data instanceof h ? (r.uncompressedSize = t._data.uncompressedSize, r.crc32 = t._data.crc32, 0 === r.uncompressedSize || t.options.dir ? (e = n.STORE, r.compressedContent = '', r.crc32 = 0) : t._data.compressionMethod === e.magic ? r.compressedContent = t._data.getCompressedContent() : (s = t._data.getContent(), r.compressedContent = e.compress(i.transformTo(e.compressInputType, s)))) : (s = u(t), (!s || 0 === s.length || t.options.dir) && (e = n.STORE, s = ''), r.uncompressedSize = s.length, r.crc32 = this.crc32(s), r.compressedContent = e.compress(i.transformTo(e.compressInputType, s))), r.compressedSize = r.compressedContent.length, r.compressionMethod = e.magic, r;
            }, _ = function (t, e, i, r) {
                var a, n, h = (i.compressedContent, this.utf8encode(e.name)), o = h !== e.name, u = e.options;
                a = u.date.getHours(), a <<= 6, a |= u.date.getMinutes(), a <<= 5, a |= u.date.getSeconds() / 2, n = u.date.getFullYear() - 1980, n <<= 4, n |= u.date.getMonth() + 1, n <<= 5, n |= u.date.getDate();
                var l = '';
                l += '\n\0', l += o ? '\0\b' : '\0\0', l += i.compressionMethod, l += c(a, 2), l += c(n, 2), l += c(i.crc32, 4), l += c(i.compressedSize, 4), l += c(i.uncompressedSize, 4), l += c(h.length, 2), l += '\0\0';
                var f = s.LOCAL_FILE_HEADER + l + h, p = s.CENTRAL_FILE_HEADER + '\x14\0' + l + '\0\0' + '\0\0' + '\0\0' + (e.options.dir === !0 ? '\x10\0\0\0' : '\0\0\0\0') + c(r, 4) + h;
                return {
                    fileRecord: f,
                    dirRecord: p,
                    compressedObject: i
                };
            }, b = function () {
                this.data = [];
            };
        b.prototype = {
            append: function (t) {
                t = i.transformTo('string', t), this.data.push(t);
            },
            finalize: function () {
                return this.data.join('');
            }
        };
        var v = function (t) {
            this.data = new Uint8Array(t), this.index = 0;
        };
        v.prototype = {
            append: function (t) {
                0 !== t.length && (t = i.transformTo('uint8array', t), this.data.set(t, this.index), this.index += t.length);
            },
            finalize: function () {
                return this.data;
            }
        };
        var j = {
                load: function () {
                    throw new Error('Load method is not defined. Is the file jszip-load.js included ?');
                },
                filter: function (t) {
                    var e, i, s, r, a = [];
                    for (e in this.files)
                        this.files.hasOwnProperty(e) && (s = this.files[e], r = new f(s.name, s._data, p(s.options)), i = e.slice(this.root.length, e.length), e.slice(0, this.root.length) === this.root && t(i, r) && a.push(r));
                    return a;
                },
                file: function (t, e, i) {
                    if (1 === arguments.length) {
                        if (t instanceof RegExp) {
                            var s = t;
                            return this.filter(function (t, e) {
                                return !e.options.dir && s.test(t);
                            });
                        }
                        return this.filter(function (e, i) {
                            return !i.options.dir && e === t;
                        })[0] || null;
                    }
                    return t = this.root + t, m.call(this, t, e, i), this;
                },
                folder: function (t) {
                    if (!t)
                        return this;
                    if (t instanceof RegExp)
                        return this.filter(function (e, i) {
                            return i.options.dir && t.test(e);
                        });
                    var e = this.root + t, i = M.call(this, e), s = this.clone();
                    return s.root = i.name, s;
                },
                remove: function (t) {
                    t = this.root + t;
                    var e = this.files[t];
                    if (e || ('/' != t.slice(-1) && (t += '/'), e = this.files[t]), e)
                        if (e.options.dir)
                            for (var i = this.filter(function (e, i) {
                                        return i.name.slice(0, t.length) === t;
                                    }), s = 0; s < i.length; s++)
                                delete this.files[i[s].name];
                        else
                            delete this.files[t];
                    return this;
                },
                generate: function (t) {
                    t = p(t || {}, {
                        base64: !0,
                        compression: 'STORE',
                        type: 'base64'
                    }), i.checkSupport(t.type);
                    var e, r, h = [], o = 0, u = 0;
                    for (var l in this.files)
                        if (this.files.hasOwnProperty(l)) {
                            var f = this.files[l], d = f.options.compression || t.compression.toUpperCase(), m = n[d];
                            if (!m)
                                throw new Error(d + ' is not a valid compression method !');
                            var y = g.call(this, f, m), M = _.call(this, l, f, y, o);
                            o += M.fileRecord.length + y.compressedSize, u += M.dirRecord.length, h.push(M);
                        }
                    var j = '';
                    switch (j = s.CENTRAL_DIRECTORY_END + '\0\0' + '\0\0' + c(h.length, 2) + c(h.length, 2) + c(u, 4) + c(o, 4) + '\0\0', t.type.toLowerCase()) {
                    case 'uint8array':
                    case 'arraybuffer':
                    case 'blob':
                    case 'nodebuffer':
                        e = new v(o + u + j.length);
                        break;
                    case 'base64':
                    default:
                        e = new b(o + u + j.length);
                    }
                    for (r = 0; r < h.length; r++)
                        e.append(h[r].fileRecord), e.append(h[r].compressedObject.compressedContent);
                    for (r = 0; r < h.length; r++)
                        e.append(h[r].dirRecord);
                    e.append(j);
                    var x = e.finalize();
                    switch (t.type.toLowerCase()) {
                    case 'uint8array':
                    case 'arraybuffer':
                    case 'nodebuffer':
                        return i.transformTo(t.type.toLowerCase(), x);
                    case 'blob':
                        return i.arrayBuffer2Blob(i.transformTo('arraybuffer', x));
                    case 'base64':
                        return t.base64 ? a.encode(x) : x;
                    default:
                        return x;
                    }
                },
                crc32: function (t, e) {
                    if ('undefined' == typeof t || !t.length)
                        return 0;
                    var s = 'string' !== i.getTypeOf(t), r = [
                            0,
                            1996959894,
                            3993919788,
                            2567524794,
                            124634137,
                            1886057615,
                            3915621685,
                            2657392035,
                            249268274,
                            2044508324,
                            3772115230,
                            2547177864,
                            162941995,
                            2125561021,
                            3887607047,
                            2428444049,
                            498536548,
                            1789927666,
                            4089016648,
                            2227061214,
                            450548861,
                            1843258603,
                            4107580753,
                            2211677639,
                            325883990,
                            1684777152,
                            4251122042,
                            2321926636,
                            335633487,
                            1661365465,
                            4195302755,
                            2366115317,
                            997073096,
                            1281953886,
                            3579855332,
                            2724688242,
                            1006888145,
                            1258607687,
                            3524101629,
                            2768942443,
                            901097722,
                            1119000684,
                            3686517206,
                            2898065728,
                            853044451,
                            1172266101,
                            3705015759,
                            2882616665,
                            651767980,
                            1373503546,
                            3369554304,
                            3218104598,
                            565507253,
                            1454621731,
                            3485111705,
                            3099436303,
                            671266974,
                            1594198024,
                            3322730930,
                            2970347812,
                            795835527,
                            1483230225,
                            3244367275,
                            3060149565,
                            1994146192,
                            31158534,
                            2563907772,
                            4023717930,
                            1907459465,
                            112637215,
                            2680153253,
                            3904427059,
                            2013776290,
                            251722036,
                            2517215374,
                            3775830040,
                            2137656763,
                            141376813,
                            2439277719,
                            3865271297,
                            1802195444,
                            476864866,
                            2238001368,
                            4066508878,
                            1812370925,
                            453092731,
                            2181625025,
                            4111451223,
                            1706088902,
                            314042704,
                            2344532202,
                            4240017532,
                            1658658271,
                            366619977,
                            2362670323,
                            4224994405,
                            1303535960,
                            984961486,
                            2747007092,
                            3569037538,
                            1256170817,
                            1037604311,
                            2765210733,
                            3554079995,
                            1131014506,
                            879679996,
                            2909243462,
                            3663771856,
                            1141124467,
                            855842277,
                            2852801631,
                            3708648649,
                            1342533948,
                            654459306,
                            3188396048,
                            3373015174,
                            1466479909,
                            544179635,
                            3110523913,
                            3462522015,
                            1591671054,
                            702138776,
                            2966460450,
                            3352799412,
                            1504918807,
                            783551873,
                            3082640443,
                            3233442989,
                            3988292384,
                            2596254646,
                            62317068,
                            1957810842,
                            3939845945,
                            2647816111,
                            81470997,
                            1943803523,
                            3814918930,
                            2489596804,
                            225274430,
                            2053790376,
                            3826175755,
                            2466906013,
                            167816743,
                            2097651377,
                            4027552580,
                            2265490386,
                            503444072,
                            1762050814,
                            4150417245,
                            2154129355,
                            426522225,
                            1852507879,
                            4275313526,
                            2312317920,
                            282753626,
                            1742555852,
                            4189708143,
                            2394877945,
                            397917763,
                            1622183637,
                            3604390888,
                            2714866558,
                            953729732,
                            1340076626,
                            3518719985,
                            2797360999,
                            1068828381,
                            1219638859,
                            3624741850,
                            2936675148,
                            906185462,
                            1090812512,
                            3747672003,
                            2825379669,
                            829329135,
                            1181335161,
                            3412177804,
                            3160834842,
                            628085408,
                            1382605366,
                            3423369109,
                            3138078467,
                            570562233,
                            1426400815,
                            3317316542,
                            2998733608,
                            733239954,
                            1555261956,
                            3268935591,
                            3050360625,
                            752459403,
                            1541320221,
                            2607071920,
                            3965973030,
                            1969922972,
                            40735498,
                            2617837225,
                            3943577151,
                            1913087877,
                            83908371,
                            2512341634,
                            3803740692,
                            2075208622,
                            213261112,
                            2463272603,
                            3855990285,
                            2094854071,
                            198958881,
                            2262029012,
                            4057260610,
                            1759359992,
                            534414190,
                            2176718541,
                            4139329115,
                            1873836001,
                            414664567,
                            2282248934,
                            4279200368,
                            1711684554,
                            285281116,
                            2405801727,
                            4167216745,
                            1634467795,
                            376229701,
                            2685067896,
                            3608007406,
                            1308918612,
                            956543938,
                            2808555105,
                            3495958263,
                            1231636301,
                            1047427035,
                            2932959818,
                            3654703836,
                            1088359270,
                            936918000,
                            2847714899,
                            3736837829,
                            1202900863,
                            817233897,
                            3183342108,
                            3401237130,
                            1404277552,
                            615818150,
                            3134207493,
                            3453421203,
                            1423857449,
                            601450431,
                            3009837614,
                            3294710456,
                            1567103746,
                            711928724,
                            3020668471,
                            3272380065,
                            1510334235,
                            755167117
                        ];
                    'undefined' == typeof e && (e = 0);
                    var a = 0, n = 0, h = 0;
                    e = -1 ^ e;
                    for (var o = 0, u = t.length; u > o; o++)
                        h = s ? t[o] : t.charCodeAt(o), n = 255 & (e ^ h), a = r[n], e = e >>> 8 ^ a;
                    return -1 ^ e;
                },
                utf8encode: function (t) {
                    if (e.uint8array && 'function' == typeof TextEncoder) {
                        var s = TextEncoder('utf-8').encode(t);
                        return i.transformTo('string', s);
                    }
                    if (e.nodebuffer)
                        return i.transformTo('string', new Buffer(t, 'utf-8'));
                    for (var r = [], a = 0, n = 0; n < t.length; n++) {
                        var h = t.charCodeAt(n);
                        128 > h ? r[a++] = String.fromCharCode(h) : h > 127 && 2048 > h ? (r[a++] = String.fromCharCode(192 | h >> 6), r[a++] = String.fromCharCode(128 | 63 & h)) : (r[a++] = String.fromCharCode(224 | h >> 12), r[a++] = String.fromCharCode(128 | 63 & h >> 6), r[a++] = String.fromCharCode(128 | 63 & h));
                    }
                    return r.join('');
                },
                utf8decode: function (t) {
                    var s = [], r = 0, a = i.getTypeOf(t), n = 'string' !== a, h = 0, o = 0, u = 0, l = 0;
                    if (e.uint8array && 'function' == typeof TextDecoder)
                        return TextDecoder('utf-8').decode(i.transformTo('uint8array', t));
                    if (e.nodebuffer)
                        return i.transformTo('nodebuffer', t).toString('utf-8');
                    for (; h < t.length;)
                        o = n ? t[h] : t.charCodeAt(h), 128 > o ? (s[r++] = String.fromCharCode(o), h++) : o > 191 && 224 > o ? (u = n ? t[h + 1] : t.charCodeAt(h + 1), s[r++] = String.fromCharCode((31 & o) << 6 | 63 & u), h += 2) : (u = n ? t[h + 1] : t.charCodeAt(h + 1), l = n ? t[h + 2] : t.charCodeAt(h + 2), s[r++] = String.fromCharCode((15 & o) << 12 | (63 & u) << 6 | 63 & l), h += 3);
                    return s.join('');
                }
            };
        return j;
    }), define('jszip/dataReader', [
        'require',
        'jszip/utils'
    ], function (t) {
        function e() {
            this.data = null, this.length = 0, this.index = 0;
        }
        var i = t('jszip/utils');
        return e.prototype = {
            checkOffset: function (t) {
                this.checkIndex(this.index + t);
            },
            checkIndex: function (t) {
                if (this.length < t || 0 > t)
                    throw new Error('End of data reached (data length = ' + this.length + ', asked index = ' + t + '). Corrupted zip ?');
            },
            setIndex: function (t) {
                this.checkIndex(t), this.index = t;
            },
            skip: function (t) {
                this.setIndex(this.index + t);
            },
            byteAt: function () {
            },
            readInt: function (t) {
                var e, i = 0;
                for (this.checkOffset(t), e = this.index + t - 1; e >= this.index; e--)
                    i = (i << 8) + this.byteAt(e);
                return this.index += t, i;
            },
            readString: function (t) {
                return i.transformTo('string', this.readData(t));
            },
            readData: function () {
            },
            lastIndexOfSignature: function () {
            },
            readDate: function () {
                var t = this.readInt(4);
                return new Date((127 & t >> 25) + 1980, (15 & t >> 21) - 1, 31 & t >> 16, 31 & t >> 11, 63 & t >> 5, (31 & t) << 1);
            }
        }, e;
    }), define('jszip/stringReader', [
        'require',
        'jszip/dataReader',
        'jszip/utils'
    ], function (t) {
        function e(t, e) {
            this.data = t, e || (this.data = s.string2binary(this.data)), this.length = this.data.length, this.index = 0;
        }
        var i = t('jszip/dataReader'), s = t('jszip/utils');
        return e.prototype = new i(), e.prototype.byteAt = function (t) {
            return this.data.charCodeAt(t);
        }, e.prototype.lastIndexOfSignature = function (t) {
            return this.data.lastIndexOf(t);
        }, e.prototype.readData = function (t) {
            this.checkOffset(t);
            var e = this.data.slice(this.index, this.index + t);
            return this.index += t, e;
        }, e;
    }), define('jszip/uint8ArrayReader', [
        'require',
        'jszip/dataReader'
    ], function (t) {
        function e(t) {
            t && (this.data = t, this.length = this.data.length, this.index = 0);
        }
        var i = t('jszip/dataReader');
        return e.prototype = new i(), e.prototype.byteAt = function (t) {
            return this.data[t];
        }, e.prototype.lastIndexOfSignature = function (t) {
            for (var e = t.charCodeAt(0), i = t.charCodeAt(1), s = t.charCodeAt(2), r = t.charCodeAt(3), a = this.length - 4; a >= 0; --a)
                if (this.data[a] === e && this.data[a + 1] === i && this.data[a + 2] === s && this.data[a + 3] === r)
                    return a;
            return -1;
        }, e.prototype.readData = function (t) {
            this.checkOffset(t);
            var e = this.data.subarray(this.index, this.index + t);
            return this.index += t, e;
        }, e;
    }), define('jszip/nodeBufferReader', [
        'require',
        'jszip/uint8ArrayReader'
    ], function (t) {
        function e(t) {
            this.data = t, this.length = this.data.length, this.index = 0;
        }
        var i = t('jszip/uint8ArrayReader');
        return e.prototype = new i(), e.prototype.readData = function (t) {
            this.checkOffset(t);
            var e = this.data.slice(this.index, this.index + t);
            return this.index += t, e;
        }, e;
    }), define('jszip/zipEntry', [
        'require',
        'jszip/stringReader',
        'jszip/utils',
        'jszip/compressedObject',
        'jszip/object'
    ], function (t) {
        function e(t, e) {
            this.options = t, this.loadOptions = e;
        }
        var i = t('jszip/stringReader'), s = t('jszip/utils'), r = t('jszip/compressedObject'), a = t('jszip/object');
        return e.prototype = {
            isEncrypted: function () {
                return 1 === (1 & this.bitFlag);
            },
            useUTF8: function () {
                return 2048 === (2048 & this.bitFlag);
            },
            prepareCompressedContent: function (t, e, i) {
                return function () {
                    var s = t.index;
                    t.setIndex(e);
                    var r = t.readData(i);
                    return t.setIndex(s), r;
                };
            },
            prepareContent: function (t, e, i, r, a) {
                return function () {
                    var t = s.transformTo(r.uncompressInputType, this.getCompressedContent()), e = r.uncompress(t);
                    if (e.length !== a)
                        throw new Error('Bug : uncompressed data size mismatch');
                    return e;
                };
            },
            readLocalPart: function (t) {
                var e, i;
                if (t.skip(22), this.fileNameLength = t.readInt(2), i = t.readInt(2), this.fileName = t.readString(this.fileNameLength), t.skip(i), -1 == this.compressedSize || -1 == this.uncompressedSize)
                    throw new Error('Bug or corrupted zip : didn\'t get enough informations from the central directory (compressedSize == -1 || uncompressedSize == -1)');
                if (e = s.findCompression(this.compressionMethod), null === e)
                    throw new Error('Corrupted zip : compression ' + s.pretty(this.compressionMethod) + ' unknown (inner file : ' + this.fileName + ')');
                if (this.decompressed = new r(), this.decompressed.compressedSize = this.compressedSize, this.decompressed.uncompressedSize = this.uncompressedSize, this.decompressed.crc32 = this.crc32, this.decompressed.compressionMethod = this.compressionMethod, this.decompressed.getCompressedContent = this.prepareCompressedContent(t, t.index, this.compressedSize, e), this.decompressed.getContent = this.prepareContent(t, t.index, this.compressedSize, e, this.uncompressedSize), this.loadOptions.checkCRC32 && (this.decompressed = s.transformTo('string', this.decompressed.getContent()), a.crc32(this.decompressed) !== this.crc32))
                    throw new Error('Corrupted zip : CRC32 mismatch');
            },
            readCentralPart: function (t) {
                if (this.versionMadeBy = t.readString(2), this.versionNeeded = t.readInt(2), this.bitFlag = t.readInt(2), this.compressionMethod = t.readString(2), this.date = t.readDate(), this.crc32 = t.readInt(4), this.compressedSize = t.readInt(4), this.uncompressedSize = t.readInt(4), this.fileNameLength = t.readInt(2), this.extraFieldsLength = t.readInt(2), this.fileCommentLength = t.readInt(2), this.diskNumberStart = t.readInt(2), this.internalFileAttributes = t.readInt(2), this.externalFileAttributes = t.readInt(4), this.localHeaderOffset = t.readInt(4), this.isEncrypted())
                    throw new Error('Encrypted zip are not supported');
                this.fileName = t.readString(this.fileNameLength), this.readExtraFields(t), this.parseZIP64ExtraField(t), this.fileComment = t.readString(this.fileCommentLength), this.dir = 16 & this.externalFileAttributes ? !0 : !1;
            },
            parseZIP64ExtraField: function () {
                if (this.extraFields[1]) {
                    var t = new i(this.extraFields[1].value);
                    this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = t.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = t.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = t.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = t.readInt(4));
                }
            },
            readExtraFields: function (t) {
                var e, i, s, r = t.index;
                for (this.extraFields = this.extraFields || {}; t.index < r + this.extraFieldsLength;)
                    e = t.readInt(2), i = t.readInt(2), s = t.readString(i), this.extraFields[e] = {
                        id: e,
                        length: i,
                        value: s
                    };
            },
            handleUTF8: function () {
                this.useUTF8() && (this.fileName = a.utf8decode(this.fileName), this.fileComment = a.utf8decode(this.fileComment));
            }
        }, e;
    }), define('jszip/zipEntries', [
        'require',
        'jszip/stringReader',
        'jszip/nodeBufferReader',
        'jszip/uint8ArrayReader',
        'jszip/utils',
        'jszip/signature',
        'jszip/zipEntry',
        'jszip/support'
    ], function (t) {
        function e(t, e) {
            this.files = [], this.loadOptions = e, t && this.load(t);
        }
        var i = t('jszip/stringReader'), s = t('jszip/nodeBufferReader'), r = t('jszip/uint8ArrayReader'), a = t('jszip/utils'), n = t('jszip/signature'), h = t('jszip/zipEntry'), o = t('jszip/support');
        return e.prototype = {
            checkSignature: function (t) {
                var e = this.reader.readString(4);
                if (e !== t)
                    throw new Error('Corrupted zip or bug : unexpected signature (' + a.pretty(e) + ', expected ' + a.pretty(t) + ')');
            },
            readBlockEndOfCentral: function () {
                this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2), this.zipComment = this.reader.readString(this.zipCommentLength);
            },
            readBlockZip64EndOfCentral: function () {
                this.zip64EndOfCentralSize = this.reader.readInt(8), this.versionMadeBy = this.reader.readString(2), this.versionNeeded = this.reader.readInt(2), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
                for (var t, e, i, s = this.zip64EndOfCentralSize - 44, r = 0; s > r;)
                    t = this.reader.readInt(2), e = this.reader.readInt(4), i = this.reader.readString(e), this.zip64ExtensibleData[t] = {
                        id: t,
                        length: e,
                        value: i
                    };
            },
            readBlockZip64EndOfCentralLocator: function () {
                if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), this.disksCount > 1)
                    throw new Error('Multi-volumes zip are not supported');
            },
            readLocalFiles: function () {
                var t, e;
                for (t = 0; t < this.files.length; t++)
                    e = this.files[t], this.reader.setIndex(e.localHeaderOffset), this.checkSignature(n.LOCAL_FILE_HEADER), e.readLocalPart(this.reader), e.handleUTF8();
            },
            readCentralDir: function () {
                var t;
                for (this.reader.setIndex(this.centralDirOffset); this.reader.readString(4) === n.CENTRAL_FILE_HEADER;)
                    t = new h({ zip64: this.zip64 }, this.loadOptions), t.readCentralPart(this.reader), this.files.push(t);
            },
            readEndOfCentral: function () {
                var t = this.reader.lastIndexOfSignature(n.CENTRAL_DIRECTORY_END);
                if (-1 === t)
                    throw new Error('Corrupted zip : can\'t find end of central directory');
                if (this.reader.setIndex(t), this.checkSignature(n.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === a.MAX_VALUE_16BITS || this.diskWithCentralDirStart === a.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === a.MAX_VALUE_16BITS || this.centralDirRecords === a.MAX_VALUE_16BITS || this.centralDirSize === a.MAX_VALUE_32BITS || this.centralDirOffset === a.MAX_VALUE_32BITS) {
                    if (this.zip64 = !0, t = this.reader.lastIndexOfSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR), -1 === t)
                        throw new Error('Corrupted zip : can\'t find the ZIP64 end of central directory locator');
                    this.reader.setIndex(t), this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
                }
            },
            prepareReader: function (t) {
                var e = a.getTypeOf(t);
                this.reader = 'string' !== e || o.uint8array ? 'nodebuffer' === e ? new s(t) : new r(a.transformTo('uint8array', t)) : new i(t, this.loadOptions.optimizedBinaryString);
            },
            load: function (t) {
                this.prepareReader(t), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
            }
        }, e;
    }), define('jszip/load', [
        'require',
        'jszip/base64',
        'jszip/zipEntries'
    ], function (t) {
        var e = t('jszip/base64'), i = t('jszip/zipEntries');
        return function (t, s) {
            var r, a, n, h;
            for (s = s || {}, s.base64 && (t = e.decode(t)), a = new i(t, s), r = a.files, n = 0; n < r.length; n++)
                h = r[n], this.file(h.fileName, h.decompressed, {
                    binary: !0,
                    optimizedBinaryString: !0,
                    date: h.date,
                    dir: h.dir
                });
            return this;
        };
    }), define('jszip', [
        'require',
        'jszip/object',
        'jszip/load',
        'jszip/support',
        'jszip/utils',
        'jszip/base64',
        'jszip/compressions'
    ], function (t) {
        var e = function (t, e) {
            this.files = {}, this.root = '', t && this.load(t, e);
        };
        return e.prototype = t('jszip/object'), e.prototype.clone = function () {
            var t = new e();
            for (var i in this)
                'function' != typeof this[i] && (t[i] = this[i]);
            return t;
        }, e.prototype.load = t('jszip/load'), e.support = t('jszip/support'), e.utils = t('jszip/utils'), e.base64 = t('jszip/base64'), e.compressions = t('jszip/compressions'), e;
    }), define('shp/unzip', ['jszip'], function (t) {
        return function (e) {
            var i = new t(e), s = i.file(/.+/), r = {};
            return s.forEach(function (t) {
                'shp' === t.name.slice(-3).toLowerCase() || 'dbf' === t.name.slice(-3).toLowerCase() ? (r[t.name] = t.asText(), r[t.name] = t.asArrayBuffer()) : r[t.name] = t.asText();
            }), r;
        };
    }), function (global, undefined) {
        function canUseNextTick() {
            return 'object' == typeof process && '[object process]' === Object.prototype.toString.call(process);
        }
        function canUseMessageChannel() {
            return !!global.MessageChannel;
        }
        function canUsePostMessage() {
            if (!global.postMessage || global.importScripts)
                return !1;
            var t = !0, e = global.onmessage;
            return global.onmessage = function () {
                t = !1;
            }, global.postMessage('', '*'), global.onmessage = e, t;
        }
        function canUseReadyStateChange() {
            return 'document' in global && 'onreadystatechange' in global.document.createElement('script');
        }
        function installNextTickImplementation(t) {
            t.setImmediate = function () {
                var t = tasks.addFromSetImmediateArguments(arguments);
                return process.nextTick(function () {
                    tasks.runIfPresent(t);
                }), t;
            };
        }
        function installMessageChannelImplementation(t) {
            var e = new global.MessageChannel();
            e.port1.onmessage = function (t) {
                var e = t.data;
                tasks.runIfPresent(e);
            }, t.setImmediate = function () {
                var t = tasks.addFromSetImmediateArguments(arguments);
                return e.port2.postMessage(t), t;
            };
        }
        function installPostMessageImplementation(t) {
            function e(t, e) {
                return 'string' == typeof t && t.substring(0, e.length) === e;
            }
            function i(t) {
                if (t.source === global && e(t.data, s)) {
                    var i = t.data.substring(s.length);
                    tasks.runIfPresent(i);
                }
            }
            var s = 'com.bn.NobleJS.setImmediate' + Math.random();
            global.addEventListener ? global.addEventListener('message', i, !1) : global.attachEvent('onmessage', i), t.setImmediate = function () {
                var t = tasks.addFromSetImmediateArguments(arguments);
                return global.postMessage(s + t, '*'), t;
            };
        }
        function installReadyStateChangeImplementation(t) {
            t.setImmediate = function () {
                var t = tasks.addFromSetImmediateArguments(arguments), e = global.document.createElement('script');
                return e.onreadystatechange = function () {
                    tasks.runIfPresent(t), e.onreadystatechange = null, e.parentNode.removeChild(e), e = null;
                }, global.document.documentElement.appendChild(e), t;
            };
        }
        function installSetTimeoutImplementation(t) {
            t.setImmediate = function () {
                var t = tasks.addFromSetImmediateArguments(arguments);
                return global.setTimeout(function () {
                    tasks.runIfPresent(t);
                }, 0), t;
            };
        }
        var tasks = function () {
                function Task(t, e) {
                    this.handler = t, this.args = e;
                }
                Task.prototype.run = function () {
                    if ('function' == typeof this.handler)
                        this.handler.apply(undefined, this.args);
                    else {
                        var scriptSource = '' + this.handler;
                        eval(scriptSource);
                    }
                };
                var nextHandle = 1, tasksByHandle = {}, currentlyRunningATask = !1;
                return {
                    addFromSetImmediateArguments: function (t) {
                        var e = t[0], i = Array.prototype.slice.call(t, 1), s = new Task(e, i), r = nextHandle++;
                        return tasksByHandle[r] = s, r;
                    },
                    runIfPresent: function (t) {
                        if (currentlyRunningATask)
                            global.setTimeout(function () {
                                tasks.runIfPresent(t);
                            }, 0);
                        else {
                            var e = tasksByHandle[t];
                            if (e) {
                                currentlyRunningATask = !0;
                                try {
                                    e.run();
                                } finally {
                                    delete tasksByHandle[t], currentlyRunningATask = !1;
                                }
                            }
                        }
                    },
                    remove: function (t) {
                        delete tasksByHandle[t];
                    }
                };
            }();
        if (!global.setImmediate) {
            var attachTo = 'function' == typeof Object.getPrototypeOf && 'setTimeout' in Object.getPrototypeOf(global) ? Object.getPrototypeOf(global) : global;
            canUseNextTick() ? installNextTickImplementation(attachTo) : canUsePostMessage() ? installPostMessageImplementation(attachTo) : canUseMessageChannel() ? installMessageChannelImplementation(attachTo) : canUseReadyStateChange() ? installReadyStateChangeImplementation(attachTo) : installSetTimeoutImplementation(attachTo), attachTo.clearImmediate = tasks.remove;
        }
    }('object' == typeof global && global ? global : this), define('shp/lie', [], function () {
        function t() {
            function t() {
                this.then = function (t, e) {
                    return a(t, e);
                };
            }
            var a = function (t, h, o) {
                    var u;
                    if (t !== a)
                        return u = e(), a.queue.push({
                            deferred: u,
                            resolve: t,
                            reject: h
                        }), u.promise;
                    for (var l, f, c, p = h ? 'resolve' : 'reject', d = 0, m = a.queue.length; m > d; d++)
                        l = a.queue[d], f = l.deferred, c = l[p], typeof c !== r ? f[p](o) : s(c, o, f);
                    a = i(n, o, h);
                }, n = new t();
            this.promise = n, a.queue = [], this.resolve = function (t) {
                a.queue && a(a, !0, t);
            }, this.fulfill = this.resolve, this.reject = function (t) {
                a.queue && a(a, !1, t);
            };
        }
        function e() {
            return new t();
        }
        function i(t, i, a) {
            return function (n, h) {
                var o, u = a ? n : h;
                return typeof u !== r ? t : (s(u, i, o = e()), o.promise);
            };
        }
        function s(t, e, i) {
            setImmediate(function () {
                var s;
                try {
                    s = t(e), s && typeof s.then === r ? s.then(i.resolve, i.reject) : i.resolve(s);
                } catch (a) {
                    i.reject(a);
                }
            });
        }
        var r = 'function';
        return e.resolve = function (t) {
            var e = {};
            return e.then = i(e, t, !0), e;
        }, e.reject = function (t) {
            var e = {};
            return e.then = i(e, t, !1), e;
        }, e.all = function (t) {
            var i = e(), s = t.length, r = 0, a = [], n = function (t) {
                    return function (e) {
                        a[t] = e, r++, r === s && i.resolve(a);
                    };
                };
            return t.forEach(function (t, e) {
                t.then(n(e), function (t) {
                    i.reject(t);
                });
            }), i.promise;
        }, e;
    }), define('shp/binaryajax', ['./lie'], function (t) {
        return function (e) {
            var i = t(), s = e.slice(-3), r = new XMLHttpRequest();
            return r.open('GET', e, !0), 'prj' !== s && (r.responseType = 'arraybuffer'), r.addEventListener('load', function () {
                return r.status > 399 ? 'prj' === s ? i.resolve(!1) : i.reject(r.status) : (i.resolve(r.response), void 0);
            }, !1), r.send(), i.promise;
        };
    }), define('shp/parseShp', [], function () {
        function t(t) {
            for (var e, i, s = 0, r = 1, a = t.length; a > r;)
                e = i || t[0], i = t[r], s += (i[0] - e[0]) * (i[1] + e[1]), r++;
            return s > 0;
        }
        function e(e, i) {
            return t(i) || !e.length ? e.push([i]) : e[e.length - 1].push(i), e;
        }
        function i(t, e) {
            return {
                type: 'Point',
                coordinates: e(t, 0)
            };
        }
        function s(t, e) {
            var s = i(t, e);
            return s.coordinates.push(e(t, 16)), s;
        }
        function r(t, e, i, s) {
            for (var r = [], a = 0; i > a;)
                r.push(s(t, e)), e += 16, a++;
            return r;
        }
        function a(t, e, i, s) {
            for (var r = 0; i > r;)
                s[r].push(t.getFloat64(e, !0)), r++, e += 8;
            return s;
        }
        function n(t, e, i, s, a, n) {
            for (var h, o, u = [], l = 0, f = 0; s > l;)
                l++, i += 4, h = f, f = l === s ? a : t.getInt32(i, !0), o = f - h, o && (u.push(r(t, e, o, n)), e += o << 4);
            return u;
        }
        function h(t, e, i, s) {
            for (var r = 0; i > r;)
                s[r] = a(t, e, s[r].length, s[r]), e += s[r].length << 3, r++;
            return s;
        }
        function o(t, e) {
            var i = {};
            i.bbox = [
                t.getFloat64(0, !0),
                t.getFloat64(8, !0),
                t.getFloat64(16, !0),
                t.getFloat64(24, !0)
            ];
            var s = t.getInt32(32, !0), a = 36;
            return 1 === s ? (i.type = 'Point', i.coordinates = e(t, a)) : (i.type = 'MultiPoint', i.coordinates = r(t, a, s, e)), i;
        }
        function u(t, e) {
            var i, s = o(t, e);
            if ('Point' === s.type)
                return s.coordinates.push(t.getFloat64(72, !0)), s;
            i = s.coordinates.length;
            var r = 56 + (i << 4);
            return s.coordinates = a(t, r, i, s.coordinates), s;
        }
        function l(t, e) {
            var i = {};
            i.bbox = [
                t.getFloat64(0, !0),
                t.getFloat64(8, !0),
                t.getFloat64(16, !0),
                t.getFloat64(24, !0)
            ];
            var s, a, h = t.getInt32(32, !0), o = t.getInt32(36, !0);
            return 1 === h ? (i.type = 'LineString', s = 44, i.coordinates = r(t, s, o, e)) : (i.type = 'MultiLineString', s = 40 + (h << 2), a = 40, i.coordinates = n(t, s, a, h, o, e)), i;
        }
        function f(t, e) {
            var i = l(t, e), s = i.coordinates.length, r = 60 + (s << 4);
            return 'LineString' === i.type ? (i.coordinates = a(t, r, s, i.coordinates), i) : (i.coordinates = h(t, r, s, i.coordinates), i);
        }
        function c(t) {
            return 'LineString' === t.type ? (t.type = 'Polygon', t.coordinates = [t.coordinates], t) : (t.coordinates = t.coordinates.reduce(e, []), 1 === t.coordinates.length ? (t.type = 'Polygon', t.coordinates = t.coordinates[0], t) : (t.type = 'MultiPolygon', t));
        }
        function p(t, e) {
            return c(l(t, e));
        }
        function d(t, e) {
            return c(f(t, e));
        }
        function m(t, e) {
            if (t > 20 && (t -= 20), !(t in g))
                return console.log('I don\'t know that shp type'), function () {
                    return function () {
                    };
                };
            var i = g[t], s = y(e);
            return function (t) {
                return i(t, s);
            };
        }
        function y(t) {
            return t ? function (e, i) {
                return t.inverse([
                    e.getFloat64(i, !0),
                    e.getFloat64(i + 8, !0)
                ]);
            } : function (t, e) {
                return [
                    t.getFloat64(e, !0),
                    t.getFloat64(e + 8, !0)
                ];
            };
        }
        var M = function (t) {
                var e = new DataView(t, 0, 100);
                return {
                    length: e.getInt32(24, !1),
                    version: e.getInt32(28, !0),
                    shpCode: e.getInt32(32, !0),
                    bbox: [
                        e.getFloat64(36, !0),
                        e.getFloat64(44, !0),
                        e.getFloat64(52, !0),
                        e.getFloat64(52, !0)
                    ]
                };
            }, g = {
                1: i,
                3: l,
                5: p,
                8: o,
                11: s,
                13: f,
                15: d,
                18: u
            }, _ = function (t, e) {
                var i = new DataView(t, e, 12), s = i.getInt32(4, !1) << 1, r = new DataView(t, e + 12, s - 4);
                return {
                    id: i.getInt32(0, !1),
                    len: s,
                    data: r,
                    type: i.getInt32(8, !0)
                };
            }, b = function (t, e) {
                for (var i, s = 100, r = t.byteLength, a = []; r > s;)
                    i = _(t, s), s += 8, s += i.len, i.type && a.push(e(i.data));
                return a;
            };
        return function (t, e) {
            var i = M(t);
            return b(t, m(i.shpCode, e));
        };
    }), define('shp/parseDbf', [], function () {
        function t(t) {
            var e = new DataView(t), i = {};
            return i.lastUpdated = new Date(e.getUint8(1, !0) + 1900, e.getUint8(2, !0), e.getUint8(3, !0)), i.records = e.getUint32(4, !0), i.headerLen = e.getUint16(8, !0), i.recLen = e.getUint16(10, !0), i;
        }
        function e(t) {
            for (var e = new DataView(t), i = [], s = 32;;) {
                if (i.push({
                        name: String.fromCharCode.apply(this, new Uint8Array(t, s, 10)).replace(/\0|\s+$/g, ''),
                        dataType: String.fromCharCode(e.getUint8(s + 11)),
                        len: e.getUint8(s + 16),
                        decimal: e.getUint8(s + 17)
                    }), 13 === e.getUint8(s + 32))
                    break;
                s += 32;
            }
            return i;
        }
        function i(t, e, i) {
            for (var r, a, n = {}, h = 0, o = i.length; o > h;)
                a = i[h], r = s(t, e, a.len, a.dataType), e += a.len, 'undefined' != typeof r && (n[a.name] = r), h++;
            return n;
        }
        var s = function (t, e, i, s) {
            var r = new Uint8Array(t, e, i), a = String.fromCharCode.apply(this, r).replace(/\0|\s+$/g, '');
            return 'N' === s ? parseFloat(a, 10) : 'D' === s ? new Date(a.slice(0, 4), parseInt(a.slice(4, 6), 10) - 1, a.slice(6, 8)) : a;
        };
        return function (s) {
            var r = e(s), a = t(s), n = (r.length + 1 << 5) + 2, h = a.recLen, o = a.records;
            new DataView(s);
            for (var u = []; o;)
                u.push(i(s, n, r)), n += h, o--;
            return u;
        };
    }), define('shp', [
        'require',
        'proj4',
        'shp/unzip',
        'shp/binaryajax',
        'shp/parseShp',
        'shp/parseDbf',
        'shp/lie'
    ], function (t) {
        function e(t, i) {
            return e.getShapefile(t, i);
        }
        function i(t, i) {
            return a(t).then(function (t) {
                return e.parseZip(t, i);
            });
        }
        var s = t('proj4'), r = t('shp/unzip'), a = t('shp/binaryajax'), n = t('shp/parseShp'), h = t('shp/parseDbf'), o = t('shp/lie');
        return e.combine = function (t) {
            var e = {};
            e.type = 'FeatureCollection', e.features = [];
            for (var i = 0, s = t[0].length; s > i;)
                e.features.push({
                    type: 'Feature',
                    geometry: t[0][i],
                    properties: t[1][i]
                }), i++;
            return e;
        }, e.parseZip = function (t, i) {
            var a, o = r(t), u = [];
            i = i || [];
            for (a in o)
                'shp' === a.slice(-3).toLowerCase() ? u.push(a.slice(0, -4)) : 'dbf' === a.slice(-3).toLowerCase() ? o[a] = h(o[a]) : 'prj' === a.slice(-3).toLowerCase() ? o[a] = s(o[a]) : ('json' === a.slice(-4).toLowerCase() || i.indexOf(a.split('.').pop()) > -1) && u.push(a);
            var l = u.map(function (t) {
                    var s;
                    return 'json' === t.slice(-4).toLowerCase() ? (s = JSON.parse(o[t]), s.fileName = t.slice(0, t.lastIndexOf('.'))) : i.indexOf(t.slice(t.lastIndexOf('.') + 1)) > -1 ? (s = o[t], s.fileName = t) : (s = e.combine([
                        n(o[t + '.shp'], o[t + '.prj']),
                        o[t + '.dbf']
                    ]), s.fileName = t), s;
                });
            return 1 === l.length ? l[0] : l;
        }, e.getShapefile = function (t, r) {
            return 'string' == typeof t ? '.zip' === t.slice(-4) ? i(t, r) : o.all([
                o.all([
                    a(t + '.shp'),
                    a(t + '.prj')
                ]).then(function (t) {
                    return n(t[0], t[1] ? s(t[1]) : !1);
                }),
                a(t + '.dbf').then(h)
            ]).then(e.combine) : o.resolve(e.parseZip(t));
        }, e.deferred = o, e;
    }), ___forBrowserify___('shp');
});
},{"__browserify_Buffer":3,"__browserify_process":4}],17:[function(require,module,exports){
;(function(){
	var store = {},
		win = window,
		doc = win.document,
		localStorageName = 'localStorage',
		namespace = '__storejs__',
		storage

	store.disabled = false
	store.set = function(key, value) {}
	store.get = function(key) {}
	store.remove = function(key) {}
	store.clear = function() {}
	store.transact = function(key, defaultVal, transactionFn) {
		var val = store.get(key)
		if (transactionFn == null) {
			transactionFn = defaultVal
			defaultVal = null
		}
		if (typeof val == 'undefined') { val = defaultVal || {} }
		transactionFn(val)
		store.set(key, val)
	}
	store.getAll = function() {}

	store.serialize = function(value) {
		return JSON.stringify(value)
	}
	store.deserialize = function(value) {
		if (typeof value != 'string') { return undefined }
		try { return JSON.parse(value) }
		catch(e) { return value || undefined }
	}

	// Functions to encapsulate questionable FireFox 3.6.13 behavior
	// when about.config::dom.storage.enabled === false
	// See https://github.com/marcuswestin/store.js/issues#issue/13
	function isLocalStorageNameSupported() {
		try { return (localStorageName in win && win[localStorageName]) }
		catch(err) { return false }
	}

	if (isLocalStorageNameSupported()) {
		storage = win[localStorageName]
		store.set = function(key, val) {
			if (val === undefined) { return store.remove(key) }
			storage.setItem(key, store.serialize(val))
			return val
		}
		store.get = function(key) { return store.deserialize(storage.getItem(key)) }
		store.remove = function(key) { storage.removeItem(key) }
		store.clear = function() { storage.clear() }
		store.getAll = function() {
			var ret = {}
			for (var i=0; i<storage.length; ++i) {
				var key = storage.key(i)
				ret[key] = store.get(key)
			}
			return ret
		}
	} else if (doc.documentElement.addBehavior) {
		var storageOwner,
			storageContainer
		// Since #userData storage applies only to specific paths, we need to
		// somehow link our data to a specific path.  We choose /favicon.ico
		// as a pretty safe option, since all browsers already make a request to
		// this URL anyway and being a 404 will not hurt us here.  We wrap an
		// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
		// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
		// since the iframe access rules appear to allow direct access and
		// manipulation of the document element, even for a 404 page.  This
		// document can be used instead of the current document (which would
		// have been limited to the current path) to perform #userData storage.
		try {
			storageContainer = new ActiveXObject('htmlfile')
			storageContainer.open()
			storageContainer.write('<s' + 'cript>document.w=window</s' + 'cript><iframe src="/favicon.ico"></iframe>')
			storageContainer.close()
			storageOwner = storageContainer.w.frames[0].document
			storage = storageOwner.createElement('div')
		} catch(e) {
			// somehow ActiveXObject instantiation failed (perhaps some special
			// security settings or otherwse), fall back to per-path storage
			storage = doc.createElement('div')
			storageOwner = doc.body
		}
		function withIEStorage(storeFunction) {
			return function() {
				var args = Array.prototype.slice.call(arguments, 0)
				args.unshift(storage)
				// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
				// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
				storageOwner.appendChild(storage)
				storage.addBehavior('#default#userData')
				storage.load(localStorageName)
				var result = storeFunction.apply(store, args)
				storageOwner.removeChild(storage)
				return result
			}
		}

		// In IE7, keys may not contain special chars. See all of https://github.com/marcuswestin/store.js/issues/40
		var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
		function ieKeyFix(key) {
			return key.replace(forbiddenCharsRegex, '___')
		}
		store.set = withIEStorage(function(storage, key, val) {
			key = ieKeyFix(key)
			if (val === undefined) { return store.remove(key) }
			storage.setAttribute(key, store.serialize(val))
			storage.save(localStorageName)
			return val
		})
		store.get = withIEStorage(function(storage, key) {
			key = ieKeyFix(key)
			return store.deserialize(storage.getAttribute(key))
		})
		store.remove = withIEStorage(function(storage, key) {
			key = ieKeyFix(key)
			storage.removeAttribute(key)
			storage.save(localStorageName)
		})
		store.clear = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes
			storage.load(localStorageName)
			for (var i=0, attr; attr=attributes[i]; i++) {
				storage.removeAttribute(attr.name)
			}
			storage.save(localStorageName)
		})
		store.getAll = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes
			var ret = {}
			for (var i=0, attr; attr=attributes[i]; ++i) {
				var key = ieKeyFix(attr.name)
				ret[attr.name] = store.deserialize(storage.getAttribute(key))
			}
			return ret
		})
	}

	try {
		store.set(namespace, namespace)
		if (store.get(namespace) != namespace) { store.disabled = true }
		store.remove(namespace)
	} catch(e) {
		store.disabled = true
	}
	store.enabled = !store.disabled
	if (typeof module != 'undefined' && module.exports) { module.exports = store }
	else if (typeof define === 'function' && define.amd) { define(store) }
	else { this.store = store }
})();

},{}],18:[function(require,module,exports){
toGeoJSON = (function() {
    'use strict';

    var removeSpace = (/\s*/g),
        trimSpace = (/^\s*|\s*$/g),
        splitSpace = (/\s+/);
    // generate a short, numeric hash of a string
    function okhash(x) {
        if (!x || !x.length) return 0;
        for (var i = 0, h = 0; i < x.length; i++) {
            h = ((h << 5) - h) + x.charCodeAt(i) | 0;
        } return h;
    }
    // all Y children of X
    function get(x, y) { return x.getElementsByTagName(y); }
    function attr(x, y) { return x.getAttribute(y); }
    function attrf(x, y) { return parseFloat(attr(x, y)); }
    // one Y child of X, if any, otherwise null
    function get1(x, y) { var n = get(x, y); return n.length ? n[0] : null; }
    // https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
    function norm(el) { if (el.normalize) { el.normalize(); } return el; }
    // cast array x into numbers
    function numarray(x) {
        for (var j = 0, o = []; j < x.length; j++) o[j] = parseFloat(x[j]);
        return o;
    }
    function clean(x) {
        var o = {};
        for (var i in x) if (x[i]) o[i] = x[i];
        return o;
    }
    // get the content of a text node, if any
    function nodeVal(x) { if (x) {norm(x);} return x && x.firstChild && x.firstChild.nodeValue; }
    // get one coordinate from a coordinate array, if any
    function coord1(v) { return numarray(v.replace(removeSpace, '').split(',')); }
    // get all coordinates from a coordinate array as [[],[]]
    function coord(v) {
        var coords = v.replace(trimSpace, '').split(splitSpace),
            o = [];
        for (var i = 0; i < coords.length; i++) {
            o.push(coord1(coords[i]));
        }
        return o;
    }
    function coordPair(x) { return [attrf(x, 'lon'), attrf(x, 'lat')]; }

    // create a new feature collection parent object
    function fc() {
        return {
            type: 'FeatureCollection',
            features: []
        };
    }

    var styleSupport = false;
    if (typeof XMLSerializer !== 'undefined') {
        var serializer = new XMLSerializer();
        styleSupport = true;
    }
    function xml2str(str) { return serializer.serializeToString(str); }

    var t = {
        kml: function(doc, o) {
            o = o || {};

            var gj = fc(),
                // styleindex keeps track of hashed styles in order to match features
                styleIndex = {},
                // atomic geospatial types supported by KML - MultiGeometry is
                // handled separately
                geotypes = ['Polygon', 'LineString', 'Point', 'Track'],
                // all root placemarks in the file
                placemarks = get(doc, 'Placemark'),
                styles = get(doc, 'Style');

            if (styleSupport) for (var k = 0; k < styles.length; k++) {
                styleIndex['#' + attr(styles[k], 'id')] = okhash(xml2str(styles[k])).toString(16);
            }
            for (var j = 0; j < placemarks.length; j++) {
                gj.features = gj.features.concat(getPlacemark(placemarks[j]));
            }
            function gxCoord(v) { return numarray(v.split(' ')); }
            function gxCoords(root) {
                var elems = get(root, 'coord', 'gx'), coords = [];
                for (var i = 0; i < elems.length; i++) coords.push(gxCoord(nodeVal(elems[i])));
                return coords;
            }
            function getGeometry(root) {
                var geomNode, geomNodes, i, j, k, geoms = [];
                if (get1(root, 'MultiGeometry')) return getGeometry(get1(root, 'MultiGeometry'));
                if (get1(root, 'MultiTrack')) return getGeometry(get1(root, 'MultiTrack'));
                for (i = 0; i < geotypes.length; i++) {
                    geomNodes = get(root, geotypes[i]);
                    if (geomNodes) {
                        for (j = 0; j < geomNodes.length; j++) {
                            geomNode = geomNodes[j];
                            if (geotypes[i] == 'Point') {
                                geoms.push({
                                    type: 'Point',
                                    coordinates: coord1(nodeVal(get1(geomNode, 'coordinates')))
                                });
                            } else if (geotypes[i] == 'LineString') {
                                geoms.push({
                                    type: 'LineString',
                                    coordinates: coord(nodeVal(get1(geomNode, 'coordinates')))
                                });
                            } else if (geotypes[i] == 'Polygon') {
                                var rings = get(geomNode, 'LinearRing'),
                                    coords = [];
                                for (k = 0; k < rings.length; k++) {
                                    coords.push(coord(nodeVal(get1(rings[k], 'coordinates'))));
                                }
                                geoms.push({
                                    type: 'Polygon',
                                    coordinates: coords
                                });
                            } else if (geotypes[i] == 'Track') {
                                geoms.push({
                                    type: 'LineString',
                                    coordinates: gxCoords(geomNode)
                                });
                            }
                        }
                    }
                }
                return geoms;
            }
            function getPlacemark(root) {
                var geoms = getGeometry(root), i, properties = {},
                    name = nodeVal(get1(root, 'name')),
                    styleUrl = nodeVal(get1(root, 'styleUrl')),
                    description = nodeVal(get1(root, 'description')),
                    extendedData = get1(root, 'ExtendedData');

                if (!geoms.length) return [];
                if (name) properties.name = name;
                if (styleUrl && styleIndex[styleUrl]) {
                    properties.styleUrl = styleUrl;
                    properties.styleHash = styleIndex[styleUrl];
                }
                if (description) properties.description = description;
                if (extendedData) {
                    var datas = get(extendedData, 'Data'),
                        simpleDatas = get(extendedData, 'SimpleData');

                    for (i = 0; i < datas.length; i++) {
                        properties[datas[i].getAttribute('name')] = nodeVal(get1(datas[i], 'value'));
                    }
                    for (i = 0; i < simpleDatas.length; i++) {
                        properties[simpleDatas[i].getAttribute('name')] = nodeVal(simpleDatas[i]);
                    }
                }
                return [{
                    type: 'Feature',
                    geometry: (geoms.length === 1) ? geoms[0] : {
                        type: 'GeometryCollection',
                        geometries: geoms
                    },
                    properties: properties
                }];
            }
            return gj;
        },
        gpx: function(doc, o) {
            var i,
                tracks = get(doc, 'trk'),
                routes = get(doc, 'rte'),
                waypoints = get(doc, 'wpt'),
                // a feature collection
                gj = fc();
            for (i = 0; i < tracks.length; i++) {
                gj.features.push(getLinestring(tracks[i], 'trkpt'));
            }
            for (i = 0; i < routes.length; i++) {
                gj.features.push(getLinestring(routes[i], 'rtept'));
            }
            for (i = 0; i < waypoints.length; i++) {
                gj.features.push(getPoint(waypoints[i]));
            }
            function getLinestring(node, pointname) {
                var j, pts = get(node, pointname), line = [];
                for (j = 0; j < pts.length; j++) {
                    line.push(coordPair(pts[j]));
                }
                return {
                    type: 'Feature',
                    properties: getProperties(node),
                    geometry: {
                        type: 'LineString',
                        coordinates: line
                    }
                };
            }
            function getPoint(node) {
                var prop = getProperties(node);
                prop.ele = nodeVal(get1(node, 'ele'));
                prop.sym = nodeVal(get1(node, 'sym'));
                return {
                    type: 'Feature',
                    properties: prop,
                    geometry: {
                        type: 'Point',
                        coordinates: coordPair(node)
                    }
                };
            }
            function getProperties(node) {
                var meta = ['name', 'desc', 'author', 'copyright', 'link',
                            'time', 'keywords'],
                    prop = {},
                    k;
                for (k = 0; k < meta.length; k++) {
                    prop[meta[k]] = nodeVal(get1(node, meta[k]));
                }
                return clean(prop);
            }
            return gj;
        }
    };
    return t;
})();

if (typeof module !== 'undefined') module.exports = toGeoJSON;

},{}],"CTt6O6":[function(require,module,exports){
var fs = require("fs");

var topojson = module.exports = new Function("topojson", "return " + "topojson = (function() {\n\n  function merge(topology, arcs) {\n    var fragmentByStart = {},\n        fragmentByEnd = {};\n\n    arcs.forEach(function(i) {\n      var e = ends(i),\n          start = e[0],\n          end = e[1],\n          f, g;\n\n      if (f = fragmentByEnd[start]) {\n        delete fragmentByEnd[f.end];\n        f.push(i);\n        f.end = end;\n        if (g = fragmentByStart[end]) {\n          delete fragmentByStart[g.start];\n          var fg = g === f ? f : f.concat(g);\n          fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;\n        } else if (g = fragmentByEnd[end]) {\n          delete fragmentByStart[g.start];\n          delete fragmentByEnd[g.end];\n          var fg = f.concat(g.map(function(i) { return ~i; }).reverse());\n          fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.start] = fg;\n        } else {\n          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;\n        }\n      } else if (f = fragmentByStart[end]) {\n        delete fragmentByStart[f.start];\n        f.unshift(i);\n        f.start = start;\n        if (g = fragmentByEnd[start]) {\n          delete fragmentByEnd[g.end];\n          var gf = g === f ? f : g.concat(f);\n          fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;\n        } else if (g = fragmentByStart[start]) {\n          delete fragmentByStart[g.start];\n          delete fragmentByEnd[g.end];\n          var gf = g.map(function(i) { return ~i; }).reverse().concat(f);\n          fragmentByStart[gf.start = g.end] = fragmentByEnd[gf.end = f.end] = gf;\n        } else {\n          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;\n        }\n      } else if (f = fragmentByStart[start]) {\n        delete fragmentByStart[f.start];\n        f.unshift(~i);\n        f.start = end;\n        if (g = fragmentByEnd[end]) {\n          delete fragmentByEnd[g.end];\n          var gf = g === f ? f : g.concat(f);\n          fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;\n        } else if (g = fragmentByStart[end]) {\n          delete fragmentByStart[g.start];\n          delete fragmentByEnd[g.end];\n          var gf = g.map(function(i) { return ~i; }).reverse().concat(f);\n          fragmentByStart[gf.start = g.end] = fragmentByEnd[gf.end = f.end] = gf;\n        } else {\n          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;\n        }\n      } else if (f = fragmentByEnd[end]) {\n        delete fragmentByEnd[f.end];\n        f.push(~i);\n        f.end = start;\n        if (g = fragmentByEnd[start]) {\n          delete fragmentByStart[g.start];\n          var fg = g === f ? f : f.concat(g);\n          fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;\n        } else if (g = fragmentByStart[start]) {\n          delete fragmentByStart[g.start];\n          delete fragmentByEnd[g.end];\n          var fg = f.concat(g.map(function(i) { return ~i; }).reverse());\n          fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.start] = fg;\n        } else {\n          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;\n        }\n      } else {\n        f = [i];\n        fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;\n      }\n    });\n\n    function ends(i) {\n      var arc = topology.arcs[i], p0 = arc[0], p1 = [0, 0];\n      arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });\n      return [p0, p1];\n    }\n\n    var fragments = [];\n    for (var k in fragmentByEnd) fragments.push(fragmentByEnd[k]);\n    return fragments;\n  }\n\n  function mesh(topology, o, filter) {\n    var arcs = [];\n\n    if (arguments.length > 1) {\n      var geomsByArc = [],\n          geom;\n\n      function arc(i) {\n        if (i < 0) i = ~i;\n        (geomsByArc[i] || (geomsByArc[i] = [])).push(geom);\n      }\n\n      function line(arcs) {\n        arcs.forEach(arc);\n      }\n\n      function polygon(arcs) {\n        arcs.forEach(line);\n      }\n\n      function geometry(o) {\n        if (o.type === \"GeometryCollection\") o.geometries.forEach(geometry);\n        else if (o.type in geometryType) {\n          geom = o;\n          geometryType[o.type](o.arcs);\n        }\n      }\n\n      var geometryType = {\n        LineString: line,\n        MultiLineString: polygon,\n        Polygon: polygon,\n        MultiPolygon: function(arcs) { arcs.forEach(polygon); }\n      };\n\n      geometry(o);\n\n      geomsByArc.forEach(arguments.length < 3\n          ? function(geoms, i) { arcs.push(i); }\n          : function(geoms, i) { if (filter(geoms[0], geoms[geoms.length - 1])) arcs.push(i); });\n    } else {\n      for (var i = 0, n = topology.arcs.length; i < n; ++i) arcs.push(i);\n    }\n\n    return object(topology, {type: \"MultiLineString\", arcs: merge(topology, arcs)});\n  }\n\n  function featureOrCollection(topology, o) {\n    return o.type === \"GeometryCollection\" ? {\n      type: \"FeatureCollection\",\n      features: o.geometries.map(function(o) { return feature(topology, o); })\n    } : feature(topology, o);\n  }\n\n  function feature(topology, o) {\n    var f = {\n      type: \"Feature\",\n      id: o.id,\n      properties: o.properties || {},\n      geometry: object(topology, o)\n    };\n    if (o.id == null) delete f.id;\n    return f;\n  }\n\n  function object(topology, o) {\n    var tf = topology.transform,\n        kx = tf.scale[0],\n        ky = tf.scale[1],\n        dx = tf.translate[0],\n        dy = tf.translate[1],\n        arcs = topology.arcs;\n\n    function arc(i, points) {\n      if (points.length) points.pop();\n      for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length, x = 0, y = 0, p; k < n; ++k) points.push([\n        (x += (p = a[k])[0]) * kx + dx,\n        (y += p[1]) * ky + dy\n      ]);\n      if (i < 0) reverse(points, n);\n    }\n\n    function point(coordinates) {\n      return [coordinates[0] * kx + dx, coordinates[1] * ky + dy];\n    }\n\n    function line(arcs) {\n      var points = [];\n      for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);\n      if (points.length < 2) points.push(points[0].slice());\n      return points;\n    }\n\n    function ring(arcs) {\n      var points = line(arcs);\n      while (points.length < 4) points.push(points[0].slice());\n      return points;\n    }\n\n    function polygon(arcs) {\n      return arcs.map(ring);\n    }\n\n    function geometry(o) {\n      var t = o.type;\n      return t === \"GeometryCollection\" ? {type: t, geometries: o.geometries.map(geometry)}\n          : t in geometryType ? {type: t, coordinates: geometryType[t](o)}\n          : null;\n    }\n\n    var geometryType = {\n      Point: function(o) { return point(o.coordinates); },\n      MultiPoint: function(o) { return o.coordinates.map(point); },\n      LineString: function(o) { return line(o.arcs); },\n      MultiLineString: function(o) { return o.arcs.map(line); },\n      Polygon: function(o) { return polygon(o.arcs); },\n      MultiPolygon: function(o) { return o.arcs.map(polygon); }\n    };\n\n    return geometry(o);\n  }\n\n  function reverse(array, n) {\n    var t, j = array.length, i = j - n; while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;\n  }\n\n  function bisect(a, x) {\n    var lo = 0, hi = a.length;\n    while (lo < hi) {\n      var mid = lo + hi >>> 1;\n      if (a[mid] < x) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  }\n\n  function neighbors(objects) {\n    var indexesByArc = {}, // arc index -> array of object indexes\n        neighbors = objects.map(function() { return []; });\n\n    function line(arcs, i) {\n      arcs.forEach(function(a) {\n        if (a < 0) a = ~a;\n        var o = indexesByArc[a];\n        if (o) o.push(i);\n        else indexesByArc[a] = [i];\n      });\n    }\n\n    function polygon(arcs, i) {\n      arcs.forEach(function(arc) { line(arc, i); });\n    }\n\n    function geometry(o, i) {\n      if (o.type === \"GeometryCollection\") o.geometries.forEach(function(o) { geometry(o, i); });\n      else if (o.type in geometryType) geometryType[o.type](o.arcs, i);\n    }\n\n    var geometryType = {\n      LineString: line,\n      MultiLineString: polygon,\n      Polygon: polygon,\n      MultiPolygon: function(arcs, i) { arcs.forEach(function(arc) { polygon(arc, i); }); }\n    };\n\n    objects.forEach(geometry);\n\n    for (var i in indexesByArc) {\n      for (var indexes = indexesByArc[i], m = indexes.length, j = 0; j < m; ++j) {\n        for (var k = j + 1; k < m; ++k) {\n          var ij = indexes[j], ik = indexes[k], n;\n          if ((n = neighbors[ij])[i = bisect(n, ik)] !== ik) n.splice(i, 0, ik);\n          if ((n = neighbors[ik])[i = bisect(n, ij)] !== ij) n.splice(i, 0, ij);\n        }\n      }\n    }\n\n    return neighbors;\n  }\n\n  return {\n    version: \"1.2.3\",\n    mesh: mesh,\n    feature: featureOrCollection,\n    neighbors: neighbors\n  };\n})();\n")();
topojson.topology = require("./lib/topojson/topology");
topojson.simplify = require("./lib/topojson/simplify");
topojson.clockwise = require("./lib/topojson/clockwise");
topojson.filter = require("./lib/topojson/filter");
topojson.prune = require("./lib/topojson/prune");
topojson.bind = require("./lib/topojson/bind");

},{"./lib/topojson/bind":20,"./lib/topojson/clockwise":22,"./lib/topojson/filter":24,"./lib/topojson/prune":28,"./lib/topojson/simplify":29,"./lib/topojson/topology":34,"fs":1}],20:[function(require,module,exports){
var type = require("./type"),
    topojson = require("../../");

module.exports = function(topology, propertiesById) {
  var bind = type({
    geometry: function(geometry) {
      var properties0 = geometry.properties,
          properties1 = propertiesById[geometry.id];
      if (properties1) {
        if (properties0) for (var k in properties1) properties0[k] = properties1[k];
        else for (var k in properties1) { geometry.properties = properties1; break; }
      }
      this.defaults.geometry.call(this, geometry);
    },
    LineString: noop,
    MultiLineString: noop,
    Point: noop,
    MultiPoint: noop,
    Polygon: noop,
    MultiPolygon: noop
  });

  for (var key in topology.objects) {
    bind.object(topology.objects[key]);
  }
};

function noop() {}

},{"../../":"CTt6O6","./type":35}],21:[function(require,module,exports){
exports.name = "cartesian";
exports.formatDistance = formatDistance;
exports.ringArea = ringArea;
exports.absoluteArea = Math.abs;
exports.triangleArea = triangleArea;
exports.distance = distance;

function formatDistance(d) {
  return d.toString();
}

function ringArea(ring) {
  var i = 0,
      n = ring.length,
      area = ring[n - 1][1] * ring[0][0] - ring[n - 1][0] * ring[0][1];
  while (++i < n) {
    area += ring[i - 1][1] * ring[i][0] - ring[i - 1][0] * ring[i][1];
  }
  return area * .5;
}

function triangleArea(triangle) {
  return Math.abs(
    (triangle[0][0] - triangle[2][0]) * (triangle[1][1] - triangle[0][1])
    - (triangle[0][0] - triangle[1][0]) * (triangle[2][1] - triangle[0][1])
  );
}

function distance(x0, y0, x1, y1) {
  var dx = x0 - x1, dy = y0 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

},{}],22:[function(require,module,exports){
var type = require("./type"),
    systems = require("./coordinate-systems"),
    topojson = require("../../");

module.exports = function(object, options) {
  if (object.type === "Topology") clockwiseTopology(object, options);
  else clockwiseGeometry(object, options);
};

function clockwiseGeometry(object, options) {
  var system = null;

  if (options)
    "coordinate-system" in options && (system = systems[options["coordinate-system"]]);

  type({
    LineString: noop,
    MultiLineString: noop,
    Point: noop,
    MultiPoint: noop,
    Polygon: function(polygon) { clockwisePolygon(polygon.coordinates); },
    MultiPolygon: function(multiPolygon) { multiPolygon.coordinates.forEach(clockwisePolygon); }
  }).object(object);

  function clockwisePolygon(rings) {
    if (rings.length && system.ringArea(r = rings[0]) < 0) r.reverse();
    for (var i = 1, n = rings.length, r; i < n; ++i) {
      if (system.ringArea(r = rings[i]) > 0) r.reverse();
    }
  }
}

function clockwiseTopology(topology, options) {
  var system = null;

  if (options)
    "coordinate-system" in options && (system = systems[options["coordinate-system"]]);

  var clockwise = type({
    LineString: noop,
    MultiLineString: noop,
    Point: noop,
    MultiPoint: noop,
    Polygon: function(polygon) { clockwisePolygon(polygon.arcs); },
    MultiPolygon: function(multiPolygon) { multiPolygon.arcs.forEach(clockwisePolygon); }
  });

  for (var key in topology.objects) {
    clockwise.object(topology.objects[key]);
  }

  function clockwisePolygon(rings) {
    if (rings.length && ringArea(r = rings[0]) < 0) reverse(r);
    for (var i = 1, n = rings.length, r; i < n; ++i) {
      if (ringArea(r = rings[i]) > 0) reverse(r);
    }
  }

  function ringArea(ring) {
    return system.ringArea(topojson.feature(topology, {type: "Polygon", arcs: [ring]}).geometry.coordinates[0]);
  }

  // TODO It might be slightly more compact to reverse the arc.
  function reverse(ring) {
    var i = -1, n = ring.length;
    ring.reverse();
    while (++i < n) ring[i] = ~ring[i];
  }
};

function noop() {}

},{"../../":"CTt6O6","./coordinate-systems":23,"./type":35}],23:[function(require,module,exports){
module.exports = {
  cartesian: require("./cartesian"),
  spherical: require("./spherical")
};

},{"./cartesian":21,"./spherical":30}],24:[function(require,module,exports){
var type = require("./type"),
    prune = require("./prune"),
    clockwise = require("./clockwise"),
    systems = require("./coordinate-systems"),
    topojson = require("../../");

module.exports = function(topology, options) {
  var system = null,
      forceClockwise = true; // force exterior rings to be clockwise?

  if (options)
    "coordinate-system" in options && (system = systems[options["coordinate-system"]]),
    "force-clockwise" in options && (forceClockwise = !!options["force-clockwise"]);

  if (forceClockwise) clockwise(topology, options); // deprecated; for backwards-compatibility

  var filter = type({
    LineString: noop, // TODO remove empty lines
    MultiLineString: noop,
    Point: noop,
    MultiPoint: noop,
    Polygon: function(polygon) {
      polygon.arcs = polygon.arcs.filter(ringArea);
      if (!polygon.arcs.length) {
        polygon.type = null;
        delete polygon.arcs;
      }
    },
    MultiPolygon: function(multiPolygon) {
      multiPolygon.arcs = multiPolygon.arcs.map(function(polygon) {
        return polygon.filter(ringArea);
      }).filter(function(polygon) {
        return polygon.length;
      });
      if (!multiPolygon.arcs.length) {
        multiPolygon.type = null;
        delete multiPolygon.arcs;
      }
    },
    GeometryCollection: function(collection) {
      this.defaults.GeometryCollection.call(this, collection);
      collection.geometries = collection.geometries.filter(function(geometry) { return geometry.type != null; });
      if (!collection.geometries.length) {
        collection.type = null;
        delete collection.geometries;
      }
    }
  });

  for (var key in topology.objects) {
    filter.object(topology.objects[key]);
  }

  prune(topology, options);

  function ringArea(ring) {
    return system.absoluteArea(system.ringArea(topojson.feature(topology, {type: "Polygon", arcs: [ring]}).geometry.coordinates[0]));
  }
};

// TODO It might be slightly more compact to reverse the arc.
function reverse(ring) {
  var i = -1, n = ring.length;
  ring.reverse();
  while (++i < n) ring[i] = ~ring[i];
}

function noop() {}

},{"../../":"CTt6O6","./clockwise":22,"./coordinate-systems":23,"./prune":28,"./type":35}],25:[function(require,module,exports){
// Note: requires that size is a power of two!
module.exports = function(size) {
  var mask = size - 1;
  return function(point) {
    var key = (point[0] + 31 * point[1]) | 0;
    return (key < 0 ? ~key : key) & mask;
  };
};

},{}],26:[function(require,module,exports){
var hasher = require("./hash");

module.exports = function(size) {
  var hashtable = new Array(size = 1 << Math.ceil(Math.log(size) / Math.LN2)),
      hash = hasher(size);
  return {
    size: size,
    peek: function(key) {
      var matches = hashtable[hash(key)];

      if (matches) {
        var i = -1,
            n = matches.length,
            match;
        while (++i < n) {
          match = matches[i];
          if (equal(match.key, key)) {
            return match.values;
          }
        }
      }

      return null;
    },
    get: function(key) {
      var index = hash(key),
          matches = hashtable[index];

      if (matches) {
        var i = -1,
            n = matches.length,
            match;
        while (++i < n) {
          match = matches[i];
          if (equal(match.key, key)) {
            return match.values;
          }
        }
      } else {
        matches = hashtable[index] = [];
      }

      var values = [];
      matches.push({key: key, values: values});
      return values;
    }
  };
};

function equal(keyA, keyB) {
  return keyA[0] === keyB[0]
      && keyA[1] === keyB[1];
}

},{"./hash":25}],27:[function(require,module,exports){
module.exports = function() {
  var heap = {},
      array = [];

  heap.push = function() {
    for (var i = 0, n = arguments.length; i < n; ++i) {
      var object = arguments[i];
      up(object.index = array.push(object) - 1);
    }
    return array.length;
  };

  heap.pop = function() {
    var removed = array[0],
        object = array.pop();
    if (array.length) {
      array[object.index = 0] = object;
      down(0);
    }
    return removed;
  };

  heap.remove = function(removed) {
    var i = removed.index,
        object = array.pop();
    if (i !== array.length) {
      array[object.index = i] = object;
      (compare(object, removed) < 0 ? up : down)(i);
    }
    return i;
  };

  function up(i) {
    var object = array[i];
    while (i > 0) {
      var up = ((i + 1) >> 1) - 1,
          parent = array[up];
      if (compare(object, parent) >= 0) break;
      array[parent.index = i] = parent;
      array[object.index = i = up] = object;
    }
  }

  function down(i) {
    var object = array[i];
    while (true) {
      var right = (i + 1) << 1,
          left = right - 1,
          down = i,
          child = array[down];
      if (left < array.length && compare(array[left], child) < 0) child = array[down = left];
      if (right < array.length && compare(array[right], child) < 0) child = array[down = right];
      if (down === i) break;
      array[child.index = i] = child;
      array[object.index = i = down] = object;
    }
  }

  return heap;
};

function compare(a, b) {
  return a[1].area - b[1].area;
}

},{}],28:[function(require,module,exports){
var type = require("./type"),
    topojson = require("../../");

module.exports = function(topology, options) {
  var verbose = false,
      retained = [],
      j = -1,
      n = topology.arcs.length;

  if (options)
    "verbose" in options && (verbose = !!options["verbose"]);

  var prune = type({
    LineString: function(lineString) {
      this.line(lineString.arcs);
    },
    MultiLineString: function(multiLineString) {
      var arcs = multiLineString.arcs, i = -1, n = arcs.length;
      while (++i < n) this.line(arcs[i]);
    },
    MultiPoint: noop,
    MultiPolygon: function(multiPolygon) {
      var arcs = multiPolygon.arcs, i = -1, n = arcs.length;
      while (++i < n) this.polygon(arcs[i]);
    },
    Point: noop,
    Polygon: function(polygon) {
      this.polygon(polygon.arcs);
    },
    line: function(arcs) {
      var i = -1, n = arcs.length, arc, reversed;
      while (++i < n) {
        arc = arcs[i];
        if (reversed = arc < 0) arc = ~arc;
        if (retained[arc] == null) retained[arc] = ++j, arc = j;
        else arc = retained[arc];
        arcs[i] = reversed ? ~arc : arc;
      }
    },
    polygon: function(arcs) {
      var i = -1, n = arcs.length;
      while (++i < n) this.line(arcs[i]);
    }
  });

  for (var key in topology.objects) {
    prune.object(topology.objects[key]);
  }

  if (verbose) console.warn("prune: retained " + (j + 1) + " / " + n + " arcs (" + Math.round((j + 1) / n * 100) + "%)");

  var arcs = [];
  retained.forEach(function(i, j) { arcs[i] = topology.arcs[j]; });
  topology.arcs = arcs;
};

function noop() {}

},{"../../":"CTt6O6","./type":35}],29:[function(require,module,exports){
var minHeap = require("./min-heap"),
    systems = require("./coordinate-systems");

module.exports = function(topology, options) {
  var mininumArea = 0,
      retainProportion,
      verbose = false,
      heap = minHeap(),
      maxArea = 0,
      system = null,
      triangle,
      N = 0,
      M = 0;

  if (options)
    "minimum-area" in options && (mininumArea = +options["minimum-area"]),
    "coordinate-system" in options && (system = systems[options["coordinate-system"]]),
    "retain-proportion" in options && (retainProportion = +options["retain-proportion"]),
    "verbose" in options && (verbose = !!options["verbose"]);

  topology.arcs.forEach(function(arc) {
    var triangles = [];

    arc.forEach(transformAbsolute(topology.transform));

    for (var i = 1, n = arc.length - 1; i < n; ++i) {
      triangle = arc.slice(i - 1, i + 2);
      triangle[1].area = system.triangleArea(triangle);
      triangles.push(triangle);
      heap.push(triangle);
    }

    // Always keep the arc endpoints!
    arc[0].area = arc[n].area = Infinity;

    N += n + 1;

    for (var i = 0, n = triangles.length; i < n; ++i) {
      triangle = triangles[i];
      triangle.previous = triangles[i - 1];
      triangle.next = triangles[i + 1];
    }
  });

  while (triangle = heap.pop()) {
    var previous = triangle.previous,
        next = triangle.next;

    // If the area of the current point is less than that of the previous point
    // to be eliminated, use the latter's area instead. This ensures that the
    // current point cannot be eliminated without eliminating previously-
    // eliminated points.
    if (triangle[1].area < maxArea) triangle[1].area = maxArea;
    else maxArea = triangle[1].area;

    if (previous) {
      previous.next = next;
      previous[2] = triangle[2];
      update(previous);
    }

    if (next) {
      next.previous = previous;
      next[0] = triangle[0];
      update(next);
    }
  }

  if (retainProportion) {
    var areas = [];
    topology.arcs.forEach(function(arc) {
      arc.forEach(function(point) {
        areas.push(point.area);
      });
    });
    mininumArea = areas.sort(function(a, b) { return b - a; })[Math.ceil((N - 1) * retainProportion)];
    if (verbose) console.warn("simplification: effective minimum area " + mininumArea.toPrecision(3));
  }

  topology.arcs = topology.arcs.map(function(arc) {
    return arc.filter(function(point) {
      return point.area >= mininumArea;
    });
  });

  topology.arcs.forEach(function(arc) {
    arc.forEach(transformRelative(topology.transform));
    M += arc.length;
  });

  function update(triangle) {
    heap.remove(triangle);
    triangle[1].area = system.triangleArea(triangle);
    heap.push(triangle);
  }

  if (verbose) console.warn("simplification: retained " + M + " / " + N + " points (" + Math.round((M / N) * 100) + "%)");

  return topology;
};

function transformAbsolute(transform) {
  var x0 = 0,
      y0 = 0,
      kx = transform.scale[0],
      ky = transform.scale[1],
      dx = transform.translate[0],
      dy = transform.translate[1];
  return function(point) {
    point[0] = (x0 += point[0]) * kx + dx;
    point[1] = (y0 += point[1]) * ky + dy;
  };
}

function transformRelative(transform) {
  var x0 = 0,
      y0 = 0,
      kx = transform.scale[0],
      ky = transform.scale[1],
      dx = transform.translate[0],
      dy = transform.translate[1];
  return function(point) {
    var x1 = (point[0] - dx) / kx | 0,
        y1 = (point[1] - dy) / ky | 0;
    point[0] = x1 - x0;
    point[1] = y1 - y0;
    x0 = x1;
    y0 = y1;
  };
}

},{"./coordinate-systems":23,"./min-heap":27}],30:[function(require,module,exports){
var π = Math.PI,
    π_4 = π / 4,
    radians = π / 180;

exports.name = "spherical";
exports.formatDistance = formatDistance;
exports.ringArea = ringArea;
exports.absoluteArea = absoluteArea;
exports.triangleArea = triangleArea;
exports.distance = haversinDistance; // XXX why two implementations?

function formatDistance(radians) {
  var km = radians * 6371;
  return (km > 1 ? km.toFixed(3) + "km" : (km * 1000).toPrecision(3) + "m")
      + " (" + (radians * 180 / Math.PI).toPrecision(3) + "°)";
}

function ringArea(ring) {
  if (!ring.length) return 0;
  var area = 0,
      p = ring[0],
      λ = p[0] * radians,
      φ = p[1] * radians / 2 + π_4,
      λ0 = λ,
      cosφ0 = Math.cos(φ),
      sinφ0 = Math.sin(φ);

  for (var i = 1, n = ring.length; i < n; ++i) {
    p = ring[i], λ = p[0] * radians, φ = p[1] * radians / 2 + π_4;

    // Spherical excess E for a spherical triangle with vertices: south pole,
    // previous point, current point.  Uses a formula derived from Cagnoli’s
    // theorem.  See Todhunter, Spherical Trig. (1871), Sec. 103, Eq. (2).
    var dλ = λ - λ0,
        cosφ = Math.cos(φ),
        sinφ = Math.sin(φ),
        k = sinφ0 * sinφ,
        u = cosφ0 * cosφ + k * Math.cos(dλ),
        v = k * Math.sin(dλ);
    area += Math.atan2(v, u);

    // Advance the previous point.
    λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
  }

  return 2 * area;
}

function absoluteArea(a) {
  return a < 0 ? a + 4 * π : a;
}

function triangleArea(t) {
  var a = distance(t[0], t[1]),
      b = distance(t[1], t[2]),
      c = distance(t[2], t[0]),
      s = (a + b + c) / 2;
  return 4 * Math.atan(Math.sqrt(Math.max(0, Math.tan(s / 2) * Math.tan((s - a) / 2) * Math.tan((s - b) / 2) * Math.tan((s - c) / 2))));
}

function distance(a, b) {
  var Δλ = (b[0] - a[0]) * radians,
      sinΔλ = Math.sin(Δλ),
      cosΔλ = Math.cos(Δλ),
      sinφ0 = Math.sin(a[1] * radians),
      cosφ0 = Math.cos(a[1] * radians),
      sinφ1 = Math.sin(b[1] * radians),
      cosφ1 = Math.cos(b[1] * radians),
      _;
  return Math.atan2(Math.sqrt((_ = cosφ1 * sinΔλ) * _ + (_ = cosφ0 * sinφ1 - sinφ0 * cosφ1 * cosΔλ) * _), sinφ0 * sinφ1 + cosφ0 * cosφ1 * cosΔλ);
}

function haversinDistance(x0, y0, x1, y1) {
  x0 *= radians, y0 *= radians, x1 *= radians, y1 *= radians;
  return 2 * Math.asin(Math.sqrt(haversin(y1 - y0) + Math.cos(y0) * Math.cos(y1) * haversin(x1 - x0)));
}

function haversin(x) {
  return (x = Math.sin(x / 2)) * x;
}

},{}],31:[function(require,module,exports){
var type = require("./type");

module.exports = function(objects, options) {
  var verbose = false;

  if (options)
    "verbose" in options && (verbose = !!options["verbose"]);

  var stitch = type({
    polygon: function(polygon) {
      for (var j = 0, m = polygon.length; j < m; ++j) {
        var line = polygon[j],
            i = -1,
            n = line.length,
            a = false,
            b = false,
            c = false,
            i0 = -1;
        for (i = 0; i < n; ++i) {
          var point = line[i],
              antimeridian = Math.abs(Math.abs(point[0]) - 180) < 1e-2,
              polar = Math.abs(Math.abs(point[1]) - 90) < 1e-2;
          if (antimeridian || polar) {
            if (!(a || b || c)) i0 = i;
            if (antimeridian) {
              if (a) c = true;
              else a = true;
            }
            if (polar) b = true;
          }
          if (!antimeridian && !polar || i === n - 1) {
            if (a && b && c) {
              if (verbose) console.warn("stitch: removed polar cut [" + line[i0] + "] … [" + line[i] + "]");
              line.splice(i0, i - i0);
              n -= i - i0;
              i = i0;
            }
            a = b = c = false;
          }
        }
      }
    }
  });

  for (var key in objects) {
    stitch.object(objects[key]);
  }
};

},{"./type":35}],32:[function(require,module,exports){
var qs = require('../lib/querystring'),
    xtend = require('xtend');

module.exports = function(context) {
    var router = {};

    router.on = function() {
        d3.select(window).on('hashchange.router', route);
        context.dispatch.on('change.route', unroute);
        context.dispatch.route(getQuery());
        return router;
    };

    router.off = function() {
        d3.select(window).on('hashchange.router', null);
        return router;
    };

    function route() {
        var oldHash = d3.event.oldURL.split('#')[1] || '',
            newHash = d3.event.newURL.split('#')[1] || '',
            oldQuery = qs.stringQs(oldHash),
            newQuery = qs.stringQs(newHash);

        if (isOld(oldHash)) return upgrade(oldHash);
        if (newQuery.id !== oldQuery.id) context.dispatch.route(newQuery);
    }

    function isOld(id) {
        return (id.indexOf('gist') === 0 || id.indexOf('github') === 0 || !isNaN(parseInt(id, 10)));
    }

    function upgrade(id) {
        var split;
        if (isNaN(parseInt(id, 10))) {
            split = id.split(':');
            location.hash = '#id=' + (split[1].indexOf('/') === 0 ?
                [split[0], split[1].substring(1)].join(':') : id);
        } else {
            location.hash = '#id=gist:/' + id;
        }
    }

    function unroute() {
        var query = getQuery();
        var rev = reverseRoute();
        if (rev.id && query.id !== rev.id) {
            location.hash = '#' + qs.qsString(rev);
        }
    }

    function getQuery() {
        return qs.stringQs(window.location.hash.substring(1));
    }

    function reverseRoute() {
        var query = getQuery();

        return xtend(query, {
            id: context.data.get('route')
        });
    }

    return router;
};

},{"../lib/querystring":52,"xtend":37}],"topojson":[function(require,module,exports){
module.exports=require('CTt6O6');
},{}],34:[function(require,module,exports){
var type = require("./type"),
    stitch = require("./stitch-poles"),
    hashtable = require("./hashtable"),
    systems = require("./coordinate-systems");

var ε = 1e-6;

module.exports = function(objects, options) {
  var Q = 1e4, // precision of quantization
      id = function(d) { return d.id; }, // function to compute object id
      propertyTransform = function() {}, // function to transform properties
      stitchPoles = true,
      verbose = false,
      x0, y0, x1, y1,
      kx, ky,
      εmax = 0,
      coincidences,
      system = null,
      arcs = [],
      arcsByPoint,
      pointsByPoint;

  if (options)
    "verbose" in options && (verbose = !!options["verbose"]),
    "stitch-poles" in options && (stitchPoles = !!options["stitch-poles"]),
    "coordinate-system" in options && (system = systems[options["coordinate-system"]]),
    "quantization" in options && (Q = +options["quantization"]),
    "id" in options && (id = options["id"]),
    "property-transform" in options && (propertyTransform = options["property-transform"]);

  coincidences = hashtable(Q * 10);
  arcsByPoint = hashtable(Q * 10);
  pointsByPoint = hashtable(Q * 10);

  function each(callback) {
    var t = type(callback), o = {};
    for (var k in objects) o[k] = t.object(objects[k]) || {};
    return o;
  }

  // Compute bounding box.
  function bound() {
    x1 = y1 = -(x0 = y0 = Infinity);
    each({
      point: function(point) {
        var x = point[0],
            y = point[1];
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    });
  }

  bound();

  // For automatic coordinate system determination, consider the bounding box.
  var oversize = x0 < -180 - ε || x1 > 180 + ε || y0 < -90 - ε || y1 > 90 + ε;
  if (!system) {
    system = systems[oversize ? "cartesian" : "spherical"];
    if (options) options["coordinate-system"] = system.name;
  }

  if (system === systems.spherical) {
    if (oversize) throw new Error("spherical coordinates outside of [±180°, ±90°]");
    if (stitchPoles) stitch(objects), bound();

    // When near the spherical coordinate limits, clamp to nice round values.
    // This avoids quantized coordinates that are slightly outside the limits.
    if (x0 < -180 + ε) x0 = -180;
    if (x1 > 180 - ε) x1 = 180;
    if (y0 < -90 + ε) y0 = -90;
    if (y1 > 90 - ε) y1 = 90;
  }

  if (!isFinite(x0)) x0 = 0;
  if (!isFinite(x1)) x1 = 0;
  if (!isFinite(y0)) y0 = 0;
  if (!isFinite(y1)) y1 = 0;

  // Compute quantization scaling factors.
  if (Q) {
    kx = x1 - x0 ? (Q - 1) / (x1 - x0) : 1;
    ky = y1 - y0 ? (Q - 1) / (y1 - y0) : 1;
  } else {
    console.warn("quantization: disabled; assuming inputs already quantized");
    Q = x1 + 1;
    kx = ky = 1;
    x0 = y0 = 0;
  }

  if (verbose) {
    var qx0 = Math.round((x0 - x0) * kx) * (1 / kx) + x0,
        qx1 = Math.round((x1 - x0) * kx) * (1 / kx) + x0,
        qy0 = Math.round((y0 - y0) * ky) * (1 / ky) + y0,
        qy1 = Math.round((y1 - y0) * ky) * (1 / ky) + y0;
    console.warn("quantization: bounds " + [qx0, qy0, qx1, qy1].join(" ") + " (" + system.name + ")");
  }

  // Quantize coordinates.
  each({
    point: function(point) {
      var x1 = point[0],
          y1 = point[1],
          x = Math.round((x1 - x0) * kx),
          y = Math.round((y1 - y0) * ky),
          ε = system.distance(x1, y1, x / kx + x0, y / ky + y0);
      if (ε > εmax) εmax = ε;
      point[0] = x;
      point[1] = y;
    }
  });

  if (verbose) console.warn("quantization: maximum error "  + system.formatDistance(εmax));

  // Compute the line strings that go through each unique point.
  // If the line string goes through the same point more than once,
  // only record that point once.
  each({
    line: function(line) {
      var i = -1,
          n = line.length,
          lines;
      while (++i < n) {
        lines = coincidences.get(line[i]);
        if (lines.indexOf(line) < 0) lines.push(line);
      }
    }
  });

  // Convert features to geometries, and stitch together arcs.
  objects = each({
    Feature: function(feature) {
      var geometry = feature.geometry;
      if (feature.geometry == null) geometry = {};
      if ("id" in feature) geometry.id = feature.id;
      if ("properties" in feature) geometry.properties = feature.properties;
      return this.geometry(geometry);
    },

    FeatureCollection: function(collection) {
      collection.type = "GeometryCollection";
      collection.geometries = collection.features.map(this.Feature, this);
      delete collection.features;
      return collection;
    },

    GeometryCollection: function(collection) {
      collection.geometries = collection.geometries.map(this.geometry, this);
    },

    MultiPolygon: function(multiPolygon) {
      multiPolygon.arcs = multiPolygon.coordinates.map(polygon);
    },

    Polygon: function(polygon) {
      polygon.arcs = polygon.coordinates.map(lineClosed);
    },

    MultiLineString: function(multiLineString) {
      multiLineString.arcs = multiLineString.coordinates.map(lineOpen);
    },

    LineString: function(lineString) {
      lineString.arcs = lineOpen(lineString.coordinates);
    },

    geometry: function(geometry) {
      if (geometry == null) geometry = {};
      else this.defaults.geometry.call(this, geometry);

      geometry.id = id(geometry);
      if (geometry.id == null) delete geometry.id;

      if (properties0 = geometry.properties) {
        var properties0, properties1 = {};
        delete geometry.properties;
        for (var key0 in properties0) {
          if (propertyTransform(properties1, key0, properties0[key0])) {
            geometry.properties = properties1;
          }
        }
      }

      if (geometry.arcs) delete geometry.coordinates;
      return geometry;
    }
  });

  coincidences = arcsByPoint = pointsByPoint = null;

  function polygon(polygon) {
    return polygon.map(lineClosed);
  }

  function lineClosed(points) {
    return line(points, false);
  }

  function lineOpen(points) {
    return line(points, true);
  }

  function line(points, open) {
    var lineArcs = [],
        n = points.length,
        a = [],
        k = 0,
        p;

    if (!open) points.pop(), --n;

    // For closed lines, rotate to find a suitable shared starting point.
    for (; k < n; ++k) {
      var t = coincidences.peek(points[k]);
      if (open) break;
      if (p && !linesEqual(p, t)) {
        var tInP = t.every(function(line) { return p.indexOf(line) >= 0; }),
            pInT = p.every(function(line) { return t.indexOf(line) >= 0; });
        if (tInP && !pInT) --k;
        break;
      }
      p = t;
    }

    // If no shared starting point is found for closed lines, rotate to minimum.
    if (k === n && p.length > 1) {
      var point0 = points[0];
      for (k = 0, i = 1; i < n; ++i) {
        var point = points[i];
        if (pointCompare(point0, point) > 0) point0 = point, k = i;
      }
    }

    for (var i = 0, m = open ? n : n + 1; i < m; ++i) {
      var point = points[(i + k) % n],
          p = coincidences.peek(point);
      if (!linesEqual(p, t)) {
        var tInP = t.every(function(line) { return p.indexOf(line) >= 0; }),
            pInT = p.every(function(line) { return t.indexOf(line) >= 0; });
        if (tInP) a.push(point);
        arc(a);
        if (!tInP && !pInT) arc([a[a.length - 1], point]);
        if (pInT) a = [a[a.length - 1]];
        else a = [];
      }
      if (!a.length || pointCompare(a[a.length - 1], point)) a.push(point); // skip duplicate points
      t = p;
    }

    arc(a, true);

    function arc(a, last) {
      var n = a.length;

      if (last && !lineArcs.length && n === 1) {
        var point = a[0],
            index = pointsByPoint.get(point);
        if (index.length) {
          lineArcs.push(index[0]);
        } else {
          lineArcs.push(index[0] = arcs.length);
          arcs.push(a);
        }
      } else if (n > 1) {
        var a0 = a[0],
            a1 = a[n - 1],
            point = pointCompare(a0, a1) < 0 ? a0 : a1,
            pointArcs = arcsByPoint.get(point);
        if (pointArcs.some(matchForward)) return;
        if (pointArcs.some(matchBackward)) return;
        pointArcs.push(a);
        lineArcs.push(a.index = arcs.length);
        arcs.push(a);
      }

      function matchForward(b) {
        var i = -1;
        if (b.length !== n) return false;
        while (++i < n) if (pointCompare(a[i], b[i])) return false;
        lineArcs.push(b.index);
        return true;
      }

      function matchBackward(b) {
        var i = -1;
        if (b.length !== n) return false;
        while (++i < n) if (pointCompare(a[i], b[n - i - 1])) return false;
        lineArcs.push(~b.index);
        return true;
      }
    }

    return lineArcs;
  }

  return {
    type: "Topology",
    bbox: [x0, y0, x1, y1],
    transform: {
      scale: [1 / kx, 1 / ky],
      translate: [x0, y0]
    },
    objects: objects,
    arcs: arcs.map(function(arc) {
      var i = 0,
          n = arc.length,
          point = arc[0],
          x1 = point[0], x2, dx,
          y1 = point[1], y2, dy,
          points = [[x1, y1]];
      while (++i < n) {
        point = arc[i];
        x2 = point[0];
        y2 = point[1];
        dx = x2 - x1;
        dy = y2 - y1;
        if (dx || dy) {
          points.push([dx, dy]);
          x1 = x2, y1 = y2;
        }
      }
      return points;
    })
  };
};

function linesEqual(a, b) {
  var n = a.length, i = -1;
  if (b.length !== n) return false;
  while (++i < n) if (a[i] !== b[i]) return false;
  return true;
}

function pointCompare(a, b) {
  return a[0] - b[0] || a[1] - b[1];
}

function noop() {}

},{"./coordinate-systems":23,"./hashtable":26,"./stitch-poles":31,"./type":35}],35:[function(require,module,exports){
module.exports = function(types) {
  for (var type in typeDefaults) {
    if (!(type in types)) {
      types[type] = typeDefaults[type];
    }
  }
  types.defaults = typeDefaults;
  return types;
};

var typeDefaults = {

  Feature: function(feature) {
    if (feature.geometry) this.geometry(feature.geometry);
  },

  FeatureCollection: function(collection) {
    var features = collection.features, i = -1, n = features.length;
    while (++i < n) this.Feature(features[i]);
  },

  GeometryCollection: function(collection) {
    var geometries = collection.geometries, i = -1, n = geometries.length;
    while (++i < n) this.geometry(geometries[i]);
  },

  LineString: function(lineString) {
    this.line(lineString.coordinates);
  },

  MultiLineString: function(multiLineString) {
    var coordinates = multiLineString.coordinates, i = -1, n = coordinates.length;
    while (++i < n) this.line(coordinates[i]);
  },

  MultiPoint: function(multiPoint) {
    var coordinates = multiPoint.coordinates, i = -1, n = coordinates.length;
    while (++i < n) this.point(coordinates[i]);
  },

  MultiPolygon: function(multiPolygon) {
    var coordinates = multiPolygon.coordinates, i = -1, n = coordinates.length;
    while (++i < n) this.polygon(coordinates[i]);
  },

  Point: function(point) {
    this.point(point.coordinates);
  },

  Polygon: function(polygon) {
    this.polygon(polygon.coordinates);
  },

  object: function(object) {
    return object == null ? null
        : typeObjects.hasOwnProperty(object.type) ? this[object.type](object)
        : this.geometry(object);
  },

  geometry: function(geometry) {
    return geometry == null ? null
        : typeGeometries.hasOwnProperty(geometry.type) ? this[geometry.type](geometry)
        : null;
  },

  point: function() {},

  line: function(coordinates) {
    var i = -1, n = coordinates.length;
    while (++i < n) this.point(coordinates[i]);
  },

  polygon: function(coordinates) {
    var i = -1, n = coordinates.length;
    while (++i < n) this.line(coordinates[i]);
  }
};

var typeGeometries = {
  LineString: 1,
  MultiLineString: 1,
  MultiPoint: 1,
  MultiPolygon: 1,
  Point: 1,
  Polygon: 1,
  GeometryCollection: 1
};

var typeObjects = {
  Feature: 1,
  FeatureCollection: 1
};

},{}],36:[function(require,module,exports){
module.exports = hasKeys

function hasKeys(source) {
    return source !== null &&
        (typeof source === "object" ||
        typeof source === "function")
}

},{}],37:[function(require,module,exports){
var Keys = require("object-keys")
var hasKeys = require("./has-keys")

module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        if (!hasKeys(source)) {
            continue
        }

        var keys = Keys(source)

        for (var j = 0; j < keys.length; j++) {
            var name = keys[j]
            target[name] = source[name]
        }
    }

    return target
}

},{"./has-keys":36,"object-keys":38}],38:[function(require,module,exports){
module.exports = Object.keys || require('./shim');


},{"./shim":41}],39:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],40:[function(require,module,exports){

/**!
 * is
 * the definitive JavaScript type testing library
 * 
 * @copyright 2013 Enrico Marino
 * @license MIT
 */

var objProto = Object.prototype;
var owns = objProto.hasOwnProperty;
var toString = objProto.toString;
var isActualNaN = function (value) {
  return value !== value;
};
var NON_HOST_TYPES = {
  "boolean": 1,
  "number": 1,
  "string": 1,
  "undefined": 1
};

/**
 * Expose `is`
 */

var is = module.exports = {};

/**
 * Test general.
 */

/**
 * is.type
 * Test if `value` is a type of `type`.
 *
 * @param {Mixed} value value to test
 * @param {String} type type
 * @return {Boolean} true if `value` is a type of `type`, false otherwise
 * @api public
 */

is.a =
is.type = function (value, type) {
  return typeof value === type;
};

/**
 * is.defined
 * Test if `value` is defined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is defined, false otherwise
 * @api public
 */

is.defined = function (value) {
  return value !== undefined;
};

/**
 * is.empty
 * Test if `value` is empty.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is empty, false otherwise
 * @api public
 */

is.empty = function (value) {
  var type = toString.call(value);
  var key;

  if ('[object Array]' === type || '[object Arguments]' === type) {
    return value.length === 0;
  }

  if ('[object Object]' === type) {
    for (key in value) if (owns.call(value, key)) return false;
    return true;
  }

  if ('[object String]' === type) {
    return '' === value;
  }

  return false;
};

/**
 * is.equal
 * Test if `value` is equal to `other`.
 *
 * @param {Mixed} value value to test
 * @param {Mixed} other value to compare with
 * @return {Boolean} true if `value` is equal to `other`, false otherwise
 */

is.equal = function (value, other) {
  var type = toString.call(value)
  var key;

  if (type !== toString.call(other)) {
    return false;
  }

  if ('[object Object]' === type) {
    for (key in value) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if ('[object Array]' === type) {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (--key) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if ('[object Function]' === type) {
    return value.prototype === other.prototype;
  }

  if ('[object Date]' === type) {
    return value.getTime() === other.getTime();
  }

  return value === other;
};

/**
 * is.hosted
 * Test if `value` is hosted by `host`.
 *
 * @param {Mixed} value to test
 * @param {Mixed} host host to test with
 * @return {Boolean} true if `value` is hosted by `host`, false otherwise
 * @api public
 */

is.hosted = function (value, host) {
  var type = typeof host[value];
  return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
};

/**
 * is.instance
 * Test if `value` is an instance of `constructor`.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an instance of `constructor`
 * @api public
 */

is.instance = is['instanceof'] = function (value, constructor) {
  return value instanceof constructor;
};

/**
 * is.null
 * Test if `value` is null.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is null, false otherwise
 * @api public
 */

is['null'] = function (value) {
  return value === null;
};

/**
 * is.undefined
 * Test if `value` is undefined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is undefined, false otherwise
 * @api public
 */

is.undefined = function (value) {
  return value === undefined;
};

/**
 * Test arguments.
 */

/**
 * is.arguments
 * Test if `value` is an arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arguments = function (value) {
  var isStandardArguments = '[object Arguments]' === toString.call(value);
  var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
  return isStandardArguments || isOldArguments;
};

/**
 * Test array.
 */

/**
 * is.array
 * Test if 'value' is an array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an array, false otherwise
 * @api public
 */

is.array = function (value) {
  return '[object Array]' === toString.call(value);
};

/**
 * is.arguments.empty
 * Test if `value` is an empty arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty arguments object, false otherwise
 * @api public
 */
is.arguments.empty = function (value) {
  return is.arguments(value) && value.length === 0;
};

/**
 * is.array.empty
 * Test if `value` is an empty array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty array, false otherwise
 * @api public
 */
is.array.empty = function (value) {
  return is.array(value) && value.length === 0;
};

/**
 * is.arraylike
 * Test if `value` is an arraylike object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arraylike = function (value) {
  return !!value && !is.boolean(value)
    && owns.call(value, 'length')
    && isFinite(value.length)
    && is.number(value.length)
    && value.length >= 0;
};

/**
 * Test boolean.
 */

/**
 * is.boolean
 * Test if `value` is a boolean.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a boolean, false otherwise
 * @api public
 */

is.boolean = function (value) {
  return '[object Boolean]' === toString.call(value);
};

/**
 * is.false
 * Test if `value` is false.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is false, false otherwise
 * @api public
 */

is['false'] = function (value) {
  return is.boolean(value) && (value === false || value.valueOf() === false);
};

/**
 * is.true
 * Test if `value` is true.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is true, false otherwise
 * @api public
 */

is['true'] = function (value) {
  return is.boolean(value) && (value === true || value.valueOf() === true);
};

/**
 * Test date.
 */

/**
 * is.date
 * Test if `value` is a date.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a date, false otherwise
 * @api public
 */

is.date = function (value) {
  return '[object Date]' === toString.call(value);
};

/**
 * Test element.
 */

/**
 * is.element
 * Test if `value` is an html element.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an HTML Element, false otherwise
 * @api public
 */

is.element = function (value) {
  return value !== undefined
    && typeof HTMLElement !== 'undefined'
    && value instanceof HTMLElement
    && value.nodeType === 1;
};

/**
 * Test error.
 */

/**
 * is.error
 * Test if `value` is an error object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an error object, false otherwise
 * @api public
 */

is.error = function (value) {
  return '[object Error]' === toString.call(value);
};

/**
 * Test function.
 */

/**
 * is.fn / is.function (deprecated)
 * Test if `value` is a function.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a function, false otherwise
 * @api public
 */

is.fn = is['function'] = function (value) {
  var isAlert = typeof window !== 'undefined' && value === window.alert;
  return isAlert || '[object Function]' === toString.call(value);
};

/**
 * Test number.
 */

/**
 * is.number
 * Test if `value` is a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a number, false otherwise
 * @api public
 */

is.number = function (value) {
  return '[object Number]' === toString.call(value);
};

/**
 * is.infinite
 * Test if `value` is positive or negative infinity.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is positive or negative Infinity, false otherwise
 * @api public
 */
is.infinite = function (value) {
  return value === Infinity || value === -Infinity;
};

/**
 * is.decimal
 * Test if `value` is a decimal number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a decimal number, false otherwise
 * @api public
 */

is.decimal = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 !== 0;
};

/**
 * is.divisibleBy
 * Test if `value` is divisible by `n`.
 *
 * @param {Number} value value to test
 * @param {Number} n dividend
 * @return {Boolean} true if `value` is divisible by `n`, false otherwise
 * @api public
 */

is.divisibleBy = function (value, n) {
  var isDividendInfinite = is.infinite(value);
  var isDivisorInfinite = is.infinite(n);
  var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
  return isDividendInfinite || isDivisorInfinite || (isNonZeroNumber && value % n === 0);
};

/**
 * is.int
 * Test if `value` is an integer.
 *
 * @param value to test
 * @return {Boolean} true if `value` is an integer, false otherwise
 * @api public
 */

is.int = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 === 0;
};

/**
 * is.maximum
 * Test if `value` is greater than 'others' values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is greater than `others` values
 * @api public
 */

is.maximum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value < others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.minimum
 * Test if `value` is less than `others` values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is less than `others` values
 * @api public
 */

is.minimum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value > others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.nan
 * Test if `value` is not a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is not a number, false otherwise
 * @api public
 */

is.nan = function (value) {
  return !is.number(value) || value !== value;
};

/**
 * is.even
 * Test if `value` is an even number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an even number, false otherwise
 * @api public
 */

is.even = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 === 0);
};

/**
 * is.odd
 * Test if `value` is an odd number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an odd number, false otherwise
 * @api public
 */

is.odd = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 !== 0);
};

/**
 * is.ge
 * Test if `value` is greater than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.ge = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value >= other;
};

/**
 * is.gt
 * Test if `value` is greater than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.gt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value > other;
};

/**
 * is.le
 * Test if `value` is less than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if 'value' is less than or equal to 'other'
 * @api public
 */

is.le = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value <= other;
};

/**
 * is.lt
 * Test if `value` is less than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if `value` is less than `other`
 * @api public
 */

is.lt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value < other;
};

/**
 * is.within
 * Test if `value` is within `start` and `finish`.
 *
 * @param {Number} value value to test
 * @param {Number} start lower bound
 * @param {Number} finish upper bound
 * @return {Boolean} true if 'value' is is within 'start' and 'finish'
 * @api public
 */
is.within = function (value, start, finish) {
  if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
    throw new TypeError('all arguments must be numbers');
  }
  var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
  return isAnyInfinite || (value >= start && value <= finish);
};

/**
 * Test object.
 */

/**
 * is.object
 * Test if `value` is an object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an object, false otherwise
 * @api public
 */

is.object = function (value) {
  return value && '[object Object]' === toString.call(value);
};

/**
 * is.hash
 * Test if `value` is a hash - a plain object literal.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a hash, false otherwise
 * @api public
 */

is.hash = function (value) {
  return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};

/**
 * Test regexp.
 */

/**
 * is.regexp
 * Test if `value` is a regular expression.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a regexp, false otherwise
 * @api public
 */

is.regexp = function (value) {
  return '[object RegExp]' === toString.call(value);
};

/**
 * Test string.
 */

/**
 * is.string
 * Test if `value` is a string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a string, false otherwise
 * @api public
 */

is.string = function (value) {
  return '[object String]' === toString.call(value);
};


},{}],41:[function(require,module,exports){
(function () {
	"use strict";

	// modified from https://github.com/kriskowal/es5-shim
	var has = Object.prototype.hasOwnProperty,
		is = require('is'),
		forEach = require('foreach'),
		hasDontEnumBug = !({'toString': null}).propertyIsEnumerable('toString'),
		dontEnums = [
			"toString",
			"toLocaleString",
			"valueOf",
			"hasOwnProperty",
			"isPrototypeOf",
			"propertyIsEnumerable",
			"constructor"
		],
		keysShim;

	keysShim = function keys(object) {
		if (!is.object(object) && !is.array(object)) {
			throw new TypeError("Object.keys called on a non-object");
		}

		var name, theKeys = [];
		for (name in object) {
			if (has.call(object, name)) {
				theKeys.push(name);
			}
		}

		if (hasDontEnumBug) {
			forEach(dontEnums, function (dontEnum) {
				if (has.call(object, dontEnum)) {
					theKeys.push(dontEnum);
				}
			});
		}
		return theKeys;
	};

	module.exports = keysShim;
}());


},{"foreach":39,"is":40}],42:[function(require,module,exports){
module.exports = function(hostname) {
    var production = (hostname === 'geojson.io');

    return {
        client_id: production ?
            '62c753fd0faf18392d85' :
            'bb7bbe70bd1f707125bc',
        gatekeeper_url: production ?
            'https://geojsonioauth.herokuapp.com' :
            'https://localhostauth.herokuapp.com'
    };
};

},{}],43:[function(require,module,exports){
var clone = require('clone');
    xtend = require('xtend');
    source = {
        gist: require('../source/gist'),
        github: require('../source/github')
    };

module.exports = function(context) {

    var _data = {
        map: {
            type: 'FeatureCollection',
            features: []
        },
        dirty: false,
        source: null,
        meta: null,
        type: 'local'
    };

    function mapFile(gist) {
        var f;
        var content;

        for (f in gist.files) {
            content = gist.files[f].content;
            if (f.indexOf('.geojson') !== -1 && content) {
                return {
                    name: f,
                    content: JSON.parse(content)
                };
            }
        }

        for (f in gist.files) {
            content = gist.files[f].content;
            if (f.indexOf('.json') !== -1 && content) {
                return {
                    name: f,
                    file: JSON.parse(content)
                };
            }
        }
    }

    var data = {};

    data.hasFeatures = function() {
        return !!(_data.map && _data.map.features && _data.map.features.length);
    };

    data.set = function(obj, src) {
        for (var k in obj) {
            _data[k] = (typeof obj[k] === 'object') ? clone(obj[k], false) : obj[k];
        }
        if (obj.dirty !== false) data.dirty = true;
        context.dispatch.change({
            obj: obj,
            source: src
        });
        return data;
    };

    data.mergeFeatures = function(features, src) {
        _data.map.features = (_data.map.features || []).concat(features);
        return data.set({ map: _data.map }, src);
    };

    data.get = function(k) {
        return _data[k];
    };

    data.all = function() {
        return clone(_data, false);
    };

    data.fetch = function(q, cb) {
        var type = q.id.split(':')[0];

        switch(type) {
            case 'gist':
                var id = q.id.split(':')[1].split('/')[1];

                source.gist.load(id, context, function(err, d) {
                    return cb(err, d);
                });

                break;
            case 'github':
                var url = q.id.split('/');
                var parts = {
                    user: url[0].split(':')[1],
                    repo: url[1],
                    branch: url[3],
                    path: (url.slice(4) || []).join('/')
                };

                source.github.load(parts, context, function(err, meta) {
                    return source.github.loadRaw(parts, context, function(err, raw) {
                        return cb(err, xtend(meta, { content: JSON.parse(raw) }));
                    });
                });

                break;
        }
    };

    data.parse = function(d, browser) {
        var login,
            repo,
            branch,
            path,
            chunked,
            file;

        if (d.files) d.type = 'gist';

        switch(d.type) {
            case 'blob':
                login = browser.path[1].login;
                repo = browser.path[2].name;
                branch = browser.path[3].name;
                path = [browser.path[4].path, d.path].join('/');

                data.set({
                    type: 'github',
                    source: d,
                    meta: {
                        login: login,
                        repo: repo,
                        branch: branch,
                        name: d.path
                    },
                    map: d.content,
                    path: path,
                    route: 'github:' + [
                        login,
                        repo,
                        'blob',
                        branch,
                        path
                    ].join('/'),
                    url: [
                        'https://github.com',
                        login,
                        repo,
                        'blob',
                        branch,
                        [path, d.path].join('/')
                    ].join('/')
                });
                break;
            case 'file':
                chunked = d.html_url.split('/');
                login = chunked[3];
                repo = chunked[4];
                branch = chunked[6];

                data.set({
                    type: 'github',
                    source: d,
                    meta: {
                        login: login,
                        repo: repo,
                        branch: branch,
                        name: d.name
                    },
                    map: d.content,
                    path: d.path,
                    route: 'github:' + [
                        login,
                        repo,
                        'blob',
                        branch,
                        d.path
                    ].join('/'),
                    url: d.html_url
                });
                break;
            case 'gist':
                login = (d.user && d.user.login) || 'anonymous';
                path = [login, d.id].join('/');
                file = mapFile(d);

                data.set({
                    type: 'gist',
                    source: d,
                    meta: {
                        login: login,
                        name: file && file.name
                    },
                    map: file && file.content,
                    path: path,
                    route: 'gist:' + path,
                    url: d.html_url
                });
                break;
        }
    };

    data.save = function(cb) {
        var type = context.data.get('type');
        if (source[type] && source[type].save) source[type].save(context, cb);
        else source.gist.save(context, cb);
    };

    return data;
};

},{"../source/gist":59,"../source/github":60,"clone":5,"xtend":37}],44:[function(require,module,exports){
var qs = require('../lib/querystring'),
    zoomextent = require('../lib/zoomextent'),
    flash = require('../ui/flash');

module.exports = function(context) {

    function success(err, d) {
        context.container.select('.map').classed('loading', false);

        var message,
            url = /(http:\/\/\S*)/g;

        if (err) {
            message = JSON.parse(err.responseText).message
                .replace(url, '<a href="$&">$&</a>');
            return flash(context.container, message);
        }

        context.data.parse(d);
        zoomextent(context);
    }

    return function(query) {
        if (!query.id && !query.data) return;

        var oldRoute = d3.event ? qs.stringQs(d3.event.oldURL.split('#')[1]).id :
            context.data.get('route');

        if (query.data) {
            context.container.select('.map').classed('loading', true);
            try {
                context.data.set({ map: JSON.parse(query.data.replace('data:application/json,', '')) });
                context.container.select('.map').classed('loading', false);
                location.hash = '';
                zoomextent(context);
            } catch(e) {
                return flash(context.container, 'Could not parse JSON');
            }
        } else if (query.id !== oldRoute) {
            context.container.select('.map').classed('loading', true);
            context.data.fetch(query, success);
        }
    };
};

},{"../lib/querystring":52,"../lib/zoomextent":56,"../ui/flash":65}],45:[function(require,module,exports){
var zoomextent = require('../lib/zoomextent'),
    qs = require('../lib/querystring');

module.exports = function(context) {

    d3.select(window).on('unload', onunload);
    context.dispatch.on('change', onchange);

    var query = qs.stringQs(location.hash.split('#')[1] || '');

    if (location.hash !== '#new' && !query.id && !query.data) {
        var rec = context.storage.get('recover');
        if (rec && confirm('recover your map from the last time you edited?')) {
            context.data.set(rec);
            zoomextent(context);
        } else {
            context.storage.remove('recover');
        }
    }

    function onunload() {
        if (context.data.get('type') === 'local' && context.data.hasFeatures()) {
            context.storage.set('recover', context.data.all());
        } else {
            context.storage.remove('recover');
        }
    }

    function onchange() {
        if (context.data.get('type') !== 'local') {
            context.storage.remove('recover');
        }
    }
};

},{"../lib/querystring":52,"../lib/zoomextent":56}],46:[function(require,module,exports){
var config = require('../config.js')(location.hostname);

module.exports = function(context) {
    var repo = {};

    repo.details = function(callback) {
        var cached = context.storage.get('github_repo_details'),
            meta = context.data.get('meta'),
            login = meta.login,
            repo = meta.repo;

        if (cached && cached.login === login && cached.repo === repo &&
            cached.when > (+new Date() - 1000 * 60 * 60)) {
            callback(null, cached.data);
        } else {
            context.storage.remove('github_repo_details');

            d3.json('https://api.github.com/repos/' + [login, repo].join('/'))
                .header('Authorization', 'token ' + context.storage.get('github_token'))
                .on('load', onload)
                .on('error', onerror)
                .get();
        }

        function onload(repo) {
            context.storage.set('github_repo_details', {
                when: +new Date(),
                data: repo
            });
            context.storage.set('github_repo', repo);
            callback(null, repo);
        }

        function onerror(err) {
            context.storage.remove('github_repo_details');
            callback(new Error(err));
        }
    };

    return repo;
};

},{"../config.js":42}],47:[function(require,module,exports){
var config = require('../config.js')(location.hostname);

module.exports = function(context) {
    var user = {};

    user.details = function(callback) {
        if (!context.storage.get('github_token')) return callback('not logged in');

        var cached = context.storage.get('github_user_details');

        if (cached && cached.when > (+new Date() - 1000 * 60 * 60)) {
            callback(null, cached.data);
        } else {
            context.storage.remove('github_user_details');

            d3.json('https://api.github.com/user')
                .header('Authorization', 'token ' + context.storage.get('github_token'))
                .on('load', onload)
                .on('error', onerror)
                .get();
        }

        function onload(user) {
            context.storage.set('github_user_details', {
                when: +new Date(),
                data: user
            });
            context.storage.set('github_user', user);
            callback(null, user);
        }

        function onerror() {
            user.logout();
            context.storage.remove('github_user_details');
            callback(new Error('not logged in'));
        }
    };

    user.signXHR = function(xhr) {
        return user.token() ?
            xhr.header('Authorization', 'token ' + user.token()) : xhr;
    };

    user.authenticate = function() {
        window.location.href = 'https://github.com/login/oauth/authorize?client_id=' + config.client_id + '&scope=gist,public_repo';
    };

    user.token = function(callback) {
        return context.storage.get('github_token');
    };

    user.logout = function() {
        context.storage.remove('github_token');
    };

    user.login = function() {
        context.storage.remove('github_token');
    };

    function killTokenUrl() {
        if (window.location.href.indexOf('?code') !== -1) {
            window.location.href = window.location.href.replace(/\?code=.*$/, '');
        }
    }

    if (window.location.search && window.location.search.indexOf('?code') === 0) {
        var code = window.location.search.replace('?code=', '');
        d3.select('.map').classed('loading', true);
        d3.json(config.gatekeeper_url + '/authenticate/' + code)
            .on('load', function(l) {
                d3.select('.map').classed('loading', false);
                if (l.token) window.localStorage.github_token = l.token;
                killTokenUrl();
            })
            .on('error', function() {
                d3.select('.map').classed('loading', false);
                alert('Authentication with GitHub failed');
            })
            .get();
    }

    return user;
};

},{"../config.js":42}],48:[function(require,module,exports){
var mobile = require('is-mobile');

if (mobile() || (window.navigator && /iPad/.test(window.navigator.userAgent))) {
    var hash = window.location.hash;
    window.location.href = '/mobile.html' + hash;
}

var ui = require('./ui'),
    map = require('./ui/map'),
    data = require('./core/data'),
    loader = require('./core/loader'),
    router = require('./core/router'),
    recovery = require('./core/recovery'),
    repo = require('./core/repo'),
    user = require('./core/user'),
    store = require('store');

var gjIO = geojsonIO(),
    gjUI = ui(gjIO).write;


d3.select('.geojsonio').call(gjUI);

gjIO.recovery = recovery(gjIO);
gjIO.router.on();

function geojsonIO() {
    var context = {};
    context.dispatch = d3.dispatch('change', 'route');
    context.storage = store;
    context.map = map(context);
    context.data = data(context);
    context.dispatch.on('route', loader(context));
    context.repo = repo(context);
    context.router = router(context);
    context.user = user(context);
    return context;
}

},{"./core/data":43,"./core/loader":44,"./core/recovery":45,"./core/repo":46,"./core/router":32,"./core/user":47,"./ui":61,"./ui/map":69,"is-mobile":13,"store":17}],49:[function(require,module,exports){
var qs = require('../lib/querystring');
require('leaflet-hash');

L.Hash.prototype.parseHash = function(hash) {
    var query = qs.stringQs(hash.substring(1));
    var map = query.map || '';
    var args = map.split('/');
	if (args.length == 3) {
		var zoom = parseInt(args[0], 10),
            lat = parseFloat(args[1]),
            lon = parseFloat(args[2]);
		if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
			return false;
		} else {
			return {
				center: new L.LatLng(lat, lon),
				zoom: zoom
			};
		}
	} else {
		return false;
	}
};

L.Hash.prototype.formatHash = function(map) {
    var query = qs.stringQs(location.hash.substring(1)),
	    center = map.getCenter(),
	    zoom = map.getZoom(),
	    precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));

    query.map = [zoom,
		center.lat.toFixed(precision),
		center.lng.toFixed(precision)
	].join('/');

	return "#" + qs.qsString(query);
};

},{"../lib/querystring":52,"leaflet-hash":14}],50:[function(require,module,exports){
module.exports = function(context) {
    return function(e) {
        var sel = d3.select(e.popup._contentNode);

        sel.selectAll('.cancel')
            .on('click', clickClose);

        sel.selectAll('.save')
            .on('click', saveFeature);

        sel.selectAll('.add')
            .on('click', addRow);

        sel.selectAll('.delete-invert')
            .on('click', removeFeature);

        function clickClose() {
            context.map.closePopup(e.popup);
        }

        function removeFeature() {
            if (e.popup._source && context.mapLayer.hasLayer(e.popup._source)) {
                context.mapLayer.removeLayer(e.popup._source);
                context.data.set({map: context.mapLayer.toGeoJSON()}, 'popup');
            }
        }

        function saveFeature() {
            var obj = {};
            sel.selectAll('tr').each(collectRow);
            function collectRow() {
                if (d3.select(this).selectAll('input')[0][0].value) {
                    obj[d3.select(this).selectAll('input')[0][0].value] =
                        d3.select(this).selectAll('input')[0][1].value;
                }
            }
            e.popup._source.feature.properties = obj;
            context.data.set({map: context.mapLayer.toGeoJSON()}, 'popup');
            context.map.closePopup(e.popup);
        }

        function addRow() {
            var tr = sel.select('tbody')
                .append('tr');

            tr.append('th')
                .append('input')
                .attr('type', 'text');

            tr.append('td')
                .append('input')
                .attr('type', 'text');
        }
    };
};

},{}],51:[function(require,module,exports){
module.exports = function(elem, w, h) {
    var c = elem.appendChild(document.createElement('canvas'));

    c.width = w;
    c.height = h;

    var ctx = c.getContext('2d'),
        gap,
        fill = {
            success: '#e3e4b8',
            error: '#E0A990'
        };

    return function(e) {
        if (!gap) gap = ((e.done) / e.todo * w) - ((e.done - 1) / e.todo * w);
        ctx.fillStyle = fill[e.status];
        ctx.fillRect((e.done - 1) / e.todo * w, 0, gap, h);
    };
};

},{}],52:[function(require,module,exports){
module.exports.stringQs = function(str) {
    return str.split('&').reduce(function(obj, pair){
        var parts = pair.split('=');
        if (parts.length === 2) {
            obj[parts[0]] = (null === parts[1]) ? '' : decodeURIComponent(parts[1]);
        }
        return obj;
    }, {});
};

module.exports.qsString = function(obj, noencode) {
    noencode = true;
    function softEncode(s) { return s.replace('&', '%26'); }
    return Object.keys(obj).sort().map(function(key) {
        return encodeURIComponent(key) + '=' + (
            noencode ? softEncode(obj[key]) : encodeURIComponent(obj[key]));
    }).join('&');
};

},{}],53:[function(require,module,exports){
var topojson = require('topojson'),
    toGeoJSON = require('togeojson'),
    shp = require('shpjs'),
    osm2geojson = require('osm-and-geojson').osm2geojson;

module.exports.readDrop = readDrop;
module.exports.readFile = readFile;

function readDrop(callback) {
    return function() {
        if (d3.event.dataTransfer) {
            d3.event.stopPropagation();
            d3.event.preventDefault();
            var f = d3.event.dataTransfer.files[0];
            readFile(f, callback);
        }
    };
}

function readFile(f, callback) {

    var reader = new FileReader();

    var fileType = detectType(f);

    reader.onload = function(e) {
        switch (fileType) {
            case 'kml' : return fromKML(e.target.result, callback);
            case 'xml' : return fromXML(e.target.result, callback);
            case 'gpx' : return callback(null, toGeoJSON.gpx(toDom(e.target.result)));
            case 'geojson' : return fromGeoJSON(e.target.result, callback);
            case 'dsv' : return fromDSV(e.target.result, callback);
            case 'zip' : return fromZIP(e.target.result, callback);
            default : return callback({
                message: 'Could not detect file type'
            });
        }
    };

    if (fileType === 'zip') {
        reader.readAsArrayBuffer(f);
    } else {
        reader.readAsText(f);
    }

    function toDom(x) {
        return (new DOMParser()).parseFromString(x, 'text/xml');
    }
    
    function fromKML(raw,callback) {
        var kmldom = toDom(raw);
        if (!kmldom) {
            return callback({
                message: 'Invalid KML file: not valid XML'
            });
        }
        var warning;
        if (kmldom.getElementsByTagName('NetworkLink').length) {
            warning = {
                message: 'The KML file you uploaded included NetworkLinks: some content may not display. ' +
                  'Please export and upload KML without NetworkLinks for optimal performance'
            };
        }
        callback(null, toGeoJSON.kml(kmldom), warning);
    }
    
    function fromXML(raw, callback) {
        var xmldom = toDom(raw);
        if (!xmldom) {
            return callback({
                message: 'Invalid XML file: not valid XML'
            });
        }
        callback(null, osm2geojson(xmldom));
    }
    
    function fromGeoJSON(raw, callback) {
        try {
            checkTopo(JSON.parse(raw), callback);
        } catch(err) {
            alert('Invalid JSON file: ' + err);
        }
    }
    
    function checkTopo(gj, callback) {
        if (gj && gj.type === 'Topology' && gj.objects) {
            var collection = { type: 'FeatureCollection', features: [] };
            for (var o in gj.objects) collection.features.push(topojson.feature(gj, gj.objects[o]));
            callback(null, collection);
        } else {
            callback(null, gj);
        }
    }
    
    function fromDSV(raw, callback) {
        csv2geojson.csv2geojson(raw, {
            delimiter: 'auto'
        }, function(err, result) {
            if (err) {
                return callback({
                    type: 'geocode',
                    result: result,
                    raw: raw
                });
            } else {
                return callback(null, result);
            }
        });
    }
    
    function zipResult(result, callback) {
        result.name = result.fileName;
        var fileType = detectType(result);
        switch (fileType) {
            case 'kml' : return fromKML(result, callback);
            case 'xml' : return fromXML(result, callback);
            case 'gpx' : return callback(null, toGeoJSON.gpx(toDom(result)));
            case 'dsv' : return fromDSV(result, callback);
            default : return checkTopo(result, callback);
        }
    }
    
    function fromZIP(raw, callback) {
        shp(raw,['kml','gpx','csv','tsv','dsv','xml','osm']).then(function(result) {
            if (Array.isArray(result)) {
                shp.deferred.all(result.map(function(item) {
                    var def = shp.deferred();
                    zipResult(item, function(err,response) {
                        if (err) {
                            def.reject(err);
                        } else {
                            def.resolve(response);
                        }
                    });
                    return def.promise;
                })).then(function(responses){
                    callback(null, responses.filter(function(item) {
                        return item.features && Array.isArray(item.features);
                    }).reduce(function(a, b) {
                        a.features = a.features.concat(b.features);
                        return a;
                    },{ type: 'FeatureCollection', features: [], name: 'combo'}));
                }, callback);
            } else {
                zipResult(result, callback);
            }
        },function(err) {
            callback({
                type: 'shapefile',
                result: err,
                raw: raw
            });
        });
    }
    
    function detectType(f) {
        var filename = f.name ? f.name.toLowerCase() : '';
        function ext(_) {
            return filename.indexOf(_) !== -1;
        }
        if (f.type === 'application/vnd.google-earth.kml+xml' || ext('.kml')) {
            return 'kml';
        }
        if (ext('.gpx')) return 'gpx';
        if (ext('.geojson') || ext('.json') || ext('.topojson')) return 'geojson';
        if (f.type === 'text/csv' || ext('.csv') || ext('.tsv') || ext('.dsv')) {
            return 'dsv';
        }
        if (ext('.xml') || ext('.osm')) return 'xml';
        
        if (ext('.zip')) return 'zip';
    }
}

},{"osm-and-geojson":15,"shpjs":16,"togeojson":18,"topojson":"CTt6O6"}],54:[function(require,module,exports){
module.exports = function(map, feature, bounds) {
    var zoomLevel;

    if (feature instanceof L.Marker) {
        zoomLevel = bounds.isValid() ? map.getBoundsZoom(bounds) + 2 : 10;
        map.setView(feature.getLatLng(), zoomLevel);
    } else if ('getBounds' in feature && feature.getBounds().isValid()) {
        map.fitBounds(feature.getBounds());
    }
};

},{}],55:[function(require,module,exports){
var geojsonhint = require('geojsonhint');

module.exports = function(callback) {
    return function(editor) {

        var err = geojsonhint.hint(editor.getValue());
        editor.clearGutter('error');

        if (err instanceof Error) {
            handleError(err.message);
            return callback({
                'class': 'icon-circle-blank',
                title: 'invalid JSON',
                message: 'invalid JSON'});
        } else if (err.length) {
            handleErrors(err);
            return callback({
                'class': 'icon-circle-blank',
                title: 'invalid GeoJSON',
                message: 'invalid GeoJSON'});
        } else {
            var gj = JSON.parse(editor.getValue());
            try {
                return callback(null, gj);
            } catch(e) {
                return callback({
                    'class': 'icon-circle-blank',
                    title: 'invalid GeoJSON',
                    message: 'invalid GeoJSON'});
            }
        }

        function handleError(msg) {
            var match = msg.match(/line (\d+)/);
            if (match && match[1]) {
                editor.clearGutter('error');
                editor.setGutterMarker(parseInt(match[1], 10) - 1, 'error', makeMarker(msg));
            }
        }

        function handleErrors(errors) {
            editor.clearGutter('error');
            errors.forEach(function(e) {
                editor.setGutterMarker(e.line, 'error', makeMarker(e.message));
            });
        }

        function makeMarker(msg) {
            return d3.select(document.createElement('div'))
                .attr('class', 'error-marker')
                .attr('message', msg).node();
        }
    };
};

},{"geojsonhint":8}],56:[function(require,module,exports){
module.exports = function(context) {
    var bounds = context.mapLayer.getBounds();
    if (bounds.isValid()) context.map.fitBounds(bounds);
};

},{}],57:[function(require,module,exports){
var validate = require('../lib/validate'),
    saver = require('../ui/saver.js');

module.exports = function(context) {

    CodeMirror.keyMap.tabSpace = {
        Tab: function(cm) {
            var spaces = new Array(cm.getOption('indentUnit') + 1).join(' ');
            cm.replaceSelection(spaces, 'end', '+input');
        },
        'Ctrl-S': saveAction,
        'Cmd-S': saveAction,
        fallthrough: ['default']
    };

    function saveAction() {
        saver(context);
        return false;
    }

    function render(selection) {
        var textarea = selection
            .html('')
            .append('textarea');

        var editor = CodeMirror.fromTextArea(textarea.node(), {
            mode: 'application/json',
            matchBrackets: true,
            tabSize: 2,
            gutters: ['error'],
            theme: 'eclipse',
            autofocus: (window === window.top),
            keyMap: 'tabSpace',
            lineNumbers: true
        });

        editor.on('change', validate(changeValidated));

        function changeValidated(err, data) {
            if (!err) context.data.set({map: data}, 'json');
        }

        context.dispatch.on('change.json', function(event) {
            if (event.source !== 'json') {
                editor.setValue(JSON.stringify(context.data.get('map'), null, 2));
            }
        });

        editor.setValue(JSON.stringify(context.data.get('map'), null, 2));
    }

    render.off = function() {
        context.dispatch.on('change.json', null);
    };

    return render;
};

},{"../lib/validate":55,"../ui/saver.js":72}],58:[function(require,module,exports){
var metatable = require('d3-metatable')(d3),
    smartZoom = require('../lib/smartzoom.js');

module.exports = function(context) {
    function render(selection) {

        selection.html('');

        function rerender() {
            var geojson = context.data.get('map');
            var props;

            if (!geojson || !geojson.geometry && 
                (!geojson.features || !geojson.features.length)) {
                selection
                    .html('')
                    .append('div')
                    .attr('class', 'blank-banner center')
                    .text('no features');
            } else {
                props = geojson.geometry ? [geojson.properties] :
                    geojson.features.map(getProperties);
                selection.select('.blank-banner').remove();
                selection
                    .data([props])
                    .call(metatable()
                        .on('change', function(row, i) {
                            var geojson = context.data.get('map');
                            if (geojson.geometry) {
                                geojson.properties = row;
                            } else {
                                geojson.features[i].properties = row;
                            }
                            context.data.set('map', geojson);
                        })
                        .on('rowfocus', function(row, i) {
                            var bounds = context.mapLayer.getBounds();
                            var j = 0;
                            context.mapLayer.eachLayer(function(l) {
                                if (i === j++) smartZoom(context.map, l, bounds);
                            });
                        })
                    );
            }

        }

        context.dispatch.on('change.table', function(evt) {
            rerender();
        });

        rerender();

        function getProperties(f) { return f.properties; }

        function zoomToMap(p) {
            var layer;
            layers.eachLayer(function(l) {
                if (p == l.feature.properties) layer = l;
            });
            return layer;
        }
    }

    render.off = function() {
        context.dispatch.on('change.table', null);
    };

    return render;
};

},{"../lib/smartzoom.js":54,"d3-metatable":6}],59:[function(require,module,exports){
var fs = require('fs'),
    tmpl = "<!DOCTYPE html>\n<html>\n<head>\n  <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' />\n  <style>\n  body { margin:0; padding:0; }\n  #map { position:absolute; top:0; bottom:0; width:100%; }\n  .marker-properties {\n    border-collapse:collapse;\n    font-size:11px;\n    border:1px solid #eee;\n    margin:0;\n}\n.marker-properties th {\n    white-space:nowrap;\n    border:1px solid #eee;\n    padding:5px 10px;\n}\n.marker-properties td {\n    border:1px solid #eee;\n    padding:5px 10px;\n}\n.marker-properties tr:last-child td,\n.marker-properties tr:last-child th {\n    border-bottom:none;\n}\n.marker-properties tr:nth-child(even) th,\n.marker-properties tr:nth-child(even) td {\n    background-color:#f7f7f7;\n}\n  </style>\n  <script src='//api.tiles.mapbox.com/mapbox.js/v1.3.1/mapbox.js'></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js\" ></script>\n  <link href='//api.tiles.mapbox.com/mapbox.js/v1.3.1/mapbox.css' rel='stylesheet' />\n  <!--[if lte IE 8]>\n    <link href='//api.tiles.mapbox.com/mapbox.js/v1.3.1/mapbox.ie.css' rel='stylesheet' >\n  <![endif]-->\n</head>\n<body>\n<div id='map'></div>\n<script type='text/javascript'>\nvar map = L.mapbox.map('map');\n\nL.mapbox.tileLayer('tmcw.map-ajwqaq7t', {\n    retinaVersion: 'tmcw.map-u8vb5w83',\n    detectRetina: true\n}).addTo(map);\n\nmap.attributionControl.addAttribution('<a href=\"http://geojson.io/\">geojson.io</a>');\n$.getJSON('map.geojson', function(geojson) {\n    var geojsonLayer = L.geoJson(geojson).addTo(map);\n    map.fitBounds(geojsonLayer.getBounds());\n    geojsonLayer.eachLayer(function(l) {\n        showProperties(l);\n    });\n});\nfunction showProperties(l) {\n    var properties = l.toGeoJSON().properties, table = '';\n    for (var key in properties) {\n        table += '<tr><th>' + key + '</th>' +\n            '<td>' + properties[key] + '</td></tr>';\n    }\n    if (table) l.bindPopup('<table class=\"marker-properties display\">' + table + '</table>');\n}\n</script>\n</body>\n</html>\n";

module.exports.save = save;
module.exports.saveBlocks = saveBlocks;
module.exports.load = load;

function saveBlocks(content, callback) {
    var endpoint = 'https://api.github.com/gists';

    d3.json(endpoint)
        .on('load', function(data) {
            callback(null, data);
        })
        .on('error', function(err) {
            var message,
                url = /(http:\/\/\S*)/g;

            message = JSON.parse(err.responseText).message
                .replace(url, '<a href="$&">$&</a>');

            callback(message);
        })
        .send('POST', JSON.stringify({
            description: 'via:geojson.io',
            public: false,
            files: {
                'index.html': { content: tmpl },
                'map.geojson': { content: content }
            }
        }));
}

function save(context, callback) {

    var source = context.data.get('source'),
        meta = context.data.get('meta'),
        name = (meta && meta.name) || 'map.geojson',
        map = context.data.get('map');

    var description = (source && source.description) || 'via:geojson.io',
        public = source ? !!source.public : false;

    context.user.details(onuser);

    function onuser(err, user) {
        var endpoint,
            method = 'POST',
            source = context.data.get('source'),
            files = {};

        if (!err && user && user.login && meta && meta.login && user.login === meta.login) {
            endpoint = 'https://api.github.com/gists/' + source.id;
            method = 'PATCH';
        } else if (!err && source && source.id) {
            endpoint = 'https://api.github.com/gists/' + source.id + '/forks';
        } else {
            endpoint = 'https://api.github.com/gists';
        }

        files[name] = {
            content: JSON.stringify(map)
        };

        context.user.signXHR(d3.json(endpoint))
            .on('load', function(data) {
                callback(null, data);
            })
            .on('error', function(err) {
                var message,
                    url = /(http:\/\/\S*)/g;

                message = JSON.parse(err.responseText).message
                    .replace(url, '<a href="$&">$&</a>');

                callback(message);
            })
            .send(method, JSON.stringify({
                files: files
            }));
    }
}

function load(id, context, callback) {
    context.user.signXHR(d3.json('https://api.github.com/gists/' + id))
        .on('load', onLoad)
        .on('error', onError)
        .get();

    function onLoad(json) { callback(null, json); }
    function onError(err) { callback(err, null); }
}

},{"fs":1}],60:[function(require,module,exports){
module.exports.save = save;
module.exports.load = load;
module.exports.loadRaw = loadRaw;

function save(context, callback) {
    var source = context.data.get('source'),
        meta = context.data.get('meta'),
        name = (meta && meta.name) || 'map.geojson',
        map = context.data.get('map');

    if (navigator.appVersion.indexOf('MSIE 9') !== -1 || !window.XMLHttpRequest) {
        return alert('Sorry, saving and sharing is not supported in IE9 and lower. ' +
            'Please use a modern browser to enjoy the full featureset of geojson.io');
    }

    if (!localStorage.github_token) {
        return alert('You need to log in with GitHub to commit changes');
    }

    context.repo.details(onrepo);

    function onrepo(err, repo) {
        var commitMessage,
            endpoint,
            method = 'POST',
            files = {};

        if (!err && repo.permissions.push) {
            commitMessage = context.commitMessage || prompt('Commit message:');
            if (!commitMessage) return;

            endpoint = source.url;
            method = 'PUT';
            data = {
                message: commitMessage,
                sha: source.sha,
                branch: meta.branch,
                content: Base64.toBase64(JSON.stringify(map))
            };
        } else {
            endpoint = 'https://api.github.com/gists';
            files[name] = { content: JSON.stringify(map) };
            data = { files: files };
        }

        context.user.signXHR(d3.json(endpoint))
            .on('load', function(data) {
                callback(null, data);
            })
            .on('error', function(err) {
                var message,
                    url = /(http:\/\/\S*)/g;

                message = JSON.parse(err.responseText).message
                    .replace(url, '<a href="$&">$&</a>');

                callback(message);
            })
            .send(method, JSON.stringify(data));
    }
}

function parseGitHubId(id) {
    var parts = id.split('/');
    return {
        user: parts[0],
        repo: parts[1],
        mode: parts[2],
        branch: parts[3],
        file: parts.slice(4).join('/')
    };
}

function load(parts, context, callback) {
    context.user.signXHR(d3.json(fileUrl(parts)))
        .on('load', onLoad)
        .on('error', onError)
        .get();

    function onLoad(file) {
        callback(null, file);
    }
    function onError(err) { callback(err, null); }
}

function loadRaw(parts, context, callback) {
    context.user.signXHR(d3.text(fileUrl(parts)))
        .on('load', onLoad)
        .on('error', onError)
        .header('Accept', 'application/vnd.github.raw')
        .get();

    function onLoad(file) {
        callback(null, file);
    }
    function onError(err) { callback(err, null); }
}

function fileUrl(parts) {
    return 'https://api.github.com/repos/' +
        parts.user +
        '/' + parts.repo +
        '/contents/' + parts.path +
        '?ref=' + parts.branch;
}

},{}],61:[function(require,module,exports){
var buttons = require('./ui/mode_buttons'),
    file_bar = require('./ui/file_bar'),
    dnd = require('./ui/dnd'),
    userUi = require('./ui/user'),
    layer_switch = require('./ui/layer_switch');

module.exports = ui;

function ui(context) {
    function init(selection) {

        var container = selection
            .append('div')
            .attr('class', 'container');

        var map = container
            .append('div')
            .attr('class', 'map')
            .call(context.map)
            .call(layer_switch(context));

        context.container = container;

        return container;
    }

    function render(selection) {

        var container = init(selection);

        var right = container
            .append('div')
            .attr('class', 'right');

        var top = right
            .append('div')
            .attr('class', 'top');

        top
            .append('button')
            .attr('class', 'collapse-button')
            .attr('title', 'Collapse')
            .on('click', function collapse() {
                d3.select('body').classed('fullscreen',
                    !d3.select('body').classed('fullscreen'));
                var full = d3.select('body').classed('fullscreen');
                d3.select(this)
                    .select('.icon')
                    .classed('icon-caret-up', !full)
                    .classed('icon-caret-down', full);
                context.map.invalidateSize();
            })
            .append('class', 'span')
            .attr('class', 'icon icon-caret-up');

        var pane = right
            .append('div')
            .attr('class', 'pane');

        top
            .append('div')
            .attr('class', 'user fr pad1 deemphasize')
            .call(userUi(context));

        top
            .append('div')
            .attr('class', 'buttons')
            .call(buttons(context, pane));

        container
            .append('div')
            .attr('class', 'file-bar')
            .call(file_bar(context));

        dnd(context);
    }


    return {
        read: init,
        write: render
    };
}

},{"./ui/dnd":63,"./ui/file_bar":64,"./ui/layer_switch":68,"./ui/mode_buttons":71,"./ui/user":75}],62:[function(require,module,exports){
var github = require('../source/github');

module.exports = commit;

function commit(context, callback) {
    context.container.select('.share').remove();
    context.container.select('.tooltip.in')
      .classed('in', false);

    var wrap = context.container.append('div')
        .attr('class', 'share pad1 center')
        .style('z-index', 10);

    var form = wrap.append('form')
        .on('submit', function() {
            d3.event.preventDefault();
            context.commitMessage = message.property('value');
            if (typeof callback === 'function') callback();
        });

    var message = form.append('input')
        .attr('placeholder', 'Commit message')
        .attr('type', 'text');

    var commitButton = form.append('input')
        .attr('type', 'submit')
        .property('value', 'Commit Changes')
        .attr('class', 'semimajor');

    message.node().focus();

    return wrap;
}

},{"../source/github":60}],63:[function(require,module,exports){
var readDrop = require('../lib/readfile.js').readDrop,
    geocoder = require('./geocode.js'),
    flash = require('./flash.js');

module.exports = function(context) {
    d3.select('body')
        .attr('dropzone', 'copy')
        .on('drop.import', readDrop(function(err, gj, warning) {
            if (err) {
                if (err.type === 'geocode') {
                    context.container.select('.icon-folder-open-alt')
                        .trigger('click');
                    flash(context.container, 'This file requires geocoding. Click Import to geocode it')
                        .classed('error', 'true');
                } else if (err.message) {
                    flash(context.container, err.message)
                        .classed('error', 'true');
                }
            } else if (gj && gj.features) {
                context.data.mergeFeatures(gj.features);
                if (warning) {
                    flash(context.container, warning.message);
                } else {
                    flash(context.container, 'Imported ' + gj.features.length + ' features.')
                        .classed('success', 'true');
                }
            }
            d3.select('body').classed('dragover', false);
        }))
        .on('dragenter.import', over)
        .on('dragleave.import', exit)
        .on('dragover.import', over);

   function over() {
        d3.event.stopPropagation();
        d3.event.preventDefault();
        d3.event.dataTransfer.dropEffect = 'copy';
        d3.select('body').classed('dragover', true);
    }

    function exit() {
        d3.event.stopPropagation();
        d3.event.preventDefault();
        d3.event.dataTransfer.dropEffect = 'copy';
        d3.select('body').classed('dragover', false);
    }
};

},{"../lib/readfile.js":53,"./flash.js":65,"./geocode.js":66}],64:[function(require,module,exports){
var share = require('./share'),
    sourcepanel = require('./source.js'),
    saver = require('../ui/saver.js');

module.exports = function fileBar(context) {

    function bar(selection) {

        var name = selection.append('div')
            .attr('class', 'name');

        var filetype = name.append('a')
            .attr('target', '_blank')
            .attr('class', 'icon-file-alt');

        var filename = name.append('span')
            .attr('class', 'filename')
            .text('unsaved');

        var actions = [{
            title: 'Save',
            icon: 'icon-save',
            action: saveAction
        }, {
            title: 'Open',
            icon: 'icon-folder-open-alt',
            action: function() {
                context.container.call(sourcepanel(context));
            }
        }, {
            title: 'New',
            icon: 'icon-plus',
            action: function() {
                window.open('/#new');
            }
        }, {
            title: 'Download',
            icon: 'icon-download',
            action: function() {
                download();
            }
        }, {
            title: 'Share',
            icon: 'icon-share-alt',
            action: function() {
                context.container.call(share(context));
            }
        }];

        function saveAction() {
            if (d3.event) d3.event.preventDefault();
            saver(context);
        }

        function download() {
            if (d3.event) d3.event.preventDefault();
            var content = JSON.stringify(context.data.get('map'));
            var meta = context.data.get('meta');
            window.saveAs(new Blob([content], {
                type: 'text/plain;charset=utf-8'
            }), (meta && meta.name) || 'map.geojson');
        }

        function sourceIcon(type) {
            if (type == 'github') return 'icon-github';
            else if (type == 'gist') return 'icon-github-alt';
            else return 'icon-file-alt';
        }

        function saveNoun(_) {
            buttons.filter(function(b) {
                return b.title === 'Save';
            }).select('span.title').text(_);
        }

        var buttons = selection.append('div')
            .attr('class', 'fr')
            .selectAll('button')
            .data(actions)
            .enter()
            .append('button')
            .on('click', function(d) {
                d.action.apply(this, d);
            })
            .attr('data-original-title', function(d) {
                return d.title;
            })
            .attr('class', function(d) {
                return d.icon + ' icon sq40';
            })
            .call(bootstrap.tooltip().placement('bottom'));

        context.dispatch.on('change.filebar', onchange);

        function onchange(d) {
            var data = d.obj,
                type = data.type,
                path = data.path;
            filename
                .text(path ? path : 'unsaved')
                .classed('deemphasize', context.data.dirty);
            filetype
                .attr('href', data.url)
                .attr('class', sourceIcon(type));
            saveNoun(type == 'github' ? 'Commit' : 'Save');
        }

        d3.select(document).call(
            d3.keybinding('file_bar')
                .on('⌘+a', download)
                .on('⌘+s', saveAction));
    }

    return bar;
};

},{"../ui/saver.js":72,"./share":73,"./source.js":74}],65:[function(require,module,exports){
var message = require('./message');

module.exports = flash;

function flash(selection, txt) {
    'use strict';

    var msg = message(selection);

    if (txt) msg.select('.content').html(txt);

    setTimeout(function() {
        msg
            .transition()
            .style('opacity', 0)
            .remove();
    }, 5000);

    return msg;
}

},{"./message":70}],66:[function(require,module,exports){
var progressChart = require('../lib/progress_chart');

module.exports = function(context) {
    return function(container, text) {

        var list = csv2geojson.auto(text);

        var button = container.append('div')
            .attr('class', 'bucket-actions')
            .append('button')
            .attr('class', 'major')
            .attr('disabled', true)
            .text('At least one field required to geocode');

        var join = container.append('div')
            .attr('class', 'bucket-deposit')
            .append('div')
            .attr('class', 'bucket-join');

        var buckets = join.selectAll('.bucket')
            .data(['City', 'State', 'ZIP', 'Country'])
            .enter()
            .append('div')
            .attr('class', 'bucket')
            .text(String);

        var example = container.append('div')
            .attr('class', 'example');

        var store = container.append('div')
           .attr('class', 'bucket-store');

        var sources = store.selectAll('bucket-source')
           .data(Object.keys(list[0]))
           .enter()
           .append('div')
           .attr('class', 'bucket-source')
           .text(String);

        function showExample(fields) {
            var i = 0;
            return function() {
                if (++i > list.length) i = 0;
                example.html('');
                example.text(transformRow(fields)(list[i]));
            };
        }

        var ti;
        var broker = bucket();
        buckets.call(broker.deposit());
        sources.call(broker.store().on('chosen', onChosen));

        function onChosen(fields) {
             if (ti) window.clearInterval(ti);
             if (fields.length) {
                 button.attr('disabled', null)
                    .text('Geocode');
                 button.on('click', function() {
                     runGeocode(container, list, transformRow(fields), context);
                 });
                 var se = showExample(fields);
                 se();
                 ti = window.setInterval(se, 2000);
             } else {
                 button.attr('disabled', true)
                    .text('At least one field required to geocode');
                 example.text('');
             }
         }
    };
};

function runGeocode(container, list, transform, context) {
    container.html('');

    var wrap = container
        .append('div')
        .attr('class', 'pad1');

    var doneBtn = wrap.append('div')
        .attr('class', 'pad1 center')
        .append('button')
        .attr('class', 'major')
        .text('Close')
        .on('click', function() {
            container.html('');
            if (task) task();
        });

    var chartDiv = wrap.append('div'),
        failedDiv = wrap.append('div'),
        geocode = geocodemany('tmcw.map-u4ca5hnt');

    var chart = progressChart(chartDiv.node(), chartDiv.node().offsetWidth, 50),
        task = geocode(list, transform, progress, done);

    function progress(e) {
        chart(e);
    }

    function done(failed, completed) {

        failedDiv
            .selectAll('pre')
            .data(failed)
            .enter()
            .append('pre')
            .text(failedMessage);

        function failedMessage(d) {
            return 'failed: ' + transform(d.data) + ' / ' + printObj(d.data);
        }

        csv2geojson.csv2geojson(completed, function(err, result) {
            if (result.features) {
                context.data.mergeFeatures(result.features);
            }
        });
    }
}

function transformRow(fields) {
    return function(obj) {
       return d3.entries(obj)
           .filter(function(_) { return fields.indexOf(_.key) !== -1; })
           .map(function(_) { return _.value; })
           .join(', ');
    };
}

function printObj(o) {
    return '(' + d3.entries(o)
        .map(function(_) { return _.key + ': ' + _.value; }).join(',') + ')';
}

},{"../lib/progress_chart":51}],67:[function(require,module,exports){
var importSupport = !!(window.FileReader),
    flash = require('./flash.js'),
    geocode = require('./geocode.js'),
    readFile = require('../lib/readfile.js'),
    zoomextent = require('../lib/zoomextent');

module.exports = function(context) {
    return function(selection) {
        selection.html('');

        var wrap = selection
            .append('div')
            .attr('class', 'pad1');

        wrap.append('div')
            .attr('class', 'modal-message')
            .text('Drop files to map!');

        if (importSupport) {

            var import_landing = wrap.append('div')
                .attr('class', 'pad fillL');

            var message = import_landing
                .append('div')
                .attr('class', 'center');

            var button = message.append('button')
                .on('click', function() {
                    fileInput.node().click();
                });
            button.append('span').attr('class', 'icon-arrow-down');
            button.append('span').text(' Import');
            message.append('p')
                .attr('class', 'deemphasize')
                .append('small')
                .text('GeoJSON, TopoJSON, KML, CSV, GPX and OSM XML supported. You can also drag & drop files.');

            var fileInput = message
                .append('input')
                .attr('type', 'file')
                .style('visibility', 'hidden')
                .style('position', 'absolute')
                .style('height', '0')
                .on('change', function() {
                    if (this.files && this.files[0]) readFile.readFile(this.files[0], onImport);
                });
        } else {
            wrap.append('p')
                .attr('class', 'blank-banner center')
                .text('Sorry, geojson.io supports importing GeoJSON, TopoJSON, KML, CSV, GPX, and OSM XML files, but ' +
                      'your browser isn\'t compatible. Please use Google Chrome, Safari 6, IE10, Firefox, or Opera for an optimal experience.');
        }

        function onImport(err, gj, warning) {
            if (err) {
                if (err.type === 'geocode') {
                    wrap.call(geocode(context), err.raw);
                } else if (err.message) {
                    flash(context.container, err.message)
                        .classed('error', 'true');
                }
            } else if (gj && gj.features) {
                context.data.mergeFeatures(gj.features);
                if (warning) {
                    flash(context.container, warning.message);
                } else {
                    flash(context.container, 'Imported ' + gj.features.length + ' features.')
                        .classed('success', 'true');
                    zoomextent(context);
                }
            }
        }

        wrap.append('p')
            .attr('class', 'intro center deemphasize')
            .html('This is an open source project. <a target="_blank" href="http://tmcw.wufoo.com/forms/z7x4m1/">Submit feedback or get help</a>, and <a target="_blank" href="http://github.com/mapbox/geojson.io"><span class="icon-github"></span> fork on GitHub</a>');

        wrap.append('div')
            .attr('class', 'pad1');
    };
};

},{"../lib/readfile.js":53,"../lib/zoomextent":56,"./flash.js":65,"./geocode.js":66}],68:[function(require,module,exports){
module.exports = function(context) {

    return function(selection) {

        var layers = [{
            title: 'MapBox',
            layer: L.mapbox.tileLayer('tmcw.map-7s15q36b', {
                retinaVersion: 'tmcw.map-u4ca5hnt',
                detectRetina: true
            })
        }, {
            title: 'Satellite',
            layer: L.mapbox.tileLayer('tmcw.map-j5fsp01s', {
                retinaVersion: 'tmcw.map-ujx9se0r',
                detectRetina: true
            })
        }, {
            title: 'OSM',
            layer: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            })
        }];

        var layerSwap = function(d) {
            var clicked = this instanceof d3.selection ? this.node() : this;
            layerButtons.classed('active', function() {
                return clicked === this;
            });
            layers.forEach(swap);
            function swap(l) {
                var datum = d instanceof d3.selection ? d.datum() : d;
                if (l.layer == datum.layer) context.map.addLayer(datum.layer);
                else if (context.map.hasLayer(l.layer)) context.map.removeLayer(l.layer);
            }
        };
        
        var layerButtons = selection.append('div')
            .attr('class', 'layer-switch')
            .selectAll('button')
            .data(layers)
            .enter()
            .append('button')
            .attr('class', 'pad0')
            .on('click', layerSwap)
            .text(function(d) { return d.title; });

        layerButtons.filter(function(d, i) { return i === 0; }).call(layerSwap);

    };
};


},{}],69:[function(require,module,exports){
var popup = require('../lib/popup'),
    customHash = require('../lib/custom_hash.js'),
    qs = require('../lib/querystring.js');
    writable = false;


module.exports = function(context, readonly) {

    writable = !readonly;

    function map(selection) {

        context.map = L.mapbox.map(selection.node())
            .setView([20, 0], 2)
            .addControl(L.mapbox.geocoderControl('tmcw.map-u4ca5hnt'));

        L.hash(context.map);

        context.mapLayer = L.featureGroup().addTo(context.map);

        if (writable) {
          context.drawControl = new L.Control.Draw({
              edit: { featureGroup: context.mapLayer },
              draw: {
                  circle: false,
                  polyline: { metric: navigator.language !== 'en-US' },
                  polygon: { metric: navigator.language !== 'en-US' }
              }
          }).addTo(context.map);

          context.map
            .on('draw:edited', update)
            .on('draw:deleted', update);
        }

        context.map
            .on('draw:created', created)
            .on('popupopen', popup(context));

        context.map.attributionControl.addAttribution('<a target="_blank" href="http://tmcw.wufoo.com/forms/z7x4m1/">Feedback</a>');
        context.map.attributionControl.addAttribution('<a target="_blank" href="https://github.com/mapbox/geojson.io/blob/gh-pages/CHANGELOG.md">Changelog</a>');
        context.map.attributionControl.addAttribution('<a target="_blank" href="http://geojson.io/about.html">About</a>');

        function update() {
            geojsonToLayer(context.mapLayer.toGeoJSON(), context.mapLayer);
            context.data.set({map: layerToGeoJSON(context.mapLayer)}, 'map');
        }

        context.dispatch.on('change.map', function() {
            geojsonToLayer(context.data.get('map'), context.mapLayer);
        });

        function created(e) {
            context.mapLayer.addLayer(e.layer);
            update();
        }
    }

    function layerToGeoJSON(layer) {
        var features = [];
        layer.eachLayer(collect);
        function collect(l) { if ('toGeoJSON' in l) features.push(l.toGeoJSON()); }
        return {
            type: 'FeatureCollection',
            features: features
        };
    }

    return map;
};

function geojsonToLayer(geojson, layer) {
    layer.clearLayers();
    L.geoJson(geojson).eachLayer(add);
    function add(l) {
        bindPopup(l);
        l.addTo(layer);
    }
}

function bindPopup(l) {

    var properties = l.toGeoJSON().properties, table = '';

    if (!properties) return;

    if (!Object.keys(properties).length) properties = { '': '' };

    for (var key in properties) {
        table += '<tr><th><input type="text" value="' + key + '"' + (!writable ? ' readonly' : '') + ' /></th>' +
            '<td><input type="text" value="' + properties[key] + '"' + (!writable ? ' readonly' : '') + ' /></td></tr>';
    }

    var content = '<div class="clearfix">' +
        '<div class="marker-properties-limit"><table class="marker-properties">' + table + '</table></div>' +
        (writable ? '<br /><div class="clearfix col12">' +
            '<div class="buttons-joined fl"><button class="add major">add row</button> ' +
            '<button class="save major">save</button> ' +
            '<button class="major cancel">cancel</button></div>' +
            '<div class="fr clear-buttons"><button class="delete-invert"><span class="icon-remove-sign"></span> remove</button></div></div>' : '') +
        '</div>';

    l.bindPopup(L.popup({
        maxWidth: 500,
        maxHeight: 400
    }, l).setContent(content));
}

},{"../lib/custom_hash.js":49,"../lib/popup":50,"../lib/querystring.js":52}],70:[function(require,module,exports){
module.exports = message;

function message(selection) {
    'use strict';

    selection.select('div.message').remove();

    var sel = selection.append('div')
        .attr('class', 'message pad1');

    sel.append('a')
        .attr('class', 'icon-remove fr')
        .on('click', function() {
            sel.remove();
        });

    sel.append('div')
        .attr('class', 'content');

    sel
        .style('opacity', 0)
        .transition()
        .duration(200)
        .style('opacity', 1);

    sel.close = function() {
        sel
            .transition()
            .duration(200)
            .style('opacity', 0)
            .remove();
        sel
            .transition()
            .duration(200)
            .style('top', '0px');
    };

    return sel;
}

},{}],71:[function(require,module,exports){
var table = require('../panel/table'),
    json = require('../panel/json');

module.exports = function(context, pane) {
    return function(selection) {

        var mode = null;

        var buttonData = [{
            icon: 'table',
            title: ' Table',
            alt: 'Edit feature properties in a table',
            behavior: table
        }, {
            icon: 'code',
            title: ' JSON',
            alt: 'JSON Source',
            behavior: json
        }];

        var buttons = selection
            .selectAll('button')
            .data(buttonData, function(d) { return d.icon; });

        var enter = buttons.enter()
            .append('button')
            .attr('title', function(d) { return d.alt; })
            .on('click', buttonClick);
        enter.append('span')
            .attr('class', function(d) { return 'icon-' + d.icon; });
        enter
            .append('span')
            .text(function(d) { return d.title; });

        d3.select(buttons.node()).trigger('click');

        function buttonClick(d) {
            buttons.classed('active', function(_) { return d.icon == _.icon; });
            if (mode) mode.off();
            mode = d.behavior(context);
            pane.call(mode);
        }
    };
};

},{"../panel/json":57,"../panel/table":58}],72:[function(require,module,exports){
var commit = require('./commit');
var flash = require('./flash');

module.exports = function(context) {
    if (d3.event) d3.event.preventDefault();

    function success(err, res) {
        if (err) return flash(context.container, err.toString());

        var message,
          url,
          path,
          commitMessage;

        if (!!res.files) {
            // Saved as Gist
            message = 'Changes to this map saved to Gist: ';
            url = res.html_url;
            path = res.id;
        } else {
            // Committed to GitHub
            message = 'Changes committed to GitHub: ';
            url = res.commit.html_url;
            path = res.commit.sha.substring(0,10);
        }

        flash(context.container, message + '<a href="' + url + '">' + path + '</a>');

        context.container.select('.map').classed('loading', false);
        context.data.parse(res);
    }

    var meta = context.data.get('meta'),
        map = context.data.get('map'),
        features = map && map.geometry || (map.features && map.features.length),
        type = context.data.get('type');

    if (!features) {
        return flash(context.container, 'Add a feature to the map to save it');
    }

    context.container.select('.map').classed('loading', true);

    if (type === 'github') {
        context.repo.details(onrepo);
    } else {
        context.data.save(success);
    }

    function onrepo(err, repo) {
        if (!err && repo.permissions.push) {
            var wrap = commit(context, function() {
                wrap.remove();
                context.data.save(success);
            });
        } else {
            context.data.save(success);
        }
    }
};

},{"./commit":62,"./flash":65}],73:[function(require,module,exports){
var gist = require('../source/gist');

module.exports = share;

function facebookUrl(_) {
    return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(_);
}

function twitterUrl(_) {
    return 'https://twitter.com/intent/tweet?source=webclient&text=' + encodeURIComponent(_);
}

function emailUrl(_) {
    return 'mailto:?subject=' + encodeURIComponent('My Map on geojson.io') + '&body=Here\'s the link: ' + encodeURIComponent(_);
}

function share(context) {
    return function(selection) {

        selection.select('.share').remove();
        selection.select('.tooltip.in')
          .classed('in', false);

        var sel = selection.append('div')
            .attr('class', 'share pad1');

        var networks = [{
            icon: 'icon-facebook',
            title: 'Facebook',
            url: facebookUrl(location.href)
        }, {
            icon: 'icon-twitter',
            title: 'Twitter',
            url: twitterUrl(location.href)
        }, {
            icon: 'icon-envelope-alt',
            title: 'Email',
            url: emailUrl(location.href)
        }];

        var links = sel
            .selectAll('.network')
            .data(networks)
            .enter()
            .append('a')
            .attr('target', '_blank')
            .attr('class', 'network')
            .attr('href', function(d) { return d.url; });

        links.append('span')
            .attr('class', function(d) { return d.icon + ' pre-icon'; });

        links.append('span')
            .text(function(d) { return d.title; });

        var embed_html = sel
            .append('input')
            .attr('type', 'text')
            .attr('title', 'Embed HTML');

        sel.append('a')
            .attr('class', 'icon-remove')
            .on('click', function() { sel.remove(); });

        gist.saveBlocks(context.data.get('map'), function(err, res) {
            if (err) return;
            if (res) {
                embed_html.property('value',
                    '<iframe frameborder="0" width="100%" height="300" ' +
                    'src="http://bl.ocks.org/d/' + res.id + '"></iframe>');
                embed_html.node().select();
            }
        });
    };
}

},{"../source/gist":59}],74:[function(require,module,exports){
var importPanel = require('./import'),
    githubBrowser = require('github-file-browser')(d3),
    detectIndentationStyle = require('detect-json-indent');

module.exports = function(context) {

    function render(selection) {

        selection.select('.right.overlay').remove();

        var panel = selection.append('div')
            .attr('class', 'right overlay');

        var sources = [{
            title: 'Import',
            alt: 'CSV, KML, GPX, and other filetypes',
            icon: 'icon-cog',
            action: clickImport
        }, {
            title: 'GitHub',
            alt: 'GeoJSON files in GitHub Repositories',
            icon: 'icon-github',
            authenticated: true,
            action: clickGitHub
        }, {
            title: 'Gist',
            alt: 'GeoJSON files in GitHub Gists',
            icon: 'icon-github-alt',
            authenticated: true,
            action: clickGist
        }];

        var $top = panel
            .append('div')
            .attr('class', 'top');

       var $buttons = $top.append('div')
            .attr('class', 'buttons');

       var $sources = $buttons
           .selectAll('button.source')
            .data(sources)
            .enter()
            .append('button')
            .classed('deemphasize', function(d) {
                return d.authenticated && !context.user.token();
            })
            .attr('class', function(d) {
                return d.icon + ' icon-spaced pad1 source';
            })
            .text(function(d) {
                return ' ' + d.title;
            })
            .attr('title', function(d) { return d.alt; })
            .on('click', clickSource);

        function clickSource(d) {
            if (d.authenticated && !context.user.token()) {
                return alert('Log in to load GitHub files and Gists');
            }

            var that = this;
            $sources.classed('active', function() {
                return that === this;
            });

            d.action.apply(this, d);
        }

        $buttons.append('button')
            .on('click', hidePanel)
            .attr('class', function(d) {
                return 'icon-remove';
            });

        function hidePanel(d) {
            panel.remove();
        }

        var $subpane = panel.append('div')
            .attr('class', 'subpane');

        function clickGitHub() {
            $subpane
                .html('')
                .append('div')
                .attr('class', 'repos')
                .call(githubBrowser
                    .gitHubBrowse(context.user.token(), {
                        sort: function(a, b) {
                            return new Date(b.pushed_at) - new Date(a.pushed_at);
                        }
                    }).on('chosen', context.data.parse));
        }

        function clickImport() {
            $subpane
                .html('')
                .append('div')
                .call(importPanel(context));
        }

        function clickGist() {
            $subpane
                .html('')
                .append('div')
                .attr('class', 'browser pad1')
                .call(githubBrowser
                    .gistBrowse(context.user.token(), {
                        sort: function(a, b) {
                            return new Date(b.updated_at) - new Date(a.updated_at);
                        }
                    }).on('chosen', context.data.parse));
        }

        $sources.filter(function(d, i) { return !i; }).trigger('click');
    }

    return render;
};

},{"./import":67,"detect-json-indent":7,"github-file-browser":10}],75:[function(require,module,exports){
module.exports = function(context) {
    return function(selection) {
        var name = selection.append('a')
            .attr('target', '_blank');

        selection.append('span').text(' | ');

        var action = selection.append('a')
            .attr('href', '#');

        function nextLogin() {
            action.text('login').on('click', login);
            name
                .text('anon')
                .attr('href', '#')
                .on('click', function() { d3.event.preventDefault(); });
        }

        function nextLogout() {
            name.on('click', null);
            action.text('logout').on('click', logout);
        }

        function login() {
            d3.event.preventDefault();
            context.user.authenticate();
        }

        function logout() {
            d3.event.preventDefault();
            context.user.logout();
            nextLogin();
        }

        nextLogin();

        if (context.user.token()) {
            context.user.details(function(err, d) {
                if (err) return;
                name.text(d.login);
                name.attr('href', d.html_url);
                nextLogout();
            });
        }
    };
};

},{}]},{},[59,48])
;