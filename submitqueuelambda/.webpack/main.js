/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 905:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BigNumber": () => (/* binding */ BigNumber),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/*
 *      bignumber.js v9.0.0
 *      A JavaScript library for arbitrary-precision arithmetic.
 *      https://github.com/MikeMcl/bignumber.js
 *      Copyright (c) 2019 Michael Mclaughlin <M8ch88l@gmail.com>
 *      MIT Licensed.
 *
 *      BigNumber.prototype methods     |  BigNumber methods
 *                                      |
 *      absoluteValue            abs    |  clone
 *      comparedTo                      |  config               set
 *      decimalPlaces            dp     |      DECIMAL_PLACES
 *      dividedBy                div    |      ROUNDING_MODE
 *      dividedToIntegerBy       idiv   |      EXPONENTIAL_AT
 *      exponentiatedBy          pow    |      RANGE
 *      integerValue                    |      CRYPTO
 *      isEqualTo                eq     |      MODULO_MODE
 *      isFinite                        |      POW_PRECISION
 *      isGreaterThan            gt     |      FORMAT
 *      isGreaterThanOrEqualTo   gte    |      ALPHABET
 *      isInteger                       |  isBigNumber
 *      isLessThan               lt     |  maximum              max
 *      isLessThanOrEqualTo      lte    |  minimum              min
 *      isNaN                           |  random
 *      isNegative                      |  sum
 *      isPositive                      |
 *      isZero                          |
 *      minus                           |
 *      modulo                   mod    |
 *      multipliedBy             times  |
 *      negated                         |
 *      plus                            |
 *      precision                sd     |
 *      shiftedBy                       |
 *      squareRoot               sqrt   |
 *      toExponential                   |
 *      toFixed                         |
 *      toFormat                        |
 *      toFraction                      |
 *      toJSON                          |
 *      toNumber                        |
 *      toPrecision                     |
 *      toString                        |
 *      valueOf                         |
 *
 */


var
  isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,

  mathceil = Math.ceil,
  mathfloor = Math.floor,

  bignumberError = '[BigNumber Error] ',
  tooManyDigits = bignumberError + 'Number primitive has more than 15 significant digits: ',

  BASE = 1e14,
  LOG_BASE = 14,
  MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
  // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
  POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
  SQRT_BASE = 1e7,

  // EDITABLE
  // The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
  // the arguments to toExponential, toFixed, toFormat, and toPrecision.
  MAX = 1E9;                                   // 0 to MAX_INT32


/*
 * Create and return a BigNumber constructor.
 */
function clone(configObject) {
  var div, convertBase, parseNumeric,
    P = BigNumber.prototype = { constructor: BigNumber, toString: null, valueOf: null },
    ONE = new BigNumber(1),


    //----------------------------- EDITABLE CONFIG DEFAULTS -------------------------------


    // The default values below must be integers within the inclusive ranges stated.
    // The values can also be changed at run-time using BigNumber.set.

    // The maximum number of decimal places for operations involving division.
    DECIMAL_PLACES = 20,                     // 0 to MAX

    // The rounding mode used when rounding to the above decimal places, and when using
    // toExponential, toFixed, toFormat and toPrecision, and round (default value).
    // UP         0 Away from zero.
    // DOWN       1 Towards zero.
    // CEIL       2 Towards +Infinity.
    // FLOOR      3 Towards -Infinity.
    // HALF_UP    4 Towards nearest neighbour. If equidistant, up.
    // HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
    // HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
    // HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
    // HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
    ROUNDING_MODE = 4,                       // 0 to 8

    // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

    // The exponent value at and beneath which toString returns exponential notation.
    // Number type: -7
    TO_EXP_NEG = -7,                         // 0 to -MAX

    // The exponent value at and above which toString returns exponential notation.
    // Number type: 21
    TO_EXP_POS = 21,                         // 0 to MAX

    // RANGE : [MIN_EXP, MAX_EXP]

    // The minimum exponent value, beneath which underflow to zero occurs.
    // Number type: -324  (5e-324)
    MIN_EXP = -1e7,                          // -1 to -MAX

    // The maximum exponent value, above which overflow to Infinity occurs.
    // Number type:  308  (1.7976931348623157e+308)
    // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
    MAX_EXP = 1e7,                           // 1 to MAX

    // Whether to use cryptographically-secure random number generation, if available.
    CRYPTO = false,                          // true or false

    // The modulo mode used when calculating the modulus: a mod n.
    // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
    // The remainder (r) is calculated as: r = a - n * q.
    //
    // UP        0 The remainder is positive if the dividend is negative, else is negative.
    // DOWN      1 The remainder has the same sign as the dividend.
    //             This modulo mode is commonly known as 'truncated division' and is
    //             equivalent to (a % n) in JavaScript.
    // FLOOR     3 The remainder has the same sign as the divisor (Python %).
    // HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
    // EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
    //             The remainder is always positive.
    //
    // The truncated division, floored division, Euclidian division and IEEE 754 remainder
    // modes are commonly used for the modulus operation.
    // Although the other rounding modes can also be used, they may not give useful results.
    MODULO_MODE = 1,                         // 0 to 9

    // The maximum number of significant digits of the result of the exponentiatedBy operation.
    // If POW_PRECISION is 0, there will be unlimited significant digits.
    POW_PRECISION = 0,                    // 0 to MAX

    // The format specification used by the BigNumber.prototype.toFormat method.
    FORMAT = {
      prefix: '',
      groupSize: 3,
      secondaryGroupSize: 0,
      groupSeparator: ',',
      decimalSeparator: '.',
      fractionGroupSize: 0,
      fractionGroupSeparator: '\xA0',      // non-breaking space
      suffix: ''
    },

    // The alphabet used for base conversion. It must be at least 2 characters long, with no '+',
    // '-', '.', whitespace, or repeated character.
    // '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
    ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';


  //------------------------------------------------------------------------------------------


  // CONSTRUCTOR


  /*
   * The BigNumber constructor and exported function.
   * Create and return a new instance of a BigNumber object.
   *
   * v {number|string|BigNumber} A numeric value.
   * [b] {number} The base of v. Integer, 2 to ALPHABET.length inclusive.
   */
  function BigNumber(v, b) {
    var alphabet, c, caseChanged, e, i, isNum, len, str,
      x = this;

    // Enable constructor call without `new`.
    if (!(x instanceof BigNumber)) return new BigNumber(v, b);

    if (b == null) {

      if (v && v._isBigNumber === true) {
        x.s = v.s;

        if (!v.c || v.e > MAX_EXP) {
          x.c = x.e = null;
        } else if (v.e < MIN_EXP) {
          x.c = [x.e = 0];
        } else {
          x.e = v.e;
          x.c = v.c.slice();
        }

        return;
      }

      if ((isNum = typeof v == 'number') && v * 0 == 0) {

        // Use `1 / n` to handle minus zero also.
        x.s = 1 / v < 0 ? (v = -v, -1) : 1;

        // Fast path for integers, where n < 2147483648 (2**31).
        if (v === ~~v) {
          for (e = 0, i = v; i >= 10; i /= 10, e++);

          if (e > MAX_EXP) {
            x.c = x.e = null;
          } else {
            x.e = e;
            x.c = [v];
          }

          return;
        }

        str = String(v);
      } else {

        if (!isNumeric.test(str = String(v))) return parseNumeric(x, str, isNum);

        x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
      }

      // Decimal point?
      if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

      // Exponential form?
      if ((i = str.search(/e/i)) > 0) {

        // Determine exponent.
        if (e < 0) e = i;
        e += +str.slice(i + 1);
        str = str.substring(0, i);
      } else if (e < 0) {

        // Integer.
        e = str.length;
      }

    } else {

      // '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
      intCheck(b, 2, ALPHABET.length, 'Base');

      // Allow exponential notation to be used with base 10 argument, while
      // also rounding to DECIMAL_PLACES as with other bases.
      if (b == 10) {
        x = new BigNumber(v);
        return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
      }

      str = String(v);

      if (isNum = typeof v == 'number') {

        // Avoid potential interpretation of Infinity and NaN as base 44+ values.
        if (v * 0 != 0) return parseNumeric(x, str, isNum, b);

        x.s = 1 / v < 0 ? (str = str.slice(1), -1) : 1;

        // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
        if (BigNumber.DEBUG && str.replace(/^0\.0*|\./, '').length > 15) {
          throw Error
           (tooManyDigits + v);
        }
      } else {
        x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
      }

      alphabet = ALPHABET.slice(0, b);
      e = i = 0;

      // Check that str is a valid base b number.
      // Don't use RegExp, so alphabet can contain special characters.
      for (len = str.length; i < len; i++) {
        if (alphabet.indexOf(c = str.charAt(i)) < 0) {
          if (c == '.') {

            // If '.' is not the first character and it has not be found before.
            if (i > e) {
              e = len;
              continue;
            }
          } else if (!caseChanged) {

            // Allow e.g. hexadecimal 'FF' as well as 'ff'.
            if (str == str.toUpperCase() && (str = str.toLowerCase()) ||
                str == str.toLowerCase() && (str = str.toUpperCase())) {
              caseChanged = true;
              i = -1;
              e = 0;
              continue;
            }
          }

          return parseNumeric(x, String(v), isNum, b);
        }
      }

      // Prevent later check for length on converted number.
      isNum = false;
      str = convertBase(str, b, 10, x.s);

      // Decimal point?
      if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');
      else e = str.length;
    }

    // Determine leading zeros.
    for (i = 0; str.charCodeAt(i) === 48; i++);

    // Determine trailing zeros.
    for (len = str.length; str.charCodeAt(--len) === 48;);

    if (str = str.slice(i, ++len)) {
      len -= i;

      // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
      if (isNum && BigNumber.DEBUG &&
        len > 15 && (v > MAX_SAFE_INTEGER || v !== mathfloor(v))) {
          throw Error
           (tooManyDigits + (x.s * v));
      }

       // Overflow?
      if ((e = e - i - 1) > MAX_EXP) {

        // Infinity.
        x.c = x.e = null;

      // Underflow?
      } else if (e < MIN_EXP) {

        // Zero.
        x.c = [x.e = 0];
      } else {
        x.e = e;
        x.c = [];

        // Transform base

        // e is the base 10 exponent.
        // i is where to slice str to get the first element of the coefficient array.
        i = (e + 1) % LOG_BASE;
        if (e < 0) i += LOG_BASE;  // i < 1

        if (i < len) {
          if (i) x.c.push(+str.slice(0, i));

          for (len -= LOG_BASE; i < len;) {
            x.c.push(+str.slice(i, i += LOG_BASE));
          }

          i = LOG_BASE - (str = str.slice(i)).length;
        } else {
          i -= len;
        }

        for (; i--; str += '0');
        x.c.push(+str);
      }
    } else {

      // Zero.
      x.c = [x.e = 0];
    }
  }


  // CONSTRUCTOR PROPERTIES


  BigNumber.clone = clone;

  BigNumber.ROUND_UP = 0;
  BigNumber.ROUND_DOWN = 1;
  BigNumber.ROUND_CEIL = 2;
  BigNumber.ROUND_FLOOR = 3;
  BigNumber.ROUND_HALF_UP = 4;
  BigNumber.ROUND_HALF_DOWN = 5;
  BigNumber.ROUND_HALF_EVEN = 6;
  BigNumber.ROUND_HALF_CEIL = 7;
  BigNumber.ROUND_HALF_FLOOR = 8;
  BigNumber.EUCLID = 9;


  /*
   * Configure infrequently-changing library-wide settings.
   *
   * Accept an object with the following optional properties (if the value of a property is
   * a number, it must be an integer within the inclusive range stated):
   *
   *   DECIMAL_PLACES   {number}           0 to MAX
   *   ROUNDING_MODE    {number}           0 to 8
   *   EXPONENTIAL_AT   {number|number[]}  -MAX to MAX  or  [-MAX to 0, 0 to MAX]
   *   RANGE            {number|number[]}  -MAX to MAX (not zero)  or  [-MAX to -1, 1 to MAX]
   *   CRYPTO           {boolean}          true or false
   *   MODULO_MODE      {number}           0 to 9
   *   POW_PRECISION       {number}           0 to MAX
   *   ALPHABET         {string}           A string of two or more unique characters which does
   *                                     not contain '.'.
   *   FORMAT           {object}           An object with some of the following properties:
   *     prefix                 {string}
   *     groupSize              {number}
   *     secondaryGroupSize     {number}
   *     groupSeparator         {string}
   *     decimalSeparator       {string}
   *     fractionGroupSize      {number}
   *     fractionGroupSeparator {string}
   *     suffix                 {string}
   *
   * (The values assigned to the above FORMAT object properties are not checked for validity.)
   *
   * E.g.
   * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
   *
   * Ignore properties/parameters set to null or undefined, except for ALPHABET.
   *
   * Return an object with the properties current values.
   */
  BigNumber.config = BigNumber.set = function (obj) {
    var p, v;

    if (obj != null) {

      if (typeof obj == 'object') {

        // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
        // '[BigNumber Error] DECIMAL_PLACES {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'DECIMAL_PLACES')) {
          v = obj[p];
          intCheck(v, 0, MAX, p);
          DECIMAL_PLACES = v;
        }

        // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
        // '[BigNumber Error] ROUNDING_MODE {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'ROUNDING_MODE')) {
          v = obj[p];
          intCheck(v, 0, 8, p);
          ROUNDING_MODE = v;
        }

        // EXPONENTIAL_AT {number|number[]}
        // Integer, -MAX to MAX inclusive or
        // [integer -MAX to 0 inclusive, 0 to MAX inclusive].
        // '[BigNumber Error] EXPONENTIAL_AT {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'EXPONENTIAL_AT')) {
          v = obj[p];
          if (v && v.pop) {
            intCheck(v[0], -MAX, 0, p);
            intCheck(v[1], 0, MAX, p);
            TO_EXP_NEG = v[0];
            TO_EXP_POS = v[1];
          } else {
            intCheck(v, -MAX, MAX, p);
            TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
          }
        }

        // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
        // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
        // '[BigNumber Error] RANGE {not a primitive number|not an integer|out of range|cannot be zero}: {v}'
        if (obj.hasOwnProperty(p = 'RANGE')) {
          v = obj[p];
          if (v && v.pop) {
            intCheck(v[0], -MAX, -1, p);
            intCheck(v[1], 1, MAX, p);
            MIN_EXP = v[0];
            MAX_EXP = v[1];
          } else {
            intCheck(v, -MAX, MAX, p);
            if (v) {
              MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
            } else {
              throw Error
               (bignumberError + p + ' cannot be zero: ' + v);
            }
          }
        }

        // CRYPTO {boolean} true or false.
        // '[BigNumber Error] CRYPTO not true or false: {v}'
        // '[BigNumber Error] crypto unavailable'
        if (obj.hasOwnProperty(p = 'CRYPTO')) {
          v = obj[p];
          if (v === !!v) {
            if (v) {
              if (typeof crypto != 'undefined' && crypto &&
               (crypto.getRandomValues || crypto.randomBytes)) {
                CRYPTO = v;
              } else {
                CRYPTO = !v;
                throw Error
                 (bignumberError + 'crypto unavailable');
              }
            } else {
              CRYPTO = v;
            }
          } else {
            throw Error
             (bignumberError + p + ' not true or false: ' + v);
          }
        }

        // MODULO_MODE {number} Integer, 0 to 9 inclusive.
        // '[BigNumber Error] MODULO_MODE {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'MODULO_MODE')) {
          v = obj[p];
          intCheck(v, 0, 9, p);
          MODULO_MODE = v;
        }

        // POW_PRECISION {number} Integer, 0 to MAX inclusive.
        // '[BigNumber Error] POW_PRECISION {not a primitive number|not an integer|out of range}: {v}'
        if (obj.hasOwnProperty(p = 'POW_PRECISION')) {
          v = obj[p];
          intCheck(v, 0, MAX, p);
          POW_PRECISION = v;
        }

        // FORMAT {object}
        // '[BigNumber Error] FORMAT not an object: {v}'
        if (obj.hasOwnProperty(p = 'FORMAT')) {
          v = obj[p];
          if (typeof v == 'object') FORMAT = v;
          else throw Error
           (bignumberError + p + ' not an object: ' + v);
        }

        // ALPHABET {string}
        // '[BigNumber Error] ALPHABET invalid: {v}'
        if (obj.hasOwnProperty(p = 'ALPHABET')) {
          v = obj[p];

          // Disallow if only one character,
          // or if it contains '+', '-', '.', whitespace, or a repeated character.
          if (typeof v == 'string' && !/^.$|[+-.\s]|(.).*\1/.test(v)) {
            ALPHABET = v;
          } else {
            throw Error
             (bignumberError + p + ' invalid: ' + v);
          }
        }

      } else {

        // '[BigNumber Error] Object expected: {v}'
        throw Error
         (bignumberError + 'Object expected: ' + obj);
      }
    }

    return {
      DECIMAL_PLACES: DECIMAL_PLACES,
      ROUNDING_MODE: ROUNDING_MODE,
      EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
      RANGE: [MIN_EXP, MAX_EXP],
      CRYPTO: CRYPTO,
      MODULO_MODE: MODULO_MODE,
      POW_PRECISION: POW_PRECISION,
      FORMAT: FORMAT,
      ALPHABET: ALPHABET
    };
  };


  /*
   * Return true if v is a BigNumber instance, otherwise return false.
   *
   * If BigNumber.DEBUG is true, throw if a BigNumber instance is not well-formed.
   *
   * v {any}
   *
   * '[BigNumber Error] Invalid BigNumber: {v}'
   */
  BigNumber.isBigNumber = function (v) {
    if (!v || v._isBigNumber !== true) return false;
    if (!BigNumber.DEBUG) return true;

    var i, n,
      c = v.c,
      e = v.e,
      s = v.s;

    out: if ({}.toString.call(c) == '[object Array]') {

      if ((s === 1 || s === -1) && e >= -MAX && e <= MAX && e === mathfloor(e)) {

        // If the first element is zero, the BigNumber value must be zero.
        if (c[0] === 0) {
          if (e === 0 && c.length === 1) return true;
          break out;
        }

        // Calculate number of digits that c[0] should have, based on the exponent.
        i = (e + 1) % LOG_BASE;
        if (i < 1) i += LOG_BASE;

        // Calculate number of digits of c[0].
        //if (Math.ceil(Math.log(c[0] + 1) / Math.LN10) == i) {
        if (String(c[0]).length == i) {

          for (i = 0; i < c.length; i++) {
            n = c[i];
            if (n < 0 || n >= BASE || n !== mathfloor(n)) break out;
          }

          // Last element cannot be zero, unless it is the only element.
          if (n !== 0) return true;
        }
      }

    // Infinity/NaN
    } else if (c === null && e === null && (s === null || s === 1 || s === -1)) {
      return true;
    }

    throw Error
      (bignumberError + 'Invalid BigNumber: ' + v);
  };


  /*
   * Return a new BigNumber whose value is the maximum of the arguments.
   *
   * arguments {number|string|BigNumber}
   */
  BigNumber.maximum = BigNumber.max = function () {
    return maxOrMin(arguments, P.lt);
  };


  /*
   * Return a new BigNumber whose value is the minimum of the arguments.
   *
   * arguments {number|string|BigNumber}
   */
  BigNumber.minimum = BigNumber.min = function () {
    return maxOrMin(arguments, P.gt);
  };


  /*
   * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
   * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
   * zeros are produced).
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp}'
   * '[BigNumber Error] crypto unavailable'
   */
  BigNumber.random = (function () {
    var pow2_53 = 0x20000000000000;

    // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
    // Check if Math.random() produces more than 32 bits of randomness.
    // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
    // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
    var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
     ? function () { return mathfloor(Math.random() * pow2_53); }
     : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
       (Math.random() * 0x800000 | 0); };

    return function (dp) {
      var a, b, e, k, v,
        i = 0,
        c = [],
        rand = new BigNumber(ONE);

      if (dp == null) dp = DECIMAL_PLACES;
      else intCheck(dp, 0, MAX);

      k = mathceil(dp / LOG_BASE);

      if (CRYPTO) {

        // Browsers supporting crypto.getRandomValues.
        if (crypto.getRandomValues) {

          a = crypto.getRandomValues(new Uint32Array(k *= 2));

          for (; i < k;) {

            // 53 bits:
            // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
            // 11111 11111111 11111111 11111111 11100000 00000000 00000000
            // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
            //                                     11111 11111111 11111111
            // 0x20000 is 2^21.
            v = a[i] * 0x20000 + (a[i + 1] >>> 11);

            // Rejection sampling:
            // 0 <= v < 9007199254740992
            // Probability that v >= 9e15, is
            // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
            if (v >= 9e15) {
              b = crypto.getRandomValues(new Uint32Array(2));
              a[i] = b[0];
              a[i + 1] = b[1];
            } else {

              // 0 <= v <= 8999999999999999
              // 0 <= (v % 1e14) <= 99999999999999
              c.push(v % 1e14);
              i += 2;
            }
          }
          i = k / 2;

        // Node.js supporting crypto.randomBytes.
        } else if (crypto.randomBytes) {

          // buffer
          a = crypto.randomBytes(k *= 7);

          for (; i < k;) {

            // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
            // 0x100000000 is 2^32, 0x1000000 is 2^24
            // 11111 11111111 11111111 11111111 11111111 11111111 11111111
            // 0 <= v < 9007199254740992
            v = ((a[i] & 31) * 0x1000000000000) + (a[i + 1] * 0x10000000000) +
               (a[i + 2] * 0x100000000) + (a[i + 3] * 0x1000000) +
               (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];

            if (v >= 9e15) {
              crypto.randomBytes(7).copy(a, i);
            } else {

              // 0 <= (v % 1e14) <= 99999999999999
              c.push(v % 1e14);
              i += 7;
            }
          }
          i = k / 7;
        } else {
          CRYPTO = false;
          throw Error
           (bignumberError + 'crypto unavailable');
        }
      }

      // Use Math.random.
      if (!CRYPTO) {

        for (; i < k;) {
          v = random53bitInt();
          if (v < 9e15) c[i++] = v % 1e14;
        }
      }

      k = c[--i];
      dp %= LOG_BASE;

      // Convert trailing digits to zeros according to dp.
      if (k && dp) {
        v = POWS_TEN[LOG_BASE - dp];
        c[i] = mathfloor(k / v) * v;
      }

      // Remove trailing elements which are zero.
      for (; c[i] === 0; c.pop(), i--);

      // Zero?
      if (i < 0) {
        c = [e = 0];
      } else {

        // Remove leading elements which are zero and adjust exponent accordingly.
        for (e = -1 ; c[0] === 0; c.splice(0, 1), e -= LOG_BASE);

        // Count the digits of the first element of c to determine leading zeros, and...
        for (i = 1, v = c[0]; v >= 10; v /= 10, i++);

        // adjust the exponent accordingly.
        if (i < LOG_BASE) e -= LOG_BASE - i;
      }

      rand.e = e;
      rand.c = c;
      return rand;
    };
  })();


   /*
   * Return a BigNumber whose value is the sum of the arguments.
   *
   * arguments {number|string|BigNumber}
   */
  BigNumber.sum = function () {
    var i = 1,
      args = arguments,
      sum = new BigNumber(args[0]);
    for (; i < args.length;) sum = sum.plus(args[i++]);
    return sum;
  };


  // PRIVATE FUNCTIONS


  // Called by BigNumber and BigNumber.prototype.toString.
  convertBase = (function () {
    var decimal = '0123456789';

    /*
     * Convert string of baseIn to an array of numbers of baseOut.
     * Eg. toBaseOut('255', 10, 16) returns [15, 15].
     * Eg. toBaseOut('ff', 16, 10) returns [2, 5, 5].
     */
    function toBaseOut(str, baseIn, baseOut, alphabet) {
      var j,
        arr = [0],
        arrL,
        i = 0,
        len = str.length;

      for (; i < len;) {
        for (arrL = arr.length; arrL--; arr[arrL] *= baseIn);

        arr[0] += alphabet.indexOf(str.charAt(i++));

        for (j = 0; j < arr.length; j++) {

          if (arr[j] > baseOut - 1) {
            if (arr[j + 1] == null) arr[j + 1] = 0;
            arr[j + 1] += arr[j] / baseOut | 0;
            arr[j] %= baseOut;
          }
        }
      }

      return arr.reverse();
    }

    // Convert a numeric string of baseIn to a numeric string of baseOut.
    // If the caller is toString, we are converting from base 10 to baseOut.
    // If the caller is BigNumber, we are converting from baseIn to base 10.
    return function (str, baseIn, baseOut, sign, callerIsToString) {
      var alphabet, d, e, k, r, x, xc, y,
        i = str.indexOf('.'),
        dp = DECIMAL_PLACES,
        rm = ROUNDING_MODE;

      // Non-integer.
      if (i >= 0) {
        k = POW_PRECISION;

        // Unlimited precision.
        POW_PRECISION = 0;
        str = str.replace('.', '');
        y = new BigNumber(baseIn);
        x = y.pow(str.length - i);
        POW_PRECISION = k;

        // Convert str as if an integer, then restore the fraction part by dividing the
        // result by its base raised to a power.

        y.c = toBaseOut(toFixedPoint(coeffToString(x.c), x.e, '0'),
         10, baseOut, decimal);
        y.e = y.c.length;
      }

      // Convert the number as integer.

      xc = toBaseOut(str, baseIn, baseOut, callerIsToString
       ? (alphabet = ALPHABET, decimal)
       : (alphabet = decimal, ALPHABET));

      // xc now represents str as an integer and converted to baseOut. e is the exponent.
      e = k = xc.length;

      // Remove trailing zeros.
      for (; xc[--k] == 0; xc.pop());

      // Zero?
      if (!xc[0]) return alphabet.charAt(0);

      // Does str represent an integer? If so, no need for the division.
      if (i < 0) {
        --e;
      } else {
        x.c = xc;
        x.e = e;

        // The sign is needed for correct rounding.
        x.s = sign;
        x = div(x, y, dp, rm, baseOut);
        xc = x.c;
        r = x.r;
        e = x.e;
      }

      // xc now represents str converted to baseOut.

      // THe index of the rounding digit.
      d = e + dp + 1;

      // The rounding digit: the digit to the right of the digit that may be rounded up.
      i = xc[d];

      // Look at the rounding digits and mode to determine whether to round up.

      k = baseOut / 2;
      r = r || d < 0 || xc[d + 1] != null;

      r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
            : i > k || i == k &&(rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
             rm == (x.s < 0 ? 8 : 7));

      // If the index of the rounding digit is not greater than zero, or xc represents
      // zero, then the result of the base conversion is zero or, if rounding up, a value
      // such as 0.00001.
      if (d < 1 || !xc[0]) {

        // 1^-dp or 0
        str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0)) : alphabet.charAt(0);
      } else {

        // Truncate xc to the required number of decimal places.
        xc.length = d;

        // Round up?
        if (r) {

          // Rounding up may mean the previous digit has to be rounded up and so on.
          for (--baseOut; ++xc[--d] > baseOut;) {
            xc[d] = 0;

            if (!d) {
              ++e;
              xc = [1].concat(xc);
            }
          }
        }

        // Determine trailing zeros.
        for (k = xc.length; !xc[--k];);

        // E.g. [4, 11, 15] becomes 4bf.
        for (i = 0, str = ''; i <= k; str += alphabet.charAt(xc[i++]));

        // Add leading zeros, decimal point and trailing zeros as required.
        str = toFixedPoint(str, e, alphabet.charAt(0));
      }

      // The caller will add the sign.
      return str;
    };
  })();


  // Perform division in the specified base. Called by div and convertBase.
  div = (function () {

    // Assume non-zero x and k.
    function multiply(x, k, base) {
      var m, temp, xlo, xhi,
        carry = 0,
        i = x.length,
        klo = k % SQRT_BASE,
        khi = k / SQRT_BASE | 0;

      for (x = x.slice(); i--;) {
        xlo = x[i] % SQRT_BASE;
        xhi = x[i] / SQRT_BASE | 0;
        m = khi * xlo + xhi * klo;
        temp = klo * xlo + ((m % SQRT_BASE) * SQRT_BASE) + carry;
        carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
        x[i] = temp % base;
      }

      if (carry) x = [carry].concat(x);

      return x;
    }

    function compare(a, b, aL, bL) {
      var i, cmp;

      if (aL != bL) {
        cmp = aL > bL ? 1 : -1;
      } else {

        for (i = cmp = 0; i < aL; i++) {

          if (a[i] != b[i]) {
            cmp = a[i] > b[i] ? 1 : -1;
            break;
          }
        }
      }

      return cmp;
    }

    function subtract(a, b, aL, base) {
      var i = 0;

      // Subtract b from a.
      for (; aL--;) {
        a[aL] -= i;
        i = a[aL] < b[aL] ? 1 : 0;
        a[aL] = i * base + a[aL] - b[aL];
      }

      // Remove leading zeros.
      for (; !a[0] && a.length > 1; a.splice(0, 1));
    }

    // x: dividend, y: divisor.
    return function (x, y, dp, rm, base) {
      var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
        yL, yz,
        s = x.s == y.s ? 1 : -1,
        xc = x.c,
        yc = y.c;

      // Either NaN, Infinity or 0?
      if (!xc || !xc[0] || !yc || !yc[0]) {

        return new BigNumber(

         // Return NaN if either NaN, or both Infinity or 0.
         !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN :

          // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
          xc && xc[0] == 0 || !yc ? s * 0 : s / 0
       );
      }

      q = new BigNumber(s);
      qc = q.c = [];
      e = x.e - y.e;
      s = dp + e + 1;

      if (!base) {
        base = BASE;
        e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
        s = s / LOG_BASE | 0;
      }

      // Result exponent may be one less then the current value of e.
      // The coefficients of the BigNumbers from convertBase may have trailing zeros.
      for (i = 0; yc[i] == (xc[i] || 0); i++);

      if (yc[i] > (xc[i] || 0)) e--;

      if (s < 0) {
        qc.push(1);
        more = true;
      } else {
        xL = xc.length;
        yL = yc.length;
        i = 0;
        s += 2;

        // Normalise xc and yc so highest order digit of yc is >= base / 2.

        n = mathfloor(base / (yc[0] + 1));

        // Not necessary, but to handle odd bases where yc[0] == (base / 2) - 1.
        // if (n > 1 || n++ == 1 && yc[0] < base / 2) {
        if (n > 1) {
          yc = multiply(yc, n, base);
          xc = multiply(xc, n, base);
          yL = yc.length;
          xL = xc.length;
        }

        xi = yL;
        rem = xc.slice(0, yL);
        remL = rem.length;

        // Add zeros to make remainder as long as divisor.
        for (; remL < yL; rem[remL++] = 0);
        yz = yc.slice();
        yz = [0].concat(yz);
        yc0 = yc[0];
        if (yc[1] >= base / 2) yc0++;
        // Not necessary, but to prevent trial digit n > base, when using base 3.
        // else if (base == 3 && yc0 == 1) yc0 = 1 + 1e-15;

        do {
          n = 0;

          // Compare divisor and remainder.
          cmp = compare(yc, rem, yL, remL);

          // If divisor < remainder.
          if (cmp < 0) {

            // Calculate trial digit, n.

            rem0 = rem[0];
            if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

            // n is how many times the divisor goes into the current remainder.
            n = mathfloor(rem0 / yc0);

            //  Algorithm:
            //  product = divisor multiplied by trial digit (n).
            //  Compare product and remainder.
            //  If product is greater than remainder:
            //    Subtract divisor from product, decrement trial digit.
            //  Subtract product from remainder.
            //  If product was less than remainder at the last compare:
            //    Compare new remainder and divisor.
            //    If remainder is greater than divisor:
            //      Subtract divisor from remainder, increment trial digit.

            if (n > 1) {

              // n may be > base only when base is 3.
              if (n >= base) n = base - 1;

              // product = divisor * trial digit.
              prod = multiply(yc, n, base);
              prodL = prod.length;
              remL = rem.length;

              // Compare product and remainder.
              // If product > remainder then trial digit n too high.
              // n is 1 too high about 5% of the time, and is not known to have
              // ever been more than 1 too high.
              while (compare(prod, rem, prodL, remL) == 1) {
                n--;

                // Subtract divisor from product.
                subtract(prod, yL < prodL ? yz : yc, prodL, base);
                prodL = prod.length;
                cmp = 1;
              }
            } else {

              // n is 0 or 1, cmp is -1.
              // If n is 0, there is no need to compare yc and rem again below,
              // so change cmp to 1 to avoid it.
              // If n is 1, leave cmp as -1, so yc and rem are compared again.
              if (n == 0) {

                // divisor < remainder, so n must be at least 1.
                cmp = n = 1;
              }

              // product = divisor
              prod = yc.slice();
              prodL = prod.length;
            }

            if (prodL < remL) prod = [0].concat(prod);

            // Subtract product from remainder.
            subtract(rem, prod, remL, base);
            remL = rem.length;

             // If product was < remainder.
            if (cmp == -1) {

              // Compare divisor and new remainder.
              // If divisor < new remainder, subtract divisor from remainder.
              // Trial digit n too low.
              // n is 1 too low about 5% of the time, and very rarely 2 too low.
              while (compare(yc, rem, yL, remL) < 1) {
                n++;

                // Subtract divisor from remainder.
                subtract(rem, yL < remL ? yz : yc, remL, base);
                remL = rem.length;
              }
            }
          } else if (cmp === 0) {
            n++;
            rem = [0];
          } // else cmp === 1 and n will be 0

          // Add the next digit, n, to the result array.
          qc[i++] = n;

          // Update the remainder.
          if (rem[0]) {
            rem[remL++] = xc[xi] || 0;
          } else {
            rem = [xc[xi]];
            remL = 1;
          }
        } while ((xi++ < xL || rem[0] != null) && s--);

        more = rem[0] != null;

        // Leading zero?
        if (!qc[0]) qc.splice(0, 1);
      }

      if (base == BASE) {

        // To calculate q.e, first get the number of digits of qc[0].
        for (i = 1, s = qc[0]; s >= 10; s /= 10, i++);

        round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);

      // Caller is convertBase.
      } else {
        q.e = e;
        q.r = +more;
      }

      return q;
    };
  })();


  /*
   * Return a string representing the value of BigNumber n in fixed-point or exponential
   * notation rounded to the specified decimal places or significant digits.
   *
   * n: a BigNumber.
   * i: the index of the last digit required (i.e. the digit that may be rounded up).
   * rm: the rounding mode.
   * id: 1 (toExponential) or 2 (toPrecision).
   */
  function format(n, i, rm, id) {
    var c0, e, ne, len, str;

    if (rm == null) rm = ROUNDING_MODE;
    else intCheck(rm, 0, 8);

    if (!n.c) return n.toString();

    c0 = n.c[0];
    ne = n.e;

    if (i == null) {
      str = coeffToString(n.c);
      str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS)
       ? toExponential(str, ne)
       : toFixedPoint(str, ne, '0');
    } else {
      n = round(new BigNumber(n), i, rm);

      // n.e may have changed if the value was rounded up.
      e = n.e;

      str = coeffToString(n.c);
      len = str.length;

      // toPrecision returns exponential notation if the number of significant digits
      // specified is less than the number of digits necessary to represent the integer
      // part of the value in fixed-point notation.

      // Exponential notation.
      if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {

        // Append zeros?
        for (; len < i; str += '0', len++);
        str = toExponential(str, e);

      // Fixed-point notation.
      } else {
        i -= ne;
        str = toFixedPoint(str, e, '0');

        // Append zeros?
        if (e + 1 > len) {
          if (--i > 0) for (str += '.'; i--; str += '0');
        } else {
          i += e - len;
          if (i > 0) {
            if (e + 1 == len) str += '.';
            for (; i--; str += '0');
          }
        }
      }
    }

    return n.s < 0 && c0 ? '-' + str : str;
  }


  // Handle BigNumber.max and BigNumber.min.
  function maxOrMin(args, method) {
    var n,
      i = 1,
      m = new BigNumber(args[0]);

    for (; i < args.length; i++) {
      n = new BigNumber(args[i]);

      // If any number is NaN, return NaN.
      if (!n.s) {
        m = n;
        break;
      } else if (method.call(m, n)) {
        m = n;
      }
    }

    return m;
  }


  /*
   * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
   * Called by minus, plus and times.
   */
  function normalise(n, c, e) {
    var i = 1,
      j = c.length;

     // Remove trailing zeros.
    for (; !c[--j]; c.pop());

    // Calculate the base 10 exponent. First get the number of digits of c[0].
    for (j = c[0]; j >= 10; j /= 10, i++);

    // Overflow?
    if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {

      // Infinity.
      n.c = n.e = null;

    // Underflow?
    } else if (e < MIN_EXP) {

      // Zero.
      n.c = [n.e = 0];
    } else {
      n.e = e;
      n.c = c;
    }

    return n;
  }


  // Handle values that fail the validity test in BigNumber.
  parseNumeric = (function () {
    var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
      dotAfter = /^([^.]+)\.$/,
      dotBefore = /^\.([^.]+)$/,
      isInfinityOrNaN = /^-?(Infinity|NaN)$/,
      whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

    return function (x, str, isNum, b) {
      var base,
        s = isNum ? str : str.replace(whitespaceOrPlus, '');

      // No exception on ±Infinity or NaN.
      if (isInfinityOrNaN.test(s)) {
        x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
      } else {
        if (!isNum) {

          // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
          s = s.replace(basePrefix, function (m, p1, p2) {
            base = (p2 = p2.toLowerCase()) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
            return !b || b == base ? p1 : m;
          });

          if (b) {
            base = b;

            // E.g. '1.' to '1', '.1' to '0.1'
            s = s.replace(dotAfter, '$1').replace(dotBefore, '0.$1');
          }

          if (str != s) return new BigNumber(s, base);
        }

        // '[BigNumber Error] Not a number: {n}'
        // '[BigNumber Error] Not a base {b} number: {n}'
        if (BigNumber.DEBUG) {
          throw Error
            (bignumberError + 'Not a' + (b ? ' base ' + b : '') + ' number: ' + str);
        }

        // NaN
        x.s = null;
      }

      x.c = x.e = null;
    }
  })();


  /*
   * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
   * If r is truthy, it is known that there are more digits after the rounding digit.
   */
  function round(x, sd, rm, r) {
    var d, i, j, k, n, ni, rd,
      xc = x.c,
      pows10 = POWS_TEN;

    // if x is not Infinity or NaN...
    if (xc) {

      // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
      // n is a base 1e14 number, the value of the element of array x.c containing rd.
      // ni is the index of n within x.c.
      // d is the number of digits of n.
      // i is the index of rd within n including leading zeros.
      // j is the actual index of rd within n (if < 0, rd is a leading zero).
      out: {

        // Get the number of digits of the first element of xc.
        for (d = 1, k = xc[0]; k >= 10; k /= 10, d++);
        i = sd - d;

        // If the rounding digit is in the first element of xc...
        if (i < 0) {
          i += LOG_BASE;
          j = sd;
          n = xc[ni = 0];

          // Get the rounding digit at index j of n.
          rd = n / pows10[d - j - 1] % 10 | 0;
        } else {
          ni = mathceil((i + 1) / LOG_BASE);

          if (ni >= xc.length) {

            if (r) {

              // Needed by sqrt.
              for (; xc.length <= ni; xc.push(0));
              n = rd = 0;
              d = 1;
              i %= LOG_BASE;
              j = i - LOG_BASE + 1;
            } else {
              break out;
            }
          } else {
            n = k = xc[ni];

            // Get the number of digits of n.
            for (d = 1; k >= 10; k /= 10, d++);

            // Get the index of rd within n.
            i %= LOG_BASE;

            // Get the index of rd within n, adjusted for leading zeros.
            // The number of leading zeros of n is given by LOG_BASE - d.
            j = i - LOG_BASE + d;

            // Get the rounding digit at index j of n.
            rd = j < 0 ? 0 : n / pows10[d - j - 1] % 10 | 0;
          }
        }

        r = r || sd < 0 ||

        // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
         xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);

        r = rm < 4
         ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
         : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 &&

          // Check whether the digit to the left of the rounding digit is odd.
          ((i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10) & 1 ||
           rm == (x.s < 0 ? 8 : 7));

        if (sd < 1 || !xc[0]) {
          xc.length = 0;

          if (r) {

            // Convert sd to decimal places.
            sd -= x.e + 1;

            // 1, 0.1, 0.01, 0.001, 0.0001 etc.
            xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
            x.e = -sd || 0;
          } else {

            // Zero.
            xc[0] = x.e = 0;
          }

          return x;
        }

        // Remove excess digits.
        if (i == 0) {
          xc.length = ni;
          k = 1;
          ni--;
        } else {
          xc.length = ni + 1;
          k = pows10[LOG_BASE - i];

          // E.g. 56700 becomes 56000 if 7 is the rounding digit.
          // j > 0 means i > number of leading zeros of n.
          xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
        }

        // Round up?
        if (r) {

          for (; ;) {

            // If the digit to be rounded up is in the first element of xc...
            if (ni == 0) {

              // i will be the length of xc[0] before k is added.
              for (i = 1, j = xc[0]; j >= 10; j /= 10, i++);
              j = xc[0] += k;
              for (k = 1; j >= 10; j /= 10, k++);

              // if i != k the length has increased.
              if (i != k) {
                x.e++;
                if (xc[0] == BASE) xc[0] = 1;
              }

              break;
            } else {
              xc[ni] += k;
              if (xc[ni] != BASE) break;
              xc[ni--] = 0;
              k = 1;
            }
          }
        }

        // Remove trailing zeros.
        for (i = xc.length; xc[--i] === 0; xc.pop());
      }

      // Overflow? Infinity.
      if (x.e > MAX_EXP) {
        x.c = x.e = null;

      // Underflow? Zero.
      } else if (x.e < MIN_EXP) {
        x.c = [x.e = 0];
      }
    }

    return x;
  }


  function valueOf(n) {
    var str,
      e = n.e;

    if (e === null) return n.toString();

    str = coeffToString(n.c);

    str = e <= TO_EXP_NEG || e >= TO_EXP_POS
      ? toExponential(str, e)
      : toFixedPoint(str, e, '0');

    return n.s < 0 ? '-' + str : str;
  }


  // PROTOTYPE/INSTANCE METHODS


  /*
   * Return a new BigNumber whose value is the absolute value of this BigNumber.
   */
  P.absoluteValue = P.abs = function () {
    var x = new BigNumber(this);
    if (x.s < 0) x.s = 1;
    return x;
  };


  /*
   * Return
   *   1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
   *   -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
   *   0 if they have the same value,
   *   or null if the value of either is NaN.
   */
  P.comparedTo = function (y, b) {
    return compare(this, new BigNumber(y, b));
  };


  /*
   * If dp is undefined or null or true or false, return the number of decimal places of the
   * value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
   *
   * Otherwise, if dp is a number, return a new BigNumber whose value is the value of this
   * BigNumber rounded to a maximum of dp decimal places using rounding mode rm, or
   * ROUNDING_MODE if rm is omitted.
   *
   * [dp] {number} Decimal places: integer, 0 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
   */
  P.decimalPlaces = P.dp = function (dp, rm) {
    var c, n, v,
      x = this;

    if (dp != null) {
      intCheck(dp, 0, MAX);
      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);

      return round(new BigNumber(x), dp + x.e + 1, rm);
    }

    if (!(c = x.c)) return null;
    n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;

    // Subtract the number of trailing zeros of the last number.
    if (v = c[v]) for (; v % 10 == 0; v /= 10, n--);
    if (n < 0) n = 0;

    return n;
  };


  /*
   *  n / 0 = I
   *  n / N = N
   *  n / I = 0
   *  0 / n = 0
   *  0 / 0 = N
   *  0 / N = N
   *  0 / I = 0
   *  N / n = N
   *  N / 0 = N
   *  N / N = N
   *  N / I = N
   *  I / n = I
   *  I / 0 = I
   *  I / N = N
   *  I / I = N
   *
   * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
   * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
   */
  P.dividedBy = P.div = function (y, b) {
    return div(this, new BigNumber(y, b), DECIMAL_PLACES, ROUNDING_MODE);
  };


  /*
   * Return a new BigNumber whose value is the integer part of dividing the value of this
   * BigNumber by the value of BigNumber(y, b).
   */
  P.dividedToIntegerBy = P.idiv = function (y, b) {
    return div(this, new BigNumber(y, b), 0, 1);
  };


  /*
   * Return a BigNumber whose value is the value of this BigNumber exponentiated by n.
   *
   * If m is present, return the result modulo m.
   * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
   * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using ROUNDING_MODE.
   *
   * The modular power operation works efficiently when x, n, and m are integers, otherwise it
   * is equivalent to calculating x.exponentiatedBy(n).modulo(m) with a POW_PRECISION of 0.
   *
   * n {number|string|BigNumber} The exponent. An integer.
   * [m] {number|string|BigNumber} The modulus.
   *
   * '[BigNumber Error] Exponent not an integer: {n}'
   */
  P.exponentiatedBy = P.pow = function (n, m) {
    var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y,
      x = this;

    n = new BigNumber(n);

    // Allow NaN and ±Infinity, but not other non-integers.
    if (n.c && !n.isInteger()) {
      throw Error
        (bignumberError + 'Exponent not an integer: ' + valueOf(n));
    }

    if (m != null) m = new BigNumber(m);

    // Exponent of MAX_SAFE_INTEGER is 15.
    nIsBig = n.e > 14;

    // If x is NaN, ±Infinity, ±0 or ±1, or n is ±Infinity, NaN or ±0.
    if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {

      // The sign of the result of pow when x is negative depends on the evenness of n.
      // If +n overflows to ±Infinity, the evenness of n would be not be known.
      y = new BigNumber(Math.pow(+valueOf(x), nIsBig ? 2 - isOdd(n) : +valueOf(n)));
      return m ? y.mod(m) : y;
    }

    nIsNeg = n.s < 0;

    if (m) {

      // x % m returns NaN if abs(m) is zero, or m is NaN.
      if (m.c ? !m.c[0] : !m.s) return new BigNumber(NaN);

      isModExp = !nIsNeg && x.isInteger() && m.isInteger();

      if (isModExp) x = x.mod(m);

    // Overflow to ±Infinity: >=2**1e10 or >=1.0000024**1e15.
    // Underflow to ±0: <=0.79**1e10 or <=0.9999975**1e15.
    } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0
      // [1, 240000000]
      ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7
      // [80000000000000]  [99999750000000]
      : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {

      // If x is negative and n is odd, k = -0, else k = 0.
      k = x.s < 0 && isOdd(n) ? -0 : 0;

      // If x >= 1, k = ±Infinity.
      if (x.e > -1) k = 1 / k;

      // If n is negative return ±0, else return ±Infinity.
      return new BigNumber(nIsNeg ? 1 / k : k);

    } else if (POW_PRECISION) {

      // Truncating each coefficient array to a length of k after each multiplication
      // equates to truncating significant digits to POW_PRECISION + [28, 41],
      // i.e. there will be a minimum of 28 guard digits retained.
      k = mathceil(POW_PRECISION / LOG_BASE + 2);
    }

    if (nIsBig) {
      half = new BigNumber(0.5);
      if (nIsNeg) n.s = 1;
      nIsOdd = isOdd(n);
    } else {
      i = Math.abs(+valueOf(n));
      nIsOdd = i % 2;
    }

    y = new BigNumber(ONE);

    // Performs 54 loop iterations for n of 9007199254740991.
    for (; ;) {

      if (nIsOdd) {
        y = y.times(x);
        if (!y.c) break;

        if (k) {
          if (y.c.length > k) y.c.length = k;
        } else if (isModExp) {
          y = y.mod(m);    //y = y.minus(div(y, m, 0, MODULO_MODE).times(m));
        }
      }

      if (i) {
        i = mathfloor(i / 2);
        if (i === 0) break;
        nIsOdd = i % 2;
      } else {
        n = n.times(half);
        round(n, n.e + 1, 1);

        if (n.e > 14) {
          nIsOdd = isOdd(n);
        } else {
          i = +valueOf(n);
          if (i === 0) break;
          nIsOdd = i % 2;
        }
      }

      x = x.times(x);

      if (k) {
        if (x.c && x.c.length > k) x.c.length = k;
      } else if (isModExp) {
        x = x.mod(m);    //x = x.minus(div(x, m, 0, MODULO_MODE).times(m));
      }
    }

    if (isModExp) return y;
    if (nIsNeg) y = ONE.div(y);

    return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
  };


  /*
   * Return a new BigNumber whose value is the value of this BigNumber rounded to an integer
   * using rounding mode rm, or ROUNDING_MODE if rm is omitted.
   *
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {rm}'
   */
  P.integerValue = function (rm) {
    var n = new BigNumber(this);
    if (rm == null) rm = ROUNDING_MODE;
    else intCheck(rm, 0, 8);
    return round(n, n.e + 1, rm);
  };


  /*
   * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
   * otherwise return false.
   */
  P.isEqualTo = P.eq = function (y, b) {
    return compare(this, new BigNumber(y, b)) === 0;
  };


  /*
   * Return true if the value of this BigNumber is a finite number, otherwise return false.
   */
  P.isFinite = function () {
    return !!this.c;
  };


  /*
   * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
   * otherwise return false.
   */
  P.isGreaterThan = P.gt = function (y, b) {
    return compare(this, new BigNumber(y, b)) > 0;
  };


  /*
   * Return true if the value of this BigNumber is greater than or equal to the value of
   * BigNumber(y, b), otherwise return false.
   */
  P.isGreaterThanOrEqualTo = P.gte = function (y, b) {
    return (b = compare(this, new BigNumber(y, b))) === 1 || b === 0;

  };


  /*
   * Return true if the value of this BigNumber is an integer, otherwise return false.
   */
  P.isInteger = function () {
    return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
  };


  /*
   * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
   * otherwise return false.
   */
  P.isLessThan = P.lt = function (y, b) {
    return compare(this, new BigNumber(y, b)) < 0;
  };


  /*
   * Return true if the value of this BigNumber is less than or equal to the value of
   * BigNumber(y, b), otherwise return false.
   */
  P.isLessThanOrEqualTo = P.lte = function (y, b) {
    return (b = compare(this, new BigNumber(y, b))) === -1 || b === 0;
  };


  /*
   * Return true if the value of this BigNumber is NaN, otherwise return false.
   */
  P.isNaN = function () {
    return !this.s;
  };


  /*
   * Return true if the value of this BigNumber is negative, otherwise return false.
   */
  P.isNegative = function () {
    return this.s < 0;
  };


  /*
   * Return true if the value of this BigNumber is positive, otherwise return false.
   */
  P.isPositive = function () {
    return this.s > 0;
  };


  /*
   * Return true if the value of this BigNumber is 0 or -0, otherwise return false.
   */
  P.isZero = function () {
    return !!this.c && this.c[0] == 0;
  };


  /*
   *  n - 0 = n
   *  n - N = N
   *  n - I = -I
   *  0 - n = -n
   *  0 - 0 = 0
   *  0 - N = N
   *  0 - I = -I
   *  N - n = N
   *  N - 0 = N
   *  N - N = N
   *  N - I = N
   *  I - n = I
   *  I - 0 = I
   *  I - N = N
   *  I - I = N
   *
   * Return a new BigNumber whose value is the value of this BigNumber minus the value of
   * BigNumber(y, b).
   */
  P.minus = function (y, b) {
    var i, j, t, xLTy,
      x = this,
      a = x.s;

    y = new BigNumber(y, b);
    b = y.s;

    // Either NaN?
    if (!a || !b) return new BigNumber(NaN);

    // Signs differ?
    if (a != b) {
      y.s = -b;
      return x.plus(y);
    }

    var xe = x.e / LOG_BASE,
      ye = y.e / LOG_BASE,
      xc = x.c,
      yc = y.c;

    if (!xe || !ye) {

      // Either Infinity?
      if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber(yc ? x : NaN);

      // Either zero?
      if (!xc[0] || !yc[0]) {

        // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
        return yc[0] ? (y.s = -b, y) : new BigNumber(xc[0] ? x :

         // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
         ROUNDING_MODE == 3 ? -0 : 0);
      }
    }

    xe = bitFloor(xe);
    ye = bitFloor(ye);
    xc = xc.slice();

    // Determine which is the bigger number.
    if (a = xe - ye) {

      if (xLTy = a < 0) {
        a = -a;
        t = xc;
      } else {
        ye = xe;
        t = yc;
      }

      t.reverse();

      // Prepend zeros to equalise exponents.
      for (b = a; b--; t.push(0));
      t.reverse();
    } else {

      // Exponents equal. Check digit by digit.
      j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;

      for (a = b = 0; b < j; b++) {

        if (xc[b] != yc[b]) {
          xLTy = xc[b] < yc[b];
          break;
        }
      }
    }

    // x < y? Point xc to the array of the bigger number.
    if (xLTy) t = xc, xc = yc, yc = t, y.s = -y.s;

    b = (j = yc.length) - (i = xc.length);

    // Append zeros to xc if shorter.
    // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
    if (b > 0) for (; b--; xc[i++] = 0);
    b = BASE - 1;

    // Subtract yc from xc.
    for (; j > a;) {

      if (xc[--j] < yc[j]) {
        for (i = j; i && !xc[--i]; xc[i] = b);
        --xc[i];
        xc[j] += BASE;
      }

      xc[j] -= yc[j];
    }

    // Remove leading zeros and adjust exponent accordingly.
    for (; xc[0] == 0; xc.splice(0, 1), --ye);

    // Zero?
    if (!xc[0]) {

      // Following IEEE 754 (2008) 6.3,
      // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
      y.s = ROUNDING_MODE == 3 ? -1 : 1;
      y.c = [y.e = 0];
      return y;
    }

    // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
    // for finite x and y.
    return normalise(y, xc, ye);
  };


  /*
   *   n % 0 =  N
   *   n % N =  N
   *   n % I =  n
   *   0 % n =  0
   *  -0 % n = -0
   *   0 % 0 =  N
   *   0 % N =  N
   *   0 % I =  0
   *   N % n =  N
   *   N % 0 =  N
   *   N % N =  N
   *   N % I =  N
   *   I % n =  N
   *   I % 0 =  N
   *   I % N =  N
   *   I % I =  N
   *
   * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
   * BigNumber(y, b). The result depends on the value of MODULO_MODE.
   */
  P.modulo = P.mod = function (y, b) {
    var q, s,
      x = this;

    y = new BigNumber(y, b);

    // Return NaN if x is Infinity or NaN, or y is NaN or zero.
    if (!x.c || !y.s || y.c && !y.c[0]) {
      return new BigNumber(NaN);

    // Return x if y is Infinity or x is zero.
    } else if (!y.c || x.c && !x.c[0]) {
      return new BigNumber(x);
    }

    if (MODULO_MODE == 9) {

      // Euclidian division: q = sign(y) * floor(x / abs(y))
      // r = x - qy    where  0 <= r < abs(y)
      s = y.s;
      y.s = 1;
      q = div(x, y, 0, 3);
      y.s = s;
      q.s *= s;
    } else {
      q = div(x, y, 0, MODULO_MODE);
    }

    y = x.minus(q.times(y));

    // To match JavaScript %, ensure sign of zero is sign of dividend.
    if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;

    return y;
  };


  /*
   *  n * 0 = 0
   *  n * N = N
   *  n * I = I
   *  0 * n = 0
   *  0 * 0 = 0
   *  0 * N = N
   *  0 * I = N
   *  N * n = N
   *  N * 0 = N
   *  N * N = N
   *  N * I = N
   *  I * n = I
   *  I * 0 = N
   *  I * N = N
   *  I * I = I
   *
   * Return a new BigNumber whose value is the value of this BigNumber multiplied by the value
   * of BigNumber(y, b).
   */
  P.multipliedBy = P.times = function (y, b) {
    var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
      base, sqrtBase,
      x = this,
      xc = x.c,
      yc = (y = new BigNumber(y, b)).c;

    // Either NaN, ±Infinity or ±0?
    if (!xc || !yc || !xc[0] || !yc[0]) {

      // Return NaN if either is NaN, or one is 0 and the other is Infinity.
      if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
        y.c = y.e = y.s = null;
      } else {
        y.s *= x.s;

        // Return ±Infinity if either is ±Infinity.
        if (!xc || !yc) {
          y.c = y.e = null;

        // Return ±0 if either is ±0.
        } else {
          y.c = [0];
          y.e = 0;
        }
      }

      return y;
    }

    e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
    y.s *= x.s;
    xcL = xc.length;
    ycL = yc.length;

    // Ensure xc points to longer array and xcL to its length.
    if (xcL < ycL) zc = xc, xc = yc, yc = zc, i = xcL, xcL = ycL, ycL = i;

    // Initialise the result array with zeros.
    for (i = xcL + ycL, zc = []; i--; zc.push(0));

    base = BASE;
    sqrtBase = SQRT_BASE;

    for (i = ycL; --i >= 0;) {
      c = 0;
      ylo = yc[i] % sqrtBase;
      yhi = yc[i] / sqrtBase | 0;

      for (k = xcL, j = i + k; j > i;) {
        xlo = xc[--k] % sqrtBase;
        xhi = xc[k] / sqrtBase | 0;
        m = yhi * xlo + xhi * ylo;
        xlo = ylo * xlo + ((m % sqrtBase) * sqrtBase) + zc[j] + c;
        c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
        zc[j--] = xlo % base;
      }

      zc[j] = c;
    }

    if (c) {
      ++e;
    } else {
      zc.splice(0, 1);
    }

    return normalise(y, zc, e);
  };


  /*
   * Return a new BigNumber whose value is the value of this BigNumber negated,
   * i.e. multiplied by -1.
   */
  P.negated = function () {
    var x = new BigNumber(this);
    x.s = -x.s || null;
    return x;
  };


  /*
   *  n + 0 = n
   *  n + N = N
   *  n + I = I
   *  0 + n = n
   *  0 + 0 = 0
   *  0 + N = N
   *  0 + I = I
   *  N + n = N
   *  N + 0 = N
   *  N + N = N
   *  N + I = N
   *  I + n = I
   *  I + 0 = I
   *  I + N = N
   *  I + I = I
   *
   * Return a new BigNumber whose value is the value of this BigNumber plus the value of
   * BigNumber(y, b).
   */
  P.plus = function (y, b) {
    var t,
      x = this,
      a = x.s;

    y = new BigNumber(y, b);
    b = y.s;

    // Either NaN?
    if (!a || !b) return new BigNumber(NaN);

    // Signs differ?
     if (a != b) {
      y.s = -b;
      return x.minus(y);
    }

    var xe = x.e / LOG_BASE,
      ye = y.e / LOG_BASE,
      xc = x.c,
      yc = y.c;

    if (!xe || !ye) {

      // Return ±Infinity if either ±Infinity.
      if (!xc || !yc) return new BigNumber(a / 0);

      // Either zero?
      // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
      if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber(xc[0] ? x : a * 0);
    }

    xe = bitFloor(xe);
    ye = bitFloor(ye);
    xc = xc.slice();

    // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
    if (a = xe - ye) {
      if (a > 0) {
        ye = xe;
        t = yc;
      } else {
        a = -a;
        t = xc;
      }

      t.reverse();
      for (; a--; t.push(0));
      t.reverse();
    }

    a = xc.length;
    b = yc.length;

    // Point xc to the longer array, and b to the shorter length.
    if (a - b < 0) t = yc, yc = xc, xc = t, b = a;

    // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
    for (a = 0; b;) {
      a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
      xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
    }

    if (a) {
      xc = [a].concat(xc);
      ++ye;
    }

    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
    // ye = MAX_EXP + 1 possible
    return normalise(y, xc, ye);
  };


  /*
   * If sd is undefined or null or true or false, return the number of significant digits of
   * the value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
   * If sd is true include integer-part trailing zeros in the count.
   *
   * Otherwise, if sd is a number, return a new BigNumber whose value is the value of this
   * BigNumber rounded to a maximum of sd significant digits using rounding mode rm, or
   * ROUNDING_MODE if rm is omitted.
   *
   * sd {number|boolean} number: significant digits: integer, 1 to MAX inclusive.
   *                     boolean: whether to count integer-part trailing zeros: true or false.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
   */
  P.precision = P.sd = function (sd, rm) {
    var c, n, v,
      x = this;

    if (sd != null && sd !== !!sd) {
      intCheck(sd, 1, MAX);
      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);

      return round(new BigNumber(x), sd, rm);
    }

    if (!(c = x.c)) return null;
    v = c.length - 1;
    n = v * LOG_BASE + 1;

    if (v = c[v]) {

      // Subtract the number of trailing zeros of the last element.
      for (; v % 10 == 0; v /= 10, n--);

      // Add the number of digits of the first element.
      for (v = c[0]; v >= 10; v /= 10, n++);
    }

    if (sd && x.e + 1 > n) n = x.e + 1;

    return n;
  };


  /*
   * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
   * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
   *
   * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {k}'
   */
  P.shiftedBy = function (k) {
    intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
    return this.times('1e' + k);
  };


  /*
   *  sqrt(-n) =  N
   *  sqrt(N) =  N
   *  sqrt(-I) =  N
   *  sqrt(I) =  I
   *  sqrt(0) =  0
   *  sqrt(-0) = -0
   *
   * Return a new BigNumber whose value is the square root of the value of this BigNumber,
   * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
   */
  P.squareRoot = P.sqrt = function () {
    var m, n, r, rep, t,
      x = this,
      c = x.c,
      s = x.s,
      e = x.e,
      dp = DECIMAL_PLACES + 4,
      half = new BigNumber('0.5');

    // Negative/NaN/Infinity/zero?
    if (s !== 1 || !c || !c[0]) {
      return new BigNumber(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
    }

    // Initial estimate.
    s = Math.sqrt(+valueOf(x));

    // Math.sqrt underflow/overflow?
    // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
    if (s == 0 || s == 1 / 0) {
      n = coeffToString(c);
      if ((n.length + e) % 2 == 0) n += '0';
      s = Math.sqrt(+n);
      e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);

      if (s == 1 / 0) {
        n = '1e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new BigNumber(n);
    } else {
      r = new BigNumber(s + '');
    }

    // Check for zero.
    // r could be zero if MIN_EXP is changed after the this value was created.
    // This would cause a division by zero (x/t) and hence Infinity below, which would cause
    // coeffToString to throw.
    if (r.c[0]) {
      e = r.e;
      s = e + dp;
      if (s < 3) s = 0;

      // Newton-Raphson iteration.
      for (; ;) {
        t = r;
        r = half.times(t.plus(div(x, t, dp, 1)));

        if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {

          // The exponent of r may here be one less than the final result exponent,
          // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
          // are indexed correctly.
          if (r.e < e) --s;
          n = n.slice(s - 3, s + 1);

          // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
          // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
          // iteration.
          if (n == '9999' || !rep && n == '4999') {

            // On the first iteration only, check to see if rounding up gives the
            // exact result as the nines may infinitely repeat.
            if (!rep) {
              round(t, t.e + DECIMAL_PLACES + 2, 0);

              if (t.times(t).eq(x)) {
                r = t;
                break;
              }
            }

            dp += 4;
            s += 4;
            rep = 1;
          } else {

            // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
            // result. If not, then there are further digits and m will be truthy.
            if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

              // Truncate to the first rounding digit.
              round(r, r.e + DECIMAL_PLACES + 2, 1);
              m = !r.times(r).eq(x);
            }

            break;
          }
        }
      }
    }

    return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
  };


  /*
   * Return a string representing the value of this BigNumber in exponential notation and
   * rounded using ROUNDING_MODE to dp fixed decimal places.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
   */
  P.toExponential = function (dp, rm) {
    if (dp != null) {
      intCheck(dp, 0, MAX);
      dp++;
    }
    return format(this, dp, rm, 1);
  };


  /*
   * Return a string representing the value of this BigNumber in fixed-point notation rounding
   * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
   *
   * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
   * but e.g. (-0.00001).toFixed(0) is '-0'.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
   */
  P.toFixed = function (dp, rm) {
    if (dp != null) {
      intCheck(dp, 0, MAX);
      dp = dp + this.e + 1;
    }
    return format(this, dp, rm);
  };


  /*
   * Return a string representing the value of this BigNumber in fixed-point notation rounded
   * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
   * of the format or FORMAT object (see BigNumber.set).
   *
   * The formatting object may contain some or all of the properties shown below.
   *
   * FORMAT = {
   *   prefix: '',
   *   groupSize: 3,
   *   secondaryGroupSize: 0,
   *   groupSeparator: ',',
   *   decimalSeparator: '.',
   *   fractionGroupSize: 0,
   *   fractionGroupSeparator: '\xA0',      // non-breaking space
   *   suffix: ''
   * };
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   * [format] {object} Formatting options. See FORMAT pbject above.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
   * '[BigNumber Error] Argument not an object: {format}'
   */
  P.toFormat = function (dp, rm, format) {
    var str,
      x = this;

    if (format == null) {
      if (dp != null && rm && typeof rm == 'object') {
        format = rm;
        rm = null;
      } else if (dp && typeof dp == 'object') {
        format = dp;
        dp = rm = null;
      } else {
        format = FORMAT;
      }
    } else if (typeof format != 'object') {
      throw Error
        (bignumberError + 'Argument not an object: ' + format);
    }

    str = x.toFixed(dp, rm);

    if (x.c) {
      var i,
        arr = str.split('.'),
        g1 = +format.groupSize,
        g2 = +format.secondaryGroupSize,
        groupSeparator = format.groupSeparator || '',
        intPart = arr[0],
        fractionPart = arr[1],
        isNeg = x.s < 0,
        intDigits = isNeg ? intPart.slice(1) : intPart,
        len = intDigits.length;

      if (g2) i = g1, g1 = g2, g2 = i, len -= i;

      if (g1 > 0 && len > 0) {
        i = len % g1 || g1;
        intPart = intDigits.substr(0, i);
        for (; i < len; i += g1) intPart += groupSeparator + intDigits.substr(i, g1);
        if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
        if (isNeg) intPart = '-' + intPart;
      }

      str = fractionPart
       ? intPart + (format.decimalSeparator || '') + ((g2 = +format.fractionGroupSize)
        ? fractionPart.replace(new RegExp('\\d{' + g2 + '}\\B', 'g'),
         '$&' + (format.fractionGroupSeparator || ''))
        : fractionPart)
       : intPart;
    }

    return (format.prefix || '') + str + (format.suffix || '');
  };


  /*
   * Return an array of two BigNumbers representing the value of this BigNumber as a simple
   * fraction with an integer numerator and an integer denominator.
   * The denominator will be a positive non-zero value less than or equal to the specified
   * maximum denominator. If a maximum denominator is not specified, the denominator will be
   * the lowest value necessary to represent the number exactly.
   *
   * [md] {number|string|BigNumber} Integer >= 1, or Infinity. The maximum denominator.
   *
   * '[BigNumber Error] Argument {not an integer|out of range} : {md}'
   */
  P.toFraction = function (md) {
    var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s,
      x = this,
      xc = x.c;

    if (md != null) {
      n = new BigNumber(md);

      // Throw if md is less than one or is not an integer, unless it is Infinity.
      if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
        throw Error
          (bignumberError + 'Argument ' +
            (n.isInteger() ? 'out of range: ' : 'not an integer: ') + valueOf(n));
      }
    }

    if (!xc) return new BigNumber(x);

    d = new BigNumber(ONE);
    n1 = d0 = new BigNumber(ONE);
    d1 = n0 = new BigNumber(ONE);
    s = coeffToString(xc);

    // Determine initial denominator.
    // d is a power of 10 and the minimum max denominator that specifies the value exactly.
    e = d.e = s.length - x.e - 1;
    d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
    md = !md || n.comparedTo(d) > 0 ? (e > 0 ? d : n1) : n;

    exp = MAX_EXP;
    MAX_EXP = 1 / 0;
    n = new BigNumber(s);

    // n0 = d1 = 0
    n0.c[0] = 0;

    for (; ;)  {
      q = div(n, d, 0, 1);
      d2 = d0.plus(q.times(d1));
      if (d2.comparedTo(md) == 1) break;
      d0 = d1;
      d1 = d2;
      n1 = n0.plus(q.times(d2 = n1));
      n0 = d2;
      d = n.minus(q.times(d2 = d));
      n = d2;
    }

    d2 = div(md.minus(d0), d1, 0, 1);
    n0 = n0.plus(d2.times(n1));
    d0 = d0.plus(d2.times(d1));
    n0.s = n1.s = x.s;
    e = e * 2;

    // Determine which fraction is closer to x, n0/d0 or n1/d1
    r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
        div(n0, d0, e, ROUNDING_MODE).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];

    MAX_EXP = exp;

    return r;
  };


  /*
   * Return the value of this BigNumber converted to a number primitive.
   */
  P.toNumber = function () {
    return +valueOf(this);
  };


  /*
   * Return a string representing the value of this BigNumber rounded to sd significant digits
   * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
   * necessary to represent the integer part of the value in fixed-point notation, then use
   * exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
   */
  P.toPrecision = function (sd, rm) {
    if (sd != null) intCheck(sd, 1, MAX);
    return format(this, sd, rm, 2);
  };


  /*
   * Return a string representing the value of this BigNumber in base b, or base 10 if b is
   * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
   * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
   * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
   * TO_EXP_NEG, return exponential notation.
   *
   * [b] {number} Integer, 2 to ALPHABET.length inclusive.
   *
   * '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
   */
  P.toString = function (b) {
    var str,
      n = this,
      s = n.s,
      e = n.e;

    // Infinity or NaN?
    if (e === null) {
      if (s) {
        str = 'Infinity';
        if (s < 0) str = '-' + str;
      } else {
        str = 'NaN';
      }
    } else {
      if (b == null) {
        str = e <= TO_EXP_NEG || e >= TO_EXP_POS
         ? toExponential(coeffToString(n.c), e)
         : toFixedPoint(coeffToString(n.c), e, '0');
      } else if (b === 10) {
        n = round(new BigNumber(n), DECIMAL_PLACES + e + 1, ROUNDING_MODE);
        str = toFixedPoint(coeffToString(n.c), n.e, '0');
      } else {
        intCheck(b, 2, ALPHABET.length, 'Base');
        str = convertBase(toFixedPoint(coeffToString(n.c), e, '0'), 10, b, s, true);
      }

      if (s < 0 && n.c[0]) str = '-' + str;
    }

    return str;
  };


  /*
   * Return as toString, but do not accept a base argument, and include the minus sign for
   * negative zero.
   */
  P.valueOf = P.toJSON = function () {
    return valueOf(this);
  };


  P._isBigNumber = true;

  P[Symbol.toStringTag] = 'BigNumber';

  // Node.js v10.12.0+
  P[Symbol.for('nodejs.util.inspect.custom')] = P.valueOf;

  if (configObject != null) BigNumber.set(configObject);

  return BigNumber;
}


// PRIVATE HELPER FUNCTIONS

// These functions don't need access to variables,
// e.g. DECIMAL_PLACES, in the scope of the `clone` function above.


function bitFloor(n) {
  var i = n | 0;
  return n > 0 || n === i ? i : i - 1;
}


// Return a coefficient array as a string of base 10 digits.
function coeffToString(a) {
  var s, z,
    i = 1,
    j = a.length,
    r = a[0] + '';

  for (; i < j;) {
    s = a[i++] + '';
    z = LOG_BASE - s.length;
    for (; z--; s = '0' + s);
    r += s;
  }

  // Determine trailing zeros.
  for (j = r.length; r.charCodeAt(--j) === 48;);

  return r.slice(0, j + 1 || 1);
}


// Compare the value of BigNumbers x and y.
function compare(x, y) {
  var a, b,
    xc = x.c,
    yc = y.c,
    i = x.s,
    j = y.s,
    k = x.e,
    l = y.e;

  // Either NaN?
  if (!i || !j) return null;

  a = xc && !xc[0];
  b = yc && !yc[0];

  // Either zero?
  if (a || b) return a ? b ? 0 : -j : i;

  // Signs differ?
  if (i != j) return i;

  a = i < 0;
  b = k == l;

  // Either Infinity?
  if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;

  // Compare exponents.
  if (!b) return k > l ^ a ? 1 : -1;

  j = (k = xc.length) < (l = yc.length) ? k : l;

  // Compare digit by digit.
  for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;

  // Compare lengths.
  return k == l ? 0 : k > l ^ a ? 1 : -1;
}


/*
 * Check that n is a primitive number, an integer, and in range, otherwise throw.
 */
function intCheck(n, min, max, name) {
  if (n < min || n > max || n !== mathfloor(n)) {
    throw Error
     (bignumberError + (name || 'Argument') + (typeof n == 'number'
       ? n < min || n > max ? ' out of range: ' : ' not an integer: '
       : ' not a primitive number: ') + String(n));
  }
}


// Assumes finite n.
function isOdd(n) {
  var k = n.c.length - 1;
  return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
}


function toExponential(str, e) {
  return (str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str) +
   (e < 0 ? 'e' : 'e+') + e;
}


function toFixedPoint(str, e, z) {
  var len, zs;

  // Negative exponent?
  if (e < 0) {

    // Prepend zeros.
    for (zs = z + '.'; ++e; zs += z);
    str = zs + str;

  // Positive exponent
  } else {
    len = str.length;

    // Append zeros.
    if (++e > len) {
      for (zs = z, e -= len; --e; zs += z);
      str += zs;
    } else if (e < len) {
      str = str.slice(0, e) + '.' + str.slice(e);
    }
  }

  return str;
}


// EXPORT


var BigNumber = clone();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BigNumber);


/***/ }),

/***/ 6497:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(4300).Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


/***/ }),

/***/ 4378:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

try {
  var util = __webpack_require__(3837);
  /* istanbul ignore next */
  if (typeof util.inherits !== 'function') throw '';
  module.exports = util.inherits;
} catch (e) {
  /* istanbul ignore next */
  module.exports = __webpack_require__(5717);
}


/***/ }),

/***/ 5717:
/***/ ((module) => {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}


/***/ }),

/***/ 5826:
/***/ ((module) => {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),

/***/ 4426:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var Classes = Object.create(null);

/**
 * Create a new Connection instance.
 * @param {object|string} config Configuration or connection string for new MySQL connection
 * @return {Connection} A new MySQL connection
 * @public
 */
exports.createConnection = function createConnection(config) {
  var Connection       = loadClass('Connection');
  var ConnectionConfig = loadClass('ConnectionConfig');

  return new Connection({config: new ConnectionConfig(config)});
};

/**
 * Create a new Pool instance.
 * @param {object|string} config Configuration or connection string for new MySQL connections
 * @return {Pool} A new MySQL pool
 * @public
 */
exports.createPool = function createPool(config) {
  var Pool       = loadClass('Pool');
  var PoolConfig = loadClass('PoolConfig');

  return new Pool({config: new PoolConfig(config)});
};

/**
 * Create a new PoolCluster instance.
 * @param {object} [config] Configuration for pool cluster
 * @return {PoolCluster} New MySQL pool cluster
 * @public
 */
exports.createPoolCluster = function createPoolCluster(config) {
  var PoolCluster = loadClass('PoolCluster');

  return new PoolCluster(config);
};

/**
 * Create a new Query instance.
 * @param {string} sql The SQL for the query
 * @param {array} [values] Any values to insert into placeholders in sql
 * @param {function} [callback] The callback to use when query is complete
 * @return {Query} New query object
 * @public
 */
exports.createQuery = function createQuery(sql, values, callback) {
  var Connection = loadClass('Connection');

  return Connection.createQuery(sql, values, callback);
};

/**
 * Escape a value for SQL.
 * @param {*} value The value to escape
 * @param {boolean} [stringifyObjects=false] Setting if objects should be stringified
 * @param {string} [timeZone=local] Setting for time zone to use for Date conversion
 * @return {string} Escaped string value
 * @public
 */
exports.escape = function escape(value, stringifyObjects, timeZone) {
  var SqlString = loadClass('SqlString');

  return SqlString.escape(value, stringifyObjects, timeZone);
};

/**
 * Escape an identifier for SQL.
 * @param {*} value The value to escape
 * @param {boolean} [forbidQualified=false] Setting to treat '.' as part of identifier
 * @return {string} Escaped string value
 * @public
 */
exports.escapeId = function escapeId(value, forbidQualified) {
  var SqlString = loadClass('SqlString');

  return SqlString.escapeId(value, forbidQualified);
};

/**
 * Format SQL and replacement values into a SQL string.
 * @param {string} sql The SQL for the query
 * @param {array} [values] Any values to insert into placeholders in sql
 * @param {boolean} [stringifyObjects=false] Setting if objects should be stringified
 * @param {string} [timeZone=local] Setting for time zone to use for Date conversion
 * @return {string} Formatted SQL string
 * @public
 */
exports.format = function format(sql, values, stringifyObjects, timeZone) {
  var SqlString = loadClass('SqlString');

  return SqlString.format(sql, values, stringifyObjects, timeZone);
};

/**
 * Wrap raw SQL strings from escape overriding.
 * @param {string} sql The raw SQL
 * @return {object} Wrapped object
 * @public
 */
exports.raw = function raw(sql) {
  var SqlString = loadClass('SqlString');

  return SqlString.raw(sql);
};

/**
 * The type constants.
 * @public
 */
Object.defineProperty(exports, "Types", ({
  get: loadClass.bind(null, 'Types')
}));

/**
 * Load the given class.
 * @param {string} className Name of class to default
 * @return {function|object} Class constructor or exports
 * @private
 */
function loadClass(className) {
  var Class = Classes[className];

  if (Class !== undefined) {
    return Class;
  }

  // This uses a switch for static require analysis
  switch (className) {
    case 'Connection':
      Class = __webpack_require__(4623);
      break;
    case 'ConnectionConfig':
      Class = __webpack_require__(6561);
      break;
    case 'Pool':
      Class = __webpack_require__(7819);
      break;
    case 'PoolCluster':
      Class = __webpack_require__(1903);
      break;
    case 'PoolConfig':
      Class = __webpack_require__(7427);
      break;
    case 'SqlString':
      Class = __webpack_require__(1976);
      break;
    case 'Types':
      Class = __webpack_require__(5586);
      break;
    default:
      throw new Error('Cannot find class \'' + className + '\'');
  }

  // Store to prevent invoking require()
  Classes[className] = Class;

  return Class;
}


/***/ }),

/***/ 4623:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Crypto           = __webpack_require__(6113);
var Events           = __webpack_require__(2361);
var Net              = __webpack_require__(1808);
var tls              = __webpack_require__(4404);
var ConnectionConfig = __webpack_require__(6561);
var Protocol         = __webpack_require__(8776);
var SqlString        = __webpack_require__(1976);
var Query            = __webpack_require__(8761);
var Util             = __webpack_require__(3837);

module.exports = Connection;
Util.inherits(Connection, Events.EventEmitter);
function Connection(options) {
  Events.EventEmitter.call(this);

  this.config = options.config;

  this._socket        = options.socket;
  this._protocol      = new Protocol({config: this.config, connection: this});
  this._connectCalled = false;
  this.state          = 'disconnected';
  this.threadId       = null;
}

Connection.createQuery = function createQuery(sql, values, callback) {
  if (sql instanceof Query) {
    return sql;
  }

  var cb      = callback;
  var options = {};

  if (typeof sql === 'function') {
    cb = sql;
  } else if (typeof sql === 'object') {
    options = Object.create(sql);

    if (typeof values === 'function') {
      cb = values;
    } else if (values !== undefined) {
      Object.defineProperty(options, 'values', { value: values });
    }
  } else {
    options.sql = sql;

    if (typeof values === 'function') {
      cb = values;
    } else if (values !== undefined) {
      options.values = values;
    }
  }

  if (cb !== undefined) {
    cb = wrapCallbackInDomain(null, cb);

    if (cb === undefined) {
      throw new TypeError('argument callback must be a function when provided');
    }
  }

  return new Query(options, cb);
};

Connection.prototype.connect = function connect(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (!this._connectCalled) {
    this._connectCalled = true;

    // Connect either via a UNIX domain socket or a TCP socket.
    this._socket = (this.config.socketPath)
      ? Net.createConnection(this.config.socketPath)
      : Net.createConnection(this.config.port, this.config.host);

    // Connect socket to connection domain
    if (Events.usingDomains) {
      this._socket.domain = this.domain;
    }

    var connection = this;
    this._protocol.on('data', function(data) {
      connection._socket.write(data);
    });
    this._socket.on('data', wrapToDomain(connection, function (data) {
      connection._protocol.write(data);
    }));
    this._protocol.on('end', function() {
      connection._socket.end();
    });
    this._socket.on('end', wrapToDomain(connection, function () {
      connection._protocol.end();
    }));

    this._socket.on('error', this._handleNetworkError.bind(this));
    this._socket.on('connect', this._handleProtocolConnect.bind(this));
    this._protocol.on('handshake', this._handleProtocolHandshake.bind(this));
    this._protocol.on('initialize', this._handleProtocolInitialize.bind(this));
    this._protocol.on('unhandledError', this._handleProtocolError.bind(this));
    this._protocol.on('drain', this._handleProtocolDrain.bind(this));
    this._protocol.on('end', this._handleProtocolEnd.bind(this));
    this._protocol.on('enqueue', this._handleProtocolEnqueue.bind(this));

    if (this.config.connectTimeout) {
      var handleConnectTimeout = this._handleConnectTimeout.bind(this);

      this._socket.setTimeout(this.config.connectTimeout, handleConnectTimeout);
      this._socket.once('connect', function() {
        this.setTimeout(0, handleConnectTimeout);
      });
    }
  }

  this._protocol.handshake(options, wrapCallbackInDomain(this, callback));
};

Connection.prototype.changeUser = function changeUser(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  this._implyConnect();

  var charsetNumber = (options.charset)
    ? ConnectionConfig.getCharsetNumber(options.charset)
    : this.config.charsetNumber;

  return this._protocol.changeUser({
    user          : options.user || this.config.user,
    password      : options.password || this.config.password,
    database      : options.database || this.config.database,
    timeout       : options.timeout,
    charsetNumber : charsetNumber,
    currentConfig : this.config
  }, wrapCallbackInDomain(this, callback));
};

Connection.prototype.beginTransaction = function beginTransaction(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = options || {};
  options.sql = 'START TRANSACTION';
  options.values = null;

  return this.query(options, callback);
};

Connection.prototype.commit = function commit(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = options || {};
  options.sql = 'COMMIT';
  options.values = null;

  return this.query(options, callback);
};

Connection.prototype.rollback = function rollback(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = options || {};
  options.sql = 'ROLLBACK';
  options.values = null;

  return this.query(options, callback);
};

Connection.prototype.query = function query(sql, values, cb) {
  var query = Connection.createQuery(sql, values, cb);
  query._connection = this;

  if (!(typeof sql === 'object' && 'typeCast' in sql)) {
    query.typeCast = this.config.typeCast;
  }

  if (query.sql) {
    query.sql = this.format(query.sql, query.values);
  }

  if (query._callback) {
    query._callback = wrapCallbackInDomain(this, query._callback);
  }

  this._implyConnect();

  return this._protocol._enqueue(query);
};

Connection.prototype.ping = function ping(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  this._implyConnect();
  this._protocol.ping(options, wrapCallbackInDomain(this, callback));
};

Connection.prototype.statistics = function statistics(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  this._implyConnect();
  this._protocol.stats(options, wrapCallbackInDomain(this, callback));
};

Connection.prototype.end = function end(options, callback) {
  var cb   = callback;
  var opts = options;

  if (!callback && typeof options === 'function') {
    cb   = options;
    opts = null;
  }

  // create custom options reference
  opts = Object.create(opts || null);

  if (opts.timeout === undefined) {
    // default timeout of 30 seconds
    opts.timeout = 30000;
  }

  this._implyConnect();
  this._protocol.quit(opts, wrapCallbackInDomain(this, cb));
};

Connection.prototype.destroy = function() {
  this.state = 'disconnected';
  this._implyConnect();
  this._socket.destroy();
  this._protocol.destroy();
};

Connection.prototype.pause = function() {
  this._socket.pause();
  this._protocol.pause();
};

Connection.prototype.resume = function() {
  this._socket.resume();
  this._protocol.resume();
};

Connection.prototype.escape = function(value) {
  return SqlString.escape(value, false, this.config.timezone);
};

Connection.prototype.escapeId = function escapeId(value) {
  return SqlString.escapeId(value, false);
};

Connection.prototype.format = function(sql, values) {
  if (typeof this.config.queryFormat === 'function') {
    return this.config.queryFormat.call(this, sql, values, this.config.timezone);
  }
  return SqlString.format(sql, values, this.config.stringifyObjects, this.config.timezone);
};

if (tls.TLSSocket) {
  // 0.11+ environment
  Connection.prototype._startTLS = function _startTLS(onSecure) {
    var connection = this;

    createSecureContext(this.config, function (err, secureContext) {
      if (err) {
        onSecure(err);
        return;
      }

      // "unpipe"
      connection._socket.removeAllListeners('data');
      connection._protocol.removeAllListeners('data');

      // socket <-> encrypted
      var rejectUnauthorized = connection.config.ssl.rejectUnauthorized;
      var secureEstablished  = false;
      var secureSocket       = new tls.TLSSocket(connection._socket, {
        rejectUnauthorized : rejectUnauthorized,
        requestCert        : true,
        secureContext      : secureContext,
        isServer           : false
      });

      // error handler for secure socket
      secureSocket.on('_tlsError', function(err) {
        if (secureEstablished) {
          connection._handleNetworkError(err);
        } else {
          onSecure(err);
        }
      });

      // cleartext <-> protocol
      secureSocket.pipe(connection._protocol);
      connection._protocol.on('data', function(data) {
        secureSocket.write(data);
      });

      secureSocket.on('secure', function() {
        secureEstablished = true;

        onSecure(rejectUnauthorized ? this.ssl.verifyError() : null);
      });

      // start TLS communications
      secureSocket._start();
    });
  };
} else {
  // pre-0.11 environment
  Connection.prototype._startTLS = function _startTLS(onSecure) {
    // before TLS:
    //  _socket <-> _protocol
    // after:
    //  _socket <-> securePair.encrypted <-> securePair.cleartext <-> _protocol

    var connection  = this;
    var credentials = Crypto.createCredentials({
      ca         : this.config.ssl.ca,
      cert       : this.config.ssl.cert,
      ciphers    : this.config.ssl.ciphers,
      key        : this.config.ssl.key,
      passphrase : this.config.ssl.passphrase
    });

    var rejectUnauthorized = this.config.ssl.rejectUnauthorized;
    var secureEstablished  = false;
    var securePair         = tls.createSecurePair(credentials, false, true, rejectUnauthorized);

    // error handler for secure pair
    securePair.on('error', function(err) {
      if (secureEstablished) {
        connection._handleNetworkError(err);
      } else {
        onSecure(err);
      }
    });

    // "unpipe"
    this._socket.removeAllListeners('data');
    this._protocol.removeAllListeners('data');

    // socket <-> encrypted
    securePair.encrypted.pipe(this._socket);
    this._socket.on('data', function(data) {
      securePair.encrypted.write(data);
    });

    // cleartext <-> protocol
    securePair.cleartext.pipe(this._protocol);
    this._protocol.on('data', function(data) {
      securePair.cleartext.write(data);
    });

    // secure established
    securePair.on('secure', function() {
      secureEstablished = true;

      if (!rejectUnauthorized) {
        onSecure();
        return;
      }

      var verifyError = this.ssl.verifyError();
      var err = verifyError;

      // node.js 0.6 support
      if (typeof err === 'string') {
        err = new Error(verifyError);
        err.code = verifyError;
      }

      onSecure(err);
    });

    // node.js 0.8 bug
    securePair._cycle = securePair.cycle;
    securePair.cycle  = function cycle() {
      if (this.ssl && this.ssl.error) {
        this.error();
      }

      return this._cycle.apply(this, arguments);
    };
  };
}

Connection.prototype._handleConnectTimeout = function() {
  if (this._socket) {
    this._socket.setTimeout(0);
    this._socket.destroy();
  }

  var err = new Error('connect ETIMEDOUT');
  err.errorno = 'ETIMEDOUT';
  err.code = 'ETIMEDOUT';
  err.syscall = 'connect';

  this._handleNetworkError(err);
};

Connection.prototype._handleNetworkError = function(err) {
  this._protocol.handleNetworkError(err);
};

Connection.prototype._handleProtocolError = function(err) {
  this.state = 'protocol_error';
  this.emit('error', err);
};

Connection.prototype._handleProtocolDrain = function() {
  this.emit('drain');
};

Connection.prototype._handleProtocolConnect = function() {
  this.state = 'connected';
  this.emit('connect');
};

Connection.prototype._handleProtocolHandshake = function _handleProtocolHandshake() {
  this.state = 'authenticated';
};

Connection.prototype._handleProtocolInitialize = function _handleProtocolInitialize(packet) {
  this.threadId = packet.threadId;
};

Connection.prototype._handleProtocolEnd = function(err) {
  this.state = 'disconnected';
  this.emit('end', err);
};

Connection.prototype._handleProtocolEnqueue = function _handleProtocolEnqueue(sequence) {
  this.emit('enqueue', sequence);
};

Connection.prototype._implyConnect = function() {
  if (!this._connectCalled) {
    this.connect();
  }
};

function createSecureContext (config, cb) {
  var context = null;
  var error   = null;

  try {
    context = tls.createSecureContext({
      ca         : config.ssl.ca,
      cert       : config.ssl.cert,
      ciphers    : config.ssl.ciphers,
      key        : config.ssl.key,
      passphrase : config.ssl.passphrase
    });
  } catch (err) {
    error = err;
  }

  cb(error, context);
}

function unwrapFromDomain(fn) {
  return function () {
    var domains = [];
    var ret;

    while (process.domain) {
      domains.shift(process.domain);
      process.domain.exit();
    }

    try {
      ret = fn.apply(this, arguments);
    } finally {
      for (var i = 0; i < domains.length; i++) {
        domains[i].enter();
      }
    }

    return ret;
  };
}

function wrapCallbackInDomain(ee, fn) {
  if (typeof fn !== 'function') {
    return undefined;
  }

  if (fn.domain) {
    return fn;
  }

  var domain = process.domain;

  if (domain) {
    return domain.bind(fn);
  } else if (ee) {
    return unwrapFromDomain(wrapToDomain(ee, fn));
  } else {
    return fn;
  }
}

function wrapToDomain(ee, fn) {
  return function () {
    if (Events.usingDomains && ee.domain) {
      ee.domain.enter();
      fn.apply(this, arguments);
      ee.domain.exit();
    } else {
      fn.apply(this, arguments);
    }
  };
}


/***/ }),

/***/ 6561:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var urlParse        = (__webpack_require__(7310).parse);
var ClientConstants = __webpack_require__(3778);
var Charsets        = __webpack_require__(2318);
var SSLProfiles     = null;

module.exports = ConnectionConfig;
function ConnectionConfig(options) {
  if (typeof options === 'string') {
    options = ConnectionConfig.parseUrl(options);
  }

  this.host               = options.host || 'localhost';
  this.port               = options.port || 3306;
  this.localAddress       = options.localAddress;
  this.socketPath         = options.socketPath;
  this.user               = options.user || undefined;
  this.password           = options.password || undefined;
  this.database           = options.database;
  this.connectTimeout     = (options.connectTimeout === undefined)
    ? (10 * 1000)
    : options.connectTimeout;
  this.insecureAuth       = options.insecureAuth || false;
  this.supportBigNumbers  = options.supportBigNumbers || false;
  this.bigNumberStrings   = options.bigNumberStrings || false;
  this.dateStrings        = options.dateStrings || false;
  this.debug              = options.debug;
  this.trace              = options.trace !== false;
  this.stringifyObjects   = options.stringifyObjects || false;
  this.timezone           = options.timezone || 'local';
  this.flags              = options.flags || '';
  this.queryFormat        = options.queryFormat;
  this.pool               = options.pool || undefined;
  this.ssl                = (typeof options.ssl === 'string')
    ? ConnectionConfig.getSSLProfile(options.ssl)
    : (options.ssl || false);
  this.localInfile        = (options.localInfile === undefined)
    ? true
    : options.localInfile;
  this.multipleStatements = options.multipleStatements || false;
  this.typeCast           = (options.typeCast === undefined)
    ? true
    : options.typeCast;

  if (this.timezone[0] === ' ') {
    // "+" is a url encoded char for space so it
    // gets translated to space when giving a
    // connection string..
    this.timezone = '+' + this.timezone.substr(1);
  }

  if (this.ssl) {
    // Default rejectUnauthorized to true
    this.ssl.rejectUnauthorized = this.ssl.rejectUnauthorized !== false;
  }

  this.maxPacketSize = 0;
  this.charsetNumber = (options.charset)
    ? ConnectionConfig.getCharsetNumber(options.charset)
    : options.charsetNumber || Charsets.UTF8_GENERAL_CI;

  // Set the client flags
  var defaultFlags = ConnectionConfig.getDefaultFlags(options);
  this.clientFlags = ConnectionConfig.mergeFlags(defaultFlags, options.flags);
}

ConnectionConfig.mergeFlags = function mergeFlags(defaultFlags, userFlags) {
  var allFlags = ConnectionConfig.parseFlagList(defaultFlags);
  var newFlags = ConnectionConfig.parseFlagList(userFlags);

  // Merge the new flags
  for (var flag in newFlags) {
    if (allFlags[flag] !== false) {
      allFlags[flag] = newFlags[flag];
    }
  }

  // Build flags
  var flags = 0x0;
  for (var flag in allFlags) {
    if (allFlags[flag]) {
      // TODO: Throw here on some future release
      flags |= ClientConstants['CLIENT_' + flag] || 0x0;
    }
  }

  return flags;
};

ConnectionConfig.getCharsetNumber = function getCharsetNumber(charset) {
  var num = Charsets[charset.toUpperCase()];

  if (num === undefined) {
    throw new TypeError('Unknown charset \'' + charset + '\'');
  }

  return num;
};

ConnectionConfig.getDefaultFlags = function getDefaultFlags(options) {
  var defaultFlags = [
    '-COMPRESS',          // Compression protocol *NOT* supported
    '-CONNECT_ATTRS',     // Does *NOT* send connection attributes in Protocol::HandshakeResponse41
    '+CONNECT_WITH_DB',   // One can specify db on connect in Handshake Response Packet
    '+FOUND_ROWS',        // Send found rows instead of affected rows
    '+IGNORE_SIGPIPE',    // Don't issue SIGPIPE if network failures
    '+IGNORE_SPACE',      // Let the parser ignore spaces before '('
    '+LOCAL_FILES',       // Can use LOAD DATA LOCAL
    '+LONG_FLAG',         // Longer flags in Protocol::ColumnDefinition320
    '+LONG_PASSWORD',     // Use the improved version of Old Password Authentication
    '+MULTI_RESULTS',     // Can handle multiple resultsets for COM_QUERY
    '+ODBC',              // Special handling of ODBC behaviour
    '-PLUGIN_AUTH',       // Does *NOT* support auth plugins
    '+PROTOCOL_41',       // Uses the 4.1 protocol
    '+PS_MULTI_RESULTS',  // Can handle multiple resultsets for COM_STMT_EXECUTE
    '+RESERVED',          // Unused
    '+SECURE_CONNECTION', // Supports Authentication::Native41
    '+TRANSACTIONS'       // Expects status flags
  ];

  if (options && options.localInfile !== undefined && !options.localInfile) {
    // Disable LOCAL modifier for LOAD DATA INFILE
    defaultFlags.push('-LOCAL_FILES');
  }

  if (options && options.multipleStatements) {
    // May send multiple statements per COM_QUERY and COM_STMT_PREPARE
    defaultFlags.push('+MULTI_STATEMENTS');
  }

  return defaultFlags;
};

ConnectionConfig.getSSLProfile = function getSSLProfile(name) {
  if (!SSLProfiles) {
    SSLProfiles = __webpack_require__(1075);
  }

  var ssl = SSLProfiles[name];

  if (ssl === undefined) {
    throw new TypeError('Unknown SSL profile \'' + name + '\'');
  }

  return ssl;
};

ConnectionConfig.parseFlagList = function parseFlagList(flagList) {
  var allFlags = Object.create(null);

  if (!flagList) {
    return allFlags;
  }

  var flags = !Array.isArray(flagList)
    ? String(flagList || '').toUpperCase().split(/\s*,+\s*/)
    : flagList;

  for (var i = 0; i < flags.length; i++) {
    var flag   = flags[i];
    var offset = 1;
    var state  = flag[0];

    if (state === undefined) {
      // TODO: throw here on some future release
      continue;
    }

    if (state !== '-' && state !== '+') {
      offset = 0;
      state  = '+';
    }

    allFlags[flag.substr(offset)] = state === '+';
  }

  return allFlags;
};

ConnectionConfig.parseUrl = function(url) {
  url = urlParse(url, true);

  var options = {
    host     : url.hostname,
    port     : url.port,
    database : url.pathname.substr(1)
  };

  if (url.auth) {
    var auth = url.auth.split(':');
    options.user     = auth.shift();
    options.password = auth.join(':');
  }

  if (url.query) {
    for (var key in url.query) {
      var value = url.query[key];

      try {
        // Try to parse this as a JSON expression first
        options[key] = JSON.parse(value);
      } catch (err) {
        // Otherwise assume it is a plain string
        options[key] = value;
      }
    }
  }

  return options;
};


/***/ }),

/***/ 7819:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var mysql          = __webpack_require__(4426);
var Connection     = __webpack_require__(4623);
var EventEmitter   = (__webpack_require__(2361).EventEmitter);
var Util           = __webpack_require__(3837);
var PoolConnection = __webpack_require__(4804);

module.exports = Pool;

Util.inherits(Pool, EventEmitter);
function Pool(options) {
  EventEmitter.call(this);
  this.config = options.config;
  this.config.connectionConfig.pool = this;

  this._acquiringConnections = [];
  this._allConnections       = [];
  this._freeConnections      = [];
  this._connectionQueue      = [];
  this._closed               = false;
}

Pool.prototype.getConnection = function (cb) {

  if (this._closed) {
    var err = new Error('Pool is closed.');
    err.code = 'POOL_CLOSED';
    process.nextTick(function () {
      cb(err);
    });
    return;
  }

  var connection;
  var pool = this;

  if (this._freeConnections.length > 0) {
    connection = this._freeConnections.shift();
    this.acquireConnection(connection, cb);
    return;
  }

  if (this.config.connectionLimit === 0 || this._allConnections.length < this.config.connectionLimit) {
    connection = new PoolConnection(this, { config: this.config.newConnectionConfig() });

    this._acquiringConnections.push(connection);
    this._allConnections.push(connection);

    connection.connect({timeout: this.config.acquireTimeout}, function onConnect(err) {
      spliceConnection(pool._acquiringConnections, connection);

      if (pool._closed) {
        err = new Error('Pool is closed.');
        err.code = 'POOL_CLOSED';
      }

      if (err) {
        pool._purgeConnection(connection);
        cb(err);
        return;
      }

      pool.emit('connection', connection);
      pool.emit('acquire', connection);
      cb(null, connection);
    });
    return;
  }

  if (!this.config.waitForConnections) {
    process.nextTick(function(){
      var err = new Error('No connections available.');
      err.code = 'POOL_CONNLIMIT';
      cb(err);
    });
    return;
  }

  this._enqueueCallback(cb);
};

Pool.prototype.acquireConnection = function acquireConnection(connection, cb) {
  if (connection._pool !== this) {
    throw new Error('Connection acquired from wrong pool.');
  }

  var changeUser = this._needsChangeUser(connection);
  var pool       = this;

  this._acquiringConnections.push(connection);

  function onOperationComplete(err) {
    spliceConnection(pool._acquiringConnections, connection);

    if (pool._closed) {
      err = new Error('Pool is closed.');
      err.code = 'POOL_CLOSED';
    }

    if (err) {
      pool._connectionQueue.unshift(cb);
      pool._purgeConnection(connection);
      return;
    }

    if (changeUser) {
      pool.emit('connection', connection);
    }

    pool.emit('acquire', connection);
    cb(null, connection);
  }

  if (changeUser) {
    // restore user back to pool configuration
    connection.config = this.config.newConnectionConfig();
    connection.changeUser({timeout: this.config.acquireTimeout}, onOperationComplete);
  } else {
    // ping connection
    connection.ping({timeout: this.config.acquireTimeout}, onOperationComplete);
  }
};

Pool.prototype.releaseConnection = function releaseConnection(connection) {

  if (this._acquiringConnections.indexOf(connection) !== -1) {
    // connection is being acquired
    return;
  }

  if (connection._pool) {
    if (connection._pool !== this) {
      throw new Error('Connection released to wrong pool');
    }

    if (this._freeConnections.indexOf(connection) !== -1) {
      // connection already in free connection pool
      // this won't catch all double-release cases
      throw new Error('Connection already released');
    } else {
      // add connection to end of free queue
      this._freeConnections.push(connection);
      this.emit('release', connection);
    }
  }

  if (this._closed) {
    // empty the connection queue
    this._connectionQueue.splice(0).forEach(function (cb) {
      var err = new Error('Pool is closed.');
      err.code = 'POOL_CLOSED';
      process.nextTick(function () {
        cb(err);
      });
    });
  } else if (this._connectionQueue.length) {
    // get connection with next waiting callback
    this.getConnection(this._connectionQueue.shift());
  }
};

Pool.prototype.end = function (cb) {
  this._closed = true;

  if (typeof cb !== 'function') {
    cb = function (err) {
      if (err) throw err;
    };
  }

  var calledBack   = false;
  var waitingClose = 0;

  function onEnd(err) {
    if (!calledBack && (err || --waitingClose <= 0)) {
      calledBack = true;
      cb(err);
    }
  }

  while (this._allConnections.length !== 0) {
    waitingClose++;
    this._purgeConnection(this._allConnections[0], onEnd);
  }

  if (waitingClose === 0) {
    process.nextTick(onEnd);
  }
};

Pool.prototype.query = function (sql, values, cb) {
  var query = Connection.createQuery(sql, values, cb);

  if (!(typeof sql === 'object' && 'typeCast' in sql)) {
    query.typeCast = this.config.connectionConfig.typeCast;
  }

  if (this.config.connectionConfig.trace) {
    // Long stack trace support
    query._callSite = new Error();
  }

  this.getConnection(function (err, conn) {
    if (err) {
      query.on('error', function () {});
      query.end(err);
      return;
    }

    // Release connection based off event
    query.once('end', function() {
      conn.release();
    });

    conn.query(query);
  });

  return query;
};

Pool.prototype._enqueueCallback = function _enqueueCallback(callback) {

  if (this.config.queueLimit && this._connectionQueue.length >= this.config.queueLimit) {
    process.nextTick(function () {
      var err = new Error('Queue limit reached.');
      err.code = 'POOL_ENQUEUELIMIT';
      callback(err);
    });
    return;
  }

  // Bind to domain, as dequeue will likely occur in a different domain
  var cb = process.domain
    ? process.domain.bind(callback)
    : callback;

  this._connectionQueue.push(cb);
  this.emit('enqueue');
};

Pool.prototype._needsChangeUser = function _needsChangeUser(connection) {
  var connConfig = connection.config;
  var poolConfig = this.config.connectionConfig;

  // check if changeUser values are different
  return connConfig.user !== poolConfig.user
    || connConfig.database !== poolConfig.database
    || connConfig.password !== poolConfig.password
    || connConfig.charsetNumber !== poolConfig.charsetNumber;
};

Pool.prototype._purgeConnection = function _purgeConnection(connection, callback) {
  var cb = callback || function () {};

  if (connection.state === 'disconnected') {
    connection.destroy();
  }

  this._removeConnection(connection);

  if (connection.state !== 'disconnected' && !connection._protocol._quitSequence) {
    connection._realEnd(cb);
    return;
  }

  process.nextTick(cb);
};

Pool.prototype._removeConnection = function(connection) {
  connection._pool = null;

  // Remove connection from all connections
  spliceConnection(this._allConnections, connection);

  // Remove connection from free connections
  spliceConnection(this._freeConnections, connection);

  this.releaseConnection(connection);
};

Pool.prototype.escape = function(value) {
  return mysql.escape(value, this.config.connectionConfig.stringifyObjects, this.config.connectionConfig.timezone);
};

Pool.prototype.escapeId = function escapeId(value) {
  return mysql.escapeId(value, false);
};

function spliceConnection(array, connection) {
  var index;
  if ((index = array.indexOf(connection)) !== -1) {
    // Remove connection from all connections
    array.splice(index, 1);
  }
}


/***/ }),

/***/ 1903:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Pool          = __webpack_require__(7819);
var PoolConfig    = __webpack_require__(7427);
var PoolNamespace = __webpack_require__(2221);
var PoolSelector  = __webpack_require__(9073);
var Util          = __webpack_require__(3837);
var EventEmitter  = (__webpack_require__(2361).EventEmitter);

module.exports = PoolCluster;

/**
 * PoolCluster
 * @constructor
 * @param {object} [config] The pool cluster configuration
 * @public
 */
function PoolCluster(config) {
  EventEmitter.call(this);

  config = config || {};
  this._canRetry = typeof config.canRetry === 'undefined' ? true : config.canRetry;
  this._defaultSelector = config.defaultSelector || 'RR';
  this._removeNodeErrorCount = config.removeNodeErrorCount || 5;
  this._restoreNodeTimeout = config.restoreNodeTimeout || 0;

  this._closed = false;
  this._findCaches = Object.create(null);
  this._lastId = 0;
  this._namespaces = Object.create(null);
  this._nodes = Object.create(null);
}

Util.inherits(PoolCluster, EventEmitter);

PoolCluster.prototype.add = function add(id, config) {
  if (this._closed) {
    throw new Error('PoolCluster is closed.');
  }

  var nodeId = typeof id === 'object'
    ? 'CLUSTER::' + (++this._lastId)
    : String(id);

  if (this._nodes[nodeId] !== undefined) {
    throw new Error('Node ID "' + nodeId + '" is already defined in PoolCluster.');
  }

  var poolConfig = typeof id !== 'object'
    ? new PoolConfig(config)
    : new PoolConfig(id);

  this._nodes[nodeId] = {
    id            : nodeId,
    errorCount    : 0,
    pool          : new Pool({config: poolConfig}),
    _offlineUntil : 0
  };

  this._clearFindCaches();
};

PoolCluster.prototype.end = function end(callback) {
  var cb = callback !== undefined
    ? callback
    : _cb;

  if (typeof cb !== 'function') {
    throw TypeError('callback argument must be a function');
  }

  if (this._closed) {
    process.nextTick(cb);
    return;
  }

  this._closed = true;

  var calledBack   = false;
  var nodeIds      = Object.keys(this._nodes);
  var waitingClose = 0;

  function onEnd(err) {
    if (!calledBack && (err || --waitingClose <= 0)) {
      calledBack = true;
      cb(err);
    }
  }

  for (var i = 0; i < nodeIds.length; i++) {
    var nodeId = nodeIds[i];
    var node = this._nodes[nodeId];

    waitingClose++;
    node.pool.end(onEnd);
  }

  if (waitingClose === 0) {
    process.nextTick(onEnd);
  }
};

PoolCluster.prototype.of = function(pattern, selector) {
  pattern = pattern || '*';

  selector = selector || this._defaultSelector;
  selector = selector.toUpperCase();
  if (typeof PoolSelector[selector] === 'undefined') {
    selector = this._defaultSelector;
  }

  var key = pattern + selector;

  if (typeof this._namespaces[key] === 'undefined') {
    this._namespaces[key] = new PoolNamespace(this, pattern, selector);
  }

  return this._namespaces[key];
};

PoolCluster.prototype.remove = function remove(pattern) {
  var foundNodeIds = this._findNodeIds(pattern, true);

  for (var i = 0; i < foundNodeIds.length; i++) {
    var node = this._getNode(foundNodeIds[i]);

    if (node) {
      this._removeNode(node);
    }
  }
};

PoolCluster.prototype.getConnection = function(pattern, selector, cb) {
  var namespace;
  if (typeof pattern === 'function') {
    cb = pattern;
    namespace = this.of();
  } else {
    if (typeof selector === 'function') {
      cb = selector;
      selector = this._defaultSelector;
    }

    namespace = this.of(pattern, selector);
  }

  namespace.getConnection(cb);
};

PoolCluster.prototype._clearFindCaches = function _clearFindCaches() {
  this._findCaches = Object.create(null);
};

PoolCluster.prototype._decreaseErrorCount = function _decreaseErrorCount(node) {
  var errorCount = node.errorCount;

  if (errorCount > this._removeNodeErrorCount) {
    errorCount = this._removeNodeErrorCount;
  }

  if (errorCount < 1) {
    errorCount = 1;
  }

  node.errorCount = errorCount - 1;

  if (node._offlineUntil) {
    node._offlineUntil = 0;
    this.emit('online', node.id);
  }
};

PoolCluster.prototype._findNodeIds = function _findNodeIds(pattern, includeOffline) {
  var currentTime  = 0;
  var foundNodeIds = this._findCaches[pattern];

  if (foundNodeIds === undefined) {
    var expression = patternRegExp(pattern);
    var nodeIds    = Object.keys(this._nodes);

    foundNodeIds = nodeIds.filter(function (id) {
      return id.match(expression);
    });

    this._findCaches[pattern] = foundNodeIds;
  }

  if (includeOffline) {
    return foundNodeIds;
  }

  return foundNodeIds.filter(function (nodeId) {
    var node = this._getNode(nodeId);

    if (!node._offlineUntil) {
      return true;
    }

    if (!currentTime) {
      currentTime = getMonotonicMilliseconds();
    }

    return node._offlineUntil <= currentTime;
  }, this);
};

PoolCluster.prototype._getNode = function _getNode(id) {
  return this._nodes[id] || null;
};

PoolCluster.prototype._increaseErrorCount = function _increaseErrorCount(node) {
  var errorCount = ++node.errorCount;

  if (this._removeNodeErrorCount > errorCount) {
    return;
  }

  if (this._restoreNodeTimeout > 0) {
    node._offlineUntil = getMonotonicMilliseconds() + this._restoreNodeTimeout;
    this.emit('offline', node.id);
    return;
  }

  this._removeNode(node);
  this.emit('remove', node.id);
};

PoolCluster.prototype._getConnection = function(node, cb) {
  var self = this;

  node.pool.getConnection(function (err, connection) {
    if (err) {
      self._increaseErrorCount(node);
      cb(err);
      return;
    } else {
      self._decreaseErrorCount(node);
    }

    connection._clusterId = node.id;

    cb(null, connection);
  });
};

PoolCluster.prototype._removeNode = function _removeNode(node) {
  delete this._nodes[node.id];

  this._clearFindCaches();

  node.pool.end(_noop);
};

function getMonotonicMilliseconds() {
  var ms;

  if (typeof process.hrtime === 'function') {
    ms = process.hrtime();
    ms = ms[0] * 1e3 + ms[1] * 1e-6;
  } else {
    ms = process.uptime() * 1000;
  }

  return Math.floor(ms);
}

function isRegExp(val) {
  return typeof val === 'object'
    && Object.prototype.toString.call(val) === '[object RegExp]';
}

function patternRegExp(pattern) {
  if (isRegExp(pattern)) {
    return pattern;
  }

  var source = pattern
    .replace(/([.+?^=!:${}()|\[\]\/\\])/g, '\\$1')
    .replace(/\*/g, '.*');

  return new RegExp('^' + source + '$');
}

function _cb(err) {
  if (err) {
    throw err;
  }
}

function _noop() {}


/***/ }),

/***/ 7427:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var ConnectionConfig = __webpack_require__(6561);

module.exports = PoolConfig;
function PoolConfig(options) {
  if (typeof options === 'string') {
    options = ConnectionConfig.parseUrl(options);
  }

  this.acquireTimeout     = (options.acquireTimeout === undefined)
    ? 10 * 1000
    : Number(options.acquireTimeout);
  this.connectionConfig   = new ConnectionConfig(options);
  this.waitForConnections = (options.waitForConnections === undefined)
    ? true
    : Boolean(options.waitForConnections);
  this.connectionLimit    = (options.connectionLimit === undefined)
    ? 10
    : Number(options.connectionLimit);
  this.queueLimit         = (options.queueLimit === undefined)
    ? 0
    : Number(options.queueLimit);
}

PoolConfig.prototype.newConnectionConfig = function newConnectionConfig() {
  var connectionConfig = new ConnectionConfig(this.connectionConfig);

  connectionConfig.clientFlags   = this.connectionConfig.clientFlags;
  connectionConfig.maxPacketSize = this.connectionConfig.maxPacketSize;

  return connectionConfig;
};


/***/ }),

/***/ 4804:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var inherits   = (__webpack_require__(3837).inherits);
var Connection = __webpack_require__(4623);
var Events     = __webpack_require__(2361);

module.exports = PoolConnection;
inherits(PoolConnection, Connection);

function PoolConnection(pool, options) {
  Connection.call(this, options);
  this._pool  = pool;

  // Bind connection to pool domain
  if (Events.usingDomains) {
    this.domain = pool.domain;
  }

  // When a fatal error occurs the connection's protocol ends, which will cause
  // the connection to end as well, thus we only need to watch for the end event
  // and we will be notified of disconnects.
  this.on('end', this._removeFromPool);
  this.on('error', function (err) {
    if (err.fatal) {
      this._removeFromPool();
    }
  });
}

PoolConnection.prototype.release = function release() {
  var pool = this._pool;

  if (!pool || pool._closed) {
    return undefined;
  }

  return pool.releaseConnection(this);
};

// TODO: Remove this when we are removing PoolConnection#end
PoolConnection.prototype._realEnd = Connection.prototype.end;

PoolConnection.prototype.end = function () {
  console.warn(
    'Calling conn.end() to release a pooled connection is ' +
    'deprecated. In next version calling conn.end() will be ' +
    'restored to default conn.end() behavior. Use ' +
    'conn.release() instead.'
  );
  this.release();
};

PoolConnection.prototype.destroy = function () {
  Connection.prototype.destroy.apply(this, arguments);
  this._removeFromPool(this);
};

PoolConnection.prototype._removeFromPool = function _removeFromPool() {
  if (!this._pool || this._pool._closed) {
    return;
  }

  var pool = this._pool;
  this._pool = null;

  pool._purgeConnection(this);
};


/***/ }),

/***/ 2221:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Connection   = __webpack_require__(4623);
var PoolSelector = __webpack_require__(9073);

module.exports = PoolNamespace;

/**
 * PoolNamespace
 * @constructor
 * @param {PoolCluster} cluster The parent cluster for the namespace
 * @param {string} pattern The selection pattern to use
 * @param {string} selector The selector name to use
 * @public
 */
function PoolNamespace(cluster, pattern, selector) {
  this._cluster = cluster;
  this._pattern = pattern;
  this._selector = new PoolSelector[selector]();
}

PoolNamespace.prototype.getConnection = function(cb) {
  var clusterNode = this._getClusterNode();
  var cluster     = this._cluster;
  var namespace   = this;

  if (clusterNode === null) {
    var err = null;

    if (this._cluster._findNodeIds(this._pattern, true).length !== 0) {
      err = new Error('Pool does not have online node.');
      err.code = 'POOL_NONEONLINE';
    } else {
      err = new Error('Pool does not exist.');
      err.code = 'POOL_NOEXIST';
    }

    cb(err);
    return;
  }

  cluster._getConnection(clusterNode, function(err, connection) {
    var retry = err && cluster._canRetry
      && cluster._findNodeIds(namespace._pattern).length !== 0;

    if (retry) {
      namespace.getConnection(cb);
      return;
    }

    if (err) {
      cb(err);
      return;
    }

    cb(null, connection);
  });
};

PoolNamespace.prototype.query = function (sql, values, cb) {
  var cluster     = this._cluster;
  var clusterNode = this._getClusterNode();
  var query       = Connection.createQuery(sql, values, cb);
  var namespace   = this;

  if (clusterNode === null) {
    var err = null;

    if (this._cluster._findNodeIds(this._pattern, true).length !== 0) {
      err = new Error('Pool does not have online node.');
      err.code = 'POOL_NONEONLINE';
    } else {
      err = new Error('Pool does not exist.');
      err.code = 'POOL_NOEXIST';
    }

    process.nextTick(function () {
      query.on('error', function () {});
      query.end(err);
    });
    return query;
  }

  if (!(typeof sql === 'object' && 'typeCast' in sql)) {
    query.typeCast = clusterNode.pool.config.connectionConfig.typeCast;
  }

  if (clusterNode.pool.config.connectionConfig.trace) {
    // Long stack trace support
    query._callSite = new Error();
  }

  cluster._getConnection(clusterNode, function (err, conn) {
    var retry = err && cluster._canRetry
      && cluster._findNodeIds(namespace._pattern).length !== 0;

    if (retry) {
      namespace.query(query);
      return;
    }

    if (err) {
      query.on('error', function () {});
      query.end(err);
      return;
    }

    // Release connection based off event
    query.once('end', function() {
      conn.release();
    });

    conn.query(query);
  });

  return query;
};

PoolNamespace.prototype._getClusterNode = function _getClusterNode() {
  var foundNodeIds = this._cluster._findNodeIds(this._pattern);
  var nodeId;

  switch (foundNodeIds.length) {
    case 0:
      nodeId = null;
      break;
    case 1:
      nodeId = foundNodeIds[0];
      break;
    default:
      nodeId = this._selector(foundNodeIds);
      break;
  }

  return nodeId !== null
    ? this._cluster._getNode(nodeId)
    : null;
};


/***/ }),

/***/ 9073:
/***/ ((module) => {


/**
 * PoolSelector
 */
var PoolSelector = module.exports = {};

PoolSelector.RR = function PoolSelectorRoundRobin() {
  var index = 0;

  return function(clusterIds) {
    if (index >= clusterIds.length) {
      index = 0;
    }

    var clusterId = clusterIds[index++];

    return clusterId;
  };
};

PoolSelector.RANDOM = function PoolSelectorRandom() {
  return function(clusterIds) {
    return clusterIds[Math.floor(Math.random() * clusterIds.length)];
  };
};

PoolSelector.ORDER = function PoolSelectorOrder() {
  return function(clusterIds) {
    return clusterIds[0];
  };
};


/***/ }),

/***/ 8065:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var Buffer = (__webpack_require__(4065).Buffer);
var Crypto = __webpack_require__(6113);
var Auth   = exports;

function auth(name, data, options) {
  options = options || {};

  switch (name) {
    case 'mysql_native_password':
      return Auth.token(options.password, data.slice(0, 20));
    default:
      return undefined;
  }
}
Auth.auth = auth;

function sha1(msg) {
  var hash = Crypto.createHash('sha1');
  hash.update(msg, 'binary');
  return hash.digest('binary');
}
Auth.sha1 = sha1;

function xor(a, b) {
  a = Buffer.from(a, 'binary');
  b = Buffer.from(b, 'binary');
  var result = Buffer.allocUnsafe(a.length);
  for (var i = 0; i < a.length; i++) {
    result[i] = (a[i] ^ b[i]);
  }
  return result;
}
Auth.xor = xor;

Auth.token = function(password, scramble) {
  if (!password) {
    return Buffer.alloc(0);
  }

  // password must be in binary format, not utf8
  var stage1 = sha1((Buffer.from(password, 'utf8')).toString('binary'));
  var stage2 = sha1(stage1);
  var stage3 = sha1(scramble.toString('binary') + stage2);
  return xor(stage3, stage1);
};

// This is a port of sql/password.c:hash_password which needs to be used for
// pre-4.1 passwords.
Auth.hashPassword = function(password) {
  var nr     = [0x5030, 0x5735];
  var add    = 7;
  var nr2    = [0x1234, 0x5671];
  var result = Buffer.alloc(8);

  if (typeof password === 'string'){
    password = Buffer.from(password);
  }

  for (var i = 0; i < password.length; i++) {
    var c = password[i];
    if (c === 32 || c === 9) {
      // skip space in password
      continue;
    }

    // nr^= (((nr & 63)+add)*c)+ (nr << 8);
    // nr = xor(nr, add(mul(add(and(nr, 63), add), c), shl(nr, 8)))
    nr = this.xor32(nr, this.add32(this.mul32(this.add32(this.and32(nr, [0, 63]), [0, add]), [0, c]), this.shl32(nr, 8)));

    // nr2+=(nr2 << 8) ^ nr;
    // nr2 = add(nr2, xor(shl(nr2, 8), nr))
    nr2 = this.add32(nr2, this.xor32(this.shl32(nr2, 8), nr));

    // add+=tmp;
    add += c;
  }

  this.int31Write(result, nr, 0);
  this.int31Write(result, nr2, 4);

  return result;
};

Auth.randomInit = function(seed1, seed2) {
  return {
    max_value     : 0x3FFFFFFF,
    max_value_dbl : 0x3FFFFFFF,
    seed1         : seed1 % 0x3FFFFFFF,
    seed2         : seed2 % 0x3FFFFFFF
  };
};

Auth.myRnd = function(r){
  r.seed1 = (r.seed1 * 3 + r.seed2) % r.max_value;
  r.seed2 = (r.seed1 + r.seed2 + 33) % r.max_value;

  return r.seed1 / r.max_value_dbl;
};

Auth.scramble323 = function(message, password) {
  if (!password) {
    return Buffer.alloc(0);
  }

  var to          = Buffer.allocUnsafe(8);
  var hashPass    = this.hashPassword(password);
  var hashMessage = this.hashPassword(message.slice(0, 8));
  var seed1       = this.int32Read(hashPass, 0) ^ this.int32Read(hashMessage, 0);
  var seed2       = this.int32Read(hashPass, 4) ^ this.int32Read(hashMessage, 4);
  var r           = this.randomInit(seed1, seed2);

  for (var i = 0; i < 8; i++){
    to[i] = Math.floor(this.myRnd(r) * 31) + 64;
  }
  var extra = (Math.floor(this.myRnd(r) * 31));

  for (var i = 0; i < 8; i++){
    to[i] ^= extra;
  }

  return to;
};

Auth.xor32 = function(a, b){
  return [a[0] ^ b[0], a[1] ^ b[1]];
};

Auth.add32 = function(a, b){
  var w1 = a[1] + b[1];
  var w2 = a[0] + b[0] + ((w1 & 0xFFFF0000) >> 16);

  return [w2 & 0xFFFF, w1 & 0xFFFF];
};

Auth.mul32 = function(a, b){
  // based on this example of multiplying 32b ints using 16b
  // http://www.dsprelated.com/showmessage/89790/1.php
  var w1 = a[1] * b[1];
  var w2 = (((a[1] * b[1]) >> 16) & 0xFFFF) + ((a[0] * b[1]) & 0xFFFF) + (a[1] * b[0] & 0xFFFF);

  return [w2 & 0xFFFF, w1 & 0xFFFF];
};

Auth.and32 = function(a, b){
  return [a[0] & b[0], a[1] & b[1]];
};

Auth.shl32 = function(a, b){
  // assume b is 16 or less
  var w1 = a[1] << b;
  var w2 = (a[0] << b) | ((w1 & 0xFFFF0000) >> 16);

  return [w2 & 0xFFFF, w1 & 0xFFFF];
};

Auth.int31Write = function(buffer, number, offset) {
  buffer[offset] = (number[0] >> 8) & 0x7F;
  buffer[offset + 1] = (number[0]) & 0xFF;
  buffer[offset + 2] = (number[1] >> 8) & 0xFF;
  buffer[offset + 3] = (number[1]) & 0xFF;
};

Auth.int32Read = function(buffer, offset){
  return (buffer[offset] << 24)
       + (buffer[offset + 1] << 16)
       + (buffer[offset + 2] << 8)
       + (buffer[offset + 3]);
};


/***/ }),

/***/ 5811:
/***/ ((module) => {


module.exports = BufferList;
function BufferList() {
  this.bufs = [];
  this.size = 0;
}

BufferList.prototype.shift = function shift() {
  var buf = this.bufs.shift();

  if (buf) {
    this.size -= buf.length;
  }

  return buf;
};

BufferList.prototype.push = function push(buf) {
  if (!buf || !buf.length) {
    return;
  }

  this.bufs.push(buf);
  this.size += buf.length;
};


/***/ }),

/***/ 1604:
/***/ ((module) => {

module.exports = PacketHeader;
function PacketHeader(length, number) {
  this.length = length;
  this.number = number;
}


/***/ }),

/***/ 2980:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var BIT_16            = Math.pow(2, 16);
var BIT_24            = Math.pow(2, 24);
var BUFFER_ALLOC_SIZE = Math.pow(2, 8);
// The maximum precision JS Numbers can hold precisely
// Don't panic: Good enough to represent byte values up to 8192 TB
var IEEE_754_BINARY_64_PRECISION = Math.pow(2, 53);
var MAX_PACKET_LENGTH            = Math.pow(2, 24) - 1;
var Buffer                       = (__webpack_require__(4065).Buffer);

module.exports = PacketWriter;
function PacketWriter() {
  this._buffer = null;
  this._offset = 0;
}

PacketWriter.prototype.toBuffer = function toBuffer(parser) {
  if (!this._buffer) {
    this._buffer = Buffer.alloc(0);
    this._offset = 0;
  }

  var buffer  = this._buffer;
  var length  = this._offset;
  var packets = Math.floor(length / MAX_PACKET_LENGTH) + 1;

  this._buffer = Buffer.allocUnsafe(length + packets * 4);
  this._offset = 0;

  for (var packet = 0; packet < packets; packet++) {
    var isLast = (packet + 1 === packets);
    var packetLength = (isLast)
      ? length % MAX_PACKET_LENGTH
      : MAX_PACKET_LENGTH;

    var packetNumber = parser.incrementPacketNumber();

    this.writeUnsignedNumber(3, packetLength);
    this.writeUnsignedNumber(1, packetNumber);

    var start = packet * MAX_PACKET_LENGTH;
    var end   = start + packetLength;

    this.writeBuffer(buffer.slice(start, end));
  }

  return this._buffer;
};

PacketWriter.prototype.writeUnsignedNumber = function(bytes, value) {
  this._allocate(bytes);

  for (var i = 0; i < bytes; i++) {
    this._buffer[this._offset++] = (value >> (i * 8)) & 0xff;
  }
};

PacketWriter.prototype.writeFiller = function(bytes) {
  this._allocate(bytes);

  for (var i = 0; i < bytes; i++) {
    this._buffer[this._offset++] = 0x00;
  }
};

PacketWriter.prototype.writeNullTerminatedString = function(value, encoding) {
  // Typecast undefined into '' and numbers into strings
  value = value || '';
  value = value + '';

  var bytes = Buffer.byteLength(value, encoding || 'utf-8') + 1;
  this._allocate(bytes);

  this._buffer.write(value, this._offset, encoding);
  this._buffer[this._offset + bytes - 1] = 0x00;

  this._offset += bytes;
};

PacketWriter.prototype.writeString = function(value) {
  // Typecast undefined into '' and numbers into strings
  value = value || '';
  value = value + '';

  var bytes = Buffer.byteLength(value, 'utf-8');
  this._allocate(bytes);

  this._buffer.write(value, this._offset, 'utf-8');

  this._offset += bytes;
};

PacketWriter.prototype.writeBuffer = function(value) {
  var bytes = value.length;

  this._allocate(bytes);
  value.copy(this._buffer, this._offset);
  this._offset += bytes;
};

PacketWriter.prototype.writeLengthCodedNumber = function(value) {
  if (value === null) {
    this._allocate(1);
    this._buffer[this._offset++] = 251;
    return;
  }

  if (value <= 250) {
    this._allocate(1);
    this._buffer[this._offset++] = value;
    return;
  }

  if (value > IEEE_754_BINARY_64_PRECISION) {
    throw new Error(
      'writeLengthCodedNumber: JS precision range exceeded, your ' +
      'number is > 53 bit: "' + value + '"'
    );
  }

  if (value < BIT_16) {
    this._allocate(3);
    this._buffer[this._offset++] = 252;
  } else if (value < BIT_24) {
    this._allocate(4);
    this._buffer[this._offset++] = 253;
  } else {
    this._allocate(9);
    this._buffer[this._offset++] = 254;
  }

  // 16 Bit
  this._buffer[this._offset++] = value & 0xff;
  this._buffer[this._offset++] = (value >> 8) & 0xff;

  if (value < BIT_16) {
    return;
  }

  // 24 Bit
  this._buffer[this._offset++] = (value >> 16) & 0xff;

  if (value < BIT_24) {
    return;
  }

  this._buffer[this._offset++] = (value >> 24) & 0xff;

  // Hack: Get the most significant 32 bit (JS bitwise operators are 32 bit)
  value = value.toString(2);
  value = value.substr(0, value.length - 32);
  value = parseInt(value, 2);

  this._buffer[this._offset++] = value & 0xff;
  this._buffer[this._offset++] = (value >> 8) & 0xff;
  this._buffer[this._offset++] = (value >> 16) & 0xff;

  // Set last byte to 0, as we can only support 53 bits in JS (see above)
  this._buffer[this._offset++] = 0;
};

PacketWriter.prototype.writeLengthCodedBuffer = function(value) {
  var bytes = value.length;
  this.writeLengthCodedNumber(bytes);
  this.writeBuffer(value);
};

PacketWriter.prototype.writeNullTerminatedBuffer = function(value) {
  this.writeBuffer(value);
  this.writeFiller(1); // 0x00 terminator
};

PacketWriter.prototype.writeLengthCodedString = function(value) {
  if (value === null) {
    this.writeLengthCodedNumber(null);
    return;
  }

  value = (value === undefined)
    ? ''
    : String(value);

  var bytes = Buffer.byteLength(value, 'utf-8');
  this.writeLengthCodedNumber(bytes);

  if (!bytes) {
    return;
  }

  this._allocate(bytes);
  this._buffer.write(value, this._offset, 'utf-8');
  this._offset += bytes;
};

PacketWriter.prototype._allocate = function _allocate(bytes) {
  if (!this._buffer) {
    this._buffer = Buffer.alloc(Math.max(BUFFER_ALLOC_SIZE, bytes));
    this._offset = 0;
    return;
  }

  var bytesRemaining = this._buffer.length - this._offset;
  if (bytesRemaining >= bytes) {
    return;
  }

  var newSize   = this._buffer.length + Math.max(BUFFER_ALLOC_SIZE, bytes);
  var oldBuffer = this._buffer;

  this._buffer = Buffer.alloc(newSize);
  oldBuffer.copy(this._buffer);
};


/***/ }),

/***/ 9412:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var PacketHeader = __webpack_require__(1604);
var BigNumber    = __webpack_require__(905);
var Buffer       = (__webpack_require__(4065).Buffer);
var BufferList   = __webpack_require__(5811);

var MAX_PACKET_LENGTH    = Math.pow(2, 24) - 1;
var MUL_32BIT            = Math.pow(2, 32);
var PACKET_HEADER_LENGTH = 4;

module.exports = Parser;
function Parser(options) {
  options = options || {};

  this._supportBigNumbers = options.config && options.config.supportBigNumbers;
  this._buffer            = Buffer.alloc(0);
  this._nextBuffers       = new BufferList();
  this._longPacketBuffers = new BufferList();
  this._offset            = 0;
  this._packetEnd         = null;
  this._packetHeader      = null;
  this._packetOffset      = null;
  this._onError           = options.onError || function(err) { throw err; };
  this._onPacket          = options.onPacket || function() {};
  this._nextPacketNumber  = 0;
  this._encoding          = 'utf-8';
  this._paused            = false;
}

Parser.prototype.write = function write(chunk) {
  this._nextBuffers.push(chunk);

  while (!this._paused) {
    var packetHeader = this._tryReadPacketHeader();

    if (!packetHeader) {
      break;
    }

    if (!this._combineNextBuffers(packetHeader.length)) {
      break;
    }

    this._parsePacket(packetHeader);
  }
};

Parser.prototype.append = function append(chunk) {
  if (!chunk || chunk.length === 0) {
    return;
  }

  // Calculate slice ranges
  var sliceEnd    = this._buffer.length;
  var sliceStart  = this._packetOffset === null
    ? this._offset
    : this._packetOffset;
  var sliceLength = sliceEnd - sliceStart;

  // Get chunk data
  var buffer = null;
  var chunks = !(chunk instanceof Array || Array.isArray(chunk)) ? [chunk] : chunk;
  var length = 0;
  var offset = 0;

  for (var i = 0; i < chunks.length; i++) {
    length += chunks[i].length;
  }

  if (sliceLength !== 0) {
    // Create a new Buffer
    buffer = Buffer.allocUnsafe(sliceLength + length);
    offset = 0;

    // Copy data slice
    offset += this._buffer.copy(buffer, 0, sliceStart, sliceEnd);

    // Copy chunks
    for (var i = 0; i < chunks.length; i++) {
      offset += chunks[i].copy(buffer, offset);
    }
  } else if (chunks.length > 1) {
    // Create a new Buffer
    buffer = Buffer.allocUnsafe(length);
    offset = 0;

    // Copy chunks
    for (var i = 0; i < chunks.length; i++) {
      offset += chunks[i].copy(buffer, offset);
    }
  } else {
    // Buffer is the only chunk
    buffer = chunks[0];
  }

  // Adjust data-tracking pointers
  this._buffer       = buffer;
  this._offset       = this._offset - sliceStart;
  this._packetEnd    = this._packetEnd !== null
    ? this._packetEnd - sliceStart
    : null;
  this._packetOffset = this._packetOffset !== null
    ? this._packetOffset - sliceStart
    : null;
};

Parser.prototype.pause = function() {
  this._paused = true;
};

Parser.prototype.resume = function() {
  this._paused = false;

  // nextTick() to avoid entering write() multiple times within the same stack
  // which would cause problems as write manipulates the state of the object.
  process.nextTick(this.write.bind(this));
};

Parser.prototype.peak = function peak(offset) {
  return this._buffer[this._offset + (offset >>> 0)];
};

Parser.prototype.parseUnsignedNumber = function parseUnsignedNumber(bytes) {
  if (bytes === 1) {
    return this._buffer[this._offset++];
  }

  var buffer = this._buffer;
  var offset = this._offset + bytes - 1;
  var value  = 0;

  if (bytes > 4) {
    var err    = new Error('parseUnsignedNumber: Supports only up to 4 bytes');
    err.offset = (this._offset - this._packetOffset - 1);
    err.code   = 'PARSER_UNSIGNED_TOO_LONG';
    throw err;
  }

  while (offset >= this._offset) {
    value = ((value << 8) | buffer[offset]) >>> 0;
    offset--;
  }

  this._offset += bytes;

  return value;
};

Parser.prototype.parseLengthCodedString = function() {
  var length = this.parseLengthCodedNumber();

  if (length === null) {
    return null;
  }

  return this.parseString(length);
};

Parser.prototype.parseLengthCodedBuffer = function() {
  var length = this.parseLengthCodedNumber();

  if (length === null) {
    return null;
  }

  return this.parseBuffer(length);
};

Parser.prototype.parseLengthCodedNumber = function parseLengthCodedNumber() {
  if (this._offset >= this._buffer.length) {
    var err    = new Error('Parser: read past end');
    err.offset = (this._offset - this._packetOffset);
    err.code   = 'PARSER_READ_PAST_END';
    throw err;
  }

  var bits = this._buffer[this._offset++];

  if (bits <= 250) {
    return bits;
  }

  switch (bits) {
    case 251:
      return null;
    case 252:
      return this.parseUnsignedNumber(2);
    case 253:
      return this.parseUnsignedNumber(3);
    case 254:
      break;
    default:
      var err    = new Error('Unexpected first byte' + (bits ? ': 0x' + bits.toString(16) : ''));
      err.offset = (this._offset - this._packetOffset - 1);
      err.code   = 'PARSER_BAD_LENGTH_BYTE';
      throw err;
  }

  var low = this.parseUnsignedNumber(4);
  var high = this.parseUnsignedNumber(4);
  var value;

  if (high >>> 21) {
    value = BigNumber(MUL_32BIT).times(high).plus(low).toString();

    if (this._supportBigNumbers) {
      return value;
    }

    var err    = new Error(
      'parseLengthCodedNumber: JS precision range exceeded, ' +
      'number is >= 53 bit: "' + value + '"'
    );
    err.offset = (this._offset - this._packetOffset - 8);
    err.code   = 'PARSER_JS_PRECISION_RANGE_EXCEEDED';
    throw err;
  }

  value = low + (MUL_32BIT * high);

  return value;
};

Parser.prototype.parseFiller = function(length) {
  return this.parseBuffer(length);
};

Parser.prototype.parseNullTerminatedBuffer = function() {
  var end      = this._nullByteOffset();
  var value    = this._buffer.slice(this._offset, end);
  this._offset = end + 1;

  return value;
};

Parser.prototype.parseNullTerminatedString = function() {
  var end      = this._nullByteOffset();
  var value    = this._buffer.toString(this._encoding, this._offset, end);
  this._offset = end + 1;

  return value;
};

Parser.prototype._nullByteOffset = function() {
  var offset = this._offset;

  while (this._buffer[offset] !== 0x00) {
    offset++;

    if (offset >= this._buffer.length) {
      var err    = new Error('Offset of null terminated string not found.');
      err.offset = (this._offset - this._packetOffset);
      err.code   = 'PARSER_MISSING_NULL_BYTE';
      throw err;
    }
  }

  return offset;
};

Parser.prototype.parsePacketTerminatedBuffer = function parsePacketTerminatedBuffer() {
  var length = this._packetEnd - this._offset;
  return this.parseBuffer(length);
};

Parser.prototype.parsePacketTerminatedString = function() {
  var length = this._packetEnd - this._offset;
  return this.parseString(length);
};

Parser.prototype.parseBuffer = function(length) {
  var response = Buffer.alloc(length);
  this._buffer.copy(response, 0, this._offset, this._offset + length);

  this._offset += length;
  return response;
};

Parser.prototype.parseString = function(length) {
  var offset = this._offset;
  var end = offset + length;
  var value = this._buffer.toString(this._encoding, offset, end);

  this._offset = end;
  return value;
};

Parser.prototype.parseGeometryValue = function() {
  var buffer = this.parseLengthCodedBuffer();
  var offset = 4;

  if (buffer === null || !buffer.length) {
    return null;
  }

  function parseGeometry() {
    var result = null;
    var byteOrder = buffer.readUInt8(offset); offset += 1;
    var wkbType = byteOrder ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset); offset += 4;
    switch (wkbType) {
      case 1: // WKBPoint
        var x = byteOrder ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset); offset += 8;
        var y = byteOrder ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset); offset += 8;
        result = {x: x, y: y};
        break;
      case 2: // WKBLineString
        var numPoints = byteOrder ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset); offset += 4;
        result = [];
        for (var i = numPoints; i > 0; i--) {
          var x = byteOrder ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset); offset += 8;
          var y = byteOrder ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset); offset += 8;
          result.push({x: x, y: y});
        }
        break;
      case 3: // WKBPolygon
        var numRings = byteOrder ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset); offset += 4;
        result = [];
        for (var i = numRings; i > 0; i--) {
          var numPoints = byteOrder ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset); offset += 4;
          var line = [];
          for (var j = numPoints; j > 0; j--) {
            var x = byteOrder ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset); offset += 8;
            var y = byteOrder ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset); offset += 8;
            line.push({x: x, y: y});
          }
          result.push(line);
        }
        break;
      case 4: // WKBMultiPoint
      case 5: // WKBMultiLineString
      case 6: // WKBMultiPolygon
      case 7: // WKBGeometryCollection
        var num = byteOrder ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset); offset += 4;
        var result = [];
        for (var i = num; i > 0; i--) {
          result.push(parseGeometry());
        }
        break;
    }
    return result;
  }
  return parseGeometry();
};

Parser.prototype.reachedPacketEnd = function() {
  return this._offset === this._packetEnd;
};

Parser.prototype.incrementPacketNumber = function() {
  var currentPacketNumber = this._nextPacketNumber;
  this._nextPacketNumber = (this._nextPacketNumber + 1) % 256;

  return currentPacketNumber;
};

Parser.prototype.resetPacketNumber = function() {
  this._nextPacketNumber = 0;
};

Parser.prototype.packetLength = function packetLength() {
  if (!this._packetHeader) {
    return null;
  }

  return this._packetHeader.length + this._longPacketBuffers.size;
};

Parser.prototype._combineNextBuffers = function _combineNextBuffers(bytes) {
  var length = this._buffer.length - this._offset;

  if (length >= bytes) {
    return true;
  }

  if ((length + this._nextBuffers.size) < bytes) {
    return false;
  }

  var buffers     = [];
  var bytesNeeded = bytes - length;

  while (bytesNeeded > 0) {
    var buffer = this._nextBuffers.shift();
    buffers.push(buffer);
    bytesNeeded -= buffer.length;
  }

  this.append(buffers);
  return true;
};

Parser.prototype._combineLongPacketBuffers = function _combineLongPacketBuffers() {
  if (!this._longPacketBuffers.size) {
    return;
  }

  // Calculate bytes
  var remainingBytes      = this._buffer.length - this._offset;
  var trailingPacketBytes = this._buffer.length - this._packetEnd;

  // Create buffer
  var buf    = null;
  var buffer = Buffer.allocUnsafe(remainingBytes + this._longPacketBuffers.size);
  var offset = 0;

  // Copy long buffers
  while ((buf = this._longPacketBuffers.shift())) {
    offset += buf.copy(buffer, offset);
  }

  // Copy remaining bytes
  this._buffer.copy(buffer, offset, this._offset);

  this._buffer       = buffer;
  this._offset       = 0;
  this._packetEnd    = this._buffer.length - trailingPacketBytes;
  this._packetOffset = 0;
};

Parser.prototype._parsePacket = function _parsePacket(packetHeader) {
  this._packetEnd    = this._offset + packetHeader.length;
  this._packetOffset = this._offset;

  if (packetHeader.length === MAX_PACKET_LENGTH) {
    this._longPacketBuffers.push(this._buffer.slice(this._packetOffset, this._packetEnd));
    this._advanceToNextPacket();
    return;
  }

  this._combineLongPacketBuffers();

  var hadException = true;
  try {
    this._onPacket(packetHeader);
    hadException = false;
  } catch (err) {
    if (!err || typeof err.code !== 'string' || err.code.substr(0, 7) !== 'PARSER_') {
      throw err; // Rethrow non-MySQL errors
    }

    // Pass down parser errors
    this._onError(err);
    hadException = false;
  } finally {
    this._advanceToNextPacket();

    // If there was an exception, the parser while loop will be broken out
    // of after the finally block. So schedule a blank write to re-enter it
    // to continue parsing any bytes that may already have been received.
    if (hadException) {
      process.nextTick(this.write.bind(this));
    }
  }
};

Parser.prototype._tryReadPacketHeader = function _tryReadPacketHeader() {
  if (this._packetHeader) {
    return this._packetHeader;
  }

  if (!this._combineNextBuffers(PACKET_HEADER_LENGTH)) {
    return null;
  }

  this._packetHeader = new PacketHeader(
    this.parseUnsignedNumber(3),
    this.parseUnsignedNumber(1)
  );

  if (this._packetHeader.number !== this._nextPacketNumber) {
    var err = new Error(
      'Packets out of order. Got: ' + this._packetHeader.number + ' ' +
      'Expected: ' + this._nextPacketNumber
    );

    err.code  = 'PROTOCOL_PACKETS_OUT_OF_ORDER';
    err.fatal = true;

    this._onError(err);
  }

  this.incrementPacketNumber();

  return this._packetHeader;
};

Parser.prototype._advanceToNextPacket = function() {
  this._offset       = this._packetEnd;
  this._packetHeader = null;
  this._packetEnd    = null;
  this._packetOffset = null;
};


/***/ }),

/***/ 8776:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Parser       = __webpack_require__(9412);
var Sequences    = __webpack_require__(3664);
var Packets      = __webpack_require__(5997);
var Stream       = (__webpack_require__(2781).Stream);
var Util         = __webpack_require__(3837);
var PacketWriter = __webpack_require__(2980);

module.exports = Protocol;
Util.inherits(Protocol, Stream);
function Protocol(options) {
  Stream.call(this);

  options = options || {};

  this.readable = true;
  this.writable = true;

  this._config                        = options.config || {};
  this._connection                    = options.connection;
  this._callback                      = null;
  this._fatalError                    = null;
  this._quitSequence                  = null;
  this._handshake                     = false;
  this._handshaked                    = false;
  this._ended                         = false;
  this._destroyed                     = false;
  this._queue                         = [];
  this._handshakeInitializationPacket = null;

  this._parser = new Parser({
    onError  : this.handleParserError.bind(this),
    onPacket : this._parsePacket.bind(this),
    config   : this._config
  });
}

Protocol.prototype.write = function(buffer) {
  this._parser.write(buffer);
  return true;
};

Protocol.prototype.handshake = function handshake(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = options || {};
  options.config = this._config;

  var sequence = this._enqueue(new Sequences.Handshake(options, callback));

  this._handshake = true;

  return sequence;
};

Protocol.prototype.query = function query(options, callback) {
  return this._enqueue(new Sequences.Query(options, callback));
};

Protocol.prototype.changeUser = function changeUser(options, callback) {
  return this._enqueue(new Sequences.ChangeUser(options, callback));
};

Protocol.prototype.ping = function ping(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  return this._enqueue(new Sequences.Ping(options, callback));
};

Protocol.prototype.stats = function stats(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  return this._enqueue(new Sequences.Statistics(options, callback));
};

Protocol.prototype.quit = function quit(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var self     = this;
  var sequence = this._enqueue(new Sequences.Quit(options, callback));

  sequence.on('end', function () {
    self.end();
  });

  return this._quitSequence = sequence;
};

Protocol.prototype.end = function() {
  if (this._ended) {
    return;
  }
  this._ended = true;

  if (this._quitSequence && (this._quitSequence._ended || this._queue[0] === this._quitSequence)) {
    this._quitSequence.end();
    this.emit('end');
    return;
  }

  var err = new Error('Connection lost: The server closed the connection.');
  err.fatal = true;
  err.code = 'PROTOCOL_CONNECTION_LOST';

  this._delegateError(err);
};

Protocol.prototype.pause = function() {
  this._parser.pause();
  // Since there is a file stream in query, we must transmit pause/resume event to current sequence.
  var seq = this._queue[0];
  if (seq && seq.emit) {
    seq.emit('pause');
  }
};

Protocol.prototype.resume = function() {
  this._parser.resume();
  // Since there is a file stream in query, we must transmit pause/resume event to current sequence.
  var seq = this._queue[0];
  if (seq && seq.emit) {
    seq.emit('resume');
  }
};

Protocol.prototype._enqueue = function(sequence) {
  if (!this._validateEnqueue(sequence)) {
    return sequence;
  }

  if (this._config.trace) {
    // Long stack trace support
    sequence._callSite = sequence._callSite || new Error();
  }

  this._queue.push(sequence);
  this.emit('enqueue', sequence);

  var self = this;
  sequence
    .on('error', function(err) {
      self._delegateError(err, sequence);
    })
    .on('packet', function(packet) {
      sequence._timer.active();
      self._emitPacket(packet);
    })
    .on('timeout', function() {
      var err = new Error(sequence.constructor.name + ' inactivity timeout');

      err.code    = 'PROTOCOL_SEQUENCE_TIMEOUT';
      err.fatal   = true;
      err.timeout = sequence._timeout;

      self._delegateError(err, sequence);
    });

  if (sequence.constructor === Sequences.Handshake) {
    sequence.on('start-tls', function () {
      sequence._timer.active();
      self._connection._startTLS(function(err) {
        if (err) {
          // SSL negotiation error are fatal
          err.code  = 'HANDSHAKE_SSL_ERROR';
          err.fatal = true;
          sequence.end(err);
          return;
        }

        sequence._timer.active();
        sequence._tlsUpgradeCompleteHandler();
      });
    });

    sequence.on('end', function () {
      self._handshaked = true;

      if (!self._fatalError) {
        self.emit('handshake', self._handshakeInitializationPacket);
      }
    });
  }

  sequence.on('end', function () {
    self._dequeue(sequence);
  });

  if (this._queue.length === 1) {
    this._parser.resetPacketNumber();
    this._startSequence(sequence);
  }

  return sequence;
};

Protocol.prototype._validateEnqueue = function _validateEnqueue(sequence) {
  var err;
  var prefix = 'Cannot enqueue ' + sequence.constructor.name;

  if (this._fatalError) {
    err      = new Error(prefix + ' after fatal error.');
    err.code = 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR';
  } else if (this._quitSequence) {
    err      = new Error(prefix + ' after invoking quit.');
    err.code = 'PROTOCOL_ENQUEUE_AFTER_QUIT';
  } else if (this._destroyed) {
    err      = new Error(prefix + ' after being destroyed.');
    err.code = 'PROTOCOL_ENQUEUE_AFTER_DESTROY';
  } else if ((this._handshake || this._handshaked) && sequence.constructor === Sequences.Handshake) {
    err      = new Error(prefix + ' after already enqueuing a Handshake.');
    err.code = 'PROTOCOL_ENQUEUE_HANDSHAKE_TWICE';
  } else {
    return true;
  }

  var self  = this;
  err.fatal = false;

  // add error handler
  sequence.on('error', function (err) {
    self._delegateError(err, sequence);
  });

  process.nextTick(function () {
    sequence.end(err);
  });

  return false;
};

Protocol.prototype._parsePacket = function() {
  var sequence = this._queue[0];

  if (!sequence) {
    var err   = new Error('Received packet with no active sequence.');
    err.code  = 'PROTOCOL_STRAY_PACKET';
    err.fatal = true;

    this._delegateError(err);
    return;
  }

  var Packet     = this._determinePacket(sequence);
  var packet     = new Packet({protocol41: this._config.protocol41});
  var packetName = Packet.name;

  // Special case: Faster dispatch, and parsing done inside sequence
  if (Packet === Packets.RowDataPacket) {
    sequence.RowDataPacket(packet, this._parser, this._connection);

    if (this._config.debug) {
      this._debugPacket(true, packet);
    }

    return;
  }

  if (this._config.debug) {
    this._parsePacketDebug(packet);
  } else {
    packet.parse(this._parser);
  }

  if (Packet === Packets.HandshakeInitializationPacket) {
    this._handshakeInitializationPacket = packet;
    this.emit('initialize', packet);
  }

  sequence._timer.active();

  if (!sequence[packetName]) {
    var err   = new Error('Received packet in the wrong sequence.');
    err.code  = 'PROTOCOL_INCORRECT_PACKET_SEQUENCE';
    err.fatal = true;

    this._delegateError(err);
    return;
  }

  sequence[packetName](packet);
};

Protocol.prototype._parsePacketDebug = function _parsePacketDebug(packet) {
  try {
    packet.parse(this._parser);
  } finally {
    this._debugPacket(true, packet);
  }
};

Protocol.prototype._emitPacket = function(packet) {
  var packetWriter = new PacketWriter();
  packet.write(packetWriter);
  this.emit('data', packetWriter.toBuffer(this._parser));

  if (this._config.debug) {
    this._debugPacket(false, packet);
  }
};

Protocol.prototype._determinePacket = function(sequence) {
  var firstByte = this._parser.peak();

  if (sequence.determinePacket) {
    var Packet = sequence.determinePacket(firstByte, this._parser);
    if (Packet) {
      return Packet;
    }
  }

  switch (firstByte) {
    case 0x00: return Packets.OkPacket;
    case 0xfe: return Packets.EofPacket;
    case 0xff: return Packets.ErrorPacket;
  }

  throw new Error('Could not determine packet, firstByte = ' + firstByte);
};

Protocol.prototype._dequeue = function(sequence) {
  sequence._timer.stop();

  // No point in advancing the queue, we are dead
  if (this._fatalError) {
    return;
  }

  this._queue.shift();

  var sequence = this._queue[0];
  if (!sequence) {
    this.emit('drain');
    return;
  }

  this._parser.resetPacketNumber();

  this._startSequence(sequence);
};

Protocol.prototype._startSequence = function(sequence) {
  if (sequence._timeout > 0 && isFinite(sequence._timeout)) {
    sequence._timer.start(sequence._timeout);
  }

  if (sequence.constructor === Sequences.ChangeUser) {
    sequence.start(this._handshakeInitializationPacket);
  } else {
    sequence.start();
  }
};

Protocol.prototype.handleNetworkError = function(err) {
  err.fatal = true;

  var sequence = this._queue[0];
  if (sequence) {
    sequence.end(err);
  } else {
    this._delegateError(err);
  }
};

Protocol.prototype.handleParserError = function handleParserError(err) {
  var sequence = this._queue[0];
  if (sequence) {
    sequence.end(err);
  } else {
    this._delegateError(err);
  }
};

Protocol.prototype._delegateError = function(err, sequence) {
  // Stop delegating errors after the first fatal error
  if (this._fatalError) {
    return;
  }

  if (err.fatal) {
    this._fatalError = err;
  }

  if (this._shouldErrorBubbleUp(err, sequence)) {
    // Can't use regular 'error' event here as that always destroys the pipe
    // between socket and protocol which is not what we want (unless the
    // exception was fatal).
    this.emit('unhandledError', err);
  } else if (err.fatal) {
    // Send fatal error to all sequences in the queue
    var queue = this._queue;
    process.nextTick(function () {
      queue.forEach(function (sequence) {
        sequence.end(err);
      });
      queue.length = 0;
    });
  }

  // Make sure the stream we are piping to is getting closed
  if (err.fatal) {
    this.emit('end', err);
  }
};

Protocol.prototype._shouldErrorBubbleUp = function(err, sequence) {
  if (sequence) {
    if (sequence.hasErrorHandler()) {
      return false;
    } else if (!err.fatal) {
      return true;
    }
  }

  return (err.fatal && !this._hasPendingErrorHandlers());
};

Protocol.prototype._hasPendingErrorHandlers = function() {
  return this._queue.some(function(sequence) {
    return sequence.hasErrorHandler();
  });
};

Protocol.prototype.destroy = function() {
  this._destroyed = true;
  this._parser.pause();

  if (this._connection.state !== 'disconnected') {
    if (!this._ended) {
      this.end();
    }
  }
};

Protocol.prototype._debugPacket = function(incoming, packet) {
  var connection = this._connection;
  var direction  = incoming
    ? '<--'
    : '-->';
  var packetName = packet.constructor.name;
  var threadId   = connection && connection.threadId !== null
    ? ' (' + connection.threadId + ')'
    : '';

  // check for debug packet restriction
  if (Array.isArray(this._config.debug) && this._config.debug.indexOf(packetName) === -1) {
    return;
  }

  var packetPayload = Util.inspect(packet).replace(/^[^{]+/, '');

  console.log('%s%s %s %s\n', direction, threadId, packetName, packetPayload);
};


/***/ }),

/***/ 8370:
/***/ ((module) => {

module.exports = ResultSet;
function ResultSet(resultSetHeaderPacket) {
  this.resultSetHeaderPacket = resultSetHeaderPacket;
  this.fieldPackets          = [];
  this.eofPackets            = [];
  this.rows                  = [];
}


/***/ }),

/***/ 1976:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(2655);


/***/ }),

/***/ 3822:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Timers = __webpack_require__(9512);

module.exports = Timer;
function Timer(object) {
  this._object  = object;
  this._timeout = null;
}

Timer.prototype.active = function active() {
  if (this._timeout) {
    if (this._timeout.refresh) {
      this._timeout.refresh();
    } else {
      Timers.active(this._timeout);
    }
  }
};

Timer.prototype.start = function start(msecs) {
  this.stop();
  this._timeout = Timers.setTimeout(this._onTimeout.bind(this), msecs);
};

Timer.prototype.stop = function stop() {
  if (this._timeout) {
    Timers.clearTimeout(this._timeout);
    this._timeout = null;
  }
};

Timer.prototype._onTimeout = function _onTimeout() {
  return this._object._onTimeout();
};


/***/ }),

/***/ 2318:
/***/ ((__unused_webpack_module, exports) => {

exports.BIG5_CHINESE_CI              = 1;
exports.LATIN2_CZECH_CS              = 2;
exports.DEC8_SWEDISH_CI              = 3;
exports.CP850_GENERAL_CI             = 4;
exports.LATIN1_GERMAN1_CI            = 5;
exports.HP8_ENGLISH_CI               = 6;
exports.KOI8R_GENERAL_CI             = 7;
exports.LATIN1_SWEDISH_CI            = 8;
exports.LATIN2_GENERAL_CI            = 9;
exports.SWE7_SWEDISH_CI              = 10;
exports.ASCII_GENERAL_CI             = 11;
exports.UJIS_JAPANESE_CI             = 12;
exports.SJIS_JAPANESE_CI             = 13;
exports.CP1251_BULGARIAN_CI          = 14;
exports.LATIN1_DANISH_CI             = 15;
exports.HEBREW_GENERAL_CI            = 16;
exports.TIS620_THAI_CI               = 18;
exports.EUCKR_KOREAN_CI              = 19;
exports.LATIN7_ESTONIAN_CS           = 20;
exports.LATIN2_HUNGARIAN_CI          = 21;
exports.KOI8U_GENERAL_CI             = 22;
exports.CP1251_UKRAINIAN_CI          = 23;
exports.GB2312_CHINESE_CI            = 24;
exports.GREEK_GENERAL_CI             = 25;
exports.CP1250_GENERAL_CI            = 26;
exports.LATIN2_CROATIAN_CI           = 27;
exports.GBK_CHINESE_CI               = 28;
exports.CP1257_LITHUANIAN_CI         = 29;
exports.LATIN5_TURKISH_CI            = 30;
exports.LATIN1_GERMAN2_CI            = 31;
exports.ARMSCII8_GENERAL_CI          = 32;
exports.UTF8_GENERAL_CI              = 33;
exports.CP1250_CZECH_CS              = 34;
exports.UCS2_GENERAL_CI              = 35;
exports.CP866_GENERAL_CI             = 36;
exports.KEYBCS2_GENERAL_CI           = 37;
exports.MACCE_GENERAL_CI             = 38;
exports.MACROMAN_GENERAL_CI          = 39;
exports.CP852_GENERAL_CI             = 40;
exports.LATIN7_GENERAL_CI            = 41;
exports.LATIN7_GENERAL_CS            = 42;
exports.MACCE_BIN                    = 43;
exports.CP1250_CROATIAN_CI           = 44;
exports.UTF8MB4_GENERAL_CI           = 45;
exports.UTF8MB4_BIN                  = 46;
exports.LATIN1_BIN                   = 47;
exports.LATIN1_GENERAL_CI            = 48;
exports.LATIN1_GENERAL_CS            = 49;
exports.CP1251_BIN                   = 50;
exports.CP1251_GENERAL_CI            = 51;
exports.CP1251_GENERAL_CS            = 52;
exports.MACROMAN_BIN                 = 53;
exports.UTF16_GENERAL_CI             = 54;
exports.UTF16_BIN                    = 55;
exports.UTF16LE_GENERAL_CI           = 56;
exports.CP1256_GENERAL_CI            = 57;
exports.CP1257_BIN                   = 58;
exports.CP1257_GENERAL_CI            = 59;
exports.UTF32_GENERAL_CI             = 60;
exports.UTF32_BIN                    = 61;
exports.UTF16LE_BIN                  = 62;
exports.BINARY                       = 63;
exports.ARMSCII8_BIN                 = 64;
exports.ASCII_BIN                    = 65;
exports.CP1250_BIN                   = 66;
exports.CP1256_BIN                   = 67;
exports.CP866_BIN                    = 68;
exports.DEC8_BIN                     = 69;
exports.GREEK_BIN                    = 70;
exports.HEBREW_BIN                   = 71;
exports.HP8_BIN                      = 72;
exports.KEYBCS2_BIN                  = 73;
exports.KOI8R_BIN                    = 74;
exports.KOI8U_BIN                    = 75;
exports.LATIN2_BIN                   = 77;
exports.LATIN5_BIN                   = 78;
exports.LATIN7_BIN                   = 79;
exports.CP850_BIN                    = 80;
exports.CP852_BIN                    = 81;
exports.SWE7_BIN                     = 82;
exports.UTF8_BIN                     = 83;
exports.BIG5_BIN                     = 84;
exports.EUCKR_BIN                    = 85;
exports.GB2312_BIN                   = 86;
exports.GBK_BIN                      = 87;
exports.SJIS_BIN                     = 88;
exports.TIS620_BIN                   = 89;
exports.UCS2_BIN                     = 90;
exports.UJIS_BIN                     = 91;
exports.GEOSTD8_GENERAL_CI           = 92;
exports.GEOSTD8_BIN                  = 93;
exports.LATIN1_SPANISH_CI            = 94;
exports.CP932_JAPANESE_CI            = 95;
exports.CP932_BIN                    = 96;
exports.EUCJPMS_JAPANESE_CI          = 97;
exports.EUCJPMS_BIN                  = 98;
exports.CP1250_POLISH_CI             = 99;
exports.UTF16_UNICODE_CI             = 101;
exports.UTF16_ICELANDIC_CI           = 102;
exports.UTF16_LATVIAN_CI             = 103;
exports.UTF16_ROMANIAN_CI            = 104;
exports.UTF16_SLOVENIAN_CI           = 105;
exports.UTF16_POLISH_CI              = 106;
exports.UTF16_ESTONIAN_CI            = 107;
exports.UTF16_SPANISH_CI             = 108;
exports.UTF16_SWEDISH_CI             = 109;
exports.UTF16_TURKISH_CI             = 110;
exports.UTF16_CZECH_CI               = 111;
exports.UTF16_DANISH_CI              = 112;
exports.UTF16_LITHUANIAN_CI          = 113;
exports.UTF16_SLOVAK_CI              = 114;
exports.UTF16_SPANISH2_CI            = 115;
exports.UTF16_ROMAN_CI               = 116;
exports.UTF16_PERSIAN_CI             = 117;
exports.UTF16_ESPERANTO_CI           = 118;
exports.UTF16_HUNGARIAN_CI           = 119;
exports.UTF16_SINHALA_CI             = 120;
exports.UTF16_GERMAN2_CI             = 121;
exports.UTF16_CROATIAN_MYSQL561_CI   = 122;
exports.UTF16_UNICODE_520_CI         = 123;
exports.UTF16_VIETNAMESE_CI          = 124;
exports.UCS2_UNICODE_CI              = 128;
exports.UCS2_ICELANDIC_CI            = 129;
exports.UCS2_LATVIAN_CI              = 130;
exports.UCS2_ROMANIAN_CI             = 131;
exports.UCS2_SLOVENIAN_CI            = 132;
exports.UCS2_POLISH_CI               = 133;
exports.UCS2_ESTONIAN_CI             = 134;
exports.UCS2_SPANISH_CI              = 135;
exports.UCS2_SWEDISH_CI              = 136;
exports.UCS2_TURKISH_CI              = 137;
exports.UCS2_CZECH_CI                = 138;
exports.UCS2_DANISH_CI               = 139;
exports.UCS2_LITHUANIAN_CI           = 140;
exports.UCS2_SLOVAK_CI               = 141;
exports.UCS2_SPANISH2_CI             = 142;
exports.UCS2_ROMAN_CI                = 143;
exports.UCS2_PERSIAN_CI              = 144;
exports.UCS2_ESPERANTO_CI            = 145;
exports.UCS2_HUNGARIAN_CI            = 146;
exports.UCS2_SINHALA_CI              = 147;
exports.UCS2_GERMAN2_CI              = 148;
exports.UCS2_CROATIAN_MYSQL561_CI    = 149;
exports.UCS2_UNICODE_520_CI          = 150;
exports.UCS2_VIETNAMESE_CI           = 151;
exports.UCS2_GENERAL_MYSQL500_CI     = 159;
exports.UTF32_UNICODE_CI             = 160;
exports.UTF32_ICELANDIC_CI           = 161;
exports.UTF32_LATVIAN_CI             = 162;
exports.UTF32_ROMANIAN_CI            = 163;
exports.UTF32_SLOVENIAN_CI           = 164;
exports.UTF32_POLISH_CI              = 165;
exports.UTF32_ESTONIAN_CI            = 166;
exports.UTF32_SPANISH_CI             = 167;
exports.UTF32_SWEDISH_CI             = 168;
exports.UTF32_TURKISH_CI             = 169;
exports.UTF32_CZECH_CI               = 170;
exports.UTF32_DANISH_CI              = 171;
exports.UTF32_LITHUANIAN_CI          = 172;
exports.UTF32_SLOVAK_CI              = 173;
exports.UTF32_SPANISH2_CI            = 174;
exports.UTF32_ROMAN_CI               = 175;
exports.UTF32_PERSIAN_CI             = 176;
exports.UTF32_ESPERANTO_CI           = 177;
exports.UTF32_HUNGARIAN_CI           = 178;
exports.UTF32_SINHALA_CI             = 179;
exports.UTF32_GERMAN2_CI             = 180;
exports.UTF32_CROATIAN_MYSQL561_CI   = 181;
exports.UTF32_UNICODE_520_CI         = 182;
exports.UTF32_VIETNAMESE_CI          = 183;
exports.UTF8_UNICODE_CI              = 192;
exports.UTF8_ICELANDIC_CI            = 193;
exports.UTF8_LATVIAN_CI              = 194;
exports.UTF8_ROMANIAN_CI             = 195;
exports.UTF8_SLOVENIAN_CI            = 196;
exports.UTF8_POLISH_CI               = 197;
exports.UTF8_ESTONIAN_CI             = 198;
exports.UTF8_SPANISH_CI              = 199;
exports.UTF8_SWEDISH_CI              = 200;
exports.UTF8_TURKISH_CI              = 201;
exports.UTF8_CZECH_CI                = 202;
exports.UTF8_DANISH_CI               = 203;
exports.UTF8_LITHUANIAN_CI           = 204;
exports.UTF8_SLOVAK_CI               = 205;
exports.UTF8_SPANISH2_CI             = 206;
exports.UTF8_ROMAN_CI                = 207;
exports.UTF8_PERSIAN_CI              = 208;
exports.UTF8_ESPERANTO_CI            = 209;
exports.UTF8_HUNGARIAN_CI            = 210;
exports.UTF8_SINHALA_CI              = 211;
exports.UTF8_GERMAN2_CI              = 212;
exports.UTF8_CROATIAN_MYSQL561_CI    = 213;
exports.UTF8_UNICODE_520_CI          = 214;
exports.UTF8_VIETNAMESE_CI           = 215;
exports.UTF8_GENERAL_MYSQL500_CI     = 223;
exports.UTF8MB4_UNICODE_CI           = 224;
exports.UTF8MB4_ICELANDIC_CI         = 225;
exports.UTF8MB4_LATVIAN_CI           = 226;
exports.UTF8MB4_ROMANIAN_CI          = 227;
exports.UTF8MB4_SLOVENIAN_CI         = 228;
exports.UTF8MB4_POLISH_CI            = 229;
exports.UTF8MB4_ESTONIAN_CI          = 230;
exports.UTF8MB4_SPANISH_CI           = 231;
exports.UTF8MB4_SWEDISH_CI           = 232;
exports.UTF8MB4_TURKISH_CI           = 233;
exports.UTF8MB4_CZECH_CI             = 234;
exports.UTF8MB4_DANISH_CI            = 235;
exports.UTF8MB4_LITHUANIAN_CI        = 236;
exports.UTF8MB4_SLOVAK_CI            = 237;
exports.UTF8MB4_SPANISH2_CI          = 238;
exports.UTF8MB4_ROMAN_CI             = 239;
exports.UTF8MB4_PERSIAN_CI           = 240;
exports.UTF8MB4_ESPERANTO_CI         = 241;
exports.UTF8MB4_HUNGARIAN_CI         = 242;
exports.UTF8MB4_SINHALA_CI           = 243;
exports.UTF8MB4_GERMAN2_CI           = 244;
exports.UTF8MB4_CROATIAN_MYSQL561_CI = 245;
exports.UTF8MB4_UNICODE_520_CI       = 246;
exports.UTF8MB4_VIETNAMESE_CI        = 247;
exports.UTF8_GENERAL50_CI            = 253;

// short aliases
exports.ARMSCII8 = exports.ARMSCII8_GENERAL_CI;
exports.ASCII    = exports.ASCII_GENERAL_CI;
exports.BIG5     = exports.BIG5_CHINESE_CI;
exports.BINARY   = exports.BINARY;
exports.CP1250   = exports.CP1250_GENERAL_CI;
exports.CP1251   = exports.CP1251_GENERAL_CI;
exports.CP1256   = exports.CP1256_GENERAL_CI;
exports.CP1257   = exports.CP1257_GENERAL_CI;
exports.CP866    = exports.CP866_GENERAL_CI;
exports.CP850    = exports.CP850_GENERAL_CI;
exports.CP852    = exports.CP852_GENERAL_CI;
exports.CP932    = exports.CP932_JAPANESE_CI;
exports.DEC8     = exports.DEC8_SWEDISH_CI;
exports.EUCJPMS  = exports.EUCJPMS_JAPANESE_CI;
exports.EUCKR    = exports.EUCKR_KOREAN_CI;
exports.GB2312   = exports.GB2312_CHINESE_CI;
exports.GBK      = exports.GBK_CHINESE_CI;
exports.GEOSTD8  = exports.GEOSTD8_GENERAL_CI;
exports.GREEK    = exports.GREEK_GENERAL_CI;
exports.HEBREW   = exports.HEBREW_GENERAL_CI;
exports.HP8      = exports.HP8_ENGLISH_CI;
exports.KEYBCS2  = exports.KEYBCS2_GENERAL_CI;
exports.KOI8R    = exports.KOI8R_GENERAL_CI;
exports.KOI8U    = exports.KOI8U_GENERAL_CI;
exports.LATIN1   = exports.LATIN1_SWEDISH_CI;
exports.LATIN2   = exports.LATIN2_GENERAL_CI;
exports.LATIN5   = exports.LATIN5_TURKISH_CI;
exports.LATIN7   = exports.LATIN7_GENERAL_CI;
exports.MACCE    = exports.MACCE_GENERAL_CI;
exports.MACROMAN = exports.MACROMAN_GENERAL_CI;
exports.SJIS     = exports.SJIS_JAPANESE_CI;
exports.SWE7     = exports.SWE7_SWEDISH_CI;
exports.TIS620   = exports.TIS620_THAI_CI;
exports.UCS2     = exports.UCS2_GENERAL_CI;
exports.UJIS     = exports.UJIS_JAPANESE_CI;
exports.UTF16    = exports.UTF16_GENERAL_CI;
exports.UTF16LE  = exports.UTF16LE_GENERAL_CI;
exports.UTF8     = exports.UTF8_GENERAL_CI;
exports.UTF8MB4  = exports.UTF8MB4_GENERAL_CI;
exports.UTF32    = exports.UTF32_GENERAL_CI;


/***/ }),

/***/ 3778:
/***/ ((__unused_webpack_module, exports) => {

// Manually extracted from mysql-5.5.23/include/mysql_com.h
exports.CLIENT_LONG_PASSWORD     = 1; /* new more secure passwords */
exports.CLIENT_FOUND_ROWS        = 2; /* Found instead of affected rows */
exports.CLIENT_LONG_FLAG         = 4; /* Get all column flags */
exports.CLIENT_CONNECT_WITH_DB   = 8; /* One can specify db on connect */
exports.CLIENT_NO_SCHEMA         = 16; /* Don't allow database.table.column */
exports.CLIENT_COMPRESS          = 32; /* Can use compression protocol */
exports.CLIENT_ODBC              = 64; /* Odbc client */
exports.CLIENT_LOCAL_FILES       = 128; /* Can use LOAD DATA LOCAL */
exports.CLIENT_IGNORE_SPACE      = 256; /* Ignore spaces before '(' */
exports.CLIENT_PROTOCOL_41       = 512; /* New 4.1 protocol */
exports.CLIENT_INTERACTIVE       = 1024; /* This is an interactive client */
exports.CLIENT_SSL               = 2048; /* Switch to SSL after handshake */
exports.CLIENT_IGNORE_SIGPIPE    = 4096;    /* IGNORE sigpipes */
exports.CLIENT_TRANSACTIONS      = 8192; /* Client knows about transactions */
exports.CLIENT_RESERVED          = 16384;   /* Old flag for 4.1 protocol  */
exports.CLIENT_SECURE_CONNECTION = 32768;  /* New 4.1 authentication */

exports.CLIENT_MULTI_STATEMENTS = 65536; /* Enable/disable multi-stmt support */
exports.CLIENT_MULTI_RESULTS    = 131072; /* Enable/disable multi-results */
exports.CLIENT_PS_MULTI_RESULTS = 262144; /* Multi-results in PS-protocol */

exports.CLIENT_PLUGIN_AUTH = 524288; /* Client supports plugin authentication */

exports.CLIENT_SSL_VERIFY_SERVER_CERT = 1073741824;
exports.CLIENT_REMEMBER_OPTIONS       = 2147483648;


/***/ }),

/***/ 9253:
/***/ ((__unused_webpack_module, exports) => {

/**
 * MySQL error constants
 *
 * Extracted from version 5.7.29
 *
 * !! Generated by generate-error-constants.js, do not modify by hand !!
 */

exports.EE_CANTCREATEFILE                                                                = 1;
exports.EE_READ                                                                          = 2;
exports.EE_WRITE                                                                         = 3;
exports.EE_BADCLOSE                                                                      = 4;
exports.EE_OUTOFMEMORY                                                                   = 5;
exports.EE_DELETE                                                                        = 6;
exports.EE_LINK                                                                          = 7;
exports.EE_EOFERR                                                                        = 9;
exports.EE_CANTLOCK                                                                      = 10;
exports.EE_CANTUNLOCK                                                                    = 11;
exports.EE_DIR                                                                           = 12;
exports.EE_STAT                                                                          = 13;
exports.EE_CANT_CHSIZE                                                                   = 14;
exports.EE_CANT_OPEN_STREAM                                                              = 15;
exports.EE_GETWD                                                                         = 16;
exports.EE_SETWD                                                                         = 17;
exports.EE_LINK_WARNING                                                                  = 18;
exports.EE_OPEN_WARNING                                                                  = 19;
exports.EE_DISK_FULL                                                                     = 20;
exports.EE_CANT_MKDIR                                                                    = 21;
exports.EE_UNKNOWN_CHARSET                                                               = 22;
exports.EE_OUT_OF_FILERESOURCES                                                          = 23;
exports.EE_CANT_READLINK                                                                 = 24;
exports.EE_CANT_SYMLINK                                                                  = 25;
exports.EE_REALPATH                                                                      = 26;
exports.EE_SYNC                                                                          = 27;
exports.EE_UNKNOWN_COLLATION                                                             = 28;
exports.EE_FILENOTFOUND                                                                  = 29;
exports.EE_FILE_NOT_CLOSED                                                               = 30;
exports.EE_CHANGE_OWNERSHIP                                                              = 31;
exports.EE_CHANGE_PERMISSIONS                                                            = 32;
exports.EE_CANT_SEEK                                                                     = 33;
exports.EE_CAPACITY_EXCEEDED                                                             = 34;
exports.HA_ERR_KEY_NOT_FOUND                                                             = 120;
exports.HA_ERR_FOUND_DUPP_KEY                                                            = 121;
exports.HA_ERR_INTERNAL_ERROR                                                            = 122;
exports.HA_ERR_RECORD_CHANGED                                                            = 123;
exports.HA_ERR_WRONG_INDEX                                                               = 124;
exports.HA_ERR_CRASHED                                                                   = 126;
exports.HA_ERR_WRONG_IN_RECORD                                                           = 127;
exports.HA_ERR_OUT_OF_MEM                                                                = 128;
exports.HA_ERR_NOT_A_TABLE                                                               = 130;
exports.HA_ERR_WRONG_COMMAND                                                             = 131;
exports.HA_ERR_OLD_FILE                                                                  = 132;
exports.HA_ERR_NO_ACTIVE_RECORD                                                          = 133;
exports.HA_ERR_RECORD_DELETED                                                            = 134;
exports.HA_ERR_RECORD_FILE_FULL                                                          = 135;
exports.HA_ERR_INDEX_FILE_FULL                                                           = 136;
exports.HA_ERR_END_OF_FILE                                                               = 137;
exports.HA_ERR_UNSUPPORTED                                                               = 138;
exports.HA_ERR_TOO_BIG_ROW                                                               = 139;
exports.HA_WRONG_CREATE_OPTION                                                           = 140;
exports.HA_ERR_FOUND_DUPP_UNIQUE                                                         = 141;
exports.HA_ERR_UNKNOWN_CHARSET                                                           = 142;
exports.HA_ERR_WRONG_MRG_TABLE_DEF                                                       = 143;
exports.HA_ERR_CRASHED_ON_REPAIR                                                         = 144;
exports.HA_ERR_CRASHED_ON_USAGE                                                          = 145;
exports.HA_ERR_LOCK_WAIT_TIMEOUT                                                         = 146;
exports.HA_ERR_LOCK_TABLE_FULL                                                           = 147;
exports.HA_ERR_READ_ONLY_TRANSACTION                                                     = 148;
exports.HA_ERR_LOCK_DEADLOCK                                                             = 149;
exports.HA_ERR_CANNOT_ADD_FOREIGN                                                        = 150;
exports.HA_ERR_NO_REFERENCED_ROW                                                         = 151;
exports.HA_ERR_ROW_IS_REFERENCED                                                         = 152;
exports.HA_ERR_NO_SAVEPOINT                                                              = 153;
exports.HA_ERR_NON_UNIQUE_BLOCK_SIZE                                                     = 154;
exports.HA_ERR_NO_SUCH_TABLE                                                             = 155;
exports.HA_ERR_TABLE_EXIST                                                               = 156;
exports.HA_ERR_NO_CONNECTION                                                             = 157;
exports.HA_ERR_NULL_IN_SPATIAL                                                           = 158;
exports.HA_ERR_TABLE_DEF_CHANGED                                                         = 159;
exports.HA_ERR_NO_PARTITION_FOUND                                                        = 160;
exports.HA_ERR_RBR_LOGGING_FAILED                                                        = 161;
exports.HA_ERR_DROP_INDEX_FK                                                             = 162;
exports.HA_ERR_FOREIGN_DUPLICATE_KEY                                                     = 163;
exports.HA_ERR_TABLE_NEEDS_UPGRADE                                                       = 164;
exports.HA_ERR_TABLE_READONLY                                                            = 165;
exports.HA_ERR_AUTOINC_READ_FAILED                                                       = 166;
exports.HA_ERR_AUTOINC_ERANGE                                                            = 167;
exports.HA_ERR_GENERIC                                                                   = 168;
exports.HA_ERR_RECORD_IS_THE_SAME                                                        = 169;
exports.HA_ERR_LOGGING_IMPOSSIBLE                                                        = 170;
exports.HA_ERR_CORRUPT_EVENT                                                             = 171;
exports.HA_ERR_NEW_FILE                                                                  = 172;
exports.HA_ERR_ROWS_EVENT_APPLY                                                          = 173;
exports.HA_ERR_INITIALIZATION                                                            = 174;
exports.HA_ERR_FILE_TOO_SHORT                                                            = 175;
exports.HA_ERR_WRONG_CRC                                                                 = 176;
exports.HA_ERR_TOO_MANY_CONCURRENT_TRXS                                                  = 177;
exports.HA_ERR_NOT_IN_LOCK_PARTITIONS                                                    = 178;
exports.HA_ERR_INDEX_COL_TOO_LONG                                                        = 179;
exports.HA_ERR_INDEX_CORRUPT                                                             = 180;
exports.HA_ERR_UNDO_REC_TOO_BIG                                                          = 181;
exports.HA_FTS_INVALID_DOCID                                                             = 182;
exports.HA_ERR_TABLE_IN_FK_CHECK                                                         = 183;
exports.HA_ERR_TABLESPACE_EXISTS                                                         = 184;
exports.HA_ERR_TOO_MANY_FIELDS                                                           = 185;
exports.HA_ERR_ROW_IN_WRONG_PARTITION                                                    = 186;
exports.HA_ERR_INNODB_READ_ONLY                                                          = 187;
exports.HA_ERR_FTS_EXCEED_RESULT_CACHE_LIMIT                                             = 188;
exports.HA_ERR_TEMP_FILE_WRITE_FAILURE                                                   = 189;
exports.HA_ERR_INNODB_FORCED_RECOVERY                                                    = 190;
exports.HA_ERR_FTS_TOO_MANY_WORDS_IN_PHRASE                                              = 191;
exports.HA_ERR_FK_DEPTH_EXCEEDED                                                         = 192;
exports.HA_MISSING_CREATE_OPTION                                                         = 193;
exports.HA_ERR_SE_OUT_OF_MEMORY                                                          = 194;
exports.HA_ERR_TABLE_CORRUPT                                                             = 195;
exports.HA_ERR_QUERY_INTERRUPTED                                                         = 196;
exports.HA_ERR_TABLESPACE_MISSING                                                        = 197;
exports.HA_ERR_TABLESPACE_IS_NOT_EMPTY                                                   = 198;
exports.HA_ERR_WRONG_FILE_NAME                                                           = 199;
exports.HA_ERR_NOT_ALLOWED_COMMAND                                                       = 200;
exports.HA_ERR_COMPUTE_FAILED                                                            = 201;
exports.ER_HASHCHK                                                                       = 1000;
exports.ER_NISAMCHK                                                                      = 1001;
exports.ER_NO                                                                            = 1002;
exports.ER_YES                                                                           = 1003;
exports.ER_CANT_CREATE_FILE                                                              = 1004;
exports.ER_CANT_CREATE_TABLE                                                             = 1005;
exports.ER_CANT_CREATE_DB                                                                = 1006;
exports.ER_DB_CREATE_EXISTS                                                              = 1007;
exports.ER_DB_DROP_EXISTS                                                                = 1008;
exports.ER_DB_DROP_DELETE                                                                = 1009;
exports.ER_DB_DROP_RMDIR                                                                 = 1010;
exports.ER_CANT_DELETE_FILE                                                              = 1011;
exports.ER_CANT_FIND_SYSTEM_REC                                                          = 1012;
exports.ER_CANT_GET_STAT                                                                 = 1013;
exports.ER_CANT_GET_WD                                                                   = 1014;
exports.ER_CANT_LOCK                                                                     = 1015;
exports.ER_CANT_OPEN_FILE                                                                = 1016;
exports.ER_FILE_NOT_FOUND                                                                = 1017;
exports.ER_CANT_READ_DIR                                                                 = 1018;
exports.ER_CANT_SET_WD                                                                   = 1019;
exports.ER_CHECKREAD                                                                     = 1020;
exports.ER_DISK_FULL                                                                     = 1021;
exports.ER_DUP_KEY                                                                       = 1022;
exports.ER_ERROR_ON_CLOSE                                                                = 1023;
exports.ER_ERROR_ON_READ                                                                 = 1024;
exports.ER_ERROR_ON_RENAME                                                               = 1025;
exports.ER_ERROR_ON_WRITE                                                                = 1026;
exports.ER_FILE_USED                                                                     = 1027;
exports.ER_FILSORT_ABORT                                                                 = 1028;
exports.ER_FORM_NOT_FOUND                                                                = 1029;
exports.ER_GET_ERRNO                                                                     = 1030;
exports.ER_ILLEGAL_HA                                                                    = 1031;
exports.ER_KEY_NOT_FOUND                                                                 = 1032;
exports.ER_NOT_FORM_FILE                                                                 = 1033;
exports.ER_NOT_KEYFILE                                                                   = 1034;
exports.ER_OLD_KEYFILE                                                                   = 1035;
exports.ER_OPEN_AS_READONLY                                                              = 1036;
exports.ER_OUTOFMEMORY                                                                   = 1037;
exports.ER_OUT_OF_SORTMEMORY                                                             = 1038;
exports.ER_UNEXPECTED_EOF                                                                = 1039;
exports.ER_CON_COUNT_ERROR                                                               = 1040;
exports.ER_OUT_OF_RESOURCES                                                              = 1041;
exports.ER_BAD_HOST_ERROR                                                                = 1042;
exports.ER_HANDSHAKE_ERROR                                                               = 1043;
exports.ER_DBACCESS_DENIED_ERROR                                                         = 1044;
exports.ER_ACCESS_DENIED_ERROR                                                           = 1045;
exports.ER_NO_DB_ERROR                                                                   = 1046;
exports.ER_UNKNOWN_COM_ERROR                                                             = 1047;
exports.ER_BAD_NULL_ERROR                                                                = 1048;
exports.ER_BAD_DB_ERROR                                                                  = 1049;
exports.ER_TABLE_EXISTS_ERROR                                                            = 1050;
exports.ER_BAD_TABLE_ERROR                                                               = 1051;
exports.ER_NON_UNIQ_ERROR                                                                = 1052;
exports.ER_SERVER_SHUTDOWN                                                               = 1053;
exports.ER_BAD_FIELD_ERROR                                                               = 1054;
exports.ER_WRONG_FIELD_WITH_GROUP                                                        = 1055;
exports.ER_WRONG_GROUP_FIELD                                                             = 1056;
exports.ER_WRONG_SUM_SELECT                                                              = 1057;
exports.ER_WRONG_VALUE_COUNT                                                             = 1058;
exports.ER_TOO_LONG_IDENT                                                                = 1059;
exports.ER_DUP_FIELDNAME                                                                 = 1060;
exports.ER_DUP_KEYNAME                                                                   = 1061;
exports.ER_DUP_ENTRY                                                                     = 1062;
exports.ER_WRONG_FIELD_SPEC                                                              = 1063;
exports.ER_PARSE_ERROR                                                                   = 1064;
exports.ER_EMPTY_QUERY                                                                   = 1065;
exports.ER_NONUNIQ_TABLE                                                                 = 1066;
exports.ER_INVALID_DEFAULT                                                               = 1067;
exports.ER_MULTIPLE_PRI_KEY                                                              = 1068;
exports.ER_TOO_MANY_KEYS                                                                 = 1069;
exports.ER_TOO_MANY_KEY_PARTS                                                            = 1070;
exports.ER_TOO_LONG_KEY                                                                  = 1071;
exports.ER_KEY_COLUMN_DOES_NOT_EXITS                                                     = 1072;
exports.ER_BLOB_USED_AS_KEY                                                              = 1073;
exports.ER_TOO_BIG_FIELDLENGTH                                                           = 1074;
exports.ER_WRONG_AUTO_KEY                                                                = 1075;
exports.ER_READY                                                                         = 1076;
exports.ER_NORMAL_SHUTDOWN                                                               = 1077;
exports.ER_GOT_SIGNAL                                                                    = 1078;
exports.ER_SHUTDOWN_COMPLETE                                                             = 1079;
exports.ER_FORCING_CLOSE                                                                 = 1080;
exports.ER_IPSOCK_ERROR                                                                  = 1081;
exports.ER_NO_SUCH_INDEX                                                                 = 1082;
exports.ER_WRONG_FIELD_TERMINATORS                                                       = 1083;
exports.ER_BLOBS_AND_NO_TERMINATED                                                       = 1084;
exports.ER_TEXTFILE_NOT_READABLE                                                         = 1085;
exports.ER_FILE_EXISTS_ERROR                                                             = 1086;
exports.ER_LOAD_INFO                                                                     = 1087;
exports.ER_ALTER_INFO                                                                    = 1088;
exports.ER_WRONG_SUB_KEY                                                                 = 1089;
exports.ER_CANT_REMOVE_ALL_FIELDS                                                        = 1090;
exports.ER_CANT_DROP_FIELD_OR_KEY                                                        = 1091;
exports.ER_INSERT_INFO                                                                   = 1092;
exports.ER_UPDATE_TABLE_USED                                                             = 1093;
exports.ER_NO_SUCH_THREAD                                                                = 1094;
exports.ER_KILL_DENIED_ERROR                                                             = 1095;
exports.ER_NO_TABLES_USED                                                                = 1096;
exports.ER_TOO_BIG_SET                                                                   = 1097;
exports.ER_NO_UNIQUE_LOGFILE                                                             = 1098;
exports.ER_TABLE_NOT_LOCKED_FOR_WRITE                                                    = 1099;
exports.ER_TABLE_NOT_LOCKED                                                              = 1100;
exports.ER_BLOB_CANT_HAVE_DEFAULT                                                        = 1101;
exports.ER_WRONG_DB_NAME                                                                 = 1102;
exports.ER_WRONG_TABLE_NAME                                                              = 1103;
exports.ER_TOO_BIG_SELECT                                                                = 1104;
exports.ER_UNKNOWN_ERROR                                                                 = 1105;
exports.ER_UNKNOWN_PROCEDURE                                                             = 1106;
exports.ER_WRONG_PARAMCOUNT_TO_PROCEDURE                                                 = 1107;
exports.ER_WRONG_PARAMETERS_TO_PROCEDURE                                                 = 1108;
exports.ER_UNKNOWN_TABLE                                                                 = 1109;
exports.ER_FIELD_SPECIFIED_TWICE                                                         = 1110;
exports.ER_INVALID_GROUP_FUNC_USE                                                        = 1111;
exports.ER_UNSUPPORTED_EXTENSION                                                         = 1112;
exports.ER_TABLE_MUST_HAVE_COLUMNS                                                       = 1113;
exports.ER_RECORD_FILE_FULL                                                              = 1114;
exports.ER_UNKNOWN_CHARACTER_SET                                                         = 1115;
exports.ER_TOO_MANY_TABLES                                                               = 1116;
exports.ER_TOO_MANY_FIELDS                                                               = 1117;
exports.ER_TOO_BIG_ROWSIZE                                                               = 1118;
exports.ER_STACK_OVERRUN                                                                 = 1119;
exports.ER_WRONG_OUTER_JOIN                                                              = 1120;
exports.ER_NULL_COLUMN_IN_INDEX                                                          = 1121;
exports.ER_CANT_FIND_UDF                                                                 = 1122;
exports.ER_CANT_INITIALIZE_UDF                                                           = 1123;
exports.ER_UDF_NO_PATHS                                                                  = 1124;
exports.ER_UDF_EXISTS                                                                    = 1125;
exports.ER_CANT_OPEN_LIBRARY                                                             = 1126;
exports.ER_CANT_FIND_DL_ENTRY                                                            = 1127;
exports.ER_FUNCTION_NOT_DEFINED                                                          = 1128;
exports.ER_HOST_IS_BLOCKED                                                               = 1129;
exports.ER_HOST_NOT_PRIVILEGED                                                           = 1130;
exports.ER_PASSWORD_ANONYMOUS_USER                                                       = 1131;
exports.ER_PASSWORD_NOT_ALLOWED                                                          = 1132;
exports.ER_PASSWORD_NO_MATCH                                                             = 1133;
exports.ER_UPDATE_INFO                                                                   = 1134;
exports.ER_CANT_CREATE_THREAD                                                            = 1135;
exports.ER_WRONG_VALUE_COUNT_ON_ROW                                                      = 1136;
exports.ER_CANT_REOPEN_TABLE                                                             = 1137;
exports.ER_INVALID_USE_OF_NULL                                                           = 1138;
exports.ER_REGEXP_ERROR                                                                  = 1139;
exports.ER_MIX_OF_GROUP_FUNC_AND_FIELDS                                                  = 1140;
exports.ER_NONEXISTING_GRANT                                                             = 1141;
exports.ER_TABLEACCESS_DENIED_ERROR                                                      = 1142;
exports.ER_COLUMNACCESS_DENIED_ERROR                                                     = 1143;
exports.ER_ILLEGAL_GRANT_FOR_TABLE                                                       = 1144;
exports.ER_GRANT_WRONG_HOST_OR_USER                                                      = 1145;
exports.ER_NO_SUCH_TABLE                                                                 = 1146;
exports.ER_NONEXISTING_TABLE_GRANT                                                       = 1147;
exports.ER_NOT_ALLOWED_COMMAND                                                           = 1148;
exports.ER_SYNTAX_ERROR                                                                  = 1149;
exports.ER_DELAYED_CANT_CHANGE_LOCK                                                      = 1150;
exports.ER_TOO_MANY_DELAYED_THREADS                                                      = 1151;
exports.ER_ABORTING_CONNECTION                                                           = 1152;
exports.ER_NET_PACKET_TOO_LARGE                                                          = 1153;
exports.ER_NET_READ_ERROR_FROM_PIPE                                                      = 1154;
exports.ER_NET_FCNTL_ERROR                                                               = 1155;
exports.ER_NET_PACKETS_OUT_OF_ORDER                                                      = 1156;
exports.ER_NET_UNCOMPRESS_ERROR                                                          = 1157;
exports.ER_NET_READ_ERROR                                                                = 1158;
exports.ER_NET_READ_INTERRUPTED                                                          = 1159;
exports.ER_NET_ERROR_ON_WRITE                                                            = 1160;
exports.ER_NET_WRITE_INTERRUPTED                                                         = 1161;
exports.ER_TOO_LONG_STRING                                                               = 1162;
exports.ER_TABLE_CANT_HANDLE_BLOB                                                        = 1163;
exports.ER_TABLE_CANT_HANDLE_AUTO_INCREMENT                                              = 1164;
exports.ER_DELAYED_INSERT_TABLE_LOCKED                                                   = 1165;
exports.ER_WRONG_COLUMN_NAME                                                             = 1166;
exports.ER_WRONG_KEY_COLUMN                                                              = 1167;
exports.ER_WRONG_MRG_TABLE                                                               = 1168;
exports.ER_DUP_UNIQUE                                                                    = 1169;
exports.ER_BLOB_KEY_WITHOUT_LENGTH                                                       = 1170;
exports.ER_PRIMARY_CANT_HAVE_NULL                                                        = 1171;
exports.ER_TOO_MANY_ROWS                                                                 = 1172;
exports.ER_REQUIRES_PRIMARY_KEY                                                          = 1173;
exports.ER_NO_RAID_COMPILED                                                              = 1174;
exports.ER_UPDATE_WITHOUT_KEY_IN_SAFE_MODE                                               = 1175;
exports.ER_KEY_DOES_NOT_EXITS                                                            = 1176;
exports.ER_CHECK_NO_SUCH_TABLE                                                           = 1177;
exports.ER_CHECK_NOT_IMPLEMENTED                                                         = 1178;
exports.ER_CANT_DO_THIS_DURING_AN_TRANSACTION                                            = 1179;
exports.ER_ERROR_DURING_COMMIT                                                           = 1180;
exports.ER_ERROR_DURING_ROLLBACK                                                         = 1181;
exports.ER_ERROR_DURING_FLUSH_LOGS                                                       = 1182;
exports.ER_ERROR_DURING_CHECKPOINT                                                       = 1183;
exports.ER_NEW_ABORTING_CONNECTION                                                       = 1184;
exports.ER_DUMP_NOT_IMPLEMENTED                                                          = 1185;
exports.ER_FLUSH_MASTER_BINLOG_CLOSED                                                    = 1186;
exports.ER_INDEX_REBUILD                                                                 = 1187;
exports.ER_MASTER                                                                        = 1188;
exports.ER_MASTER_NET_READ                                                               = 1189;
exports.ER_MASTER_NET_WRITE                                                              = 1190;
exports.ER_FT_MATCHING_KEY_NOT_FOUND                                                     = 1191;
exports.ER_LOCK_OR_ACTIVE_TRANSACTION                                                    = 1192;
exports.ER_UNKNOWN_SYSTEM_VARIABLE                                                       = 1193;
exports.ER_CRASHED_ON_USAGE                                                              = 1194;
exports.ER_CRASHED_ON_REPAIR                                                             = 1195;
exports.ER_WARNING_NOT_COMPLETE_ROLLBACK                                                 = 1196;
exports.ER_TRANS_CACHE_FULL                                                              = 1197;
exports.ER_SLAVE_MUST_STOP                                                               = 1198;
exports.ER_SLAVE_NOT_RUNNING                                                             = 1199;
exports.ER_BAD_SLAVE                                                                     = 1200;
exports.ER_MASTER_INFO                                                                   = 1201;
exports.ER_SLAVE_THREAD                                                                  = 1202;
exports.ER_TOO_MANY_USER_CONNECTIONS                                                     = 1203;
exports.ER_SET_CONSTANTS_ONLY                                                            = 1204;
exports.ER_LOCK_WAIT_TIMEOUT                                                             = 1205;
exports.ER_LOCK_TABLE_FULL                                                               = 1206;
exports.ER_READ_ONLY_TRANSACTION                                                         = 1207;
exports.ER_DROP_DB_WITH_READ_LOCK                                                        = 1208;
exports.ER_CREATE_DB_WITH_READ_LOCK                                                      = 1209;
exports.ER_WRONG_ARGUMENTS                                                               = 1210;
exports.ER_NO_PERMISSION_TO_CREATE_USER                                                  = 1211;
exports.ER_UNION_TABLES_IN_DIFFERENT_DIR                                                 = 1212;
exports.ER_LOCK_DEADLOCK                                                                 = 1213;
exports.ER_TABLE_CANT_HANDLE_FT                                                          = 1214;
exports.ER_CANNOT_ADD_FOREIGN                                                            = 1215;
exports.ER_NO_REFERENCED_ROW                                                             = 1216;
exports.ER_ROW_IS_REFERENCED                                                             = 1217;
exports.ER_CONNECT_TO_MASTER                                                             = 1218;
exports.ER_QUERY_ON_MASTER                                                               = 1219;
exports.ER_ERROR_WHEN_EXECUTING_COMMAND                                                  = 1220;
exports.ER_WRONG_USAGE                                                                   = 1221;
exports.ER_WRONG_NUMBER_OF_COLUMNS_IN_SELECT                                             = 1222;
exports.ER_CANT_UPDATE_WITH_READLOCK                                                     = 1223;
exports.ER_MIXING_NOT_ALLOWED                                                            = 1224;
exports.ER_DUP_ARGUMENT                                                                  = 1225;
exports.ER_USER_LIMIT_REACHED                                                            = 1226;
exports.ER_SPECIFIC_ACCESS_DENIED_ERROR                                                  = 1227;
exports.ER_LOCAL_VARIABLE                                                                = 1228;
exports.ER_GLOBAL_VARIABLE                                                               = 1229;
exports.ER_NO_DEFAULT                                                                    = 1230;
exports.ER_WRONG_VALUE_FOR_VAR                                                           = 1231;
exports.ER_WRONG_TYPE_FOR_VAR                                                            = 1232;
exports.ER_VAR_CANT_BE_READ                                                              = 1233;
exports.ER_CANT_USE_OPTION_HERE                                                          = 1234;
exports.ER_NOT_SUPPORTED_YET                                                             = 1235;
exports.ER_MASTER_FATAL_ERROR_READING_BINLOG                                             = 1236;
exports.ER_SLAVE_IGNORED_TABLE                                                           = 1237;
exports.ER_INCORRECT_GLOBAL_LOCAL_VAR                                                    = 1238;
exports.ER_WRONG_FK_DEF                                                                  = 1239;
exports.ER_KEY_REF_DO_NOT_MATCH_TABLE_REF                                                = 1240;
exports.ER_OPERAND_COLUMNS                                                               = 1241;
exports.ER_SUBQUERY_NO_1_ROW                                                             = 1242;
exports.ER_UNKNOWN_STMT_HANDLER                                                          = 1243;
exports.ER_CORRUPT_HELP_DB                                                               = 1244;
exports.ER_CYCLIC_REFERENCE                                                              = 1245;
exports.ER_AUTO_CONVERT                                                                  = 1246;
exports.ER_ILLEGAL_REFERENCE                                                             = 1247;
exports.ER_DERIVED_MUST_HAVE_ALIAS                                                       = 1248;
exports.ER_SELECT_REDUCED                                                                = 1249;
exports.ER_TABLENAME_NOT_ALLOWED_HERE                                                    = 1250;
exports.ER_NOT_SUPPORTED_AUTH_MODE                                                       = 1251;
exports.ER_SPATIAL_CANT_HAVE_NULL                                                        = 1252;
exports.ER_COLLATION_CHARSET_MISMATCH                                                    = 1253;
exports.ER_SLAVE_WAS_RUNNING                                                             = 1254;
exports.ER_SLAVE_WAS_NOT_RUNNING                                                         = 1255;
exports.ER_TOO_BIG_FOR_UNCOMPRESS                                                        = 1256;
exports.ER_ZLIB_Z_MEM_ERROR                                                              = 1257;
exports.ER_ZLIB_Z_BUF_ERROR                                                              = 1258;
exports.ER_ZLIB_Z_DATA_ERROR                                                             = 1259;
exports.ER_CUT_VALUE_GROUP_CONCAT                                                        = 1260;
exports.ER_WARN_TOO_FEW_RECORDS                                                          = 1261;
exports.ER_WARN_TOO_MANY_RECORDS                                                         = 1262;
exports.ER_WARN_NULL_TO_NOTNULL                                                          = 1263;
exports.ER_WARN_DATA_OUT_OF_RANGE                                                        = 1264;
exports.WARN_DATA_TRUNCATED                                                              = 1265;
exports.ER_WARN_USING_OTHER_HANDLER                                                      = 1266;
exports.ER_CANT_AGGREGATE_2COLLATIONS                                                    = 1267;
exports.ER_DROP_USER                                                                     = 1268;
exports.ER_REVOKE_GRANTS                                                                 = 1269;
exports.ER_CANT_AGGREGATE_3COLLATIONS                                                    = 1270;
exports.ER_CANT_AGGREGATE_NCOLLATIONS                                                    = 1271;
exports.ER_VARIABLE_IS_NOT_STRUCT                                                        = 1272;
exports.ER_UNKNOWN_COLLATION                                                             = 1273;
exports.ER_SLAVE_IGNORED_SSL_PARAMS                                                      = 1274;
exports.ER_SERVER_IS_IN_SECURE_AUTH_MODE                                                 = 1275;
exports.ER_WARN_FIELD_RESOLVED                                                           = 1276;
exports.ER_BAD_SLAVE_UNTIL_COND                                                          = 1277;
exports.ER_MISSING_SKIP_SLAVE                                                            = 1278;
exports.ER_UNTIL_COND_IGNORED                                                            = 1279;
exports.ER_WRONG_NAME_FOR_INDEX                                                          = 1280;
exports.ER_WRONG_NAME_FOR_CATALOG                                                        = 1281;
exports.ER_WARN_QC_RESIZE                                                                = 1282;
exports.ER_BAD_FT_COLUMN                                                                 = 1283;
exports.ER_UNKNOWN_KEY_CACHE                                                             = 1284;
exports.ER_WARN_HOSTNAME_WONT_WORK                                                       = 1285;
exports.ER_UNKNOWN_STORAGE_ENGINE                                                        = 1286;
exports.ER_WARN_DEPRECATED_SYNTAX                                                        = 1287;
exports.ER_NON_UPDATABLE_TABLE                                                           = 1288;
exports.ER_FEATURE_DISABLED                                                              = 1289;
exports.ER_OPTION_PREVENTS_STATEMENT                                                     = 1290;
exports.ER_DUPLICATED_VALUE_IN_TYPE                                                      = 1291;
exports.ER_TRUNCATED_WRONG_VALUE                                                         = 1292;
exports.ER_TOO_MUCH_AUTO_TIMESTAMP_COLS                                                  = 1293;
exports.ER_INVALID_ON_UPDATE                                                             = 1294;
exports.ER_UNSUPPORTED_PS                                                                = 1295;
exports.ER_GET_ERRMSG                                                                    = 1296;
exports.ER_GET_TEMPORARY_ERRMSG                                                          = 1297;
exports.ER_UNKNOWN_TIME_ZONE                                                             = 1298;
exports.ER_WARN_INVALID_TIMESTAMP                                                        = 1299;
exports.ER_INVALID_CHARACTER_STRING                                                      = 1300;
exports.ER_WARN_ALLOWED_PACKET_OVERFLOWED                                                = 1301;
exports.ER_CONFLICTING_DECLARATIONS                                                      = 1302;
exports.ER_SP_NO_RECURSIVE_CREATE                                                        = 1303;
exports.ER_SP_ALREADY_EXISTS                                                             = 1304;
exports.ER_SP_DOES_NOT_EXIST                                                             = 1305;
exports.ER_SP_DROP_FAILED                                                                = 1306;
exports.ER_SP_STORE_FAILED                                                               = 1307;
exports.ER_SP_LILABEL_MISMATCH                                                           = 1308;
exports.ER_SP_LABEL_REDEFINE                                                             = 1309;
exports.ER_SP_LABEL_MISMATCH                                                             = 1310;
exports.ER_SP_UNINIT_VAR                                                                 = 1311;
exports.ER_SP_BADSELECT                                                                  = 1312;
exports.ER_SP_BADRETURN                                                                  = 1313;
exports.ER_SP_BADSTATEMENT                                                               = 1314;
exports.ER_UPDATE_LOG_DEPRECATED_IGNORED                                                 = 1315;
exports.ER_UPDATE_LOG_DEPRECATED_TRANSLATED                                              = 1316;
exports.ER_QUERY_INTERRUPTED                                                             = 1317;
exports.ER_SP_WRONG_NO_OF_ARGS                                                           = 1318;
exports.ER_SP_COND_MISMATCH                                                              = 1319;
exports.ER_SP_NORETURN                                                                   = 1320;
exports.ER_SP_NORETURNEND                                                                = 1321;
exports.ER_SP_BAD_CURSOR_QUERY                                                           = 1322;
exports.ER_SP_BAD_CURSOR_SELECT                                                          = 1323;
exports.ER_SP_CURSOR_MISMATCH                                                            = 1324;
exports.ER_SP_CURSOR_ALREADY_OPEN                                                        = 1325;
exports.ER_SP_CURSOR_NOT_OPEN                                                            = 1326;
exports.ER_SP_UNDECLARED_VAR                                                             = 1327;
exports.ER_SP_WRONG_NO_OF_FETCH_ARGS                                                     = 1328;
exports.ER_SP_FETCH_NO_DATA                                                              = 1329;
exports.ER_SP_DUP_PARAM                                                                  = 1330;
exports.ER_SP_DUP_VAR                                                                    = 1331;
exports.ER_SP_DUP_COND                                                                   = 1332;
exports.ER_SP_DUP_CURS                                                                   = 1333;
exports.ER_SP_CANT_ALTER                                                                 = 1334;
exports.ER_SP_SUBSELECT_NYI                                                              = 1335;
exports.ER_STMT_NOT_ALLOWED_IN_SF_OR_TRG                                                 = 1336;
exports.ER_SP_VARCOND_AFTER_CURSHNDLR                                                    = 1337;
exports.ER_SP_CURSOR_AFTER_HANDLER                                                       = 1338;
exports.ER_SP_CASE_NOT_FOUND                                                             = 1339;
exports.ER_FPARSER_TOO_BIG_FILE                                                          = 1340;
exports.ER_FPARSER_BAD_HEADER                                                            = 1341;
exports.ER_FPARSER_EOF_IN_COMMENT                                                        = 1342;
exports.ER_FPARSER_ERROR_IN_PARAMETER                                                    = 1343;
exports.ER_FPARSER_EOF_IN_UNKNOWN_PARAMETER                                              = 1344;
exports.ER_VIEW_NO_EXPLAIN                                                               = 1345;
exports.ER_FRM_UNKNOWN_TYPE                                                              = 1346;
exports.ER_WRONG_OBJECT                                                                  = 1347;
exports.ER_NONUPDATEABLE_COLUMN                                                          = 1348;
exports.ER_VIEW_SELECT_DERIVED                                                           = 1349;
exports.ER_VIEW_SELECT_CLAUSE                                                            = 1350;
exports.ER_VIEW_SELECT_VARIABLE                                                          = 1351;
exports.ER_VIEW_SELECT_TMPTABLE                                                          = 1352;
exports.ER_VIEW_WRONG_LIST                                                               = 1353;
exports.ER_WARN_VIEW_MERGE                                                               = 1354;
exports.ER_WARN_VIEW_WITHOUT_KEY                                                         = 1355;
exports.ER_VIEW_INVALID                                                                  = 1356;
exports.ER_SP_NO_DROP_SP                                                                 = 1357;
exports.ER_SP_GOTO_IN_HNDLR                                                              = 1358;
exports.ER_TRG_ALREADY_EXISTS                                                            = 1359;
exports.ER_TRG_DOES_NOT_EXIST                                                            = 1360;
exports.ER_TRG_ON_VIEW_OR_TEMP_TABLE                                                     = 1361;
exports.ER_TRG_CANT_CHANGE_ROW                                                           = 1362;
exports.ER_TRG_NO_SUCH_ROW_IN_TRG                                                        = 1363;
exports.ER_NO_DEFAULT_FOR_FIELD                                                          = 1364;
exports.ER_DIVISION_BY_ZERO                                                              = 1365;
exports.ER_TRUNCATED_WRONG_VALUE_FOR_FIELD                                               = 1366;
exports.ER_ILLEGAL_VALUE_FOR_TYPE                                                        = 1367;
exports.ER_VIEW_NONUPD_CHECK                                                             = 1368;
exports.ER_VIEW_CHECK_FAILED                                                             = 1369;
exports.ER_PROCACCESS_DENIED_ERROR                                                       = 1370;
exports.ER_RELAY_LOG_FAIL                                                                = 1371;
exports.ER_PASSWD_LENGTH                                                                 = 1372;
exports.ER_UNKNOWN_TARGET_BINLOG                                                         = 1373;
exports.ER_IO_ERR_LOG_INDEX_READ                                                         = 1374;
exports.ER_BINLOG_PURGE_PROHIBITED                                                       = 1375;
exports.ER_FSEEK_FAIL                                                                    = 1376;
exports.ER_BINLOG_PURGE_FATAL_ERR                                                        = 1377;
exports.ER_LOG_IN_USE                                                                    = 1378;
exports.ER_LOG_PURGE_UNKNOWN_ERR                                                         = 1379;
exports.ER_RELAY_LOG_INIT                                                                = 1380;
exports.ER_NO_BINARY_LOGGING                                                             = 1381;
exports.ER_RESERVED_SYNTAX                                                               = 1382;
exports.ER_WSAS_FAILED                                                                   = 1383;
exports.ER_DIFF_GROUPS_PROC                                                              = 1384;
exports.ER_NO_GROUP_FOR_PROC                                                             = 1385;
exports.ER_ORDER_WITH_PROC                                                               = 1386;
exports.ER_LOGGING_PROHIBIT_CHANGING_OF                                                  = 1387;
exports.ER_NO_FILE_MAPPING                                                               = 1388;
exports.ER_WRONG_MAGIC                                                                   = 1389;
exports.ER_PS_MANY_PARAM                                                                 = 1390;
exports.ER_KEY_PART_0                                                                    = 1391;
exports.ER_VIEW_CHECKSUM                                                                 = 1392;
exports.ER_VIEW_MULTIUPDATE                                                              = 1393;
exports.ER_VIEW_NO_INSERT_FIELD_LIST                                                     = 1394;
exports.ER_VIEW_DELETE_MERGE_VIEW                                                        = 1395;
exports.ER_CANNOT_USER                                                                   = 1396;
exports.ER_XAER_NOTA                                                                     = 1397;
exports.ER_XAER_INVAL                                                                    = 1398;
exports.ER_XAER_RMFAIL                                                                   = 1399;
exports.ER_XAER_OUTSIDE                                                                  = 1400;
exports.ER_XAER_RMERR                                                                    = 1401;
exports.ER_XA_RBROLLBACK                                                                 = 1402;
exports.ER_NONEXISTING_PROC_GRANT                                                        = 1403;
exports.ER_PROC_AUTO_GRANT_FAIL                                                          = 1404;
exports.ER_PROC_AUTO_REVOKE_FAIL                                                         = 1405;
exports.ER_DATA_TOO_LONG                                                                 = 1406;
exports.ER_SP_BAD_SQLSTATE                                                               = 1407;
exports.ER_STARTUP                                                                       = 1408;
exports.ER_LOAD_FROM_FIXED_SIZE_ROWS_TO_VAR                                              = 1409;
exports.ER_CANT_CREATE_USER_WITH_GRANT                                                   = 1410;
exports.ER_WRONG_VALUE_FOR_TYPE                                                          = 1411;
exports.ER_TABLE_DEF_CHANGED                                                             = 1412;
exports.ER_SP_DUP_HANDLER                                                                = 1413;
exports.ER_SP_NOT_VAR_ARG                                                                = 1414;
exports.ER_SP_NO_RETSET                                                                  = 1415;
exports.ER_CANT_CREATE_GEOMETRY_OBJECT                                                   = 1416;
exports.ER_FAILED_ROUTINE_BREAK_BINLOG                                                   = 1417;
exports.ER_BINLOG_UNSAFE_ROUTINE                                                         = 1418;
exports.ER_BINLOG_CREATE_ROUTINE_NEED_SUPER                                              = 1419;
exports.ER_EXEC_STMT_WITH_OPEN_CURSOR                                                    = 1420;
exports.ER_STMT_HAS_NO_OPEN_CURSOR                                                       = 1421;
exports.ER_COMMIT_NOT_ALLOWED_IN_SF_OR_TRG                                               = 1422;
exports.ER_NO_DEFAULT_FOR_VIEW_FIELD                                                     = 1423;
exports.ER_SP_NO_RECURSION                                                               = 1424;
exports.ER_TOO_BIG_SCALE                                                                 = 1425;
exports.ER_TOO_BIG_PRECISION                                                             = 1426;
exports.ER_M_BIGGER_THAN_D                                                               = 1427;
exports.ER_WRONG_LOCK_OF_SYSTEM_TABLE                                                    = 1428;
exports.ER_CONNECT_TO_FOREIGN_DATA_SOURCE                                                = 1429;
exports.ER_QUERY_ON_FOREIGN_DATA_SOURCE                                                  = 1430;
exports.ER_FOREIGN_DATA_SOURCE_DOESNT_EXIST                                              = 1431;
exports.ER_FOREIGN_DATA_STRING_INVALID_CANT_CREATE                                       = 1432;
exports.ER_FOREIGN_DATA_STRING_INVALID                                                   = 1433;
exports.ER_CANT_CREATE_FEDERATED_TABLE                                                   = 1434;
exports.ER_TRG_IN_WRONG_SCHEMA                                                           = 1435;
exports.ER_STACK_OVERRUN_NEED_MORE                                                       = 1436;
exports.ER_TOO_LONG_BODY                                                                 = 1437;
exports.ER_WARN_CANT_DROP_DEFAULT_KEYCACHE                                               = 1438;
exports.ER_TOO_BIG_DISPLAYWIDTH                                                          = 1439;
exports.ER_XAER_DUPID                                                                    = 1440;
exports.ER_DATETIME_FUNCTION_OVERFLOW                                                    = 1441;
exports.ER_CANT_UPDATE_USED_TABLE_IN_SF_OR_TRG                                           = 1442;
exports.ER_VIEW_PREVENT_UPDATE                                                           = 1443;
exports.ER_PS_NO_RECURSION                                                               = 1444;
exports.ER_SP_CANT_SET_AUTOCOMMIT                                                        = 1445;
exports.ER_MALFORMED_DEFINER                                                             = 1446;
exports.ER_VIEW_FRM_NO_USER                                                              = 1447;
exports.ER_VIEW_OTHER_USER                                                               = 1448;
exports.ER_NO_SUCH_USER                                                                  = 1449;
exports.ER_FORBID_SCHEMA_CHANGE                                                          = 1450;
exports.ER_ROW_IS_REFERENCED_2                                                           = 1451;
exports.ER_NO_REFERENCED_ROW_2                                                           = 1452;
exports.ER_SP_BAD_VAR_SHADOW                                                             = 1453;
exports.ER_TRG_NO_DEFINER                                                                = 1454;
exports.ER_OLD_FILE_FORMAT                                                               = 1455;
exports.ER_SP_RECURSION_LIMIT                                                            = 1456;
exports.ER_SP_PROC_TABLE_CORRUPT                                                         = 1457;
exports.ER_SP_WRONG_NAME                                                                 = 1458;
exports.ER_TABLE_NEEDS_UPGRADE                                                           = 1459;
exports.ER_SP_NO_AGGREGATE                                                               = 1460;
exports.ER_MAX_PREPARED_STMT_COUNT_REACHED                                               = 1461;
exports.ER_VIEW_RECURSIVE                                                                = 1462;
exports.ER_NON_GROUPING_FIELD_USED                                                       = 1463;
exports.ER_TABLE_CANT_HANDLE_SPKEYS                                                      = 1464;
exports.ER_NO_TRIGGERS_ON_SYSTEM_SCHEMA                                                  = 1465;
exports.ER_REMOVED_SPACES                                                                = 1466;
exports.ER_AUTOINC_READ_FAILED                                                           = 1467;
exports.ER_USERNAME                                                                      = 1468;
exports.ER_HOSTNAME                                                                      = 1469;
exports.ER_WRONG_STRING_LENGTH                                                           = 1470;
exports.ER_NON_INSERTABLE_TABLE                                                          = 1471;
exports.ER_ADMIN_WRONG_MRG_TABLE                                                         = 1472;
exports.ER_TOO_HIGH_LEVEL_OF_NESTING_FOR_SELECT                                          = 1473;
exports.ER_NAME_BECOMES_EMPTY                                                            = 1474;
exports.ER_AMBIGUOUS_FIELD_TERM                                                          = 1475;
exports.ER_FOREIGN_SERVER_EXISTS                                                         = 1476;
exports.ER_FOREIGN_SERVER_DOESNT_EXIST                                                   = 1477;
exports.ER_ILLEGAL_HA_CREATE_OPTION                                                      = 1478;
exports.ER_PARTITION_REQUIRES_VALUES_ERROR                                               = 1479;
exports.ER_PARTITION_WRONG_VALUES_ERROR                                                  = 1480;
exports.ER_PARTITION_MAXVALUE_ERROR                                                      = 1481;
exports.ER_PARTITION_SUBPARTITION_ERROR                                                  = 1482;
exports.ER_PARTITION_SUBPART_MIX_ERROR                                                   = 1483;
exports.ER_PARTITION_WRONG_NO_PART_ERROR                                                 = 1484;
exports.ER_PARTITION_WRONG_NO_SUBPART_ERROR                                              = 1485;
exports.ER_WRONG_EXPR_IN_PARTITION_FUNC_ERROR                                            = 1486;
exports.ER_NO_CONST_EXPR_IN_RANGE_OR_LIST_ERROR                                          = 1487;
exports.ER_FIELD_NOT_FOUND_PART_ERROR                                                    = 1488;
exports.ER_LIST_OF_FIELDS_ONLY_IN_HASH_ERROR                                             = 1489;
exports.ER_INCONSISTENT_PARTITION_INFO_ERROR                                             = 1490;
exports.ER_PARTITION_FUNC_NOT_ALLOWED_ERROR                                              = 1491;
exports.ER_PARTITIONS_MUST_BE_DEFINED_ERROR                                              = 1492;
exports.ER_RANGE_NOT_INCREASING_ERROR                                                    = 1493;
exports.ER_INCONSISTENT_TYPE_OF_FUNCTIONS_ERROR                                          = 1494;
exports.ER_MULTIPLE_DEF_CONST_IN_LIST_PART_ERROR                                         = 1495;
exports.ER_PARTITION_ENTRY_ERROR                                                         = 1496;
exports.ER_MIX_HANDLER_ERROR                                                             = 1497;
exports.ER_PARTITION_NOT_DEFINED_ERROR                                                   = 1498;
exports.ER_TOO_MANY_PARTITIONS_ERROR                                                     = 1499;
exports.ER_SUBPARTITION_ERROR                                                            = 1500;
exports.ER_CANT_CREATE_HANDLER_FILE                                                      = 1501;
exports.ER_BLOB_FIELD_IN_PART_FUNC_ERROR                                                 = 1502;
exports.ER_UNIQUE_KEY_NEED_ALL_FIELDS_IN_PF                                              = 1503;
exports.ER_NO_PARTS_ERROR                                                                = 1504;
exports.ER_PARTITION_MGMT_ON_NONPARTITIONED                                              = 1505;
exports.ER_FOREIGN_KEY_ON_PARTITIONED                                                    = 1506;
exports.ER_DROP_PARTITION_NON_EXISTENT                                                   = 1507;
exports.ER_DROP_LAST_PARTITION                                                           = 1508;
exports.ER_COALESCE_ONLY_ON_HASH_PARTITION                                               = 1509;
exports.ER_REORG_HASH_ONLY_ON_SAME_NO                                                    = 1510;
exports.ER_REORG_NO_PARAM_ERROR                                                          = 1511;
exports.ER_ONLY_ON_RANGE_LIST_PARTITION                                                  = 1512;
exports.ER_ADD_PARTITION_SUBPART_ERROR                                                   = 1513;
exports.ER_ADD_PARTITION_NO_NEW_PARTITION                                                = 1514;
exports.ER_COALESCE_PARTITION_NO_PARTITION                                               = 1515;
exports.ER_REORG_PARTITION_NOT_EXIST                                                     = 1516;
exports.ER_SAME_NAME_PARTITION                                                           = 1517;
exports.ER_NO_BINLOG_ERROR                                                               = 1518;
exports.ER_CONSECUTIVE_REORG_PARTITIONS                                                  = 1519;
exports.ER_REORG_OUTSIDE_RANGE                                                           = 1520;
exports.ER_PARTITION_FUNCTION_FAILURE                                                    = 1521;
exports.ER_PART_STATE_ERROR                                                              = 1522;
exports.ER_LIMITED_PART_RANGE                                                            = 1523;
exports.ER_PLUGIN_IS_NOT_LOADED                                                          = 1524;
exports.ER_WRONG_VALUE                                                                   = 1525;
exports.ER_NO_PARTITION_FOR_GIVEN_VALUE                                                  = 1526;
exports.ER_FILEGROUP_OPTION_ONLY_ONCE                                                    = 1527;
exports.ER_CREATE_FILEGROUP_FAILED                                                       = 1528;
exports.ER_DROP_FILEGROUP_FAILED                                                         = 1529;
exports.ER_TABLESPACE_AUTO_EXTEND_ERROR                                                  = 1530;
exports.ER_WRONG_SIZE_NUMBER                                                             = 1531;
exports.ER_SIZE_OVERFLOW_ERROR                                                           = 1532;
exports.ER_ALTER_FILEGROUP_FAILED                                                        = 1533;
exports.ER_BINLOG_ROW_LOGGING_FAILED                                                     = 1534;
exports.ER_BINLOG_ROW_WRONG_TABLE_DEF                                                    = 1535;
exports.ER_BINLOG_ROW_RBR_TO_SBR                                                         = 1536;
exports.ER_EVENT_ALREADY_EXISTS                                                          = 1537;
exports.ER_EVENT_STORE_FAILED                                                            = 1538;
exports.ER_EVENT_DOES_NOT_EXIST                                                          = 1539;
exports.ER_EVENT_CANT_ALTER                                                              = 1540;
exports.ER_EVENT_DROP_FAILED                                                             = 1541;
exports.ER_EVENT_INTERVAL_NOT_POSITIVE_OR_TOO_BIG                                        = 1542;
exports.ER_EVENT_ENDS_BEFORE_STARTS                                                      = 1543;
exports.ER_EVENT_EXEC_TIME_IN_THE_PAST                                                   = 1544;
exports.ER_EVENT_OPEN_TABLE_FAILED                                                       = 1545;
exports.ER_EVENT_NEITHER_M_EXPR_NOR_M_AT                                                 = 1546;
exports.ER_COL_COUNT_DOESNT_MATCH_CORRUPTED                                              = 1547;
exports.ER_CANNOT_LOAD_FROM_TABLE                                                        = 1548;
exports.ER_EVENT_CANNOT_DELETE                                                           = 1549;
exports.ER_EVENT_COMPILE_ERROR                                                           = 1550;
exports.ER_EVENT_SAME_NAME                                                               = 1551;
exports.ER_EVENT_DATA_TOO_LONG                                                           = 1552;
exports.ER_DROP_INDEX_FK                                                                 = 1553;
exports.ER_WARN_DEPRECATED_SYNTAX_WITH_VER                                               = 1554;
exports.ER_CANT_WRITE_LOCK_LOG_TABLE                                                     = 1555;
exports.ER_CANT_LOCK_LOG_TABLE                                                           = 1556;
exports.ER_FOREIGN_DUPLICATE_KEY                                                         = 1557;
exports.ER_COL_COUNT_DOESNT_MATCH_PLEASE_UPDATE                                          = 1558;
exports.ER_TEMP_TABLE_PREVENTS_SWITCH_OUT_OF_RBR                                         = 1559;
exports.ER_STORED_FUNCTION_PREVENTS_SWITCH_BINLOG_FORMAT                                 = 1560;
exports.ER_NDB_CANT_SWITCH_BINLOG_FORMAT                                                 = 1561;
exports.ER_PARTITION_NO_TEMPORARY                                                        = 1562;
exports.ER_PARTITION_CONST_DOMAIN_ERROR                                                  = 1563;
exports.ER_PARTITION_FUNCTION_IS_NOT_ALLOWED                                             = 1564;
exports.ER_DDL_LOG_ERROR                                                                 = 1565;
exports.ER_NULL_IN_VALUES_LESS_THAN                                                      = 1566;
exports.ER_WRONG_PARTITION_NAME                                                          = 1567;
exports.ER_CANT_CHANGE_TX_CHARACTERISTICS                                                = 1568;
exports.ER_DUP_ENTRY_AUTOINCREMENT_CASE                                                  = 1569;
exports.ER_EVENT_MODIFY_QUEUE_ERROR                                                      = 1570;
exports.ER_EVENT_SET_VAR_ERROR                                                           = 1571;
exports.ER_PARTITION_MERGE_ERROR                                                         = 1572;
exports.ER_CANT_ACTIVATE_LOG                                                             = 1573;
exports.ER_RBR_NOT_AVAILABLE                                                             = 1574;
exports.ER_BASE64_DECODE_ERROR                                                           = 1575;
exports.ER_EVENT_RECURSION_FORBIDDEN                                                     = 1576;
exports.ER_EVENTS_DB_ERROR                                                               = 1577;
exports.ER_ONLY_INTEGERS_ALLOWED                                                         = 1578;
exports.ER_UNSUPORTED_LOG_ENGINE                                                         = 1579;
exports.ER_BAD_LOG_STATEMENT                                                             = 1580;
exports.ER_CANT_RENAME_LOG_TABLE                                                         = 1581;
exports.ER_WRONG_PARAMCOUNT_TO_NATIVE_FCT                                                = 1582;
exports.ER_WRONG_PARAMETERS_TO_NATIVE_FCT                                                = 1583;
exports.ER_WRONG_PARAMETERS_TO_STORED_FCT                                                = 1584;
exports.ER_NATIVE_FCT_NAME_COLLISION                                                     = 1585;
exports.ER_DUP_ENTRY_WITH_KEY_NAME                                                       = 1586;
exports.ER_BINLOG_PURGE_EMFILE                                                           = 1587;
exports.ER_EVENT_CANNOT_CREATE_IN_THE_PAST                                               = 1588;
exports.ER_EVENT_CANNOT_ALTER_IN_THE_PAST                                                = 1589;
exports.ER_SLAVE_INCIDENT                                                                = 1590;
exports.ER_NO_PARTITION_FOR_GIVEN_VALUE_SILENT                                           = 1591;
exports.ER_BINLOG_UNSAFE_STATEMENT                                                       = 1592;
exports.ER_SLAVE_FATAL_ERROR                                                             = 1593;
exports.ER_SLAVE_RELAY_LOG_READ_FAILURE                                                  = 1594;
exports.ER_SLAVE_RELAY_LOG_WRITE_FAILURE                                                 = 1595;
exports.ER_SLAVE_CREATE_EVENT_FAILURE                                                    = 1596;
exports.ER_SLAVE_MASTER_COM_FAILURE                                                      = 1597;
exports.ER_BINLOG_LOGGING_IMPOSSIBLE                                                     = 1598;
exports.ER_VIEW_NO_CREATION_CTX                                                          = 1599;
exports.ER_VIEW_INVALID_CREATION_CTX                                                     = 1600;
exports.ER_SR_INVALID_CREATION_CTX                                                       = 1601;
exports.ER_TRG_CORRUPTED_FILE                                                            = 1602;
exports.ER_TRG_NO_CREATION_CTX                                                           = 1603;
exports.ER_TRG_INVALID_CREATION_CTX                                                      = 1604;
exports.ER_EVENT_INVALID_CREATION_CTX                                                    = 1605;
exports.ER_TRG_CANT_OPEN_TABLE                                                           = 1606;
exports.ER_CANT_CREATE_SROUTINE                                                          = 1607;
exports.ER_NEVER_USED                                                                    = 1608;
exports.ER_NO_FORMAT_DESCRIPTION_EVENT_BEFORE_BINLOG_STATEMENT                           = 1609;
exports.ER_SLAVE_CORRUPT_EVENT                                                           = 1610;
exports.ER_LOAD_DATA_INVALID_COLUMN                                                      = 1611;
exports.ER_LOG_PURGE_NO_FILE                                                             = 1612;
exports.ER_XA_RBTIMEOUT                                                                  = 1613;
exports.ER_XA_RBDEADLOCK                                                                 = 1614;
exports.ER_NEED_REPREPARE                                                                = 1615;
exports.ER_DELAYED_NOT_SUPPORTED                                                         = 1616;
exports.WARN_NO_MASTER_INFO                                                              = 1617;
exports.WARN_OPTION_IGNORED                                                              = 1618;
exports.ER_PLUGIN_DELETE_BUILTIN                                                         = 1619;
exports.WARN_PLUGIN_BUSY                                                                 = 1620;
exports.ER_VARIABLE_IS_READONLY                                                          = 1621;
exports.ER_WARN_ENGINE_TRANSACTION_ROLLBACK                                              = 1622;
exports.ER_SLAVE_HEARTBEAT_FAILURE                                                       = 1623;
exports.ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE                                            = 1624;
exports.ER_NDB_REPLICATION_SCHEMA_ERROR                                                  = 1625;
exports.ER_CONFLICT_FN_PARSE_ERROR                                                       = 1626;
exports.ER_EXCEPTIONS_WRITE_ERROR                                                        = 1627;
exports.ER_TOO_LONG_TABLE_COMMENT                                                        = 1628;
exports.ER_TOO_LONG_FIELD_COMMENT                                                        = 1629;
exports.ER_FUNC_INEXISTENT_NAME_COLLISION                                                = 1630;
exports.ER_DATABASE_NAME                                                                 = 1631;
exports.ER_TABLE_NAME                                                                    = 1632;
exports.ER_PARTITION_NAME                                                                = 1633;
exports.ER_SUBPARTITION_NAME                                                             = 1634;
exports.ER_TEMPORARY_NAME                                                                = 1635;
exports.ER_RENAMED_NAME                                                                  = 1636;
exports.ER_TOO_MANY_CONCURRENT_TRXS                                                      = 1637;
exports.WARN_NON_ASCII_SEPARATOR_NOT_IMPLEMENTED                                         = 1638;
exports.ER_DEBUG_SYNC_TIMEOUT                                                            = 1639;
exports.ER_DEBUG_SYNC_HIT_LIMIT                                                          = 1640;
exports.ER_DUP_SIGNAL_SET                                                                = 1641;
exports.ER_SIGNAL_WARN                                                                   = 1642;
exports.ER_SIGNAL_NOT_FOUND                                                              = 1643;
exports.ER_SIGNAL_EXCEPTION                                                              = 1644;
exports.ER_RESIGNAL_WITHOUT_ACTIVE_HANDLER                                               = 1645;
exports.ER_SIGNAL_BAD_CONDITION_TYPE                                                     = 1646;
exports.WARN_COND_ITEM_TRUNCATED                                                         = 1647;
exports.ER_COND_ITEM_TOO_LONG                                                            = 1648;
exports.ER_UNKNOWN_LOCALE                                                                = 1649;
exports.ER_SLAVE_IGNORE_SERVER_IDS                                                       = 1650;
exports.ER_QUERY_CACHE_DISABLED                                                          = 1651;
exports.ER_SAME_NAME_PARTITION_FIELD                                                     = 1652;
exports.ER_PARTITION_COLUMN_LIST_ERROR                                                   = 1653;
exports.ER_WRONG_TYPE_COLUMN_VALUE_ERROR                                                 = 1654;
exports.ER_TOO_MANY_PARTITION_FUNC_FIELDS_ERROR                                          = 1655;
exports.ER_MAXVALUE_IN_VALUES_IN                                                         = 1656;
exports.ER_TOO_MANY_VALUES_ERROR                                                         = 1657;
exports.ER_ROW_SINGLE_PARTITION_FIELD_ERROR                                              = 1658;
exports.ER_FIELD_TYPE_NOT_ALLOWED_AS_PARTITION_FIELD                                     = 1659;
exports.ER_PARTITION_FIELDS_TOO_LONG                                                     = 1660;
exports.ER_BINLOG_ROW_ENGINE_AND_STMT_ENGINE                                             = 1661;
exports.ER_BINLOG_ROW_MODE_AND_STMT_ENGINE                                               = 1662;
exports.ER_BINLOG_UNSAFE_AND_STMT_ENGINE                                                 = 1663;
exports.ER_BINLOG_ROW_INJECTION_AND_STMT_ENGINE                                          = 1664;
exports.ER_BINLOG_STMT_MODE_AND_ROW_ENGINE                                               = 1665;
exports.ER_BINLOG_ROW_INJECTION_AND_STMT_MODE                                            = 1666;
exports.ER_BINLOG_MULTIPLE_ENGINES_AND_SELF_LOGGING_ENGINE                               = 1667;
exports.ER_BINLOG_UNSAFE_LIMIT                                                           = 1668;
exports.ER_BINLOG_UNSAFE_INSERT_DELAYED                                                  = 1669;
exports.ER_BINLOG_UNSAFE_SYSTEM_TABLE                                                    = 1670;
exports.ER_BINLOG_UNSAFE_AUTOINC_COLUMNS                                                 = 1671;
exports.ER_BINLOG_UNSAFE_UDF                                                             = 1672;
exports.ER_BINLOG_UNSAFE_SYSTEM_VARIABLE                                                 = 1673;
exports.ER_BINLOG_UNSAFE_SYSTEM_FUNCTION                                                 = 1674;
exports.ER_BINLOG_UNSAFE_NONTRANS_AFTER_TRANS                                            = 1675;
exports.ER_MESSAGE_AND_STATEMENT                                                         = 1676;
exports.ER_SLAVE_CONVERSION_FAILED                                                       = 1677;
exports.ER_SLAVE_CANT_CREATE_CONVERSION                                                  = 1678;
exports.ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_BINLOG_FORMAT                              = 1679;
exports.ER_PATH_LENGTH                                                                   = 1680;
exports.ER_WARN_DEPRECATED_SYNTAX_NO_REPLACEMENT                                         = 1681;
exports.ER_WRONG_NATIVE_TABLE_STRUCTURE                                                  = 1682;
exports.ER_WRONG_PERFSCHEMA_USAGE                                                        = 1683;
exports.ER_WARN_I_S_SKIPPED_TABLE                                                        = 1684;
exports.ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_BINLOG_DIRECT                              = 1685;
exports.ER_STORED_FUNCTION_PREVENTS_SWITCH_BINLOG_DIRECT                                 = 1686;
exports.ER_SPATIAL_MUST_HAVE_GEOM_COL                                                    = 1687;
exports.ER_TOO_LONG_INDEX_COMMENT                                                        = 1688;
exports.ER_LOCK_ABORTED                                                                  = 1689;
exports.ER_DATA_OUT_OF_RANGE                                                             = 1690;
exports.ER_WRONG_SPVAR_TYPE_IN_LIMIT                                                     = 1691;
exports.ER_BINLOG_UNSAFE_MULTIPLE_ENGINES_AND_SELF_LOGGING_ENGINE                        = 1692;
exports.ER_BINLOG_UNSAFE_MIXED_STATEMENT                                                 = 1693;
exports.ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_SQL_LOG_BIN                                = 1694;
exports.ER_STORED_FUNCTION_PREVENTS_SWITCH_SQL_LOG_BIN                                   = 1695;
exports.ER_FAILED_READ_FROM_PAR_FILE                                                     = 1696;
exports.ER_VALUES_IS_NOT_INT_TYPE_ERROR                                                  = 1697;
exports.ER_ACCESS_DENIED_NO_PASSWORD_ERROR                                               = 1698;
exports.ER_SET_PASSWORD_AUTH_PLUGIN                                                      = 1699;
exports.ER_GRANT_PLUGIN_USER_EXISTS                                                      = 1700;
exports.ER_TRUNCATE_ILLEGAL_FK                                                           = 1701;
exports.ER_PLUGIN_IS_PERMANENT                                                           = 1702;
exports.ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE_MIN                                        = 1703;
exports.ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE_MAX                                        = 1704;
exports.ER_STMT_CACHE_FULL                                                               = 1705;
exports.ER_MULTI_UPDATE_KEY_CONFLICT                                                     = 1706;
exports.ER_TABLE_NEEDS_REBUILD                                                           = 1707;
exports.WARN_OPTION_BELOW_LIMIT                                                          = 1708;
exports.ER_INDEX_COLUMN_TOO_LONG                                                         = 1709;
exports.ER_ERROR_IN_TRIGGER_BODY                                                         = 1710;
exports.ER_ERROR_IN_UNKNOWN_TRIGGER_BODY                                                 = 1711;
exports.ER_INDEX_CORRUPT                                                                 = 1712;
exports.ER_UNDO_RECORD_TOO_BIG                                                           = 1713;
exports.ER_BINLOG_UNSAFE_INSERT_IGNORE_SELECT                                            = 1714;
exports.ER_BINLOG_UNSAFE_INSERT_SELECT_UPDATE                                            = 1715;
exports.ER_BINLOG_UNSAFE_REPLACE_SELECT                                                  = 1716;
exports.ER_BINLOG_UNSAFE_CREATE_IGNORE_SELECT                                            = 1717;
exports.ER_BINLOG_UNSAFE_CREATE_REPLACE_SELECT                                           = 1718;
exports.ER_BINLOG_UNSAFE_UPDATE_IGNORE                                                   = 1719;
exports.ER_PLUGIN_NO_UNINSTALL                                                           = 1720;
exports.ER_PLUGIN_NO_INSTALL                                                             = 1721;
exports.ER_BINLOG_UNSAFE_WRITE_AUTOINC_SELECT                                            = 1722;
exports.ER_BINLOG_UNSAFE_CREATE_SELECT_AUTOINC                                           = 1723;
exports.ER_BINLOG_UNSAFE_INSERT_TWO_KEYS                                                 = 1724;
exports.ER_TABLE_IN_FK_CHECK                                                             = 1725;
exports.ER_UNSUPPORTED_ENGINE                                                            = 1726;
exports.ER_BINLOG_UNSAFE_AUTOINC_NOT_FIRST                                               = 1727;
exports.ER_CANNOT_LOAD_FROM_TABLE_V2                                                     = 1728;
exports.ER_MASTER_DELAY_VALUE_OUT_OF_RANGE                                               = 1729;
exports.ER_ONLY_FD_AND_RBR_EVENTS_ALLOWED_IN_BINLOG_STATEMENT                            = 1730;
exports.ER_PARTITION_EXCHANGE_DIFFERENT_OPTION                                           = 1731;
exports.ER_PARTITION_EXCHANGE_PART_TABLE                                                 = 1732;
exports.ER_PARTITION_EXCHANGE_TEMP_TABLE                                                 = 1733;
exports.ER_PARTITION_INSTEAD_OF_SUBPARTITION                                             = 1734;
exports.ER_UNKNOWN_PARTITION                                                             = 1735;
exports.ER_TABLES_DIFFERENT_METADATA                                                     = 1736;
exports.ER_ROW_DOES_NOT_MATCH_PARTITION                                                  = 1737;
exports.ER_BINLOG_CACHE_SIZE_GREATER_THAN_MAX                                            = 1738;
exports.ER_WARN_INDEX_NOT_APPLICABLE                                                     = 1739;
exports.ER_PARTITION_EXCHANGE_FOREIGN_KEY                                                = 1740;
exports.ER_NO_SUCH_KEY_VALUE                                                             = 1741;
exports.ER_RPL_INFO_DATA_TOO_LONG                                                        = 1742;
exports.ER_NETWORK_READ_EVENT_CHECKSUM_FAILURE                                           = 1743;
exports.ER_BINLOG_READ_EVENT_CHECKSUM_FAILURE                                            = 1744;
exports.ER_BINLOG_STMT_CACHE_SIZE_GREATER_THAN_MAX                                       = 1745;
exports.ER_CANT_UPDATE_TABLE_IN_CREATE_TABLE_SELECT                                      = 1746;
exports.ER_PARTITION_CLAUSE_ON_NONPARTITIONED                                            = 1747;
exports.ER_ROW_DOES_NOT_MATCH_GIVEN_PARTITION_SET                                        = 1748;
exports.ER_NO_SUCH_PARTITION                                                             = 1749;
exports.ER_CHANGE_RPL_INFO_REPOSITORY_FAILURE                                            = 1750;
exports.ER_WARNING_NOT_COMPLETE_ROLLBACK_WITH_CREATED_TEMP_TABLE                         = 1751;
exports.ER_WARNING_NOT_COMPLETE_ROLLBACK_WITH_DROPPED_TEMP_TABLE                         = 1752;
exports.ER_MTS_FEATURE_IS_NOT_SUPPORTED                                                  = 1753;
exports.ER_MTS_UPDATED_DBS_GREATER_MAX                                                   = 1754;
exports.ER_MTS_CANT_PARALLEL                                                             = 1755;
exports.ER_MTS_INCONSISTENT_DATA                                                         = 1756;
exports.ER_FULLTEXT_NOT_SUPPORTED_WITH_PARTITIONING                                      = 1757;
exports.ER_DA_INVALID_CONDITION_NUMBER                                                   = 1758;
exports.ER_INSECURE_PLAIN_TEXT                                                           = 1759;
exports.ER_INSECURE_CHANGE_MASTER                                                        = 1760;
exports.ER_FOREIGN_DUPLICATE_KEY_WITH_CHILD_INFO                                         = 1761;
exports.ER_FOREIGN_DUPLICATE_KEY_WITHOUT_CHILD_INFO                                      = 1762;
exports.ER_SQLTHREAD_WITH_SECURE_SLAVE                                                   = 1763;
exports.ER_TABLE_HAS_NO_FT                                                               = 1764;
exports.ER_VARIABLE_NOT_SETTABLE_IN_SF_OR_TRIGGER                                        = 1765;
exports.ER_VARIABLE_NOT_SETTABLE_IN_TRANSACTION                                          = 1766;
exports.ER_GTID_NEXT_IS_NOT_IN_GTID_NEXT_LIST                                            = 1767;
exports.ER_CANT_CHANGE_GTID_NEXT_IN_TRANSACTION                                          = 1768;
exports.ER_SET_STATEMENT_CANNOT_INVOKE_FUNCTION                                          = 1769;
exports.ER_GTID_NEXT_CANT_BE_AUTOMATIC_IF_GTID_NEXT_LIST_IS_NON_NULL                     = 1770;
exports.ER_SKIPPING_LOGGED_TRANSACTION                                                   = 1771;
exports.ER_MALFORMED_GTID_SET_SPECIFICATION                                              = 1772;
exports.ER_MALFORMED_GTID_SET_ENCODING                                                   = 1773;
exports.ER_MALFORMED_GTID_SPECIFICATION                                                  = 1774;
exports.ER_GNO_EXHAUSTED                                                                 = 1775;
exports.ER_BAD_SLAVE_AUTO_POSITION                                                       = 1776;
exports.ER_AUTO_POSITION_REQUIRES_GTID_MODE_NOT_OFF                                      = 1777;
exports.ER_CANT_DO_IMPLICIT_COMMIT_IN_TRX_WHEN_GTID_NEXT_IS_SET                          = 1778;
exports.ER_GTID_MODE_ON_REQUIRES_ENFORCE_GTID_CONSISTENCY_ON                             = 1779;
exports.ER_GTID_MODE_REQUIRES_BINLOG                                                     = 1780;
exports.ER_CANT_SET_GTID_NEXT_TO_GTID_WHEN_GTID_MODE_IS_OFF                              = 1781;
exports.ER_CANT_SET_GTID_NEXT_TO_ANONYMOUS_WHEN_GTID_MODE_IS_ON                          = 1782;
exports.ER_CANT_SET_GTID_NEXT_LIST_TO_NON_NULL_WHEN_GTID_MODE_IS_OFF                     = 1783;
exports.ER_FOUND_GTID_EVENT_WHEN_GTID_MODE_IS_OFF                                        = 1784;
exports.ER_GTID_UNSAFE_NON_TRANSACTIONAL_TABLE                                           = 1785;
exports.ER_GTID_UNSAFE_CREATE_SELECT                                                     = 1786;
exports.ER_GTID_UNSAFE_CREATE_DROP_TEMPORARY_TABLE_IN_TRANSACTION                        = 1787;
exports.ER_GTID_MODE_CAN_ONLY_CHANGE_ONE_STEP_AT_A_TIME                                  = 1788;
exports.ER_MASTER_HAS_PURGED_REQUIRED_GTIDS                                              = 1789;
exports.ER_CANT_SET_GTID_NEXT_WHEN_OWNING_GTID                                           = 1790;
exports.ER_UNKNOWN_EXPLAIN_FORMAT                                                        = 1791;
exports.ER_CANT_EXECUTE_IN_READ_ONLY_TRANSACTION                                         = 1792;
exports.ER_TOO_LONG_TABLE_PARTITION_COMMENT                                              = 1793;
exports.ER_SLAVE_CONFIGURATION                                                           = 1794;
exports.ER_INNODB_FT_LIMIT                                                               = 1795;
exports.ER_INNODB_NO_FT_TEMP_TABLE                                                       = 1796;
exports.ER_INNODB_FT_WRONG_DOCID_COLUMN                                                  = 1797;
exports.ER_INNODB_FT_WRONG_DOCID_INDEX                                                   = 1798;
exports.ER_INNODB_ONLINE_LOG_TOO_BIG                                                     = 1799;
exports.ER_UNKNOWN_ALTER_ALGORITHM                                                       = 1800;
exports.ER_UNKNOWN_ALTER_LOCK                                                            = 1801;
exports.ER_MTS_CHANGE_MASTER_CANT_RUN_WITH_GAPS                                          = 1802;
exports.ER_MTS_RECOVERY_FAILURE                                                          = 1803;
exports.ER_MTS_RESET_WORKERS                                                             = 1804;
exports.ER_COL_COUNT_DOESNT_MATCH_CORRUPTED_V2                                           = 1805;
exports.ER_SLAVE_SILENT_RETRY_TRANSACTION                                                = 1806;
exports.ER_DISCARD_FK_CHECKS_RUNNING                                                     = 1807;
exports.ER_TABLE_SCHEMA_MISMATCH                                                         = 1808;
exports.ER_TABLE_IN_SYSTEM_TABLESPACE                                                    = 1809;
exports.ER_IO_READ_ERROR                                                                 = 1810;
exports.ER_IO_WRITE_ERROR                                                                = 1811;
exports.ER_TABLESPACE_MISSING                                                            = 1812;
exports.ER_TABLESPACE_EXISTS                                                             = 1813;
exports.ER_TABLESPACE_DISCARDED                                                          = 1814;
exports.ER_INTERNAL_ERROR                                                                = 1815;
exports.ER_INNODB_IMPORT_ERROR                                                           = 1816;
exports.ER_INNODB_INDEX_CORRUPT                                                          = 1817;
exports.ER_INVALID_YEAR_COLUMN_LENGTH                                                    = 1818;
exports.ER_NOT_VALID_PASSWORD                                                            = 1819;
exports.ER_MUST_CHANGE_PASSWORD                                                          = 1820;
exports.ER_FK_NO_INDEX_CHILD                                                             = 1821;
exports.ER_FK_NO_INDEX_PARENT                                                            = 1822;
exports.ER_FK_FAIL_ADD_SYSTEM                                                            = 1823;
exports.ER_FK_CANNOT_OPEN_PARENT                                                         = 1824;
exports.ER_FK_INCORRECT_OPTION                                                           = 1825;
exports.ER_FK_DUP_NAME                                                                   = 1826;
exports.ER_PASSWORD_FORMAT                                                               = 1827;
exports.ER_FK_COLUMN_CANNOT_DROP                                                         = 1828;
exports.ER_FK_COLUMN_CANNOT_DROP_CHILD                                                   = 1829;
exports.ER_FK_COLUMN_NOT_NULL                                                            = 1830;
exports.ER_DUP_INDEX                                                                     = 1831;
exports.ER_FK_COLUMN_CANNOT_CHANGE                                                       = 1832;
exports.ER_FK_COLUMN_CANNOT_CHANGE_CHILD                                                 = 1833;
exports.ER_FK_CANNOT_DELETE_PARENT                                                       = 1834;
exports.ER_MALFORMED_PACKET                                                              = 1835;
exports.ER_READ_ONLY_MODE                                                                = 1836;
exports.ER_GTID_NEXT_TYPE_UNDEFINED_GROUP                                                = 1837;
exports.ER_VARIABLE_NOT_SETTABLE_IN_SP                                                   = 1838;
exports.ER_CANT_SET_GTID_PURGED_WHEN_GTID_MODE_IS_OFF                                    = 1839;
exports.ER_CANT_SET_GTID_PURGED_WHEN_GTID_EXECUTED_IS_NOT_EMPTY                          = 1840;
exports.ER_CANT_SET_GTID_PURGED_WHEN_OWNED_GTIDS_IS_NOT_EMPTY                            = 1841;
exports.ER_GTID_PURGED_WAS_CHANGED                                                       = 1842;
exports.ER_GTID_EXECUTED_WAS_CHANGED                                                     = 1843;
exports.ER_BINLOG_STMT_MODE_AND_NO_REPL_TABLES                                           = 1844;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED                                                 = 1845;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON                                          = 1846;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COPY                                     = 1847;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_PARTITION                                = 1848;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FK_RENAME                                = 1849;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COLUMN_TYPE                              = 1850;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FK_CHECK                                 = 1851;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_IGNORE                                   = 1852;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_NOPK                                     = 1853;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_AUTOINC                                  = 1854;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_HIDDEN_FTS                               = 1855;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_CHANGE_FTS                               = 1856;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FTS                                      = 1857;
exports.ER_SQL_SLAVE_SKIP_COUNTER_NOT_SETTABLE_IN_GTID_MODE                              = 1858;
exports.ER_DUP_UNKNOWN_IN_INDEX                                                          = 1859;
exports.ER_IDENT_CAUSES_TOO_LONG_PATH                                                    = 1860;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_NOT_NULL                                 = 1861;
exports.ER_MUST_CHANGE_PASSWORD_LOGIN                                                    = 1862;
exports.ER_ROW_IN_WRONG_PARTITION                                                        = 1863;
exports.ER_MTS_EVENT_BIGGER_PENDING_JOBS_SIZE_MAX                                        = 1864;
exports.ER_INNODB_NO_FT_USES_PARSER                                                      = 1865;
exports.ER_BINLOG_LOGICAL_CORRUPTION                                                     = 1866;
exports.ER_WARN_PURGE_LOG_IN_USE                                                         = 1867;
exports.ER_WARN_PURGE_LOG_IS_ACTIVE                                                      = 1868;
exports.ER_AUTO_INCREMENT_CONFLICT                                                       = 1869;
exports.WARN_ON_BLOCKHOLE_IN_RBR                                                         = 1870;
exports.ER_SLAVE_MI_INIT_REPOSITORY                                                      = 1871;
exports.ER_SLAVE_RLI_INIT_REPOSITORY                                                     = 1872;
exports.ER_ACCESS_DENIED_CHANGE_USER_ERROR                                               = 1873;
exports.ER_INNODB_READ_ONLY                                                              = 1874;
exports.ER_STOP_SLAVE_SQL_THREAD_TIMEOUT                                                 = 1875;
exports.ER_STOP_SLAVE_IO_THREAD_TIMEOUT                                                  = 1876;
exports.ER_TABLE_CORRUPT                                                                 = 1877;
exports.ER_TEMP_FILE_WRITE_FAILURE                                                       = 1878;
exports.ER_INNODB_FT_AUX_NOT_HEX_ID                                                      = 1879;
exports.ER_OLD_TEMPORALS_UPGRADED                                                        = 1880;
exports.ER_INNODB_FORCED_RECOVERY                                                        = 1881;
exports.ER_AES_INVALID_IV                                                                = 1882;
exports.ER_PLUGIN_CANNOT_BE_UNINSTALLED                                                  = 1883;
exports.ER_GTID_UNSAFE_BINLOG_SPLITTABLE_STATEMENT_AND_GTID_GROUP                        = 1884;
exports.ER_SLAVE_HAS_MORE_GTIDS_THAN_MASTER                                              = 1885;
exports.ER_MISSING_KEY                                                                   = 1886;
exports.WARN_NAMED_PIPE_ACCESS_EVERYONE                                                  = 1887;
exports.ER_FOUND_MISSING_GTIDS                                                           = 1888;
exports.ER_FILE_CORRUPT                                                                  = 3000;
exports.ER_ERROR_ON_MASTER                                                               = 3001;
exports.ER_INCONSISTENT_ERROR                                                            = 3002;
exports.ER_STORAGE_ENGINE_NOT_LOADED                                                     = 3003;
exports.ER_GET_STACKED_DA_WITHOUT_ACTIVE_HANDLER                                         = 3004;
exports.ER_WARN_LEGACY_SYNTAX_CONVERTED                                                  = 3005;
exports.ER_BINLOG_UNSAFE_FULLTEXT_PLUGIN                                                 = 3006;
exports.ER_CANNOT_DISCARD_TEMPORARY_TABLE                                                = 3007;
exports.ER_FK_DEPTH_EXCEEDED                                                             = 3008;
exports.ER_COL_COUNT_DOESNT_MATCH_PLEASE_UPDATE_V2                                       = 3009;
exports.ER_WARN_TRIGGER_DOESNT_HAVE_CREATED                                              = 3010;
exports.ER_REFERENCED_TRG_DOES_NOT_EXIST                                                 = 3011;
exports.ER_EXPLAIN_NOT_SUPPORTED                                                         = 3012;
exports.ER_INVALID_FIELD_SIZE                                                            = 3013;
exports.ER_MISSING_HA_CREATE_OPTION                                                      = 3014;
exports.ER_ENGINE_OUT_OF_MEMORY                                                          = 3015;
exports.ER_PASSWORD_EXPIRE_ANONYMOUS_USER                                                = 3016;
exports.ER_SLAVE_SQL_THREAD_MUST_STOP                                                    = 3017;
exports.ER_NO_FT_MATERIALIZED_SUBQUERY                                                   = 3018;
exports.ER_INNODB_UNDO_LOG_FULL                                                          = 3019;
exports.ER_INVALID_ARGUMENT_FOR_LOGARITHM                                                = 3020;
exports.ER_SLAVE_CHANNEL_IO_THREAD_MUST_STOP                                             = 3021;
exports.ER_WARN_OPEN_TEMP_TABLES_MUST_BE_ZERO                                            = 3022;
exports.ER_WARN_ONLY_MASTER_LOG_FILE_NO_POS                                              = 3023;
exports.ER_QUERY_TIMEOUT                                                                 = 3024;
exports.ER_NON_RO_SELECT_DISABLE_TIMER                                                   = 3025;
exports.ER_DUP_LIST_ENTRY                                                                = 3026;
exports.ER_SQL_MODE_NO_EFFECT                                                            = 3027;
exports.ER_AGGREGATE_ORDER_FOR_UNION                                                     = 3028;
exports.ER_AGGREGATE_ORDER_NON_AGG_QUERY                                                 = 3029;
exports.ER_SLAVE_WORKER_STOPPED_PREVIOUS_THD_ERROR                                       = 3030;
exports.ER_DONT_SUPPORT_SLAVE_PRESERVE_COMMIT_ORDER                                      = 3031;
exports.ER_SERVER_OFFLINE_MODE                                                           = 3032;
exports.ER_GIS_DIFFERENT_SRIDS                                                           = 3033;
exports.ER_GIS_UNSUPPORTED_ARGUMENT                                                      = 3034;
exports.ER_GIS_UNKNOWN_ERROR                                                             = 3035;
exports.ER_GIS_UNKNOWN_EXCEPTION                                                         = 3036;
exports.ER_GIS_INVALID_DATA                                                              = 3037;
exports.ER_BOOST_GEOMETRY_EMPTY_INPUT_EXCEPTION                                          = 3038;
exports.ER_BOOST_GEOMETRY_CENTROID_EXCEPTION                                             = 3039;
exports.ER_BOOST_GEOMETRY_OVERLAY_INVALID_INPUT_EXCEPTION                                = 3040;
exports.ER_BOOST_GEOMETRY_TURN_INFO_EXCEPTION                                            = 3041;
exports.ER_BOOST_GEOMETRY_SELF_INTERSECTION_POINT_EXCEPTION                              = 3042;
exports.ER_BOOST_GEOMETRY_UNKNOWN_EXCEPTION                                              = 3043;
exports.ER_STD_BAD_ALLOC_ERROR                                                           = 3044;
exports.ER_STD_DOMAIN_ERROR                                                              = 3045;
exports.ER_STD_LENGTH_ERROR                                                              = 3046;
exports.ER_STD_INVALID_ARGUMENT                                                          = 3047;
exports.ER_STD_OUT_OF_RANGE_ERROR                                                        = 3048;
exports.ER_STD_OVERFLOW_ERROR                                                            = 3049;
exports.ER_STD_RANGE_ERROR                                                               = 3050;
exports.ER_STD_UNDERFLOW_ERROR                                                           = 3051;
exports.ER_STD_LOGIC_ERROR                                                               = 3052;
exports.ER_STD_RUNTIME_ERROR                                                             = 3053;
exports.ER_STD_UNKNOWN_EXCEPTION                                                         = 3054;
exports.ER_GIS_DATA_WRONG_ENDIANESS                                                      = 3055;
exports.ER_CHANGE_MASTER_PASSWORD_LENGTH                                                 = 3056;
exports.ER_USER_LOCK_WRONG_NAME                                                          = 3057;
exports.ER_USER_LOCK_DEADLOCK                                                            = 3058;
exports.ER_REPLACE_INACCESSIBLE_ROWS                                                     = 3059;
exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_GIS                                      = 3060;
exports.ER_ILLEGAL_USER_VAR                                                              = 3061;
exports.ER_GTID_MODE_OFF                                                                 = 3062;
exports.ER_UNSUPPORTED_BY_REPLICATION_THREAD                                             = 3063;
exports.ER_INCORRECT_TYPE                                                                = 3064;
exports.ER_FIELD_IN_ORDER_NOT_SELECT                                                     = 3065;
exports.ER_AGGREGATE_IN_ORDER_NOT_SELECT                                                 = 3066;
exports.ER_INVALID_RPL_WILD_TABLE_FILTER_PATTERN                                         = 3067;
exports.ER_NET_OK_PACKET_TOO_LARGE                                                       = 3068;
exports.ER_INVALID_JSON_DATA                                                             = 3069;
exports.ER_INVALID_GEOJSON_MISSING_MEMBER                                                = 3070;
exports.ER_INVALID_GEOJSON_WRONG_TYPE                                                    = 3071;
exports.ER_INVALID_GEOJSON_UNSPECIFIED                                                   = 3072;
exports.ER_DIMENSION_UNSUPPORTED                                                         = 3073;
exports.ER_SLAVE_CHANNEL_DOES_NOT_EXIST                                                  = 3074;
exports.ER_SLAVE_MULTIPLE_CHANNELS_HOST_PORT                                             = 3075;
exports.ER_SLAVE_CHANNEL_NAME_INVALID_OR_TOO_LONG                                        = 3076;
exports.ER_SLAVE_NEW_CHANNEL_WRONG_REPOSITORY                                            = 3077;
exports.ER_SLAVE_CHANNEL_DELETE                                                          = 3078;
exports.ER_SLAVE_MULTIPLE_CHANNELS_CMD                                                   = 3079;
exports.ER_SLAVE_MAX_CHANNELS_EXCEEDED                                                   = 3080;
exports.ER_SLAVE_CHANNEL_MUST_STOP                                                       = 3081;
exports.ER_SLAVE_CHANNEL_NOT_RUNNING                                                     = 3082;
exports.ER_SLAVE_CHANNEL_WAS_RUNNING                                                     = 3083;
exports.ER_SLAVE_CHANNEL_WAS_NOT_RUNNING                                                 = 3084;
exports.ER_SLAVE_CHANNEL_SQL_THREAD_MUST_STOP                                            = 3085;
exports.ER_SLAVE_CHANNEL_SQL_SKIP_COUNTER                                                = 3086;
exports.ER_WRONG_FIELD_WITH_GROUP_V2                                                     = 3087;
exports.ER_MIX_OF_GROUP_FUNC_AND_FIELDS_V2                                               = 3088;
exports.ER_WARN_DEPRECATED_SYSVAR_UPDATE                                                 = 3089;
exports.ER_WARN_DEPRECATED_SQLMODE                                                       = 3090;
exports.ER_CANNOT_LOG_PARTIAL_DROP_DATABASE_WITH_GTID                                    = 3091;
exports.ER_GROUP_REPLICATION_CONFIGURATION                                               = 3092;
exports.ER_GROUP_REPLICATION_RUNNING                                                     = 3093;
exports.ER_GROUP_REPLICATION_APPLIER_INIT_ERROR                                          = 3094;
exports.ER_GROUP_REPLICATION_STOP_APPLIER_THREAD_TIMEOUT                                 = 3095;
exports.ER_GROUP_REPLICATION_COMMUNICATION_LAYER_SESSION_ERROR                           = 3096;
exports.ER_GROUP_REPLICATION_COMMUNICATION_LAYER_JOIN_ERROR                              = 3097;
exports.ER_BEFORE_DML_VALIDATION_ERROR                                                   = 3098;
exports.ER_PREVENTS_VARIABLE_WITHOUT_RBR                                                 = 3099;
exports.ER_RUN_HOOK_ERROR                                                                = 3100;
exports.ER_TRANSACTION_ROLLBACK_DURING_COMMIT                                            = 3101;
exports.ER_GENERATED_COLUMN_FUNCTION_IS_NOT_ALLOWED                                      = 3102;
exports.ER_UNSUPPORTED_ALTER_INPLACE_ON_VIRTUAL_COLUMN                                   = 3103;
exports.ER_WRONG_FK_OPTION_FOR_GENERATED_COLUMN                                          = 3104;
exports.ER_NON_DEFAULT_VALUE_FOR_GENERATED_COLUMN                                        = 3105;
exports.ER_UNSUPPORTED_ACTION_ON_GENERATED_COLUMN                                        = 3106;
exports.ER_GENERATED_COLUMN_NON_PRIOR                                                    = 3107;
exports.ER_DEPENDENT_BY_GENERATED_COLUMN                                                 = 3108;
exports.ER_GENERATED_COLUMN_REF_AUTO_INC                                                 = 3109;
exports.ER_FEATURE_NOT_AVAILABLE                                                         = 3110;
exports.ER_CANT_SET_GTID_MODE                                                            = 3111;
exports.ER_CANT_USE_AUTO_POSITION_WITH_GTID_MODE_OFF                                     = 3112;
exports.ER_CANT_REPLICATE_ANONYMOUS_WITH_AUTO_POSITION                                   = 3113;
exports.ER_CANT_REPLICATE_ANONYMOUS_WITH_GTID_MODE_ON                                    = 3114;
exports.ER_CANT_REPLICATE_GTID_WITH_GTID_MODE_OFF                                        = 3115;
exports.ER_CANT_SET_ENFORCE_GTID_CONSISTENCY_ON_WITH_ONGOING_GTID_VIOLATING_TRANSACTIONS = 3116;
exports.ER_SET_ENFORCE_GTID_CONSISTENCY_WARN_WITH_ONGOING_GTID_VIOLATING_TRANSACTIONS    = 3117;
exports.ER_ACCOUNT_HAS_BEEN_LOCKED                                                       = 3118;
exports.ER_WRONG_TABLESPACE_NAME                                                         = 3119;
exports.ER_TABLESPACE_IS_NOT_EMPTY                                                       = 3120;
exports.ER_WRONG_FILE_NAME                                                               = 3121;
exports.ER_BOOST_GEOMETRY_INCONSISTENT_TURNS_EXCEPTION                                   = 3122;
exports.ER_WARN_OPTIMIZER_HINT_SYNTAX_ERROR                                              = 3123;
exports.ER_WARN_BAD_MAX_EXECUTION_TIME                                                   = 3124;
exports.ER_WARN_UNSUPPORTED_MAX_EXECUTION_TIME                                           = 3125;
exports.ER_WARN_CONFLICTING_HINT                                                         = 3126;
exports.ER_WARN_UNKNOWN_QB_NAME                                                          = 3127;
exports.ER_UNRESOLVED_HINT_NAME                                                          = 3128;
exports.ER_WARN_ON_MODIFYING_GTID_EXECUTED_TABLE                                         = 3129;
exports.ER_PLUGGABLE_PROTOCOL_COMMAND_NOT_SUPPORTED                                      = 3130;
exports.ER_LOCKING_SERVICE_WRONG_NAME                                                    = 3131;
exports.ER_LOCKING_SERVICE_DEADLOCK                                                      = 3132;
exports.ER_LOCKING_SERVICE_TIMEOUT                                                       = 3133;
exports.ER_GIS_MAX_POINTS_IN_GEOMETRY_OVERFLOWED                                         = 3134;
exports.ER_SQL_MODE_MERGED                                                               = 3135;
exports.ER_VTOKEN_PLUGIN_TOKEN_MISMATCH                                                  = 3136;
exports.ER_VTOKEN_PLUGIN_TOKEN_NOT_FOUND                                                 = 3137;
exports.ER_CANT_SET_VARIABLE_WHEN_OWNING_GTID                                            = 3138;
exports.ER_SLAVE_CHANNEL_OPERATION_NOT_ALLOWED                                           = 3139;
exports.ER_INVALID_JSON_TEXT                                                             = 3140;
exports.ER_INVALID_JSON_TEXT_IN_PARAM                                                    = 3141;
exports.ER_INVALID_JSON_BINARY_DATA                                                      = 3142;
exports.ER_INVALID_JSON_PATH                                                             = 3143;
exports.ER_INVALID_JSON_CHARSET                                                          = 3144;
exports.ER_INVALID_JSON_CHARSET_IN_FUNCTION                                              = 3145;
exports.ER_INVALID_TYPE_FOR_JSON                                                         = 3146;
exports.ER_INVALID_CAST_TO_JSON                                                          = 3147;
exports.ER_INVALID_JSON_PATH_CHARSET                                                     = 3148;
exports.ER_INVALID_JSON_PATH_WILDCARD                                                    = 3149;
exports.ER_JSON_VALUE_TOO_BIG                                                            = 3150;
exports.ER_JSON_KEY_TOO_BIG                                                              = 3151;
exports.ER_JSON_USED_AS_KEY                                                              = 3152;
exports.ER_JSON_VACUOUS_PATH                                                             = 3153;
exports.ER_JSON_BAD_ONE_OR_ALL_ARG                                                       = 3154;
exports.ER_NUMERIC_JSON_VALUE_OUT_OF_RANGE                                               = 3155;
exports.ER_INVALID_JSON_VALUE_FOR_CAST                                                   = 3156;
exports.ER_JSON_DOCUMENT_TOO_DEEP                                                        = 3157;
exports.ER_JSON_DOCUMENT_NULL_KEY                                                        = 3158;
exports.ER_SECURE_TRANSPORT_REQUIRED                                                     = 3159;
exports.ER_NO_SECURE_TRANSPORTS_CONFIGURED                                               = 3160;
exports.ER_DISABLED_STORAGE_ENGINE                                                       = 3161;
exports.ER_USER_DOES_NOT_EXIST                                                           = 3162;
exports.ER_USER_ALREADY_EXISTS                                                           = 3163;
exports.ER_AUDIT_API_ABORT                                                               = 3164;
exports.ER_INVALID_JSON_PATH_ARRAY_CELL                                                  = 3165;
exports.ER_BUFPOOL_RESIZE_INPROGRESS                                                     = 3166;
exports.ER_FEATURE_DISABLED_SEE_DOC                                                      = 3167;
exports.ER_SERVER_ISNT_AVAILABLE                                                         = 3168;
exports.ER_SESSION_WAS_KILLED                                                            = 3169;
exports.ER_CAPACITY_EXCEEDED                                                             = 3170;
exports.ER_CAPACITY_EXCEEDED_IN_RANGE_OPTIMIZER                                          = 3171;
exports.ER_TABLE_NEEDS_UPG_PART                                                          = 3172;
exports.ER_CANT_WAIT_FOR_EXECUTED_GTID_SET_WHILE_OWNING_A_GTID                           = 3173;
exports.ER_CANNOT_ADD_FOREIGN_BASE_COL_VIRTUAL                                           = 3174;
exports.ER_CANNOT_CREATE_VIRTUAL_INDEX_CONSTRAINT                                        = 3175;
exports.ER_ERROR_ON_MODIFYING_GTID_EXECUTED_TABLE                                        = 3176;
exports.ER_LOCK_REFUSED_BY_ENGINE                                                        = 3177;
exports.ER_UNSUPPORTED_ALTER_ONLINE_ON_VIRTUAL_COLUMN                                    = 3178;
exports.ER_MASTER_KEY_ROTATION_NOT_SUPPORTED_BY_SE                                       = 3179;
exports.ER_MASTER_KEY_ROTATION_ERROR_BY_SE                                               = 3180;
exports.ER_MASTER_KEY_ROTATION_BINLOG_FAILED                                             = 3181;
exports.ER_MASTER_KEY_ROTATION_SE_UNAVAILABLE                                            = 3182;
exports.ER_TABLESPACE_CANNOT_ENCRYPT                                                     = 3183;
exports.ER_INVALID_ENCRYPTION_OPTION                                                     = 3184;
exports.ER_CANNOT_FIND_KEY_IN_KEYRING                                                    = 3185;
exports.ER_CAPACITY_EXCEEDED_IN_PARSER                                                   = 3186;
exports.ER_UNSUPPORTED_ALTER_ENCRYPTION_INPLACE                                          = 3187;
exports.ER_KEYRING_UDF_KEYRING_SERVICE_ERROR                                             = 3188;
exports.ER_USER_COLUMN_OLD_LENGTH                                                        = 3189;
exports.ER_CANT_RESET_MASTER                                                             = 3190;
exports.ER_GROUP_REPLICATION_MAX_GROUP_SIZE                                              = 3191;
exports.ER_CANNOT_ADD_FOREIGN_BASE_COL_STORED                                            = 3192;
exports.ER_TABLE_REFERENCED                                                              = 3193;
exports.ER_PARTITION_ENGINE_DEPRECATED_FOR_TABLE                                         = 3194;
exports.ER_WARN_USING_GEOMFROMWKB_TO_SET_SRID_ZERO                                       = 3195;
exports.ER_WARN_USING_GEOMFROMWKB_TO_SET_SRID                                            = 3196;
exports.ER_XA_RETRY                                                                      = 3197;
exports.ER_KEYRING_AWS_UDF_AWS_KMS_ERROR                                                 = 3198;
exports.ER_BINLOG_UNSAFE_XA                                                              = 3199;
exports.ER_UDF_ERROR                                                                     = 3200;
exports.ER_KEYRING_MIGRATION_FAILURE                                                     = 3201;
exports.ER_KEYRING_ACCESS_DENIED_ERROR                                                   = 3202;
exports.ER_KEYRING_MIGRATION_STATUS                                                      = 3203;
exports.ER_PLUGIN_FAILED_TO_OPEN_TABLES                                                  = 3204;
exports.ER_PLUGIN_FAILED_TO_OPEN_TABLE                                                   = 3205;
exports.ER_AUDIT_LOG_NO_KEYRING_PLUGIN_INSTALLED                                         = 3206;
exports.ER_AUDIT_LOG_ENCRYPTION_PASSWORD_HAS_NOT_BEEN_SET                                = 3207;
exports.ER_AUDIT_LOG_COULD_NOT_CREATE_AES_KEY                                            = 3208;
exports.ER_AUDIT_LOG_ENCRYPTION_PASSWORD_CANNOT_BE_FETCHED                               = 3209;
exports.ER_AUDIT_LOG_JSON_FILTERING_NOT_ENABLED                                          = 3210;
exports.ER_AUDIT_LOG_UDF_INSUFFICIENT_PRIVILEGE                                          = 3211;
exports.ER_AUDIT_LOG_SUPER_PRIVILEGE_REQUIRED                                            = 3212;
exports.ER_COULD_NOT_REINITIALIZE_AUDIT_LOG_FILTERS                                      = 3213;
exports.ER_AUDIT_LOG_UDF_INVALID_ARGUMENT_TYPE                                           = 3214;
exports.ER_AUDIT_LOG_UDF_INVALID_ARGUMENT_COUNT                                          = 3215;
exports.ER_AUDIT_LOG_HAS_NOT_BEEN_INSTALLED                                              = 3216;
exports.ER_AUDIT_LOG_UDF_READ_INVALID_MAX_ARRAY_LENGTH_ARG_TYPE                          = 3217;
exports.ER_AUDIT_LOG_UDF_READ_INVALID_MAX_ARRAY_LENGTH_ARG_VALUE                         = 3218;
exports.ER_AUDIT_LOG_JSON_FILTER_PARSING_ERROR                                           = 3219;
exports.ER_AUDIT_LOG_JSON_FILTER_NAME_CANNOT_BE_EMPTY                                    = 3220;
exports.ER_AUDIT_LOG_JSON_USER_NAME_CANNOT_BE_EMPTY                                      = 3221;
exports.ER_AUDIT_LOG_JSON_FILTER_DOES_NOT_EXISTS                                         = 3222;
exports.ER_AUDIT_LOG_USER_FIRST_CHARACTER_MUST_BE_ALPHANUMERIC                           = 3223;
exports.ER_AUDIT_LOG_USER_NAME_INVALID_CHARACTER                                         = 3224;
exports.ER_AUDIT_LOG_HOST_NAME_INVALID_CHARACTER                                         = 3225;
exports.WARN_DEPRECATED_MAXDB_SQL_MODE_FOR_TIMESTAMP                                     = 3226;
exports.ER_XA_REPLICATION_FILTERS                                                        = 3227;
exports.ER_CANT_OPEN_ERROR_LOG                                                           = 3228;
exports.ER_GROUPING_ON_TIMESTAMP_IN_DST                                                  = 3229;
exports.ER_CANT_START_SERVER_NAMED_PIPE                                                  = 3230;

// Lookup-by-number table
exports[1]    = 'EE_CANTCREATEFILE';
exports[2]    = 'EE_READ';
exports[3]    = 'EE_WRITE';
exports[4]    = 'EE_BADCLOSE';
exports[5]    = 'EE_OUTOFMEMORY';
exports[6]    = 'EE_DELETE';
exports[7]    = 'EE_LINK';
exports[9]    = 'EE_EOFERR';
exports[10]   = 'EE_CANTLOCK';
exports[11]   = 'EE_CANTUNLOCK';
exports[12]   = 'EE_DIR';
exports[13]   = 'EE_STAT';
exports[14]   = 'EE_CANT_CHSIZE';
exports[15]   = 'EE_CANT_OPEN_STREAM';
exports[16]   = 'EE_GETWD';
exports[17]   = 'EE_SETWD';
exports[18]   = 'EE_LINK_WARNING';
exports[19]   = 'EE_OPEN_WARNING';
exports[20]   = 'EE_DISK_FULL';
exports[21]   = 'EE_CANT_MKDIR';
exports[22]   = 'EE_UNKNOWN_CHARSET';
exports[23]   = 'EE_OUT_OF_FILERESOURCES';
exports[24]   = 'EE_CANT_READLINK';
exports[25]   = 'EE_CANT_SYMLINK';
exports[26]   = 'EE_REALPATH';
exports[27]   = 'EE_SYNC';
exports[28]   = 'EE_UNKNOWN_COLLATION';
exports[29]   = 'EE_FILENOTFOUND';
exports[30]   = 'EE_FILE_NOT_CLOSED';
exports[31]   = 'EE_CHANGE_OWNERSHIP';
exports[32]   = 'EE_CHANGE_PERMISSIONS';
exports[33]   = 'EE_CANT_SEEK';
exports[34]   = 'EE_CAPACITY_EXCEEDED';
exports[120]  = 'HA_ERR_KEY_NOT_FOUND';
exports[121]  = 'HA_ERR_FOUND_DUPP_KEY';
exports[122]  = 'HA_ERR_INTERNAL_ERROR';
exports[123]  = 'HA_ERR_RECORD_CHANGED';
exports[124]  = 'HA_ERR_WRONG_INDEX';
exports[126]  = 'HA_ERR_CRASHED';
exports[127]  = 'HA_ERR_WRONG_IN_RECORD';
exports[128]  = 'HA_ERR_OUT_OF_MEM';
exports[130]  = 'HA_ERR_NOT_A_TABLE';
exports[131]  = 'HA_ERR_WRONG_COMMAND';
exports[132]  = 'HA_ERR_OLD_FILE';
exports[133]  = 'HA_ERR_NO_ACTIVE_RECORD';
exports[134]  = 'HA_ERR_RECORD_DELETED';
exports[135]  = 'HA_ERR_RECORD_FILE_FULL';
exports[136]  = 'HA_ERR_INDEX_FILE_FULL';
exports[137]  = 'HA_ERR_END_OF_FILE';
exports[138]  = 'HA_ERR_UNSUPPORTED';
exports[139]  = 'HA_ERR_TOO_BIG_ROW';
exports[140]  = 'HA_WRONG_CREATE_OPTION';
exports[141]  = 'HA_ERR_FOUND_DUPP_UNIQUE';
exports[142]  = 'HA_ERR_UNKNOWN_CHARSET';
exports[143]  = 'HA_ERR_WRONG_MRG_TABLE_DEF';
exports[144]  = 'HA_ERR_CRASHED_ON_REPAIR';
exports[145]  = 'HA_ERR_CRASHED_ON_USAGE';
exports[146]  = 'HA_ERR_LOCK_WAIT_TIMEOUT';
exports[147]  = 'HA_ERR_LOCK_TABLE_FULL';
exports[148]  = 'HA_ERR_READ_ONLY_TRANSACTION';
exports[149]  = 'HA_ERR_LOCK_DEADLOCK';
exports[150]  = 'HA_ERR_CANNOT_ADD_FOREIGN';
exports[151]  = 'HA_ERR_NO_REFERENCED_ROW';
exports[152]  = 'HA_ERR_ROW_IS_REFERENCED';
exports[153]  = 'HA_ERR_NO_SAVEPOINT';
exports[154]  = 'HA_ERR_NON_UNIQUE_BLOCK_SIZE';
exports[155]  = 'HA_ERR_NO_SUCH_TABLE';
exports[156]  = 'HA_ERR_TABLE_EXIST';
exports[157]  = 'HA_ERR_NO_CONNECTION';
exports[158]  = 'HA_ERR_NULL_IN_SPATIAL';
exports[159]  = 'HA_ERR_TABLE_DEF_CHANGED';
exports[160]  = 'HA_ERR_NO_PARTITION_FOUND';
exports[161]  = 'HA_ERR_RBR_LOGGING_FAILED';
exports[162]  = 'HA_ERR_DROP_INDEX_FK';
exports[163]  = 'HA_ERR_FOREIGN_DUPLICATE_KEY';
exports[164]  = 'HA_ERR_TABLE_NEEDS_UPGRADE';
exports[165]  = 'HA_ERR_TABLE_READONLY';
exports[166]  = 'HA_ERR_AUTOINC_READ_FAILED';
exports[167]  = 'HA_ERR_AUTOINC_ERANGE';
exports[168]  = 'HA_ERR_GENERIC';
exports[169]  = 'HA_ERR_RECORD_IS_THE_SAME';
exports[170]  = 'HA_ERR_LOGGING_IMPOSSIBLE';
exports[171]  = 'HA_ERR_CORRUPT_EVENT';
exports[172]  = 'HA_ERR_NEW_FILE';
exports[173]  = 'HA_ERR_ROWS_EVENT_APPLY';
exports[174]  = 'HA_ERR_INITIALIZATION';
exports[175]  = 'HA_ERR_FILE_TOO_SHORT';
exports[176]  = 'HA_ERR_WRONG_CRC';
exports[177]  = 'HA_ERR_TOO_MANY_CONCURRENT_TRXS';
exports[178]  = 'HA_ERR_NOT_IN_LOCK_PARTITIONS';
exports[179]  = 'HA_ERR_INDEX_COL_TOO_LONG';
exports[180]  = 'HA_ERR_INDEX_CORRUPT';
exports[181]  = 'HA_ERR_UNDO_REC_TOO_BIG';
exports[182]  = 'HA_FTS_INVALID_DOCID';
exports[183]  = 'HA_ERR_TABLE_IN_FK_CHECK';
exports[184]  = 'HA_ERR_TABLESPACE_EXISTS';
exports[185]  = 'HA_ERR_TOO_MANY_FIELDS';
exports[186]  = 'HA_ERR_ROW_IN_WRONG_PARTITION';
exports[187]  = 'HA_ERR_INNODB_READ_ONLY';
exports[188]  = 'HA_ERR_FTS_EXCEED_RESULT_CACHE_LIMIT';
exports[189]  = 'HA_ERR_TEMP_FILE_WRITE_FAILURE';
exports[190]  = 'HA_ERR_INNODB_FORCED_RECOVERY';
exports[191]  = 'HA_ERR_FTS_TOO_MANY_WORDS_IN_PHRASE';
exports[192]  = 'HA_ERR_FK_DEPTH_EXCEEDED';
exports[193]  = 'HA_MISSING_CREATE_OPTION';
exports[194]  = 'HA_ERR_SE_OUT_OF_MEMORY';
exports[195]  = 'HA_ERR_TABLE_CORRUPT';
exports[196]  = 'HA_ERR_QUERY_INTERRUPTED';
exports[197]  = 'HA_ERR_TABLESPACE_MISSING';
exports[198]  = 'HA_ERR_TABLESPACE_IS_NOT_EMPTY';
exports[199]  = 'HA_ERR_WRONG_FILE_NAME';
exports[200]  = 'HA_ERR_NOT_ALLOWED_COMMAND';
exports[201]  = 'HA_ERR_COMPUTE_FAILED';
exports[1000] = 'ER_HASHCHK';
exports[1001] = 'ER_NISAMCHK';
exports[1002] = 'ER_NO';
exports[1003] = 'ER_YES';
exports[1004] = 'ER_CANT_CREATE_FILE';
exports[1005] = 'ER_CANT_CREATE_TABLE';
exports[1006] = 'ER_CANT_CREATE_DB';
exports[1007] = 'ER_DB_CREATE_EXISTS';
exports[1008] = 'ER_DB_DROP_EXISTS';
exports[1009] = 'ER_DB_DROP_DELETE';
exports[1010] = 'ER_DB_DROP_RMDIR';
exports[1011] = 'ER_CANT_DELETE_FILE';
exports[1012] = 'ER_CANT_FIND_SYSTEM_REC';
exports[1013] = 'ER_CANT_GET_STAT';
exports[1014] = 'ER_CANT_GET_WD';
exports[1015] = 'ER_CANT_LOCK';
exports[1016] = 'ER_CANT_OPEN_FILE';
exports[1017] = 'ER_FILE_NOT_FOUND';
exports[1018] = 'ER_CANT_READ_DIR';
exports[1019] = 'ER_CANT_SET_WD';
exports[1020] = 'ER_CHECKREAD';
exports[1021] = 'ER_DISK_FULL';
exports[1022] = 'ER_DUP_KEY';
exports[1023] = 'ER_ERROR_ON_CLOSE';
exports[1024] = 'ER_ERROR_ON_READ';
exports[1025] = 'ER_ERROR_ON_RENAME';
exports[1026] = 'ER_ERROR_ON_WRITE';
exports[1027] = 'ER_FILE_USED';
exports[1028] = 'ER_FILSORT_ABORT';
exports[1029] = 'ER_FORM_NOT_FOUND';
exports[1030] = 'ER_GET_ERRNO';
exports[1031] = 'ER_ILLEGAL_HA';
exports[1032] = 'ER_KEY_NOT_FOUND';
exports[1033] = 'ER_NOT_FORM_FILE';
exports[1034] = 'ER_NOT_KEYFILE';
exports[1035] = 'ER_OLD_KEYFILE';
exports[1036] = 'ER_OPEN_AS_READONLY';
exports[1037] = 'ER_OUTOFMEMORY';
exports[1038] = 'ER_OUT_OF_SORTMEMORY';
exports[1039] = 'ER_UNEXPECTED_EOF';
exports[1040] = 'ER_CON_COUNT_ERROR';
exports[1041] = 'ER_OUT_OF_RESOURCES';
exports[1042] = 'ER_BAD_HOST_ERROR';
exports[1043] = 'ER_HANDSHAKE_ERROR';
exports[1044] = 'ER_DBACCESS_DENIED_ERROR';
exports[1045] = 'ER_ACCESS_DENIED_ERROR';
exports[1046] = 'ER_NO_DB_ERROR';
exports[1047] = 'ER_UNKNOWN_COM_ERROR';
exports[1048] = 'ER_BAD_NULL_ERROR';
exports[1049] = 'ER_BAD_DB_ERROR';
exports[1050] = 'ER_TABLE_EXISTS_ERROR';
exports[1051] = 'ER_BAD_TABLE_ERROR';
exports[1052] = 'ER_NON_UNIQ_ERROR';
exports[1053] = 'ER_SERVER_SHUTDOWN';
exports[1054] = 'ER_BAD_FIELD_ERROR';
exports[1055] = 'ER_WRONG_FIELD_WITH_GROUP';
exports[1056] = 'ER_WRONG_GROUP_FIELD';
exports[1057] = 'ER_WRONG_SUM_SELECT';
exports[1058] = 'ER_WRONG_VALUE_COUNT';
exports[1059] = 'ER_TOO_LONG_IDENT';
exports[1060] = 'ER_DUP_FIELDNAME';
exports[1061] = 'ER_DUP_KEYNAME';
exports[1062] = 'ER_DUP_ENTRY';
exports[1063] = 'ER_WRONG_FIELD_SPEC';
exports[1064] = 'ER_PARSE_ERROR';
exports[1065] = 'ER_EMPTY_QUERY';
exports[1066] = 'ER_NONUNIQ_TABLE';
exports[1067] = 'ER_INVALID_DEFAULT';
exports[1068] = 'ER_MULTIPLE_PRI_KEY';
exports[1069] = 'ER_TOO_MANY_KEYS';
exports[1070] = 'ER_TOO_MANY_KEY_PARTS';
exports[1071] = 'ER_TOO_LONG_KEY';
exports[1072] = 'ER_KEY_COLUMN_DOES_NOT_EXITS';
exports[1073] = 'ER_BLOB_USED_AS_KEY';
exports[1074] = 'ER_TOO_BIG_FIELDLENGTH';
exports[1075] = 'ER_WRONG_AUTO_KEY';
exports[1076] = 'ER_READY';
exports[1077] = 'ER_NORMAL_SHUTDOWN';
exports[1078] = 'ER_GOT_SIGNAL';
exports[1079] = 'ER_SHUTDOWN_COMPLETE';
exports[1080] = 'ER_FORCING_CLOSE';
exports[1081] = 'ER_IPSOCK_ERROR';
exports[1082] = 'ER_NO_SUCH_INDEX';
exports[1083] = 'ER_WRONG_FIELD_TERMINATORS';
exports[1084] = 'ER_BLOBS_AND_NO_TERMINATED';
exports[1085] = 'ER_TEXTFILE_NOT_READABLE';
exports[1086] = 'ER_FILE_EXISTS_ERROR';
exports[1087] = 'ER_LOAD_INFO';
exports[1088] = 'ER_ALTER_INFO';
exports[1089] = 'ER_WRONG_SUB_KEY';
exports[1090] = 'ER_CANT_REMOVE_ALL_FIELDS';
exports[1091] = 'ER_CANT_DROP_FIELD_OR_KEY';
exports[1092] = 'ER_INSERT_INFO';
exports[1093] = 'ER_UPDATE_TABLE_USED';
exports[1094] = 'ER_NO_SUCH_THREAD';
exports[1095] = 'ER_KILL_DENIED_ERROR';
exports[1096] = 'ER_NO_TABLES_USED';
exports[1097] = 'ER_TOO_BIG_SET';
exports[1098] = 'ER_NO_UNIQUE_LOGFILE';
exports[1099] = 'ER_TABLE_NOT_LOCKED_FOR_WRITE';
exports[1100] = 'ER_TABLE_NOT_LOCKED';
exports[1101] = 'ER_BLOB_CANT_HAVE_DEFAULT';
exports[1102] = 'ER_WRONG_DB_NAME';
exports[1103] = 'ER_WRONG_TABLE_NAME';
exports[1104] = 'ER_TOO_BIG_SELECT';
exports[1105] = 'ER_UNKNOWN_ERROR';
exports[1106] = 'ER_UNKNOWN_PROCEDURE';
exports[1107] = 'ER_WRONG_PARAMCOUNT_TO_PROCEDURE';
exports[1108] = 'ER_WRONG_PARAMETERS_TO_PROCEDURE';
exports[1109] = 'ER_UNKNOWN_TABLE';
exports[1110] = 'ER_FIELD_SPECIFIED_TWICE';
exports[1111] = 'ER_INVALID_GROUP_FUNC_USE';
exports[1112] = 'ER_UNSUPPORTED_EXTENSION';
exports[1113] = 'ER_TABLE_MUST_HAVE_COLUMNS';
exports[1114] = 'ER_RECORD_FILE_FULL';
exports[1115] = 'ER_UNKNOWN_CHARACTER_SET';
exports[1116] = 'ER_TOO_MANY_TABLES';
exports[1117] = 'ER_TOO_MANY_FIELDS';
exports[1118] = 'ER_TOO_BIG_ROWSIZE';
exports[1119] = 'ER_STACK_OVERRUN';
exports[1120] = 'ER_WRONG_OUTER_JOIN';
exports[1121] = 'ER_NULL_COLUMN_IN_INDEX';
exports[1122] = 'ER_CANT_FIND_UDF';
exports[1123] = 'ER_CANT_INITIALIZE_UDF';
exports[1124] = 'ER_UDF_NO_PATHS';
exports[1125] = 'ER_UDF_EXISTS';
exports[1126] = 'ER_CANT_OPEN_LIBRARY';
exports[1127] = 'ER_CANT_FIND_DL_ENTRY';
exports[1128] = 'ER_FUNCTION_NOT_DEFINED';
exports[1129] = 'ER_HOST_IS_BLOCKED';
exports[1130] = 'ER_HOST_NOT_PRIVILEGED';
exports[1131] = 'ER_PASSWORD_ANONYMOUS_USER';
exports[1132] = 'ER_PASSWORD_NOT_ALLOWED';
exports[1133] = 'ER_PASSWORD_NO_MATCH';
exports[1134] = 'ER_UPDATE_INFO';
exports[1135] = 'ER_CANT_CREATE_THREAD';
exports[1136] = 'ER_WRONG_VALUE_COUNT_ON_ROW';
exports[1137] = 'ER_CANT_REOPEN_TABLE';
exports[1138] = 'ER_INVALID_USE_OF_NULL';
exports[1139] = 'ER_REGEXP_ERROR';
exports[1140] = 'ER_MIX_OF_GROUP_FUNC_AND_FIELDS';
exports[1141] = 'ER_NONEXISTING_GRANT';
exports[1142] = 'ER_TABLEACCESS_DENIED_ERROR';
exports[1143] = 'ER_COLUMNACCESS_DENIED_ERROR';
exports[1144] = 'ER_ILLEGAL_GRANT_FOR_TABLE';
exports[1145] = 'ER_GRANT_WRONG_HOST_OR_USER';
exports[1146] = 'ER_NO_SUCH_TABLE';
exports[1147] = 'ER_NONEXISTING_TABLE_GRANT';
exports[1148] = 'ER_NOT_ALLOWED_COMMAND';
exports[1149] = 'ER_SYNTAX_ERROR';
exports[1150] = 'ER_DELAYED_CANT_CHANGE_LOCK';
exports[1151] = 'ER_TOO_MANY_DELAYED_THREADS';
exports[1152] = 'ER_ABORTING_CONNECTION';
exports[1153] = 'ER_NET_PACKET_TOO_LARGE';
exports[1154] = 'ER_NET_READ_ERROR_FROM_PIPE';
exports[1155] = 'ER_NET_FCNTL_ERROR';
exports[1156] = 'ER_NET_PACKETS_OUT_OF_ORDER';
exports[1157] = 'ER_NET_UNCOMPRESS_ERROR';
exports[1158] = 'ER_NET_READ_ERROR';
exports[1159] = 'ER_NET_READ_INTERRUPTED';
exports[1160] = 'ER_NET_ERROR_ON_WRITE';
exports[1161] = 'ER_NET_WRITE_INTERRUPTED';
exports[1162] = 'ER_TOO_LONG_STRING';
exports[1163] = 'ER_TABLE_CANT_HANDLE_BLOB';
exports[1164] = 'ER_TABLE_CANT_HANDLE_AUTO_INCREMENT';
exports[1165] = 'ER_DELAYED_INSERT_TABLE_LOCKED';
exports[1166] = 'ER_WRONG_COLUMN_NAME';
exports[1167] = 'ER_WRONG_KEY_COLUMN';
exports[1168] = 'ER_WRONG_MRG_TABLE';
exports[1169] = 'ER_DUP_UNIQUE';
exports[1170] = 'ER_BLOB_KEY_WITHOUT_LENGTH';
exports[1171] = 'ER_PRIMARY_CANT_HAVE_NULL';
exports[1172] = 'ER_TOO_MANY_ROWS';
exports[1173] = 'ER_REQUIRES_PRIMARY_KEY';
exports[1174] = 'ER_NO_RAID_COMPILED';
exports[1175] = 'ER_UPDATE_WITHOUT_KEY_IN_SAFE_MODE';
exports[1176] = 'ER_KEY_DOES_NOT_EXITS';
exports[1177] = 'ER_CHECK_NO_SUCH_TABLE';
exports[1178] = 'ER_CHECK_NOT_IMPLEMENTED';
exports[1179] = 'ER_CANT_DO_THIS_DURING_AN_TRANSACTION';
exports[1180] = 'ER_ERROR_DURING_COMMIT';
exports[1181] = 'ER_ERROR_DURING_ROLLBACK';
exports[1182] = 'ER_ERROR_DURING_FLUSH_LOGS';
exports[1183] = 'ER_ERROR_DURING_CHECKPOINT';
exports[1184] = 'ER_NEW_ABORTING_CONNECTION';
exports[1185] = 'ER_DUMP_NOT_IMPLEMENTED';
exports[1186] = 'ER_FLUSH_MASTER_BINLOG_CLOSED';
exports[1187] = 'ER_INDEX_REBUILD';
exports[1188] = 'ER_MASTER';
exports[1189] = 'ER_MASTER_NET_READ';
exports[1190] = 'ER_MASTER_NET_WRITE';
exports[1191] = 'ER_FT_MATCHING_KEY_NOT_FOUND';
exports[1192] = 'ER_LOCK_OR_ACTIVE_TRANSACTION';
exports[1193] = 'ER_UNKNOWN_SYSTEM_VARIABLE';
exports[1194] = 'ER_CRASHED_ON_USAGE';
exports[1195] = 'ER_CRASHED_ON_REPAIR';
exports[1196] = 'ER_WARNING_NOT_COMPLETE_ROLLBACK';
exports[1197] = 'ER_TRANS_CACHE_FULL';
exports[1198] = 'ER_SLAVE_MUST_STOP';
exports[1199] = 'ER_SLAVE_NOT_RUNNING';
exports[1200] = 'ER_BAD_SLAVE';
exports[1201] = 'ER_MASTER_INFO';
exports[1202] = 'ER_SLAVE_THREAD';
exports[1203] = 'ER_TOO_MANY_USER_CONNECTIONS';
exports[1204] = 'ER_SET_CONSTANTS_ONLY';
exports[1205] = 'ER_LOCK_WAIT_TIMEOUT';
exports[1206] = 'ER_LOCK_TABLE_FULL';
exports[1207] = 'ER_READ_ONLY_TRANSACTION';
exports[1208] = 'ER_DROP_DB_WITH_READ_LOCK';
exports[1209] = 'ER_CREATE_DB_WITH_READ_LOCK';
exports[1210] = 'ER_WRONG_ARGUMENTS';
exports[1211] = 'ER_NO_PERMISSION_TO_CREATE_USER';
exports[1212] = 'ER_UNION_TABLES_IN_DIFFERENT_DIR';
exports[1213] = 'ER_LOCK_DEADLOCK';
exports[1214] = 'ER_TABLE_CANT_HANDLE_FT';
exports[1215] = 'ER_CANNOT_ADD_FOREIGN';
exports[1216] = 'ER_NO_REFERENCED_ROW';
exports[1217] = 'ER_ROW_IS_REFERENCED';
exports[1218] = 'ER_CONNECT_TO_MASTER';
exports[1219] = 'ER_QUERY_ON_MASTER';
exports[1220] = 'ER_ERROR_WHEN_EXECUTING_COMMAND';
exports[1221] = 'ER_WRONG_USAGE';
exports[1222] = 'ER_WRONG_NUMBER_OF_COLUMNS_IN_SELECT';
exports[1223] = 'ER_CANT_UPDATE_WITH_READLOCK';
exports[1224] = 'ER_MIXING_NOT_ALLOWED';
exports[1225] = 'ER_DUP_ARGUMENT';
exports[1226] = 'ER_USER_LIMIT_REACHED';
exports[1227] = 'ER_SPECIFIC_ACCESS_DENIED_ERROR';
exports[1228] = 'ER_LOCAL_VARIABLE';
exports[1229] = 'ER_GLOBAL_VARIABLE';
exports[1230] = 'ER_NO_DEFAULT';
exports[1231] = 'ER_WRONG_VALUE_FOR_VAR';
exports[1232] = 'ER_WRONG_TYPE_FOR_VAR';
exports[1233] = 'ER_VAR_CANT_BE_READ';
exports[1234] = 'ER_CANT_USE_OPTION_HERE';
exports[1235] = 'ER_NOT_SUPPORTED_YET';
exports[1236] = 'ER_MASTER_FATAL_ERROR_READING_BINLOG';
exports[1237] = 'ER_SLAVE_IGNORED_TABLE';
exports[1238] = 'ER_INCORRECT_GLOBAL_LOCAL_VAR';
exports[1239] = 'ER_WRONG_FK_DEF';
exports[1240] = 'ER_KEY_REF_DO_NOT_MATCH_TABLE_REF';
exports[1241] = 'ER_OPERAND_COLUMNS';
exports[1242] = 'ER_SUBQUERY_NO_1_ROW';
exports[1243] = 'ER_UNKNOWN_STMT_HANDLER';
exports[1244] = 'ER_CORRUPT_HELP_DB';
exports[1245] = 'ER_CYCLIC_REFERENCE';
exports[1246] = 'ER_AUTO_CONVERT';
exports[1247] = 'ER_ILLEGAL_REFERENCE';
exports[1248] = 'ER_DERIVED_MUST_HAVE_ALIAS';
exports[1249] = 'ER_SELECT_REDUCED';
exports[1250] = 'ER_TABLENAME_NOT_ALLOWED_HERE';
exports[1251] = 'ER_NOT_SUPPORTED_AUTH_MODE';
exports[1252] = 'ER_SPATIAL_CANT_HAVE_NULL';
exports[1253] = 'ER_COLLATION_CHARSET_MISMATCH';
exports[1254] = 'ER_SLAVE_WAS_RUNNING';
exports[1255] = 'ER_SLAVE_WAS_NOT_RUNNING';
exports[1256] = 'ER_TOO_BIG_FOR_UNCOMPRESS';
exports[1257] = 'ER_ZLIB_Z_MEM_ERROR';
exports[1258] = 'ER_ZLIB_Z_BUF_ERROR';
exports[1259] = 'ER_ZLIB_Z_DATA_ERROR';
exports[1260] = 'ER_CUT_VALUE_GROUP_CONCAT';
exports[1261] = 'ER_WARN_TOO_FEW_RECORDS';
exports[1262] = 'ER_WARN_TOO_MANY_RECORDS';
exports[1263] = 'ER_WARN_NULL_TO_NOTNULL';
exports[1264] = 'ER_WARN_DATA_OUT_OF_RANGE';
exports[1265] = 'WARN_DATA_TRUNCATED';
exports[1266] = 'ER_WARN_USING_OTHER_HANDLER';
exports[1267] = 'ER_CANT_AGGREGATE_2COLLATIONS';
exports[1268] = 'ER_DROP_USER';
exports[1269] = 'ER_REVOKE_GRANTS';
exports[1270] = 'ER_CANT_AGGREGATE_3COLLATIONS';
exports[1271] = 'ER_CANT_AGGREGATE_NCOLLATIONS';
exports[1272] = 'ER_VARIABLE_IS_NOT_STRUCT';
exports[1273] = 'ER_UNKNOWN_COLLATION';
exports[1274] = 'ER_SLAVE_IGNORED_SSL_PARAMS';
exports[1275] = 'ER_SERVER_IS_IN_SECURE_AUTH_MODE';
exports[1276] = 'ER_WARN_FIELD_RESOLVED';
exports[1277] = 'ER_BAD_SLAVE_UNTIL_COND';
exports[1278] = 'ER_MISSING_SKIP_SLAVE';
exports[1279] = 'ER_UNTIL_COND_IGNORED';
exports[1280] = 'ER_WRONG_NAME_FOR_INDEX';
exports[1281] = 'ER_WRONG_NAME_FOR_CATALOG';
exports[1282] = 'ER_WARN_QC_RESIZE';
exports[1283] = 'ER_BAD_FT_COLUMN';
exports[1284] = 'ER_UNKNOWN_KEY_CACHE';
exports[1285] = 'ER_WARN_HOSTNAME_WONT_WORK';
exports[1286] = 'ER_UNKNOWN_STORAGE_ENGINE';
exports[1287] = 'ER_WARN_DEPRECATED_SYNTAX';
exports[1288] = 'ER_NON_UPDATABLE_TABLE';
exports[1289] = 'ER_FEATURE_DISABLED';
exports[1290] = 'ER_OPTION_PREVENTS_STATEMENT';
exports[1291] = 'ER_DUPLICATED_VALUE_IN_TYPE';
exports[1292] = 'ER_TRUNCATED_WRONG_VALUE';
exports[1293] = 'ER_TOO_MUCH_AUTO_TIMESTAMP_COLS';
exports[1294] = 'ER_INVALID_ON_UPDATE';
exports[1295] = 'ER_UNSUPPORTED_PS';
exports[1296] = 'ER_GET_ERRMSG';
exports[1297] = 'ER_GET_TEMPORARY_ERRMSG';
exports[1298] = 'ER_UNKNOWN_TIME_ZONE';
exports[1299] = 'ER_WARN_INVALID_TIMESTAMP';
exports[1300] = 'ER_INVALID_CHARACTER_STRING';
exports[1301] = 'ER_WARN_ALLOWED_PACKET_OVERFLOWED';
exports[1302] = 'ER_CONFLICTING_DECLARATIONS';
exports[1303] = 'ER_SP_NO_RECURSIVE_CREATE';
exports[1304] = 'ER_SP_ALREADY_EXISTS';
exports[1305] = 'ER_SP_DOES_NOT_EXIST';
exports[1306] = 'ER_SP_DROP_FAILED';
exports[1307] = 'ER_SP_STORE_FAILED';
exports[1308] = 'ER_SP_LILABEL_MISMATCH';
exports[1309] = 'ER_SP_LABEL_REDEFINE';
exports[1310] = 'ER_SP_LABEL_MISMATCH';
exports[1311] = 'ER_SP_UNINIT_VAR';
exports[1312] = 'ER_SP_BADSELECT';
exports[1313] = 'ER_SP_BADRETURN';
exports[1314] = 'ER_SP_BADSTATEMENT';
exports[1315] = 'ER_UPDATE_LOG_DEPRECATED_IGNORED';
exports[1316] = 'ER_UPDATE_LOG_DEPRECATED_TRANSLATED';
exports[1317] = 'ER_QUERY_INTERRUPTED';
exports[1318] = 'ER_SP_WRONG_NO_OF_ARGS';
exports[1319] = 'ER_SP_COND_MISMATCH';
exports[1320] = 'ER_SP_NORETURN';
exports[1321] = 'ER_SP_NORETURNEND';
exports[1322] = 'ER_SP_BAD_CURSOR_QUERY';
exports[1323] = 'ER_SP_BAD_CURSOR_SELECT';
exports[1324] = 'ER_SP_CURSOR_MISMATCH';
exports[1325] = 'ER_SP_CURSOR_ALREADY_OPEN';
exports[1326] = 'ER_SP_CURSOR_NOT_OPEN';
exports[1327] = 'ER_SP_UNDECLARED_VAR';
exports[1328] = 'ER_SP_WRONG_NO_OF_FETCH_ARGS';
exports[1329] = 'ER_SP_FETCH_NO_DATA';
exports[1330] = 'ER_SP_DUP_PARAM';
exports[1331] = 'ER_SP_DUP_VAR';
exports[1332] = 'ER_SP_DUP_COND';
exports[1333] = 'ER_SP_DUP_CURS';
exports[1334] = 'ER_SP_CANT_ALTER';
exports[1335] = 'ER_SP_SUBSELECT_NYI';
exports[1336] = 'ER_STMT_NOT_ALLOWED_IN_SF_OR_TRG';
exports[1337] = 'ER_SP_VARCOND_AFTER_CURSHNDLR';
exports[1338] = 'ER_SP_CURSOR_AFTER_HANDLER';
exports[1339] = 'ER_SP_CASE_NOT_FOUND';
exports[1340] = 'ER_FPARSER_TOO_BIG_FILE';
exports[1341] = 'ER_FPARSER_BAD_HEADER';
exports[1342] = 'ER_FPARSER_EOF_IN_COMMENT';
exports[1343] = 'ER_FPARSER_ERROR_IN_PARAMETER';
exports[1344] = 'ER_FPARSER_EOF_IN_UNKNOWN_PARAMETER';
exports[1345] = 'ER_VIEW_NO_EXPLAIN';
exports[1346] = 'ER_FRM_UNKNOWN_TYPE';
exports[1347] = 'ER_WRONG_OBJECT';
exports[1348] = 'ER_NONUPDATEABLE_COLUMN';
exports[1349] = 'ER_VIEW_SELECT_DERIVED';
exports[1350] = 'ER_VIEW_SELECT_CLAUSE';
exports[1351] = 'ER_VIEW_SELECT_VARIABLE';
exports[1352] = 'ER_VIEW_SELECT_TMPTABLE';
exports[1353] = 'ER_VIEW_WRONG_LIST';
exports[1354] = 'ER_WARN_VIEW_MERGE';
exports[1355] = 'ER_WARN_VIEW_WITHOUT_KEY';
exports[1356] = 'ER_VIEW_INVALID';
exports[1357] = 'ER_SP_NO_DROP_SP';
exports[1358] = 'ER_SP_GOTO_IN_HNDLR';
exports[1359] = 'ER_TRG_ALREADY_EXISTS';
exports[1360] = 'ER_TRG_DOES_NOT_EXIST';
exports[1361] = 'ER_TRG_ON_VIEW_OR_TEMP_TABLE';
exports[1362] = 'ER_TRG_CANT_CHANGE_ROW';
exports[1363] = 'ER_TRG_NO_SUCH_ROW_IN_TRG';
exports[1364] = 'ER_NO_DEFAULT_FOR_FIELD';
exports[1365] = 'ER_DIVISION_BY_ZERO';
exports[1366] = 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD';
exports[1367] = 'ER_ILLEGAL_VALUE_FOR_TYPE';
exports[1368] = 'ER_VIEW_NONUPD_CHECK';
exports[1369] = 'ER_VIEW_CHECK_FAILED';
exports[1370] = 'ER_PROCACCESS_DENIED_ERROR';
exports[1371] = 'ER_RELAY_LOG_FAIL';
exports[1372] = 'ER_PASSWD_LENGTH';
exports[1373] = 'ER_UNKNOWN_TARGET_BINLOG';
exports[1374] = 'ER_IO_ERR_LOG_INDEX_READ';
exports[1375] = 'ER_BINLOG_PURGE_PROHIBITED';
exports[1376] = 'ER_FSEEK_FAIL';
exports[1377] = 'ER_BINLOG_PURGE_FATAL_ERR';
exports[1378] = 'ER_LOG_IN_USE';
exports[1379] = 'ER_LOG_PURGE_UNKNOWN_ERR';
exports[1380] = 'ER_RELAY_LOG_INIT';
exports[1381] = 'ER_NO_BINARY_LOGGING';
exports[1382] = 'ER_RESERVED_SYNTAX';
exports[1383] = 'ER_WSAS_FAILED';
exports[1384] = 'ER_DIFF_GROUPS_PROC';
exports[1385] = 'ER_NO_GROUP_FOR_PROC';
exports[1386] = 'ER_ORDER_WITH_PROC';
exports[1387] = 'ER_LOGGING_PROHIBIT_CHANGING_OF';
exports[1388] = 'ER_NO_FILE_MAPPING';
exports[1389] = 'ER_WRONG_MAGIC';
exports[1390] = 'ER_PS_MANY_PARAM';
exports[1391] = 'ER_KEY_PART_0';
exports[1392] = 'ER_VIEW_CHECKSUM';
exports[1393] = 'ER_VIEW_MULTIUPDATE';
exports[1394] = 'ER_VIEW_NO_INSERT_FIELD_LIST';
exports[1395] = 'ER_VIEW_DELETE_MERGE_VIEW';
exports[1396] = 'ER_CANNOT_USER';
exports[1397] = 'ER_XAER_NOTA';
exports[1398] = 'ER_XAER_INVAL';
exports[1399] = 'ER_XAER_RMFAIL';
exports[1400] = 'ER_XAER_OUTSIDE';
exports[1401] = 'ER_XAER_RMERR';
exports[1402] = 'ER_XA_RBROLLBACK';
exports[1403] = 'ER_NONEXISTING_PROC_GRANT';
exports[1404] = 'ER_PROC_AUTO_GRANT_FAIL';
exports[1405] = 'ER_PROC_AUTO_REVOKE_FAIL';
exports[1406] = 'ER_DATA_TOO_LONG';
exports[1407] = 'ER_SP_BAD_SQLSTATE';
exports[1408] = 'ER_STARTUP';
exports[1409] = 'ER_LOAD_FROM_FIXED_SIZE_ROWS_TO_VAR';
exports[1410] = 'ER_CANT_CREATE_USER_WITH_GRANT';
exports[1411] = 'ER_WRONG_VALUE_FOR_TYPE';
exports[1412] = 'ER_TABLE_DEF_CHANGED';
exports[1413] = 'ER_SP_DUP_HANDLER';
exports[1414] = 'ER_SP_NOT_VAR_ARG';
exports[1415] = 'ER_SP_NO_RETSET';
exports[1416] = 'ER_CANT_CREATE_GEOMETRY_OBJECT';
exports[1417] = 'ER_FAILED_ROUTINE_BREAK_BINLOG';
exports[1418] = 'ER_BINLOG_UNSAFE_ROUTINE';
exports[1419] = 'ER_BINLOG_CREATE_ROUTINE_NEED_SUPER';
exports[1420] = 'ER_EXEC_STMT_WITH_OPEN_CURSOR';
exports[1421] = 'ER_STMT_HAS_NO_OPEN_CURSOR';
exports[1422] = 'ER_COMMIT_NOT_ALLOWED_IN_SF_OR_TRG';
exports[1423] = 'ER_NO_DEFAULT_FOR_VIEW_FIELD';
exports[1424] = 'ER_SP_NO_RECURSION';
exports[1425] = 'ER_TOO_BIG_SCALE';
exports[1426] = 'ER_TOO_BIG_PRECISION';
exports[1427] = 'ER_M_BIGGER_THAN_D';
exports[1428] = 'ER_WRONG_LOCK_OF_SYSTEM_TABLE';
exports[1429] = 'ER_CONNECT_TO_FOREIGN_DATA_SOURCE';
exports[1430] = 'ER_QUERY_ON_FOREIGN_DATA_SOURCE';
exports[1431] = 'ER_FOREIGN_DATA_SOURCE_DOESNT_EXIST';
exports[1432] = 'ER_FOREIGN_DATA_STRING_INVALID_CANT_CREATE';
exports[1433] = 'ER_FOREIGN_DATA_STRING_INVALID';
exports[1434] = 'ER_CANT_CREATE_FEDERATED_TABLE';
exports[1435] = 'ER_TRG_IN_WRONG_SCHEMA';
exports[1436] = 'ER_STACK_OVERRUN_NEED_MORE';
exports[1437] = 'ER_TOO_LONG_BODY';
exports[1438] = 'ER_WARN_CANT_DROP_DEFAULT_KEYCACHE';
exports[1439] = 'ER_TOO_BIG_DISPLAYWIDTH';
exports[1440] = 'ER_XAER_DUPID';
exports[1441] = 'ER_DATETIME_FUNCTION_OVERFLOW';
exports[1442] = 'ER_CANT_UPDATE_USED_TABLE_IN_SF_OR_TRG';
exports[1443] = 'ER_VIEW_PREVENT_UPDATE';
exports[1444] = 'ER_PS_NO_RECURSION';
exports[1445] = 'ER_SP_CANT_SET_AUTOCOMMIT';
exports[1446] = 'ER_MALFORMED_DEFINER';
exports[1447] = 'ER_VIEW_FRM_NO_USER';
exports[1448] = 'ER_VIEW_OTHER_USER';
exports[1449] = 'ER_NO_SUCH_USER';
exports[1450] = 'ER_FORBID_SCHEMA_CHANGE';
exports[1451] = 'ER_ROW_IS_REFERENCED_2';
exports[1452] = 'ER_NO_REFERENCED_ROW_2';
exports[1453] = 'ER_SP_BAD_VAR_SHADOW';
exports[1454] = 'ER_TRG_NO_DEFINER';
exports[1455] = 'ER_OLD_FILE_FORMAT';
exports[1456] = 'ER_SP_RECURSION_LIMIT';
exports[1457] = 'ER_SP_PROC_TABLE_CORRUPT';
exports[1458] = 'ER_SP_WRONG_NAME';
exports[1459] = 'ER_TABLE_NEEDS_UPGRADE';
exports[1460] = 'ER_SP_NO_AGGREGATE';
exports[1461] = 'ER_MAX_PREPARED_STMT_COUNT_REACHED';
exports[1462] = 'ER_VIEW_RECURSIVE';
exports[1463] = 'ER_NON_GROUPING_FIELD_USED';
exports[1464] = 'ER_TABLE_CANT_HANDLE_SPKEYS';
exports[1465] = 'ER_NO_TRIGGERS_ON_SYSTEM_SCHEMA';
exports[1466] = 'ER_REMOVED_SPACES';
exports[1467] = 'ER_AUTOINC_READ_FAILED';
exports[1468] = 'ER_USERNAME';
exports[1469] = 'ER_HOSTNAME';
exports[1470] = 'ER_WRONG_STRING_LENGTH';
exports[1471] = 'ER_NON_INSERTABLE_TABLE';
exports[1472] = 'ER_ADMIN_WRONG_MRG_TABLE';
exports[1473] = 'ER_TOO_HIGH_LEVEL_OF_NESTING_FOR_SELECT';
exports[1474] = 'ER_NAME_BECOMES_EMPTY';
exports[1475] = 'ER_AMBIGUOUS_FIELD_TERM';
exports[1476] = 'ER_FOREIGN_SERVER_EXISTS';
exports[1477] = 'ER_FOREIGN_SERVER_DOESNT_EXIST';
exports[1478] = 'ER_ILLEGAL_HA_CREATE_OPTION';
exports[1479] = 'ER_PARTITION_REQUIRES_VALUES_ERROR';
exports[1480] = 'ER_PARTITION_WRONG_VALUES_ERROR';
exports[1481] = 'ER_PARTITION_MAXVALUE_ERROR';
exports[1482] = 'ER_PARTITION_SUBPARTITION_ERROR';
exports[1483] = 'ER_PARTITION_SUBPART_MIX_ERROR';
exports[1484] = 'ER_PARTITION_WRONG_NO_PART_ERROR';
exports[1485] = 'ER_PARTITION_WRONG_NO_SUBPART_ERROR';
exports[1486] = 'ER_WRONG_EXPR_IN_PARTITION_FUNC_ERROR';
exports[1487] = 'ER_NO_CONST_EXPR_IN_RANGE_OR_LIST_ERROR';
exports[1488] = 'ER_FIELD_NOT_FOUND_PART_ERROR';
exports[1489] = 'ER_LIST_OF_FIELDS_ONLY_IN_HASH_ERROR';
exports[1490] = 'ER_INCONSISTENT_PARTITION_INFO_ERROR';
exports[1491] = 'ER_PARTITION_FUNC_NOT_ALLOWED_ERROR';
exports[1492] = 'ER_PARTITIONS_MUST_BE_DEFINED_ERROR';
exports[1493] = 'ER_RANGE_NOT_INCREASING_ERROR';
exports[1494] = 'ER_INCONSISTENT_TYPE_OF_FUNCTIONS_ERROR';
exports[1495] = 'ER_MULTIPLE_DEF_CONST_IN_LIST_PART_ERROR';
exports[1496] = 'ER_PARTITION_ENTRY_ERROR';
exports[1497] = 'ER_MIX_HANDLER_ERROR';
exports[1498] = 'ER_PARTITION_NOT_DEFINED_ERROR';
exports[1499] = 'ER_TOO_MANY_PARTITIONS_ERROR';
exports[1500] = 'ER_SUBPARTITION_ERROR';
exports[1501] = 'ER_CANT_CREATE_HANDLER_FILE';
exports[1502] = 'ER_BLOB_FIELD_IN_PART_FUNC_ERROR';
exports[1503] = 'ER_UNIQUE_KEY_NEED_ALL_FIELDS_IN_PF';
exports[1504] = 'ER_NO_PARTS_ERROR';
exports[1505] = 'ER_PARTITION_MGMT_ON_NONPARTITIONED';
exports[1506] = 'ER_FOREIGN_KEY_ON_PARTITIONED';
exports[1507] = 'ER_DROP_PARTITION_NON_EXISTENT';
exports[1508] = 'ER_DROP_LAST_PARTITION';
exports[1509] = 'ER_COALESCE_ONLY_ON_HASH_PARTITION';
exports[1510] = 'ER_REORG_HASH_ONLY_ON_SAME_NO';
exports[1511] = 'ER_REORG_NO_PARAM_ERROR';
exports[1512] = 'ER_ONLY_ON_RANGE_LIST_PARTITION';
exports[1513] = 'ER_ADD_PARTITION_SUBPART_ERROR';
exports[1514] = 'ER_ADD_PARTITION_NO_NEW_PARTITION';
exports[1515] = 'ER_COALESCE_PARTITION_NO_PARTITION';
exports[1516] = 'ER_REORG_PARTITION_NOT_EXIST';
exports[1517] = 'ER_SAME_NAME_PARTITION';
exports[1518] = 'ER_NO_BINLOG_ERROR';
exports[1519] = 'ER_CONSECUTIVE_REORG_PARTITIONS';
exports[1520] = 'ER_REORG_OUTSIDE_RANGE';
exports[1521] = 'ER_PARTITION_FUNCTION_FAILURE';
exports[1522] = 'ER_PART_STATE_ERROR';
exports[1523] = 'ER_LIMITED_PART_RANGE';
exports[1524] = 'ER_PLUGIN_IS_NOT_LOADED';
exports[1525] = 'ER_WRONG_VALUE';
exports[1526] = 'ER_NO_PARTITION_FOR_GIVEN_VALUE';
exports[1527] = 'ER_FILEGROUP_OPTION_ONLY_ONCE';
exports[1528] = 'ER_CREATE_FILEGROUP_FAILED';
exports[1529] = 'ER_DROP_FILEGROUP_FAILED';
exports[1530] = 'ER_TABLESPACE_AUTO_EXTEND_ERROR';
exports[1531] = 'ER_WRONG_SIZE_NUMBER';
exports[1532] = 'ER_SIZE_OVERFLOW_ERROR';
exports[1533] = 'ER_ALTER_FILEGROUP_FAILED';
exports[1534] = 'ER_BINLOG_ROW_LOGGING_FAILED';
exports[1535] = 'ER_BINLOG_ROW_WRONG_TABLE_DEF';
exports[1536] = 'ER_BINLOG_ROW_RBR_TO_SBR';
exports[1537] = 'ER_EVENT_ALREADY_EXISTS';
exports[1538] = 'ER_EVENT_STORE_FAILED';
exports[1539] = 'ER_EVENT_DOES_NOT_EXIST';
exports[1540] = 'ER_EVENT_CANT_ALTER';
exports[1541] = 'ER_EVENT_DROP_FAILED';
exports[1542] = 'ER_EVENT_INTERVAL_NOT_POSITIVE_OR_TOO_BIG';
exports[1543] = 'ER_EVENT_ENDS_BEFORE_STARTS';
exports[1544] = 'ER_EVENT_EXEC_TIME_IN_THE_PAST';
exports[1545] = 'ER_EVENT_OPEN_TABLE_FAILED';
exports[1546] = 'ER_EVENT_NEITHER_M_EXPR_NOR_M_AT';
exports[1547] = 'ER_COL_COUNT_DOESNT_MATCH_CORRUPTED';
exports[1548] = 'ER_CANNOT_LOAD_FROM_TABLE';
exports[1549] = 'ER_EVENT_CANNOT_DELETE';
exports[1550] = 'ER_EVENT_COMPILE_ERROR';
exports[1551] = 'ER_EVENT_SAME_NAME';
exports[1552] = 'ER_EVENT_DATA_TOO_LONG';
exports[1553] = 'ER_DROP_INDEX_FK';
exports[1554] = 'ER_WARN_DEPRECATED_SYNTAX_WITH_VER';
exports[1555] = 'ER_CANT_WRITE_LOCK_LOG_TABLE';
exports[1556] = 'ER_CANT_LOCK_LOG_TABLE';
exports[1557] = 'ER_FOREIGN_DUPLICATE_KEY';
exports[1558] = 'ER_COL_COUNT_DOESNT_MATCH_PLEASE_UPDATE';
exports[1559] = 'ER_TEMP_TABLE_PREVENTS_SWITCH_OUT_OF_RBR';
exports[1560] = 'ER_STORED_FUNCTION_PREVENTS_SWITCH_BINLOG_FORMAT';
exports[1561] = 'ER_NDB_CANT_SWITCH_BINLOG_FORMAT';
exports[1562] = 'ER_PARTITION_NO_TEMPORARY';
exports[1563] = 'ER_PARTITION_CONST_DOMAIN_ERROR';
exports[1564] = 'ER_PARTITION_FUNCTION_IS_NOT_ALLOWED';
exports[1565] = 'ER_DDL_LOG_ERROR';
exports[1566] = 'ER_NULL_IN_VALUES_LESS_THAN';
exports[1567] = 'ER_WRONG_PARTITION_NAME';
exports[1568] = 'ER_CANT_CHANGE_TX_CHARACTERISTICS';
exports[1569] = 'ER_DUP_ENTRY_AUTOINCREMENT_CASE';
exports[1570] = 'ER_EVENT_MODIFY_QUEUE_ERROR';
exports[1571] = 'ER_EVENT_SET_VAR_ERROR';
exports[1572] = 'ER_PARTITION_MERGE_ERROR';
exports[1573] = 'ER_CANT_ACTIVATE_LOG';
exports[1574] = 'ER_RBR_NOT_AVAILABLE';
exports[1575] = 'ER_BASE64_DECODE_ERROR';
exports[1576] = 'ER_EVENT_RECURSION_FORBIDDEN';
exports[1577] = 'ER_EVENTS_DB_ERROR';
exports[1578] = 'ER_ONLY_INTEGERS_ALLOWED';
exports[1579] = 'ER_UNSUPORTED_LOG_ENGINE';
exports[1580] = 'ER_BAD_LOG_STATEMENT';
exports[1581] = 'ER_CANT_RENAME_LOG_TABLE';
exports[1582] = 'ER_WRONG_PARAMCOUNT_TO_NATIVE_FCT';
exports[1583] = 'ER_WRONG_PARAMETERS_TO_NATIVE_FCT';
exports[1584] = 'ER_WRONG_PARAMETERS_TO_STORED_FCT';
exports[1585] = 'ER_NATIVE_FCT_NAME_COLLISION';
exports[1586] = 'ER_DUP_ENTRY_WITH_KEY_NAME';
exports[1587] = 'ER_BINLOG_PURGE_EMFILE';
exports[1588] = 'ER_EVENT_CANNOT_CREATE_IN_THE_PAST';
exports[1589] = 'ER_EVENT_CANNOT_ALTER_IN_THE_PAST';
exports[1590] = 'ER_SLAVE_INCIDENT';
exports[1591] = 'ER_NO_PARTITION_FOR_GIVEN_VALUE_SILENT';
exports[1592] = 'ER_BINLOG_UNSAFE_STATEMENT';
exports[1593] = 'ER_SLAVE_FATAL_ERROR';
exports[1594] = 'ER_SLAVE_RELAY_LOG_READ_FAILURE';
exports[1595] = 'ER_SLAVE_RELAY_LOG_WRITE_FAILURE';
exports[1596] = 'ER_SLAVE_CREATE_EVENT_FAILURE';
exports[1597] = 'ER_SLAVE_MASTER_COM_FAILURE';
exports[1598] = 'ER_BINLOG_LOGGING_IMPOSSIBLE';
exports[1599] = 'ER_VIEW_NO_CREATION_CTX';
exports[1600] = 'ER_VIEW_INVALID_CREATION_CTX';
exports[1601] = 'ER_SR_INVALID_CREATION_CTX';
exports[1602] = 'ER_TRG_CORRUPTED_FILE';
exports[1603] = 'ER_TRG_NO_CREATION_CTX';
exports[1604] = 'ER_TRG_INVALID_CREATION_CTX';
exports[1605] = 'ER_EVENT_INVALID_CREATION_CTX';
exports[1606] = 'ER_TRG_CANT_OPEN_TABLE';
exports[1607] = 'ER_CANT_CREATE_SROUTINE';
exports[1608] = 'ER_NEVER_USED';
exports[1609] = 'ER_NO_FORMAT_DESCRIPTION_EVENT_BEFORE_BINLOG_STATEMENT';
exports[1610] = 'ER_SLAVE_CORRUPT_EVENT';
exports[1611] = 'ER_LOAD_DATA_INVALID_COLUMN';
exports[1612] = 'ER_LOG_PURGE_NO_FILE';
exports[1613] = 'ER_XA_RBTIMEOUT';
exports[1614] = 'ER_XA_RBDEADLOCK';
exports[1615] = 'ER_NEED_REPREPARE';
exports[1616] = 'ER_DELAYED_NOT_SUPPORTED';
exports[1617] = 'WARN_NO_MASTER_INFO';
exports[1618] = 'WARN_OPTION_IGNORED';
exports[1619] = 'ER_PLUGIN_DELETE_BUILTIN';
exports[1620] = 'WARN_PLUGIN_BUSY';
exports[1621] = 'ER_VARIABLE_IS_READONLY';
exports[1622] = 'ER_WARN_ENGINE_TRANSACTION_ROLLBACK';
exports[1623] = 'ER_SLAVE_HEARTBEAT_FAILURE';
exports[1624] = 'ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE';
exports[1625] = 'ER_NDB_REPLICATION_SCHEMA_ERROR';
exports[1626] = 'ER_CONFLICT_FN_PARSE_ERROR';
exports[1627] = 'ER_EXCEPTIONS_WRITE_ERROR';
exports[1628] = 'ER_TOO_LONG_TABLE_COMMENT';
exports[1629] = 'ER_TOO_LONG_FIELD_COMMENT';
exports[1630] = 'ER_FUNC_INEXISTENT_NAME_COLLISION';
exports[1631] = 'ER_DATABASE_NAME';
exports[1632] = 'ER_TABLE_NAME';
exports[1633] = 'ER_PARTITION_NAME';
exports[1634] = 'ER_SUBPARTITION_NAME';
exports[1635] = 'ER_TEMPORARY_NAME';
exports[1636] = 'ER_RENAMED_NAME';
exports[1637] = 'ER_TOO_MANY_CONCURRENT_TRXS';
exports[1638] = 'WARN_NON_ASCII_SEPARATOR_NOT_IMPLEMENTED';
exports[1639] = 'ER_DEBUG_SYNC_TIMEOUT';
exports[1640] = 'ER_DEBUG_SYNC_HIT_LIMIT';
exports[1641] = 'ER_DUP_SIGNAL_SET';
exports[1642] = 'ER_SIGNAL_WARN';
exports[1643] = 'ER_SIGNAL_NOT_FOUND';
exports[1644] = 'ER_SIGNAL_EXCEPTION';
exports[1645] = 'ER_RESIGNAL_WITHOUT_ACTIVE_HANDLER';
exports[1646] = 'ER_SIGNAL_BAD_CONDITION_TYPE';
exports[1647] = 'WARN_COND_ITEM_TRUNCATED';
exports[1648] = 'ER_COND_ITEM_TOO_LONG';
exports[1649] = 'ER_UNKNOWN_LOCALE';
exports[1650] = 'ER_SLAVE_IGNORE_SERVER_IDS';
exports[1651] = 'ER_QUERY_CACHE_DISABLED';
exports[1652] = 'ER_SAME_NAME_PARTITION_FIELD';
exports[1653] = 'ER_PARTITION_COLUMN_LIST_ERROR';
exports[1654] = 'ER_WRONG_TYPE_COLUMN_VALUE_ERROR';
exports[1655] = 'ER_TOO_MANY_PARTITION_FUNC_FIELDS_ERROR';
exports[1656] = 'ER_MAXVALUE_IN_VALUES_IN';
exports[1657] = 'ER_TOO_MANY_VALUES_ERROR';
exports[1658] = 'ER_ROW_SINGLE_PARTITION_FIELD_ERROR';
exports[1659] = 'ER_FIELD_TYPE_NOT_ALLOWED_AS_PARTITION_FIELD';
exports[1660] = 'ER_PARTITION_FIELDS_TOO_LONG';
exports[1661] = 'ER_BINLOG_ROW_ENGINE_AND_STMT_ENGINE';
exports[1662] = 'ER_BINLOG_ROW_MODE_AND_STMT_ENGINE';
exports[1663] = 'ER_BINLOG_UNSAFE_AND_STMT_ENGINE';
exports[1664] = 'ER_BINLOG_ROW_INJECTION_AND_STMT_ENGINE';
exports[1665] = 'ER_BINLOG_STMT_MODE_AND_ROW_ENGINE';
exports[1666] = 'ER_BINLOG_ROW_INJECTION_AND_STMT_MODE';
exports[1667] = 'ER_BINLOG_MULTIPLE_ENGINES_AND_SELF_LOGGING_ENGINE';
exports[1668] = 'ER_BINLOG_UNSAFE_LIMIT';
exports[1669] = 'ER_BINLOG_UNSAFE_INSERT_DELAYED';
exports[1670] = 'ER_BINLOG_UNSAFE_SYSTEM_TABLE';
exports[1671] = 'ER_BINLOG_UNSAFE_AUTOINC_COLUMNS';
exports[1672] = 'ER_BINLOG_UNSAFE_UDF';
exports[1673] = 'ER_BINLOG_UNSAFE_SYSTEM_VARIABLE';
exports[1674] = 'ER_BINLOG_UNSAFE_SYSTEM_FUNCTION';
exports[1675] = 'ER_BINLOG_UNSAFE_NONTRANS_AFTER_TRANS';
exports[1676] = 'ER_MESSAGE_AND_STATEMENT';
exports[1677] = 'ER_SLAVE_CONVERSION_FAILED';
exports[1678] = 'ER_SLAVE_CANT_CREATE_CONVERSION';
exports[1679] = 'ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_BINLOG_FORMAT';
exports[1680] = 'ER_PATH_LENGTH';
exports[1681] = 'ER_WARN_DEPRECATED_SYNTAX_NO_REPLACEMENT';
exports[1682] = 'ER_WRONG_NATIVE_TABLE_STRUCTURE';
exports[1683] = 'ER_WRONG_PERFSCHEMA_USAGE';
exports[1684] = 'ER_WARN_I_S_SKIPPED_TABLE';
exports[1685] = 'ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_BINLOG_DIRECT';
exports[1686] = 'ER_STORED_FUNCTION_PREVENTS_SWITCH_BINLOG_DIRECT';
exports[1687] = 'ER_SPATIAL_MUST_HAVE_GEOM_COL';
exports[1688] = 'ER_TOO_LONG_INDEX_COMMENT';
exports[1689] = 'ER_LOCK_ABORTED';
exports[1690] = 'ER_DATA_OUT_OF_RANGE';
exports[1691] = 'ER_WRONG_SPVAR_TYPE_IN_LIMIT';
exports[1692] = 'ER_BINLOG_UNSAFE_MULTIPLE_ENGINES_AND_SELF_LOGGING_ENGINE';
exports[1693] = 'ER_BINLOG_UNSAFE_MIXED_STATEMENT';
exports[1694] = 'ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_SQL_LOG_BIN';
exports[1695] = 'ER_STORED_FUNCTION_PREVENTS_SWITCH_SQL_LOG_BIN';
exports[1696] = 'ER_FAILED_READ_FROM_PAR_FILE';
exports[1697] = 'ER_VALUES_IS_NOT_INT_TYPE_ERROR';
exports[1698] = 'ER_ACCESS_DENIED_NO_PASSWORD_ERROR';
exports[1699] = 'ER_SET_PASSWORD_AUTH_PLUGIN';
exports[1700] = 'ER_GRANT_PLUGIN_USER_EXISTS';
exports[1701] = 'ER_TRUNCATE_ILLEGAL_FK';
exports[1702] = 'ER_PLUGIN_IS_PERMANENT';
exports[1703] = 'ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE_MIN';
exports[1704] = 'ER_SLAVE_HEARTBEAT_VALUE_OUT_OF_RANGE_MAX';
exports[1705] = 'ER_STMT_CACHE_FULL';
exports[1706] = 'ER_MULTI_UPDATE_KEY_CONFLICT';
exports[1707] = 'ER_TABLE_NEEDS_REBUILD';
exports[1708] = 'WARN_OPTION_BELOW_LIMIT';
exports[1709] = 'ER_INDEX_COLUMN_TOO_LONG';
exports[1710] = 'ER_ERROR_IN_TRIGGER_BODY';
exports[1711] = 'ER_ERROR_IN_UNKNOWN_TRIGGER_BODY';
exports[1712] = 'ER_INDEX_CORRUPT';
exports[1713] = 'ER_UNDO_RECORD_TOO_BIG';
exports[1714] = 'ER_BINLOG_UNSAFE_INSERT_IGNORE_SELECT';
exports[1715] = 'ER_BINLOG_UNSAFE_INSERT_SELECT_UPDATE';
exports[1716] = 'ER_BINLOG_UNSAFE_REPLACE_SELECT';
exports[1717] = 'ER_BINLOG_UNSAFE_CREATE_IGNORE_SELECT';
exports[1718] = 'ER_BINLOG_UNSAFE_CREATE_REPLACE_SELECT';
exports[1719] = 'ER_BINLOG_UNSAFE_UPDATE_IGNORE';
exports[1720] = 'ER_PLUGIN_NO_UNINSTALL';
exports[1721] = 'ER_PLUGIN_NO_INSTALL';
exports[1722] = 'ER_BINLOG_UNSAFE_WRITE_AUTOINC_SELECT';
exports[1723] = 'ER_BINLOG_UNSAFE_CREATE_SELECT_AUTOINC';
exports[1724] = 'ER_BINLOG_UNSAFE_INSERT_TWO_KEYS';
exports[1725] = 'ER_TABLE_IN_FK_CHECK';
exports[1726] = 'ER_UNSUPPORTED_ENGINE';
exports[1727] = 'ER_BINLOG_UNSAFE_AUTOINC_NOT_FIRST';
exports[1728] = 'ER_CANNOT_LOAD_FROM_TABLE_V2';
exports[1729] = 'ER_MASTER_DELAY_VALUE_OUT_OF_RANGE';
exports[1730] = 'ER_ONLY_FD_AND_RBR_EVENTS_ALLOWED_IN_BINLOG_STATEMENT';
exports[1731] = 'ER_PARTITION_EXCHANGE_DIFFERENT_OPTION';
exports[1732] = 'ER_PARTITION_EXCHANGE_PART_TABLE';
exports[1733] = 'ER_PARTITION_EXCHANGE_TEMP_TABLE';
exports[1734] = 'ER_PARTITION_INSTEAD_OF_SUBPARTITION';
exports[1735] = 'ER_UNKNOWN_PARTITION';
exports[1736] = 'ER_TABLES_DIFFERENT_METADATA';
exports[1737] = 'ER_ROW_DOES_NOT_MATCH_PARTITION';
exports[1738] = 'ER_BINLOG_CACHE_SIZE_GREATER_THAN_MAX';
exports[1739] = 'ER_WARN_INDEX_NOT_APPLICABLE';
exports[1740] = 'ER_PARTITION_EXCHANGE_FOREIGN_KEY';
exports[1741] = 'ER_NO_SUCH_KEY_VALUE';
exports[1742] = 'ER_RPL_INFO_DATA_TOO_LONG';
exports[1743] = 'ER_NETWORK_READ_EVENT_CHECKSUM_FAILURE';
exports[1744] = 'ER_BINLOG_READ_EVENT_CHECKSUM_FAILURE';
exports[1745] = 'ER_BINLOG_STMT_CACHE_SIZE_GREATER_THAN_MAX';
exports[1746] = 'ER_CANT_UPDATE_TABLE_IN_CREATE_TABLE_SELECT';
exports[1747] = 'ER_PARTITION_CLAUSE_ON_NONPARTITIONED';
exports[1748] = 'ER_ROW_DOES_NOT_MATCH_GIVEN_PARTITION_SET';
exports[1749] = 'ER_NO_SUCH_PARTITION';
exports[1750] = 'ER_CHANGE_RPL_INFO_REPOSITORY_FAILURE';
exports[1751] = 'ER_WARNING_NOT_COMPLETE_ROLLBACK_WITH_CREATED_TEMP_TABLE';
exports[1752] = 'ER_WARNING_NOT_COMPLETE_ROLLBACK_WITH_DROPPED_TEMP_TABLE';
exports[1753] = 'ER_MTS_FEATURE_IS_NOT_SUPPORTED';
exports[1754] = 'ER_MTS_UPDATED_DBS_GREATER_MAX';
exports[1755] = 'ER_MTS_CANT_PARALLEL';
exports[1756] = 'ER_MTS_INCONSISTENT_DATA';
exports[1757] = 'ER_FULLTEXT_NOT_SUPPORTED_WITH_PARTITIONING';
exports[1758] = 'ER_DA_INVALID_CONDITION_NUMBER';
exports[1759] = 'ER_INSECURE_PLAIN_TEXT';
exports[1760] = 'ER_INSECURE_CHANGE_MASTER';
exports[1761] = 'ER_FOREIGN_DUPLICATE_KEY_WITH_CHILD_INFO';
exports[1762] = 'ER_FOREIGN_DUPLICATE_KEY_WITHOUT_CHILD_INFO';
exports[1763] = 'ER_SQLTHREAD_WITH_SECURE_SLAVE';
exports[1764] = 'ER_TABLE_HAS_NO_FT';
exports[1765] = 'ER_VARIABLE_NOT_SETTABLE_IN_SF_OR_TRIGGER';
exports[1766] = 'ER_VARIABLE_NOT_SETTABLE_IN_TRANSACTION';
exports[1767] = 'ER_GTID_NEXT_IS_NOT_IN_GTID_NEXT_LIST';
exports[1768] = 'ER_CANT_CHANGE_GTID_NEXT_IN_TRANSACTION';
exports[1769] = 'ER_SET_STATEMENT_CANNOT_INVOKE_FUNCTION';
exports[1770] = 'ER_GTID_NEXT_CANT_BE_AUTOMATIC_IF_GTID_NEXT_LIST_IS_NON_NULL';
exports[1771] = 'ER_SKIPPING_LOGGED_TRANSACTION';
exports[1772] = 'ER_MALFORMED_GTID_SET_SPECIFICATION';
exports[1773] = 'ER_MALFORMED_GTID_SET_ENCODING';
exports[1774] = 'ER_MALFORMED_GTID_SPECIFICATION';
exports[1775] = 'ER_GNO_EXHAUSTED';
exports[1776] = 'ER_BAD_SLAVE_AUTO_POSITION';
exports[1777] = 'ER_AUTO_POSITION_REQUIRES_GTID_MODE_NOT_OFF';
exports[1778] = 'ER_CANT_DO_IMPLICIT_COMMIT_IN_TRX_WHEN_GTID_NEXT_IS_SET';
exports[1779] = 'ER_GTID_MODE_ON_REQUIRES_ENFORCE_GTID_CONSISTENCY_ON';
exports[1780] = 'ER_GTID_MODE_REQUIRES_BINLOG';
exports[1781] = 'ER_CANT_SET_GTID_NEXT_TO_GTID_WHEN_GTID_MODE_IS_OFF';
exports[1782] = 'ER_CANT_SET_GTID_NEXT_TO_ANONYMOUS_WHEN_GTID_MODE_IS_ON';
exports[1783] = 'ER_CANT_SET_GTID_NEXT_LIST_TO_NON_NULL_WHEN_GTID_MODE_IS_OFF';
exports[1784] = 'ER_FOUND_GTID_EVENT_WHEN_GTID_MODE_IS_OFF';
exports[1785] = 'ER_GTID_UNSAFE_NON_TRANSACTIONAL_TABLE';
exports[1786] = 'ER_GTID_UNSAFE_CREATE_SELECT';
exports[1787] = 'ER_GTID_UNSAFE_CREATE_DROP_TEMPORARY_TABLE_IN_TRANSACTION';
exports[1788] = 'ER_GTID_MODE_CAN_ONLY_CHANGE_ONE_STEP_AT_A_TIME';
exports[1789] = 'ER_MASTER_HAS_PURGED_REQUIRED_GTIDS';
exports[1790] = 'ER_CANT_SET_GTID_NEXT_WHEN_OWNING_GTID';
exports[1791] = 'ER_UNKNOWN_EXPLAIN_FORMAT';
exports[1792] = 'ER_CANT_EXECUTE_IN_READ_ONLY_TRANSACTION';
exports[1793] = 'ER_TOO_LONG_TABLE_PARTITION_COMMENT';
exports[1794] = 'ER_SLAVE_CONFIGURATION';
exports[1795] = 'ER_INNODB_FT_LIMIT';
exports[1796] = 'ER_INNODB_NO_FT_TEMP_TABLE';
exports[1797] = 'ER_INNODB_FT_WRONG_DOCID_COLUMN';
exports[1798] = 'ER_INNODB_FT_WRONG_DOCID_INDEX';
exports[1799] = 'ER_INNODB_ONLINE_LOG_TOO_BIG';
exports[1800] = 'ER_UNKNOWN_ALTER_ALGORITHM';
exports[1801] = 'ER_UNKNOWN_ALTER_LOCK';
exports[1802] = 'ER_MTS_CHANGE_MASTER_CANT_RUN_WITH_GAPS';
exports[1803] = 'ER_MTS_RECOVERY_FAILURE';
exports[1804] = 'ER_MTS_RESET_WORKERS';
exports[1805] = 'ER_COL_COUNT_DOESNT_MATCH_CORRUPTED_V2';
exports[1806] = 'ER_SLAVE_SILENT_RETRY_TRANSACTION';
exports[1807] = 'ER_DISCARD_FK_CHECKS_RUNNING';
exports[1808] = 'ER_TABLE_SCHEMA_MISMATCH';
exports[1809] = 'ER_TABLE_IN_SYSTEM_TABLESPACE';
exports[1810] = 'ER_IO_READ_ERROR';
exports[1811] = 'ER_IO_WRITE_ERROR';
exports[1812] = 'ER_TABLESPACE_MISSING';
exports[1813] = 'ER_TABLESPACE_EXISTS';
exports[1814] = 'ER_TABLESPACE_DISCARDED';
exports[1815] = 'ER_INTERNAL_ERROR';
exports[1816] = 'ER_INNODB_IMPORT_ERROR';
exports[1817] = 'ER_INNODB_INDEX_CORRUPT';
exports[1818] = 'ER_INVALID_YEAR_COLUMN_LENGTH';
exports[1819] = 'ER_NOT_VALID_PASSWORD';
exports[1820] = 'ER_MUST_CHANGE_PASSWORD';
exports[1821] = 'ER_FK_NO_INDEX_CHILD';
exports[1822] = 'ER_FK_NO_INDEX_PARENT';
exports[1823] = 'ER_FK_FAIL_ADD_SYSTEM';
exports[1824] = 'ER_FK_CANNOT_OPEN_PARENT';
exports[1825] = 'ER_FK_INCORRECT_OPTION';
exports[1826] = 'ER_FK_DUP_NAME';
exports[1827] = 'ER_PASSWORD_FORMAT';
exports[1828] = 'ER_FK_COLUMN_CANNOT_DROP';
exports[1829] = 'ER_FK_COLUMN_CANNOT_DROP_CHILD';
exports[1830] = 'ER_FK_COLUMN_NOT_NULL';
exports[1831] = 'ER_DUP_INDEX';
exports[1832] = 'ER_FK_COLUMN_CANNOT_CHANGE';
exports[1833] = 'ER_FK_COLUMN_CANNOT_CHANGE_CHILD';
exports[1834] = 'ER_FK_CANNOT_DELETE_PARENT';
exports[1835] = 'ER_MALFORMED_PACKET';
exports[1836] = 'ER_READ_ONLY_MODE';
exports[1837] = 'ER_GTID_NEXT_TYPE_UNDEFINED_GROUP';
exports[1838] = 'ER_VARIABLE_NOT_SETTABLE_IN_SP';
exports[1839] = 'ER_CANT_SET_GTID_PURGED_WHEN_GTID_MODE_IS_OFF';
exports[1840] = 'ER_CANT_SET_GTID_PURGED_WHEN_GTID_EXECUTED_IS_NOT_EMPTY';
exports[1841] = 'ER_CANT_SET_GTID_PURGED_WHEN_OWNED_GTIDS_IS_NOT_EMPTY';
exports[1842] = 'ER_GTID_PURGED_WAS_CHANGED';
exports[1843] = 'ER_GTID_EXECUTED_WAS_CHANGED';
exports[1844] = 'ER_BINLOG_STMT_MODE_AND_NO_REPL_TABLES';
exports[1845] = 'ER_ALTER_OPERATION_NOT_SUPPORTED';
exports[1846] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON';
exports[1847] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COPY';
exports[1848] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_PARTITION';
exports[1849] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FK_RENAME';
exports[1850] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COLUMN_TYPE';
exports[1851] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FK_CHECK';
exports[1852] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_IGNORE';
exports[1853] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_NOPK';
exports[1854] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_AUTOINC';
exports[1855] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_HIDDEN_FTS';
exports[1856] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_CHANGE_FTS';
exports[1857] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FTS';
exports[1858] = 'ER_SQL_SLAVE_SKIP_COUNTER_NOT_SETTABLE_IN_GTID_MODE';
exports[1859] = 'ER_DUP_UNKNOWN_IN_INDEX';
exports[1860] = 'ER_IDENT_CAUSES_TOO_LONG_PATH';
exports[1861] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_NOT_NULL';
exports[1862] = 'ER_MUST_CHANGE_PASSWORD_LOGIN';
exports[1863] = 'ER_ROW_IN_WRONG_PARTITION';
exports[1864] = 'ER_MTS_EVENT_BIGGER_PENDING_JOBS_SIZE_MAX';
exports[1865] = 'ER_INNODB_NO_FT_USES_PARSER';
exports[1866] = 'ER_BINLOG_LOGICAL_CORRUPTION';
exports[1867] = 'ER_WARN_PURGE_LOG_IN_USE';
exports[1868] = 'ER_WARN_PURGE_LOG_IS_ACTIVE';
exports[1869] = 'ER_AUTO_INCREMENT_CONFLICT';
exports[1870] = 'WARN_ON_BLOCKHOLE_IN_RBR';
exports[1871] = 'ER_SLAVE_MI_INIT_REPOSITORY';
exports[1872] = 'ER_SLAVE_RLI_INIT_REPOSITORY';
exports[1873] = 'ER_ACCESS_DENIED_CHANGE_USER_ERROR';
exports[1874] = 'ER_INNODB_READ_ONLY';
exports[1875] = 'ER_STOP_SLAVE_SQL_THREAD_TIMEOUT';
exports[1876] = 'ER_STOP_SLAVE_IO_THREAD_TIMEOUT';
exports[1877] = 'ER_TABLE_CORRUPT';
exports[1878] = 'ER_TEMP_FILE_WRITE_FAILURE';
exports[1879] = 'ER_INNODB_FT_AUX_NOT_HEX_ID';
exports[1880] = 'ER_OLD_TEMPORALS_UPGRADED';
exports[1881] = 'ER_INNODB_FORCED_RECOVERY';
exports[1882] = 'ER_AES_INVALID_IV';
exports[1883] = 'ER_PLUGIN_CANNOT_BE_UNINSTALLED';
exports[1884] = 'ER_GTID_UNSAFE_BINLOG_SPLITTABLE_STATEMENT_AND_GTID_GROUP';
exports[1885] = 'ER_SLAVE_HAS_MORE_GTIDS_THAN_MASTER';
exports[1886] = 'ER_MISSING_KEY';
exports[1887] = 'WARN_NAMED_PIPE_ACCESS_EVERYONE';
exports[1888] = 'ER_FOUND_MISSING_GTIDS';
exports[3000] = 'ER_FILE_CORRUPT';
exports[3001] = 'ER_ERROR_ON_MASTER';
exports[3002] = 'ER_INCONSISTENT_ERROR';
exports[3003] = 'ER_STORAGE_ENGINE_NOT_LOADED';
exports[3004] = 'ER_GET_STACKED_DA_WITHOUT_ACTIVE_HANDLER';
exports[3005] = 'ER_WARN_LEGACY_SYNTAX_CONVERTED';
exports[3006] = 'ER_BINLOG_UNSAFE_FULLTEXT_PLUGIN';
exports[3007] = 'ER_CANNOT_DISCARD_TEMPORARY_TABLE';
exports[3008] = 'ER_FK_DEPTH_EXCEEDED';
exports[3009] = 'ER_COL_COUNT_DOESNT_MATCH_PLEASE_UPDATE_V2';
exports[3010] = 'ER_WARN_TRIGGER_DOESNT_HAVE_CREATED';
exports[3011] = 'ER_REFERENCED_TRG_DOES_NOT_EXIST';
exports[3012] = 'ER_EXPLAIN_NOT_SUPPORTED';
exports[3013] = 'ER_INVALID_FIELD_SIZE';
exports[3014] = 'ER_MISSING_HA_CREATE_OPTION';
exports[3015] = 'ER_ENGINE_OUT_OF_MEMORY';
exports[3016] = 'ER_PASSWORD_EXPIRE_ANONYMOUS_USER';
exports[3017] = 'ER_SLAVE_SQL_THREAD_MUST_STOP';
exports[3018] = 'ER_NO_FT_MATERIALIZED_SUBQUERY';
exports[3019] = 'ER_INNODB_UNDO_LOG_FULL';
exports[3020] = 'ER_INVALID_ARGUMENT_FOR_LOGARITHM';
exports[3021] = 'ER_SLAVE_CHANNEL_IO_THREAD_MUST_STOP';
exports[3022] = 'ER_WARN_OPEN_TEMP_TABLES_MUST_BE_ZERO';
exports[3023] = 'ER_WARN_ONLY_MASTER_LOG_FILE_NO_POS';
exports[3024] = 'ER_QUERY_TIMEOUT';
exports[3025] = 'ER_NON_RO_SELECT_DISABLE_TIMER';
exports[3026] = 'ER_DUP_LIST_ENTRY';
exports[3027] = 'ER_SQL_MODE_NO_EFFECT';
exports[3028] = 'ER_AGGREGATE_ORDER_FOR_UNION';
exports[3029] = 'ER_AGGREGATE_ORDER_NON_AGG_QUERY';
exports[3030] = 'ER_SLAVE_WORKER_STOPPED_PREVIOUS_THD_ERROR';
exports[3031] = 'ER_DONT_SUPPORT_SLAVE_PRESERVE_COMMIT_ORDER';
exports[3032] = 'ER_SERVER_OFFLINE_MODE';
exports[3033] = 'ER_GIS_DIFFERENT_SRIDS';
exports[3034] = 'ER_GIS_UNSUPPORTED_ARGUMENT';
exports[3035] = 'ER_GIS_UNKNOWN_ERROR';
exports[3036] = 'ER_GIS_UNKNOWN_EXCEPTION';
exports[3037] = 'ER_GIS_INVALID_DATA';
exports[3038] = 'ER_BOOST_GEOMETRY_EMPTY_INPUT_EXCEPTION';
exports[3039] = 'ER_BOOST_GEOMETRY_CENTROID_EXCEPTION';
exports[3040] = 'ER_BOOST_GEOMETRY_OVERLAY_INVALID_INPUT_EXCEPTION';
exports[3041] = 'ER_BOOST_GEOMETRY_TURN_INFO_EXCEPTION';
exports[3042] = 'ER_BOOST_GEOMETRY_SELF_INTERSECTION_POINT_EXCEPTION';
exports[3043] = 'ER_BOOST_GEOMETRY_UNKNOWN_EXCEPTION';
exports[3044] = 'ER_STD_BAD_ALLOC_ERROR';
exports[3045] = 'ER_STD_DOMAIN_ERROR';
exports[3046] = 'ER_STD_LENGTH_ERROR';
exports[3047] = 'ER_STD_INVALID_ARGUMENT';
exports[3048] = 'ER_STD_OUT_OF_RANGE_ERROR';
exports[3049] = 'ER_STD_OVERFLOW_ERROR';
exports[3050] = 'ER_STD_RANGE_ERROR';
exports[3051] = 'ER_STD_UNDERFLOW_ERROR';
exports[3052] = 'ER_STD_LOGIC_ERROR';
exports[3053] = 'ER_STD_RUNTIME_ERROR';
exports[3054] = 'ER_STD_UNKNOWN_EXCEPTION';
exports[3055] = 'ER_GIS_DATA_WRONG_ENDIANESS';
exports[3056] = 'ER_CHANGE_MASTER_PASSWORD_LENGTH';
exports[3057] = 'ER_USER_LOCK_WRONG_NAME';
exports[3058] = 'ER_USER_LOCK_DEADLOCK';
exports[3059] = 'ER_REPLACE_INACCESSIBLE_ROWS';
exports[3060] = 'ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_GIS';
exports[3061] = 'ER_ILLEGAL_USER_VAR';
exports[3062] = 'ER_GTID_MODE_OFF';
exports[3063] = 'ER_UNSUPPORTED_BY_REPLICATION_THREAD';
exports[3064] = 'ER_INCORRECT_TYPE';
exports[3065] = 'ER_FIELD_IN_ORDER_NOT_SELECT';
exports[3066] = 'ER_AGGREGATE_IN_ORDER_NOT_SELECT';
exports[3067] = 'ER_INVALID_RPL_WILD_TABLE_FILTER_PATTERN';
exports[3068] = 'ER_NET_OK_PACKET_TOO_LARGE';
exports[3069] = 'ER_INVALID_JSON_DATA';
exports[3070] = 'ER_INVALID_GEOJSON_MISSING_MEMBER';
exports[3071] = 'ER_INVALID_GEOJSON_WRONG_TYPE';
exports[3072] = 'ER_INVALID_GEOJSON_UNSPECIFIED';
exports[3073] = 'ER_DIMENSION_UNSUPPORTED';
exports[3074] = 'ER_SLAVE_CHANNEL_DOES_NOT_EXIST';
exports[3075] = 'ER_SLAVE_MULTIPLE_CHANNELS_HOST_PORT';
exports[3076] = 'ER_SLAVE_CHANNEL_NAME_INVALID_OR_TOO_LONG';
exports[3077] = 'ER_SLAVE_NEW_CHANNEL_WRONG_REPOSITORY';
exports[3078] = 'ER_SLAVE_CHANNEL_DELETE';
exports[3079] = 'ER_SLAVE_MULTIPLE_CHANNELS_CMD';
exports[3080] = 'ER_SLAVE_MAX_CHANNELS_EXCEEDED';
exports[3081] = 'ER_SLAVE_CHANNEL_MUST_STOP';
exports[3082] = 'ER_SLAVE_CHANNEL_NOT_RUNNING';
exports[3083] = 'ER_SLAVE_CHANNEL_WAS_RUNNING';
exports[3084] = 'ER_SLAVE_CHANNEL_WAS_NOT_RUNNING';
exports[3085] = 'ER_SLAVE_CHANNEL_SQL_THREAD_MUST_STOP';
exports[3086] = 'ER_SLAVE_CHANNEL_SQL_SKIP_COUNTER';
exports[3087] = 'ER_WRONG_FIELD_WITH_GROUP_V2';
exports[3088] = 'ER_MIX_OF_GROUP_FUNC_AND_FIELDS_V2';
exports[3089] = 'ER_WARN_DEPRECATED_SYSVAR_UPDATE';
exports[3090] = 'ER_WARN_DEPRECATED_SQLMODE';
exports[3091] = 'ER_CANNOT_LOG_PARTIAL_DROP_DATABASE_WITH_GTID';
exports[3092] = 'ER_GROUP_REPLICATION_CONFIGURATION';
exports[3093] = 'ER_GROUP_REPLICATION_RUNNING';
exports[3094] = 'ER_GROUP_REPLICATION_APPLIER_INIT_ERROR';
exports[3095] = 'ER_GROUP_REPLICATION_STOP_APPLIER_THREAD_TIMEOUT';
exports[3096] = 'ER_GROUP_REPLICATION_COMMUNICATION_LAYER_SESSION_ERROR';
exports[3097] = 'ER_GROUP_REPLICATION_COMMUNICATION_LAYER_JOIN_ERROR';
exports[3098] = 'ER_BEFORE_DML_VALIDATION_ERROR';
exports[3099] = 'ER_PREVENTS_VARIABLE_WITHOUT_RBR';
exports[3100] = 'ER_RUN_HOOK_ERROR';
exports[3101] = 'ER_TRANSACTION_ROLLBACK_DURING_COMMIT';
exports[3102] = 'ER_GENERATED_COLUMN_FUNCTION_IS_NOT_ALLOWED';
exports[3103] = 'ER_UNSUPPORTED_ALTER_INPLACE_ON_VIRTUAL_COLUMN';
exports[3104] = 'ER_WRONG_FK_OPTION_FOR_GENERATED_COLUMN';
exports[3105] = 'ER_NON_DEFAULT_VALUE_FOR_GENERATED_COLUMN';
exports[3106] = 'ER_UNSUPPORTED_ACTION_ON_GENERATED_COLUMN';
exports[3107] = 'ER_GENERATED_COLUMN_NON_PRIOR';
exports[3108] = 'ER_DEPENDENT_BY_GENERATED_COLUMN';
exports[3109] = 'ER_GENERATED_COLUMN_REF_AUTO_INC';
exports[3110] = 'ER_FEATURE_NOT_AVAILABLE';
exports[3111] = 'ER_CANT_SET_GTID_MODE';
exports[3112] = 'ER_CANT_USE_AUTO_POSITION_WITH_GTID_MODE_OFF';
exports[3113] = 'ER_CANT_REPLICATE_ANONYMOUS_WITH_AUTO_POSITION';
exports[3114] = 'ER_CANT_REPLICATE_ANONYMOUS_WITH_GTID_MODE_ON';
exports[3115] = 'ER_CANT_REPLICATE_GTID_WITH_GTID_MODE_OFF';
exports[3116] = 'ER_CANT_SET_ENFORCE_GTID_CONSISTENCY_ON_WITH_ONGOING_GTID_VIOLATING_TRANSACTIONS';
exports[3117] = 'ER_SET_ENFORCE_GTID_CONSISTENCY_WARN_WITH_ONGOING_GTID_VIOLATING_TRANSACTIONS';
exports[3118] = 'ER_ACCOUNT_HAS_BEEN_LOCKED';
exports[3119] = 'ER_WRONG_TABLESPACE_NAME';
exports[3120] = 'ER_TABLESPACE_IS_NOT_EMPTY';
exports[3121] = 'ER_WRONG_FILE_NAME';
exports[3122] = 'ER_BOOST_GEOMETRY_INCONSISTENT_TURNS_EXCEPTION';
exports[3123] = 'ER_WARN_OPTIMIZER_HINT_SYNTAX_ERROR';
exports[3124] = 'ER_WARN_BAD_MAX_EXECUTION_TIME';
exports[3125] = 'ER_WARN_UNSUPPORTED_MAX_EXECUTION_TIME';
exports[3126] = 'ER_WARN_CONFLICTING_HINT';
exports[3127] = 'ER_WARN_UNKNOWN_QB_NAME';
exports[3128] = 'ER_UNRESOLVED_HINT_NAME';
exports[3129] = 'ER_WARN_ON_MODIFYING_GTID_EXECUTED_TABLE';
exports[3130] = 'ER_PLUGGABLE_PROTOCOL_COMMAND_NOT_SUPPORTED';
exports[3131] = 'ER_LOCKING_SERVICE_WRONG_NAME';
exports[3132] = 'ER_LOCKING_SERVICE_DEADLOCK';
exports[3133] = 'ER_LOCKING_SERVICE_TIMEOUT';
exports[3134] = 'ER_GIS_MAX_POINTS_IN_GEOMETRY_OVERFLOWED';
exports[3135] = 'ER_SQL_MODE_MERGED';
exports[3136] = 'ER_VTOKEN_PLUGIN_TOKEN_MISMATCH';
exports[3137] = 'ER_VTOKEN_PLUGIN_TOKEN_NOT_FOUND';
exports[3138] = 'ER_CANT_SET_VARIABLE_WHEN_OWNING_GTID';
exports[3139] = 'ER_SLAVE_CHANNEL_OPERATION_NOT_ALLOWED';
exports[3140] = 'ER_INVALID_JSON_TEXT';
exports[3141] = 'ER_INVALID_JSON_TEXT_IN_PARAM';
exports[3142] = 'ER_INVALID_JSON_BINARY_DATA';
exports[3143] = 'ER_INVALID_JSON_PATH';
exports[3144] = 'ER_INVALID_JSON_CHARSET';
exports[3145] = 'ER_INVALID_JSON_CHARSET_IN_FUNCTION';
exports[3146] = 'ER_INVALID_TYPE_FOR_JSON';
exports[3147] = 'ER_INVALID_CAST_TO_JSON';
exports[3148] = 'ER_INVALID_JSON_PATH_CHARSET';
exports[3149] = 'ER_INVALID_JSON_PATH_WILDCARD';
exports[3150] = 'ER_JSON_VALUE_TOO_BIG';
exports[3151] = 'ER_JSON_KEY_TOO_BIG';
exports[3152] = 'ER_JSON_USED_AS_KEY';
exports[3153] = 'ER_JSON_VACUOUS_PATH';
exports[3154] = 'ER_JSON_BAD_ONE_OR_ALL_ARG';
exports[3155] = 'ER_NUMERIC_JSON_VALUE_OUT_OF_RANGE';
exports[3156] = 'ER_INVALID_JSON_VALUE_FOR_CAST';
exports[3157] = 'ER_JSON_DOCUMENT_TOO_DEEP';
exports[3158] = 'ER_JSON_DOCUMENT_NULL_KEY';
exports[3159] = 'ER_SECURE_TRANSPORT_REQUIRED';
exports[3160] = 'ER_NO_SECURE_TRANSPORTS_CONFIGURED';
exports[3161] = 'ER_DISABLED_STORAGE_ENGINE';
exports[3162] = 'ER_USER_DOES_NOT_EXIST';
exports[3163] = 'ER_USER_ALREADY_EXISTS';
exports[3164] = 'ER_AUDIT_API_ABORT';
exports[3165] = 'ER_INVALID_JSON_PATH_ARRAY_CELL';
exports[3166] = 'ER_BUFPOOL_RESIZE_INPROGRESS';
exports[3167] = 'ER_FEATURE_DISABLED_SEE_DOC';
exports[3168] = 'ER_SERVER_ISNT_AVAILABLE';
exports[3169] = 'ER_SESSION_WAS_KILLED';
exports[3170] = 'ER_CAPACITY_EXCEEDED';
exports[3171] = 'ER_CAPACITY_EXCEEDED_IN_RANGE_OPTIMIZER';
exports[3172] = 'ER_TABLE_NEEDS_UPG_PART';
exports[3173] = 'ER_CANT_WAIT_FOR_EXECUTED_GTID_SET_WHILE_OWNING_A_GTID';
exports[3174] = 'ER_CANNOT_ADD_FOREIGN_BASE_COL_VIRTUAL';
exports[3175] = 'ER_CANNOT_CREATE_VIRTUAL_INDEX_CONSTRAINT';
exports[3176] = 'ER_ERROR_ON_MODIFYING_GTID_EXECUTED_TABLE';
exports[3177] = 'ER_LOCK_REFUSED_BY_ENGINE';
exports[3178] = 'ER_UNSUPPORTED_ALTER_ONLINE_ON_VIRTUAL_COLUMN';
exports[3179] = 'ER_MASTER_KEY_ROTATION_NOT_SUPPORTED_BY_SE';
exports[3180] = 'ER_MASTER_KEY_ROTATION_ERROR_BY_SE';
exports[3181] = 'ER_MASTER_KEY_ROTATION_BINLOG_FAILED';
exports[3182] = 'ER_MASTER_KEY_ROTATION_SE_UNAVAILABLE';
exports[3183] = 'ER_TABLESPACE_CANNOT_ENCRYPT';
exports[3184] = 'ER_INVALID_ENCRYPTION_OPTION';
exports[3185] = 'ER_CANNOT_FIND_KEY_IN_KEYRING';
exports[3186] = 'ER_CAPACITY_EXCEEDED_IN_PARSER';
exports[3187] = 'ER_UNSUPPORTED_ALTER_ENCRYPTION_INPLACE';
exports[3188] = 'ER_KEYRING_UDF_KEYRING_SERVICE_ERROR';
exports[3189] = 'ER_USER_COLUMN_OLD_LENGTH';
exports[3190] = 'ER_CANT_RESET_MASTER';
exports[3191] = 'ER_GROUP_REPLICATION_MAX_GROUP_SIZE';
exports[3192] = 'ER_CANNOT_ADD_FOREIGN_BASE_COL_STORED';
exports[3193] = 'ER_TABLE_REFERENCED';
exports[3194] = 'ER_PARTITION_ENGINE_DEPRECATED_FOR_TABLE';
exports[3195] = 'ER_WARN_USING_GEOMFROMWKB_TO_SET_SRID_ZERO';
exports[3196] = 'ER_WARN_USING_GEOMFROMWKB_TO_SET_SRID';
exports[3197] = 'ER_XA_RETRY';
exports[3198] = 'ER_KEYRING_AWS_UDF_AWS_KMS_ERROR';
exports[3199] = 'ER_BINLOG_UNSAFE_XA';
exports[3200] = 'ER_UDF_ERROR';
exports[3201] = 'ER_KEYRING_MIGRATION_FAILURE';
exports[3202] = 'ER_KEYRING_ACCESS_DENIED_ERROR';
exports[3203] = 'ER_KEYRING_MIGRATION_STATUS';
exports[3204] = 'ER_PLUGIN_FAILED_TO_OPEN_TABLES';
exports[3205] = 'ER_PLUGIN_FAILED_TO_OPEN_TABLE';
exports[3206] = 'ER_AUDIT_LOG_NO_KEYRING_PLUGIN_INSTALLED';
exports[3207] = 'ER_AUDIT_LOG_ENCRYPTION_PASSWORD_HAS_NOT_BEEN_SET';
exports[3208] = 'ER_AUDIT_LOG_COULD_NOT_CREATE_AES_KEY';
exports[3209] = 'ER_AUDIT_LOG_ENCRYPTION_PASSWORD_CANNOT_BE_FETCHED';
exports[3210] = 'ER_AUDIT_LOG_JSON_FILTERING_NOT_ENABLED';
exports[3211] = 'ER_AUDIT_LOG_UDF_INSUFFICIENT_PRIVILEGE';
exports[3212] = 'ER_AUDIT_LOG_SUPER_PRIVILEGE_REQUIRED';
exports[3213] = 'ER_COULD_NOT_REINITIALIZE_AUDIT_LOG_FILTERS';
exports[3214] = 'ER_AUDIT_LOG_UDF_INVALID_ARGUMENT_TYPE';
exports[3215] = 'ER_AUDIT_LOG_UDF_INVALID_ARGUMENT_COUNT';
exports[3216] = 'ER_AUDIT_LOG_HAS_NOT_BEEN_INSTALLED';
exports[3217] = 'ER_AUDIT_LOG_UDF_READ_INVALID_MAX_ARRAY_LENGTH_ARG_TYPE';
exports[3218] = 'ER_AUDIT_LOG_UDF_READ_INVALID_MAX_ARRAY_LENGTH_ARG_VALUE';
exports[3219] = 'ER_AUDIT_LOG_JSON_FILTER_PARSING_ERROR';
exports[3220] = 'ER_AUDIT_LOG_JSON_FILTER_NAME_CANNOT_BE_EMPTY';
exports[3221] = 'ER_AUDIT_LOG_JSON_USER_NAME_CANNOT_BE_EMPTY';
exports[3222] = 'ER_AUDIT_LOG_JSON_FILTER_DOES_NOT_EXISTS';
exports[3223] = 'ER_AUDIT_LOG_USER_FIRST_CHARACTER_MUST_BE_ALPHANUMERIC';
exports[3224] = 'ER_AUDIT_LOG_USER_NAME_INVALID_CHARACTER';
exports[3225] = 'ER_AUDIT_LOG_HOST_NAME_INVALID_CHARACTER';
exports[3226] = 'WARN_DEPRECATED_MAXDB_SQL_MODE_FOR_TIMESTAMP';
exports[3227] = 'ER_XA_REPLICATION_FILTERS';
exports[3228] = 'ER_CANT_OPEN_ERROR_LOG';
exports[3229] = 'ER_GROUPING_ON_TIMESTAMP_IN_DST';
exports[3230] = 'ER_CANT_START_SERVER_NAMED_PIPE';


/***/ }),

/***/ 1837:
/***/ ((__unused_webpack_module, exports) => {

// Manually extracted from mysql-5.5.23/include/mysql_com.h

/**
  Is raised when a multi-statement transaction
  has been started, either explicitly, by means
  of BEGIN or COMMIT AND CHAIN, or
  implicitly, by the first transactional
  statement, when autocommit=off.
*/
exports.SERVER_STATUS_IN_TRANS          = 1;
exports.SERVER_STATUS_AUTOCOMMIT        = 2;  /* Server in auto_commit mode */
exports.SERVER_MORE_RESULTS_EXISTS      = 8;    /* Multi query - next query exists */
exports.SERVER_QUERY_NO_GOOD_INDEX_USED = 16;
exports.SERVER_QUERY_NO_INDEX_USED      = 32;
/**
  The server was able to fulfill the clients request and opened a
  read-only non-scrollable cursor for a query. This flag comes
  in reply to COM_STMT_EXECUTE and COM_STMT_FETCH commands.
*/
exports.SERVER_STATUS_CURSOR_EXISTS = 64;
/**
  This flag is sent when a read-only cursor is exhausted, in reply to
  COM_STMT_FETCH command.
*/
exports.SERVER_STATUS_LAST_ROW_SENT        = 128;
exports.SERVER_STATUS_DB_DROPPED           = 256; /* A database was dropped */
exports.SERVER_STATUS_NO_BACKSLASH_ESCAPES = 512;
/**
  Sent to the client if after a prepared statement reprepare
  we discovered that the new statement returns a different
  number of result set columns.
*/
exports.SERVER_STATUS_METADATA_CHANGED = 1024;
exports.SERVER_QUERY_WAS_SLOW          = 2048;

/**
  To mark ResultSet containing output parameter values.
*/
exports.SERVER_PS_OUT_PARAMS = 4096;


/***/ }),

/***/ 1075:
/***/ ((__unused_webpack_module, exports) => {

// Certificates for Amazon RDS
exports["Amazon RDS"] = {
  ca: [
    /**
     * Amazon RDS global certificate 2010 to 2015
     *
     *   CN = aws.amazon.com/rds/
     *   OU = RDS
     *   O = Amazon.com
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2010-04-05T22:44:31Z/2015-04-04T22:41:31Z
     *   F = 7F:09:8D:A5:7D:BB:A6:EF:7C:70:D8:CA:4E:49:11:55:7E:89:A7:D3
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIDQzCCAqygAwIBAgIJAOd1tlfiGoEoMA0GCSqGSIb3DQEBBQUAMHUxCzAJBgNV\n'
    + 'BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdTZWF0dGxlMRMw\n'
    + 'EQYDVQQKEwpBbWF6b24uY29tMQwwCgYDVQQLEwNSRFMxHDAaBgNVBAMTE2F3cy5h\n'
    + 'bWF6b24uY29tL3Jkcy8wHhcNMTAwNDA1MjI0NDMxWhcNMTUwNDA0MjI0NDMxWjB1\n'
    + 'MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHU2Vh\n'
    + 'dHRsZTETMBEGA1UEChMKQW1hem9uLmNvbTEMMAoGA1UECxMDUkRTMRwwGgYDVQQD\n'
    + 'ExNhd3MuYW1hem9uLmNvbS9yZHMvMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKB\n'
    + 'gQDKhXGU7tizxUR5WaFoMTFcxNxa05PEjZaIOEN5ctkWrqYSRov0/nOMoZjqk8bC\n'
    + 'med9vPFoQGD0OTakPs0jVe3wwmR735hyVwmKIPPsGlaBYj1O6llIpZeQVyupNx56\n'
    + 'UzqtiLaDzh1KcmfqP3qP2dInzBfJQKjiRudo1FWnpPt33QIDAQABo4HaMIHXMB0G\n'
    + 'A1UdDgQWBBT/H3x+cqSkR/ePSIinPtc4yWKe3DCBpwYDVR0jBIGfMIGcgBT/H3x+\n'
    + 'cqSkR/ePSIinPtc4yWKe3KF5pHcwdTELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh\n'
    + 'c2hpbmd0b24xEDAOBgNVBAcTB1NlYXR0bGUxEzARBgNVBAoTCkFtYXpvbi5jb20x\n'
    + 'DDAKBgNVBAsTA1JEUzEcMBoGA1UEAxMTYXdzLmFtYXpvbi5jb20vcmRzL4IJAOd1\n'
    + 'tlfiGoEoMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADgYEAvguZy/BDT66x\n'
    + 'GfgnJlyQwnFSeVLQm9u/FIvz4huGjbq9dqnD6h/Gm56QPFdyMEyDiZWaqY6V08lY\n'
    + 'LTBNb4kcIc9/6pc0/ojKciP5QJRm6OiZ4vgG05nF4fYjhU7WClUx7cxq1fKjNc2J\n'
    + 'UCmmYqgiVkAGWRETVo+byOSDZ4swb10=\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS global root CA 2015 to 2020
     *
     *   CN = Amazon RDS Root CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2015-02-05T09:11:31Z/2020-03-05T09:11:31Z
     *   F = E8:11:88:56:E7:A7:CE:3E:5E:DC:9A:31:25:1B:93:AC:DC:43:CE:B0
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIID9DCCAtygAwIBAgIBQjANBgkqhkiG9w0BAQUFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNTAyMDUwOTExMzFaFw0y\n'
    + 'MDAzMDUwOTExMzFaMIGKMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEbMBkGA1UEAwwSQW1hem9uIFJE\n'
    + 'UyBSb290IENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuD8nrZ8V\n'
    + 'u+VA8yVlUipCZIKPTDcOILYpUe8Tct0YeQQr0uyl018StdBsa3CjBgvwpDRq1HgF\n'
    + 'Ji2N3+39+shCNspQeE6aYU+BHXhKhIIStt3r7gl/4NqYiDDMWKHxHq0nsGDFfArf\n'
    + 'AOcjZdJagOMqb3fF46flc8k2E7THTm9Sz4L7RY1WdABMuurpICLFE3oHcGdapOb9\n'
    + 'T53pQR+xpHW9atkcf3pf7gbO0rlKVSIoUenBlZipUlp1VZl/OD/E+TtRhDDNdI2J\n'
    + 'P/DSMM3aEsq6ZQkfbz/Ilml+Lx3tJYXUDmp+ZjzMPLk/+3beT8EhrwtcG3VPpvwp\n'
    + 'BIOqsqVVTvw/CwIDAQABo2MwYTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUw\n'
    + 'AwEB/zAdBgNVHQ4EFgQUTgLurD72FchM7Sz1BcGPnIQISYMwHwYDVR0jBBgwFoAU\n'
    + 'TgLurD72FchM7Sz1BcGPnIQISYMwDQYJKoZIhvcNAQEFBQADggEBAHZcgIio8pAm\n'
    + 'MjHD5cl6wKjXxScXKtXygWH2BoDMYBJF9yfyKO2jEFxYKbHePpnXB1R04zJSWAw5\n'
    + '2EUuDI1pSBh9BA82/5PkuNlNeSTB3dXDD2PEPdzVWbSKvUB8ZdooV+2vngL0Zm4r\n'
    + '47QPyd18yPHrRIbtBtHR/6CwKevLZ394zgExqhnekYKIqqEX41xsUV0Gm6x4vpjf\n'
    + '2u6O/+YE2U+qyyxHE5Wd5oqde0oo9UUpFETJPVb6Q2cEeQib8PBAyi0i6KnF+kIV\n'
    + 'A9dY7IHSubtCK/i8wxMVqfd5GtbA8mmpeJFwnDvm9rBEsHybl08qlax9syEwsUYr\n'
    + '/40NawZfTUU=\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS global root CA 2019 to 2024
     *
     *   CN = Amazon RDS Root 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-08-22T17:08:50Z/2024-08-22T17:08:50Z
     *   F = D4:0D:DB:29:E3:75:0D:FF:A6:71:C3:14:0B:BF:5F:47:8D:1C:80:96
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEBjCCAu6gAwIBAgIJAMc0ZzaSUK51MA0GCSqGSIb3DQEBCwUAMIGPMQswCQYD\n'
    + 'VQQGEwJVUzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEi\n'
    + 'MCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1h\n'
    + 'em9uIFJEUzEgMB4GA1UEAwwXQW1hem9uIFJEUyBSb290IDIwMTkgQ0EwHhcNMTkw\n'
    + 'ODIyMTcwODUwWhcNMjQwODIyMTcwODUwWjCBjzELMAkGA1UEBhMCVVMxEDAOBgNV\n'
    + 'BAcMB1NlYXR0bGUxEzARBgNVBAgMCldhc2hpbmd0b24xIjAgBgNVBAoMGUFtYXpv\n'
    + 'biBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxIDAeBgNV\n'
    + 'BAMMF0FtYXpvbiBSRFMgUm9vdCAyMDE5IENBMIIBIjANBgkqhkiG9w0BAQEFAAOC\n'
    + 'AQ8AMIIBCgKCAQEArXnF/E6/Qh+ku3hQTSKPMhQQlCpoWvnIthzX6MK3p5a0eXKZ\n'
    + 'oWIjYcNNG6UwJjp4fUXl6glp53Jobn+tWNX88dNH2n8DVbppSwScVE2LpuL+94vY\n'
    + '0EYE/XxN7svKea8YvlrqkUBKyxLxTjh+U/KrGOaHxz9v0l6ZNlDbuaZw3qIWdD/I\n'
    + '6aNbGeRUVtpM6P+bWIoxVl/caQylQS6CEYUk+CpVyJSkopwJlzXT07tMoDL5WgX9\n'
    + 'O08KVgDNz9qP/IGtAcRduRcNioH3E9v981QO1zt/Gpb2f8NqAjUUCUZzOnij6mx9\n'
    + 'McZ+9cWX88CRzR0vQODWuZscgI08NvM69Fn2SQIDAQABo2MwYTAOBgNVHQ8BAf8E\n'
    + 'BAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUc19g2LzLA5j0Kxc0LjZa\n'
    + 'pmD/vB8wHwYDVR0jBBgwFoAUc19g2LzLA5j0Kxc0LjZapmD/vB8wDQYJKoZIhvcN\n'
    + 'AQELBQADggEBAHAG7WTmyjzPRIM85rVj+fWHsLIvqpw6DObIjMWokpliCeMINZFV\n'
    + 'ynfgBKsf1ExwbvJNzYFXW6dihnguDG9VMPpi2up/ctQTN8tm9nDKOy08uNZoofMc\n'
    + 'NUZxKCEkVKZv+IL4oHoeayt8egtv3ujJM6V14AstMQ6SwvwvA93EP/Ug2e4WAXHu\n'
    + 'cbI1NAbUgVDqp+DRdfvZkgYKryjTWd/0+1fS8X1bBZVWzl7eirNVnHbSH2ZDpNuY\n'
    + '0SBd8dj5F6ld3t58ydZbrTHze7JJOd8ijySAp4/kiu9UfZWuTPABzDa/DSdz9Dk/\n'
    + 'zPW4CXXvhLmE02TA9/HeCw3KEHIwicNuEfw=\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-northeast-1 certificate CA 2015 to 2020
     *
     *   CN = Amazon RDS ap-northeast-1 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2015-02-05T22:03:06Z/2020-03-05T22:03:06Z
     *   F = 4B:2D:8A:E0:C1:A3:A9:AF:A7:BB:65:0C:5A:16:8A:39:3C:03:F2:C5
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEATCCAumgAwIBAgIBRDANBgkqhkiG9w0BAQUFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNTAyMDUyMjAzMDZaFw0y\n'
    + 'MDAzMDUyMjAzMDZaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1hem9uIFJE\n'
    + 'UyBhcC1ub3J0aGVhc3QtMSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\n'
    + 'ggEBAMmM2B4PfTXCZjbZMWiDPyxvk/eeNwIRJAhfzesiGUiLozX6CRy3rwC1ZOPV\n'
    + 'AcQf0LB+O8wY88C/cV+d4Q2nBDmnk+Vx7o2MyMh343r5rR3Na+4izd89tkQVt0WW\n'
    + 'vO21KRH5i8EuBjinboOwAwu6IJ+HyiQiM0VjgjrmEr/YzFPL8MgHD/YUHehqjACn\n'
    + 'C0+B7/gu7W4qJzBL2DOf7ub2qszGtwPE+qQzkCRDwE1A4AJmVE++/FLH2Zx78Egg\n'
    + 'fV1sUxPtYgjGH76VyyO6GNKM6rAUMD/q5mnPASQVIXgKbupr618bnH+SWHFjBqZq\n'
    + 'HvDGPMtiiWII41EmGUypyt5AbysCAwEAAaNmMGQwDgYDVR0PAQH/BAQDAgEGMBIG\n'
    + 'A1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFIiKM0Q6n1K4EmLxs3ZXxINbwEwR\n'
    + 'MB8GA1UdIwQYMBaAFE4C7qw+9hXITO0s9QXBj5yECEmDMA0GCSqGSIb3DQEBBQUA\n'
    + 'A4IBAQBezGbE9Rw/k2e25iGjj5n8r+M3dlye8ORfCE/dijHtxqAKasXHgKX8I9Tw\n'
    + 'JkBiGWiuzqn7gO5MJ0nMMro1+gq29qjZnYX1pDHPgsRjUX8R+juRhgJ3JSHijRbf\n'
    + '4qNJrnwga7pj94MhcLq9u0f6dxH6dXbyMv21T4TZMTmcFduf1KgaiVx1PEyJjC6r\n'
    + 'M+Ru+A0eM+jJ7uCjUoZKcpX8xkj4nmSnz9NMPog3wdOSB9cAW7XIc5mHa656wr7I\n'
    + 'WJxVcYNHTXIjCcng2zMKd1aCcl2KSFfy56sRfT7J5Wp69QSr+jq8KM55gw8uqAwi\n'
    + 'VPrXn2899T1rcTtFYFP16WXjGuc0\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-northeast-2 certificate CA 2015 to 2020
     *
     *   CN = Amazon RDS ap-northeast-2 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2015-11-06T00:05:46Z/2020-03-05T00:05:46Z
     *   F = 77:D9:33:4E:CE:56:FC:42:7B:29:57:8D:67:59:ED:29:4E:18:CB:6B
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEATCCAumgAwIBAgIBTDANBgkqhkiG9w0BAQUFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNTExMDYwMDA1NDZaFw0y\n'
    + 'MDAzMDUwMDA1NDZaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1hem9uIFJE\n'
    + 'UyBhcC1ub3J0aGVhc3QtMiBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\n'
    + 'ggEBAKSwd+RVUzTRH0FgnbwoTK8TMm/zMT4+2BvALpAUe6YXbkisg2goycWuuWLg\n'
    + 'jOpFBB3GtyvXZnkqi7MkDWUmj1a2kf8l2oLyoaZ+Hm9x/sV+IJzOqPvj1XVUGjP6\n'
    + 'yYYnPJmUYqvZeI7fEkIGdFkP2m4/sgsSGsFvpD9FK1bL1Kx2UDpYX0kHTtr18Zm/\n'
    + '1oN6irqWALSmXMDydb8hE0FB2A1VFyeKE6PnoDj/Y5cPHwPPdEi6/3gkDkSaOG30\n'
    + 'rWeQfL3pOcKqzbHaWTxMphd0DSL/quZ64Nr+Ly65Q5PRcTrtr55ekOUziuqXwk+o\n'
    + '9QpACMwcJ7ROqOznZTqTzSFVXFECAwEAAaNmMGQwDgYDVR0PAQH/BAQDAgEGMBIG\n'
    + 'A1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFM6Nox/QWbhzWVvzoJ/y0kGpNPK+\n'
    + 'MB8GA1UdIwQYMBaAFE4C7qw+9hXITO0s9QXBj5yECEmDMA0GCSqGSIb3DQEBBQUA\n'
    + 'A4IBAQCTkWBqNvyRf3Y/W21DwFx3oT/AIWrHt0BdGZO34tavummXemTH9LZ/mqv9\n'
    + 'aljt6ZuDtf5DEQjdsAwXMsyo03ffnP7doWm8iaF1+Mui77ot0TmTsP/deyGwukvJ\n'
    + 'tkxX8bZjDh+EaNauWKr+CYnniNxCQLfFtXYJsfOdVBzK3xNL+Z3ucOQRhr2helWc\n'
    + 'CDQgwfhP1+3pRVKqHvWCPC4R3fT7RZHuRmZ38kndv476GxRntejh+ePffif78bFI\n'
    + '3rIZCPBGobrrUMycafSbyXteoGca/kA+/IqrAPlk0pWQ4aEL0yTWN2h2dnjoD7oX\n'
    + 'byIuL/g9AGRh97+ssn7D6bDRPTbW\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-southeast-1 certificate CA 2015 to 2020
     *
     *   CN = Amazon RDS ap-southeast-1 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2015-02-05T22:03:19Z/2020-03-05T22:03:19Z
     *   F = 0E:EC:5D:BD:F9:80:EE:A9:A0:8D:81:AC:37:D9:8D:34:1C:CD:27:D1
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEATCCAumgAwIBAgIBRTANBgkqhkiG9w0BAQUFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNTAyMDUyMjAzMTlaFw0y\n'
    + 'MDAzMDUyMjAzMTlaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1hem9uIFJE\n'
    + 'UyBhcC1zb3V0aGVhc3QtMSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\n'
    + 'ggEBANaXElmSEYt/UtxHFsARFhSUahTf1KNJzR0Dmay6hqOXQuRVbKRwPd19u5vx\n'
    + 'DdF1sLT7D69IK3VDnUiQScaCv2Dpu9foZt+rLx+cpx1qiQd1UHrvqq8xPzQOqCdC\n'
    + 'RFStq6yVYZ69yfpfoI67AjclMOjl2Vph3ftVnqP0IgVKZdzeC7fd+umGgR9xY0Qr\n'
    + 'Ubhd/lWdsbNvzK3f1TPWcfIKQnpvSt85PIEDJir6/nuJUKMtmJRwTymJf0i+JZ4x\n'
    + '7dJa341p2kHKcHMgOPW7nJQklGBA70ytjUV6/qebS3yIugr/28mwReflg3TJzVDl\n'
    + 'EOvi6pqbqNbkMuEwGDCmEQIVqgkCAwEAAaNmMGQwDgYDVR0PAQH/BAQDAgEGMBIG\n'
    + 'A1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFAu93/4k5xbWOsgdCdn+/KdiRuit\n'
    + 'MB8GA1UdIwQYMBaAFE4C7qw+9hXITO0s9QXBj5yECEmDMA0GCSqGSIb3DQEBBQUA\n'
    + 'A4IBAQBlcjSyscpPjf5+MgzMuAsCxByqUt+WFspwcMCpwdaBeHOPSQrXNqX2Sk6P\n'
    + 'kth6oCivA64trWo8tFMvPYlUA1FYVD5WpN0kCK+P5pD4KHlaDsXhuhClJzp/OP8t\n'
    + 'pOyUr5109RHLxqoKB5J5m1XA7rgcFjnMxwBSWFe3/4uMk/+4T53YfCVXuc6QV3i7\n'
    + 'I/2LAJwFf//pTtt6fZenYfCsahnr2nvrNRNyAxcfvGZ/4Opn/mJtR6R/AjvQZHiR\n'
    + 'bkRNKF2GW0ueK5W4FkZVZVhhX9xh1Aj2Ollb+lbOqADaVj+AT3PoJPZ3MPQHKCXm\n'
    + 'xwG0LOLlRr/TfD6li1AfOVTAJXv9\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-southeast-2 certificate CA 2015 to 2020
     *
     *   CN = Amazon RDS ap-southeast-2 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2015-02-05T22:03:24Z/2020-03-05T22:03:24Z
     *   F = 20:D9:A8:82:23:AB:B9:E5:C5:24:10:D3:4D:0F:3D:B1:31:DF:E5:14
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEATCCAumgAwIBAgIBRjANBgkqhkiG9w0BAQUFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNTAyMDUyMjAzMjRaFw0y\n'
    + 'MDAzMDUyMjAzMjRaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1hem9uIFJE\n'
    + 'UyBhcC1zb3V0aGVhc3QtMiBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\n'
    + 'ggEBAJqBAJutz69hFOh3BtLHZTbwE8eejGGKayn9hu98YMDPzWzGXWCmW+ZYWELA\n'
    + 'cY3cNWNF8K4FqKXFr2ssorBYim1UtYFX8yhydT2hMD5zgQ2sCGUpuidijuPA6zaq\n'
    + 'Z3tdhVR94f0q8mpwpv2zqR9PcqaGDx2VR1x773FupRPRo7mEW1vC3IptHCQlP/zE\n'
    + '7jQiLl28bDIH2567xg7e7E9WnZToRnhlYdTaDaJsHTzi5mwILi4cihSok7Shv/ME\n'
    + 'hnukvxeSPUpaVtFaBhfBqq055ePq9I+Ns4KGreTKMhU0O9fkkaBaBmPaFgmeX/XO\n'
    + 'n2AX7gMouo3mtv34iDTZ0h6YCGkCAwEAAaNmMGQwDgYDVR0PAQH/BAQDAgEGMBIG\n'
    + 'A1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFIlQnY0KHYWn1jYumSdJYfwj/Nfw\n'
    + 'MB8GA1UdIwQYMBaAFE4C7qw+9hXITO0s9QXBj5yECEmDMA0GCSqGSIb3DQEBBQUA\n'
    + 'A4IBAQA0wVU6/l41cTzHc4azc4CDYY2Wd90DFWiH9C/mw0SgToYfCJ/5Cfi0NT/Y\n'
    + 'PRnk3GchychCJgoPA/k9d0//IhYEAIiIDjyFVgjbTkKV3sh4RbdldKVOUB9kumz/\n'
    + 'ZpShplsGt3z4QQiVnKfrAgqxWDjR0I0pQKkxXa6Sjkicos9LQxVtJ0XA4ieG1E7z\n'
    + 'zJr+6t80wmzxvkInSaWP3xNJK9azVRTrgQZQlvkbpDbExl4mNTG66VD3bAp6t3Wa\n'
    + 'B49//uDdfZmPkqqbX+hsxp160OH0rxJppwO3Bh869PkDnaPEd/Pxw7PawC+li0gi\n'
    + 'NRV8iCEx85aFxcyOhqn0WZOasxee\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS eu-central-1 certificate CA 2015 to 2020
     *
     *   CN = Amazon RDS eu-central-1 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2015-02-05T22:03:31Z/2020-03-05T22:03:31Z
     *   F = 94:B4:DF:B9:6D:7E:F7:C3:B7:BF:51:E9:A6:B7:44:A0:D0:82:11:84
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIID/zCCAuegAwIBAgIBRzANBgkqhkiG9w0BAQUFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNTAyMDUyMjAzMzFaFw0y\n'
    + 'MDAzMDUyMjAzMzFaMIGSMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEjMCEGA1UEAwwaQW1hem9uIFJE\n'
    + 'UyBldS1jZW50cmFsLTEgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB\n'
    + 'AQDFtP2dhSLuaPOI4ZrrPWsK4OY9ocQBp3yApH1KJYmI9wpQKZG/KCH2E6Oo7JAw\n'
    + 'QORU519r033T+FO2Z7pFPlmz1yrxGXyHpJs8ySx3Yo5S8ncDCdZJCLmtPiq/hahg\n'
    + '5/0ffexMFUCQaYicFZsrJ/cStdxUV+tSw2JQLD7UxS9J97LQWUPyyG+ZrjYVTVq+\n'
    + 'zudnFmNSe4QoecXMhAFTGJFQXxP7nhSL9Ao5FGgdXy7/JWeWdQIAj8ku6cBDKPa6\n'
    + 'Y6kP+ak+In+Lye8z9qsCD/afUozfWjPR2aA4JoIZVF8dNRShIMo8l0XfgfM2q0+n\n'
    + 'ApZWZ+BjhIO5XuoUgHS3D2YFAgMBAAGjZjBkMA4GA1UdDwEB/wQEAwIBBjASBgNV\n'
    + 'HRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBRm4GsWIA/M6q+tK8WGHWDGh2gcyTAf\n'
    + 'BgNVHSMEGDAWgBROAu6sPvYVyEztLPUFwY+chAhJgzANBgkqhkiG9w0BAQUFAAOC\n'
    + 'AQEAHpMmeVQNqcxgfQdbDIi5UIy+E7zZykmtAygN1XQrvga9nXTis4kOTN6g5/+g\n'
    + 'HCx7jIXeNJzAbvg8XFqBN84Quqgpl/tQkbpco9Jh1HDs558D5NnZQxNqH5qXQ3Mm\n'
    + 'uPgCw0pYcPOa7bhs07i+MdVwPBsX27CFDtsgAIru8HvKxY1oTZrWnyIRo93tt/pk\n'
    + 'WuItVMVHjaQZVfTCow0aDUbte6Vlw82KjUFq+n2NMSCJDiDKsDDHT6BJc4AJHIq3\n'
    + '/4Z52MSC9KMr0yAaaoWfW/yMEj9LliQauAgwVjArF4q78rxpfKTG9Rfd8U1BZANP\n'
    + '7FrFMN0ThjfA1IvmOYcgskY5bQ==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS eu-west-1 certificate CA 2015 to 2020
     *
     *   CN = Amazon RDS eu-west-1 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2015-02-05T22:03:35Z/2020-03-05T22:03:35Z
     *   F = 1A:95:F0:43:82:D2:5D:A6:AD:F5:13:27:0B:40:8A:72:D9:92:F3:E0
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIID/DCCAuSgAwIBAgIBSDANBgkqhkiG9w0BAQUFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNTAyMDUyMjAzMzVaFw0y\n'
    + 'MDAzMDUyMjAzMzVaMIGPMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEgMB4GA1UEAwwXQW1hem9uIFJE\n'
    + 'UyBldS13ZXN0LTEgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCx\n'
    + 'PdbqQ0HKRj79Pmocxvjc+P6i4Ux24kgFIl+ckiir1vzkmesc3a58gjrMlCksEObt\n'
    + 'Yihs5IhzEq1ePT0gbfS9GYFp34Uj/MtPwlrfCBWG4d2TcrsKRHr1/EXUYhWqmdrb\n'
    + 'RhX8XqoRhVkbF/auzFSBhTzcGGvZpQ2KIaxRcQfcXlMVhj/pxxAjh8U4F350Fb0h\n'
    + 'nX1jw4/KvEreBL0Xb2lnlGTkwVxaKGSgXEnOgIyOFdOQc61vdome0+eeZsP4jqeR\n'
    + 'TGYJA9izJsRbe2YJxHuazD+548hsPlM3vFzKKEVURCha466rAaYAHy3rKur3HYQx\n'
    + 'Yt+SoKcEz9PXuSGj96ejAgMBAAGjZjBkMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMB\n'
    + 'Af8ECDAGAQH/AgEAMB0GA1UdDgQWBBTebg//h2oeXbZjQ4uuoiuLYzuiPDAfBgNV\n'
    + 'HSMEGDAWgBROAu6sPvYVyEztLPUFwY+chAhJgzANBgkqhkiG9w0BAQUFAAOCAQEA\n'
    + 'TikPaGeZasTPw+4RBemlsyPAjtFFQLo7ddaFdORLgdEysVf8aBqndvbA6MT/v4lj\n'
    + 'GtEtUdF59ZcbWOrVm+fBZ2h/jYJ59dYF/xzb09nyRbdMSzB9+mkSsnOMqluq5y8o\n'
    + 'DY/PfP2vGhEg/2ZncRC7nlQU1Dm8F4lFWEiQ2fi7O1cW852Vmbq61RIfcYsH/9Ma\n'
    + 'kpgk10VZ75b8m3UhmpZ/2uRY+JEHImH5WpcTJ7wNiPNJsciZMznGtrgOnPzYco8L\n'
    + 'cDleOASIZifNMQi9PKOJKvi0ITz0B/imr8KBsW0YjZVJ54HMa7W1lwugSM7aMAs+\n'
    + 'E3Sd5lS+SHwWaOCHwhOEVA==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS sa-east-1 certificate CA 2015 to 2020
     *
     *   CN = Amazon RDS sa-east-1 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2015-02-05T22:03:40Z/2020-03-05T22:03:40Z
     *   F = 32:10:3D:FA:6D:42:F5:35:98:40:15:F4:4C:74:74:27:CB:CE:D4:B5
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIID/DCCAuSgAwIBAgIBSTANBgkqhkiG9w0BAQUFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNTAyMDUyMjAzNDBaFw0y\n'
    + 'MDAzMDUyMjAzNDBaMIGPMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEgMB4GA1UEAwwXQW1hem9uIFJE\n'
    + 'UyBzYS1lYXN0LTEgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCU\n'
    + 'X4OBnQ5xA6TLJAiFEI6l7bUWjoVJBa/VbMdCCSs2i2dOKmqUaXu2ix2zcPILj3lZ\n'
    + 'GMk3d/2zvTK/cKhcFrewHUBamTeVHdEmynhMQamqNmkM4ptYzFcvEUw1TGxHT4pV\n'
    + 'Q6gSN7+/AJewQvyHexHo8D0+LDN0/Wa9mRm4ixCYH2CyYYJNKaZt9+EZfNu+PPS4\n'
    + '8iB0TWH0DgQkbWMBfCRgolLLitAZklZ4dvdlEBS7evN1/7ttBxUK6SvkeeSx3zBl\n'
    + 'ww3BlXqc3bvTQL0A+RRysaVyFbvtp9domFaDKZCpMmDFAN/ntx215xmQdrSt+K3F\n'
    + 'cXdGQYHx5q410CAclGnbAgMBAAGjZjBkMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMB\n'
    + 'Af8ECDAGAQH/AgEAMB0GA1UdDgQWBBT6iVWnm/uakS+tEX2mzIfw+8JL0zAfBgNV\n'
    + 'HSMEGDAWgBROAu6sPvYVyEztLPUFwY+chAhJgzANBgkqhkiG9w0BAQUFAAOCAQEA\n'
    + 'FmDD+QuDklXn2EgShwQxV13+txPRuVdOSrutHhoCgMwFWCMtPPtBAKs6KPY7Guvw\n'
    + 'DpJoZSehDiOfsgMirjOWjvfkeWSNvKfjWTVneX7pZD9W5WPnsDBvTbCGezm+v87z\n'
    + 'b+ZM2ZMo98m/wkMcIEAgdSKilR2fuw8rLkAjhYFfs0A7tDgZ9noKwgHvoE4dsrI0\n'
    + 'KZYco6DlP/brASfHTPa2puBLN9McK3v+h0JaSqqm5Ro2Bh56tZkQh8AWy/miuDuK\n'
    + '3+hNEVdxosxlkM1TPa1DGj0EzzK0yoeerXuH2HX7LlCrrxf6/wdKnjR12PMrLQ4A\n'
    + 'pCqkcWw894z6bV9MAvKe6A==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS us-east-1 certificate CA 2015 to 2020
     *
     *   CN = Amazon RDS us-east-1 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2015-02-05T21:54:04Z/2020-03-05T21:54:04Z
     *   F = 34:47:8A:90:8A:83:AE:45:DC:B6:16:76:D2:35:EC:E9:75:C6:2C:63
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIID/DCCAuSgAwIBAgIBQzANBgkqhkiG9w0BAQUFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNTAyMDUyMTU0MDRaFw0y\n'
    + 'MDAzMDUyMTU0MDRaMIGPMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEgMB4GA1UEAwwXQW1hem9uIFJE\n'
    + 'UyB1cy1lYXN0LTEgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDI\n'
    + 'UIuwh8NusKHk1SqPXcP7OqxY3S/M2ZyQWD3w7Bfihpyyy/fc1w0/suIpX3kbMhAV\n'
    + '2ESwged2/2zSx4pVnjp/493r4luhSqQYzru78TuPt9bhJIJ51WXunZW2SWkisSaf\n'
    + 'USYUzVN9ezR/bjXTumSUQaLIouJt3OHLX49s+3NAbUyOI8EdvgBQWD68H1epsC0n\n'
    + 'CI5s+pIktyOZ59c4DCDLQcXErQ+tNbDC++oct1ANd/q8p9URonYwGCGOBy7sbCYq\n'
    + '9eVHh1Iy2M+SNXddVOGw5EuruvHoCIQyOz5Lz4zSuZA9dRbrfztNOpezCNYu6NKM\n'
    + 'n+hzcvdiyxv77uNm8EaxAgMBAAGjZjBkMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMB\n'
    + 'Af8ECDAGAQH/AgEAMB0GA1UdDgQWBBQSQG3TmMe6Sa3KufaPBa72v4QFDzAfBgNV\n'
    + 'HSMEGDAWgBROAu6sPvYVyEztLPUFwY+chAhJgzANBgkqhkiG9w0BAQUFAAOCAQEA\n'
    + 'L/mOZfB3187xTmjOHMqN2G2oSKHBKiQLM9uv8+97qT+XR+TVsBT6b3yoPpMAGhHA\n'
    + 'Pc7nxAF5gPpuzatx0OTLPcmYucFmfqT/1qA5WlgCnMNtczyNMH97lKFTNV7Njtek\n'
    + 'jWEzAEQSyEWrkNpNlC4j6kMYyPzVXQeXUeZTgJ9FNnVZqmvfjip2N22tawMjrCn5\n'
    + '7KN/zN65EwY2oO9XsaTwwWmBu3NrDdMbzJnbxoWcFWj4RBwanR1XjQOVNhDwmCOl\n'
    + '/1Et13b8CPyj69PC8BOVU6cfTSx8WUVy0qvYOKHNY9Bqa5BDnIL3IVmUkeTlM1mt\n'
    + 'enRpyBj+Bk9rh/ICdiRKmA==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS us-west-1 certificate CA 2015 to 2020
     *
     *   CN = Amazon RDS us-west-1 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2015-02-05T22:03:45Z/2020-03-05T22:03:45Z
     *   F = EF:94:2F:E3:58:0E:09:D6:79:C2:16:97:91:FB:37:EA:D7:70:A8:4B
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIID/DCCAuSgAwIBAgIBSjANBgkqhkiG9w0BAQUFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNTAyMDUyMjAzNDVaFw0y\n'
    + 'MDAzMDUyMjAzNDVaMIGPMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEgMB4GA1UEAwwXQW1hem9uIFJE\n'
    + 'UyB1cy13ZXN0LTEgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDE\n'
    + 'Dhw+uw/ycaiIhhyu2pXFRimq0DlB8cNtIe8hdqndH8TV/TFrljNgR8QdzOgZtZ9C\n'
    + 'zzQ2GRpInN/qJF6slEd6wO+6TaDBQkPY+07TXNt52POFUhdVkhJXHpE2BS7Xn6J7\n'
    + '7RFAOeG1IZmc2DDt+sR1BgXzUqHslQGfFYNS0/MBO4P+ya6W7IhruB1qfa4HiYQS\n'
    + 'dbe4MvGWnv0UzwAqdR7OF8+8/5c58YXZIXCO9riYF2ql6KNSL5cyDPcYK5VK0+Q9\n'
    + 'VI6vuJHSMYcF7wLePw8jtBktqAFE/wbdZiIHhZvNyiNWPPNTGUmQbaJ+TzQEHDs5\n'
    + '8en+/W7JKnPyBOkxxENbAgMBAAGjZjBkMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMB\n'
    + 'Af8ECDAGAQH/AgEAMB0GA1UdDgQWBBS0nw/tFR9bCjgqWTPJkyy4oOD8bzAfBgNV\n'
    + 'HSMEGDAWgBROAu6sPvYVyEztLPUFwY+chAhJgzANBgkqhkiG9w0BAQUFAAOCAQEA\n'
    + 'CXGAY3feAak6lHdqj6+YWjy6yyUnLK37bRxZDsyDVXrPRQaXRzPTzx79jvDwEb/H\n'
    + 'Q/bdQ7zQRWqJcbivQlwhuPJ4kWPUZgSt3JUUuqkMsDzsvj/bwIjlrEFDOdHGh0mi\n'
    + 'eVIngFEjUXjMh+5aHPEF9BlQnB8LfVtKj18e15UDTXFa+xJPFxUR7wDzCfo4WI1m\n'
    + 'sUMG4q1FkGAZgsoyFPZfF8IVvgCuGdR8z30VWKklFxttlK0eGLlPAyIO0CQxPQlo\n'
    + 'saNJrHf4tLOgZIWk+LpDhNd9Et5EzvJ3aURUsKY4pISPPF5WdvM9OE59bERwUErd\n'
    + 'nuOuQWQeeadMceZnauRzJQ==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS us-west-2 certificate CA 2015 to 2020
     *
     *   CN = Amazon RDS us-west-2 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2015-02-05T22:03:50Z/2020-03-05T22:03:50Z
     *   F = 94:2C:A8:B0:23:48:17:F0:CD:2F:19:7F:C1:E0:21:7C:65:79:13:3A
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIID/DCCAuSgAwIBAgIBSzANBgkqhkiG9w0BAQUFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNTAyMDUyMjAzNTBaFw0y\n'
    + 'MDAzMDUyMjAzNTBaMIGPMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEgMB4GA1UEAwwXQW1hem9uIFJE\n'
    + 'UyB1cy13ZXN0LTIgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDM\n'
    + 'H58SR48U6jyERC1vYTnub34smf5EQVXyzaTmspWGWGzT31NLNZGSDFaa7yef9kdO\n'
    + 'mzJsgebR5tXq6LdwlIoWkKYQ7ycUaadtVKVYdI40QcI3cHn0qLFlg2iBXmWp/B+i\n'
    + 'Z34VuVlCh31Uj5WmhaBoz8t/GRqh1V/aCsf3Wc6jCezH3QfuCjBpzxdOOHN6Ie2v\n'
    + 'xX09O5qmZTvMoRBAvPkxdaPg/Mi7fxueWTbEVk78kuFbF1jHYw8U1BLILIAhcqlq\n'
    + 'x4u8nl73t3O3l/soNUcIwUDK0/S+Kfqhwn9yQyPlhb4Wy3pfnZLJdkyHldktnQav\n'
    + '9TB9u7KH5Lk0aAYslMLxAgMBAAGjZjBkMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMB\n'
    + 'Af8ECDAGAQH/AgEAMB0GA1UdDgQWBBT8roM4lRnlFHWMPWRz0zkwFZog1jAfBgNV\n'
    + 'HSMEGDAWgBROAu6sPvYVyEztLPUFwY+chAhJgzANBgkqhkiG9w0BAQUFAAOCAQEA\n'
    + 'JwrxwgwmPtcdaU7O7WDdYa4hprpOMamI49NDzmE0s10oGrqmLwZygcWU0jT+fJ+Y\n'
    + 'pJe1w0CVfKaeLYNsOBVW3X4ZPmffYfWBheZiaiEflq/P6t7/Eg81gaKYnZ/x1Dfa\n'
    + 'sUYkzPvCkXe9wEz5zdUTOCptDt89rBR9CstL9vE7WYUgiVVmBJffWbHQLtfjv6OF\n'
    + 'NMb0QME981kGRzc2WhgP71YS2hHd1kXtsoYP1yTu4vThSKsoN4bkiHsaC1cRkLoy\n'
    + '0fFA4wpB3WloMEvCDaUvvH1LZlBXTNlwi9KtcwD4tDxkkBt4tQczKLGpQ/nF/W9n\n'
    + '8YDWk3IIc1sd0bkZqoau2Q==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-south-1 certificate CA 2016 to 2020
     *
     *   CN = Amazon RDS ap-south-1 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2016-05-03T21:29:22Z/2020-03-05T21:29:22Z
     *   F = F3:A3:C2:52:D9:82:20:AC:8C:62:31:2A:8C:AD:5D:7B:1C:31:F1:DD
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIID/TCCAuWgAwIBAgIBTTANBgkqhkiG9w0BAQsFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNjA1MDMyMTI5MjJaFw0y\n'
    + 'MDAzMDUyMTI5MjJaMIGQMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEhMB8GA1UEAwwYQW1hem9uIFJE\n'
    + 'UyBhcC1zb3V0aC0xIENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\n'
    + '06eWGLE0TeqL9kyWOLkS8q0fXO97z+xyBV3DKSB2lg2GkgBz3B98MkmkeB0SZy3G\n'
    + 'Ce4uCpCPbFKiFEdiUclOlhZsrBuCeaimxLM3Ig2wuenElO/7TqgaYHYUbT3d+VQW\n'
    + 'GUbLn5GRZJZe1OAClYdOWm7A1CKpuo+cVV1vxbY2nGUQSJPpVn2sT9gnwvjdE60U\n'
    + 'JGYU/RLCTm8zmZBvlWaNIeKDnreIc4rKn6gUnJ2cQn1ryCVleEeyc3xjYDSrjgdn\n'
    + 'FLYGcp9mphqVT0byeQMOk0c7RHpxrCSA0V5V6/CreFV2LteK50qcDQzDSM18vWP/\n'
    + 'p09FoN8O7QrtOeZJzH/lmwIDAQABo2YwZDAOBgNVHQ8BAf8EBAMCAQYwEgYDVR0T\n'
    + 'AQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQU2i83QHuEl/d0keXF+69HNJph7cMwHwYD\n'
    + 'VR0jBBgwFoAUTgLurD72FchM7Sz1BcGPnIQISYMwDQYJKoZIhvcNAQELBQADggEB\n'
    + 'ACqnH2VjApoDqoSQOky52QBwsGaj+xWYHW5Gm7EvCqvQuhWMkeBuD6YJmMvNyA9G\n'
    + 'I2lh6/o+sUk/RIsbYbxPRdhNPTOgDR9zsNRw6qxaHztq/CEC+mxDCLa3O1hHBaDV\n'
    + 'BmB3nCZb93BvO0EQSEk7aytKq/f+sjyxqOcs385gintdHGU9uM7gTZHnU9vByJsm\n'
    + '/TL07Miq67X0NlhIoo3jAk+xHaeKJdxdKATQp0448P5cY20q4b8aMk1twcNaMvCP\n'
    + 'dG4M5doaoUA8OQ/0ukLLae/LBxLeTw04q1/a2SyFaVUX2Twbb1S3xVWwLA8vsyGr\n'
    + 'igXx7B5GgP+IHb6DTjPJAi0=\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS us-east-2 certificate CA 2016 to 2020
     *
     *   CN = Amazon RDS us-east-2 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2016-08-11T19:58:45Z/2020-03-05T19:58:45Z
     *   F = 9B:78:E3:64:7F:74:BC:B2:52:18:CF:13:C3:62:B8:35:9D:3D:5F:B6
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIID/DCCAuSgAwIBAgIBTjANBgkqhkiG9w0BAQsFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNjA4MTExOTU4NDVaFw0y\n'
    + 'MDAzMDUxOTU4NDVaMIGPMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEgMB4GA1UEAwwXQW1hem9uIFJE\n'
    + 'UyB1cy1lYXN0LTIgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCp\n'
    + 'WnnUX7wM0zzstccX+4iXKJa9GR0a2PpvB1paEX4QRCgfhEdQWDaSqyrWNgdVCKkt\n'
    + '1aQkWu5j6VAC2XIG7kKoonm1ZdBVyBLqW5lXNywlaiU9yhJkwo8BR+/OqgE+PLt/\n'
    + 'EO1mlN0PQudja/XkExCXTO29TG2j7F/O7hox6vTyHNHc0H88zS21uPuBE+jivViS\n'
    + 'yzj/BkyoQ85hnkues3f9R6gCGdc+J51JbZnmgzUkvXjAEuKhAm9JksVOxcOKUYe5\n'
    + 'ERhn0U9zjzpfbAITIkul97VVa5IxskFFTHIPJbvRKHJkiF6wTJww/tc9wm+fSCJ1\n'
    + '+DbQTGZgkQ3bJrqRN29/AgMBAAGjZjBkMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMB\n'
    + 'Af8ECDAGAQH/AgEAMB0GA1UdDgQWBBSAHQzUYYZbepwKEMvGdHp8wzHnfDAfBgNV\n'
    + 'HSMEGDAWgBROAu6sPvYVyEztLPUFwY+chAhJgzANBgkqhkiG9w0BAQsFAAOCAQEA\n'
    + 'MbaEzSYZ+aZeTBxf8yi0ta8K4RdwEJsEmP6IhFFQHYUtva2Cynl4Q9tZg3RMsybT\n'
    + '9mlnSQQlbN/wqIIXbkrcgFcHoXG9Odm/bDtUwwwDaiEhXVfeQom3G77QHOWMTCGK\n'
    + 'qadwuh5msrb17JdXZoXr4PYHDKP7j0ONfAyFNER2+uecblHfRSpVq5UeF3L6ZJb8\n'
    + 'fSw/GtAV6an+/0r+Qm+PiI2H5XuZ4GmRJYnGMhqWhBYrY7p3jtVnKcsh39wgfUnW\n'
    + 'AvZEZG/yhFyAZW0Essa39LiL5VSq14Y1DOj0wgnhSY/9WHxaAo1HB1T9OeZknYbD\n'
    + 'fl/EGSZ0TEvZkENrXcPlVA==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ca-central-1 certificate CA 2016 to 2020
     *
     *   CN = Amazon RDS ca-central-1 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2016-09-15T00:10:11Z/2020-03-05T00:10:11Z
     *   F = D7:E0:16:AB:8A:0B:63:9F:67:1F:16:87:42:F4:0A:EE:73:A6:FC:04
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIID/zCCAuegAwIBAgIBTzANBgkqhkiG9w0BAQsFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNjA5MTUwMDEwMTFaFw0y\n'
    + 'MDAzMDUwMDEwMTFaMIGSMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEjMCEGA1UEAwwaQW1hem9uIFJE\n'
    + 'UyBjYS1jZW50cmFsLTEgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB\n'
    + 'AQCZYI/iQ6DrS3ny3t1EwX1wAD+3LMgh7Fd01EW5LIuaK2kYIIQpsVKhxLCit/V5\n'
    + 'AGc/1qiJS1Qz9ODLTh0Na6bZW6EakRzuHJLe32KJtoFYPC7Z09UqzXrpA/XL+1hM\n'
    + 'P0ZmCWsU7Nn/EmvfBp9zX3dZp6P6ATrvDuYaVFr+SA7aT3FXpBroqBS1fyzUPs+W\n'
    + 'c6zTR6+yc4zkHX0XQxC5RH6xjgpeRkoOajA/sNo7AQF7KlWmKHbdVF44cvvAhRKZ\n'
    + 'XaoVs/C4GjkaAEPTCbopYdhzg+KLx9eB2BQnYLRrIOQZtRfbQI2Nbj7p3VsRuOW1\n'
    + 'tlcks2w1Gb0YC6w6SuIMFkl1AgMBAAGjZjBkMA4GA1UdDwEB/wQEAwIBBjASBgNV\n'
    + 'HRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBToYWxE1lawl6Ks6NsvpbHQ3GKEtzAf\n'
    + 'BgNVHSMEGDAWgBROAu6sPvYVyEztLPUFwY+chAhJgzANBgkqhkiG9w0BAQsFAAOC\n'
    + 'AQEAG/8tQ0ooi3hoQpa5EJz0/E5VYBsAz3YxA2HoIonn0jJyG16bzB4yZt4vNQMA\n'
    + 'KsNlQ1uwDWYL1nz63axieUUFIxqxl1KmwfhsmLgZ0Hd2mnTPIl2Hw3uj5+wdgGBg\n'
    + 'agnAZ0bajsBYgD2VGQbqjdk2Qn7Fjy3LEWIvGZx4KyZ99OJ2QxB7JOPdauURAtWA\n'
    + 'DKYkP4LLJxtj07DSzG8kuRWb9B47uqUD+eKDIyjfjbnzGtd9HqqzYFau7EX3HVD9\n'
    + '9Qhnjl7bTZ6YfAEZ3nH2t3Vc0z76XfGh47rd0pNRhMV+xpok75asKf/lNh5mcUrr\n'
    + 'VKwflyMkQpSbDCmcdJ90N2xEXQ==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS eu-west-2 certificate CA 2016 to 2020
     *
     *   CN = Amazon RDS eu-west-2 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2016-10-10T17:44:42Z/2020-03-05T17:44:42Z
     *   F = 47:79:51:9F:FF:07:D3:F4:27:D3:AB:64:56:7F:00:45:BB:84:C1:71
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIID/DCCAuSgAwIBAgIBUDANBgkqhkiG9w0BAQsFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNjEwMTAxNzQ0NDJaFw0y\n'
    + 'MDAzMDUxNzQ0NDJaMIGPMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEgMB4GA1UEAwwXQW1hem9uIFJE\n'
    + 'UyBldS13ZXN0LTIgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDO\n'
    + 'cttLJfubB4XMMIGWNfJISkIdCMGJyOzLiMJaiWB5GYoXKhEl7YGotpy0qklwW3BQ\n'
    + 'a0fmVdcCLX+dIuVQ9iFK+ZcK7zwm7HtdDTCHOCKeOh2IcnU4c/VIokFi6Gn8udM6\n'
    + 'N/Zi5M5OGpVwLVALQU7Yctsn3c95el6MdVx6mJiIPVu7tCVZn88Z2koBQ2gq9P4O\n'
    + 'Sb249SHFqOb03lYDsaqy1NDsznEOhaRBw7DPJFpvmw1lA3/Y6qrExRI06H2VYR2i\n'
    + '7qxwDV50N58fs10n7Ye1IOxTVJsgEA7X6EkRRXqYaM39Z76R894548WHfwXWjUsi\n'
    + 'MEX0RS0/t1GmnUQjvevDAgMBAAGjZjBkMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMB\n'
    + 'Af8ECDAGAQH/AgEAMB0GA1UdDgQWBBQBxmcuRSxERYCtNnSr5xNfySokHjAfBgNV\n'
    + 'HSMEGDAWgBROAu6sPvYVyEztLPUFwY+chAhJgzANBgkqhkiG9w0BAQsFAAOCAQEA\n'
    + 'UyCUQjsF3nUAABjfEZmpksTuUo07aT3KGYt+EMMFdejnBQ0+2lJJFGtT+CDAk1SD\n'
    + 'RSgfEBon5vvKEtlnTf9a3pv8WXOAkhfxnryr9FH6NiB8obISHNQNPHn0ljT2/T+I\n'
    + 'Y6ytfRvKHa0cu3V0NXbJm2B4KEOt4QCDiFxUIX9z6eB4Kditwu05OgQh6KcogOiP\n'
    + 'JesWxBMXXGoDC1rIYTFO7szwDyOHlCcVXJDNsTJhc32oDWYdeIbW7o/5I+aQsrXZ\n'
    + 'C96HykZcgWzz6sElrQxUaT3IoMw/5nmw4uWKKnZnxgI9bY4fpQwMeBZ96iHfFxvH\n'
    + 'mqfEEuC7uUoPofXdBp2ObQ==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS us-gov-west-1 CA 2017 to 2022
     *
     *   CN = Amazon RDS us-gov-west-1 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2017-05-19T22:31:19Z/2022-05-18T12:00:00Z
     *   F = 77:55:8C:C4:5E:71:1F:1B:57:E3:DA:6E:5B:74:27:12:4E:E8:69:E8
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIECjCCAvKgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwgZMxCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSQwIgYDVQQDDBtBbWF6b24gUkRTIEdvdkNsb3VkIFJvb3QgQ0EwHhcNMTcwNTE5\n'
    + 'MjIzMTE5WhcNMjIwNTE4MTIwMDAwWjCBkzELMAkGA1UEBhMCVVMxEzARBgNVBAgM\n'
    + 'Cldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoMGUFtYXpvbiBX\n'
    + 'ZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxJDAiBgNVBAMM\n'
    + 'G0FtYXpvbiBSRFMgdXMtZ292LXdlc3QtMSBDQTCCASIwDQYJKoZIhvcNAQEBBQAD\n'
    + 'ggEPADCCAQoCggEBAM8YZLKAzzOdNnoi7Klih26Zkj+OCpDfwx4ZYB6f8L8UoQi5\n'
    + '8z9ZtIwMjiJ/kO08P1yl4gfc7YZcNFvhGruQZNat3YNpxwUpQcr4mszjuffbL4uz\n'
    + '+/8FBxALdqCVOJ5Q0EVSfz3d9Bd1pUPL7ARtSpy7bn/tUPyQeI+lODYO906C0TQ3\n'
    + 'b9bjOsgAdBKkHfjLdsknsOZYYIzYWOJyFJJa0B11XjDUNBy/3IuC0KvDl6At0V5b\n'
    + '8M6cWcKhte2hgjwTYepV+/GTadeube1z5z6mWsN5arOAQUtYDLH6Aztq9mCJzLHm\n'
    + 'RccBugnGl3fRLJ2VjioN8PoGoN9l9hFBy5fnFgsCAwEAAaNmMGQwDgYDVR0PAQH/\n'
    + 'BAQDAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFEG7+br8KkvwPd5g\n'
    + '71Rvh2stclJbMB8GA1UdIwQYMBaAFEkQz6S4NS5lOYKcDjBSuCcVpdzjMA0GCSqG\n'
    + 'SIb3DQEBCwUAA4IBAQBMA327u5ABmhX+aPxljoIbxnydmAFWxW6wNp5+rZrvPig8\n'
    + 'zDRqGQWWr7wWOIjfcWugSElYtf/m9KZHG/Z6+NG7nAoUrdcd1h/IQhb+lFQ2b5g9\n'
    + 'sVzQv/H2JNkfZA8fL/Ko/Tm/f9tcqe0zrGCtT+5u0Nvz35Wl8CEUKLloS5xEb3k5\n'
    + '7D9IhG3fsE3vHWlWrGCk1cKry3j12wdPG5cUsug0vt34u6rdhP+FsM0tHI15Kjch\n'
    + 'RuUCvyQecy2ZFNAa3jmd5ycNdL63RWe8oayRBpQBxPPCbHfILxGZEdJbCH9aJ2D/\n'
    + 'l8oHIDnvOLdv7/cBjyYuvmprgPtu3QEkbre5Hln/\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS eu-west-3 certificate CA 2017 to 2020
     *
     *   CN = Amazon RDS eu-west-3 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2017-08-25T21:39:26Z/2020-03-05T21:39:26Z
     *   F = FD:35:A7:84:60:68:98:00:12:54:ED:34:26:8C:66:0F:72:DD:B2:F4
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIID/DCCAuSgAwIBAgIBUTANBgkqhkiG9w0BAQsFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNzA4MjUyMTM5MjZaFw0y\n'
    + 'MDAzMDUyMTM5MjZaMIGPMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEgMB4GA1UEAwwXQW1hem9uIFJE\n'
    + 'UyBldS13ZXN0LTMgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC+\n'
    + 'xmlEC/3a4cJH+UPwXCE02lC7Zq5NHd0dn6peMeLN8agb6jW4VfSY0NydjRj2DJZ8\n'
    + 'K7wV6sub5NUGT1NuFmvSmdbNR2T59KX0p2dVvxmXHHtIpQ9Y8Aq3ZfhmC5q5Bqgw\n'
    + 'tMA1xayDi7HmoPX3R8kk9ktAZQf6lDeksCvok8idjTu9tiSpDiMwds5BjMsWfyjZ\n'
    + 'd13PTGGNHYVdP692BSyXzSP1Vj84nJKnciW8tAqwIiadreJt5oXyrCXi8ekUMs80\n'
    + 'cUTuGm3aA3Q7PB5ljJMPqz0eVddaiIvmTJ9O3Ez3Du/HpImyMzXjkFaf+oNXf/Hx\n'
    + '/EW5jCRR6vEiXJcDRDS7AgMBAAGjZjBkMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMB\n'
    + 'Af8ECDAGAQH/AgEAMB0GA1UdDgQWBBRZ9mRtS5fHk3ZKhG20Oack4cAqMTAfBgNV\n'
    + 'HSMEGDAWgBROAu6sPvYVyEztLPUFwY+chAhJgzANBgkqhkiG9w0BAQsFAAOCAQEA\n'
    + 'F/u/9L6ExQwD73F/bhCw7PWcwwqsK1mypIdrjdIsu0JSgwWwGCXmrIspA3n3Dqxq\n'
    + 'sMhAJD88s9Em7337t+naar2VyLO63MGwjj+vA4mtvQRKq8ScIpiEc7xN6g8HUMsd\n'
    + 'gPG9lBGfNjuAZsrGJflrko4HyuSM7zHExMjXLH+CXcv/m3lWOZwnIvlVMa4x0Tz0\n'
    + 'A4fklaawryngzeEjuW6zOiYCzjZtPlP8Fw0SpzppJ8VpQfrZ751RDo4yudmPqoPK\n'
    + '5EUe36L8U+oYBXnC5TlYs9bpVv9o5wJQI5qA9oQE2eFWxF1E0AyZ4V5sgGUBStaX\n'
    + 'BjDDWul0wSo7rt1Tq7XpnA==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-northeast-3 certificate CA 2017 to 2020
     *
     *   CN = Amazon RDS ap-northeast-3 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2017-12-01T00:55:42Z/2020-03-05T00:55:42Z
     *   F = C0:C7:D4:B3:91:40:A0:77:43:28:BF:AF:77:57:DF:FD:98:FB:10:3F
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEATCCAumgAwIBAgIBTjANBgkqhkiG9w0BAQUFADCBijELMAkGA1UEBhMCVVMx\n'
    + 'EzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'GzAZBgNVBAMMEkFtYXpvbiBSRFMgUm9vdCBDQTAeFw0xNzEyMDEwMDU1NDJaFw0y\n'
    + 'MDAzMDUwMDU1NDJaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3Rv\n'
    + 'bjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\n'
    + 'cywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1hem9uIFJE\n'
    + 'UyBhcC1ub3J0aGVhc3QtMyBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\n'
    + 'ggEBAMZtQNnm/XT19mTa10ftHLzg5UhajoI65JHv4TQNdGXdsv+CQdGYU49BJ9Eu\n'
    + '3bYgiEtTzR2lQe9zGMvtuJobLhOWuavzp7IixoIQcHkFHN6wJ1CvqrxgvJfBq6Hy\n'
    + 'EuCDCiU+PPDLUNA6XM6Qx3IpHd1wrJkjRB80dhmMSpxmRmx849uFafhN+P1QybsM\n'
    + 'TI0o48VON2+vj+mNuQTyLMMP8D4odSQHjaoG+zyJfJGZeAyqQyoOUOFEyQaHC3TT\n'
    + '3IDSNCQlpxb9LerbCoKu79WFBBq3CS5cYpg8/fsnV2CniRBFFUumBt5z4dhw9RJU\n'
    + 'qlUXXO1ZyzpGd+c5v6FtrfXtnIUCAwEAAaNmMGQwDgYDVR0PAQH/BAQDAgEGMBIG\n'
    + 'A1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFETv7ELNplYy/xTeIOInl6nzeiHg\n'
    + 'MB8GA1UdIwQYMBaAFE4C7qw+9hXITO0s9QXBj5yECEmDMA0GCSqGSIb3DQEBBQUA\n'
    + 'A4IBAQCpKxOQcd0tEKb3OtsOY8q/MPwTyustGk2Rt7t9G68idADp8IytB7M0SDRo\n'
    + 'wWZqynEq7orQVKdVOanhEWksNDzGp0+FPAf/KpVvdYCd7ru3+iI+V4ZEp2JFdjuZ\n'
    + 'Zz0PIjS6AgsZqE5Ri1J+NmfmjGZCPhsHnGZiBaenX6K5VRwwwmLN6xtoqrrfR5zL\n'
    + 'QfBeeZNJG6KiM3R/DxJ5rAa6Fz+acrhJ60L7HprhB7SFtj1RCijau3+ZwiGmUOMr\n'
    + 'yKlMv+VgmzSw7o4Hbxy1WVrA6zQsTHHSGf+vkQn2PHvnFMUEu/ZLbTDYFNmTLK91\n'
    + 'K6o4nMsEvhBKgo4z7H1EqqxXhvN2\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS GovCloud Root CA 2017 to 2022
     *
     *   CN = Amazon RDS GovCloud Root CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2017-05-19T22:29:11Z/2022-05-18T22:29:11Z
     *   F = A3:61:F9:C9:A2:5B:91:FE:73:A6:52:E3:59:14:8E:CE:35:12:0F:FD
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEDjCCAvagAwIBAgIJAMM61RQn3/kdMA0GCSqGSIb3DQEBCwUAMIGTMQswCQYD\n'
    + 'VQQGEwJVUzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEi\n'
    + 'MCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1h\n'
    + 'em9uIFJEUzEkMCIGA1UEAwwbQW1hem9uIFJEUyBHb3ZDbG91ZCBSb290IENBMB4X\n'
    + 'DTE3MDUxOTIyMjkxMVoXDTIyMDUxODIyMjkxMVowgZMxCzAJBgNVBAYTAlVTMRAw\n'
    + 'DgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQKDBlB\n'
    + 'bWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMSQw\n'
    + 'IgYDVQQDDBtBbWF6b24gUkRTIEdvdkNsb3VkIFJvb3QgQ0EwggEiMA0GCSqGSIb3\n'
    + 'DQEBAQUAA4IBDwAwggEKAoIBAQDGS9bh1FGiJPT+GRb3C5aKypJVDC1H2gbh6n3u\n'
    + 'j8cUiyMXfmm+ak402zdLpSYMaxiQ7oL/B3wEmumIpRDAsQrSp3B/qEeY7ipQGOfh\n'
    + 'q2TXjXGIUjiJ/FaoGqkymHRLG+XkNNBtb7MRItsjlMVNELXECwSiMa3nJL2/YyHW\n'
    + 'nTr1+11/weeZEKgVbCUrOugFkMXnfZIBSn40j6EnRlO2u/NFU5ksK5ak2+j8raZ7\n'
    + 'xW7VXp9S1Tgf1IsWHjGZZZguwCkkh1tHOlHC9gVA3p63WecjrIzcrR/V27atul4m\n'
    + 'tn56s5NwFvYPUIx1dbC8IajLUrepVm6XOwdQCfd02DmOyjWJAgMBAAGjYzBhMA4G\n'
    + 'A1UdDwEB/wQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRJEM+kuDUu\n'
    + 'ZTmCnA4wUrgnFaXc4zAfBgNVHSMEGDAWgBRJEM+kuDUuZTmCnA4wUrgnFaXc4zAN\n'
    + 'BgkqhkiG9w0BAQsFAAOCAQEAcfA7uirXsNZyI2j4AJFVtOTKOZlQwqbyNducnmlg\n'
    + '/5nug9fAkwM4AgvF5bBOD1Hw6khdsccMwIj+1S7wpL+EYb/nSc8G0qe1p/9lZ/mZ\n'
    + 'ff5g4JOa26lLuCrZDqAk4TzYnt6sQKfa5ZXVUUn0BK3okhiXS0i+NloMyaBCL7vk\n'
    + 'kDwkHwEqflRKfZ9/oFTcCfoiHPA7AdBtaPVr0/Kj9L7k+ouz122huqG5KqX0Zpo8\n'
    + 'S0IGvcd2FZjNSNPttNAK7YuBVsZ0m2nIH1SLp//00v7yAHIgytQwwB17PBcp4NXD\n'
    + 'pCfTa27ng9mMMC2YLqWQpW4TkqjDin2ZC+5X/mbrjzTvVg==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-east-1 certificate CA 2019 to 2022
     *
     *   CN = Amazon RDS ap-east-1 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-02-17T02:47:00Z/2022-06-01T12:00:00Z
     *   F = BC:F8:70:75:1F:93:3F:A7:82:86:67:63:A8:86:1F:A4:E8:07:CE:06
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEBzCCAu+gAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwgZQxCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSUwIwYDVQQDDBxBbWF6b24gUkRTIGFwLWVhc3QtMSBSb290IENBMB4XDTE5MDIx\n'
    + 'NzAyNDcwMFoXDTIyMDYwMTEyMDAwMFowgY8xCzAJBgNVBAYTAlVTMRMwEQYDVQQI\n'
    + 'DApXYXNoaW5ndG9uMRAwDgYDVQQHDAdTZWF0dGxlMSIwIAYDVQQKDBlBbWF6b24g\n'
    + 'V2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMSAwHgYDVQQD\n'
    + 'DBdBbWF6b24gUkRTIGFwLWVhc3QtMSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\n'
    + 'ADCCAQoCggEBAOcJAUofyJuBuPr5ISHi/Ha5ed8h3eGdzn4MBp6rytPOg9NVGRQs\n'
    + 'O93fNGCIKsUT6gPuk+1f1ncMTV8Y0Fdf4aqGWme+Khm3ZOP3V1IiGnVq0U2xiOmn\n'
    + 'SQ4Q7LoeQC4lC6zpoCHVJyDjZ4pAknQQfsXb77Togdt/tK5ahev0D+Q3gCwAoBoO\n'
    + 'DHKJ6t820qPi63AeGbJrsfNjLKiXlFPDUj4BGir4dUzjEeH7/hx37na1XG/3EcxP\n'
    + '399cT5k7sY/CR9kctMlUyEEUNQOmhi/ly1Lgtihm3QfjL6K9aGLFNwX35Bkh9aL2\n'
    + 'F058u+n8DP/dPeKUAcJKiQZUmzuen5n57x8CAwEAAaNmMGQwDgYDVR0PAQH/BAQD\n'
    + 'AgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFFlqgF4FQlb9yP6c+Q3E\n'
    + 'O3tXv+zOMB8GA1UdIwQYMBaAFK9T6sY/PBZVbnHcNcQXf58P4OuPMA0GCSqGSIb3\n'
    + 'DQEBCwUAA4IBAQDeXiS3v1z4jWAo1UvVyKDeHjtrtEH1Rida1eOXauFuEQa5tuOk\n'
    + 'E53Os4haZCW4mOlKjigWs4LN+uLIAe1aFXGo92nGIqyJISHJ1L+bopx/JmIbHMCZ\n'
    + '0lTNJfR12yBma5VQy7vzeFku/SisKwX0Lov1oHD4MVhJoHbUJYkmAjxorcIHORvh\n'
    + 'I3Vj5XrgDWtLDPL8/Id/roul/L+WX5ir+PGScKBfQIIN2lWdZoqdsx8YWqhm/ikL\n'
    + 'C6qNieSwcvWL7C03ri0DefTQMY54r5wP33QU5hJ71JoaZI3YTeT0Nf+NRL4hM++w\n'
    + 'Q0veeNzBQXg1f/JxfeA39IDIX1kiCf71tGlT\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-northeast-1 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS ap-northeast-1 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-18T16:56:20Z/2024-08-22T17:08:50Z
     *   F = 47:A3:F9:20:64:5C:9F:9D:48:8C:7D:E6:0B:86:D6:05:13:00:16:A1
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEDDCCAvSgAwIBAgICcEUwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTgxNjU2\n'
    + 'MjBaFw0yNDA4MjIxNzA4NTBaMIGZMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEqMCgGA1UEAwwhQW1h\n'
    + 'em9uIFJEUyBhcC1ub3J0aGVhc3QtMSAyMDE5IENBMIIBIjANBgkqhkiG9w0BAQEF\n'
    + 'AAOCAQ8AMIIBCgKCAQEAndtkldmHtk4TVQAyqhAvtEHSMb6pLhyKrIFved1WO3S7\n'
    + '+I+bWwv9b2W/ljJxLq9kdT43bhvzonNtI4a1LAohS6bqyirmk8sFfsWT3akb+4Sx\n'
    + '1sjc8Ovc9eqIWJCrUiSvv7+cS7ZTA9AgM1PxvHcsqrcUXiK3Jd/Dax9jdZE1e15s\n'
    + 'BEhb2OEPE+tClFZ+soj8h8Pl2Clo5OAppEzYI4LmFKtp1X/BOf62k4jviXuCSst3\n'
    + 'UnRJzE/CXtjmN6oZySVWSe0rQYuyqRl6//9nK40cfGKyxVnimB8XrrcxUN743Vud\n'
    + 'QQVU0Esm8OVTX013mXWQXJHP2c0aKkog8LOga0vobQIDAQABo2YwZDAOBgNVHQ8B\n'
    + 'Af8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQULmoOS1mFSjj+\n'
    + 'snUPx4DgS3SkLFYwHwYDVR0jBBgwFoAUc19g2LzLA5j0Kxc0LjZapmD/vB8wDQYJ\n'
    + 'KoZIhvcNAQELBQADggEBAAkVL2P1M2/G9GM3DANVAqYOwmX0Xk58YBHQu6iiQg4j\n'
    + 'b4Ky/qsZIsgT7YBsZA4AOcPKQFgGTWhe9pvhmXqoN3RYltN8Vn7TbUm/ZVDoMsrM\n'
    + 'gwv0+TKxW1/u7s8cXYfHPiTzVSJuOogHx99kBW6b2f99GbP7O1Sv3sLq4j6lVvBX\n'
    + 'Fiacf5LAWC925nvlTzLlBgIc3O9xDtFeAGtZcEtxZJ4fnGXiqEnN4539+nqzIyYq\n'
    + 'nvlgCzyvcfRAxwltrJHuuRu6Maw5AGcd2Y0saMhqOVq9KYKFKuD/927BTrbd2JVf\n'
    + '2sGWyuPZPCk3gq+5pCjbD0c6DkhcMGI6WwxvM5V/zSM=\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-northeast-2 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS ap-northeast-2 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-10T17:46:21Z/2024-08-22T17:08:50Z
     *   F = 8E:1C:70:C1:64:BD:FC:F9:93:9B:A2:67:CA:CF:52:F0:E1:F7:B4:F0
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEDDCCAvSgAwIBAgICOFAwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTAxNzQ2\n'
    + 'MjFaFw0yNDA4MjIxNzA4NTBaMIGZMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEqMCgGA1UEAwwhQW1h\n'
    + 'em9uIFJEUyBhcC1ub3J0aGVhc3QtMiAyMDE5IENBMIIBIjANBgkqhkiG9w0BAQEF\n'
    + 'AAOCAQ8AMIIBCgKCAQEAzU72e6XbaJbi4HjJoRNjKxzUEuChKQIt7k3CWzNnmjc5\n'
    + '8I1MjCpa2W1iw1BYVysXSNSsLOtUsfvBZxi/1uyMn5ZCaf9aeoA9UsSkFSZBjOCN\n'
    + 'DpKPCmfV1zcEOvJz26+1m8WDg+8Oa60QV0ou2AU1tYcw98fOQjcAES0JXXB80P2s\n'
    + '3UfkNcnDz+l4k7j4SllhFPhH6BQ4lD2NiFAP4HwoG6FeJUn45EPjzrydxjq6v5Fc\n'
    + 'cQ8rGuHADVXotDbEhaYhNjIrsPL+puhjWfhJjheEw8c4whRZNp6gJ/b6WEes/ZhZ\n'
    + 'h32DwsDsZw0BfRDUMgUn8TdecNexHUw8vQWeC181hwIDAQABo2YwZDAOBgNVHQ8B\n'
    + 'Af8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQUwW9bWgkWkr0U\n'
    + 'lrOsq2kvIdrECDgwHwYDVR0jBBgwFoAUc19g2LzLA5j0Kxc0LjZapmD/vB8wDQYJ\n'
    + 'KoZIhvcNAQELBQADggEBAEugF0Gj7HVhX0ehPZoGRYRt3PBuI2YjfrrJRTZ9X5wc\n'
    + '9T8oHmw07mHmNy1qqWvooNJg09bDGfB0k5goC2emDiIiGfc/kvMLI7u+eQOoMKj6\n'
    + 'mkfCncyRN3ty08Po45vTLBFZGUvtQmjM6yKewc4sXiASSBmQUpsMbiHRCL72M5qV\n'
    + 'obcJOjGcIdDTmV1BHdWT+XcjynsGjUqOvQWWhhLPrn4jWe6Xuxll75qlrpn3IrIx\n'
    + 'CRBv/5r7qbcQJPOgwQsyK4kv9Ly8g7YT1/vYBlR3cRsYQjccw5ceWUj2DrMVWhJ4\n'
    + 'prf+E3Aa4vYmLLOUUvKnDQ1k3RGNu56V0tonsQbfsaM=\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-northeast-3 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS ap-northeast-3 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-17T20:05:29Z/2024-08-22T17:08:50Z
     *   F = D1:08:B1:40:6D:6C:80:8E:F4:C1:2C:8A:1F:66:17:01:54:CD:1A:4E
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEDDCCAvSgAwIBAgICOYIwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTcyMDA1\n'
    + 'MjlaFw0yNDA4MjIxNzA4NTBaMIGZMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEqMCgGA1UEAwwhQW1h\n'
    + 'em9uIFJEUyBhcC1ub3J0aGVhc3QtMyAyMDE5IENBMIIBIjANBgkqhkiG9w0BAQEF\n'
    + 'AAOCAQ8AMIIBCgKCAQEA4dMak8W+XW8y/2F6nRiytFiA4XLwePadqWebGtlIgyCS\n'
    + 'kbug8Jv5w7nlMkuxOxoUeD4WhI6A9EkAn3r0REM/2f0aYnd2KPxeqS2MrtdxxHw1\n'
    + 'xoOxk2x0piNSlOz6yog1idsKR5Wurf94fvM9FdTrMYPPrDabbGqiBMsZZmoHLvA3\n'
    + 'Z+57HEV2tU0Ei3vWeGIqnNjIekS+E06KhASxrkNU5vi611UsnYZlSi0VtJsH4UGV\n'
    + 'LhnHl53aZL0YFO5mn/fzuNG/51qgk/6EFMMhaWInXX49Dia9FnnuWXwVwi6uX1Wn\n'
    + '7kjoHi5VtmC8ZlGEHroxX2DxEr6bhJTEpcLMnoQMqwIDAQABo2YwZDAOBgNVHQ8B\n'
    + 'Af8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQUsUI5Cb3SWB8+\n'
    + 'gv1YLN/ABPMdxSAwHwYDVR0jBBgwFoAUc19g2LzLA5j0Kxc0LjZapmD/vB8wDQYJ\n'
    + 'KoZIhvcNAQELBQADggEBAJAF3E9PM1uzVL8YNdzb6fwJrxxqI2shvaMVmC1mXS+w\n'
    + 'G0zh4v2hBZOf91l1EO0rwFD7+fxoI6hzQfMxIczh875T6vUXePKVOCOKI5wCrDad\n'
    + 'zQbVqbFbdhsBjF4aUilOdtw2qjjs9JwPuB0VXN4/jY7m21oKEOcnpe36+7OiSPjN\n'
    + 'xngYewCXKrSRqoj3mw+0w/+exYj3Wsush7uFssX18av78G+ehKPIVDXptOCP/N7W\n'
    + '8iKVNeQ2QGTnu2fzWsGUSvMGyM7yqT+h1ILaT//yQS8er511aHMLc142bD4D9VSy\n'
    + 'DgactwPDTShK/PXqhvNey9v/sKXm4XatZvwcc8KYlW4=\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-south-1 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS ap-south-1 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-04T17:13:04Z/2024-08-22T17:08:50Z
     *   F = D6:AD:45:A9:54:36:E4:BA:9C:B7:9B:06:8C:0C:CD:CC:1E:81:B5:00
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIECDCCAvCgAwIBAgICVIYwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MDQxNzEz\n'
    + 'MDRaFw0yNDA4MjIxNzA4NTBaMIGVMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEmMCQGA1UEAwwdQW1h\n'
    + 'em9uIFJEUyBhcC1zb3V0aC0xIDIwMTkgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IB\n'
    + 'DwAwggEKAoIBAQDUYOz1hGL42yUCrcsMSOoU8AeD/3KgZ4q7gP+vAz1WnY9K/kim\n'
    + 'eWN/2Qqzlo3+mxSFQFyD4MyV3+CnCPnBl9Sh1G/F6kThNiJ7dEWSWBQGAB6HMDbC\n'
    + 'BaAsmUc1UIz8sLTL3fO+S9wYhA63Wun0Fbm/Rn2yk/4WnJAaMZcEtYf6e0KNa0LM\n'
    + 'p/kN/70/8cD3iz3dDR8zOZFpHoCtf0ek80QqTich0A9n3JLxR6g6tpwoYviVg89e\n'
    + 'qCjQ4axxOkWWeusLeTJCcY6CkVyFvDAKvcUl1ytM5AiaUkXblE7zDFXRM4qMMRdt\n'
    + 'lPm8d3pFxh0fRYk8bIKnpmtOpz3RIctDrZZxAgMBAAGjZjBkMA4GA1UdDwEB/wQE\n'
    + 'AwIBBjASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBT99wKJftD3jb4sHoHG\n'
    + 'i3uGlH6W6TAfBgNVHSMEGDAWgBRzX2DYvMsDmPQrFzQuNlqmYP+8HzANBgkqhkiG\n'
    + '9w0BAQsFAAOCAQEAZ17hhr3dII3hUfuHQ1hPWGrpJOX/G9dLzkprEIcCidkmRYl+\n'
    + 'hu1Pe3caRMh/17+qsoEErmnVq5jNY9X1GZL04IZH8YbHc7iRHw3HcWAdhN8633+K\n'
    + 'jYEB2LbJ3vluCGnCejq9djDb6alOugdLMJzxOkHDhMZ6/gYbECOot+ph1tQuZXzD\n'
    + 'tZ7prRsrcuPBChHlPjmGy8M9z8u+kF196iNSUGC4lM8vLkHM7ycc1/ZOwRq9aaTe\n'
    + 'iOghbQQyAEe03MWCyDGtSmDfr0qEk+CHN+6hPiaL8qKt4s+V9P7DeK4iW08ny8Ox\n'
    + 'AVS7u0OK/5+jKMAMrKwpYrBydOjTUTHScocyNw==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-southeast-1 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS ap-southeast-1 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-13T20:11:42Z/2024-08-22T17:08:50Z
     *   F = 0D:20:FB:91:DE:BE:D2:CF:F3:F8:F8:43:AF:68:C6:03:76:F3:DD:B8
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEDDCCAvSgAwIBAgICY4kwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTMyMDEx\n'
    + 'NDJaFw0yNDA4MjIxNzA4NTBaMIGZMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEqMCgGA1UEAwwhQW1h\n'
    + 'em9uIFJEUyBhcC1zb3V0aGVhc3QtMSAyMDE5IENBMIIBIjANBgkqhkiG9w0BAQEF\n'
    + 'AAOCAQ8AMIIBCgKCAQEAr5u9OuLL/OF/fBNUX2kINJLzFl4DnmrhnLuSeSnBPgbb\n'
    + 'qddjf5EFFJBfv7IYiIWEFPDbDG5hoBwgMup5bZDbas+ZTJTotnnxVJTQ6wlhTmns\n'
    + 'eHECcg2pqGIKGrxZfbQhlj08/4nNAPvyYCTS0bEcmQ1emuDPyvJBYDDLDU6AbCB5\n'
    + '6Z7YKFQPTiCBblvvNzchjLWF9IpkqiTsPHiEt21sAdABxj9ityStV3ja/W9BfgxH\n'
    + 'wzABSTAQT6FbDwmQMo7dcFOPRX+hewQSic2Rn1XYjmNYzgEHisdUsH7eeXREAcTw\n'
    + '61TRvaLH8AiOWBnTEJXPAe6wYfrcSd1pD0MXpoB62wIDAQABo2YwZDAOBgNVHQ8B\n'
    + 'Af8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQUytwMiomQOgX5\n'
    + 'Ichd+2lDWRUhkikwHwYDVR0jBBgwFoAUc19g2LzLA5j0Kxc0LjZapmD/vB8wDQYJ\n'
    + 'KoZIhvcNAQELBQADggEBACf6lRDpfCD7BFRqiWM45hqIzffIaysmVfr+Jr+fBTjP\n'
    + 'uYe/ba1omSrNGG23bOcT9LJ8hkQJ9d+FxUwYyICQNWOy6ejicm4z0C3VhphbTPqj\n'
    + 'yjpt9nG56IAcV8BcRJh4o/2IfLNzC/dVuYJV8wj7XzwlvjysenwdrJCoLadkTr1h\n'
    + 'eIdG6Le07sB9IxrGJL9e04afk37h7c8ESGSE4E+oS4JQEi3ATq8ne1B9DQ9SasXi\n'
    + 'IRmhNAaISDzOPdyLXi9N9V9Lwe/DHcja7hgLGYx3UqfjhLhOKwp8HtoZORixAmOI\n'
    + 'HfILgNmwyugAbuZoCazSKKBhQ0wgO0WZ66ZKTMG8Oho=\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ap-southeast-2 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS ap-southeast-2 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-16T19:53:47Z/2024-08-22T17:08:50Z
     *   F = D5:D4:51:83:D9:A3:AC:47:B0:0A:5A:77:D8:A0:79:A9:6A:3F:6D:96
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEDDCCAvSgAwIBAgICEkYwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTYxOTUz\n'
    + 'NDdaFw0yNDA4MjIxNzA4NTBaMIGZMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEqMCgGA1UEAwwhQW1h\n'
    + 'em9uIFJEUyBhcC1zb3V0aGVhc3QtMiAyMDE5IENBMIIBIjANBgkqhkiG9w0BAQEF\n'
    + 'AAOCAQ8AMIIBCgKCAQEAufodI2Flker8q7PXZG0P0vmFSlhQDw907A6eJuF/WeMo\n'
    + 'GHnll3b4S6nC3oRS3nGeRMHbyU2KKXDwXNb3Mheu+ox+n5eb/BJ17eoj9HbQR1cd\n'
    + 'gEkIciiAltf8gpMMQH4anP7TD+HNFlZnP7ii3geEJB2GGXSxgSWvUzH4etL67Zmn\n'
    + 'TpGDWQMB0T8lK2ziLCMF4XAC/8xDELN/buHCNuhDpxpPebhct0T+f6Arzsiswt2j\n'
    + '7OeNeLLZwIZvVwAKF7zUFjC6m7/VmTQC8nidVY559D6l0UhhU0Co/txgq3HVsMOH\n'
    + 'PbxmQUwJEKAzQXoIi+4uZzHFZrvov/nDTNJUhC6DqwIDAQABo2YwZDAOBgNVHQ8B\n'
    + 'Af8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQUwaZpaCme+EiV\n'
    + 'M5gcjeHZSTgOn4owHwYDVR0jBBgwFoAUc19g2LzLA5j0Kxc0LjZapmD/vB8wDQYJ\n'
    + 'KoZIhvcNAQELBQADggEBAAR6a2meCZuXO2TF9bGqKGtZmaah4pH2ETcEVUjkvXVz\n'
    + 'sl+ZKbYjrun+VkcMGGKLUjS812e7eDF726ptoku9/PZZIxlJB0isC/0OyixI8N4M\n'
    + 'NsEyvp52XN9QundTjkl362bomPnHAApeU0mRbMDRR2JdT70u6yAzGLGsUwMkoNnw\n'
    + '1VR4XKhXHYGWo7KMvFrZ1KcjWhubxLHxZWXRulPVtGmyWg/MvE6KF+2XMLhojhUL\n'
    + '+9jB3Fpn53s6KMx5tVq1x8PukHmowcZuAF8k+W4gk8Y68wIwynrdZrKRyRv6CVtR\n'
    + 'FZ8DeJgoNZT3y/GT254VqMxxfuy2Ccb/RInd16tEvVk=\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS ca-central-1 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS ca-central-1 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-10T20:52:25Z/2024-08-22T17:08:50Z
     *   F = A1:03:46:F2:BB:29:BF:4F:EC:04:7E:82:9A:A6:C0:11:4D:AB:82:25
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIECjCCAvKgAwIBAgICEzUwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTAyMDUy\n'
    + 'MjVaFw0yNDA4MjIxNzA4NTBaMIGXMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEoMCYGA1UEAwwfQW1h\n'
    + 'em9uIFJEUyBjYS1jZW50cmFsLTEgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQAD\n'
    + 'ggEPADCCAQoCggEBAOxHqdcPSA2uBjsCP4DLSlqSoPuQ/X1kkJLusVRKiQE2zayB\n'
    + 'viuCBt4VB9Qsh2rW3iYGM+usDjltGnI1iUWA5KHcvHszSMkWAOYWLiMNKTlg6LCp\n'
    + 'XnE89tvj5dIH6U8WlDvXLdjB/h30gW9JEX7S8supsBSci2GxEzb5mRdKaDuuF/0O\n'
    + 'qvz4YE04pua3iZ9QwmMFuTAOYzD1M72aOpj+7Ac+YLMM61qOtU+AU6MndnQkKoQi\n'
    + 'qmUN2A9IFaqHFzRlSdXwKCKUA4otzmz+/N3vFwjb5F4DSsbsrMfjeHMo6o/nb6Nh\n'
    + 'YDb0VJxxPee6TxSuN7CQJ2FxMlFUezcoXqwqXD0CAwEAAaNmMGQwDgYDVR0PAQH/\n'
    + 'BAQDAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFDGGpon9WfIpsggE\n'
    + 'CxHq8hZ7E2ESMB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqG\n'
    + 'SIb3DQEBCwUAA4IBAQAvpeQYEGZvoTVLgV9rd2+StPYykMsmFjWQcyn3dBTZRXC2\n'
    + 'lKq7QhQczMAOhEaaN29ZprjQzsA2X/UauKzLR2Uyqc2qOeO9/YOl0H3qauo8C/W9\n'
    + 'r8xqPbOCDLEXlOQ19fidXyyEPHEq5WFp8j+fTh+s8WOx2M7IuC0ANEetIZURYhSp\n'
    + 'xl9XOPRCJxOhj7JdelhpweX0BJDNHeUFi0ClnFOws8oKQ7sQEv66d5ddxqqZ3NVv\n'
    + 'RbCvCtEutQMOUMIuaygDlMn1anSM8N7Wndx8G6+Uy67AnhjGx7jw/0YPPxopEj6x\n'
    + 'JXP8j0sJbcT9K/9/fPVLNT25RvQ/93T2+IQL4Ca2\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS eu-central-1 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS eu-central-1 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-11T19:36:20Z/2024-08-22T17:08:50Z
     *   F = 53:46:18:4A:42:65:A2:8C:5F:5B:0A:AD:E2:2C:80:E5:E6:8A:6D:2F
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIECjCCAvKgAwIBAgICV2YwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTExOTM2\n'
    + 'MjBaFw0yNDA4MjIxNzA4NTBaMIGXMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEoMCYGA1UEAwwfQW1h\n'
    + 'em9uIFJEUyBldS1jZW50cmFsLTEgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQAD\n'
    + 'ggEPADCCAQoCggEBAMEx54X2pHVv86APA0RWqxxRNmdkhAyp2R1cFWumKQRofoFv\n'
    + 'n+SPXdkpIINpMuEIGJANozdiEz7SPsrAf8WHyD93j/ZxrdQftRcIGH41xasetKGl\n'
    + 'I67uans8d+pgJgBKGb/Z+B5m+UsIuEVekpvgpwKtmmaLFC/NCGuSsJoFsRqoa6Gh\n'
    + 'm34W6yJoY87UatddCqLY4IIXaBFsgK9Q/wYzYLbnWM6ZZvhJ52VMtdhcdzeTHNW0\n'
    + '5LGuXJOF7Ahb4JkEhoo6TS2c0NxB4l4MBfBPgti+O7WjR3FfZHpt18A6Zkq6A2u6\n'
    + 'D/oTSL6c9/3sAaFTFgMyL3wHb2YlW0BPiljZIqECAwEAAaNmMGQwDgYDVR0PAQH/\n'
    + 'BAQDAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFOcAToAc6skWffJa\n'
    + 'TnreaswAfrbcMB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqG\n'
    + 'SIb3DQEBCwUAA4IBAQA1d0Whc1QtspK496mFWfFEQNegLh0a9GWYlJm+Htcj5Nxt\n'
    + 'DAIGXb+8xrtOZFHmYP7VLCT5Zd2C+XytqseK/+s07iAr0/EPF+O2qcyQWMN5KhgE\n'
    + 'cXw2SwuP9FPV3i+YAm11PBVeenrmzuk9NrdHQ7TxU4v7VGhcsd2C++0EisrmquWH\n'
    + 'mgIfmVDGxphwoES52cY6t3fbnXmTkvENvR+h3rj+fUiSz0aSo+XZUGHPgvuEKM/W\n'
    + 'CBD9Smc9CBoBgvy7BgHRgRUmwtABZHFUIEjHI5rIr7ZvYn+6A0O6sogRfvVYtWFc\n'
    + 'qpyrW1YX8mD0VlJ8fGKM3G+aCOsiiPKDV/Uafrm+\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS eu-north-1 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS eu-north-1 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-12T18:19:44Z/2024-08-22T17:08:50Z
     *   F = D0:CA:9C:6E:47:4C:4F:DB:85:28:03:4A:60:AC:14:E0:E6:DF:D4:42
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIECDCCAvCgAwIBAgICGAcwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTIxODE5\n'
    + 'NDRaFw0yNDA4MjIxNzA4NTBaMIGVMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEmMCQGA1UEAwwdQW1h\n'
    + 'em9uIFJEUyBldS1ub3J0aC0xIDIwMTkgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IB\n'
    + 'DwAwggEKAoIBAQCiIYnhe4UNBbdBb/nQxl5giM0XoVHWNrYV5nB0YukA98+TPn9v\n'
    + 'Aoj1RGYmtryjhrf01Kuv8SWO+Eom95L3zquoTFcE2gmxCfk7bp6qJJ3eHOJB+QUO\n'
    + 'XsNRh76fwDzEF1yTeZWH49oeL2xO13EAx4PbZuZpZBttBM5zAxgZkqu4uWQczFEs\n'
    + 'JXfla7z2fvWmGcTagX10O5C18XaFroV0ubvSyIi75ue9ykg/nlFAeB7O0Wxae88e\n'
    + 'uhiBEFAuLYdqWnsg3459NfV8Yi1GnaitTym6VI3tHKIFiUvkSiy0DAlAGV2iiyJE\n'
    + 'q+DsVEO4/hSINJEtII4TMtysOsYPpINqeEzRAgMBAAGjZjBkMA4GA1UdDwEB/wQE\n'
    + 'AwIBBjASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBRR0UpnbQyjnHChgmOc\n'
    + 'hnlc0PogzTAfBgNVHSMEGDAWgBRzX2DYvMsDmPQrFzQuNlqmYP+8HzANBgkqhkiG\n'
    + '9w0BAQsFAAOCAQEAKJD4xVzSf4zSGTBJrmamo86jl1NHQxXUApAZuBZEc8tqC6TI\n'
    + 'T5CeoSr9CMuVC8grYyBjXblC4OsM5NMvmsrXl/u5C9dEwtBFjo8mm53rOOIm1fxl\n'
    + 'I1oYB/9mtO9ANWjkykuLzWeBlqDT/i7ckaKwalhLODsRDO73vRhYNjsIUGloNsKe\n'
    + 'pxw3dzHwAZx4upSdEVG4RGCZ1D0LJ4Gw40OfD69hfkDfRVVxKGrbEzqxXRvovmDc\n'
    + 'tKLdYZO/6REoca36v4BlgIs1CbUXJGLSXUwtg7YXGLSVBJ/U0+22iGJmBSNcoyUN\n'
    + 'cjPFD9JQEhDDIYYKSGzIYpvslvGc4T5ISXFiuQ==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS eu-west-1 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS eu-west-1 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-11T17:31:48Z/2024-08-22T17:08:50Z
     *   F = 2D:1A:A6:3E:0D:EB:D6:26:03:3E:A1:8A:0A:DF:14:80:78:EC:B6:63
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEBzCCAu+gAwIBAgICYpgwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTExNzMx\n'
    + 'NDhaFw0yNDA4MjIxNzA4NTBaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1h\n'
    + 'em9uIFJEUyBldS13ZXN0LTEgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\n'
    + 'ADCCAQoCggEBAMk3YdSZ64iAYp6MyyKtYJtNzv7zFSnnNf6vv0FB4VnfITTMmOyZ\n'
    + 'LXqKAT2ahZ00hXi34ewqJElgU6eUZT/QlzdIu359TEZyLVPwURflL6SWgdG01Q5X\n'
    + 'O++7fSGcBRyIeuQWs9FJNIIqK8daF6qw0Rl5TXfu7P9dBc3zkgDXZm2DHmxGDD69\n'
    + '7liQUiXzoE1q2Z9cA8+jirDioJxN9av8hQt12pskLQumhlArsMIhjhHRgF03HOh5\n'
    + 'tvi+RCfihVOxELyIRTRpTNiIwAqfZxxTWFTgfn+gijTmd0/1DseAe82aYic8JbuS\n'
    + 'EMbrDduAWsqrnJ4GPzxHKLXX0JasCUcWyMECAwEAAaNmMGQwDgYDVR0PAQH/BAQD\n'
    + 'AgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFPLtsq1NrwJXO13C9eHt\n'
    + 'sLY11AGwMB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqGSIb3\n'
    + 'DQEBCwUAA4IBAQAnWBKj5xV1A1mYd0kIgDdkjCwQkiKF5bjIbGkT3YEFFbXoJlSP\n'
    + '0lZZ/hDaOHI8wbLT44SzOvPEEmWF9EE7SJzkvSdQrUAWR9FwDLaU427ALI3ngNHy\n'
    + 'lGJ2hse1fvSRNbmg8Sc9GBv8oqNIBPVuw+AJzHTacZ1OkyLZrz1c1QvwvwN2a+Jd\n'
    + 'vH0V0YIhv66llKcYDMUQJAQi4+8nbRxXWv6Gq3pvrFoorzsnkr42V3JpbhnYiK+9\n'
    + 'nRKd4uWl62KRZjGkfMbmsqZpj2fdSWMY1UGyN1k+kDmCSWYdrTRDP0xjtIocwg+A\n'
    + 'J116n4hV/5mbA0BaPiS2krtv17YAeHABZcvz\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS eu-west-2 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS eu-west-2 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-12T21:32:32Z/2024-08-22T17:08:50Z
     *   F = 60:65:44:F4:74:6E:2E:29:50:19:38:7C:4B:BE:18:B9:5B:D4:CD:23
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEBzCCAu+gAwIBAgICZIEwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTIyMTMy\n'
    + 'MzJaFw0yNDA4MjIxNzA4NTBaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1h\n'
    + 'em9uIFJEUyBldS13ZXN0LTIgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\n'
    + 'ADCCAQoCggEBALGiwqjiF7xIjT0Sx7zB3764K2T2a1DHnAxEOr+/EIftWKxWzT3u\n'
    + 'PFwS2eEZcnKqSdRQ+vRzonLBeNLO4z8aLjQnNbkizZMBuXGm4BqRm1Kgq3nlLDQn\n'
    + '7YqdijOq54SpShvR/8zsO4sgMDMmHIYAJJOJqBdaus2smRt0NobIKc0liy7759KB\n'
    + '6kmQ47Gg+kfIwxrQA5zlvPLeQImxSoPi9LdbRoKvu7Iot7SOa+jGhVBh3VdqndJX\n'
    + '7tm/saj4NE375csmMETFLAOXjat7zViMRwVorX4V6AzEg1vkzxXpA9N7qywWIT5Y\n'
    + 'fYaq5M8i6vvLg0CzrH9fHORtnkdjdu1y+0MCAwEAAaNmMGQwDgYDVR0PAQH/BAQD\n'
    + 'AgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFFOhOx1yt3Z7mvGB9jBv\n'
    + '2ymdZwiOMB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqGSIb3\n'
    + 'DQEBCwUAA4IBAQBehqY36UGDvPVU9+vtaYGr38dBbp+LzkjZzHwKT1XJSSUc2wqM\n'
    + 'hnCIQKilonrTIvP1vmkQi8qHPvDRtBZKqvz/AErW/ZwQdZzqYNFd+BmOXaeZWV0Q\n'
    + 'oHtDzXmcwtP8aUQpxN0e1xkWb1E80qoy+0uuRqb/50b/R4Q5qqSfJhkn6z8nwB10\n'
    + '7RjLtJPrK8igxdpr3tGUzfAOyiPrIDncY7UJaL84GFp7WWAkH0WG3H8Y8DRcRXOU\n'
    + 'mqDxDLUP3rNuow3jnGxiUY+gGX5OqaZg4f4P6QzOSmeQYs6nLpH0PiN00+oS1BbD\n'
    + 'bpWdZEttILPI+vAYkU4QuBKKDjJL6HbSd+cn\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS eu-west-3 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS eu-west-3 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-18T17:03:15Z/2024-08-22T17:08:50Z
     *   F = 6F:79:56:B0:74:9C:C6:3E:3B:50:26:C8:51:55:08:F0:BB:7E:32:04
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEBzCCAu+gAwIBAgICJDQwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTgxNzAz\n'
    + 'MTVaFw0yNDA4MjIxNzA4NTBaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1h\n'
    + 'em9uIFJEUyBldS13ZXN0LTMgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\n'
    + 'ADCCAQoCggEBAL9bL7KE0n02DLVtlZ2PL+g/BuHpMYFq2JnE2RgompGurDIZdjmh\n'
    + '1pxfL3nT+QIVMubuAOy8InRfkRxfpxyjKYdfLJTPJG+jDVL+wDcPpACFVqoV7Prg\n'
    + 'pVYEV0lc5aoYw4bSeYFhdzgim6F8iyjoPnObjll9mo4XsHzSoqJLCd0QC+VG9Fw2\n'
    + 'q+GDRZrLRmVM2oNGDRbGpGIFg77aRxRapFZa8SnUgs2AqzuzKiprVH5i0S0M6dWr\n'
    + 'i+kk5epmTtkiDHceX+dP/0R1NcnkCPoQ9TglyXyPdUdTPPRfKCq12dftqll+u4mV\n'
    + 'ARdN6WFjovxax8EAP2OAUTi1afY+1JFMj+sCAwEAAaNmMGQwDgYDVR0PAQH/BAQD\n'
    + 'AgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFLfhrbrO5exkCVgxW0x3\n'
    + 'Y2mAi8lNMB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqGSIb3\n'
    + 'DQEBCwUAA4IBAQAigQ5VBNGyw+OZFXwxeJEAUYaXVoP/qrhTOJ6mCE2DXUVEoJeV\n'
    + 'SxScy/TlFA9tJXqmit8JH8VQ/xDL4ubBfeMFAIAo4WzNWDVoeVMqphVEcDWBHsI1\n'
    + 'AETWzfsapRS9yQekOMmxg63d/nV8xewIl8aNVTHdHYXMqhhik47VrmaVEok1UQb3\n'
    + 'O971RadLXIEbVd9tjY5bMEHm89JsZDnDEw1hQXBb67Elu64OOxoKaHBgUH8AZn/2\n'
    + 'zFsL1ynNUjOhCSAA15pgd1vjwc0YsBbAEBPcHBWYBEyME6NLNarjOzBl4FMtATSF\n'
    + 'wWCKRGkvqN8oxYhwR2jf2rR5Mu4DWkK5Q8Ep\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS me-south-1 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS me-south-1 Root CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-05-10T21:48:27Z/2024-05-08T21:48:27Z
     *   F = 8A:69:D7:00:FB:5D:62:9C:B0:D1:75:6F:B7:B6:38:AA:76:C4:BD:1F
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEEjCCAvqgAwIBAgIJANew34ehz5l8MA0GCSqGSIb3DQEBCwUAMIGVMQswCQYD\n'
    + 'VQQGEwJVUzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEi\n'
    + 'MCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1h\n'
    + 'em9uIFJEUzEmMCQGA1UEAwwdQW1hem9uIFJEUyBtZS1zb3V0aC0xIFJvb3QgQ0Ew\n'
    + 'HhcNMTkwNTEwMjE0ODI3WhcNMjQwNTA4MjE0ODI3WjCBlTELMAkGA1UEBhMCVVMx\n'
    + 'EDAOBgNVBAcMB1NlYXR0bGUxEzARBgNVBAgMCldhc2hpbmd0b24xIjAgBgNVBAoM\n'
    + 'GUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\n'
    + 'JjAkBgNVBAMMHUFtYXpvbiBSRFMgbWUtc291dGgtMSBSb290IENBMIIBIjANBgkq\n'
    + 'hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAp7BYV88MukcY+rq0r79+C8UzkT30fEfT\n'
    + 'aPXbx1d6M7uheGN4FMaoYmL+JE1NZPaMRIPTHhFtLSdPccInvenRDIatcXX+jgOk\n'
    + 'UA6lnHQ98pwN0pfDUyz/Vph4jBR9LcVkBbe0zdoKKp+HGbMPRU0N2yNrog9gM5O8\n'
    + 'gkU/3O2csJ/OFQNnj4c2NQloGMUpEmedwJMOyQQfcUyt9CvZDfIPNnheUS29jGSw\n'
    + 'ERpJe/AENu8Pxyc72jaXQuD+FEi2Ck6lBkSlWYQFhTottAeGvVFNCzKszCntrtqd\n'
    + 'rdYUwurYsLTXDHv9nW2hfDUQa0mhXf9gNDOBIVAZugR9NqNRNyYLHQIDAQABo2Mw\n'
    + 'YTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU54cf\n'
    + 'DjgwBx4ycBH8+/r8WXdaiqYwHwYDVR0jBBgwFoAU54cfDjgwBx4ycBH8+/r8WXda\n'
    + 'iqYwDQYJKoZIhvcNAQELBQADggEBAIIMTSPx/dR7jlcxggr+O6OyY49Rlap2laKA\n'
    + 'eC/XI4ySP3vQkIFlP822U9Kh8a9s46eR0uiwV4AGLabcu0iKYfXjPkIprVCqeXV7\n'
    + 'ny9oDtrbflyj7NcGdZLvuzSwgl9SYTJp7PVCZtZutsPYlbJrBPHwFABvAkMvRtDB\n'
    + 'hitIg4AESDGPoCl94sYHpfDfjpUDMSrAMDUyO6DyBdZH5ryRMAs3lGtsmkkNUrso\n'
    + 'aTW6R05681Z0mvkRdb+cdXtKOSuDZPoe2wJJIaz3IlNQNSrB5TImMYgmt6iAsFhv\n'
    + '3vfTSTKrZDNTJn4ybG6pq1zWExoXsktZPylJly6R3RBwV6nwqBM=\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS sa-east-1 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS sa-east-1 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-05T18:46:29Z/2024-08-22T17:08:50Z
     *   F = 8C:34:0F:AA:FB:10:80:9C:05:CE:D7:BF:0B:12:4D:07:42:39:74:7A
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEBzCCAu+gAwIBAgICQ2QwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MDUxODQ2\n'
    + 'MjlaFw0yNDA4MjIxNzA4NTBaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1h\n'
    + 'em9uIFJEUyBzYS1lYXN0LTEgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\n'
    + 'ADCCAQoCggEBAMMvR+ReRnOzqJzoaPipNTt1Z2VA968jlN1+SYKUrYM3No+Vpz0H\n'
    + 'M6Tn0oYB66ByVsXiGc28ulsqX1HbHsxqDPwvQTKvO7SrmDokoAkjJgLocOLUAeld\n'
    + '5AwvUjxGRP6yY90NV7X786MpnYb2Il9DIIaV9HjCmPt+rjy2CZjS0UjPjCKNfB8J\n'
    + 'bFjgW6GGscjeyGb/zFwcom5p4j0rLydbNaOr9wOyQrtt3ZQWLYGY9Zees/b8pmcc\n'
    + 'Jt+7jstZ2UMV32OO/kIsJ4rMUn2r/uxccPwAc1IDeRSSxOrnFKhW3Cu69iB3bHp7\n'
    + 'JbawY12g7zshE4I14sHjv3QoXASoXjx4xgMCAwEAAaNmMGQwDgYDVR0PAQH/BAQD\n'
    + 'AgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFI1Fc/Ql2jx+oJPgBVYq\n'
    + 'ccgP0pQ8MB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqGSIb3\n'
    + 'DQEBCwUAA4IBAQB4VVVabVp70myuYuZ3vltQIWqSUMhkaTzehMgGcHjMf9iLoZ/I\n'
    + '93KiFUSGnek5cRePyS9wcpp0fcBT3FvkjpUdCjVtdttJgZFhBxgTd8y26ImdDDMR\n'
    + '4+BUuhI5msvjL08f+Vkkpu1GQcGmyFVPFOy/UY8iefu+QyUuiBUnUuEDd49Hw0Fn\n'
    + '/kIPII6Vj82a2mWV/Q8e+rgN8dIRksRjKI03DEoP8lhPlsOkhdwU6Uz9Vu6NOB2Q\n'
    + 'Ls1kbcxAc7cFSyRVJEhh12Sz9d0q/CQSTFsVJKOjSNQBQfVnLz1GwO/IieUEAr4C\n'
    + 'jkTntH0r1LX5b/GwN4R887LvjAEdTbg1his7\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS us-east-1 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS us-east-1 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-19T18:16:53Z/2024-08-22T17:08:50Z
     *   F = F0:ED:82:3E:D1:44:47:BA:B5:57:FD:F3:E4:92:74:66:98:8C:1C:78
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEBzCCAu+gAwIBAgICJVUwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTkxODE2\n'
    + 'NTNaFw0yNDA4MjIxNzA4NTBaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1h\n'
    + 'em9uIFJEUyB1cy1lYXN0LTEgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\n'
    + 'ADCCAQoCggEBAM3i/k2u6cqbMdcISGRvh+m+L0yaSIoOXjtpNEoIftAipTUYoMhL\n'
    + 'InXGlQBVA4shkekxp1N7HXe1Y/iMaPEyb3n+16pf3vdjKl7kaSkIhjdUz3oVUEYt\n'
    + 'i8Z/XeJJ9H2aEGuiZh3kHixQcZczn8cg3dA9aeeyLSEnTkl/npzLf//669Ammyhs\n'
    + 'XcAo58yvT0D4E0D/EEHf2N7HRX7j/TlyWvw/39SW0usiCrHPKDLxByLojxLdHzso\n'
    + 'QIp/S04m+eWn6rmD+uUiRteN1hI5ncQiA3wo4G37mHnUEKo6TtTUh+sd/ku6a8HK\n'
    + 'glMBcgqudDI90s1OpuIAWmuWpY//8xEG2YECAwEAAaNmMGQwDgYDVR0PAQH/BAQD\n'
    + 'AgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFPqhoWZcrVY9mU7tuemR\n'
    + 'RBnQIj1jMB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqGSIb3\n'
    + 'DQEBCwUAA4IBAQB6zOLZ+YINEs72heHIWlPZ8c6WY8MDU+Be5w1M+BK2kpcVhCUK\n'
    + 'PJO4nMXpgamEX8DIiaO7emsunwJzMSvavSPRnxXXTKIc0i/g1EbiDjnYX9d85DkC\n'
    + 'E1LaAUCmCZBVi9fIe0H2r9whIh4uLWZA41oMnJx/MOmo3XyMfQoWcqaSFlMqfZM4\n'
    + '0rNoB/tdHLNuV4eIdaw2mlHxdWDtF4oH+HFm+2cVBUVC1jXKrFv/euRVtsTT+A6i\n'
    + 'h2XBHKxQ1Y4HgAn0jACP2QSPEmuoQEIa57bEKEcZsBR8SDY6ZdTd2HLRIApcCOSF\n'
    + 'MRM8CKLeF658I0XgF8D5EsYoKPsA+74Z+jDH\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS us-east-2 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS us-east-2 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-13T17:06:41Z/2024-08-22T17:08:50Z
     *   F = E9:FE:27:2A:A0:0F:CE:DF:AD:51:03:A6:94:F7:1F:6F:BD:1E:28:D3
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIECDCCAvCgAwIBAgIDAIVCMA0GCSqGSIb3DQEBCwUAMIGPMQswCQYDVQQGEwJV\n'
    + 'UzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEiMCAGA1UE\n'
    + 'CgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJE\n'
    + 'UzEgMB4GA1UEAwwXQW1hem9uIFJEUyBSb290IDIwMTkgQ0EwHhcNMTkwOTEzMTcw\n'
    + 'NjQxWhcNMjQwODIyMTcwODUwWjCBlDELMAkGA1UEBhMCVVMxEzARBgNVBAgMCldh\n'
    + 'c2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoMGUFtYXpvbiBXZWIg\n'
    + 'U2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxJTAjBgNVBAMMHEFt\n'
    + 'YXpvbiBSRFMgdXMtZWFzdC0yIDIwMTkgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IB\n'
    + 'DwAwggEKAoIBAQDE+T2xYjUbxOp+pv+gRA3FO24+1zCWgXTDF1DHrh1lsPg5k7ht\n'
    + '2KPYzNc+Vg4E+jgPiW0BQnA6jStX5EqVh8BU60zELlxMNvpg4KumniMCZ3krtMUC\n'
    + 'au1NF9rM7HBh+O+DYMBLK5eSIVt6lZosOb7bCi3V6wMLA8YqWSWqabkxwN4w0vXI\n'
    + '8lu5uXXFRemHnlNf+yA/4YtN4uaAyd0ami9+klwdkZfkrDOaiy59haOeBGL8EB/c\n'
    + 'dbJJlguHH5CpCscs3RKtOOjEonXnKXldxarFdkMzi+aIIjQ8GyUOSAXHtQHb3gZ4\n'
    + 'nS6Ey0CMlwkB8vUObZU9fnjKJcL5QCQqOfwvAgMBAAGjZjBkMA4GA1UdDwEB/wQE\n'
    + 'AwIBBjASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBQUPuRHohPxx4VjykmH\n'
    + '6usGrLL1ETAfBgNVHSMEGDAWgBRzX2DYvMsDmPQrFzQuNlqmYP+8HzANBgkqhkiG\n'
    + '9w0BAQsFAAOCAQEAUdR9Vb3y33Yj6X6KGtuthZ08SwjImVQPtknzpajNE5jOJAh8\n'
    + 'quvQnU9nlnMO85fVDU1Dz3lLHGJ/YG1pt1Cqq2QQ200JcWCvBRgdvH6MjHoDQpqZ\n'
    + 'HvQ3vLgOGqCLNQKFuet9BdpsHzsctKvCVaeBqbGpeCtt3Hh/26tgx0rorPLw90A2\n'
    + 'V8QSkZJjlcKkLa58N5CMM8Xz8KLWg3MZeT4DmlUXVCukqK2RGuP2L+aME8dOxqNv\n'
    + 'OnOz1zrL5mR2iJoDpk8+VE/eBDmJX40IJk6jBjWoxAO/RXq+vBozuF5YHN1ujE92\n'
    + 'tO8HItgTp37XT8bJBAiAnt5mxw+NLSqtxk2QdQ==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS us-west-1 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS us-west-1 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-06T17:40:21Z/2024-08-22T17:08:50Z
     *   F = 1C:9F:DF:84:E6:13:32:F3:91:12:2D:0D:A5:9A:16:5D:AC:DC:E8:93
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIECDCCAvCgAwIBAgIDAIkHMA0GCSqGSIb3DQEBCwUAMIGPMQswCQYDVQQGEwJV\n'
    + 'UzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEiMCAGA1UE\n'
    + 'CgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJE\n'
    + 'UzEgMB4GA1UEAwwXQW1hem9uIFJEUyBSb290IDIwMTkgQ0EwHhcNMTkwOTA2MTc0\n'
    + 'MDIxWhcNMjQwODIyMTcwODUwWjCBlDELMAkGA1UEBhMCVVMxEzARBgNVBAgMCldh\n'
    + 'c2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoMGUFtYXpvbiBXZWIg\n'
    + 'U2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxJTAjBgNVBAMMHEFt\n'
    + 'YXpvbiBSRFMgdXMtd2VzdC0xIDIwMTkgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IB\n'
    + 'DwAwggEKAoIBAQDD2yzbbAl77OofTghDMEf624OvU0eS9O+lsdO0QlbfUfWa1Kd6\n'
    + '0WkgjkLZGfSRxEHMCnrv4UPBSK/Qwn6FTjkDLgemhqBtAnplN4VsoDL+BkRX4Wwq\n'
    + '/dSQJE2b+0hm9w9UMVGFDEq1TMotGGTD2B71eh9HEKzKhGzqiNeGsiX4VV+LJzdH\n'
    + 'uM23eGisNqmd4iJV0zcAZ+Gbh2zK6fqTOCvXtm7Idccv8vZZnyk1FiWl3NR4WAgK\n'
    + 'AkvWTIoFU3Mt7dIXKKClVmvssG8WHCkd3Xcb4FHy/G756UZcq67gMMTX/9fOFM/v\n'
    + 'l5C0+CHl33Yig1vIDZd+fXV1KZD84dEJfEvHAgMBAAGjZjBkMA4GA1UdDwEB/wQE\n'
    + 'AwIBBjASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBR+ap20kO/6A7pPxo3+\n'
    + 'T3CfqZpQWjAfBgNVHSMEGDAWgBRzX2DYvMsDmPQrFzQuNlqmYP+8HzANBgkqhkiG\n'
    + '9w0BAQsFAAOCAQEAHCJky2tPjPttlDM/RIqExupBkNrnSYnOK4kr9xJ3sl8UF2DA\n'
    + 'PAnYsjXp3rfcjN/k/FVOhxwzi3cXJF/2Tjj39Bm/OEfYTOJDNYtBwB0VVH4ffa/6\n'
    + 'tZl87jaIkrxJcreeeHqYMnIxeN0b/kliyA+a5L2Yb0VPjt9INq34QDc1v74FNZ17\n'
    + '4z8nr1nzg4xsOWu0Dbjo966lm4nOYIGBRGOKEkHZRZ4mEiMgr3YLkv8gSmeitx57\n'
    + 'Z6dVemNtUic/LVo5Iqw4n3TBS0iF2C1Q1xT/s3h+0SXZlfOWttzSluDvoMv5PvCd\n'
    + 'pFjNn+aXLAALoihL1MJSsxydtsLjOBro5eK0Vw==\n'
    + '-----END CERTIFICATE-----\n',

    /**
     * Amazon RDS us-west-2 certificate CA 2019 to 2024
     *
     *   CN = Amazon RDS us-west-2 2019 CA
     *   OU = Amazon RDS
     *   O = Amazon Web Services, Inc.
     *   L = Seattle
     *   ST = Washington
     *   C = US
     *   P = 2019-09-16T18:21:15Z/2024-08-22T17:08:50Z
     *   F = C8:DE:1D:13:AD:35:9B:3D:EA:18:2A:DC:B4:79:6D:22:47:75:3C:4A
     */
    '-----BEGIN CERTIFICATE-----\n'
    + 'MIIEBzCCAu+gAwIBAgICUYkwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\n'
    + 'MRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\n'
    + 'DBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\n'
    + 'MSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTYxODIx\n'
    + 'MTVaFw0yNDA4MjIxNzA4NTBaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\n'
    + 'aGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\n'
    + 'ZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1h\n'
    + 'em9uIFJEUyB1cy13ZXN0LTIgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\n'
    + 'ADCCAQoCggEBANCEZBZyu6yJQFZBJmSUZfSZd3Ui2gitczMKC4FLr0QzkbxY+cLa\n'
    + 'uVONIOrPt4Rwi+3h/UdnUg917xao3S53XDf1TDMFEYp4U8EFPXqCn/GXBIWlU86P\n'
    + 'PvBN+gzw3nS+aco7WXb+woTouvFVkk8FGU7J532llW8o/9ydQyDIMtdIkKTuMfho\n'
    + 'OiNHSaNc+QXQ32TgvM9A/6q7ksUoNXGCP8hDOkSZ/YOLiI5TcdLh/aWj00ziL5bj\n'
    + 'pvytiMZkilnc9dLY9QhRNr0vGqL0xjmWdoEXz9/OwjmCihHqJq+20MJPsvFm7D6a\n'
    + '2NKybR9U+ddrjb8/iyLOjURUZnj5O+2+OPcCAwEAAaNmMGQwDgYDVR0PAQH/BAQD\n'
    + 'AgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFEBxMBdv81xuzqcK5TVu\n'
    + 'pHj+Aor8MB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqGSIb3\n'
    + 'DQEBCwUAA4IBAQBZkfiVqGoJjBI37aTlLOSjLcjI75L5wBrwO39q+B4cwcmpj58P\n'
    + '3sivv+jhYfAGEbQnGRzjuFoyPzWnZ1DesRExX+wrmHsLLQbF2kVjLZhEJMHF9eB7\n'
    + 'GZlTPdTzHErcnuXkwA/OqyXMpj9aghcQFuhCNguEfnROY9sAoK2PTfnTz9NJHL+Q\n'
    + 'UpDLEJEUfc0GZMVWYhahc0x38ZnSY2SKacIPECQrTI0KpqZv/P+ijCEcMD9xmYEb\n'
    + 'jL4en+XKS1uJpw5fIU5Sj0MxhdGstH6S84iAE5J3GM3XHklGSFwwqPYvuTXvANH6\n'
    + 'uboynxRgSae59jIlAK6Jrr6GWMwQRbgcaAlW\n'
    + '-----END CERTIFICATE-----\n'
  ]
};


/***/ }),

/***/ 5586:
/***/ ((__unused_webpack_module, exports) => {

/**
 * MySQL type constants
 *
 * Extracted from version 5.7.29
 *
 * !! Generated by generate-type-constants.js, do not modify by hand !!
 */

exports.DECIMAL     = 0;
exports.TINY        = 1;
exports.SHORT       = 2;
exports.LONG        = 3;
exports.FLOAT       = 4;
exports.DOUBLE      = 5;
exports.NULL        = 6;
exports.TIMESTAMP   = 7;
exports.LONGLONG    = 8;
exports.INT24       = 9;
exports.DATE        = 10;
exports.TIME        = 11;
exports.DATETIME    = 12;
exports.YEAR        = 13;
exports.NEWDATE     = 14;
exports.VARCHAR     = 15;
exports.BIT         = 16;
exports.TIMESTAMP2  = 17;
exports.DATETIME2   = 18;
exports.TIME2       = 19;
exports.JSON        = 245;
exports.NEWDECIMAL  = 246;
exports.ENUM        = 247;
exports.SET         = 248;
exports.TINY_BLOB   = 249;
exports.MEDIUM_BLOB = 250;
exports.LONG_BLOB   = 251;
exports.BLOB        = 252;
exports.VAR_STRING  = 253;
exports.STRING      = 254;
exports.GEOMETRY    = 255;

// Lookup-by-number table
exports[0]   = 'DECIMAL';
exports[1]   = 'TINY';
exports[2]   = 'SHORT';
exports[3]   = 'LONG';
exports[4]   = 'FLOAT';
exports[5]   = 'DOUBLE';
exports[6]   = 'NULL';
exports[7]   = 'TIMESTAMP';
exports[8]   = 'LONGLONG';
exports[9]   = 'INT24';
exports[10]  = 'DATE';
exports[11]  = 'TIME';
exports[12]  = 'DATETIME';
exports[13]  = 'YEAR';
exports[14]  = 'NEWDATE';
exports[15]  = 'VARCHAR';
exports[16]  = 'BIT';
exports[17]  = 'TIMESTAMP2';
exports[18]  = 'DATETIME2';
exports[19]  = 'TIME2';
exports[245] = 'JSON';
exports[246] = 'NEWDECIMAL';
exports[247] = 'ENUM';
exports[248] = 'SET';
exports[249] = 'TINY_BLOB';
exports[250] = 'MEDIUM_BLOB';
exports[251] = 'LONG_BLOB';
exports[252] = 'BLOB';
exports[253] = 'VAR_STRING';
exports[254] = 'STRING';
exports[255] = 'GEOMETRY';


/***/ }),

/***/ 2442:
/***/ ((module) => {

module.exports = AuthSwitchRequestPacket;
function AuthSwitchRequestPacket(options) {
  options = options || {};

  this.status         = 0xfe;
  this.authMethodName = options.authMethodName;
  this.authMethodData = options.authMethodData;
}

AuthSwitchRequestPacket.prototype.parse = function parse(parser) {
  this.status         = parser.parseUnsignedNumber(1);
  this.authMethodName = parser.parseNullTerminatedString();
  this.authMethodData = parser.parsePacketTerminatedBuffer();
};

AuthSwitchRequestPacket.prototype.write = function write(writer) {
  writer.writeUnsignedNumber(1, this.status);
  writer.writeNullTerminatedString(this.authMethodName);
  writer.writeBuffer(this.authMethodData);
};


/***/ }),

/***/ 7344:
/***/ ((module) => {

module.exports = AuthSwitchResponsePacket;
function AuthSwitchResponsePacket(options) {
  options = options || {};

  this.data = options.data;
}

AuthSwitchResponsePacket.prototype.parse = function parse(parser) {
  this.data = parser.parsePacketTerminatedBuffer();
};

AuthSwitchResponsePacket.prototype.write = function write(writer) {
  writer.writeBuffer(this.data);
};


/***/ }),

/***/ 8202:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Buffer = (__webpack_require__(4065).Buffer);

module.exports = ClientAuthenticationPacket;
function ClientAuthenticationPacket(options) {
  options = options || {};

  this.clientFlags   = options.clientFlags;
  this.maxPacketSize = options.maxPacketSize;
  this.charsetNumber = options.charsetNumber;
  this.filler        = undefined;
  this.user          = options.user;
  this.scrambleBuff  = options.scrambleBuff;
  this.database      = options.database;
  this.protocol41    = options.protocol41;
}

ClientAuthenticationPacket.prototype.parse = function(parser) {
  if (this.protocol41) {
    this.clientFlags   = parser.parseUnsignedNumber(4);
    this.maxPacketSize = parser.parseUnsignedNumber(4);
    this.charsetNumber = parser.parseUnsignedNumber(1);
    this.filler        = parser.parseFiller(23);
    this.user          = parser.parseNullTerminatedString();
    this.scrambleBuff  = parser.parseLengthCodedBuffer();
    this.database      = parser.parseNullTerminatedString();
  } else {
    this.clientFlags   = parser.parseUnsignedNumber(2);
    this.maxPacketSize = parser.parseUnsignedNumber(3);
    this.user          = parser.parseNullTerminatedString();
    this.scrambleBuff  = parser.parseBuffer(8);
    this.database      = parser.parseLengthCodedBuffer();
  }
};

ClientAuthenticationPacket.prototype.write = function(writer) {
  if (this.protocol41) {
    writer.writeUnsignedNumber(4, this.clientFlags);
    writer.writeUnsignedNumber(4, this.maxPacketSize);
    writer.writeUnsignedNumber(1, this.charsetNumber);
    writer.writeFiller(23);
    writer.writeNullTerminatedString(this.user);
    writer.writeLengthCodedBuffer(this.scrambleBuff);
    writer.writeNullTerminatedString(this.database);
  } else {
    writer.writeUnsignedNumber(2, this.clientFlags);
    writer.writeUnsignedNumber(3, this.maxPacketSize);
    writer.writeNullTerminatedString(this.user);
    writer.writeBuffer(this.scrambleBuff);
    if (this.database && this.database.length) {
      writer.writeFiller(1);
      writer.writeBuffer(Buffer.from(this.database));
    }
  }
};


/***/ }),

/***/ 8481:
/***/ ((module) => {

module.exports = ComChangeUserPacket;
function ComChangeUserPacket(options) {
  options = options || {};

  this.command       = 0x11;
  this.user          = options.user;
  this.scrambleBuff  = options.scrambleBuff;
  this.database      = options.database;
  this.charsetNumber = options.charsetNumber;
}

ComChangeUserPacket.prototype.parse = function(parser) {
  this.command       = parser.parseUnsignedNumber(1);
  this.user          = parser.parseNullTerminatedString();
  this.scrambleBuff  = parser.parseLengthCodedBuffer();
  this.database      = parser.parseNullTerminatedString();
  this.charsetNumber = parser.parseUnsignedNumber(1);
};

ComChangeUserPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, this.command);
  writer.writeNullTerminatedString(this.user);
  writer.writeLengthCodedBuffer(this.scrambleBuff);
  writer.writeNullTerminatedString(this.database);
  writer.writeUnsignedNumber(2, this.charsetNumber);
};


/***/ }),

/***/ 8722:
/***/ ((module) => {

module.exports = ComPingPacket;
function ComPingPacket() {
  this.command = 0x0e;
}

ComPingPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, this.command);
};

ComPingPacket.prototype.parse = function(parser) {
  this.command = parser.parseUnsignedNumber(1);
};


/***/ }),

/***/ 3946:
/***/ ((module) => {

module.exports = ComQueryPacket;
function ComQueryPacket(sql) {
  this.command = 0x03;
  this.sql     = sql;
}

ComQueryPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, this.command);
  writer.writeString(this.sql);
};

ComQueryPacket.prototype.parse = function(parser) {
  this.command = parser.parseUnsignedNumber(1);
  this.sql     = parser.parsePacketTerminatedString();
};


/***/ }),

/***/ 3616:
/***/ ((module) => {

module.exports = ComQuitPacket;
function ComQuitPacket() {
  this.command = 0x01;
}

ComQuitPacket.prototype.parse = function parse(parser) {
  this.command = parser.parseUnsignedNumber(1);
};

ComQuitPacket.prototype.write = function write(writer) {
  writer.writeUnsignedNumber(1, this.command);
};


/***/ }),

/***/ 654:
/***/ ((module) => {

module.exports = ComStatisticsPacket;
function ComStatisticsPacket() {
  this.command = 0x09;
}

ComStatisticsPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, this.command);
};

ComStatisticsPacket.prototype.parse = function(parser) {
  this.command = parser.parseUnsignedNumber(1);
};


/***/ }),

/***/ 1974:
/***/ ((module) => {

module.exports = EmptyPacket;
function EmptyPacket() {
}

EmptyPacket.prototype.parse = function parse() {
};

EmptyPacket.prototype.write = function write() {
};


/***/ }),

/***/ 8131:
/***/ ((module) => {

module.exports = EofPacket;
function EofPacket(options) {
  options = options || {};

  this.fieldCount   = undefined;
  this.warningCount = options.warningCount;
  this.serverStatus = options.serverStatus;
  this.protocol41   = options.protocol41;
}

EofPacket.prototype.parse = function(parser) {
  this.fieldCount   = parser.parseUnsignedNumber(1);
  if (this.protocol41) {
    this.warningCount = parser.parseUnsignedNumber(2);
    this.serverStatus = parser.parseUnsignedNumber(2);
  }
};

EofPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, 0xfe);
  if (this.protocol41) {
    writer.writeUnsignedNumber(2, this.warningCount);
    writer.writeUnsignedNumber(2, this.serverStatus);
  }
};


/***/ }),

/***/ 9243:
/***/ ((module) => {

module.exports = ErrorPacket;
function ErrorPacket(options) {
  options = options || {};

  this.fieldCount     = options.fieldCount;
  this.errno          = options.errno;
  this.sqlStateMarker = options.sqlStateMarker;
  this.sqlState       = options.sqlState;
  this.message        = options.message;
}

ErrorPacket.prototype.parse = function(parser) {
  this.fieldCount = parser.parseUnsignedNumber(1);
  this.errno      = parser.parseUnsignedNumber(2);

  // sqlStateMarker ('#' = 0x23) indicates error packet format
  if (parser.peak() === 0x23) {
    this.sqlStateMarker = parser.parseString(1);
    this.sqlState       = parser.parseString(5);
  }

  this.message = parser.parsePacketTerminatedString();
};

ErrorPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, 0xff);
  writer.writeUnsignedNumber(2, this.errno);

  if (this.sqlStateMarker) {
    writer.writeString(this.sqlStateMarker);
    writer.writeString(this.sqlState);
  }

  writer.writeString(this.message);
};


/***/ }),

/***/ 8599:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Types = __webpack_require__(5586);

module.exports = Field;
function Field(options) {
  options = options || {};

  this.parser = options.parser;
  this.packet = options.packet;
  this.db     = options.packet.db;
  this.table  = options.packet.table;
  this.name   = options.packet.name;
  this.type   = Types[options.packet.type];
  this.length = options.packet.length;
}

Field.prototype.string = function () {
  return this.parser.parseLengthCodedString();
};

Field.prototype.buffer = function () {
  return this.parser.parseLengthCodedBuffer();
};

Field.prototype.geometry = function () {
  return this.parser.parseGeometryValue();
};


/***/ }),

/***/ 9883:
/***/ ((module) => {

module.exports = FieldPacket;
function FieldPacket(options) {
  options = options || {};

  this.catalog    = options.catalog;
  this.db         = options.db;
  this.table      = options.table;
  this.orgTable   = options.orgTable;
  this.name       = options.name;
  this.orgName    = options.orgName;
  this.charsetNr  = options.charsetNr;
  this.length     = options.length;
  this.type       = options.type;
  this.flags      = options.flags;
  this.decimals   = options.decimals;
  this.default    = options.default;
  this.zeroFill   = options.zeroFill;
  this.protocol41 = options.protocol41;
}

FieldPacket.prototype.parse = function(parser) {
  if (this.protocol41) {
    this.catalog     = parser.parseLengthCodedString();
    this.db          = parser.parseLengthCodedString();
    this.table       = parser.parseLengthCodedString();
    this.orgTable    = parser.parseLengthCodedString();
    this.name        = parser.parseLengthCodedString();
    this.orgName     = parser.parseLengthCodedString();

    if (parser.parseLengthCodedNumber() !== 0x0c) {
      var err  = new TypeError('Received invalid field length');
      err.code = 'PARSER_INVALID_FIELD_LENGTH';
      throw err;
    }

    this.charsetNr   = parser.parseUnsignedNumber(2);
    this.length      = parser.parseUnsignedNumber(4);
    this.type        = parser.parseUnsignedNumber(1);
    this.flags       = parser.parseUnsignedNumber(2);
    this.decimals    = parser.parseUnsignedNumber(1);

    var filler       = parser.parseBuffer(2);
    if (filler[0] !== 0x0 || filler[1] !== 0x0) {
      var err  = new TypeError('Received invalid filler');
      err.code = 'PARSER_INVALID_FILLER';
      throw err;
    }

    // parsed flags
    this.zeroFill    = (this.flags & 0x0040 ? true : false);

    if (parser.reachedPacketEnd()) {
      return;
    }

    this.default     = parser.parseLengthCodedString();
  } else {
    this.table       = parser.parseLengthCodedString();
    this.name        = parser.parseLengthCodedString();
    this.length      = parser.parseUnsignedNumber(parser.parseUnsignedNumber(1));
    this.type        = parser.parseUnsignedNumber(parser.parseUnsignedNumber(1));
  }
};

FieldPacket.prototype.write = function(writer) {
  if (this.protocol41) {
    writer.writeLengthCodedString(this.catalog);
    writer.writeLengthCodedString(this.db);
    writer.writeLengthCodedString(this.table);
    writer.writeLengthCodedString(this.orgTable);
    writer.writeLengthCodedString(this.name);
    writer.writeLengthCodedString(this.orgName);

    writer.writeLengthCodedNumber(0x0c);
    writer.writeUnsignedNumber(2, this.charsetNr || 0);
    writer.writeUnsignedNumber(4, this.length || 0);
    writer.writeUnsignedNumber(1, this.type || 0);
    writer.writeUnsignedNumber(2, this.flags || 0);
    writer.writeUnsignedNumber(1, this.decimals || 0);
    writer.writeFiller(2);

    if (this.default !== undefined) {
      writer.writeLengthCodedString(this.default);
    }
  } else {
    writer.writeLengthCodedString(this.table);
    writer.writeLengthCodedString(this.name);
    writer.writeUnsignedNumber(1, 0x01);
    writer.writeUnsignedNumber(1, this.length);
    writer.writeUnsignedNumber(1, 0x01);
    writer.writeUnsignedNumber(1, this.type);
  }
};


/***/ }),

/***/ 8076:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Buffer = (__webpack_require__(4065).Buffer);
var Client = __webpack_require__(3778);

module.exports = HandshakeInitializationPacket;
function HandshakeInitializationPacket(options) {
  options = options || {};

  this.protocolVersion     = options.protocolVersion;
  this.serverVersion       = options.serverVersion;
  this.threadId            = options.threadId;
  this.scrambleBuff1       = options.scrambleBuff1;
  this.filler1             = options.filler1;
  this.serverCapabilities1 = options.serverCapabilities1;
  this.serverLanguage      = options.serverLanguage;
  this.serverStatus        = options.serverStatus;
  this.serverCapabilities2 = options.serverCapabilities2;
  this.scrambleLength      = options.scrambleLength;
  this.filler2             = options.filler2;
  this.scrambleBuff2       = options.scrambleBuff2;
  this.filler3             = options.filler3;
  this.pluginData          = options.pluginData;
  this.protocol41          = options.protocol41;

  if (this.protocol41) {
    // force set the bit in serverCapabilities1
    this.serverCapabilities1 |= Client.CLIENT_PROTOCOL_41;
  }
}

HandshakeInitializationPacket.prototype.parse = function(parser) {
  this.protocolVersion     = parser.parseUnsignedNumber(1);
  this.serverVersion       = parser.parseNullTerminatedString();
  this.threadId            = parser.parseUnsignedNumber(4);
  this.scrambleBuff1       = parser.parseBuffer(8);
  this.filler1             = parser.parseFiller(1);
  this.serverCapabilities1 = parser.parseUnsignedNumber(2);
  this.serverLanguage      = parser.parseUnsignedNumber(1);
  this.serverStatus        = parser.parseUnsignedNumber(2);

  this.protocol41          = (this.serverCapabilities1 & (1 << 9)) > 0;

  if (this.protocol41) {
    this.serverCapabilities2 = parser.parseUnsignedNumber(2);
    this.scrambleLength      = parser.parseUnsignedNumber(1);
    this.filler2             = parser.parseFiller(10);
    // scrambleBuff2 should be 0x00 terminated, but sphinx does not do this
    // so we assume scrambleBuff2 to be 12 byte and treat the next byte as a
    // filler byte.
    this.scrambleBuff2       = parser.parseBuffer(12);
    this.filler3             = parser.parseFiller(1);
  } else {
    this.filler2             = parser.parseFiller(13);
  }

  if (parser.reachedPacketEnd()) {
    return;
  }

  // According to the docs this should be 0x00 terminated, but MariaDB does
  // not do this, so we assume this string to be packet terminated.
  this.pluginData = parser.parsePacketTerminatedString();

  // However, if there is a trailing '\0', strip it
  var lastChar = this.pluginData.length - 1;
  if (this.pluginData[lastChar] === '\0') {
    this.pluginData = this.pluginData.substr(0, lastChar);
  }
};

HandshakeInitializationPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, this.protocolVersion);
  writer.writeNullTerminatedString(this.serverVersion);
  writer.writeUnsignedNumber(4, this.threadId);
  writer.writeBuffer(this.scrambleBuff1);
  writer.writeFiller(1);
  writer.writeUnsignedNumber(2, this.serverCapabilities1);
  writer.writeUnsignedNumber(1, this.serverLanguage);
  writer.writeUnsignedNumber(2, this.serverStatus);
  if (this.protocol41) {
    writer.writeUnsignedNumber(2, this.serverCapabilities2);
    writer.writeUnsignedNumber(1, this.scrambleLength);
    writer.writeFiller(10);
  }
  writer.writeNullTerminatedBuffer(this.scrambleBuff2);

  if (this.pluginData !== undefined) {
    writer.writeNullTerminatedString(this.pluginData);
  }
};

HandshakeInitializationPacket.prototype.scrambleBuff = function() {
  var buffer = null;

  if (typeof this.scrambleBuff2 === 'undefined') {
    buffer = Buffer.from(this.scrambleBuff1);
  } else {
    buffer = Buffer.allocUnsafe(this.scrambleBuff1.length + this.scrambleBuff2.length);
    this.scrambleBuff1.copy(buffer, 0);
    this.scrambleBuff2.copy(buffer, this.scrambleBuff1.length);
  }

  return buffer;
};


/***/ }),

/***/ 9110:
/***/ ((module) => {

module.exports = LocalDataFilePacket;

/**
 * Create a new LocalDataFilePacket
 * @constructor
 * @param {Buffer} data The data contents of the packet
 * @public
 */
function LocalDataFilePacket(data) {
  this.data = data;
}

LocalDataFilePacket.prototype.write = function(writer) {
  writer.writeBuffer(this.data);
};


/***/ }),

/***/ 4388:
/***/ ((module) => {

module.exports = LocalInfileRequestPacket;
function LocalInfileRequestPacket(options) {
  options = options || {};

  this.filename = options.filename;
}

LocalInfileRequestPacket.prototype.parse = function parse(parser) {
  if (parser.parseLengthCodedNumber() !== null) {
    var err  = new TypeError('Received invalid field length');
    err.code = 'PARSER_INVALID_FIELD_LENGTH';
    throw err;
  }

  this.filename = parser.parsePacketTerminatedString();
};

LocalInfileRequestPacket.prototype.write = function write(writer) {
  writer.writeLengthCodedNumber(null);
  writer.writeString(this.filename);
};


/***/ }),

/***/ 2822:
/***/ ((module) => {


// Language-neutral expression to match ER_UPDATE_INFO
var ER_UPDATE_INFO_REGEXP = /^[^:0-9]+: [0-9]+[^:0-9]+: ([0-9]+)[^:0-9]+: [0-9]+[^:0-9]*$/;

module.exports = OkPacket;
function OkPacket(options) {
  options = options || {};

  this.fieldCount   = undefined;
  this.affectedRows = undefined;
  this.insertId     = undefined;
  this.serverStatus = undefined;
  this.warningCount = undefined;
  this.message      = undefined;
  this.protocol41   = options.protocol41;
}

OkPacket.prototype.parse = function(parser) {
  this.fieldCount   = parser.parseUnsignedNumber(1);
  this.affectedRows = parser.parseLengthCodedNumber();
  this.insertId     = parser.parseLengthCodedNumber();
  if (this.protocol41) {
    this.serverStatus = parser.parseUnsignedNumber(2);
    this.warningCount = parser.parseUnsignedNumber(2);
  }
  this.message      = parser.parsePacketTerminatedString();
  this.changedRows  = 0;

  var m = ER_UPDATE_INFO_REGEXP.exec(this.message);
  if (m !== null) {
    this.changedRows = parseInt(m[1], 10);
  }
};

OkPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, 0x00);
  writer.writeLengthCodedNumber(this.affectedRows || 0);
  writer.writeLengthCodedNumber(this.insertId || 0);
  if (this.protocol41) {
    writer.writeUnsignedNumber(2, this.serverStatus || 0);
    writer.writeUnsignedNumber(2, this.warningCount || 0);
  }
  writer.writeString(this.message);
};


/***/ }),

/***/ 217:
/***/ ((module) => {

module.exports = OldPasswordPacket;
function OldPasswordPacket(options) {
  options = options || {};

  this.scrambleBuff = options.scrambleBuff;
}

OldPasswordPacket.prototype.parse = function(parser) {
  this.scrambleBuff = parser.parsePacketTerminatedBuffer();
};

OldPasswordPacket.prototype.write = function(writer) {
  writer.writeBuffer(this.scrambleBuff);
};


/***/ }),

/***/ 8413:
/***/ ((module) => {

module.exports = ResultSetHeaderPacket;
function ResultSetHeaderPacket(options) {
  options = options || {};

  this.fieldCount = options.fieldCount;
}

ResultSetHeaderPacket.prototype.parse = function(parser) {
  this.fieldCount = parser.parseLengthCodedNumber();
};

ResultSetHeaderPacket.prototype.write = function(writer) {
  writer.writeLengthCodedNumber(this.fieldCount);
};


/***/ }),

/***/ 2161:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Types                        = __webpack_require__(5586);
var Charsets                     = __webpack_require__(2318);
var Field                        = __webpack_require__(8599);
var IEEE_754_BINARY_64_PRECISION = Math.pow(2, 53);

module.exports = RowDataPacket;
function RowDataPacket() {
}

Object.defineProperty(RowDataPacket.prototype, 'parse', {
  configurable : true,
  enumerable   : false,
  value        : parse
});

Object.defineProperty(RowDataPacket.prototype, '_typeCast', {
  configurable : true,
  enumerable   : false,
  value        : typeCast
});

function parse(parser, fieldPackets, typeCast, nestTables, connection) {
  var self = this;
  var next = function () {
    return self._typeCast(fieldPacket, parser, connection.config.timezone, connection.config.supportBigNumbers, connection.config.bigNumberStrings, connection.config.dateStrings);
  };

  for (var i = 0; i < fieldPackets.length; i++) {
    var fieldPacket = fieldPackets[i];
    var value;

    if (typeof typeCast === 'function') {
      value = typeCast.apply(connection, [ new Field({ packet: fieldPacket, parser: parser }), next ]);
    } else {
      value = (typeCast)
        ? this._typeCast(fieldPacket, parser, connection.config.timezone, connection.config.supportBigNumbers, connection.config.bigNumberStrings, connection.config.dateStrings)
        : ( (fieldPacket.charsetNr === Charsets.BINARY)
          ? parser.parseLengthCodedBuffer()
          : parser.parseLengthCodedString() );
    }

    if (typeof nestTables === 'string' && nestTables.length) {
      this[fieldPacket.table + nestTables + fieldPacket.name] = value;
    } else if (nestTables) {
      this[fieldPacket.table] = this[fieldPacket.table] || {};
      this[fieldPacket.table][fieldPacket.name] = value;
    } else {
      this[fieldPacket.name] = value;
    }
  }
}

function typeCast(field, parser, timeZone, supportBigNumbers, bigNumberStrings, dateStrings) {
  var numberString;

  switch (field.type) {
    case Types.TIMESTAMP:
    case Types.TIMESTAMP2:
    case Types.DATE:
    case Types.DATETIME:
    case Types.DATETIME2:
    case Types.NEWDATE:
      var dateString = parser.parseLengthCodedString();

      if (typeMatch(field.type, dateStrings)) {
        return dateString;
      }

      if (dateString === null) {
        return null;
      }

      var originalString = dateString;
      if (field.type === Types.DATE) {
        dateString += ' 00:00:00';
      }

      if (timeZone !== 'local') {
        dateString += ' ' + timeZone;
      }

      var dt = new Date(dateString);
      if (isNaN(dt.getTime())) {
        return originalString;
      }

      return dt;
    case Types.TINY:
    case Types.SHORT:
    case Types.LONG:
    case Types.INT24:
    case Types.YEAR:
    case Types.FLOAT:
    case Types.DOUBLE:
      numberString = parser.parseLengthCodedString();
      return (numberString === null || (field.zeroFill && numberString[0] === '0'))
        ? numberString : Number(numberString);
    case Types.NEWDECIMAL:
    case Types.LONGLONG:
      numberString = parser.parseLengthCodedString();
      return (numberString === null || (field.zeroFill && numberString[0] === '0'))
        ? numberString
        : ((supportBigNumbers && (bigNumberStrings || (Number(numberString) >= IEEE_754_BINARY_64_PRECISION) || Number(numberString) <= -IEEE_754_BINARY_64_PRECISION))
          ? numberString
          : Number(numberString));
    case Types.BIT:
      return parser.parseLengthCodedBuffer();
    case Types.STRING:
    case Types.VAR_STRING:
    case Types.TINY_BLOB:
    case Types.MEDIUM_BLOB:
    case Types.LONG_BLOB:
    case Types.BLOB:
      return (field.charsetNr === Charsets.BINARY)
        ? parser.parseLengthCodedBuffer()
        : parser.parseLengthCodedString();
    case Types.GEOMETRY:
      return parser.parseGeometryValue();
    default:
      return parser.parseLengthCodedString();
  }
}

function typeMatch(type, list) {
  if (Array.isArray(list)) {
    return list.indexOf(Types[type]) !== -1;
  } else {
    return Boolean(list);
  }
}


/***/ }),

/***/ 9508:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// http://dev.mysql.com/doc/internals/en/ssl.html
// http://dev.mysql.com/doc/internals/en/connection-phase-packets.html#packet-Protocol::SSLRequest

var ClientConstants = __webpack_require__(3778);

module.exports = SSLRequestPacket;

function SSLRequestPacket(options) {
  options = options || {};
  this.clientFlags   = options.clientFlags | ClientConstants.CLIENT_SSL;
  this.maxPacketSize = options.maxPacketSize;
  this.charsetNumber = options.charsetNumber;
}

SSLRequestPacket.prototype.parse = function(parser) {
  // TODO: check SSLRequest packet v41 vs pre v41
  this.clientFlags   = parser.parseUnsignedNumber(4);
  this.maxPacketSize = parser.parseUnsignedNumber(4);
  this.charsetNumber = parser.parseUnsignedNumber(1);
};

SSLRequestPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(4, this.clientFlags);
  writer.writeUnsignedNumber(4, this.maxPacketSize);
  writer.writeUnsignedNumber(1, this.charsetNumber);
  writer.writeFiller(23);
};


/***/ }),

/***/ 3547:
/***/ ((module) => {

module.exports = StatisticsPacket;
function StatisticsPacket() {
  this.message      = undefined;
}

StatisticsPacket.prototype.parse = function(parser) {
  this.message      = parser.parsePacketTerminatedString();

  var items = this.message.split(/\s\s/);
  for (var i = 0; i < items.length; i++) {
    var m = items[i].match(/^(.+)\:\s+(.+)$/);
    if (m !== null) {
      this[m[1].toLowerCase().replace(/\s/g, '_')] = Number(m[2]);
    }
  }
};

StatisticsPacket.prototype.write = function(writer) {
  writer.writeString(this.message);
};


/***/ }),

/***/ 5151:
/***/ ((module) => {

module.exports = UseOldPasswordPacket;
function UseOldPasswordPacket(options) {
  options = options || {};

  this.firstByte = options.firstByte || 0xfe;
}

UseOldPasswordPacket.prototype.parse = function(parser) {
  this.firstByte = parser.parseUnsignedNumber(1);
};

UseOldPasswordPacket.prototype.write = function(writer) {
  writer.writeUnsignedNumber(1, this.firstByte);
};


/***/ }),

/***/ 5997:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

exports.AuthSwitchRequestPacket = __webpack_require__(2442);
exports.AuthSwitchResponsePacket = __webpack_require__(7344);
exports.ClientAuthenticationPacket = __webpack_require__(8202);
exports.ComChangeUserPacket = __webpack_require__(8481);
exports.ComPingPacket = __webpack_require__(8722);
exports.ComQueryPacket = __webpack_require__(3946);
exports.ComQuitPacket = __webpack_require__(3616);
exports.ComStatisticsPacket = __webpack_require__(654);
exports.EmptyPacket = __webpack_require__(1974);
exports.EofPacket = __webpack_require__(8131);
exports.ErrorPacket = __webpack_require__(9243);
exports.Field = __webpack_require__(8599);
exports.FieldPacket = __webpack_require__(9883);
exports.HandshakeInitializationPacket = __webpack_require__(8076);
exports.LocalDataFilePacket = __webpack_require__(9110);
exports.LocalInfileRequestPacket = __webpack_require__(4388);
exports.OkPacket = __webpack_require__(2822);
exports.OldPasswordPacket = __webpack_require__(217);
exports.ResultSetHeaderPacket = __webpack_require__(8413);
exports.RowDataPacket = __webpack_require__(2161);
exports.SSLRequestPacket = __webpack_require__(9508);
exports.StatisticsPacket = __webpack_require__(3547);
exports.UseOldPasswordPacket = __webpack_require__(5151);


/***/ }),

/***/ 6421:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Sequence = __webpack_require__(4612);
var Util     = __webpack_require__(3837);
var Packets  = __webpack_require__(5997);
var Auth     = __webpack_require__(8065);

module.exports = ChangeUser;
Util.inherits(ChangeUser, Sequence);
function ChangeUser(options, callback) {
  Sequence.call(this, options, callback);

  this._user          = options.user;
  this._password      = options.password;
  this._database      = options.database;
  this._charsetNumber = options.charsetNumber;
  this._currentConfig = options.currentConfig;
}

ChangeUser.prototype.determinePacket = function determinePacket(firstByte) {
  switch (firstByte) {
    case 0xfe: return Packets.AuthSwitchRequestPacket;
    case 0xff: return Packets.ErrorPacket;
    default: return undefined;
  }
};

ChangeUser.prototype.start = function(handshakeInitializationPacket) {
  var scrambleBuff = handshakeInitializationPacket.scrambleBuff();
  scrambleBuff     = Auth.token(this._password, scrambleBuff);

  var packet = new Packets.ComChangeUserPacket({
    user          : this._user,
    scrambleBuff  : scrambleBuff,
    database      : this._database,
    charsetNumber : this._charsetNumber
  });

  this._currentConfig.user          = this._user;
  this._currentConfig.password      = this._password;
  this._currentConfig.database      = this._database;
  this._currentConfig.charsetNumber = this._charsetNumber;

  this.emit('packet', packet);
};

ChangeUser.prototype['AuthSwitchRequestPacket'] = function (packet) {
  var name = packet.authMethodName;
  var data = Auth.auth(name, packet.authMethodData, {
    password: this._password
  });

  if (data !== undefined) {
    this.emit('packet', new Packets.AuthSwitchResponsePacket({
      data: data
    }));
  } else {
    var err   = new Error('MySQL is requesting the ' + name + ' authentication method, which is not supported.');
    err.code  = 'UNSUPPORTED_AUTH_METHOD';
    err.fatal = true;
    this.end(err);
  }
};

ChangeUser.prototype['ErrorPacket'] = function(packet) {
  var err = this._packetToError(packet);
  err.fatal = true;
  this.end(err);
};


/***/ }),

/***/ 5353:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Sequence        = __webpack_require__(4612);
var Util            = __webpack_require__(3837);
var Packets         = __webpack_require__(5997);
var Auth            = __webpack_require__(8065);
var ClientConstants = __webpack_require__(3778);

module.exports = Handshake;
Util.inherits(Handshake, Sequence);
function Handshake(options, callback) {
  Sequence.call(this, options, callback);

  options = options || {};

  this._config                        = options.config;
  this._handshakeInitializationPacket = null;
}

Handshake.prototype.determinePacket = function determinePacket(firstByte, parser) {
  if (firstByte === 0xff) {
    return Packets.ErrorPacket;
  }

  if (!this._handshakeInitializationPacket) {
    return Packets.HandshakeInitializationPacket;
  }

  if (firstByte === 0xfe) {
    return (parser.packetLength() === 1)
      ? Packets.UseOldPasswordPacket
      : Packets.AuthSwitchRequestPacket;
  }

  return undefined;
};

Handshake.prototype['AuthSwitchRequestPacket'] = function (packet) {
  var name = packet.authMethodName;
  var data = Auth.auth(name, packet.authMethodData, {
    password: this._config.password
  });

  if (data !== undefined) {
    this.emit('packet', new Packets.AuthSwitchResponsePacket({
      data: data
    }));
  } else {
    var err   = new Error('MySQL is requesting the ' + name + ' authentication method, which is not supported.');
    err.code  = 'UNSUPPORTED_AUTH_METHOD';
    err.fatal = true;
    this.end(err);
  }
};

Handshake.prototype['HandshakeInitializationPacket'] = function(packet) {
  this._handshakeInitializationPacket = packet;

  this._config.protocol41 = packet.protocol41;

  var serverSSLSupport = packet.serverCapabilities1 & ClientConstants.CLIENT_SSL;

  if (this._config.ssl) {
    if (!serverSSLSupport) {
      var err = new Error('Server does not support secure connection');

      err.code = 'HANDSHAKE_NO_SSL_SUPPORT';
      err.fatal = true;

      this.end(err);
      return;
    }

    this._config.clientFlags |= ClientConstants.CLIENT_SSL;
    this.emit('packet', new Packets.SSLRequestPacket({
      clientFlags   : this._config.clientFlags,
      maxPacketSize : this._config.maxPacketSize,
      charsetNumber : this._config.charsetNumber
    }));
    this.emit('start-tls');
  } else {
    this._sendCredentials();
  }
};

Handshake.prototype._tlsUpgradeCompleteHandler = function() {
  this._sendCredentials();
};

Handshake.prototype._sendCredentials = function() {
  var packet = this._handshakeInitializationPacket;
  this.emit('packet', new Packets.ClientAuthenticationPacket({
    clientFlags   : this._config.clientFlags,
    maxPacketSize : this._config.maxPacketSize,
    charsetNumber : this._config.charsetNumber,
    user          : this._config.user,
    database      : this._config.database,
    protocol41    : packet.protocol41,
    scrambleBuff  : (packet.protocol41)
      ? Auth.token(this._config.password, packet.scrambleBuff())
      : Auth.scramble323(packet.scrambleBuff(), this._config.password)
  }));
};

Handshake.prototype['UseOldPasswordPacket'] = function() {
  if (!this._config.insecureAuth) {
    var err = new Error(
      'MySQL server is requesting the old and insecure pre-4.1 auth mechanism. ' +
      'Upgrade the user password or use the {insecureAuth: true} option.'
    );

    err.code = 'HANDSHAKE_INSECURE_AUTH';
    err.fatal = true;

    this.end(err);
    return;
  }

  this.emit('packet', new Packets.OldPasswordPacket({
    scrambleBuff: Auth.scramble323(this._handshakeInitializationPacket.scrambleBuff(), this._config.password)
  }));
};

Handshake.prototype['ErrorPacket'] = function(packet) {
  var err = this._packetToError(packet, true);
  err.fatal = true;
  this.end(err);
};


/***/ }),

/***/ 4533:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Sequence = __webpack_require__(4612);
var Util     = __webpack_require__(3837);
var Packets  = __webpack_require__(5997);

module.exports = Ping;
Util.inherits(Ping, Sequence);

function Ping(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  Sequence.call(this, options, callback);
}

Ping.prototype.start = function() {
  this.emit('packet', new Packets.ComPingPacket());
};


/***/ }),

/***/ 8761:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var ClientConstants = __webpack_require__(3778);
var fs              = __webpack_require__(7147);
var Packets         = __webpack_require__(5997);
var ResultSet       = __webpack_require__(8370);
var Sequence        = __webpack_require__(4612);
var ServerStatus    = __webpack_require__(1837);
var Readable        = __webpack_require__(1451);
var Util            = __webpack_require__(3837);

module.exports = Query;
Util.inherits(Query, Sequence);
function Query(options, callback) {
  Sequence.call(this, options, callback);

  this.sql = options.sql;
  this.values = options.values;
  this.typeCast = (options.typeCast === undefined)
    ? true
    : options.typeCast;
  this.nestTables = options.nestTables || false;

  this._resultSet = null;
  this._results   = [];
  this._fields    = [];
  this._index     = 0;
  this._loadError = null;
}

Query.prototype.start = function() {
  this.emit('packet', new Packets.ComQueryPacket(this.sql));
};

Query.prototype.determinePacket = function determinePacket(byte, parser) {
  var resultSet = this._resultSet;

  if (!resultSet) {
    switch (byte) {
      case 0x00: return Packets.OkPacket;
      case 0xfb: return Packets.LocalInfileRequestPacket;
      case 0xff: return Packets.ErrorPacket;
      default:   return Packets.ResultSetHeaderPacket;
    }
  }

  if (resultSet.eofPackets.length === 0) {
    return (resultSet.fieldPackets.length < resultSet.resultSetHeaderPacket.fieldCount)
      ? Packets.FieldPacket
      : Packets.EofPacket;
  }

  if (byte === 0xff) {
    return Packets.ErrorPacket;
  }

  if (byte === 0xfe && parser.packetLength() < 9) {
    return Packets.EofPacket;
  }

  return Packets.RowDataPacket;
};

Query.prototype['OkPacket'] = function(packet) {
  // try...finally for exception safety
  try {
    if (!this._callback) {
      this.emit('result', packet, this._index);
    } else {
      this._results.push(packet);
      this._fields.push(undefined);
    }
  } finally {
    this._index++;
    this._resultSet = null;
    this._handleFinalResultPacket(packet);
  }
};

Query.prototype['ErrorPacket'] = function(packet) {
  var err = this._packetToError(packet);

  var results = (this._results.length > 0)
    ? this._results
    : undefined;

  var fields = (this._fields.length > 0)
    ? this._fields
    : undefined;

  err.index = this._index;
  err.sql   = this.sql;

  this.end(err, results, fields);
};

Query.prototype['LocalInfileRequestPacket'] = function(packet) {
  if (this._connection.config.clientFlags & ClientConstants.CLIENT_LOCAL_FILES) {
    this._sendLocalDataFile(packet.filename);
  } else {
    this._loadError       = new Error('Load local files command is disabled');
    this._loadError.code  = 'LOCAL_FILES_DISABLED';
    this._loadError.fatal = false;

    this.emit('packet', new Packets.EmptyPacket());
  }
};

Query.prototype['ResultSetHeaderPacket'] = function(packet) {
  this._resultSet = new ResultSet(packet);
};

Query.prototype['FieldPacket'] = function(packet) {
  this._resultSet.fieldPackets.push(packet);
};

Query.prototype['EofPacket'] = function(packet) {
  this._resultSet.eofPackets.push(packet);

  if (this._resultSet.eofPackets.length === 1 && !this._callback) {
    this.emit('fields', this._resultSet.fieldPackets, this._index);
  }

  if (this._resultSet.eofPackets.length !== 2) {
    return;
  }

  if (this._callback) {
    this._results.push(this._resultSet.rows);
    this._fields.push(this._resultSet.fieldPackets);
  }

  this._index++;
  this._resultSet = null;
  this._handleFinalResultPacket(packet);
};

Query.prototype._handleFinalResultPacket = function(packet) {
  if (packet.serverStatus & ServerStatus.SERVER_MORE_RESULTS_EXISTS) {
    return;
  }

  var results = (this._results.length > 1)
    ? this._results
    : this._results[0];

  var fields = (this._fields.length > 1)
    ? this._fields
    : this._fields[0];

  this.end(this._loadError, results, fields);
};

Query.prototype['RowDataPacket'] = function(packet, parser, connection) {
  packet.parse(parser, this._resultSet.fieldPackets, this.typeCast, this.nestTables, connection);

  if (this._callback) {
    this._resultSet.rows.push(packet);
  } else {
    this.emit('result', packet, this._index);
  }
};

Query.prototype._sendLocalDataFile = function(path) {
  var self = this;
  var localStream = fs.createReadStream(path, {
    flag      : 'r',
    encoding  : null,
    autoClose : true
  });

  this.on('pause', function () {
    localStream.pause();
  });

  this.on('resume', function () {
    localStream.resume();
  });

  localStream.on('data', function (data) {
    self.emit('packet', new Packets.LocalDataFilePacket(data));
  });

  localStream.on('error', function (err) {
    self._loadError = err;
    localStream.emit('end');
  });

  localStream.on('end', function () {
    self.emit('packet', new Packets.EmptyPacket());
  });
};

Query.prototype.stream = function(options) {
  var self = this;

  options = options || {};
  options.objectMode = true;

  var stream = new Readable(options);

  stream._read = function() {
    self._connection && self._connection.resume();
  };

  stream.once('end', function() {
    process.nextTick(function () {
      stream.emit('close');
    });
  });

  this.on('result', function(row, i) {
    if (!stream.push(row)) self._connection.pause();
    stream.emit('result', row, i);  // replicate old emitter
  });

  this.on('error', function(err) {
    stream.emit('error', err);  // Pass on any errors
  });

  this.on('end', function() {
    stream.push(null);  // pushing null, indicating EOF
  });

  this.on('fields', function(fields, i) {
    stream.emit('fields', fields, i);  // replicate old emitter
  });

  return stream;
};


/***/ }),

/***/ 7627:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Sequence = __webpack_require__(4612);
var Util     = __webpack_require__(3837);
var Packets  = __webpack_require__(5997);

module.exports = Quit;
Util.inherits(Quit, Sequence);
function Quit(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  Sequence.call(this, options, callback);

  this._started = false;
}

Quit.prototype.end = function end(err) {
  if (this._ended) {
    return;
  }

  if (!this._started) {
    Sequence.prototype.end.call(this, err);
    return;
  }

  if (err && err.code === 'ECONNRESET' && err.syscall === 'read') {
    // Ignore read errors after packet sent
    Sequence.prototype.end.call(this);
    return;
  }

  Sequence.prototype.end.call(this, err);
};

Quit.prototype.start = function() {
  this._started = true;
  this.emit('packet', new Packets.ComQuitPacket());
};


/***/ }),

/***/ 4612:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Util           = __webpack_require__(3837);
var EventEmitter   = (__webpack_require__(2361).EventEmitter);
var Packets        = __webpack_require__(5997);
var ErrorConstants = __webpack_require__(9253);
var Timer          = __webpack_require__(3822);

// istanbul ignore next: Node.js < 0.10 not covered
var listenerCount = EventEmitter.listenerCount
  || function(emitter, type){ return emitter.listeners(type).length; };

var LONG_STACK_DELIMITER = '\n    --------------------\n';

module.exports = Sequence;
Util.inherits(Sequence, EventEmitter);
function Sequence(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  EventEmitter.call(this);

  options = options || {};

  this._callback = callback;
  this._callSite = null;
  this._ended    = false;
  this._timeout  = options.timeout;
  this._timer    = new Timer(this);
}

Sequence.determinePacket = function(byte) {
  switch (byte) {
    case 0x00: return Packets.OkPacket;
    case 0xfe: return Packets.EofPacket;
    case 0xff: return Packets.ErrorPacket;
    default:   return undefined;
  }
};

Sequence.prototype.hasErrorHandler = function() {
  return Boolean(this._callback) || listenerCount(this, 'error') > 1;
};

Sequence.prototype._packetToError = function(packet) {
  var code = ErrorConstants[packet.errno] || 'UNKNOWN_CODE_PLEASE_REPORT';
  var err  = new Error(code + ': ' + packet.message);
  err.code = code;
  err.errno = packet.errno;

  err.sqlMessage = packet.message;
  err.sqlState   = packet.sqlState;

  return err;
};

Sequence.prototype.end = function(err) {
  if (this._ended) {
    return;
  }

  this._ended = true;

  if (err) {
    this._addLongStackTrace(err);
  }

  // Without this we are leaking memory. This problem was introduced in
  // 8189925374e7ce3819bbe88b64c7b15abac96b16. I suspect that the error object
  // causes a cyclic reference that the GC does not detect properly, but I was
  // unable to produce a standalone version of this leak. This would be a great
  // challenge for somebody interested in difficult problems : )!
  this._callSite = null;

  // try...finally for exception safety
  try {
    if (err) {
      this.emit('error', err);
    }
  } finally {
    try {
      if (this._callback) {
        this._callback.apply(this, arguments);
      }
    } finally {
      this.emit('end');
    }
  }
};

Sequence.prototype['OkPacket'] = function(packet) {
  this.end(null, packet);
};

Sequence.prototype['ErrorPacket'] = function(packet) {
  this.end(this._packetToError(packet));
};

// Implemented by child classes
Sequence.prototype.start = function() {};

Sequence.prototype._addLongStackTrace = function _addLongStackTrace(err) {
  var callSiteStack = this._callSite && this._callSite.stack;

  if (!callSiteStack || typeof callSiteStack !== 'string') {
    // No recorded call site
    return;
  }

  if (err.stack.indexOf(LONG_STACK_DELIMITER) !== -1) {
    // Error stack already looks long
    return;
  }

  var index = callSiteStack.indexOf('\n');

  if (index !== -1) {
    // Append recorded call site
    err.stack += LONG_STACK_DELIMITER + callSiteStack.substr(index + 1);
  }
};

Sequence.prototype._onTimeout = function _onTimeout() {
  this.emit('timeout');
};


/***/ }),

/***/ 3808:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Sequence = __webpack_require__(4612);
var Util     = __webpack_require__(3837);
var Packets  = __webpack_require__(5997);

module.exports = Statistics;
Util.inherits(Statistics, Sequence);
function Statistics(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  Sequence.call(this, options, callback);
}

Statistics.prototype.start = function() {
  this.emit('packet', new Packets.ComStatisticsPacket());
};

Statistics.prototype['StatisticsPacket'] = function (packet) {
  this.end(null, packet);
};

Statistics.prototype.determinePacket = function determinePacket(firstByte) {
  if (firstByte === 0x55) {
    return Packets.StatisticsPacket;
  }

  return undefined;
};


/***/ }),

/***/ 3664:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

exports.ChangeUser = __webpack_require__(6421);
exports.Handshake = __webpack_require__(5353);
exports.Ping = __webpack_require__(4533);
exports.Query = __webpack_require__(8761);
exports.Quit = __webpack_require__(7627);
exports.Sequence = __webpack_require__(4612);
exports.Statistics = __webpack_require__(3808);


/***/ }),

/***/ 4065:
/***/ ((module, exports, __webpack_require__) => {

/* eslint-disable node/no-deprecated-api */
var buffer = __webpack_require__(4300)
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}


/***/ }),

/***/ 3414:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*! node-domexception. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

if (!globalThis.DOMException) {
  try {
    const { MessageChannel } = __webpack_require__(1267),
    port = new MessageChannel().port1,
    ab = new ArrayBuffer()
    port.postMessage(ab, [ab, ab])
  } catch (err) {
    err.constructor.name === 'DOMException' && (
      globalThis.DOMException = err.constructor
    )
  }
}

module.exports = globalThis.DOMException


/***/ }),

/***/ 8212:
/***/ ((module) => {

"use strict";


if (typeof process === 'undefined' ||
    !process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}



/***/ }),

/***/ 6753:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.



/*<replacement>*/

var pna = __webpack_require__(8212);
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = Object.create(__webpack_require__(6497));
util.inherits = __webpack_require__(4378);
/*</replacement>*/

var Readable = __webpack_require__(9481);
var Writable = __webpack_require__(4229);

util.inherits(Duplex, Readable);

{
  // avoid scope creep, the keys array can then be collected
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};

/***/ }),

/***/ 2725:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.



module.exports = PassThrough;

var Transform = __webpack_require__(4605);

/*<replacement>*/
var util = Object.create(__webpack_require__(6497));
util.inherits = __webpack_require__(4378);
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

/***/ }),

/***/ 9481:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



/*<replacement>*/

var pna = __webpack_require__(8212);
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = __webpack_require__(5826);
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = (__webpack_require__(2361).EventEmitter);

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = __webpack_require__(9740);
/*</replacement>*/

/*<replacement>*/

var Buffer = (__webpack_require__(3545).Buffer);
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = Object.create(__webpack_require__(6497));
util.inherits = __webpack_require__(4378);
/*</replacement>*/

/*<replacement>*/
var debugUtil = __webpack_require__(3837);
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = __webpack_require__(5057);
var destroyImpl = __webpack_require__(1195);
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || __webpack_require__(6753);

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = (__webpack_require__(2553)/* .StringDecoder */ .s);
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || __webpack_require__(6753);

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = (__webpack_require__(2553)/* .StringDecoder */ .s);
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._readableState.highWaterMark;
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

/***/ }),

/***/ 4605:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.



module.exports = Transform;

var Duplex = __webpack_require__(6753);

/*<replacement>*/
var util = Object.create(__webpack_require__(6497));
util.inherits = __webpack_require__(4378);
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}

/***/ }),

/***/ 4229:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.



/*<replacement>*/

var pna = __webpack_require__(8212);
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = Object.create(__webpack_require__(6497));
util.inherits = __webpack_require__(4378);
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: __webpack_require__(1159)
};
/*</replacement>*/

/*<replacement>*/
var Stream = __webpack_require__(9740);
/*</replacement>*/

/*<replacement>*/

var Buffer = (__webpack_require__(3545).Buffer);
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = __webpack_require__(1195);

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || __webpack_require__(6753);

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || __webpack_require__(6753);

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};

/***/ }),

/***/ 5057:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = (__webpack_require__(3545).Buffer);
var util = __webpack_require__(3837);

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}

/***/ }),

/***/ 1195:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*<replacement>*/

var pna = __webpack_require__(8212);
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};

/***/ }),

/***/ 9740:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(2781);


/***/ }),

/***/ 3545:
/***/ ((module, exports, __webpack_require__) => {

/* eslint-disable node/no-deprecated-api */
var buffer = __webpack_require__(4300)
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}


/***/ }),

/***/ 1451:
/***/ ((module, exports, __webpack_require__) => {

var Stream = __webpack_require__(2781);
if (process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream;
  exports = module.exports = Stream.Readable;
  exports.Readable = Stream.Readable;
  exports.Writable = Stream.Writable;
  exports.Duplex = Stream.Duplex;
  exports.Transform = Stream.Transform;
  exports.PassThrough = Stream.PassThrough;
  exports.Stream = Stream;
} else {
  exports = module.exports = __webpack_require__(9481);
  exports.Stream = Stream || exports;
  exports.Readable = exports;
  exports.Writable = __webpack_require__(4229);
  exports.Duplex = __webpack_require__(6753);
  exports.Transform = __webpack_require__(4605);
  exports.PassThrough = __webpack_require__(2725);
}


/***/ }),

/***/ 2655:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(5428);


/***/ }),

/***/ 5428:
/***/ ((__unused_webpack_module, exports) => {

var SqlString  = exports;

var ID_GLOBAL_REGEXP    = /`/g;
var QUAL_GLOBAL_REGEXP  = /\./g;
var CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g; // eslint-disable-line no-control-regex
var CHARS_ESCAPE_MAP    = {
  '\0'   : '\\0',
  '\b'   : '\\b',
  '\t'   : '\\t',
  '\n'   : '\\n',
  '\r'   : '\\r',
  '\x1a' : '\\Z',
  '"'    : '\\"',
  '\''   : '\\\'',
  '\\'   : '\\\\'
};

SqlString.escapeId = function escapeId(val, forbidQualified) {
  if (Array.isArray(val)) {
    var sql = '';

    for (var i = 0; i < val.length; i++) {
      sql += (i === 0 ? '' : ', ') + SqlString.escapeId(val[i], forbidQualified);
    }

    return sql;
  } else if (forbidQualified) {
    return '`' + String(val).replace(ID_GLOBAL_REGEXP, '``') + '`';
  } else {
    return '`' + String(val).replace(ID_GLOBAL_REGEXP, '``').replace(QUAL_GLOBAL_REGEXP, '`.`') + '`';
  }
};

SqlString.escape = function escape(val, stringifyObjects, timeZone) {
  if (val === undefined || val === null) {
    return 'NULL';
  }

  switch (typeof val) {
    case 'boolean': return (val) ? 'true' : 'false';
    case 'number': return val + '';
    case 'object':
      if (val instanceof Date) {
        return SqlString.dateToString(val, timeZone || 'local');
      } else if (Array.isArray(val)) {
        return SqlString.arrayToList(val, timeZone);
      } else if (Buffer.isBuffer(val)) {
        return SqlString.bufferToString(val);
      } else if (typeof val.toSqlString === 'function') {
        return String(val.toSqlString());
      } else if (stringifyObjects) {
        return escapeString(val.toString());
      } else {
        return SqlString.objectToValues(val, timeZone);
      }
    default: return escapeString(val);
  }
};

SqlString.arrayToList = function arrayToList(array, timeZone) {
  var sql = '';

  for (var i = 0; i < array.length; i++) {
    var val = array[i];

    if (Array.isArray(val)) {
      sql += (i === 0 ? '' : ', ') + '(' + SqlString.arrayToList(val, timeZone) + ')';
    } else {
      sql += (i === 0 ? '' : ', ') + SqlString.escape(val, true, timeZone);
    }
  }

  return sql;
};

SqlString.format = function format(sql, values, stringifyObjects, timeZone) {
  if (values == null) {
    return sql;
  }

  if (!(values instanceof Array || Array.isArray(values))) {
    values = [values];
  }

  var chunkIndex        = 0;
  var placeholdersRegex = /\?+/g;
  var result            = '';
  var valuesIndex       = 0;
  var match;

  while (valuesIndex < values.length && (match = placeholdersRegex.exec(sql))) {
    var len = match[0].length;

    if (len > 2) {
      continue;
    }

    var value = len === 2
      ? SqlString.escapeId(values[valuesIndex])
      : SqlString.escape(values[valuesIndex], stringifyObjects, timeZone);

    result += sql.slice(chunkIndex, match.index) + value;
    chunkIndex = placeholdersRegex.lastIndex;
    valuesIndex++;
  }

  if (chunkIndex === 0) {
    // Nothing was replaced
    return sql;
  }

  if (chunkIndex < sql.length) {
    return result + sql.slice(chunkIndex);
  }

  return result;
};

SqlString.dateToString = function dateToString(date, timeZone) {
  var dt = new Date(date);

  if (isNaN(dt.getTime())) {
    return 'NULL';
  }

  var year;
  var month;
  var day;
  var hour;
  var minute;
  var second;
  var millisecond;

  if (timeZone === 'local') {
    year        = dt.getFullYear();
    month       = dt.getMonth() + 1;
    day         = dt.getDate();
    hour        = dt.getHours();
    minute      = dt.getMinutes();
    second      = dt.getSeconds();
    millisecond = dt.getMilliseconds();
  } else {
    var tz = convertTimezone(timeZone);

    if (tz !== false && tz !== 0) {
      dt.setTime(dt.getTime() + (tz * 60000));
    }

    year       = dt.getUTCFullYear();
    month       = dt.getUTCMonth() + 1;
    day         = dt.getUTCDate();
    hour        = dt.getUTCHours();
    minute      = dt.getUTCMinutes();
    second      = dt.getUTCSeconds();
    millisecond = dt.getUTCMilliseconds();
  }

  // YYYY-MM-DD HH:mm:ss.mmm
  var str = zeroPad(year, 4) + '-' + zeroPad(month, 2) + '-' + zeroPad(day, 2) + ' ' +
    zeroPad(hour, 2) + ':' + zeroPad(minute, 2) + ':' + zeroPad(second, 2) + '.' +
    zeroPad(millisecond, 3);

  return escapeString(str);
};

SqlString.bufferToString = function bufferToString(buffer) {
  return 'X' + escapeString(buffer.toString('hex'));
};

SqlString.objectToValues = function objectToValues(object, timeZone) {
  var sql = '';

  for (var key in object) {
    var val = object[key];

    if (typeof val === 'function') {
      continue;
    }

    sql += (sql.length === 0 ? '' : ', ') + SqlString.escapeId(key) + ' = ' + SqlString.escape(val, true, timeZone);
  }

  return sql;
};

SqlString.raw = function raw(sql) {
  if (typeof sql !== 'string') {
    throw new TypeError('argument sql must be a string');
  }

  return {
    toSqlString: function toSqlString() { return sql; }
  };
};

function escapeString(val) {
  var chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex = 0;
  var escapedVal = '';
  var match;

  while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
    escapedVal += val.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]];
    chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
  }

  if (chunkIndex === 0) {
    // Nothing was escaped
    return "'" + val + "'";
  }

  if (chunkIndex < val.length) {
    return "'" + escapedVal + val.slice(chunkIndex) + "'";
  }

  return "'" + escapedVal + "'";
}

function zeroPad(number, length) {
  number = number.toString();
  while (number.length < length) {
    number = '0' + number;
  }

  return number;
}

function convertTimezone(tz) {
  if (tz === 'Z') {
    return 0;
  }

  var m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);
  if (m) {
    return (m[1] === '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
  }
  return false;
}


/***/ }),

/***/ 2553:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



/*<replacement>*/

var Buffer = (__webpack_require__(396).Buffer);
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.s = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}

/***/ }),

/***/ 396:
/***/ ((module, exports, __webpack_require__) => {

/* eslint-disable node/no-deprecated-api */
var buffer = __webpack_require__(4300)
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}


/***/ }),

/***/ 1159:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * For Node.js, simply re-export the core `util.deprecate` function.
 */

module.exports = __webpack_require__(3837).deprecate;


/***/ }),

/***/ 2660:
/***/ (function(__unused_webpack_module, exports) {

/**
 * web-streams-polyfill v3.2.1
 */
(function (global, factory) {
     true ? factory(exports) :
    0;
}(this, (function (exports) { 'use strict';

    /// <reference lib="es2015.symbol" />
    const SymbolPolyfill = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ?
        Symbol :
        description => `Symbol(${description})`;

    /// <reference lib="dom" />
    function noop() {
        return undefined;
    }
    function getGlobals() {
        if (typeof self !== 'undefined') {
            return self;
        }
        else if (typeof window !== 'undefined') {
            return window;
        }
        else if (typeof global !== 'undefined') {
            return global;
        }
        return undefined;
    }
    const globals = getGlobals();

    function typeIsObject(x) {
        return (typeof x === 'object' && x !== null) || typeof x === 'function';
    }
    const rethrowAssertionErrorRejection = noop;

    const originalPromise = Promise;
    const originalPromiseThen = Promise.prototype.then;
    const originalPromiseResolve = Promise.resolve.bind(originalPromise);
    const originalPromiseReject = Promise.reject.bind(originalPromise);
    function newPromise(executor) {
        return new originalPromise(executor);
    }
    function promiseResolvedWith(value) {
        return originalPromiseResolve(value);
    }
    function promiseRejectedWith(reason) {
        return originalPromiseReject(reason);
    }
    function PerformPromiseThen(promise, onFulfilled, onRejected) {
        // There doesn't appear to be any way to correctly emulate the behaviour from JavaScript, so this is just an
        // approximation.
        return originalPromiseThen.call(promise, onFulfilled, onRejected);
    }
    function uponPromise(promise, onFulfilled, onRejected) {
        PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), undefined, rethrowAssertionErrorRejection);
    }
    function uponFulfillment(promise, onFulfilled) {
        uponPromise(promise, onFulfilled);
    }
    function uponRejection(promise, onRejected) {
        uponPromise(promise, undefined, onRejected);
    }
    function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
        return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
    }
    function setPromiseIsHandledToTrue(promise) {
        PerformPromiseThen(promise, undefined, rethrowAssertionErrorRejection);
    }
    const queueMicrotask = (() => {
        const globalQueueMicrotask = globals && globals.queueMicrotask;
        if (typeof globalQueueMicrotask === 'function') {
            return globalQueueMicrotask;
        }
        const resolvedPromise = promiseResolvedWith(undefined);
        return (fn) => PerformPromiseThen(resolvedPromise, fn);
    })();
    function reflectCall(F, V, args) {
        if (typeof F !== 'function') {
            throw new TypeError('Argument is not a function');
        }
        return Function.prototype.apply.call(F, V, args);
    }
    function promiseCall(F, V, args) {
        try {
            return promiseResolvedWith(reflectCall(F, V, args));
        }
        catch (value) {
            return promiseRejectedWith(value);
        }
    }

    // Original from Chromium
    // https://chromium.googlesource.com/chromium/src/+/0aee4434a4dba42a42abaea9bfbc0cd196a63bc1/third_party/blink/renderer/core/streams/SimpleQueue.js
    const QUEUE_MAX_ARRAY_SIZE = 16384;
    /**
     * Simple queue structure.
     *
     * Avoids scalability issues with using a packed array directly by using
     * multiple arrays in a linked list and keeping the array size bounded.
     */
    class SimpleQueue {
        constructor() {
            this._cursor = 0;
            this._size = 0;
            // _front and _back are always defined.
            this._front = {
                _elements: [],
                _next: undefined
            };
            this._back = this._front;
            // The cursor is used to avoid calling Array.shift().
            // It contains the index of the front element of the array inside the
            // front-most node. It is always in the range [0, QUEUE_MAX_ARRAY_SIZE).
            this._cursor = 0;
            // When there is only one node, size === elements.length - cursor.
            this._size = 0;
        }
        get length() {
            return this._size;
        }
        // For exception safety, this method is structured in order:
        // 1. Read state
        // 2. Calculate required state mutations
        // 3. Perform state mutations
        push(element) {
            const oldBack = this._back;
            let newBack = oldBack;
            if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
                newBack = {
                    _elements: [],
                    _next: undefined
                };
            }
            // push() is the mutation most likely to throw an exception, so it
            // goes first.
            oldBack._elements.push(element);
            if (newBack !== oldBack) {
                this._back = newBack;
                oldBack._next = newBack;
            }
            ++this._size;
        }
        // Like push(), shift() follows the read -> calculate -> mutate pattern for
        // exception safety.
        shift() { // must not be called on an empty queue
            const oldFront = this._front;
            let newFront = oldFront;
            const oldCursor = this._cursor;
            let newCursor = oldCursor + 1;
            const elements = oldFront._elements;
            const element = elements[oldCursor];
            if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
                newFront = oldFront._next;
                newCursor = 0;
            }
            // No mutations before this point.
            --this._size;
            this._cursor = newCursor;
            if (oldFront !== newFront) {
                this._front = newFront;
            }
            // Permit shifted element to be garbage collected.
            elements[oldCursor] = undefined;
            return element;
        }
        // The tricky thing about forEach() is that it can be called
        // re-entrantly. The queue may be mutated inside the callback. It is easy to
        // see that push() within the callback has no negative effects since the end
        // of the queue is checked for on every iteration. If shift() is called
        // repeatedly within the callback then the next iteration may return an
        // element that has been removed. In this case the callback will be called
        // with undefined values until we either "catch up" with elements that still
        // exist or reach the back of the queue.
        forEach(callback) {
            let i = this._cursor;
            let node = this._front;
            let elements = node._elements;
            while (i !== elements.length || node._next !== undefined) {
                if (i === elements.length) {
                    node = node._next;
                    elements = node._elements;
                    i = 0;
                    if (elements.length === 0) {
                        break;
                    }
                }
                callback(elements[i]);
                ++i;
            }
        }
        // Return the element that would be returned if shift() was called now,
        // without modifying the queue.
        peek() { // must not be called on an empty queue
            const front = this._front;
            const cursor = this._cursor;
            return front._elements[cursor];
        }
    }

    function ReadableStreamReaderGenericInitialize(reader, stream) {
        reader._ownerReadableStream = stream;
        stream._reader = reader;
        if (stream._state === 'readable') {
            defaultReaderClosedPromiseInitialize(reader);
        }
        else if (stream._state === 'closed') {
            defaultReaderClosedPromiseInitializeAsResolved(reader);
        }
        else {
            defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
        }
    }
    // A client of ReadableStreamDefaultReader and ReadableStreamBYOBReader may use these functions directly to bypass state
    // check.
    function ReadableStreamReaderGenericCancel(reader, reason) {
        const stream = reader._ownerReadableStream;
        return ReadableStreamCancel(stream, reason);
    }
    function ReadableStreamReaderGenericRelease(reader) {
        if (reader._ownerReadableStream._state === 'readable') {
            defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
        }
        else {
            defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
        }
        reader._ownerReadableStream._reader = undefined;
        reader._ownerReadableStream = undefined;
    }
    // Helper functions for the readers.
    function readerLockException(name) {
        return new TypeError('Cannot ' + name + ' a stream using a released reader');
    }
    // Helper functions for the ReadableStreamDefaultReader.
    function defaultReaderClosedPromiseInitialize(reader) {
        reader._closedPromise = newPromise((resolve, reject) => {
            reader._closedPromise_resolve = resolve;
            reader._closedPromise_reject = reject;
        });
    }
    function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
        defaultReaderClosedPromiseInitialize(reader);
        defaultReaderClosedPromiseReject(reader, reason);
    }
    function defaultReaderClosedPromiseInitializeAsResolved(reader) {
        defaultReaderClosedPromiseInitialize(reader);
        defaultReaderClosedPromiseResolve(reader);
    }
    function defaultReaderClosedPromiseReject(reader, reason) {
        if (reader._closedPromise_reject === undefined) {
            return;
        }
        setPromiseIsHandledToTrue(reader._closedPromise);
        reader._closedPromise_reject(reason);
        reader._closedPromise_resolve = undefined;
        reader._closedPromise_reject = undefined;
    }
    function defaultReaderClosedPromiseResetToRejected(reader, reason) {
        defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
    }
    function defaultReaderClosedPromiseResolve(reader) {
        if (reader._closedPromise_resolve === undefined) {
            return;
        }
        reader._closedPromise_resolve(undefined);
        reader._closedPromise_resolve = undefined;
        reader._closedPromise_reject = undefined;
    }

    const AbortSteps = SymbolPolyfill('[[AbortSteps]]');
    const ErrorSteps = SymbolPolyfill('[[ErrorSteps]]');
    const CancelSteps = SymbolPolyfill('[[CancelSteps]]');
    const PullSteps = SymbolPolyfill('[[PullSteps]]');

    /// <reference lib="es2015.core" />
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite#Polyfill
    const NumberIsFinite = Number.isFinite || function (x) {
        return typeof x === 'number' && isFinite(x);
    };

    /// <reference lib="es2015.core" />
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc#Polyfill
    const MathTrunc = Math.trunc || function (v) {
        return v < 0 ? Math.ceil(v) : Math.floor(v);
    };

    // https://heycam.github.io/webidl/#idl-dictionaries
    function isDictionary(x) {
        return typeof x === 'object' || typeof x === 'function';
    }
    function assertDictionary(obj, context) {
        if (obj !== undefined && !isDictionary(obj)) {
            throw new TypeError(`${context} is not an object.`);
        }
    }
    // https://heycam.github.io/webidl/#idl-callback-functions
    function assertFunction(x, context) {
        if (typeof x !== 'function') {
            throw new TypeError(`${context} is not a function.`);
        }
    }
    // https://heycam.github.io/webidl/#idl-object
    function isObject(x) {
        return (typeof x === 'object' && x !== null) || typeof x === 'function';
    }
    function assertObject(x, context) {
        if (!isObject(x)) {
            throw new TypeError(`${context} is not an object.`);
        }
    }
    function assertRequiredArgument(x, position, context) {
        if (x === undefined) {
            throw new TypeError(`Parameter ${position} is required in '${context}'.`);
        }
    }
    function assertRequiredField(x, field, context) {
        if (x === undefined) {
            throw new TypeError(`${field} is required in '${context}'.`);
        }
    }
    // https://heycam.github.io/webidl/#idl-unrestricted-double
    function convertUnrestrictedDouble(value) {
        return Number(value);
    }
    function censorNegativeZero(x) {
        return x === 0 ? 0 : x;
    }
    function integerPart(x) {
        return censorNegativeZero(MathTrunc(x));
    }
    // https://heycam.github.io/webidl/#idl-unsigned-long-long
    function convertUnsignedLongLongWithEnforceRange(value, context) {
        const lowerBound = 0;
        const upperBound = Number.MAX_SAFE_INTEGER;
        let x = Number(value);
        x = censorNegativeZero(x);
        if (!NumberIsFinite(x)) {
            throw new TypeError(`${context} is not a finite number`);
        }
        x = integerPart(x);
        if (x < lowerBound || x > upperBound) {
            throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
        }
        if (!NumberIsFinite(x) || x === 0) {
            return 0;
        }
        // TODO Use BigInt if supported?
        // let xBigInt = BigInt(integerPart(x));
        // xBigInt = BigInt.asUintN(64, xBigInt);
        // return Number(xBigInt);
        return x;
    }

    function assertReadableStream(x, context) {
        if (!IsReadableStream(x)) {
            throw new TypeError(`${context} is not a ReadableStream.`);
        }
    }

    // Abstract operations for the ReadableStream.
    function AcquireReadableStreamDefaultReader(stream) {
        return new ReadableStreamDefaultReader(stream);
    }
    // ReadableStream API exposed for controllers.
    function ReadableStreamAddReadRequest(stream, readRequest) {
        stream._reader._readRequests.push(readRequest);
    }
    function ReadableStreamFulfillReadRequest(stream, chunk, done) {
        const reader = stream._reader;
        const readRequest = reader._readRequests.shift();
        if (done) {
            readRequest._closeSteps();
        }
        else {
            readRequest._chunkSteps(chunk);
        }
    }
    function ReadableStreamGetNumReadRequests(stream) {
        return stream._reader._readRequests.length;
    }
    function ReadableStreamHasDefaultReader(stream) {
        const reader = stream._reader;
        if (reader === undefined) {
            return false;
        }
        if (!IsReadableStreamDefaultReader(reader)) {
            return false;
        }
        return true;
    }
    /**
     * A default reader vended by a {@link ReadableStream}.
     *
     * @public
     */
    class ReadableStreamDefaultReader {
        constructor(stream) {
            assertRequiredArgument(stream, 1, 'ReadableStreamDefaultReader');
            assertReadableStream(stream, 'First parameter');
            if (IsReadableStreamLocked(stream)) {
                throw new TypeError('This stream has already been locked for exclusive reading by another reader');
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readRequests = new SimpleQueue();
        }
        /**
         * Returns a promise that will be fulfilled when the stream becomes closed,
         * or rejected if the stream ever errors or the reader's lock is released before the stream finishes closing.
         */
        get closed() {
            if (!IsReadableStreamDefaultReader(this)) {
                return promiseRejectedWith(defaultReaderBrandCheckException('closed'));
            }
            return this._closedPromise;
        }
        /**
         * If the reader is active, behaves the same as {@link ReadableStream.cancel | stream.cancel(reason)}.
         */
        cancel(reason = undefined) {
            if (!IsReadableStreamDefaultReader(this)) {
                return promiseRejectedWith(defaultReaderBrandCheckException('cancel'));
            }
            if (this._ownerReadableStream === undefined) {
                return promiseRejectedWith(readerLockException('cancel'));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
        }
        /**
         * Returns a promise that allows access to the next chunk from the stream's internal queue, if available.
         *
         * If reading a chunk causes the queue to become empty, more data will be pulled from the underlying source.
         */
        read() {
            if (!IsReadableStreamDefaultReader(this)) {
                return promiseRejectedWith(defaultReaderBrandCheckException('read'));
            }
            if (this._ownerReadableStream === undefined) {
                return promiseRejectedWith(readerLockException('read from'));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve, reject) => {
                resolvePromise = resolve;
                rejectPromise = reject;
            });
            const readRequest = {
                _chunkSteps: chunk => resolvePromise({ value: chunk, done: false }),
                _closeSteps: () => resolvePromise({ value: undefined, done: true }),
                _errorSteps: e => rejectPromise(e)
            };
            ReadableStreamDefaultReaderRead(this, readRequest);
            return promise;
        }
        /**
         * Releases the reader's lock on the corresponding stream. After the lock is released, the reader is no longer active.
         * If the associated stream is errored when the lock is released, the reader will appear errored in the same way
         * from now on; otherwise, the reader will appear closed.
         *
         * A reader's lock cannot be released while it still has a pending read request, i.e., if a promise returned by
         * the reader's {@link ReadableStreamDefaultReader.read | read()} method has not yet been settled. Attempting to
         * do so will throw a `TypeError` and leave the reader locked to the stream.
         */
        releaseLock() {
            if (!IsReadableStreamDefaultReader(this)) {
                throw defaultReaderBrandCheckException('releaseLock');
            }
            if (this._ownerReadableStream === undefined) {
                return;
            }
            if (this._readRequests.length > 0) {
                throw new TypeError('Tried to release a reader lock when that reader has pending read() calls un-settled');
            }
            ReadableStreamReaderGenericRelease(this);
        }
    }
    Object.defineProperties(ReadableStreamDefaultReader.prototype, {
        cancel: { enumerable: true },
        read: { enumerable: true },
        releaseLock: { enumerable: true },
        closed: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
            value: 'ReadableStreamDefaultReader',
            configurable: true
        });
    }
    // Abstract operations for the readers.
    function IsReadableStreamDefaultReader(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_readRequests')) {
            return false;
        }
        return x instanceof ReadableStreamDefaultReader;
    }
    function ReadableStreamDefaultReaderRead(reader, readRequest) {
        const stream = reader._ownerReadableStream;
        stream._disturbed = true;
        if (stream._state === 'closed') {
            readRequest._closeSteps();
        }
        else if (stream._state === 'errored') {
            readRequest._errorSteps(stream._storedError);
        }
        else {
            stream._readableStreamController[PullSteps](readRequest);
        }
    }
    // Helper functions for the ReadableStreamDefaultReader.
    function defaultReaderBrandCheckException(name) {
        return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
    }

    /// <reference lib="es2018.asynciterable" />
    /* eslint-disable @typescript-eslint/no-empty-function */
    const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () { }).prototype);

    /// <reference lib="es2018.asynciterable" />
    class ReadableStreamAsyncIteratorImpl {
        constructor(reader, preventCancel) {
            this._ongoingPromise = undefined;
            this._isFinished = false;
            this._reader = reader;
            this._preventCancel = preventCancel;
        }
        next() {
            const nextSteps = () => this._nextSteps();
            this._ongoingPromise = this._ongoingPromise ?
                transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) :
                nextSteps();
            return this._ongoingPromise;
        }
        return(value) {
            const returnSteps = () => this._returnSteps(value);
            return this._ongoingPromise ?
                transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) :
                returnSteps();
        }
        _nextSteps() {
            if (this._isFinished) {
                return Promise.resolve({ value: undefined, done: true });
            }
            const reader = this._reader;
            if (reader._ownerReadableStream === undefined) {
                return promiseRejectedWith(readerLockException('iterate'));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve, reject) => {
                resolvePromise = resolve;
                rejectPromise = reject;
            });
            const readRequest = {
                _chunkSteps: chunk => {
                    this._ongoingPromise = undefined;
                    // This needs to be delayed by one microtask, otherwise we stop pulling too early which breaks a test.
                    // FIXME Is this a bug in the specification, or in the test?
                    queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
                },
                _closeSteps: () => {
                    this._ongoingPromise = undefined;
                    this._isFinished = true;
                    ReadableStreamReaderGenericRelease(reader);
                    resolvePromise({ value: undefined, done: true });
                },
                _errorSteps: reason => {
                    this._ongoingPromise = undefined;
                    this._isFinished = true;
                    ReadableStreamReaderGenericRelease(reader);
                    rejectPromise(reason);
                }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promise;
        }
        _returnSteps(value) {
            if (this._isFinished) {
                return Promise.resolve({ value, done: true });
            }
            this._isFinished = true;
            const reader = this._reader;
            if (reader._ownerReadableStream === undefined) {
                return promiseRejectedWith(readerLockException('finish iterating'));
            }
            if (!this._preventCancel) {
                const result = ReadableStreamReaderGenericCancel(reader, value);
                ReadableStreamReaderGenericRelease(reader);
                return transformPromiseWith(result, () => ({ value, done: true }));
            }
            ReadableStreamReaderGenericRelease(reader);
            return promiseResolvedWith({ value, done: true });
        }
    }
    const ReadableStreamAsyncIteratorPrototype = {
        next() {
            if (!IsReadableStreamAsyncIterator(this)) {
                return promiseRejectedWith(streamAsyncIteratorBrandCheckException('next'));
            }
            return this._asyncIteratorImpl.next();
        },
        return(value) {
            if (!IsReadableStreamAsyncIterator(this)) {
                return promiseRejectedWith(streamAsyncIteratorBrandCheckException('return'));
            }
            return this._asyncIteratorImpl.return(value);
        }
    };
    if (AsyncIteratorPrototype !== undefined) {
        Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
    }
    // Abstract operations for the ReadableStream.
    function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
        const reader = AcquireReadableStreamDefaultReader(stream);
        const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
        const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
        iterator._asyncIteratorImpl = impl;
        return iterator;
    }
    function IsReadableStreamAsyncIterator(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_asyncIteratorImpl')) {
            return false;
        }
        try {
            // noinspection SuspiciousTypeOfGuard
            return x._asyncIteratorImpl instanceof
                ReadableStreamAsyncIteratorImpl;
        }
        catch (_a) {
            return false;
        }
    }
    // Helper functions for the ReadableStream.
    function streamAsyncIteratorBrandCheckException(name) {
        return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
    }

    /// <reference lib="es2015.core" />
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN#Polyfill
    const NumberIsNaN = Number.isNaN || function (x) {
        // eslint-disable-next-line no-self-compare
        return x !== x;
    };

    function CreateArrayFromList(elements) {
        // We use arrays to represent lists, so this is basically a no-op.
        // Do a slice though just in case we happen to depend on the unique-ness.
        return elements.slice();
    }
    function CopyDataBlockBytes(dest, destOffset, src, srcOffset, n) {
        new Uint8Array(dest).set(new Uint8Array(src, srcOffset, n), destOffset);
    }
    // Not implemented correctly
    function TransferArrayBuffer(O) {
        return O;
    }
    // Not implemented correctly
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function IsDetachedBuffer(O) {
        return false;
    }
    function ArrayBufferSlice(buffer, begin, end) {
        // ArrayBuffer.prototype.slice is not available on IE10
        // https://www.caniuse.com/mdn-javascript_builtins_arraybuffer_slice
        if (buffer.slice) {
            return buffer.slice(begin, end);
        }
        const length = end - begin;
        const slice = new ArrayBuffer(length);
        CopyDataBlockBytes(slice, 0, buffer, begin, length);
        return slice;
    }

    function IsNonNegativeNumber(v) {
        if (typeof v !== 'number') {
            return false;
        }
        if (NumberIsNaN(v)) {
            return false;
        }
        if (v < 0) {
            return false;
        }
        return true;
    }
    function CloneAsUint8Array(O) {
        const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
        return new Uint8Array(buffer);
    }

    function DequeueValue(container) {
        const pair = container._queue.shift();
        container._queueTotalSize -= pair.size;
        if (container._queueTotalSize < 0) {
            container._queueTotalSize = 0;
        }
        return pair.value;
    }
    function EnqueueValueWithSize(container, value, size) {
        if (!IsNonNegativeNumber(size) || size === Infinity) {
            throw new RangeError('Size must be a finite, non-NaN, non-negative number.');
        }
        container._queue.push({ value, size });
        container._queueTotalSize += size;
    }
    function PeekQueueValue(container) {
        const pair = container._queue.peek();
        return pair.value;
    }
    function ResetQueue(container) {
        container._queue = new SimpleQueue();
        container._queueTotalSize = 0;
    }

    /**
     * A pull-into request in a {@link ReadableByteStreamController}.
     *
     * @public
     */
    class ReadableStreamBYOBRequest {
        constructor() {
            throw new TypeError('Illegal constructor');
        }
        /**
         * Returns the view for writing in to, or `null` if the BYOB request has already been responded to.
         */
        get view() {
            if (!IsReadableStreamBYOBRequest(this)) {
                throw byobRequestBrandCheckException('view');
            }
            return this._view;
        }
        respond(bytesWritten) {
            if (!IsReadableStreamBYOBRequest(this)) {
                throw byobRequestBrandCheckException('respond');
            }
            assertRequiredArgument(bytesWritten, 1, 'respond');
            bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, 'First parameter');
            if (this._associatedReadableByteStreamController === undefined) {
                throw new TypeError('This BYOB request has been invalidated');
            }
            if (IsDetachedBuffer(this._view.buffer)) ;
            ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
        }
        respondWithNewView(view) {
            if (!IsReadableStreamBYOBRequest(this)) {
                throw byobRequestBrandCheckException('respondWithNewView');
            }
            assertRequiredArgument(view, 1, 'respondWithNewView');
            if (!ArrayBuffer.isView(view)) {
                throw new TypeError('You can only respond with array buffer views');
            }
            if (this._associatedReadableByteStreamController === undefined) {
                throw new TypeError('This BYOB request has been invalidated');
            }
            if (IsDetachedBuffer(view.buffer)) ;
            ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
        }
    }
    Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
        respond: { enumerable: true },
        respondWithNewView: { enumerable: true },
        view: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
            value: 'ReadableStreamBYOBRequest',
            configurable: true
        });
    }
    /**
     * Allows control of a {@link ReadableStream | readable byte stream}'s state and internal queue.
     *
     * @public
     */
    class ReadableByteStreamController {
        constructor() {
            throw new TypeError('Illegal constructor');
        }
        /**
         * Returns the current BYOB pull request, or `null` if there isn't one.
         */
        get byobRequest() {
            if (!IsReadableByteStreamController(this)) {
                throw byteStreamControllerBrandCheckException('byobRequest');
            }
            return ReadableByteStreamControllerGetBYOBRequest(this);
        }
        /**
         * Returns the desired size to fill the controlled stream's internal queue. It can be negative, if the queue is
         * over-full. An underlying byte source ought to use this information to determine when and how to apply backpressure.
         */
        get desiredSize() {
            if (!IsReadableByteStreamController(this)) {
                throw byteStreamControllerBrandCheckException('desiredSize');
            }
            return ReadableByteStreamControllerGetDesiredSize(this);
        }
        /**
         * Closes the controlled readable stream. Consumers will still be able to read any previously-enqueued chunks from
         * the stream, but once those are read, the stream will become closed.
         */
        close() {
            if (!IsReadableByteStreamController(this)) {
                throw byteStreamControllerBrandCheckException('close');
            }
            if (this._closeRequested) {
                throw new TypeError('The stream has already been closed; do not close it again!');
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== 'readable') {
                throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
            }
            ReadableByteStreamControllerClose(this);
        }
        enqueue(chunk) {
            if (!IsReadableByteStreamController(this)) {
                throw byteStreamControllerBrandCheckException('enqueue');
            }
            assertRequiredArgument(chunk, 1, 'enqueue');
            if (!ArrayBuffer.isView(chunk)) {
                throw new TypeError('chunk must be an array buffer view');
            }
            if (chunk.byteLength === 0) {
                throw new TypeError('chunk must have non-zero byteLength');
            }
            if (chunk.buffer.byteLength === 0) {
                throw new TypeError(`chunk's buffer must have non-zero byteLength`);
            }
            if (this._closeRequested) {
                throw new TypeError('stream is closed or draining');
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== 'readable') {
                throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
            }
            ReadableByteStreamControllerEnqueue(this, chunk);
        }
        /**
         * Errors the controlled readable stream, making all future interactions with it fail with the given error `e`.
         */
        error(e = undefined) {
            if (!IsReadableByteStreamController(this)) {
                throw byteStreamControllerBrandCheckException('error');
            }
            ReadableByteStreamControllerError(this, e);
        }
        /** @internal */
        [CancelSteps](reason) {
            ReadableByteStreamControllerClearPendingPullIntos(this);
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableByteStreamControllerClearAlgorithms(this);
            return result;
        }
        /** @internal */
        [PullSteps](readRequest) {
            const stream = this._controlledReadableByteStream;
            if (this._queueTotalSize > 0) {
                const entry = this._queue.shift();
                this._queueTotalSize -= entry.byteLength;
                ReadableByteStreamControllerHandleQueueDrain(this);
                const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
                readRequest._chunkSteps(view);
                return;
            }
            const autoAllocateChunkSize = this._autoAllocateChunkSize;
            if (autoAllocateChunkSize !== undefined) {
                let buffer;
                try {
                    buffer = new ArrayBuffer(autoAllocateChunkSize);
                }
                catch (bufferE) {
                    readRequest._errorSteps(bufferE);
                    return;
                }
                const pullIntoDescriptor = {
                    buffer,
                    bufferByteLength: autoAllocateChunkSize,
                    byteOffset: 0,
                    byteLength: autoAllocateChunkSize,
                    bytesFilled: 0,
                    elementSize: 1,
                    viewConstructor: Uint8Array,
                    readerType: 'default'
                };
                this._pendingPullIntos.push(pullIntoDescriptor);
            }
            ReadableStreamAddReadRequest(stream, readRequest);
            ReadableByteStreamControllerCallPullIfNeeded(this);
        }
    }
    Object.defineProperties(ReadableByteStreamController.prototype, {
        close: { enumerable: true },
        enqueue: { enumerable: true },
        error: { enumerable: true },
        byobRequest: { enumerable: true },
        desiredSize: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
            value: 'ReadableByteStreamController',
            configurable: true
        });
    }
    // Abstract operations for the ReadableByteStreamController.
    function IsReadableByteStreamController(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_controlledReadableByteStream')) {
            return false;
        }
        return x instanceof ReadableByteStreamController;
    }
    function IsReadableStreamBYOBRequest(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_associatedReadableByteStreamController')) {
            return false;
        }
        return x instanceof ReadableStreamBYOBRequest;
    }
    function ReadableByteStreamControllerCallPullIfNeeded(controller) {
        const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
        if (!shouldPull) {
            return;
        }
        if (controller._pulling) {
            controller._pullAgain = true;
            return;
        }
        controller._pulling = true;
        // TODO: Test controller argument
        const pullPromise = controller._pullAlgorithm();
        uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
                controller._pullAgain = false;
                ReadableByteStreamControllerCallPullIfNeeded(controller);
            }
        }, e => {
            ReadableByteStreamControllerError(controller, e);
        });
    }
    function ReadableByteStreamControllerClearPendingPullIntos(controller) {
        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
        controller._pendingPullIntos = new SimpleQueue();
    }
    function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
        let done = false;
        if (stream._state === 'closed') {
            done = true;
        }
        const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
        if (pullIntoDescriptor.readerType === 'default') {
            ReadableStreamFulfillReadRequest(stream, filledView, done);
        }
        else {
            ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
        }
    }
    function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
        const bytesFilled = pullIntoDescriptor.bytesFilled;
        const elementSize = pullIntoDescriptor.elementSize;
        return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
    }
    function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
        controller._queue.push({ buffer, byteOffset, byteLength });
        controller._queueTotalSize += byteLength;
    }
    function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
        const elementSize = pullIntoDescriptor.elementSize;
        const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
        const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
        const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
        const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
        let totalBytesToCopyRemaining = maxBytesToCopy;
        let ready = false;
        if (maxAlignedBytes > currentAlignedBytes) {
            totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
            ready = true;
        }
        const queue = controller._queue;
        while (totalBytesToCopyRemaining > 0) {
            const headOfQueue = queue.peek();
            const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
            const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
            if (headOfQueue.byteLength === bytesToCopy) {
                queue.shift();
            }
            else {
                headOfQueue.byteOffset += bytesToCopy;
                headOfQueue.byteLength -= bytesToCopy;
            }
            controller._queueTotalSize -= bytesToCopy;
            ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
            totalBytesToCopyRemaining -= bytesToCopy;
        }
        return ready;
    }
    function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
        pullIntoDescriptor.bytesFilled += size;
    }
    function ReadableByteStreamControllerHandleQueueDrain(controller) {
        if (controller._queueTotalSize === 0 && controller._closeRequested) {
            ReadableByteStreamControllerClearAlgorithms(controller);
            ReadableStreamClose(controller._controlledReadableByteStream);
        }
        else {
            ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
    }
    function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
        if (controller._byobRequest === null) {
            return;
        }
        controller._byobRequest._associatedReadableByteStreamController = undefined;
        controller._byobRequest._view = null;
        controller._byobRequest = null;
    }
    function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
        while (controller._pendingPullIntos.length > 0) {
            if (controller._queueTotalSize === 0) {
                return;
            }
            const pullIntoDescriptor = controller._pendingPullIntos.peek();
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
                ReadableByteStreamControllerShiftPendingPullInto(controller);
                ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
            }
        }
    }
    function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
        const stream = controller._controlledReadableByteStream;
        let elementSize = 1;
        if (view.constructor !== DataView) {
            elementSize = view.constructor.BYTES_PER_ELEMENT;
        }
        const ctor = view.constructor;
        // try {
        const buffer = TransferArrayBuffer(view.buffer);
        // } catch (e) {
        //   readIntoRequest._errorSteps(e);
        //   return;
        // }
        const pullIntoDescriptor = {
            buffer,
            bufferByteLength: buffer.byteLength,
            byteOffset: view.byteOffset,
            byteLength: view.byteLength,
            bytesFilled: 0,
            elementSize,
            viewConstructor: ctor,
            readerType: 'byob'
        };
        if (controller._pendingPullIntos.length > 0) {
            controller._pendingPullIntos.push(pullIntoDescriptor);
            // No ReadableByteStreamControllerCallPullIfNeeded() call since:
            // - No change happens on desiredSize
            // - The source has already been notified of that there's at least 1 pending read(view)
            ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
            return;
        }
        if (stream._state === 'closed') {
            const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
            readIntoRequest._closeSteps(emptyView);
            return;
        }
        if (controller._queueTotalSize > 0) {
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
                const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
                ReadableByteStreamControllerHandleQueueDrain(controller);
                readIntoRequest._chunkSteps(filledView);
                return;
            }
            if (controller._closeRequested) {
                const e = new TypeError('Insufficient bytes to fill elements in the given buffer');
                ReadableByteStreamControllerError(controller, e);
                readIntoRequest._errorSteps(e);
                return;
            }
        }
        controller._pendingPullIntos.push(pullIntoDescriptor);
        ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
        ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
        const stream = controller._controlledReadableByteStream;
        if (ReadableStreamHasBYOBReader(stream)) {
            while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
                const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
                ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
            }
        }
    }
    function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
        ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
        if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
            return;
        }
        ReadableByteStreamControllerShiftPendingPullInto(controller);
        const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
        if (remainderSize > 0) {
            const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
        }
        pullIntoDescriptor.bytesFilled -= remainderSize;
        ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
        ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
    }
    function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
        const firstDescriptor = controller._pendingPullIntos.peek();
        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
        const state = controller._controlledReadableByteStream._state;
        if (state === 'closed') {
            ReadableByteStreamControllerRespondInClosedState(controller);
        }
        else {
            ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
        }
        ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerShiftPendingPullInto(controller) {
        const descriptor = controller._pendingPullIntos.shift();
        return descriptor;
    }
    function ReadableByteStreamControllerShouldCallPull(controller) {
        const stream = controller._controlledReadableByteStream;
        if (stream._state !== 'readable') {
            return false;
        }
        if (controller._closeRequested) {
            return false;
        }
        if (!controller._started) {
            return false;
        }
        if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
        }
        if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
            return true;
        }
        const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
        if (desiredSize > 0) {
            return true;
        }
        return false;
    }
    function ReadableByteStreamControllerClearAlgorithms(controller) {
        controller._pullAlgorithm = undefined;
        controller._cancelAlgorithm = undefined;
    }
    // A client of ReadableByteStreamController may use these functions directly to bypass state check.
    function ReadableByteStreamControllerClose(controller) {
        const stream = controller._controlledReadableByteStream;
        if (controller._closeRequested || stream._state !== 'readable') {
            return;
        }
        if (controller._queueTotalSize > 0) {
            controller._closeRequested = true;
            return;
        }
        if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (firstPendingPullInto.bytesFilled > 0) {
                const e = new TypeError('Insufficient bytes to fill elements in the given buffer');
                ReadableByteStreamControllerError(controller, e);
                throw e;
            }
        }
        ReadableByteStreamControllerClearAlgorithms(controller);
        ReadableStreamClose(stream);
    }
    function ReadableByteStreamControllerEnqueue(controller, chunk) {
        const stream = controller._controlledReadableByteStream;
        if (controller._closeRequested || stream._state !== 'readable') {
            return;
        }
        const buffer = chunk.buffer;
        const byteOffset = chunk.byteOffset;
        const byteLength = chunk.byteLength;
        const transferredBuffer = TransferArrayBuffer(buffer);
        if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (IsDetachedBuffer(firstPendingPullInto.buffer)) ;
            firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
        }
        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
        if (ReadableStreamHasDefaultReader(stream)) {
            if (ReadableStreamGetNumReadRequests(stream) === 0) {
                ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            }
            else {
                if (controller._pendingPullIntos.length > 0) {
                    ReadableByteStreamControllerShiftPendingPullInto(controller);
                }
                const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
                ReadableStreamFulfillReadRequest(stream, transferredView, false);
            }
        }
        else if (ReadableStreamHasBYOBReader(stream)) {
            // TODO: Ideally in this branch detaching should happen only if the buffer is not consumed fully.
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
        }
        else {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
        }
        ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerError(controller, e) {
        const stream = controller._controlledReadableByteStream;
        if (stream._state !== 'readable') {
            return;
        }
        ReadableByteStreamControllerClearPendingPullIntos(controller);
        ResetQueue(controller);
        ReadableByteStreamControllerClearAlgorithms(controller);
        ReadableStreamError(stream, e);
    }
    function ReadableByteStreamControllerGetBYOBRequest(controller) {
        if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
            const firstDescriptor = controller._pendingPullIntos.peek();
            const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
            const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
            SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
            controller._byobRequest = byobRequest;
        }
        return controller._byobRequest;
    }
    function ReadableByteStreamControllerGetDesiredSize(controller) {
        const state = controller._controlledReadableByteStream._state;
        if (state === 'errored') {
            return null;
        }
        if (state === 'closed') {
            return 0;
        }
        return controller._strategyHWM - controller._queueTotalSize;
    }
    function ReadableByteStreamControllerRespond(controller, bytesWritten) {
        const firstDescriptor = controller._pendingPullIntos.peek();
        const state = controller._controlledReadableByteStream._state;
        if (state === 'closed') {
            if (bytesWritten !== 0) {
                throw new TypeError('bytesWritten must be 0 when calling respond() on a closed stream');
            }
        }
        else {
            if (bytesWritten === 0) {
                throw new TypeError('bytesWritten must be greater than 0 when calling respond() on a readable stream');
            }
            if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
                throw new RangeError('bytesWritten out of range');
            }
        }
        firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
        ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
    }
    function ReadableByteStreamControllerRespondWithNewView(controller, view) {
        const firstDescriptor = controller._pendingPullIntos.peek();
        const state = controller._controlledReadableByteStream._state;
        if (state === 'closed') {
            if (view.byteLength !== 0) {
                throw new TypeError('The view\'s length must be 0 when calling respondWithNewView() on a closed stream');
            }
        }
        else {
            if (view.byteLength === 0) {
                throw new TypeError('The view\'s length must be greater than 0 when calling respondWithNewView() on a readable stream');
            }
        }
        if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
            throw new RangeError('The region specified by view does not match byobRequest');
        }
        if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
            throw new RangeError('The buffer of view has different capacity than byobRequest');
        }
        if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
            throw new RangeError('The region specified by view is larger than byobRequest');
        }
        const viewByteLength = view.byteLength;
        firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
        ReadableByteStreamControllerRespondInternal(controller, viewByteLength);
    }
    function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
        controller._controlledReadableByteStream = stream;
        controller._pullAgain = false;
        controller._pulling = false;
        controller._byobRequest = null;
        // Need to set the slots so that the assert doesn't fire. In the spec the slots already exist implicitly.
        controller._queue = controller._queueTotalSize = undefined;
        ResetQueue(controller);
        controller._closeRequested = false;
        controller._started = false;
        controller._strategyHWM = highWaterMark;
        controller._pullAlgorithm = pullAlgorithm;
        controller._cancelAlgorithm = cancelAlgorithm;
        controller._autoAllocateChunkSize = autoAllocateChunkSize;
        controller._pendingPullIntos = new SimpleQueue();
        stream._readableStreamController = controller;
        const startResult = startAlgorithm();
        uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableByteStreamControllerCallPullIfNeeded(controller);
        }, r => {
            ReadableByteStreamControllerError(controller, r);
        });
    }
    function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
        const controller = Object.create(ReadableByteStreamController.prototype);
        let startAlgorithm = () => undefined;
        let pullAlgorithm = () => promiseResolvedWith(undefined);
        let cancelAlgorithm = () => promiseResolvedWith(undefined);
        if (underlyingByteSource.start !== undefined) {
            startAlgorithm = () => underlyingByteSource.start(controller);
        }
        if (underlyingByteSource.pull !== undefined) {
            pullAlgorithm = () => underlyingByteSource.pull(controller);
        }
        if (underlyingByteSource.cancel !== undefined) {
            cancelAlgorithm = reason => underlyingByteSource.cancel(reason);
        }
        const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
        if (autoAllocateChunkSize === 0) {
            throw new TypeError('autoAllocateChunkSize must be greater than 0');
        }
        SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
    }
    function SetUpReadableStreamBYOBRequest(request, controller, view) {
        request._associatedReadableByteStreamController = controller;
        request._view = view;
    }
    // Helper functions for the ReadableStreamBYOBRequest.
    function byobRequestBrandCheckException(name) {
        return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
    }
    // Helper functions for the ReadableByteStreamController.
    function byteStreamControllerBrandCheckException(name) {
        return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
    }

    // Abstract operations for the ReadableStream.
    function AcquireReadableStreamBYOBReader(stream) {
        return new ReadableStreamBYOBReader(stream);
    }
    // ReadableStream API exposed for controllers.
    function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
        stream._reader._readIntoRequests.push(readIntoRequest);
    }
    function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
        const reader = stream._reader;
        const readIntoRequest = reader._readIntoRequests.shift();
        if (done) {
            readIntoRequest._closeSteps(chunk);
        }
        else {
            readIntoRequest._chunkSteps(chunk);
        }
    }
    function ReadableStreamGetNumReadIntoRequests(stream) {
        return stream._reader._readIntoRequests.length;
    }
    function ReadableStreamHasBYOBReader(stream) {
        const reader = stream._reader;
        if (reader === undefined) {
            return false;
        }
        if (!IsReadableStreamBYOBReader(reader)) {
            return false;
        }
        return true;
    }
    /**
     * A BYOB reader vended by a {@link ReadableStream}.
     *
     * @public
     */
    class ReadableStreamBYOBReader {
        constructor(stream) {
            assertRequiredArgument(stream, 1, 'ReadableStreamBYOBReader');
            assertReadableStream(stream, 'First parameter');
            if (IsReadableStreamLocked(stream)) {
                throw new TypeError('This stream has already been locked for exclusive reading by another reader');
            }
            if (!IsReadableByteStreamController(stream._readableStreamController)) {
                throw new TypeError('Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte ' +
                    'source');
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readIntoRequests = new SimpleQueue();
        }
        /**
         * Returns a promise that will be fulfilled when the stream becomes closed, or rejected if the stream ever errors or
         * the reader's lock is released before the stream finishes closing.
         */
        get closed() {
            if (!IsReadableStreamBYOBReader(this)) {
                return promiseRejectedWith(byobReaderBrandCheckException('closed'));
            }
            return this._closedPromise;
        }
        /**
         * If the reader is active, behaves the same as {@link ReadableStream.cancel | stream.cancel(reason)}.
         */
        cancel(reason = undefined) {
            if (!IsReadableStreamBYOBReader(this)) {
                return promiseRejectedWith(byobReaderBrandCheckException('cancel'));
            }
            if (this._ownerReadableStream === undefined) {
                return promiseRejectedWith(readerLockException('cancel'));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
        }
        /**
         * Attempts to reads bytes into view, and returns a promise resolved with the result.
         *
         * If reading a chunk causes the queue to become empty, more data will be pulled from the underlying source.
         */
        read(view) {
            if (!IsReadableStreamBYOBReader(this)) {
                return promiseRejectedWith(byobReaderBrandCheckException('read'));
            }
            if (!ArrayBuffer.isView(view)) {
                return promiseRejectedWith(new TypeError('view must be an array buffer view'));
            }
            if (view.byteLength === 0) {
                return promiseRejectedWith(new TypeError('view must have non-zero byteLength'));
            }
            if (view.buffer.byteLength === 0) {
                return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
            }
            if (IsDetachedBuffer(view.buffer)) ;
            if (this._ownerReadableStream === undefined) {
                return promiseRejectedWith(readerLockException('read from'));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve, reject) => {
                resolvePromise = resolve;
                rejectPromise = reject;
            });
            const readIntoRequest = {
                _chunkSteps: chunk => resolvePromise({ value: chunk, done: false }),
                _closeSteps: chunk => resolvePromise({ value: chunk, done: true }),
                _errorSteps: e => rejectPromise(e)
            };
            ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
            return promise;
        }
        /**
         * Releases the reader's lock on the corresponding stream. After the lock is released, the reader is no longer active.
         * If the associated stream is errored when the lock is released, the reader will appear errored in the same way
         * from now on; otherwise, the reader will appear closed.
         *
         * A reader's lock cannot be released while it still has a pending read request, i.e., if a promise returned by
         * the reader's {@link ReadableStreamBYOBReader.read | read()} method has not yet been settled. Attempting to
         * do so will throw a `TypeError` and leave the reader locked to the stream.
         */
        releaseLock() {
            if (!IsReadableStreamBYOBReader(this)) {
                throw byobReaderBrandCheckException('releaseLock');
            }
            if (this._ownerReadableStream === undefined) {
                return;
            }
            if (this._readIntoRequests.length > 0) {
                throw new TypeError('Tried to release a reader lock when that reader has pending read() calls un-settled');
            }
            ReadableStreamReaderGenericRelease(this);
        }
    }
    Object.defineProperties(ReadableStreamBYOBReader.prototype, {
        cancel: { enumerable: true },
        read: { enumerable: true },
        releaseLock: { enumerable: true },
        closed: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
            value: 'ReadableStreamBYOBReader',
            configurable: true
        });
    }
    // Abstract operations for the readers.
    function IsReadableStreamBYOBReader(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_readIntoRequests')) {
            return false;
        }
        return x instanceof ReadableStreamBYOBReader;
    }
    function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
        const stream = reader._ownerReadableStream;
        stream._disturbed = true;
        if (stream._state === 'errored') {
            readIntoRequest._errorSteps(stream._storedError);
        }
        else {
            ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
        }
    }
    // Helper functions for the ReadableStreamBYOBReader.
    function byobReaderBrandCheckException(name) {
        return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
    }

    function ExtractHighWaterMark(strategy, defaultHWM) {
        const { highWaterMark } = strategy;
        if (highWaterMark === undefined) {
            return defaultHWM;
        }
        if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
            throw new RangeError('Invalid highWaterMark');
        }
        return highWaterMark;
    }
    function ExtractSizeAlgorithm(strategy) {
        const { size } = strategy;
        if (!size) {
            return () => 1;
        }
        return size;
    }

    function convertQueuingStrategy(init, context) {
        assertDictionary(init, context);
        const highWaterMark = init === null || init === void 0 ? void 0 : init.highWaterMark;
        const size = init === null || init === void 0 ? void 0 : init.size;
        return {
            highWaterMark: highWaterMark === undefined ? undefined : convertUnrestrictedDouble(highWaterMark),
            size: size === undefined ? undefined : convertQueuingStrategySize(size, `${context} has member 'size' that`)
        };
    }
    function convertQueuingStrategySize(fn, context) {
        assertFunction(fn, context);
        return chunk => convertUnrestrictedDouble(fn(chunk));
    }

    function convertUnderlyingSink(original, context) {
        assertDictionary(original, context);
        const abort = original === null || original === void 0 ? void 0 : original.abort;
        const close = original === null || original === void 0 ? void 0 : original.close;
        const start = original === null || original === void 0 ? void 0 : original.start;
        const type = original === null || original === void 0 ? void 0 : original.type;
        const write = original === null || original === void 0 ? void 0 : original.write;
        return {
            abort: abort === undefined ?
                undefined :
                convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
            close: close === undefined ?
                undefined :
                convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
            start: start === undefined ?
                undefined :
                convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
            write: write === undefined ?
                undefined :
                convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
            type
        };
    }
    function convertUnderlyingSinkAbortCallback(fn, original, context) {
        assertFunction(fn, context);
        return (reason) => promiseCall(fn, original, [reason]);
    }
    function convertUnderlyingSinkCloseCallback(fn, original, context) {
        assertFunction(fn, context);
        return () => promiseCall(fn, original, []);
    }
    function convertUnderlyingSinkStartCallback(fn, original, context) {
        assertFunction(fn, context);
        return (controller) => reflectCall(fn, original, [controller]);
    }
    function convertUnderlyingSinkWriteCallback(fn, original, context) {
        assertFunction(fn, context);
        return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
    }

    function assertWritableStream(x, context) {
        if (!IsWritableStream(x)) {
            throw new TypeError(`${context} is not a WritableStream.`);
        }
    }

    function isAbortSignal(value) {
        if (typeof value !== 'object' || value === null) {
            return false;
        }
        try {
            return typeof value.aborted === 'boolean';
        }
        catch (_a) {
            // AbortSignal.prototype.aborted throws if its brand check fails
            return false;
        }
    }
    const supportsAbortController = typeof AbortController === 'function';
    /**
     * Construct a new AbortController, if supported by the platform.
     *
     * @internal
     */
    function createAbortController() {
        if (supportsAbortController) {
            return new AbortController();
        }
        return undefined;
    }

    /**
     * A writable stream represents a destination for data, into which you can write.
     *
     * @public
     */
    class WritableStream {
        constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
            if (rawUnderlyingSink === undefined) {
                rawUnderlyingSink = null;
            }
            else {
                assertObject(rawUnderlyingSink, 'First parameter');
            }
            const strategy = convertQueuingStrategy(rawStrategy, 'Second parameter');
            const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, 'First parameter');
            InitializeWritableStream(this);
            const type = underlyingSink.type;
            if (type !== undefined) {
                throw new RangeError('Invalid type is specified');
            }
            const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
            const highWaterMark = ExtractHighWaterMark(strategy, 1);
            SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
        }
        /**
         * Returns whether or not the writable stream is locked to a writer.
         */
        get locked() {
            if (!IsWritableStream(this)) {
                throw streamBrandCheckException$2('locked');
            }
            return IsWritableStreamLocked(this);
        }
        /**
         * Aborts the stream, signaling that the producer can no longer successfully write to the stream and it is to be
         * immediately moved to an errored state, with any queued-up writes discarded. This will also execute any abort
         * mechanism of the underlying sink.
         *
         * The returned promise will fulfill if the stream shuts down successfully, or reject if the underlying sink signaled
         * that there was an error doing so. Additionally, it will reject with a `TypeError` (without attempting to cancel
         * the stream) if the stream is currently locked.
         */
        abort(reason = undefined) {
            if (!IsWritableStream(this)) {
                return promiseRejectedWith(streamBrandCheckException$2('abort'));
            }
            if (IsWritableStreamLocked(this)) {
                return promiseRejectedWith(new TypeError('Cannot abort a stream that already has a writer'));
            }
            return WritableStreamAbort(this, reason);
        }
        /**
         * Closes the stream. The underlying sink will finish processing any previously-written chunks, before invoking its
         * close behavior. During this time any further attempts to write will fail (without erroring the stream).
         *
         * The method returns a promise that will fulfill if all remaining chunks are successfully written and the stream
         * successfully closes, or rejects if an error is encountered during this process. Additionally, it will reject with
         * a `TypeError` (without attempting to cancel the stream) if the stream is currently locked.
         */
        close() {
            if (!IsWritableStream(this)) {
                return promiseRejectedWith(streamBrandCheckException$2('close'));
            }
            if (IsWritableStreamLocked(this)) {
                return promiseRejectedWith(new TypeError('Cannot close a stream that already has a writer'));
            }
            if (WritableStreamCloseQueuedOrInFlight(this)) {
                return promiseRejectedWith(new TypeError('Cannot close an already-closing stream'));
            }
            return WritableStreamClose(this);
        }
        /**
         * Creates a {@link WritableStreamDefaultWriter | writer} and locks the stream to the new writer. While the stream
         * is locked, no other writer can be acquired until this one is released.
         *
         * This functionality is especially useful for creating abstractions that desire the ability to write to a stream
         * without interruption or interleaving. By getting a writer for the stream, you can ensure nobody else can write at
         * the same time, which would cause the resulting written data to be unpredictable and probably useless.
         */
        getWriter() {
            if (!IsWritableStream(this)) {
                throw streamBrandCheckException$2('getWriter');
            }
            return AcquireWritableStreamDefaultWriter(this);
        }
    }
    Object.defineProperties(WritableStream.prototype, {
        abort: { enumerable: true },
        close: { enumerable: true },
        getWriter: { enumerable: true },
        locked: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
            value: 'WritableStream',
            configurable: true
        });
    }
    // Abstract operations for the WritableStream.
    function AcquireWritableStreamDefaultWriter(stream) {
        return new WritableStreamDefaultWriter(stream);
    }
    // Throws if and only if startAlgorithm throws.
    function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
        const stream = Object.create(WritableStream.prototype);
        InitializeWritableStream(stream);
        const controller = Object.create(WritableStreamDefaultController.prototype);
        SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
        return stream;
    }
    function InitializeWritableStream(stream) {
        stream._state = 'writable';
        // The error that will be reported by new method calls once the state becomes errored. Only set when [[state]] is
        // 'erroring' or 'errored'. May be set to an undefined value.
        stream._storedError = undefined;
        stream._writer = undefined;
        // Initialize to undefined first because the constructor of the controller checks this
        // variable to validate the caller.
        stream._writableStreamController = undefined;
        // This queue is placed here instead of the writer class in order to allow for passing a writer to the next data
        // producer without waiting for the queued writes to finish.
        stream._writeRequests = new SimpleQueue();
        // Write requests are removed from _writeRequests when write() is called on the underlying sink. This prevents
        // them from being erroneously rejected on error. If a write() call is in-flight, the request is stored here.
        stream._inFlightWriteRequest = undefined;
        // The promise that was returned from writer.close(). Stored here because it may be fulfilled after the writer
        // has been detached.
        stream._closeRequest = undefined;
        // Close request is removed from _closeRequest when close() is called on the underlying sink. This prevents it
        // from being erroneously rejected on error. If a close() call is in-flight, the request is stored here.
        stream._inFlightCloseRequest = undefined;
        // The promise that was returned from writer.abort(). This may also be fulfilled after the writer has detached.
        stream._pendingAbortRequest = undefined;
        // The backpressure signal set by the controller.
        stream._backpressure = false;
    }
    function IsWritableStream(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_writableStreamController')) {
            return false;
        }
        return x instanceof WritableStream;
    }
    function IsWritableStreamLocked(stream) {
        if (stream._writer === undefined) {
            return false;
        }
        return true;
    }
    function WritableStreamAbort(stream, reason) {
        var _a;
        if (stream._state === 'closed' || stream._state === 'errored') {
            return promiseResolvedWith(undefined);
        }
        stream._writableStreamController._abortReason = reason;
        (_a = stream._writableStreamController._abortController) === null || _a === void 0 ? void 0 : _a.abort();
        // TypeScript narrows the type of `stream._state` down to 'writable' | 'erroring',
        // but it doesn't know that signaling abort runs author code that might have changed the state.
        // Widen the type again by casting to WritableStreamState.
        const state = stream._state;
        if (state === 'closed' || state === 'errored') {
            return promiseResolvedWith(undefined);
        }
        if (stream._pendingAbortRequest !== undefined) {
            return stream._pendingAbortRequest._promise;
        }
        let wasAlreadyErroring = false;
        if (state === 'erroring') {
            wasAlreadyErroring = true;
            // reason will not be used, so don't keep a reference to it.
            reason = undefined;
        }
        const promise = newPromise((resolve, reject) => {
            stream._pendingAbortRequest = {
                _promise: undefined,
                _resolve: resolve,
                _reject: reject,
                _reason: reason,
                _wasAlreadyErroring: wasAlreadyErroring
            };
        });
        stream._pendingAbortRequest._promise = promise;
        if (!wasAlreadyErroring) {
            WritableStreamStartErroring(stream, reason);
        }
        return promise;
    }
    function WritableStreamClose(stream) {
        const state = stream._state;
        if (state === 'closed' || state === 'errored') {
            return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
        }
        const promise = newPromise((resolve, reject) => {
            const closeRequest = {
                _resolve: resolve,
                _reject: reject
            };
            stream._closeRequest = closeRequest;
        });
        const writer = stream._writer;
        if (writer !== undefined && stream._backpressure && state === 'writable') {
            defaultWriterReadyPromiseResolve(writer);
        }
        WritableStreamDefaultControllerClose(stream._writableStreamController);
        return promise;
    }
    // WritableStream API exposed for controllers.
    function WritableStreamAddWriteRequest(stream) {
        const promise = newPromise((resolve, reject) => {
            const writeRequest = {
                _resolve: resolve,
                _reject: reject
            };
            stream._writeRequests.push(writeRequest);
        });
        return promise;
    }
    function WritableStreamDealWithRejection(stream, error) {
        const state = stream._state;
        if (state === 'writable') {
            WritableStreamStartErroring(stream, error);
            return;
        }
        WritableStreamFinishErroring(stream);
    }
    function WritableStreamStartErroring(stream, reason) {
        const controller = stream._writableStreamController;
        stream._state = 'erroring';
        stream._storedError = reason;
        const writer = stream._writer;
        if (writer !== undefined) {
            WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
        }
        if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
            WritableStreamFinishErroring(stream);
        }
    }
    function WritableStreamFinishErroring(stream) {
        stream._state = 'errored';
        stream._writableStreamController[ErrorSteps]();
        const storedError = stream._storedError;
        stream._writeRequests.forEach(writeRequest => {
            writeRequest._reject(storedError);
        });
        stream._writeRequests = new SimpleQueue();
        if (stream._pendingAbortRequest === undefined) {
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
        }
        const abortRequest = stream._pendingAbortRequest;
        stream._pendingAbortRequest = undefined;
        if (abortRequest._wasAlreadyErroring) {
            abortRequest._reject(storedError);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
        }
        const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
        uponPromise(promise, () => {
            abortRequest._resolve();
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        }, (reason) => {
            abortRequest._reject(reason);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        });
    }
    function WritableStreamFinishInFlightWrite(stream) {
        stream._inFlightWriteRequest._resolve(undefined);
        stream._inFlightWriteRequest = undefined;
    }
    function WritableStreamFinishInFlightWriteWithError(stream, error) {
        stream._inFlightWriteRequest._reject(error);
        stream._inFlightWriteRequest = undefined;
        WritableStreamDealWithRejection(stream, error);
    }
    function WritableStreamFinishInFlightClose(stream) {
        stream._inFlightCloseRequest._resolve(undefined);
        stream._inFlightCloseRequest = undefined;
        const state = stream._state;
        if (state === 'erroring') {
            // The error was too late to do anything, so it is ignored.
            stream._storedError = undefined;
            if (stream._pendingAbortRequest !== undefined) {
                stream._pendingAbortRequest._resolve();
                stream._pendingAbortRequest = undefined;
            }
        }
        stream._state = 'closed';
        const writer = stream._writer;
        if (writer !== undefined) {
            defaultWriterClosedPromiseResolve(writer);
        }
    }
    function WritableStreamFinishInFlightCloseWithError(stream, error) {
        stream._inFlightCloseRequest._reject(error);
        stream._inFlightCloseRequest = undefined;
        // Never execute sink abort() after sink close().
        if (stream._pendingAbortRequest !== undefined) {
            stream._pendingAbortRequest._reject(error);
            stream._pendingAbortRequest = undefined;
        }
        WritableStreamDealWithRejection(stream, error);
    }
    // TODO(ricea): Fix alphabetical order.
    function WritableStreamCloseQueuedOrInFlight(stream) {
        if (stream._closeRequest === undefined && stream._inFlightCloseRequest === undefined) {
            return false;
        }
        return true;
    }
    function WritableStreamHasOperationMarkedInFlight(stream) {
        if (stream._inFlightWriteRequest === undefined && stream._inFlightCloseRequest === undefined) {
            return false;
        }
        return true;
    }
    function WritableStreamMarkCloseRequestInFlight(stream) {
        stream._inFlightCloseRequest = stream._closeRequest;
        stream._closeRequest = undefined;
    }
    function WritableStreamMarkFirstWriteRequestInFlight(stream) {
        stream._inFlightWriteRequest = stream._writeRequests.shift();
    }
    function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
        if (stream._closeRequest !== undefined) {
            stream._closeRequest._reject(stream._storedError);
            stream._closeRequest = undefined;
        }
        const writer = stream._writer;
        if (writer !== undefined) {
            defaultWriterClosedPromiseReject(writer, stream._storedError);
        }
    }
    function WritableStreamUpdateBackpressure(stream, backpressure) {
        const writer = stream._writer;
        if (writer !== undefined && backpressure !== stream._backpressure) {
            if (backpressure) {
                defaultWriterReadyPromiseReset(writer);
            }
            else {
                defaultWriterReadyPromiseResolve(writer);
            }
        }
        stream._backpressure = backpressure;
    }
    /**
     * A default writer vended by a {@link WritableStream}.
     *
     * @public
     */
    class WritableStreamDefaultWriter {
        constructor(stream) {
            assertRequiredArgument(stream, 1, 'WritableStreamDefaultWriter');
            assertWritableStream(stream, 'First parameter');
            if (IsWritableStreamLocked(stream)) {
                throw new TypeError('This stream has already been locked for exclusive writing by another writer');
            }
            this._ownerWritableStream = stream;
            stream._writer = this;
            const state = stream._state;
            if (state === 'writable') {
                if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
                    defaultWriterReadyPromiseInitialize(this);
                }
                else {
                    defaultWriterReadyPromiseInitializeAsResolved(this);
                }
                defaultWriterClosedPromiseInitialize(this);
            }
            else if (state === 'erroring') {
                defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
                defaultWriterClosedPromiseInitialize(this);
            }
            else if (state === 'closed') {
                defaultWriterReadyPromiseInitializeAsResolved(this);
                defaultWriterClosedPromiseInitializeAsResolved(this);
            }
            else {
                const storedError = stream._storedError;
                defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
                defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
            }
        }
        /**
         * Returns a promise that will be fulfilled when the stream becomes closed, or rejected if the stream ever errors or
         * the writer’s lock is released before the stream finishes closing.
         */
        get closed() {
            if (!IsWritableStreamDefaultWriter(this)) {
                return promiseRejectedWith(defaultWriterBrandCheckException('closed'));
            }
            return this._closedPromise;
        }
        /**
         * Returns the desired size to fill the stream’s internal queue. It can be negative, if the queue is over-full.
         * A producer can use this information to determine the right amount of data to write.
         *
         * It will be `null` if the stream cannot be successfully written to (due to either being errored, or having an abort
         * queued up). It will return zero if the stream is closed. And the getter will throw an exception if invoked when
         * the writer’s lock is released.
         */
        get desiredSize() {
            if (!IsWritableStreamDefaultWriter(this)) {
                throw defaultWriterBrandCheckException('desiredSize');
            }
            if (this._ownerWritableStream === undefined) {
                throw defaultWriterLockException('desiredSize');
            }
            return WritableStreamDefaultWriterGetDesiredSize(this);
        }
        /**
         * Returns a promise that will be fulfilled when the desired size to fill the stream’s internal queue transitions
         * from non-positive to positive, signaling that it is no longer applying backpressure. Once the desired size dips
         * back to zero or below, the getter will return a new promise that stays pending until the next transition.
         *
         * If the stream becomes errored or aborted, or the writer’s lock is released, the returned promise will become
         * rejected.
         */
        get ready() {
            if (!IsWritableStreamDefaultWriter(this)) {
                return promiseRejectedWith(defaultWriterBrandCheckException('ready'));
            }
            return this._readyPromise;
        }
        /**
         * If the reader is active, behaves the same as {@link WritableStream.abort | stream.abort(reason)}.
         */
        abort(reason = undefined) {
            if (!IsWritableStreamDefaultWriter(this)) {
                return promiseRejectedWith(defaultWriterBrandCheckException('abort'));
            }
            if (this._ownerWritableStream === undefined) {
                return promiseRejectedWith(defaultWriterLockException('abort'));
            }
            return WritableStreamDefaultWriterAbort(this, reason);
        }
        /**
         * If the reader is active, behaves the same as {@link WritableStream.close | stream.close()}.
         */
        close() {
            if (!IsWritableStreamDefaultWriter(this)) {
                return promiseRejectedWith(defaultWriterBrandCheckException('close'));
            }
            const stream = this._ownerWritableStream;
            if (stream === undefined) {
                return promiseRejectedWith(defaultWriterLockException('close'));
            }
            if (WritableStreamCloseQueuedOrInFlight(stream)) {
                return promiseRejectedWith(new TypeError('Cannot close an already-closing stream'));
            }
            return WritableStreamDefaultWriterClose(this);
        }
        /**
         * Releases the writer’s lock on the corresponding stream. After the lock is released, the writer is no longer active.
         * If the associated stream is errored when the lock is released, the writer will appear errored in the same way from
         * now on; otherwise, the writer will appear closed.
         *
         * Note that the lock can still be released even if some ongoing writes have not yet finished (i.e. even if the
         * promises returned from previous calls to {@link WritableStreamDefaultWriter.write | write()} have not yet settled).
         * It’s not necessary to hold the lock on the writer for the duration of the write; the lock instead simply prevents
         * other producers from writing in an interleaved manner.
         */
        releaseLock() {
            if (!IsWritableStreamDefaultWriter(this)) {
                throw defaultWriterBrandCheckException('releaseLock');
            }
            const stream = this._ownerWritableStream;
            if (stream === undefined) {
                return;
            }
            WritableStreamDefaultWriterRelease(this);
        }
        write(chunk = undefined) {
            if (!IsWritableStreamDefaultWriter(this)) {
                return promiseRejectedWith(defaultWriterBrandCheckException('write'));
            }
            if (this._ownerWritableStream === undefined) {
                return promiseRejectedWith(defaultWriterLockException('write to'));
            }
            return WritableStreamDefaultWriterWrite(this, chunk);
        }
    }
    Object.defineProperties(WritableStreamDefaultWriter.prototype, {
        abort: { enumerable: true },
        close: { enumerable: true },
        releaseLock: { enumerable: true },
        write: { enumerable: true },
        closed: { enumerable: true },
        desiredSize: { enumerable: true },
        ready: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
            value: 'WritableStreamDefaultWriter',
            configurable: true
        });
    }
    // Abstract operations for the WritableStreamDefaultWriter.
    function IsWritableStreamDefaultWriter(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_ownerWritableStream')) {
            return false;
        }
        return x instanceof WritableStreamDefaultWriter;
    }
    // A client of WritableStreamDefaultWriter may use these functions directly to bypass state check.
    function WritableStreamDefaultWriterAbort(writer, reason) {
        const stream = writer._ownerWritableStream;
        return WritableStreamAbort(stream, reason);
    }
    function WritableStreamDefaultWriterClose(writer) {
        const stream = writer._ownerWritableStream;
        return WritableStreamClose(stream);
    }
    function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
        const stream = writer._ownerWritableStream;
        const state = stream._state;
        if (WritableStreamCloseQueuedOrInFlight(stream) || state === 'closed') {
            return promiseResolvedWith(undefined);
        }
        if (state === 'errored') {
            return promiseRejectedWith(stream._storedError);
        }
        return WritableStreamDefaultWriterClose(writer);
    }
    function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error) {
        if (writer._closedPromiseState === 'pending') {
            defaultWriterClosedPromiseReject(writer, error);
        }
        else {
            defaultWriterClosedPromiseResetToRejected(writer, error);
        }
    }
    function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error) {
        if (writer._readyPromiseState === 'pending') {
            defaultWriterReadyPromiseReject(writer, error);
        }
        else {
            defaultWriterReadyPromiseResetToRejected(writer, error);
        }
    }
    function WritableStreamDefaultWriterGetDesiredSize(writer) {
        const stream = writer._ownerWritableStream;
        const state = stream._state;
        if (state === 'errored' || state === 'erroring') {
            return null;
        }
        if (state === 'closed') {
            return 0;
        }
        return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
    }
    function WritableStreamDefaultWriterRelease(writer) {
        const stream = writer._ownerWritableStream;
        const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
        WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
        // The state transitions to "errored" before the sink abort() method runs, but the writer.closed promise is not
        // rejected until afterwards. This means that simply testing state will not work.
        WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
        stream._writer = undefined;
        writer._ownerWritableStream = undefined;
    }
    function WritableStreamDefaultWriterWrite(writer, chunk) {
        const stream = writer._ownerWritableStream;
        const controller = stream._writableStreamController;
        const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
        if (stream !== writer._ownerWritableStream) {
            return promiseRejectedWith(defaultWriterLockException('write to'));
        }
        const state = stream._state;
        if (state === 'errored') {
            return promiseRejectedWith(stream._storedError);
        }
        if (WritableStreamCloseQueuedOrInFlight(stream) || state === 'closed') {
            return promiseRejectedWith(new TypeError('The stream is closing or closed and cannot be written to'));
        }
        if (state === 'erroring') {
            return promiseRejectedWith(stream._storedError);
        }
        const promise = WritableStreamAddWriteRequest(stream);
        WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
        return promise;
    }
    const closeSentinel = {};
    /**
     * Allows control of a {@link WritableStream | writable stream}'s state and internal queue.
     *
     * @public
     */
    class WritableStreamDefaultController {
        constructor() {
            throw new TypeError('Illegal constructor');
        }
        /**
         * The reason which was passed to `WritableStream.abort(reason)` when the stream was aborted.
         *
         * @deprecated
         *  This property has been removed from the specification, see https://github.com/whatwg/streams/pull/1177.
         *  Use {@link WritableStreamDefaultController.signal}'s `reason` instead.
         */
        get abortReason() {
            if (!IsWritableStreamDefaultController(this)) {
                throw defaultControllerBrandCheckException$2('abortReason');
            }
            return this._abortReason;
        }
        /**
         * An `AbortSignal` that can be used to abort the pending write or close operation when the stream is aborted.
         */
        get signal() {
            if (!IsWritableStreamDefaultController(this)) {
                throw defaultControllerBrandCheckException$2('signal');
            }
            if (this._abortController === undefined) {
                // Older browsers or older Node versions may not support `AbortController` or `AbortSignal`.
                // We don't want to bundle and ship an `AbortController` polyfill together with our polyfill,
                // so instead we only implement support for `signal` if we find a global `AbortController` constructor.
                throw new TypeError('WritableStreamDefaultController.prototype.signal is not supported');
            }
            return this._abortController.signal;
        }
        /**
         * Closes the controlled writable stream, making all future interactions with it fail with the given error `e`.
         *
         * This method is rarely used, since usually it suffices to return a rejected promise from one of the underlying
         * sink's methods. However, it can be useful for suddenly shutting down a stream in response to an event outside the
         * normal lifecycle of interactions with the underlying sink.
         */
        error(e = undefined) {
            if (!IsWritableStreamDefaultController(this)) {
                throw defaultControllerBrandCheckException$2('error');
            }
            const state = this._controlledWritableStream._state;
            if (state !== 'writable') {
                // The stream is closed, errored or will be soon. The sink can't do anything useful if it gets an error here, so
                // just treat it as a no-op.
                return;
            }
            WritableStreamDefaultControllerError(this, e);
        }
        /** @internal */
        [AbortSteps](reason) {
            const result = this._abortAlgorithm(reason);
            WritableStreamDefaultControllerClearAlgorithms(this);
            return result;
        }
        /** @internal */
        [ErrorSteps]() {
            ResetQueue(this);
        }
    }
    Object.defineProperties(WritableStreamDefaultController.prototype, {
        abortReason: { enumerable: true },
        signal: { enumerable: true },
        error: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: 'WritableStreamDefaultController',
            configurable: true
        });
    }
    // Abstract operations implementing interface required by the WritableStream.
    function IsWritableStreamDefaultController(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_controlledWritableStream')) {
            return false;
        }
        return x instanceof WritableStreamDefaultController;
    }
    function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
        controller._controlledWritableStream = stream;
        stream._writableStreamController = controller;
        // Need to set the slots so that the assert doesn't fire. In the spec the slots already exist implicitly.
        controller._queue = undefined;
        controller._queueTotalSize = undefined;
        ResetQueue(controller);
        controller._abortReason = undefined;
        controller._abortController = createAbortController();
        controller._started = false;
        controller._strategySizeAlgorithm = sizeAlgorithm;
        controller._strategyHWM = highWaterMark;
        controller._writeAlgorithm = writeAlgorithm;
        controller._closeAlgorithm = closeAlgorithm;
        controller._abortAlgorithm = abortAlgorithm;
        const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
        WritableStreamUpdateBackpressure(stream, backpressure);
        const startResult = startAlgorithm();
        const startPromise = promiseResolvedWith(startResult);
        uponPromise(startPromise, () => {
            controller._started = true;
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }, r => {
            controller._started = true;
            WritableStreamDealWithRejection(stream, r);
        });
    }
    function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
        const controller = Object.create(WritableStreamDefaultController.prototype);
        let startAlgorithm = () => undefined;
        let writeAlgorithm = () => promiseResolvedWith(undefined);
        let closeAlgorithm = () => promiseResolvedWith(undefined);
        let abortAlgorithm = () => promiseResolvedWith(undefined);
        if (underlyingSink.start !== undefined) {
            startAlgorithm = () => underlyingSink.start(controller);
        }
        if (underlyingSink.write !== undefined) {
            writeAlgorithm = chunk => underlyingSink.write(chunk, controller);
        }
        if (underlyingSink.close !== undefined) {
            closeAlgorithm = () => underlyingSink.close();
        }
        if (underlyingSink.abort !== undefined) {
            abortAlgorithm = reason => underlyingSink.abort(reason);
        }
        SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
    }
    // ClearAlgorithms may be called twice. Erroring the same stream in multiple ways will often result in redundant calls.
    function WritableStreamDefaultControllerClearAlgorithms(controller) {
        controller._writeAlgorithm = undefined;
        controller._closeAlgorithm = undefined;
        controller._abortAlgorithm = undefined;
        controller._strategySizeAlgorithm = undefined;
    }
    function WritableStreamDefaultControllerClose(controller) {
        EnqueueValueWithSize(controller, closeSentinel, 0);
        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
    }
    function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
        try {
            return controller._strategySizeAlgorithm(chunk);
        }
        catch (chunkSizeE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
            return 1;
        }
    }
    function WritableStreamDefaultControllerGetDesiredSize(controller) {
        return controller._strategyHWM - controller._queueTotalSize;
    }
    function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
        try {
            EnqueueValueWithSize(controller, chunk, chunkSize);
        }
        catch (enqueueE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
            return;
        }
        const stream = controller._controlledWritableStream;
        if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === 'writable') {
            const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
            WritableStreamUpdateBackpressure(stream, backpressure);
        }
        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
    }
    // Abstract operations for the WritableStreamDefaultController.
    function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
        const stream = controller._controlledWritableStream;
        if (!controller._started) {
            return;
        }
        if (stream._inFlightWriteRequest !== undefined) {
            return;
        }
        const state = stream._state;
        if (state === 'erroring') {
            WritableStreamFinishErroring(stream);
            return;
        }
        if (controller._queue.length === 0) {
            return;
        }
        const value = PeekQueueValue(controller);
        if (value === closeSentinel) {
            WritableStreamDefaultControllerProcessClose(controller);
        }
        else {
            WritableStreamDefaultControllerProcessWrite(controller, value);
        }
    }
    function WritableStreamDefaultControllerErrorIfNeeded(controller, error) {
        if (controller._controlledWritableStream._state === 'writable') {
            WritableStreamDefaultControllerError(controller, error);
        }
    }
    function WritableStreamDefaultControllerProcessClose(controller) {
        const stream = controller._controlledWritableStream;
        WritableStreamMarkCloseRequestInFlight(stream);
        DequeueValue(controller);
        const sinkClosePromise = controller._closeAlgorithm();
        WritableStreamDefaultControllerClearAlgorithms(controller);
        uponPromise(sinkClosePromise, () => {
            WritableStreamFinishInFlightClose(stream);
        }, reason => {
            WritableStreamFinishInFlightCloseWithError(stream, reason);
        });
    }
    function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
        const stream = controller._controlledWritableStream;
        WritableStreamMarkFirstWriteRequestInFlight(stream);
        const sinkWritePromise = controller._writeAlgorithm(chunk);
        uponPromise(sinkWritePromise, () => {
            WritableStreamFinishInFlightWrite(stream);
            const state = stream._state;
            DequeueValue(controller);
            if (!WritableStreamCloseQueuedOrInFlight(stream) && state === 'writable') {
                const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
                WritableStreamUpdateBackpressure(stream, backpressure);
            }
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }, reason => {
            if (stream._state === 'writable') {
                WritableStreamDefaultControllerClearAlgorithms(controller);
            }
            WritableStreamFinishInFlightWriteWithError(stream, reason);
        });
    }
    function WritableStreamDefaultControllerGetBackpressure(controller) {
        const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
        return desiredSize <= 0;
    }
    // A client of WritableStreamDefaultController may use these functions directly to bypass state check.
    function WritableStreamDefaultControllerError(controller, error) {
        const stream = controller._controlledWritableStream;
        WritableStreamDefaultControllerClearAlgorithms(controller);
        WritableStreamStartErroring(stream, error);
    }
    // Helper functions for the WritableStream.
    function streamBrandCheckException$2(name) {
        return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
    }
    // Helper functions for the WritableStreamDefaultController.
    function defaultControllerBrandCheckException$2(name) {
        return new TypeError(`WritableStreamDefaultController.prototype.${name} can only be used on a WritableStreamDefaultController`);
    }
    // Helper functions for the WritableStreamDefaultWriter.
    function defaultWriterBrandCheckException(name) {
        return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
    }
    function defaultWriterLockException(name) {
        return new TypeError('Cannot ' + name + ' a stream using a released writer');
    }
    function defaultWriterClosedPromiseInitialize(writer) {
        writer._closedPromise = newPromise((resolve, reject) => {
            writer._closedPromise_resolve = resolve;
            writer._closedPromise_reject = reject;
            writer._closedPromiseState = 'pending';
        });
    }
    function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
        defaultWriterClosedPromiseInitialize(writer);
        defaultWriterClosedPromiseReject(writer, reason);
    }
    function defaultWriterClosedPromiseInitializeAsResolved(writer) {
        defaultWriterClosedPromiseInitialize(writer);
        defaultWriterClosedPromiseResolve(writer);
    }
    function defaultWriterClosedPromiseReject(writer, reason) {
        if (writer._closedPromise_reject === undefined) {
            return;
        }
        setPromiseIsHandledToTrue(writer._closedPromise);
        writer._closedPromise_reject(reason);
        writer._closedPromise_resolve = undefined;
        writer._closedPromise_reject = undefined;
        writer._closedPromiseState = 'rejected';
    }
    function defaultWriterClosedPromiseResetToRejected(writer, reason) {
        defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
    }
    function defaultWriterClosedPromiseResolve(writer) {
        if (writer._closedPromise_resolve === undefined) {
            return;
        }
        writer._closedPromise_resolve(undefined);
        writer._closedPromise_resolve = undefined;
        writer._closedPromise_reject = undefined;
        writer._closedPromiseState = 'resolved';
    }
    function defaultWriterReadyPromiseInitialize(writer) {
        writer._readyPromise = newPromise((resolve, reject) => {
            writer._readyPromise_resolve = resolve;
            writer._readyPromise_reject = reject;
        });
        writer._readyPromiseState = 'pending';
    }
    function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
        defaultWriterReadyPromiseInitialize(writer);
        defaultWriterReadyPromiseReject(writer, reason);
    }
    function defaultWriterReadyPromiseInitializeAsResolved(writer) {
        defaultWriterReadyPromiseInitialize(writer);
        defaultWriterReadyPromiseResolve(writer);
    }
    function defaultWriterReadyPromiseReject(writer, reason) {
        if (writer._readyPromise_reject === undefined) {
            return;
        }
        setPromiseIsHandledToTrue(writer._readyPromise);
        writer._readyPromise_reject(reason);
        writer._readyPromise_resolve = undefined;
        writer._readyPromise_reject = undefined;
        writer._readyPromiseState = 'rejected';
    }
    function defaultWriterReadyPromiseReset(writer) {
        defaultWriterReadyPromiseInitialize(writer);
    }
    function defaultWriterReadyPromiseResetToRejected(writer, reason) {
        defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
    }
    function defaultWriterReadyPromiseResolve(writer) {
        if (writer._readyPromise_resolve === undefined) {
            return;
        }
        writer._readyPromise_resolve(undefined);
        writer._readyPromise_resolve = undefined;
        writer._readyPromise_reject = undefined;
        writer._readyPromiseState = 'fulfilled';
    }

    /// <reference lib="dom" />
    const NativeDOMException = typeof DOMException !== 'undefined' ? DOMException : undefined;

    /// <reference types="node" />
    function isDOMExceptionConstructor(ctor) {
        if (!(typeof ctor === 'function' || typeof ctor === 'object')) {
            return false;
        }
        try {
            new ctor();
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    function createDOMExceptionPolyfill() {
        // eslint-disable-next-line no-shadow
        const ctor = function DOMException(message, name) {
            this.message = message || '';
            this.name = name || 'Error';
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, this.constructor);
            }
        };
        ctor.prototype = Object.create(Error.prototype);
        Object.defineProperty(ctor.prototype, 'constructor', { value: ctor, writable: true, configurable: true });
        return ctor;
    }
    // eslint-disable-next-line no-redeclare
    const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();

    function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
        const reader = AcquireReadableStreamDefaultReader(source);
        const writer = AcquireWritableStreamDefaultWriter(dest);
        source._disturbed = true;
        let shuttingDown = false;
        // This is used to keep track of the spec's requirement that we wait for ongoing writes during shutdown.
        let currentWrite = promiseResolvedWith(undefined);
        return newPromise((resolve, reject) => {
            let abortAlgorithm;
            if (signal !== undefined) {
                abortAlgorithm = () => {
                    const error = new DOMException$1('Aborted', 'AbortError');
                    const actions = [];
                    if (!preventAbort) {
                        actions.push(() => {
                            if (dest._state === 'writable') {
                                return WritableStreamAbort(dest, error);
                            }
                            return promiseResolvedWith(undefined);
                        });
                    }
                    if (!preventCancel) {
                        actions.push(() => {
                            if (source._state === 'readable') {
                                return ReadableStreamCancel(source, error);
                            }
                            return promiseResolvedWith(undefined);
                        });
                    }
                    shutdownWithAction(() => Promise.all(actions.map(action => action())), true, error);
                };
                if (signal.aborted) {
                    abortAlgorithm();
                    return;
                }
                signal.addEventListener('abort', abortAlgorithm);
            }
            // Using reader and writer, read all chunks from this and write them to dest
            // - Backpressure must be enforced
            // - Shutdown must stop all activity
            function pipeLoop() {
                return newPromise((resolveLoop, rejectLoop) => {
                    function next(done) {
                        if (done) {
                            resolveLoop();
                        }
                        else {
                            // Use `PerformPromiseThen` instead of `uponPromise` to avoid
                            // adding unnecessary `.catch(rethrowAssertionErrorRejection)` handlers
                            PerformPromiseThen(pipeStep(), next, rejectLoop);
                        }
                    }
                    next(false);
                });
            }
            function pipeStep() {
                if (shuttingDown) {
                    return promiseResolvedWith(true);
                }
                return PerformPromiseThen(writer._readyPromise, () => {
                    return newPromise((resolveRead, rejectRead) => {
                        ReadableStreamDefaultReaderRead(reader, {
                            _chunkSteps: chunk => {
                                currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), undefined, noop);
                                resolveRead(false);
                            },
                            _closeSteps: () => resolveRead(true),
                            _errorSteps: rejectRead
                        });
                    });
                });
            }
            // Errors must be propagated forward
            isOrBecomesErrored(source, reader._closedPromise, storedError => {
                if (!preventAbort) {
                    shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
                }
                else {
                    shutdown(true, storedError);
                }
            });
            // Errors must be propagated backward
            isOrBecomesErrored(dest, writer._closedPromise, storedError => {
                if (!preventCancel) {
                    shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
                }
                else {
                    shutdown(true, storedError);
                }
            });
            // Closing must be propagated forward
            isOrBecomesClosed(source, reader._closedPromise, () => {
                if (!preventClose) {
                    shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
                }
                else {
                    shutdown();
                }
            });
            // Closing must be propagated backward
            if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === 'closed') {
                const destClosed = new TypeError('the destination writable stream closed before all data could be piped to it');
                if (!preventCancel) {
                    shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
                }
                else {
                    shutdown(true, destClosed);
                }
            }
            setPromiseIsHandledToTrue(pipeLoop());
            function waitForWritesToFinish() {
                // Another write may have started while we were waiting on this currentWrite, so we have to be sure to wait
                // for that too.
                const oldCurrentWrite = currentWrite;
                return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : undefined);
            }
            function isOrBecomesErrored(stream, promise, action) {
                if (stream._state === 'errored') {
                    action(stream._storedError);
                }
                else {
                    uponRejection(promise, action);
                }
            }
            function isOrBecomesClosed(stream, promise, action) {
                if (stream._state === 'closed') {
                    action();
                }
                else {
                    uponFulfillment(promise, action);
                }
            }
            function shutdownWithAction(action, originalIsError, originalError) {
                if (shuttingDown) {
                    return;
                }
                shuttingDown = true;
                if (dest._state === 'writable' && !WritableStreamCloseQueuedOrInFlight(dest)) {
                    uponFulfillment(waitForWritesToFinish(), doTheRest);
                }
                else {
                    doTheRest();
                }
                function doTheRest() {
                    uponPromise(action(), () => finalize(originalIsError, originalError), newError => finalize(true, newError));
                }
            }
            function shutdown(isError, error) {
                if (shuttingDown) {
                    return;
                }
                shuttingDown = true;
                if (dest._state === 'writable' && !WritableStreamCloseQueuedOrInFlight(dest)) {
                    uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error));
                }
                else {
                    finalize(isError, error);
                }
            }
            function finalize(isError, error) {
                WritableStreamDefaultWriterRelease(writer);
                ReadableStreamReaderGenericRelease(reader);
                if (signal !== undefined) {
                    signal.removeEventListener('abort', abortAlgorithm);
                }
                if (isError) {
                    reject(error);
                }
                else {
                    resolve(undefined);
                }
            }
        });
    }

    /**
     * Allows control of a {@link ReadableStream | readable stream}'s state and internal queue.
     *
     * @public
     */
    class ReadableStreamDefaultController {
        constructor() {
            throw new TypeError('Illegal constructor');
        }
        /**
         * Returns the desired size to fill the controlled stream's internal queue. It can be negative, if the queue is
         * over-full. An underlying source ought to use this information to determine when and how to apply backpressure.
         */
        get desiredSize() {
            if (!IsReadableStreamDefaultController(this)) {
                throw defaultControllerBrandCheckException$1('desiredSize');
            }
            return ReadableStreamDefaultControllerGetDesiredSize(this);
        }
        /**
         * Closes the controlled readable stream. Consumers will still be able to read any previously-enqueued chunks from
         * the stream, but once those are read, the stream will become closed.
         */
        close() {
            if (!IsReadableStreamDefaultController(this)) {
                throw defaultControllerBrandCheckException$1('close');
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
                throw new TypeError('The stream is not in a state that permits close');
            }
            ReadableStreamDefaultControllerClose(this);
        }
        enqueue(chunk = undefined) {
            if (!IsReadableStreamDefaultController(this)) {
                throw defaultControllerBrandCheckException$1('enqueue');
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
                throw new TypeError('The stream is not in a state that permits enqueue');
            }
            return ReadableStreamDefaultControllerEnqueue(this, chunk);
        }
        /**
         * Errors the controlled readable stream, making all future interactions with it fail with the given error `e`.
         */
        error(e = undefined) {
            if (!IsReadableStreamDefaultController(this)) {
                throw defaultControllerBrandCheckException$1('error');
            }
            ReadableStreamDefaultControllerError(this, e);
        }
        /** @internal */
        [CancelSteps](reason) {
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableStreamDefaultControllerClearAlgorithms(this);
            return result;
        }
        /** @internal */
        [PullSteps](readRequest) {
            const stream = this._controlledReadableStream;
            if (this._queue.length > 0) {
                const chunk = DequeueValue(this);
                if (this._closeRequested && this._queue.length === 0) {
                    ReadableStreamDefaultControllerClearAlgorithms(this);
                    ReadableStreamClose(stream);
                }
                else {
                    ReadableStreamDefaultControllerCallPullIfNeeded(this);
                }
                readRequest._chunkSteps(chunk);
            }
            else {
                ReadableStreamAddReadRequest(stream, readRequest);
                ReadableStreamDefaultControllerCallPullIfNeeded(this);
            }
        }
    }
    Object.defineProperties(ReadableStreamDefaultController.prototype, {
        close: { enumerable: true },
        enqueue: { enumerable: true },
        error: { enumerable: true },
        desiredSize: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: 'ReadableStreamDefaultController',
            configurable: true
        });
    }
    // Abstract operations for the ReadableStreamDefaultController.
    function IsReadableStreamDefaultController(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_controlledReadableStream')) {
            return false;
        }
        return x instanceof ReadableStreamDefaultController;
    }
    function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
        const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
        if (!shouldPull) {
            return;
        }
        if (controller._pulling) {
            controller._pullAgain = true;
            return;
        }
        controller._pulling = true;
        const pullPromise = controller._pullAlgorithm();
        uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
                controller._pullAgain = false;
                ReadableStreamDefaultControllerCallPullIfNeeded(controller);
            }
        }, e => {
            ReadableStreamDefaultControllerError(controller, e);
        });
    }
    function ReadableStreamDefaultControllerShouldCallPull(controller) {
        const stream = controller._controlledReadableStream;
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return false;
        }
        if (!controller._started) {
            return false;
        }
        if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
        }
        const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
        if (desiredSize > 0) {
            return true;
        }
        return false;
    }
    function ReadableStreamDefaultControllerClearAlgorithms(controller) {
        controller._pullAlgorithm = undefined;
        controller._cancelAlgorithm = undefined;
        controller._strategySizeAlgorithm = undefined;
    }
    // A client of ReadableStreamDefaultController may use these functions directly to bypass state check.
    function ReadableStreamDefaultControllerClose(controller) {
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
        }
        const stream = controller._controlledReadableStream;
        controller._closeRequested = true;
        if (controller._queue.length === 0) {
            ReadableStreamDefaultControllerClearAlgorithms(controller);
            ReadableStreamClose(stream);
        }
    }
    function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
        }
        const stream = controller._controlledReadableStream;
        if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            ReadableStreamFulfillReadRequest(stream, chunk, false);
        }
        else {
            let chunkSize;
            try {
                chunkSize = controller._strategySizeAlgorithm(chunk);
            }
            catch (chunkSizeE) {
                ReadableStreamDefaultControllerError(controller, chunkSizeE);
                throw chunkSizeE;
            }
            try {
                EnqueueValueWithSize(controller, chunk, chunkSize);
            }
            catch (enqueueE) {
                ReadableStreamDefaultControllerError(controller, enqueueE);
                throw enqueueE;
            }
        }
        ReadableStreamDefaultControllerCallPullIfNeeded(controller);
    }
    function ReadableStreamDefaultControllerError(controller, e) {
        const stream = controller._controlledReadableStream;
        if (stream._state !== 'readable') {
            return;
        }
        ResetQueue(controller);
        ReadableStreamDefaultControllerClearAlgorithms(controller);
        ReadableStreamError(stream, e);
    }
    function ReadableStreamDefaultControllerGetDesiredSize(controller) {
        const state = controller._controlledReadableStream._state;
        if (state === 'errored') {
            return null;
        }
        if (state === 'closed') {
            return 0;
        }
        return controller._strategyHWM - controller._queueTotalSize;
    }
    // This is used in the implementation of TransformStream.
    function ReadableStreamDefaultControllerHasBackpressure(controller) {
        if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
            return false;
        }
        return true;
    }
    function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
        const state = controller._controlledReadableStream._state;
        if (!controller._closeRequested && state === 'readable') {
            return true;
        }
        return false;
    }
    function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
        controller._controlledReadableStream = stream;
        controller._queue = undefined;
        controller._queueTotalSize = undefined;
        ResetQueue(controller);
        controller._started = false;
        controller._closeRequested = false;
        controller._pullAgain = false;
        controller._pulling = false;
        controller._strategySizeAlgorithm = sizeAlgorithm;
        controller._strategyHWM = highWaterMark;
        controller._pullAlgorithm = pullAlgorithm;
        controller._cancelAlgorithm = cancelAlgorithm;
        stream._readableStreamController = controller;
        const startResult = startAlgorithm();
        uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }, r => {
            ReadableStreamDefaultControllerError(controller, r);
        });
    }
    function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
        const controller = Object.create(ReadableStreamDefaultController.prototype);
        let startAlgorithm = () => undefined;
        let pullAlgorithm = () => promiseResolvedWith(undefined);
        let cancelAlgorithm = () => promiseResolvedWith(undefined);
        if (underlyingSource.start !== undefined) {
            startAlgorithm = () => underlyingSource.start(controller);
        }
        if (underlyingSource.pull !== undefined) {
            pullAlgorithm = () => underlyingSource.pull(controller);
        }
        if (underlyingSource.cancel !== undefined) {
            cancelAlgorithm = reason => underlyingSource.cancel(reason);
        }
        SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
    }
    // Helper functions for the ReadableStreamDefaultController.
    function defaultControllerBrandCheckException$1(name) {
        return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
    }

    function ReadableStreamTee(stream, cloneForBranch2) {
        if (IsReadableByteStreamController(stream._readableStreamController)) {
            return ReadableByteStreamTee(stream);
        }
        return ReadableStreamDefaultTee(stream);
    }
    function ReadableStreamDefaultTee(stream, cloneForBranch2) {
        const reader = AcquireReadableStreamDefaultReader(stream);
        let reading = false;
        let readAgain = false;
        let canceled1 = false;
        let canceled2 = false;
        let reason1;
        let reason2;
        let branch1;
        let branch2;
        let resolveCancelPromise;
        const cancelPromise = newPromise(resolve => {
            resolveCancelPromise = resolve;
        });
        function pullAlgorithm() {
            if (reading) {
                readAgain = true;
                return promiseResolvedWith(undefined);
            }
            reading = true;
            const readRequest = {
                _chunkSteps: chunk => {
                    // This needs to be delayed a microtask because it takes at least a microtask to detect errors (using
                    // reader._closedPromise below), and we want errors in stream to error both branches immediately. We cannot let
                    // successful synchronously-available reads get ahead of asynchronously-available errors.
                    queueMicrotask(() => {
                        readAgain = false;
                        const chunk1 = chunk;
                        const chunk2 = chunk;
                        // There is no way to access the cloning code right now in the reference implementation.
                        // If we add one then we'll need an implementation for serializable objects.
                        // if (!canceled2 && cloneForBranch2) {
                        //   chunk2 = StructuredDeserialize(StructuredSerialize(chunk2));
                        // }
                        if (!canceled1) {
                            ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
                        }
                        if (!canceled2) {
                            ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
                        }
                        reading = false;
                        if (readAgain) {
                            pullAlgorithm();
                        }
                    });
                },
                _closeSteps: () => {
                    reading = false;
                    if (!canceled1) {
                        ReadableStreamDefaultControllerClose(branch1._readableStreamController);
                    }
                    if (!canceled2) {
                        ReadableStreamDefaultControllerClose(branch2._readableStreamController);
                    }
                    if (!canceled1 || !canceled2) {
                        resolveCancelPromise(undefined);
                    }
                },
                _errorSteps: () => {
                    reading = false;
                }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promiseResolvedWith(undefined);
        }
        function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
                const compositeReason = CreateArrayFromList([reason1, reason2]);
                const cancelResult = ReadableStreamCancel(stream, compositeReason);
                resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
        }
        function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
                const compositeReason = CreateArrayFromList([reason1, reason2]);
                const cancelResult = ReadableStreamCancel(stream, compositeReason);
                resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
        }
        function startAlgorithm() {
            // do nothing
        }
        branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
        branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
        uponRejection(reader._closedPromise, (r) => {
            ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
            ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
            if (!canceled1 || !canceled2) {
                resolveCancelPromise(undefined);
            }
        });
        return [branch1, branch2];
    }
    function ReadableByteStreamTee(stream) {
        let reader = AcquireReadableStreamDefaultReader(stream);
        let reading = false;
        let readAgainForBranch1 = false;
        let readAgainForBranch2 = false;
        let canceled1 = false;
        let canceled2 = false;
        let reason1;
        let reason2;
        let branch1;
        let branch2;
        let resolveCancelPromise;
        const cancelPromise = newPromise(resolve => {
            resolveCancelPromise = resolve;
        });
        function forwardReaderError(thisReader) {
            uponRejection(thisReader._closedPromise, r => {
                if (thisReader !== reader) {
                    return;
                }
                ReadableByteStreamControllerError(branch1._readableStreamController, r);
                ReadableByteStreamControllerError(branch2._readableStreamController, r);
                if (!canceled1 || !canceled2) {
                    resolveCancelPromise(undefined);
                }
            });
        }
        function pullWithDefaultReader() {
            if (IsReadableStreamBYOBReader(reader)) {
                ReadableStreamReaderGenericRelease(reader);
                reader = AcquireReadableStreamDefaultReader(stream);
                forwardReaderError(reader);
            }
            const readRequest = {
                _chunkSteps: chunk => {
                    // This needs to be delayed a microtask because it takes at least a microtask to detect errors (using
                    // reader._closedPromise below), and we want errors in stream to error both branches immediately. We cannot let
                    // successful synchronously-available reads get ahead of asynchronously-available errors.
                    queueMicrotask(() => {
                        readAgainForBranch1 = false;
                        readAgainForBranch2 = false;
                        const chunk1 = chunk;
                        let chunk2 = chunk;
                        if (!canceled1 && !canceled2) {
                            try {
                                chunk2 = CloneAsUint8Array(chunk);
                            }
                            catch (cloneE) {
                                ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                                ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                                resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                                return;
                            }
                        }
                        if (!canceled1) {
                            ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
                        }
                        if (!canceled2) {
                            ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
                        }
                        reading = false;
                        if (readAgainForBranch1) {
                            pull1Algorithm();
                        }
                        else if (readAgainForBranch2) {
                            pull2Algorithm();
                        }
                    });
                },
                _closeSteps: () => {
                    reading = false;
                    if (!canceled1) {
                        ReadableByteStreamControllerClose(branch1._readableStreamController);
                    }
                    if (!canceled2) {
                        ReadableByteStreamControllerClose(branch2._readableStreamController);
                    }
                    if (branch1._readableStreamController._pendingPullIntos.length > 0) {
                        ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
                    }
                    if (branch2._readableStreamController._pendingPullIntos.length > 0) {
                        ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
                    }
                    if (!canceled1 || !canceled2) {
                        resolveCancelPromise(undefined);
                    }
                },
                _errorSteps: () => {
                    reading = false;
                }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
        }
        function pullWithBYOBReader(view, forBranch2) {
            if (IsReadableStreamDefaultReader(reader)) {
                ReadableStreamReaderGenericRelease(reader);
                reader = AcquireReadableStreamBYOBReader(stream);
                forwardReaderError(reader);
            }
            const byobBranch = forBranch2 ? branch2 : branch1;
            const otherBranch = forBranch2 ? branch1 : branch2;
            const readIntoRequest = {
                _chunkSteps: chunk => {
                    // This needs to be delayed a microtask because it takes at least a microtask to detect errors (using
                    // reader._closedPromise below), and we want errors in stream to error both branches immediately. We cannot let
                    // successful synchronously-available reads get ahead of asynchronously-available errors.
                    queueMicrotask(() => {
                        readAgainForBranch1 = false;
                        readAgainForBranch2 = false;
                        const byobCanceled = forBranch2 ? canceled2 : canceled1;
                        const otherCanceled = forBranch2 ? canceled1 : canceled2;
                        if (!otherCanceled) {
                            let clonedChunk;
                            try {
                                clonedChunk = CloneAsUint8Array(chunk);
                            }
                            catch (cloneE) {
                                ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                                ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                                resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                                return;
                            }
                            if (!byobCanceled) {
                                ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                            }
                            ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
                        }
                        else if (!byobCanceled) {
                            ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                        }
                        reading = false;
                        if (readAgainForBranch1) {
                            pull1Algorithm();
                        }
                        else if (readAgainForBranch2) {
                            pull2Algorithm();
                        }
                    });
                },
                _closeSteps: chunk => {
                    reading = false;
                    const byobCanceled = forBranch2 ? canceled2 : canceled1;
                    const otherCanceled = forBranch2 ? canceled1 : canceled2;
                    if (!byobCanceled) {
                        ReadableByteStreamControllerClose(byobBranch._readableStreamController);
                    }
                    if (!otherCanceled) {
                        ReadableByteStreamControllerClose(otherBranch._readableStreamController);
                    }
                    if (chunk !== undefined) {
                        if (!byobCanceled) {
                            ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                        }
                        if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
                            ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
                        }
                    }
                    if (!byobCanceled || !otherCanceled) {
                        resolveCancelPromise(undefined);
                    }
                },
                _errorSteps: () => {
                    reading = false;
                }
            };
            ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
        }
        function pull1Algorithm() {
            if (reading) {
                readAgainForBranch1 = true;
                return promiseResolvedWith(undefined);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
            if (byobRequest === null) {
                pullWithDefaultReader();
            }
            else {
                pullWithBYOBReader(byobRequest._view, false);
            }
            return promiseResolvedWith(undefined);
        }
        function pull2Algorithm() {
            if (reading) {
                readAgainForBranch2 = true;
                return promiseResolvedWith(undefined);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
            if (byobRequest === null) {
                pullWithDefaultReader();
            }
            else {
                pullWithBYOBReader(byobRequest._view, true);
            }
            return promiseResolvedWith(undefined);
        }
        function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
                const compositeReason = CreateArrayFromList([reason1, reason2]);
                const cancelResult = ReadableStreamCancel(stream, compositeReason);
                resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
        }
        function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
                const compositeReason = CreateArrayFromList([reason1, reason2]);
                const cancelResult = ReadableStreamCancel(stream, compositeReason);
                resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
        }
        function startAlgorithm() {
            return;
        }
        branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
        branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
        forwardReaderError(reader);
        return [branch1, branch2];
    }

    function convertUnderlyingDefaultOrByteSource(source, context) {
        assertDictionary(source, context);
        const original = source;
        const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
        const cancel = original === null || original === void 0 ? void 0 : original.cancel;
        const pull = original === null || original === void 0 ? void 0 : original.pull;
        const start = original === null || original === void 0 ? void 0 : original.start;
        const type = original === null || original === void 0 ? void 0 : original.type;
        return {
            autoAllocateChunkSize: autoAllocateChunkSize === undefined ?
                undefined :
                convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
            cancel: cancel === undefined ?
                undefined :
                convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
            pull: pull === undefined ?
                undefined :
                convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
            start: start === undefined ?
                undefined :
                convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
            type: type === undefined ? undefined : convertReadableStreamType(type, `${context} has member 'type' that`)
        };
    }
    function convertUnderlyingSourceCancelCallback(fn, original, context) {
        assertFunction(fn, context);
        return (reason) => promiseCall(fn, original, [reason]);
    }
    function convertUnderlyingSourcePullCallback(fn, original, context) {
        assertFunction(fn, context);
        return (controller) => promiseCall(fn, original, [controller]);
    }
    function convertUnderlyingSourceStartCallback(fn, original, context) {
        assertFunction(fn, context);
        return (controller) => reflectCall(fn, original, [controller]);
    }
    function convertReadableStreamType(type, context) {
        type = `${type}`;
        if (type !== 'bytes') {
            throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
        }
        return type;
    }

    function convertReaderOptions(options, context) {
        assertDictionary(options, context);
        const mode = options === null || options === void 0 ? void 0 : options.mode;
        return {
            mode: mode === undefined ? undefined : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
        };
    }
    function convertReadableStreamReaderMode(mode, context) {
        mode = `${mode}`;
        if (mode !== 'byob') {
            throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
        }
        return mode;
    }

    function convertIteratorOptions(options, context) {
        assertDictionary(options, context);
        const preventCancel = options === null || options === void 0 ? void 0 : options.preventCancel;
        return { preventCancel: Boolean(preventCancel) };
    }

    function convertPipeOptions(options, context) {
        assertDictionary(options, context);
        const preventAbort = options === null || options === void 0 ? void 0 : options.preventAbort;
        const preventCancel = options === null || options === void 0 ? void 0 : options.preventCancel;
        const preventClose = options === null || options === void 0 ? void 0 : options.preventClose;
        const signal = options === null || options === void 0 ? void 0 : options.signal;
        if (signal !== undefined) {
            assertAbortSignal(signal, `${context} has member 'signal' that`);
        }
        return {
            preventAbort: Boolean(preventAbort),
            preventCancel: Boolean(preventCancel),
            preventClose: Boolean(preventClose),
            signal
        };
    }
    function assertAbortSignal(signal, context) {
        if (!isAbortSignal(signal)) {
            throw new TypeError(`${context} is not an AbortSignal.`);
        }
    }

    function convertReadableWritablePair(pair, context) {
        assertDictionary(pair, context);
        const readable = pair === null || pair === void 0 ? void 0 : pair.readable;
        assertRequiredField(readable, 'readable', 'ReadableWritablePair');
        assertReadableStream(readable, `${context} has member 'readable' that`);
        const writable = pair === null || pair === void 0 ? void 0 : pair.writable;
        assertRequiredField(writable, 'writable', 'ReadableWritablePair');
        assertWritableStream(writable, `${context} has member 'writable' that`);
        return { readable, writable };
    }

    /**
     * A readable stream represents a source of data, from which you can read.
     *
     * @public
     */
    class ReadableStream {
        constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
            if (rawUnderlyingSource === undefined) {
                rawUnderlyingSource = null;
            }
            else {
                assertObject(rawUnderlyingSource, 'First parameter');
            }
            const strategy = convertQueuingStrategy(rawStrategy, 'Second parameter');
            const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, 'First parameter');
            InitializeReadableStream(this);
            if (underlyingSource.type === 'bytes') {
                if (strategy.size !== undefined) {
                    throw new RangeError('The strategy for a byte stream cannot have a size function');
                }
                const highWaterMark = ExtractHighWaterMark(strategy, 0);
                SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
            }
            else {
                const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
                const highWaterMark = ExtractHighWaterMark(strategy, 1);
                SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
            }
        }
        /**
         * Whether or not the readable stream is locked to a {@link ReadableStreamDefaultReader | reader}.
         */
        get locked() {
            if (!IsReadableStream(this)) {
                throw streamBrandCheckException$1('locked');
            }
            return IsReadableStreamLocked(this);
        }
        /**
         * Cancels the stream, signaling a loss of interest in the stream by a consumer.
         *
         * The supplied `reason` argument will be given to the underlying source's {@link UnderlyingSource.cancel | cancel()}
         * method, which might or might not use it.
         */
        cancel(reason = undefined) {
            if (!IsReadableStream(this)) {
                return promiseRejectedWith(streamBrandCheckException$1('cancel'));
            }
            if (IsReadableStreamLocked(this)) {
                return promiseRejectedWith(new TypeError('Cannot cancel a stream that already has a reader'));
            }
            return ReadableStreamCancel(this, reason);
        }
        getReader(rawOptions = undefined) {
            if (!IsReadableStream(this)) {
                throw streamBrandCheckException$1('getReader');
            }
            const options = convertReaderOptions(rawOptions, 'First parameter');
            if (options.mode === undefined) {
                return AcquireReadableStreamDefaultReader(this);
            }
            return AcquireReadableStreamBYOBReader(this);
        }
        pipeThrough(rawTransform, rawOptions = {}) {
            if (!IsReadableStream(this)) {
                throw streamBrandCheckException$1('pipeThrough');
            }
            assertRequiredArgument(rawTransform, 1, 'pipeThrough');
            const transform = convertReadableWritablePair(rawTransform, 'First parameter');
            const options = convertPipeOptions(rawOptions, 'Second parameter');
            if (IsReadableStreamLocked(this)) {
                throw new TypeError('ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream');
            }
            if (IsWritableStreamLocked(transform.writable)) {
                throw new TypeError('ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream');
            }
            const promise = ReadableStreamPipeTo(this, transform.writable, options.preventClose, options.preventAbort, options.preventCancel, options.signal);
            setPromiseIsHandledToTrue(promise);
            return transform.readable;
        }
        pipeTo(destination, rawOptions = {}) {
            if (!IsReadableStream(this)) {
                return promiseRejectedWith(streamBrandCheckException$1('pipeTo'));
            }
            if (destination === undefined) {
                return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
            }
            if (!IsWritableStream(destination)) {
                return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
            }
            let options;
            try {
                options = convertPipeOptions(rawOptions, 'Second parameter');
            }
            catch (e) {
                return promiseRejectedWith(e);
            }
            if (IsReadableStreamLocked(this)) {
                return promiseRejectedWith(new TypeError('ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream'));
            }
            if (IsWritableStreamLocked(destination)) {
                return promiseRejectedWith(new TypeError('ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream'));
            }
            return ReadableStreamPipeTo(this, destination, options.preventClose, options.preventAbort, options.preventCancel, options.signal);
        }
        /**
         * Tees this readable stream, returning a two-element array containing the two resulting branches as
         * new {@link ReadableStream} instances.
         *
         * Teeing a stream will lock it, preventing any other consumer from acquiring a reader.
         * To cancel the stream, cancel both of the resulting branches; a composite cancellation reason will then be
         * propagated to the stream's underlying source.
         *
         * Note that the chunks seen in each branch will be the same object. If the chunks are not immutable,
         * this could allow interference between the two branches.
         */
        tee() {
            if (!IsReadableStream(this)) {
                throw streamBrandCheckException$1('tee');
            }
            const branches = ReadableStreamTee(this);
            return CreateArrayFromList(branches);
        }
        values(rawOptions = undefined) {
            if (!IsReadableStream(this)) {
                throw streamBrandCheckException$1('values');
            }
            const options = convertIteratorOptions(rawOptions, 'First parameter');
            return AcquireReadableStreamAsyncIterator(this, options.preventCancel);
        }
    }
    Object.defineProperties(ReadableStream.prototype, {
        cancel: { enumerable: true },
        getReader: { enumerable: true },
        pipeThrough: { enumerable: true },
        pipeTo: { enumerable: true },
        tee: { enumerable: true },
        values: { enumerable: true },
        locked: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(ReadableStream.prototype, SymbolPolyfill.toStringTag, {
            value: 'ReadableStream',
            configurable: true
        });
    }
    if (typeof SymbolPolyfill.asyncIterator === 'symbol') {
        Object.defineProperty(ReadableStream.prototype, SymbolPolyfill.asyncIterator, {
            value: ReadableStream.prototype.values,
            writable: true,
            configurable: true
        });
    }
    // Abstract operations for the ReadableStream.
    // Throws if and only if startAlgorithm throws.
    function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
        const stream = Object.create(ReadableStream.prototype);
        InitializeReadableStream(stream);
        const controller = Object.create(ReadableStreamDefaultController.prototype);
        SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
        return stream;
    }
    // Throws if and only if startAlgorithm throws.
    function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
        const stream = Object.create(ReadableStream.prototype);
        InitializeReadableStream(stream);
        const controller = Object.create(ReadableByteStreamController.prototype);
        SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, undefined);
        return stream;
    }
    function InitializeReadableStream(stream) {
        stream._state = 'readable';
        stream._reader = undefined;
        stream._storedError = undefined;
        stream._disturbed = false;
    }
    function IsReadableStream(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_readableStreamController')) {
            return false;
        }
        return x instanceof ReadableStream;
    }
    function IsReadableStreamLocked(stream) {
        if (stream._reader === undefined) {
            return false;
        }
        return true;
    }
    // ReadableStream API exposed for controllers.
    function ReadableStreamCancel(stream, reason) {
        stream._disturbed = true;
        if (stream._state === 'closed') {
            return promiseResolvedWith(undefined);
        }
        if (stream._state === 'errored') {
            return promiseRejectedWith(stream._storedError);
        }
        ReadableStreamClose(stream);
        const reader = stream._reader;
        if (reader !== undefined && IsReadableStreamBYOBReader(reader)) {
            reader._readIntoRequests.forEach(readIntoRequest => {
                readIntoRequest._closeSteps(undefined);
            });
            reader._readIntoRequests = new SimpleQueue();
        }
        const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
        return transformPromiseWith(sourceCancelPromise, noop);
    }
    function ReadableStreamClose(stream) {
        stream._state = 'closed';
        const reader = stream._reader;
        if (reader === undefined) {
            return;
        }
        defaultReaderClosedPromiseResolve(reader);
        if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach(readRequest => {
                readRequest._closeSteps();
            });
            reader._readRequests = new SimpleQueue();
        }
    }
    function ReadableStreamError(stream, e) {
        stream._state = 'errored';
        stream._storedError = e;
        const reader = stream._reader;
        if (reader === undefined) {
            return;
        }
        defaultReaderClosedPromiseReject(reader, e);
        if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach(readRequest => {
                readRequest._errorSteps(e);
            });
            reader._readRequests = new SimpleQueue();
        }
        else {
            reader._readIntoRequests.forEach(readIntoRequest => {
                readIntoRequest._errorSteps(e);
            });
            reader._readIntoRequests = new SimpleQueue();
        }
    }
    // Helper functions for the ReadableStream.
    function streamBrandCheckException$1(name) {
        return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
    }

    function convertQueuingStrategyInit(init, context) {
        assertDictionary(init, context);
        const highWaterMark = init === null || init === void 0 ? void 0 : init.highWaterMark;
        assertRequiredField(highWaterMark, 'highWaterMark', 'QueuingStrategyInit');
        return {
            highWaterMark: convertUnrestrictedDouble(highWaterMark)
        };
    }

    // The size function must not have a prototype property nor be a constructor
    const byteLengthSizeFunction = (chunk) => {
        return chunk.byteLength;
    };
    try {
        Object.defineProperty(byteLengthSizeFunction, 'name', {
            value: 'size',
            configurable: true
        });
    }
    catch (_a) {
        // This property is non-configurable in older browsers, so ignore if this throws.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name#browser_compatibility
    }
    /**
     * A queuing strategy that counts the number of bytes in each chunk.
     *
     * @public
     */
    class ByteLengthQueuingStrategy {
        constructor(options) {
            assertRequiredArgument(options, 1, 'ByteLengthQueuingStrategy');
            options = convertQueuingStrategyInit(options, 'First parameter');
            this._byteLengthQueuingStrategyHighWaterMark = options.highWaterMark;
        }
        /**
         * Returns the high water mark provided to the constructor.
         */
        get highWaterMark() {
            if (!IsByteLengthQueuingStrategy(this)) {
                throw byteLengthBrandCheckException('highWaterMark');
            }
            return this._byteLengthQueuingStrategyHighWaterMark;
        }
        /**
         * Measures the size of `chunk` by returning the value of its `byteLength` property.
         */
        get size() {
            if (!IsByteLengthQueuingStrategy(this)) {
                throw byteLengthBrandCheckException('size');
            }
            return byteLengthSizeFunction;
        }
    }
    Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
        highWaterMark: { enumerable: true },
        size: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: 'ByteLengthQueuingStrategy',
            configurable: true
        });
    }
    // Helper functions for the ByteLengthQueuingStrategy.
    function byteLengthBrandCheckException(name) {
        return new TypeError(`ByteLengthQueuingStrategy.prototype.${name} can only be used on a ByteLengthQueuingStrategy`);
    }
    function IsByteLengthQueuingStrategy(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_byteLengthQueuingStrategyHighWaterMark')) {
            return false;
        }
        return x instanceof ByteLengthQueuingStrategy;
    }

    // The size function must not have a prototype property nor be a constructor
    const countSizeFunction = () => {
        return 1;
    };
    try {
        Object.defineProperty(countSizeFunction, 'name', {
            value: 'size',
            configurable: true
        });
    }
    catch (_a) {
        // This property is non-configurable in older browsers, so ignore if this throws.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name#browser_compatibility
    }
    /**
     * A queuing strategy that counts the number of chunks.
     *
     * @public
     */
    class CountQueuingStrategy {
        constructor(options) {
            assertRequiredArgument(options, 1, 'CountQueuingStrategy');
            options = convertQueuingStrategyInit(options, 'First parameter');
            this._countQueuingStrategyHighWaterMark = options.highWaterMark;
        }
        /**
         * Returns the high water mark provided to the constructor.
         */
        get highWaterMark() {
            if (!IsCountQueuingStrategy(this)) {
                throw countBrandCheckException('highWaterMark');
            }
            return this._countQueuingStrategyHighWaterMark;
        }
        /**
         * Measures the size of `chunk` by always returning 1.
         * This ensures that the total queue size is a count of the number of chunks in the queue.
         */
        get size() {
            if (!IsCountQueuingStrategy(this)) {
                throw countBrandCheckException('size');
            }
            return countSizeFunction;
        }
    }
    Object.defineProperties(CountQueuingStrategy.prototype, {
        highWaterMark: { enumerable: true },
        size: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: 'CountQueuingStrategy',
            configurable: true
        });
    }
    // Helper functions for the CountQueuingStrategy.
    function countBrandCheckException(name) {
        return new TypeError(`CountQueuingStrategy.prototype.${name} can only be used on a CountQueuingStrategy`);
    }
    function IsCountQueuingStrategy(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_countQueuingStrategyHighWaterMark')) {
            return false;
        }
        return x instanceof CountQueuingStrategy;
    }

    function convertTransformer(original, context) {
        assertDictionary(original, context);
        const flush = original === null || original === void 0 ? void 0 : original.flush;
        const readableType = original === null || original === void 0 ? void 0 : original.readableType;
        const start = original === null || original === void 0 ? void 0 : original.start;
        const transform = original === null || original === void 0 ? void 0 : original.transform;
        const writableType = original === null || original === void 0 ? void 0 : original.writableType;
        return {
            flush: flush === undefined ?
                undefined :
                convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
            readableType,
            start: start === undefined ?
                undefined :
                convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
            transform: transform === undefined ?
                undefined :
                convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
            writableType
        };
    }
    function convertTransformerFlushCallback(fn, original, context) {
        assertFunction(fn, context);
        return (controller) => promiseCall(fn, original, [controller]);
    }
    function convertTransformerStartCallback(fn, original, context) {
        assertFunction(fn, context);
        return (controller) => reflectCall(fn, original, [controller]);
    }
    function convertTransformerTransformCallback(fn, original, context) {
        assertFunction(fn, context);
        return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
    }

    // Class TransformStream
    /**
     * A transform stream consists of a pair of streams: a {@link WritableStream | writable stream},
     * known as its writable side, and a {@link ReadableStream | readable stream}, known as its readable side.
     * In a manner specific to the transform stream in question, writes to the writable side result in new data being
     * made available for reading from the readable side.
     *
     * @public
     */
    class TransformStream {
        constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
            if (rawTransformer === undefined) {
                rawTransformer = null;
            }
            const writableStrategy = convertQueuingStrategy(rawWritableStrategy, 'Second parameter');
            const readableStrategy = convertQueuingStrategy(rawReadableStrategy, 'Third parameter');
            const transformer = convertTransformer(rawTransformer, 'First parameter');
            if (transformer.readableType !== undefined) {
                throw new RangeError('Invalid readableType specified');
            }
            if (transformer.writableType !== undefined) {
                throw new RangeError('Invalid writableType specified');
            }
            const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
            const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
            const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
            const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
            let startPromise_resolve;
            const startPromise = newPromise(resolve => {
                startPromise_resolve = resolve;
            });
            InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
            SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
            if (transformer.start !== undefined) {
                startPromise_resolve(transformer.start(this._transformStreamController));
            }
            else {
                startPromise_resolve(undefined);
            }
        }
        /**
         * The readable side of the transform stream.
         */
        get readable() {
            if (!IsTransformStream(this)) {
                throw streamBrandCheckException('readable');
            }
            return this._readable;
        }
        /**
         * The writable side of the transform stream.
         */
        get writable() {
            if (!IsTransformStream(this)) {
                throw streamBrandCheckException('writable');
            }
            return this._writable;
        }
    }
    Object.defineProperties(TransformStream.prototype, {
        readable: { enumerable: true },
        writable: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
            value: 'TransformStream',
            configurable: true
        });
    }
    function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
        function startAlgorithm() {
            return startPromise;
        }
        function writeAlgorithm(chunk) {
            return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
        }
        function abortAlgorithm(reason) {
            return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
        }
        function closeAlgorithm() {
            return TransformStreamDefaultSinkCloseAlgorithm(stream);
        }
        stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
        function pullAlgorithm() {
            return TransformStreamDefaultSourcePullAlgorithm(stream);
        }
        function cancelAlgorithm(reason) {
            TransformStreamErrorWritableAndUnblockWrite(stream, reason);
            return promiseResolvedWith(undefined);
        }
        stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
        // The [[backpressure]] slot is set to undefined so that it can be initialised by TransformStreamSetBackpressure.
        stream._backpressure = undefined;
        stream._backpressureChangePromise = undefined;
        stream._backpressureChangePromise_resolve = undefined;
        TransformStreamSetBackpressure(stream, true);
        stream._transformStreamController = undefined;
    }
    function IsTransformStream(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_transformStreamController')) {
            return false;
        }
        return x instanceof TransformStream;
    }
    // This is a no-op if both sides are already errored.
    function TransformStreamError(stream, e) {
        ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
        TransformStreamErrorWritableAndUnblockWrite(stream, e);
    }
    function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
        TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
        WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
        if (stream._backpressure) {
            // Pretend that pull() was called to permit any pending write() calls to complete. TransformStreamSetBackpressure()
            // cannot be called from enqueue() or pull() once the ReadableStream is errored, so this will will be the final time
            // _backpressure is set.
            TransformStreamSetBackpressure(stream, false);
        }
    }
    function TransformStreamSetBackpressure(stream, backpressure) {
        // Passes also when called during construction.
        if (stream._backpressureChangePromise !== undefined) {
            stream._backpressureChangePromise_resolve();
        }
        stream._backpressureChangePromise = newPromise(resolve => {
            stream._backpressureChangePromise_resolve = resolve;
        });
        stream._backpressure = backpressure;
    }
    // Class TransformStreamDefaultController
    /**
     * Allows control of the {@link ReadableStream} and {@link WritableStream} of the associated {@link TransformStream}.
     *
     * @public
     */
    class TransformStreamDefaultController {
        constructor() {
            throw new TypeError('Illegal constructor');
        }
        /**
         * Returns the desired size to fill the readable side’s internal queue. It can be negative, if the queue is over-full.
         */
        get desiredSize() {
            if (!IsTransformStreamDefaultController(this)) {
                throw defaultControllerBrandCheckException('desiredSize');
            }
            const readableController = this._controlledTransformStream._readable._readableStreamController;
            return ReadableStreamDefaultControllerGetDesiredSize(readableController);
        }
        enqueue(chunk = undefined) {
            if (!IsTransformStreamDefaultController(this)) {
                throw defaultControllerBrandCheckException('enqueue');
            }
            TransformStreamDefaultControllerEnqueue(this, chunk);
        }
        /**
         * Errors both the readable side and the writable side of the controlled transform stream, making all future
         * interactions with it fail with the given error `e`. Any chunks queued for transformation will be discarded.
         */
        error(reason = undefined) {
            if (!IsTransformStreamDefaultController(this)) {
                throw defaultControllerBrandCheckException('error');
            }
            TransformStreamDefaultControllerError(this, reason);
        }
        /**
         * Closes the readable side and errors the writable side of the controlled transform stream. This is useful when the
         * transformer only needs to consume a portion of the chunks written to the writable side.
         */
        terminate() {
            if (!IsTransformStreamDefaultController(this)) {
                throw defaultControllerBrandCheckException('terminate');
            }
            TransformStreamDefaultControllerTerminate(this);
        }
    }
    Object.defineProperties(TransformStreamDefaultController.prototype, {
        enqueue: { enumerable: true },
        error: { enumerable: true },
        terminate: { enumerable: true },
        desiredSize: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
        Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: 'TransformStreamDefaultController',
            configurable: true
        });
    }
    // Transform Stream Default Controller Abstract Operations
    function IsTransformStreamDefaultController(x) {
        if (!typeIsObject(x)) {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(x, '_controlledTransformStream')) {
            return false;
        }
        return x instanceof TransformStreamDefaultController;
    }
    function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
        controller._controlledTransformStream = stream;
        stream._transformStreamController = controller;
        controller._transformAlgorithm = transformAlgorithm;
        controller._flushAlgorithm = flushAlgorithm;
    }
    function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
        const controller = Object.create(TransformStreamDefaultController.prototype);
        let transformAlgorithm = (chunk) => {
            try {
                TransformStreamDefaultControllerEnqueue(controller, chunk);
                return promiseResolvedWith(undefined);
            }
            catch (transformResultE) {
                return promiseRejectedWith(transformResultE);
            }
        };
        let flushAlgorithm = () => promiseResolvedWith(undefined);
        if (transformer.transform !== undefined) {
            transformAlgorithm = chunk => transformer.transform(chunk, controller);
        }
        if (transformer.flush !== undefined) {
            flushAlgorithm = () => transformer.flush(controller);
        }
        SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
    }
    function TransformStreamDefaultControllerClearAlgorithms(controller) {
        controller._transformAlgorithm = undefined;
        controller._flushAlgorithm = undefined;
    }
    function TransformStreamDefaultControllerEnqueue(controller, chunk) {
        const stream = controller._controlledTransformStream;
        const readableController = stream._readable._readableStreamController;
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
            throw new TypeError('Readable side is not in a state that permits enqueue');
        }
        // We throttle transform invocations based on the backpressure of the ReadableStream, but we still
        // accept TransformStreamDefaultControllerEnqueue() calls.
        try {
            ReadableStreamDefaultControllerEnqueue(readableController, chunk);
        }
        catch (e) {
            // This happens when readableStrategy.size() throws.
            TransformStreamErrorWritableAndUnblockWrite(stream, e);
            throw stream._readable._storedError;
        }
        const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
        if (backpressure !== stream._backpressure) {
            TransformStreamSetBackpressure(stream, true);
        }
    }
    function TransformStreamDefaultControllerError(controller, e) {
        TransformStreamError(controller._controlledTransformStream, e);
    }
    function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
        const transformPromise = controller._transformAlgorithm(chunk);
        return transformPromiseWith(transformPromise, undefined, r => {
            TransformStreamError(controller._controlledTransformStream, r);
            throw r;
        });
    }
    function TransformStreamDefaultControllerTerminate(controller) {
        const stream = controller._controlledTransformStream;
        const readableController = stream._readable._readableStreamController;
        ReadableStreamDefaultControllerClose(readableController);
        const error = new TypeError('TransformStream terminated');
        TransformStreamErrorWritableAndUnblockWrite(stream, error);
    }
    // TransformStreamDefaultSink Algorithms
    function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
        const controller = stream._transformStreamController;
        if (stream._backpressure) {
            const backpressureChangePromise = stream._backpressureChangePromise;
            return transformPromiseWith(backpressureChangePromise, () => {
                const writable = stream._writable;
                const state = writable._state;
                if (state === 'erroring') {
                    throw writable._storedError;
                }
                return TransformStreamDefaultControllerPerformTransform(controller, chunk);
            });
        }
        return TransformStreamDefaultControllerPerformTransform(controller, chunk);
    }
    function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
        // abort() is not called synchronously, so it is possible for abort() to be called when the stream is already
        // errored.
        TransformStreamError(stream, reason);
        return promiseResolvedWith(undefined);
    }
    function TransformStreamDefaultSinkCloseAlgorithm(stream) {
        // stream._readable cannot change after construction, so caching it across a call to user code is safe.
        const readable = stream._readable;
        const controller = stream._transformStreamController;
        const flushPromise = controller._flushAlgorithm();
        TransformStreamDefaultControllerClearAlgorithms(controller);
        // Return a promise that is fulfilled with undefined on success.
        return transformPromiseWith(flushPromise, () => {
            if (readable._state === 'errored') {
                throw readable._storedError;
            }
            ReadableStreamDefaultControllerClose(readable._readableStreamController);
        }, r => {
            TransformStreamError(stream, r);
            throw readable._storedError;
        });
    }
    // TransformStreamDefaultSource Algorithms
    function TransformStreamDefaultSourcePullAlgorithm(stream) {
        // Invariant. Enforced by the promises returned by start() and pull().
        TransformStreamSetBackpressure(stream, false);
        // Prevent the next pull() call until there is backpressure.
        return stream._backpressureChangePromise;
    }
    // Helper functions for the TransformStreamDefaultController.
    function defaultControllerBrandCheckException(name) {
        return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
    }
    // Helper functions for the TransformStream.
    function streamBrandCheckException(name) {
        return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
    }

    exports.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
    exports.CountQueuingStrategy = CountQueuingStrategy;
    exports.ReadableByteStreamController = ReadableByteStreamController;
    exports.ReadableStream = ReadableStream;
    exports.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
    exports.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
    exports.ReadableStreamDefaultController = ReadableStreamDefaultController;
    exports.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
    exports.TransformStream = TransformStream;
    exports.TransformStreamDefaultController = TransformStreamDefaultController;
    exports.WritableStream = WritableStream;
    exports.WritableStreamDefaultController = WritableStreamDefaultController;
    exports.WritableStreamDefaultWriter = WritableStreamDefaultWriter;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ponyfill.es2018.js.map


/***/ }),

/***/ 4300:
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ 6113:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 2361:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 7147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 1808:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 7742:
/***/ ((module) => {

"use strict";
module.exports = require("node:process");

/***/ }),

/***/ 2477:
/***/ ((module) => {

"use strict";
module.exports = require("node:stream/web");

/***/ }),

/***/ 2781:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 9512:
/***/ ((module) => {

"use strict";
module.exports = require("timers");

/***/ }),

/***/ 4404:
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ 7310:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 3837:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 1267:
/***/ ((module) => {

"use strict";
module.exports = require("worker_threads");

/***/ }),

/***/ 7135:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* c8 ignore start */
// 64 KiB (same size chrome slice theirs blob into Uint8array's)
const POOL_SIZE = 65536

if (!globalThis.ReadableStream) {
  // `node:stream/web` got introduced in v16.5.0 as experimental
  // and it's preferred over the polyfilled version. So we also
  // suppress the warning that gets emitted by NodeJS for using it.
  try {
    const process = __webpack_require__(7742)
    const { emitWarning } = process
    try {
      process.emitWarning = () => {}
      Object.assign(globalThis, __webpack_require__(2477))
      process.emitWarning = emitWarning
    } catch (error) {
      process.emitWarning = emitWarning
      throw error
    }
  } catch (error) {
    // fallback to polyfill implementation
    Object.assign(globalThis, __webpack_require__(2660))
  }
}

try {
  // Don't use node: prefix for this, require+node: is not supported until node v14.14
  // Only `import()` can use prefix in 12.20 and later
  const { Blob } = __webpack_require__(4300)
  if (Blob && !Blob.prototype.stream) {
    Blob.prototype.stream = function name (params) {
      let position = 0
      const blob = this

      return new ReadableStream({
        type: 'bytes',
        async pull (ctrl) {
          const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE))
          const buffer = await chunk.arrayBuffer()
          position += buffer.byteLength
          ctrl.enqueue(new Uint8Array(buffer))

          if (position === blob.size) {
            ctrl.close()
          }
        }
      })
    }
  }
} catch (error) {}
/* c8 ignore end */


/***/ }),

/***/ 4193:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* unused harmony export File */
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5006);


const _File = class File extends _index_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z {
  #lastModified = 0
  #name = ''

  /**
   * @param {*[]} fileBits
   * @param {string} fileName
   * @param {{lastModified?: number, type?: string}} options
   */// @ts-ignore
  constructor (fileBits, fileName, options = {}) {
    if (arguments.length < 2) {
      throw new TypeError(`Failed to construct 'File': 2 arguments required, but only ${arguments.length} present.`)
    }
    super(fileBits, options)

    if (options === null) options = {}

    // Simulate WebIDL type casting for NaN value in lastModified option.
    const lastModified = options.lastModified === undefined ? Date.now() : Number(options.lastModified)
    if (!Number.isNaN(lastModified)) {
      this.#lastModified = lastModified
    }

    this.#name = String(fileName)
  }

  get name () {
    return this.#name
  }

  get lastModified () {
    return this.#lastModified
  }

  get [Symbol.toStringTag] () {
    return 'File'
  }

  static [Symbol.hasInstance] (object) {
    return !!object && object instanceof _index_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z &&
      /^(File)$/.test(object[Symbol.toStringTag])
  }
}

/** @type {typeof globalThis.File} */// @ts-ignore
const File = _File
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (File);


/***/ }),

/***/ 749:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "$B": () => (/* reexport */ file/* default */.Z)
});

// UNUSED EXPORTS: Blob, blobFrom, blobFromSync, default, fileFrom, fileFromSync

;// CONCATENATED MODULE: external "node:fs"
const external_node_fs_namespaceObject = require("node:fs");
;// CONCATENATED MODULE: external "node:path"
const external_node_path_namespaceObject = require("node:path");
// EXTERNAL MODULE: ./node_modules/node-domexception/index.js
var node_domexception = __webpack_require__(3414);
// EXTERNAL MODULE: ./node_modules/fetch-blob/file.js
var file = __webpack_require__(4193);
// EXTERNAL MODULE: ./node_modules/fetch-blob/index.js
var fetch_blob = __webpack_require__(5006);
;// CONCATENATED MODULE: ./node_modules/fetch-blob/from.js







const { stat } = external_node_fs_namespaceObject.promises

/**
 * @param {string} path filepath on the disk
 * @param {string} [type] mimetype to use
 */
const blobFromSync = (path, type) => fromBlob(statSync(path), path, type)

/**
 * @param {string} path filepath on the disk
 * @param {string} [type] mimetype to use
 * @returns {Promise<Blob>}
 */
const blobFrom = (path, type) => stat(path).then(stat => fromBlob(stat, path, type))

/**
 * @param {string} path filepath on the disk
 * @param {string} [type] mimetype to use
 * @returns {Promise<File>}
 */
const fileFrom = (path, type) => stat(path).then(stat => fromFile(stat, path, type))

/**
 * @param {string} path filepath on the disk
 * @param {string} [type] mimetype to use
 */
const fileFromSync = (path, type) => fromFile(statSync(path), path, type)

// @ts-ignore
const fromBlob = (stat, path, type = '') => new Blob([new BlobDataItem({
  path,
  size: stat.size,
  lastModified: stat.mtimeMs,
  start: 0
})], { type })

// @ts-ignore
const fromFile = (stat, path, type = '') => new File([new BlobDataItem({
  path,
  size: stat.size,
  lastModified: stat.mtimeMs,
  start: 0
})], basename(path), { type, lastModified: stat.mtimeMs })

/**
 * This is a blob backed up by a file on the disk
 * with minium requirement. Its wrapped around a Blob as a blobPart
 * so you have no direct access to this.
 *
 * @private
 */
class BlobDataItem {
  #path
  #start

  constructor (options) {
    this.#path = options.path
    this.#start = options.start
    this.size = options.size
    this.lastModified = options.lastModified
    this.originalSize = options.originalSize === undefined
      ? options.size
      : options.originalSize
  }

  /**
   * Slicing arguments is first validated and formatted
   * to not be out of range by Blob.prototype.slice
   */
  slice (start, end) {
    return new BlobDataItem({
      path: this.#path,
      lastModified: this.lastModified,
      originalSize: this.originalSize,
      size: end - start,
      start: this.#start + start
    })
  }

  async * stream () {
    const { mtimeMs, size } = await stat(this.#path)

    if (mtimeMs > this.lastModified || this.originalSize !== size) {
      throw new DOMException('The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.', 'NotReadableError')
    }

    yield * createReadStream(this.#path, {
      start: this.#start,
      end: this.#start + this.size - 1
    })
  }

  get [Symbol.toStringTag] () {
    return 'Blob'
  }
}

/* harmony default export */ const from = ((/* unused pure expression or super */ null && (blobFromSync)));



/***/ }),

/***/ 5006:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* unused harmony export Blob */
/* harmony import */ var _streams_cjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7135);
/*! fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

// TODO (jimmywarting): in the feature use conditional loading with top level await (requires 14.x)
// Node has recently added whatwg stream into core



// 64 KiB (same size chrome slice theirs blob into Uint8array's)
const POOL_SIZE = 65536

/** @param {(Blob | Uint8Array)[]} parts */
async function * toIterator (parts, clone = true) {
  for (const part of parts) {
    if ('stream' in part) {
      yield * (/** @type {AsyncIterableIterator<Uint8Array>} */ (part.stream()))
    } else if (ArrayBuffer.isView(part)) {
      if (clone) {
        let position = part.byteOffset
        const end = part.byteOffset + part.byteLength
        while (position !== end) {
          const size = Math.min(end - position, POOL_SIZE)
          const chunk = part.buffer.slice(position, position + size)
          position += chunk.byteLength
          yield new Uint8Array(chunk)
        }
      } else {
        yield part
      }
    /* c8 ignore next 10 */
    } else {
      // For blobs that have arrayBuffer but no stream method (nodes buffer.Blob)
      let position = 0, b = (/** @type {Blob} */ (part))
      while (position !== b.size) {
        const chunk = b.slice(position, Math.min(b.size, position + POOL_SIZE))
        const buffer = await chunk.arrayBuffer()
        position += buffer.byteLength
        yield new Uint8Array(buffer)
      }
    }
  }
}

const _Blob = class Blob {
  /** @type {Array.<(Blob|Uint8Array)>} */
  #parts = []
  #type = ''
  #size = 0
  #endings = 'transparent'

  /**
   * The Blob() constructor returns a new Blob object. The content
   * of the blob consists of the concatenation of the values given
   * in the parameter array.
   *
   * @param {*} blobParts
   * @param {{ type?: string, endings?: string }} [options]
   */
  constructor (blobParts = [], options = {}) {
    if (typeof blobParts !== 'object' || blobParts === null) {
      throw new TypeError('Failed to construct \'Blob\': The provided value cannot be converted to a sequence.')
    }

    if (typeof blobParts[Symbol.iterator] !== 'function') {
      throw new TypeError('Failed to construct \'Blob\': The object must have a callable @@iterator property.')
    }

    if (typeof options !== 'object' && typeof options !== 'function') {
      throw new TypeError('Failed to construct \'Blob\': parameter 2 cannot convert to dictionary.')
    }

    if (options === null) options = {}

    const encoder = new TextEncoder()
    for (const element of blobParts) {
      let part
      if (ArrayBuffer.isView(element)) {
        part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength))
      } else if (element instanceof ArrayBuffer) {
        part = new Uint8Array(element.slice(0))
      } else if (element instanceof Blob) {
        part = element
      } else {
        part = encoder.encode(`${element}`)
      }

      const size = ArrayBuffer.isView(part) ? part.byteLength : part.size
      // Avoid pushing empty parts into the array to better GC them
      if (size) {
        this.#size += size
        this.#parts.push(part)
      }
    }

    this.#endings = `${options.endings === undefined ? 'transparent' : options.endings}`
    const type = options.type === undefined ? '' : String(options.type)
    this.#type = /^[\x20-\x7E]*$/.test(type) ? type : ''
  }

  /**
   * The Blob interface's size property returns the
   * size of the Blob in bytes.
   */
  get size () {
    return this.#size
  }

  /**
   * The type property of a Blob object returns the MIME type of the file.
   */
  get type () {
    return this.#type
  }

  /**
   * The text() method in the Blob interface returns a Promise
   * that resolves with a string containing the contents of
   * the blob, interpreted as UTF-8.
   *
   * @return {Promise<string>}
   */
  async text () {
    // More optimized than using this.arrayBuffer()
    // that requires twice as much ram
    const decoder = new TextDecoder()
    let str = ''
    for await (const part of toIterator(this.#parts, false)) {
      str += decoder.decode(part, { stream: true })
    }
    // Remaining
    str += decoder.decode()
    return str
  }

  /**
   * The arrayBuffer() method in the Blob interface returns a
   * Promise that resolves with the contents of the blob as
   * binary data contained in an ArrayBuffer.
   *
   * @return {Promise<ArrayBuffer>}
   */
  async arrayBuffer () {
    // Easier way... Just a unnecessary overhead
    // const view = new Uint8Array(this.size);
    // await this.stream().getReader({mode: 'byob'}).read(view);
    // return view.buffer;

    const data = new Uint8Array(this.size)
    let offset = 0
    for await (const chunk of toIterator(this.#parts, false)) {
      data.set(chunk, offset)
      offset += chunk.length
    }

    return data.buffer
  }

  stream () {
    const it = toIterator(this.#parts, true)

    return new globalThis.ReadableStream({
      // @ts-ignore
      type: 'bytes',
      async pull (ctrl) {
        const chunk = await it.next()
        chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value)
      },

      async cancel () {
        await it.return()
      }
    })
  }

  /**
   * The Blob interface's slice() method creates and returns a
   * new Blob object which contains data from a subset of the
   * blob on which it's called.
   *
   * @param {number} [start]
   * @param {number} [end]
   * @param {string} [type]
   */
  slice (start = 0, end = this.size, type = '') {
    const { size } = this

    let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size)
    let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size)

    const span = Math.max(relativeEnd - relativeStart, 0)
    const parts = this.#parts
    const blobParts = []
    let added = 0

    for (const part of parts) {
      // don't add the overflow to new blobParts
      if (added >= span) {
        break
      }

      const size = ArrayBuffer.isView(part) ? part.byteLength : part.size
      if (relativeStart && size <= relativeStart) {
        // Skip the beginning and change the relative
        // start & end position as we skip the unwanted parts
        relativeStart -= size
        relativeEnd -= size
      } else {
        let chunk
        if (ArrayBuffer.isView(part)) {
          chunk = part.subarray(relativeStart, Math.min(size, relativeEnd))
          added += chunk.byteLength
        } else {
          chunk = part.slice(relativeStart, Math.min(size, relativeEnd))
          added += chunk.size
        }
        relativeEnd -= size
        blobParts.push(chunk)
        relativeStart = 0 // All next sequential parts should start at 0
      }
    }

    const blob = new Blob([], { type: String(type).toLowerCase() })
    blob.#size = span
    blob.#parts = blobParts

    return blob
  }

  get [Symbol.toStringTag] () {
    return 'Blob'
  }

  static [Symbol.hasInstance] (object) {
    return (
      object &&
      typeof object === 'object' &&
      typeof object.constructor === 'function' &&
      (
        typeof object.stream === 'function' ||
        typeof object.arrayBuffer === 'function'
      ) &&
      /^(Blob|File)$/.test(object[Symbol.toStringTag])
    )
  }
}

Object.defineProperties(_Blob.prototype, {
  size: { enumerable: true },
  type: { enumerable: true },
  slice: { enumerable: true }
})

/** @type {typeof globalThis.Blob} */
const Blob = _Blob
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Blob);


/***/ }),

/***/ 9951:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Ct": () => (/* binding */ FormData),
/* harmony export */   "au": () => (/* binding */ formDataToBlob)
/* harmony export */ });
/* unused harmony export File */
/* harmony import */ var fetch_blob__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5006);
/* harmony import */ var fetch_blob_file_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4193);
/*! formdata-polyfill. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */




var {toStringTag:t,iterator:i,hasInstance:h}=Symbol,
r=Math.random,
m='append,set,get,getAll,delete,keys,values,entries,forEach,constructor'.split(','),
f=(a,b,c)=>(a+='',/^(Blob|File)$/.test(b && b[t])?[(c=c!==void 0?c+'':b[t]=='File'?b.name:'blob',a),b.name!==c||b[t]=='blob'?new fetch_blob_file_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z([b],c,b):b]:[a,b+'']),
e=(c,f)=>(f?c:c.replace(/\r?\n|\r/g,'\r\n')).replace(/\n/g,'%0A').replace(/\r/g,'%0D').replace(/"/g,'%22'),
x=(n, a, e)=>{if(a.length<e){throw new TypeError(`Failed to execute '${n}' on 'FormData': ${e} arguments required, but only ${a.length} present.`)}}

const File = (/* unused pure expression or super */ null && (F))

/** @type {typeof globalThis.FormData} */
const FormData = class FormData {
#d=[];
constructor(...a){if(a.length)throw new TypeError(`Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'.`)}
get [t]() {return 'FormData'}
[i](){return this.entries()}
static [h](o) {return o&&typeof o==='object'&&o[t]==='FormData'&&!m.some(m=>typeof o[m]!='function')}
append(...a){x('append',arguments,2);this.#d.push(f(...a))}
delete(a){x('delete',arguments,1);a+='';this.#d=this.#d.filter(([b])=>b!==a)}
get(a){x('get',arguments,1);a+='';for(var b=this.#d,l=b.length,c=0;c<l;c++)if(b[c][0]===a)return b[c][1];return null}
getAll(a,b){x('getAll',arguments,1);b=[];a+='';this.#d.forEach(c=>c[0]===a&&b.push(c[1]));return b}
has(a){x('has',arguments,1);a+='';return this.#d.some(b=>b[0]===a)}
forEach(a,b){x('forEach',arguments,1);for(var [c,d]of this)a.call(b,d,c,this)}
set(...a){x('set',arguments,2);var b=[],c=!0;a=f(...a);this.#d.forEach(d=>{d[0]===a[0]?c&&(c=!b.push(a)):b.push(d)});c&&b.push(a);this.#d=b}
*entries(){yield*this.#d}
*keys(){for(var[a]of this)yield a}
*values(){for(var[,a]of this)yield a}}

/** @param {FormData} F */
function formDataToBlob (F,B=fetch_blob__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z){
var b=`${r()}${r()}`.replace(/\./g, '').slice(-28).padStart(32, '-'),c=[],p=`--${b}\r\nContent-Disposition: form-data; name="`
F.forEach((v,n)=>typeof v=='string'
?c.push(p+e(n)+`"\r\n\r\n${v.replace(/\r(?!\n)|(?<!\r)\n/g, '\r\n')}\r\n`)
:c.push(p+e(n)+`"; filename="${e(v.name, 1)}"\r\nContent-Type: ${v.type||"application/octet-stream"}\r\n\r\n`, v, '\r\n'))
c.push(`--${b}--`)
return new B(c,{type:"multipart/form-data; boundary="+b})}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/require chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "loaded", otherwise not loaded yet
/******/ 		var installedChunks = {
/******/ 			179: 1
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		var installChunk = (chunk) => {
/******/ 			var moreModules = chunk.modules, chunkIds = chunk.ids, runtime = chunk.runtime;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			for(var i = 0; i < chunkIds.length; i++)
/******/ 				installedChunks[chunkIds[i]] = 1;
/******/ 		
/******/ 		};
/******/ 		
/******/ 		// require() chunk loading for javascript
/******/ 		__webpack_require__.f.require = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					installChunk(require("./" + __webpack_require__.u(chunkId)));
/******/ 				} else installedChunks[chunkId] = 1;
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		// no external install chunk
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/mysql/index.js
var mysql = __webpack_require__(4426);
;// CONCATENATED MODULE: ./src/databasestorage/dataaccess.js


class e_ClipAudioGenerationStatus {
  static NoAudio = 1;
  static GeneratingAudio = 2;
  static ErrorGeneratingAudio = 3;
  static HasAudio = 4;

  constructor(value) {
      this.Value = value;
  }
}
//Test functions
function GetTestInfo()
{
  try {
    let query = "select count(*) as NumCourses FROM IA_VoiceSynth.Courses"; 
    return SQLQuery(query);
  }
  catch (err)
  {
    console.log(err);
    return err.message;
  }
}

function GetPronunciations (pooledConnection)
{
    let query = "SELECT * FROM IA_VoiceSynth.Pronunciations";
    return SQLQuery(query,"", pooledConnection);
}

async function GetClipDetails(clipID, pooledConnection)
{
  //This is everything except AudioClip, which is binary data.
  //Consider moving AudioClip to a filestore (S3) or a separate table.
  let querySlides = `SELECT ID, SlideID, ClipText, VoiceID, OrdinalValue, Volume,Speed, Delay, Approved, (audioclip is not null) as HasAudio, ClipStatusID
     FROM IA_VoiceSynth.Clips as Clips Where Clips.ID = ?`;
  let valuesSlides = [clipID];
  let clips = await SQLQuery(querySlides, valuesSlides, pooledConnection);

  let clip = clips[0];
  console.log("Loading Clip:" + clipID)
  return clip;
}

async function GetClipAudio(clipID, pooledConnection)
{
  let querySlides = `SELECT ID, SlideID, ClipText, VoiceID, OrdinalValue, Volume,Speed, Delay, Approved, AudioClip
     FROM IA_VoiceSynth.Clips as Clips Where Clips.ID = ?`;
  let valuesSlides = [clipID];
  let clips = await SQLQuery(querySlides, valuesSlides, pooledConnection);

  let clip = clips[0];
  return clip;
}
//this function updates the entire clip AND resets the audio to null.
async function UpdateClip(clip, pooledConnection)
{
  //Check Clip
  let error = false;
  let errorString = "";
  if (!clip.SlideID){
    error = true;
    errorString += "Invalid SlideID\n";
  }
  if (!clip.VoiceID) {
    error = true;
    errorString += "Invalid VoiceID\n";
  }
  if (!clip.ClipID) {
    error = true;
    errorString += "Invalid ClipID\n";
  }

  let insert = `Update IA_VoiceSynth.Clips set VoiceID = ?, OrdinalValue = ?, ClipText = ?, Volume =?, Speed=?, Delay=?, ClipStatusID =?, AudioClip = null Where ID = ?`;
  let values = [clip.VoiceID, clip.OrdinalValue, clip.ClipText, clip.Volume,clip.Speed,clip.Delay, clip.ClipStatusID, clip.ID];

  SQLQuery(insert, values, pooledConnection);

}
async function UpdateClipAudio(clipID, audioBuffer, pooledConnection)
{
  //Check Clip
  var result = {
    Successful: true,
    errorString: "",
  }
  if (!clipID) {
    result.Successful = false;
    result.errorString += "Invalid ClipID\n";
    return result;
  }

  let insert = `Update IA_VoiceSynth.Clips set AudioClip = ? Where ID = ?`;
  let values = [audioBuffer, clipID];
  
  var res = await SQLQuery(insert, values, pooledConnection); //TODO check for DB failure here.

  console.log('Update Audio Clip results:', res)

  return result;

}

async function LogClipGeneration(User, Text, pooledConnection) {
  return CreateLogEntry(LogTypes.ClipGenerated, User, Text, pooledConnection);
}
async function LogError(Err) {
  return LogErrorMessage(Err.message)
}
async function LogErrorMessage(Message) {
  return CreateLogEntry(LogTypes.Error, `Unknown`, Message);
}

async function CreateLogEntry(LogType, User, Message, pooledConnection) {


  let insert = 'Insert into IA_VoiceSynth.LogEntry (ID, User, LogType, Message) Values (UUID_TO_BIN(UUID()),?,?,?)';
  let values = [User, LogType, Message];

  return await SQLQuery(insert, values, pooledConnection);

}
async function UpdateClipAudioStatus(clipID, newStatus, errorMessage, pooledConnection)
{
  console.log("Start UpdateClipAudioStatus")
  if (!Object.values(e_ClipAudioGenerationStatus).some(val => val == newStatus))
  {
    return console.error("Invalid Status");
  }
  let update = `Update IA_VoiceSynth.Clips set ClipAudioState = ? , ClipAudioStateErrorMessage = ? Where ID = ?`;
  let values = [newStatus, errorMessage ?? "", clipID];
  await SQLQuery(update,values, pooledConnection)

}


function getConObj()
{
  return {
    host: process.env.SQL_Host,
    user: process.env.SQL_User,
    password: process.env.SQL_PWD,
    database: process.env.SQL_Schema
  };

}


function getCon()
{
    const conObj = getConObj();
    return mysql.createConnection(conObj);
}

//Create a pooled connection that can be used multiple times.
function getPooledConnection()
{
  return new Promise( function (resolve, reject) {
    const con = getCon();

    con.connect(function(err) {
      if (err) {
        console.log( err);
        resolve(err.message);
      }
      resolve(con);
    });
  });
}
function resolvePooledConnection(con)
{
  con.destroy();
}

async function SQLQuery(query, values, pooledConnection)
{
    try {
      return new Promise( async function (resolve, reject) {

        const con = pooledConnection ?? await getPooledConnection()

        con.query(query, values, function (error, results, fields) {
          if (error) {
            console.log('Query Error');
            console.log(error)
            if (pooledConnection == null) {
              con.destroy();
            }
            resolve(error.message);
          }
          if (pooledConnection == null) {
            con.destroy();
          }
          resolve( results);
        });
      });
  }
  catch (error)
  {
      console.error(error)
      return error.message;
  }
}

;// CONCATENATED MODULE: external "node:http"
const external_node_http_namespaceObject = require("node:http");
;// CONCATENATED MODULE: external "node:https"
const external_node_https_namespaceObject = require("node:https");
;// CONCATENATED MODULE: external "node:zlib"
const external_node_zlib_namespaceObject = require("node:zlib");
;// CONCATENATED MODULE: external "node:stream"
const external_node_stream_namespaceObject = require("node:stream");
;// CONCATENATED MODULE: external "node:buffer"
const external_node_buffer_namespaceObject = require("node:buffer");
;// CONCATENATED MODULE: ./node_modules/data-uri-to-buffer/dist/index.js
/**
 * Returns a `Buffer` instance from the given data URI `uri`.
 *
 * @param {String} uri Data URI to turn into a Buffer instance
 * @returns {Buffer} Buffer instance from Data URI
 * @api public
 */
function dataUriToBuffer(uri) {
    if (!/^data:/i.test(uri)) {
        throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
    }
    // strip newlines
    uri = uri.replace(/\r?\n/g, '');
    // split the URI up into the "metadata" and the "data" portions
    const firstComma = uri.indexOf(',');
    if (firstComma === -1 || firstComma <= 4) {
        throw new TypeError('malformed data: URI');
    }
    // remove the "data:" scheme and parse the metadata
    const meta = uri.substring(5, firstComma).split(';');
    let charset = '';
    let base64 = false;
    const type = meta[0] || 'text/plain';
    let typeFull = type;
    for (let i = 1; i < meta.length; i++) {
        if (meta[i] === 'base64') {
            base64 = true;
        }
        else {
            typeFull += `;${meta[i]}`;
            if (meta[i].indexOf('charset=') === 0) {
                charset = meta[i].substring(8);
            }
        }
    }
    // defaults to US-ASCII only if type is not provided
    if (!meta[0] && !charset.length) {
        typeFull += ';charset=US-ASCII';
        charset = 'US-ASCII';
    }
    // get the encoded data portion and decode URI-encoded chars
    const encoding = base64 ? 'base64' : 'ascii';
    const data = unescape(uri.substring(firstComma + 1));
    const buffer = Buffer.from(data, encoding);
    // set `.type` and `.typeFull` properties to MIME type
    buffer.type = type;
    buffer.typeFull = typeFull;
    // set the `.charset` property
    buffer.charset = charset;
    return buffer;
}
/* harmony default export */ const dist = (dataUriToBuffer);
//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: external "node:util"
const external_node_util_namespaceObject = require("node:util");
// EXTERNAL MODULE: ./node_modules/fetch-blob/index.js
var fetch_blob = __webpack_require__(5006);
// EXTERNAL MODULE: ./node_modules/formdata-polyfill/esm.min.js
var esm_min = __webpack_require__(9951);
;// CONCATENATED MODULE: ./node_modules/node-fetch/src/errors/base.js
class FetchBaseError extends Error {
	constructor(message, type) {
		super(message);
		// Hide custom error implementation details from end-users
		Error.captureStackTrace(this, this.constructor);

		this.type = type;
	}

	get name() {
		return this.constructor.name;
	}

	get [Symbol.toStringTag]() {
		return this.constructor.name;
	}
}

;// CONCATENATED MODULE: ./node_modules/node-fetch/src/errors/fetch-error.js



/**
 * @typedef {{ address?: string, code: string, dest?: string, errno: number, info?: object, message: string, path?: string, port?: number, syscall: string}} SystemError
*/

/**
 * FetchError interface for operational errors
 */
class FetchError extends FetchBaseError {
	/**
	 * @param  {string} message -      Error message for human
	 * @param  {string} [type] -        Error type for machine
	 * @param  {SystemError} [systemError] - For Node.js system error
	 */
	constructor(message, type, systemError) {
		super(message, type);
		// When err.type is `system`, err.erroredSysCall contains system error and err.code contains system error code
		if (systemError) {
			// eslint-disable-next-line no-multi-assign
			this.code = this.errno = systemError.code;
			this.erroredSysCall = systemError.syscall;
		}
	}
}

;// CONCATENATED MODULE: ./node_modules/node-fetch/src/utils/is.js
/**
 * Is.js
 *
 * Object type checks.
 */

const NAME = Symbol.toStringTag;

/**
 * Check if `obj` is a URLSearchParams object
 * ref: https://github.com/node-fetch/node-fetch/issues/296#issuecomment-307598143
 * @param {*} object - Object to check for
 * @return {boolean}
 */
const isURLSearchParameters = object => {
	return (
		typeof object === 'object' &&
		typeof object.append === 'function' &&
		typeof object.delete === 'function' &&
		typeof object.get === 'function' &&
		typeof object.getAll === 'function' &&
		typeof object.has === 'function' &&
		typeof object.set === 'function' &&
		typeof object.sort === 'function' &&
		object[NAME] === 'URLSearchParams'
	);
};

/**
 * Check if `object` is a W3C `Blob` object (which `File` inherits from)
 * @param {*} object - Object to check for
 * @return {boolean}
 */
const isBlob = object => {
	return (
		object &&
		typeof object === 'object' &&
		typeof object.arrayBuffer === 'function' &&
		typeof object.type === 'string' &&
		typeof object.stream === 'function' &&
		typeof object.constructor === 'function' &&
		/^(Blob|File)$/.test(object[NAME])
	);
};

/**
 * Check if `obj` is an instance of AbortSignal.
 * @param {*} object - Object to check for
 * @return {boolean}
 */
const isAbortSignal = object => {
	return (
		typeof object === 'object' && (
			object[NAME] === 'AbortSignal' ||
			object[NAME] === 'EventTarget'
		)
	);
};

/**
 * isDomainOrSubdomain reports whether sub is a subdomain (or exact match) of
 * the parent domain.
 *
 * Both domains must already be in canonical form.
 * @param {string|URL} original
 * @param {string|URL} destination
 */
const isDomainOrSubdomain = (destination, original) => {
	const orig = new URL(original).hostname;
	const dest = new URL(destination).hostname;

	return orig === dest || orig.endsWith(`.${dest}`);
};

;// CONCATENATED MODULE: ./node_modules/node-fetch/src/body.js

/**
 * Body.js
 *
 * Body interface provides common methods for Request and Response
 */












const pipeline = (0,external_node_util_namespaceObject.promisify)(external_node_stream_namespaceObject.pipeline);
const INTERNALS = Symbol('Body internals');

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Body {
	constructor(body, {
		size = 0
	} = {}) {
		let boundary = null;

		if (body === null) {
			// Body is undefined or null
			body = null;
		} else if (isURLSearchParameters(body)) {
			// Body is a URLSearchParams
			body = external_node_buffer_namespaceObject.Buffer.from(body.toString());
		} else if (isBlob(body)) {
			// Body is blob
		} else if (external_node_buffer_namespaceObject.Buffer.isBuffer(body)) {
			// Body is Buffer
		} else if (external_node_util_namespaceObject.types.isAnyArrayBuffer(body)) {
			// Body is ArrayBuffer
			body = external_node_buffer_namespaceObject.Buffer.from(body);
		} else if (ArrayBuffer.isView(body)) {
			// Body is ArrayBufferView
			body = external_node_buffer_namespaceObject.Buffer.from(body.buffer, body.byteOffset, body.byteLength);
		} else if (body instanceof external_node_stream_namespaceObject) {
			// Body is stream
		} else if (body instanceof esm_min/* FormData */.Ct) {
			// Body is FormData
			body = (0,esm_min/* formDataToBlob */.au)(body);
			boundary = body.type.split('=')[1];
		} else {
			// None of the above
			// coerce to string then buffer
			body = external_node_buffer_namespaceObject.Buffer.from(String(body));
		}

		let stream = body;

		if (external_node_buffer_namespaceObject.Buffer.isBuffer(body)) {
			stream = external_node_stream_namespaceObject.Readable.from(body);
		} else if (isBlob(body)) {
			stream = external_node_stream_namespaceObject.Readable.from(body.stream());
		}

		this[INTERNALS] = {
			body,
			stream,
			boundary,
			disturbed: false,
			error: null
		};
		this.size = size;

		if (body instanceof external_node_stream_namespaceObject) {
			body.on('error', error_ => {
				const error = error_ instanceof FetchBaseError ?
					error_ :
					new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, 'system', error_);
				this[INTERNALS].error = error;
			});
		}
	}

	get body() {
		return this[INTERNALS].stream;
	}

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	}

	/**
	 * Decode response as ArrayBuffer
	 *
	 * @return  Promise
	 */
	async arrayBuffer() {
		const {buffer, byteOffset, byteLength} = await consumeBody(this);
		return buffer.slice(byteOffset, byteOffset + byteLength);
	}

	async formData() {
		const ct = this.headers.get('content-type');

		if (ct.startsWith('application/x-www-form-urlencoded')) {
			const formData = new esm_min/* FormData */.Ct();
			const parameters = new URLSearchParams(await this.text());

			for (const [name, value] of parameters) {
				formData.append(name, value);
			}

			return formData;
		}

		const {toFormData} = await __webpack_require__.e(/* import() */ 713).then(__webpack_require__.bind(__webpack_require__, 1713));
		return toFormData(this.body, ct);
	}

	/**
	 * Return raw response as Blob
	 *
	 * @return Promise
	 */
	async blob() {
		const ct = (this.headers && this.headers.get('content-type')) || (this[INTERNALS].body && this[INTERNALS].body.type) || '';
		const buf = await this.arrayBuffer();

		return new fetch_blob/* default */.Z([buf], {
			type: ct
		});
	}

	/**
	 * Decode response as json
	 *
	 * @return  Promise
	 */
	async json() {
		const text = await this.text();
		return JSON.parse(text);
	}

	/**
	 * Decode response as text
	 *
	 * @return  Promise
	 */
	async text() {
		const buffer = await consumeBody(this);
		return new TextDecoder().decode(buffer);
	}

	/**
	 * Decode response as buffer (non-spec api)
	 *
	 * @return  Promise
	 */
	buffer() {
		return consumeBody(this);
	}
}

Body.prototype.buffer = (0,external_node_util_namespaceObject.deprecate)(Body.prototype.buffer, 'Please use \'response.arrayBuffer()\' instead of \'response.buffer()\'', 'node-fetch#buffer');

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: {enumerable: true},
	bodyUsed: {enumerable: true},
	arrayBuffer: {enumerable: true},
	blob: {enumerable: true},
	json: {enumerable: true},
	text: {enumerable: true},
	data: {get: (0,external_node_util_namespaceObject.deprecate)(() => {},
		'data doesn\'t exist, use json(), text(), arrayBuffer(), or body instead',
		'https://github.com/node-fetch/node-fetch/issues/1000 (response)')}
});

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return Promise
 */
async function consumeBody(data) {
	if (data[INTERNALS].disturbed) {
		throw new TypeError(`body used already for: ${data.url}`);
	}

	data[INTERNALS].disturbed = true;

	if (data[INTERNALS].error) {
		throw data[INTERNALS].error;
	}

	const {body} = data;

	// Body is null
	if (body === null) {
		return external_node_buffer_namespaceObject.Buffer.alloc(0);
	}

	/* c8 ignore next 3 */
	if (!(body instanceof external_node_stream_namespaceObject)) {
		return external_node_buffer_namespaceObject.Buffer.alloc(0);
	}

	// Body is stream
	// get ready to actually consume the body
	const accum = [];
	let accumBytes = 0;

	try {
		for await (const chunk of body) {
			if (data.size > 0 && accumBytes + chunk.length > data.size) {
				const error = new FetchError(`content size at ${data.url} over limit: ${data.size}`, 'max-size');
				body.destroy(error);
				throw error;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		}
	} catch (error) {
		const error_ = error instanceof FetchBaseError ? error : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error.message}`, 'system', error);
		throw error_;
	}

	if (body.readableEnded === true || body._readableState.ended === true) {
		try {
			if (accum.every(c => typeof c === 'string')) {
				return external_node_buffer_namespaceObject.Buffer.from(accum.join(''));
			}

			return external_node_buffer_namespaceObject.Buffer.concat(accum, accumBytes);
		} catch (error) {
			throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error.message}`, 'system', error);
		}
	} else {
		throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
	}
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed   instance       Response or Request instance
 * @param   String  highWaterMark  highWaterMark for both PassThrough body streams
 * @return  Mixed
 */
const clone = (instance, highWaterMark) => {
	let p1;
	let p2;
	let {body} = instance[INTERNALS];

	// Don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// Check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if ((body instanceof external_node_stream_namespaceObject) && (typeof body.getBoundary !== 'function')) {
		// Tee instance body
		p1 = new external_node_stream_namespaceObject.PassThrough({highWaterMark});
		p2 = new external_node_stream_namespaceObject.PassThrough({highWaterMark});
		body.pipe(p1);
		body.pipe(p2);
		// Set instance body to teed body and return the other teed body
		instance[INTERNALS].stream = p1;
		body = p2;
	}

	return body;
};

const getNonSpecFormDataBoundary = (0,external_node_util_namespaceObject.deprecate)(
	body => body.getBoundary(),
	'form-data doesn\'t follow the spec and requires special treatment. Use alternative package',
	'https://github.com/node-fetch/node-fetch/issues/1167'
);

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param {any} body Any options.body input
 * @returns {string | null}
 */
const extractContentType = (body, request) => {
	// Body is null or undefined
	if (body === null) {
		return null;
	}

	// Body is string
	if (typeof body === 'string') {
		return 'text/plain;charset=UTF-8';
	}

	// Body is a URLSearchParams
	if (isURLSearchParameters(body)) {
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	}

	// Body is blob
	if (isBlob(body)) {
		return body.type || null;
	}

	// Body is a Buffer (Buffer, ArrayBuffer or ArrayBufferView)
	if (external_node_buffer_namespaceObject.Buffer.isBuffer(body) || external_node_util_namespaceObject.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
		return null;
	}

	if (body instanceof esm_min/* FormData */.Ct) {
		return `multipart/form-data; boundary=${request[INTERNALS].boundary}`;
	}

	// Detect form data input from form-data module
	if (body && typeof body.getBoundary === 'function') {
		return `multipart/form-data;boundary=${getNonSpecFormDataBoundary(body)}`;
	}

	// Body is stream - can't really do much about this
	if (body instanceof external_node_stream_namespaceObject) {
		return null;
	}

	// Body constructor defaults other things to string
	return 'text/plain;charset=UTF-8';
};

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param {any} obj.body Body object from the Body instance.
 * @returns {number | null}
 */
const getTotalBytes = request => {
	const {body} = request[INTERNALS];

	// Body is null or undefined
	if (body === null) {
		return 0;
	}

	// Body is Blob
	if (isBlob(body)) {
		return body.size;
	}

	// Body is Buffer
	if (external_node_buffer_namespaceObject.Buffer.isBuffer(body)) {
		return body.length;
	}

	// Detect form data input from form-data module
	if (body && typeof body.getLengthSync === 'function') {
		return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
	}

	// Body is stream
	return null;
};

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param {Stream.Writable} dest The stream to write to.
 * @param obj.body Body object from the Body instance.
 * @returns {Promise<void>}
 */
const writeToStream = async (dest, {body}) => {
	if (body === null) {
		// Body is null
		dest.end();
	} else {
		// Body is stream
		await pipeline(body, dest);
	}
};

;// CONCATENATED MODULE: ./node_modules/node-fetch/src/headers.js
/**
 * Headers.js
 *
 * Headers class offers convenient helpers
 */




/* c8 ignore next 9 */
const validateHeaderName = typeof external_node_http_namespaceObject.validateHeaderName === 'function' ?
	external_node_http_namespaceObject.validateHeaderName :
	name => {
		if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
			const error = new TypeError(`Header name must be a valid HTTP token [${name}]`);
			Object.defineProperty(error, 'code', {value: 'ERR_INVALID_HTTP_TOKEN'});
			throw error;
		}
	};

/* c8 ignore next 9 */
const validateHeaderValue = typeof external_node_http_namespaceObject.validateHeaderValue === 'function' ?
	external_node_http_namespaceObject.validateHeaderValue :
	(name, value) => {
		if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
			const error = new TypeError(`Invalid character in header content ["${name}"]`);
			Object.defineProperty(error, 'code', {value: 'ERR_INVALID_CHAR'});
			throw error;
		}
	};

/**
 * @typedef {Headers | Record<string, string> | Iterable<readonly [string, string]> | Iterable<Iterable<string>>} HeadersInit
 */

/**
 * This Fetch API interface allows you to perform various actions on HTTP request and response headers.
 * These actions include retrieving, setting, adding to, and removing.
 * A Headers object has an associated header list, which is initially empty and consists of zero or more name and value pairs.
 * You can add to this using methods like append() (see Examples.)
 * In all methods of this interface, header names are matched by case-insensitive byte sequence.
 *
 */
class Headers extends URLSearchParams {
	/**
	 * Headers class
	 *
	 * @constructor
	 * @param {HeadersInit} [init] - Response headers
	 */
	constructor(init) {
		// Validate and normalize init object in [name, value(s)][]
		/** @type {string[][]} */
		let result = [];
		if (init instanceof Headers) {
			const raw = init.raw();
			for (const [name, values] of Object.entries(raw)) {
				result.push(...values.map(value => [name, value]));
			}
		} else if (init == null) { // eslint-disable-line no-eq-null, eqeqeq
			// No op
		} else if (typeof init === 'object' && !external_node_util_namespaceObject.types.isBoxedPrimitive(init)) {
			const method = init[Symbol.iterator];
			// eslint-disable-next-line no-eq-null, eqeqeq
			if (method == null) {
				// Record<ByteString, ByteString>
				result.push(...Object.entries(init));
			} else {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// Sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				result = [...init]
					.map(pair => {
						if (
							typeof pair !== 'object' || external_node_util_namespaceObject.types.isBoxedPrimitive(pair)
						) {
							throw new TypeError('Each header pair must be an iterable object');
						}

						return [...pair];
					}).map(pair => {
						if (pair.length !== 2) {
							throw new TypeError('Each header pair must be a name/value tuple');
						}

						return [...pair];
					});
			}
		} else {
			throw new TypeError('Failed to construct \'Headers\': The provided value is not of type \'(sequence<sequence<ByteString>> or record<ByteString, ByteString>)');
		}

		// Validate and lowercase
		result =
			result.length > 0 ?
				result.map(([name, value]) => {
					validateHeaderName(name);
					validateHeaderValue(name, String(value));
					return [String(name).toLowerCase(), String(value)];
				}) :
				undefined;

		super(result);

		// Returning a Proxy that will lowercase key names, validate parameters and sort keys
		// eslint-disable-next-line no-constructor-return
		return new Proxy(this, {
			get(target, p, receiver) {
				switch (p) {
					case 'append':
					case 'set':
						return (name, value) => {
							validateHeaderName(name);
							validateHeaderValue(name, String(value));
							return URLSearchParams.prototype[p].call(
								target,
								String(name).toLowerCase(),
								String(value)
							);
						};

					case 'delete':
					case 'has':
					case 'getAll':
						return name => {
							validateHeaderName(name);
							return URLSearchParams.prototype[p].call(
								target,
								String(name).toLowerCase()
							);
						};

					case 'keys':
						return () => {
							target.sort();
							return new Set(URLSearchParams.prototype.keys.call(target)).keys();
						};

					default:
						return Reflect.get(target, p, receiver);
				}
			}
		});
		/* c8 ignore next */
	}

	get [Symbol.toStringTag]() {
		return this.constructor.name;
	}

	toString() {
		return Object.prototype.toString.call(this);
	}

	get(name) {
		const values = this.getAll(name);
		if (values.length === 0) {
			return null;
		}

		let value = values.join(', ');
		if (/^content-encoding$/i.test(name)) {
			value = value.toLowerCase();
		}

		return value;
	}

	forEach(callback, thisArg = undefined) {
		for (const name of this.keys()) {
			Reflect.apply(callback, thisArg, [this.get(name), name, this]);
		}
	}

	* values() {
		for (const name of this.keys()) {
			yield this.get(name);
		}
	}

	/**
	 * @type {() => IterableIterator<[string, string]>}
	 */
	* entries() {
		for (const name of this.keys()) {
			yield [name, this.get(name)];
		}
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	/**
	 * Node-fetch non-spec method
	 * returning all headers and their values as array
	 * @returns {Record<string, string[]>}
	 */
	raw() {
		return [...this.keys()].reduce((result, key) => {
			result[key] = this.getAll(key);
			return result;
		}, {});
	}

	/**
	 * For better console.log(headers) and also to convert Headers into Node.js Request compatible format
	 */
	[Symbol.for('nodejs.util.inspect.custom')]() {
		return [...this.keys()].reduce((result, key) => {
			const values = this.getAll(key);
			// Http.request() only supports string as Host header.
			// This hack makes specifying custom Host header possible.
			if (key === 'host') {
				result[key] = values[0];
			} else {
				result[key] = values.length > 1 ? values : values[0];
			}

			return result;
		}, {});
	}
}

/**
 * Re-shaping object for Web IDL tests
 * Only need to do it for overridden methods
 */
Object.defineProperties(
	Headers.prototype,
	['get', 'entries', 'forEach', 'values'].reduce((result, property) => {
		result[property] = {enumerable: true};
		return result;
	}, {})
);

/**
 * Create a Headers object from an http.IncomingMessage.rawHeaders, ignoring those that do
 * not conform to HTTP grammar productions.
 * @param {import('http').IncomingMessage['rawHeaders']} headers
 */
function fromRawHeaders(headers = []) {
	return new Headers(
		headers
			// Split into pairs
			.reduce((result, value, index, array) => {
				if (index % 2 === 0) {
					result.push(array.slice(index, index + 2));
				}

				return result;
			}, [])
			.filter(([name, value]) => {
				try {
					validateHeaderName(name);
					validateHeaderValue(name, String(value));
					return true;
				} catch {
					return false;
				}
			})

	);
}

;// CONCATENATED MODULE: ./node_modules/node-fetch/src/utils/is-redirect.js
const redirectStatus = new Set([301, 302, 303, 307, 308]);

/**
 * Redirect code matching
 *
 * @param {number} code - Status code
 * @return {boolean}
 */
const isRedirect = code => {
	return redirectStatus.has(code);
};

;// CONCATENATED MODULE: ./node_modules/node-fetch/src/response.js
/**
 * Response.js
 *
 * Response class provides content decoding
 */





const response_INTERNALS = Symbol('Response internals');

/**
 * Response class
 *
 * Ref: https://fetch.spec.whatwg.org/#response-class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response extends Body {
	constructor(body = null, options = {}) {
		super(body, options);

		// eslint-disable-next-line no-eq-null, eqeqeq, no-negated-condition
		const status = options.status != null ? options.status : 200;

		const headers = new Headers(options.headers);

		if (body !== null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body, this);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[response_INTERNALS] = {
			type: 'default',
			url: options.url,
			status,
			statusText: options.statusText || '',
			headers,
			counter: options.counter,
			highWaterMark: options.highWaterMark
		};
	}

	get type() {
		return this[response_INTERNALS].type;
	}

	get url() {
		return this[response_INTERNALS].url || '';
	}

	get status() {
		return this[response_INTERNALS].status;
	}

	/**
	 * Convenience property representing if the request ended normally
	 */
	get ok() {
		return this[response_INTERNALS].status >= 200 && this[response_INTERNALS].status < 300;
	}

	get redirected() {
		return this[response_INTERNALS].counter > 0;
	}

	get statusText() {
		return this[response_INTERNALS].statusText;
	}

	get headers() {
		return this[response_INTERNALS].headers;
	}

	get highWaterMark() {
		return this[response_INTERNALS].highWaterMark;
	}

	/**
	 * Clone this response
	 *
	 * @return  Response
	 */
	clone() {
		return new Response(clone(this, this.highWaterMark), {
			type: this.type,
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected,
			size: this.size,
			highWaterMark: this.highWaterMark
		});
	}

	/**
	 * @param {string} url    The URL that the new response is to originate from.
	 * @param {number} status An optional status code for the response (e.g., 302.)
	 * @returns {Response}    A Response object.
	 */
	static redirect(url, status = 302) {
		if (!isRedirect(status)) {
			throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
		}

		return new Response(null, {
			headers: {
				location: new URL(url).toString()
			},
			status
		});
	}

	static error() {
		const response = new Response(null, {status: 0, statusText: ''});
		response[response_INTERNALS].type = 'error';
		return response;
	}

	get [Symbol.toStringTag]() {
		return 'Response';
	}
}

Object.defineProperties(Response.prototype, {
	type: {enumerable: true},
	url: {enumerable: true},
	status: {enumerable: true},
	ok: {enumerable: true},
	redirected: {enumerable: true},
	statusText: {enumerable: true},
	headers: {enumerable: true},
	clone: {enumerable: true}
});

;// CONCATENATED MODULE: external "node:url"
const external_node_url_namespaceObject = require("node:url");
;// CONCATENATED MODULE: ./node_modules/node-fetch/src/utils/get-search.js
const getSearch = parsedURL => {
	if (parsedURL.search) {
		return parsedURL.search;
	}

	const lastOffset = parsedURL.href.length - 1;
	const hash = parsedURL.hash || (parsedURL.href[lastOffset] === '#' ? '#' : '');
	return parsedURL.href[lastOffset - hash.length] === '?' ? '?' : '';
};

;// CONCATENATED MODULE: external "node:net"
const external_node_net_namespaceObject = require("node:net");
;// CONCATENATED MODULE: ./node_modules/node-fetch/src/utils/referrer.js


/**
 * @external URL
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL|URL}
 */

/**
 * @module utils/referrer
 * @private
 */

/**
 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#strip-url|Referrer Policy §8.4. Strip url for use as a referrer}
 * @param {string} URL
 * @param {boolean} [originOnly=false]
 */
function stripURLForUseAsAReferrer(url, originOnly = false) {
	// 1. If url is null, return no referrer.
	if (url == null) { // eslint-disable-line no-eq-null, eqeqeq
		return 'no-referrer';
	}

	url = new URL(url);

	// 2. If url's scheme is a local scheme, then return no referrer.
	if (/^(about|blob|data):$/.test(url.protocol)) {
		return 'no-referrer';
	}

	// 3. Set url's username to the empty string.
	url.username = '';

	// 4. Set url's password to null.
	// Note: `null` appears to be a mistake as this actually results in the password being `"null"`.
	url.password = '';

	// 5. Set url's fragment to null.
	// Note: `null` appears to be a mistake as this actually results in the fragment being `"#null"`.
	url.hash = '';

	// 6. If the origin-only flag is true, then:
	if (originOnly) {
		// 6.1. Set url's path to null.
		// Note: `null` appears to be a mistake as this actually results in the path being `"/null"`.
		url.pathname = '';

		// 6.2. Set url's query to null.
		// Note: `null` appears to be a mistake as this actually results in the query being `"?null"`.
		url.search = '';
	}

	// 7. Return url.
	return url;
}

/**
 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#enumdef-referrerpolicy|enum ReferrerPolicy}
 */
const ReferrerPolicy = new Set([
	'',
	'no-referrer',
	'no-referrer-when-downgrade',
	'same-origin',
	'origin',
	'strict-origin',
	'origin-when-cross-origin',
	'strict-origin-when-cross-origin',
	'unsafe-url'
]);

/**
 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#default-referrer-policy|default referrer policy}
 */
const DEFAULT_REFERRER_POLICY = 'strict-origin-when-cross-origin';

/**
 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#referrer-policies|Referrer Policy §3. Referrer Policies}
 * @param {string} referrerPolicy
 * @returns {string} referrerPolicy
 */
function validateReferrerPolicy(referrerPolicy) {
	if (!ReferrerPolicy.has(referrerPolicy)) {
		throw new TypeError(`Invalid referrerPolicy: ${referrerPolicy}`);
	}

	return referrerPolicy;
}

/**
 * @see {@link https://w3c.github.io/webappsec-secure-contexts/#is-origin-trustworthy|Referrer Policy §3.2. Is origin potentially trustworthy?}
 * @param {external:URL} url
 * @returns `true`: "Potentially Trustworthy", `false`: "Not Trustworthy"
 */
function isOriginPotentiallyTrustworthy(url) {
	// 1. If origin is an opaque origin, return "Not Trustworthy".
	// Not applicable

	// 2. Assert: origin is a tuple origin.
	// Not for implementations

	// 3. If origin's scheme is either "https" or "wss", return "Potentially Trustworthy".
	if (/^(http|ws)s:$/.test(url.protocol)) {
		return true;
	}

	// 4. If origin's host component matches one of the CIDR notations 127.0.0.0/8 or ::1/128 [RFC4632], return "Potentially Trustworthy".
	const hostIp = url.host.replace(/(^\[)|(]$)/g, '');
	const hostIPVersion = (0,external_node_net_namespaceObject.isIP)(hostIp);

	if (hostIPVersion === 4 && /^127\./.test(hostIp)) {
		return true;
	}

	if (hostIPVersion === 6 && /^(((0+:){7})|(::(0+:){0,6}))0*1$/.test(hostIp)) {
		return true;
	}

	// 5. If origin's host component is "localhost" or falls within ".localhost", and the user agent conforms to the name resolution rules in [let-localhost-be-localhost], return "Potentially Trustworthy".
	// We are returning FALSE here because we cannot ensure conformance to
	// let-localhost-be-loalhost (https://tools.ietf.org/html/draft-west-let-localhost-be-localhost)
	if (/^(.+\.)*localhost$/.test(url.host)) {
		return false;
	}

	// 6. If origin's scheme component is file, return "Potentially Trustworthy".
	if (url.protocol === 'file:') {
		return true;
	}

	// 7. If origin's scheme component is one which the user agent considers to be authenticated, return "Potentially Trustworthy".
	// Not supported

	// 8. If origin has been configured as a trustworthy origin, return "Potentially Trustworthy".
	// Not supported

	// 9. Return "Not Trustworthy".
	return false;
}

/**
 * @see {@link https://w3c.github.io/webappsec-secure-contexts/#is-url-trustworthy|Referrer Policy §3.3. Is url potentially trustworthy?}
 * @param {external:URL} url
 * @returns `true`: "Potentially Trustworthy", `false`: "Not Trustworthy"
 */
function isUrlPotentiallyTrustworthy(url) {
	// 1. If url is "about:blank" or "about:srcdoc", return "Potentially Trustworthy".
	if (/^about:(blank|srcdoc)$/.test(url)) {
		return true;
	}

	// 2. If url's scheme is "data", return "Potentially Trustworthy".
	if (url.protocol === 'data:') {
		return true;
	}

	// Note: The origin of blob: and filesystem: URLs is the origin of the context in which they were
	// created. Therefore, blobs created in a trustworthy origin will themselves be potentially
	// trustworthy.
	if (/^(blob|filesystem):$/.test(url.protocol)) {
		return true;
	}

	// 3. Return the result of executing §3.2 Is origin potentially trustworthy? on url's origin.
	return isOriginPotentiallyTrustworthy(url);
}

/**
 * Modifies the referrerURL to enforce any extra security policy considerations.
 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer|Referrer Policy §8.3. Determine request's Referrer}, step 7
 * @callback module:utils/referrer~referrerURLCallback
 * @param {external:URL} referrerURL
 * @returns {external:URL} modified referrerURL
 */

/**
 * Modifies the referrerOrigin to enforce any extra security policy considerations.
 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer|Referrer Policy §8.3. Determine request's Referrer}, step 7
 * @callback module:utils/referrer~referrerOriginCallback
 * @param {external:URL} referrerOrigin
 * @returns {external:URL} modified referrerOrigin
 */

/**
 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer|Referrer Policy §8.3. Determine request's Referrer}
 * @param {Request} request
 * @param {object} o
 * @param {module:utils/referrer~referrerURLCallback} o.referrerURLCallback
 * @param {module:utils/referrer~referrerOriginCallback} o.referrerOriginCallback
 * @returns {external:URL} Request's referrer
 */
function determineRequestsReferrer(request, {referrerURLCallback, referrerOriginCallback} = {}) {
	// There are 2 notes in the specification about invalid pre-conditions.  We return null, here, for
	// these cases:
	// > Note: If request's referrer is "no-referrer", Fetch will not call into this algorithm.
	// > Note: If request's referrer policy is the empty string, Fetch will not call into this
	// > algorithm.
	if (request.referrer === 'no-referrer' || request.referrerPolicy === '') {
		return null;
	}

	// 1. Let policy be request's associated referrer policy.
	const policy = request.referrerPolicy;

	// 2. Let environment be request's client.
	// not applicable to node.js

	// 3. Switch on request's referrer:
	if (request.referrer === 'about:client') {
		return 'no-referrer';
	}

	// "a URL": Let referrerSource be request's referrer.
	const referrerSource = request.referrer;

	// 4. Let request's referrerURL be the result of stripping referrerSource for use as a referrer.
	let referrerURL = stripURLForUseAsAReferrer(referrerSource);

	// 5. Let referrerOrigin be the result of stripping referrerSource for use as a referrer, with the
	//    origin-only flag set to true.
	let referrerOrigin = stripURLForUseAsAReferrer(referrerSource, true);

	// 6. If the result of serializing referrerURL is a string whose length is greater than 4096, set
	//    referrerURL to referrerOrigin.
	if (referrerURL.toString().length > 4096) {
		referrerURL = referrerOrigin;
	}

	// 7. The user agent MAY alter referrerURL or referrerOrigin at this point to enforce arbitrary
	//    policy considerations in the interests of minimizing data leakage. For example, the user
	//    agent could strip the URL down to an origin, modify its host, replace it with an empty
	//    string, etc.
	if (referrerURLCallback) {
		referrerURL = referrerURLCallback(referrerURL);
	}

	if (referrerOriginCallback) {
		referrerOrigin = referrerOriginCallback(referrerOrigin);
	}

	// 8.Execute the statements corresponding to the value of policy:
	const currentURL = new URL(request.url);

	switch (policy) {
		case 'no-referrer':
			return 'no-referrer';

		case 'origin':
			return referrerOrigin;

		case 'unsafe-url':
			return referrerURL;

		case 'strict-origin':
			// 1. If referrerURL is a potentially trustworthy URL and request's current URL is not a
			//    potentially trustworthy URL, then return no referrer.
			if (isUrlPotentiallyTrustworthy(referrerURL) && !isUrlPotentiallyTrustworthy(currentURL)) {
				return 'no-referrer';
			}

			// 2. Return referrerOrigin.
			return referrerOrigin.toString();

		case 'strict-origin-when-cross-origin':
			// 1. If the origin of referrerURL and the origin of request's current URL are the same, then
			//    return referrerURL.
			if (referrerURL.origin === currentURL.origin) {
				return referrerURL;
			}

			// 2. If referrerURL is a potentially trustworthy URL and request's current URL is not a
			//    potentially trustworthy URL, then return no referrer.
			if (isUrlPotentiallyTrustworthy(referrerURL) && !isUrlPotentiallyTrustworthy(currentURL)) {
				return 'no-referrer';
			}

			// 3. Return referrerOrigin.
			return referrerOrigin;

		case 'same-origin':
			// 1. If the origin of referrerURL and the origin of request's current URL are the same, then
			//    return referrerURL.
			if (referrerURL.origin === currentURL.origin) {
				return referrerURL;
			}

			// 2. Return no referrer.
			return 'no-referrer';

		case 'origin-when-cross-origin':
			// 1. If the origin of referrerURL and the origin of request's current URL are the same, then
			//    return referrerURL.
			if (referrerURL.origin === currentURL.origin) {
				return referrerURL;
			}

			// Return referrerOrigin.
			return referrerOrigin;

		case 'no-referrer-when-downgrade':
			// 1. If referrerURL is a potentially trustworthy URL and request's current URL is not a
			//    potentially trustworthy URL, then return no referrer.
			if (isUrlPotentiallyTrustworthy(referrerURL) && !isUrlPotentiallyTrustworthy(currentURL)) {
				return 'no-referrer';
			}

			// 2. Return referrerURL.
			return referrerURL;

		default:
			throw new TypeError(`Invalid referrerPolicy: ${policy}`);
	}
}

/**
 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#parse-referrer-policy-from-header|Referrer Policy §8.1. Parse a referrer policy from a Referrer-Policy header}
 * @param {Headers} headers Response headers
 * @returns {string} policy
 */
function parseReferrerPolicyFromHeader(headers) {
	// 1. Let policy-tokens be the result of extracting header list values given `Referrer-Policy`
	//    and response’s header list.
	const policyTokens = (headers.get('referrer-policy') || '').split(/[,\s]+/);

	// 2. Let policy be the empty string.
	let policy = '';

	// 3. For each token in policy-tokens, if token is a referrer policy and token is not the empty
	//    string, then set policy to token.
	// Note: This algorithm loops over multiple policy values to allow deployment of new policy
	// values with fallbacks for older user agents, as described in § 11.1 Unknown Policy Values.
	for (const token of policyTokens) {
		if (token && ReferrerPolicy.has(token)) {
			policy = token;
		}
	}

	// 4. Return policy.
	return policy;
}

;// CONCATENATED MODULE: ./node_modules/node-fetch/src/request.js
/**
 * Request.js
 *
 * Request class contains server only options
 *
 * All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
 */









const request_INTERNALS = Symbol('Request internals');

/**
 * Check if `obj` is an instance of Request.
 *
 * @param  {*} object
 * @return {boolean}
 */
const isRequest = object => {
	return (
		typeof object === 'object' &&
		typeof object[request_INTERNALS] === 'object'
	);
};

const doBadDataWarn = (0,external_node_util_namespaceObject.deprecate)(() => {},
	'.data is not a valid RequestInit property, use .body instead',
	'https://github.com/node-fetch/node-fetch/issues/1000 (request)');

/**
 * Request class
 *
 * Ref: https://fetch.spec.whatwg.org/#request-class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request extends Body {
	constructor(input, init = {}) {
		let parsedURL;

		// Normalize input and force URL to be encoded as UTF-8 (https://github.com/node-fetch/node-fetch/issues/245)
		if (isRequest(input)) {
			parsedURL = new URL(input.url);
		} else {
			parsedURL = new URL(input);
			input = {};
		}

		if (parsedURL.username !== '' || parsedURL.password !== '') {
			throw new TypeError(`${parsedURL} is an url with embedded credentials.`);
		}

		let method = init.method || input.method || 'GET';
		if (/^(delete|get|head|options|post|put)$/i.test(method)) {
			method = method.toUpperCase();
		}

		if ('data' in init) {
			doBadDataWarn();
		}

		// eslint-disable-next-line no-eq-null, eqeqeq
		if ((init.body != null || (isRequest(input) && input.body !== null)) &&
			(method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		const inputBody = init.body ?
			init.body :
			(isRequest(input) && input.body !== null ?
				clone(input) :
				null);

		super(inputBody, {
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody !== null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody, this);
			if (contentType) {
				headers.set('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ?
			input.signal :
			null;
		if ('signal' in init) {
			signal = init.signal;
		}

		// eslint-disable-next-line no-eq-null, eqeqeq
		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal or EventTarget');
		}

		// §5.4, Request constructor steps, step 15.1
		// eslint-disable-next-line no-eq-null, eqeqeq
		let referrer = init.referrer == null ? input.referrer : init.referrer;
		if (referrer === '') {
			// §5.4, Request constructor steps, step 15.2
			referrer = 'no-referrer';
		} else if (referrer) {
			// §5.4, Request constructor steps, step 15.3.1, 15.3.2
			const parsedReferrer = new URL(referrer);
			// §5.4, Request constructor steps, step 15.3.3, 15.3.4
			referrer = /^about:(\/\/)?client$/.test(parsedReferrer) ? 'client' : parsedReferrer;
		} else {
			referrer = undefined;
		}

		this[request_INTERNALS] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal,
			referrer
		};

		// Node-fetch-only options
		this.follow = init.follow === undefined ? (input.follow === undefined ? 20 : input.follow) : init.follow;
		this.compress = init.compress === undefined ? (input.compress === undefined ? true : input.compress) : init.compress;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
		this.highWaterMark = init.highWaterMark || input.highWaterMark || 16384;
		this.insecureHTTPParser = init.insecureHTTPParser || input.insecureHTTPParser || false;

		// §5.4, Request constructor steps, step 16.
		// Default is empty string per https://fetch.spec.whatwg.org/#concept-request-referrer-policy
		this.referrerPolicy = init.referrerPolicy || input.referrerPolicy || '';
	}

	/** @returns {string} */
	get method() {
		return this[request_INTERNALS].method;
	}

	/** @returns {string} */
	get url() {
		return (0,external_node_url_namespaceObject.format)(this[request_INTERNALS].parsedURL);
	}

	/** @returns {Headers} */
	get headers() {
		return this[request_INTERNALS].headers;
	}

	get redirect() {
		return this[request_INTERNALS].redirect;
	}

	/** @returns {AbortSignal} */
	get signal() {
		return this[request_INTERNALS].signal;
	}

	// https://fetch.spec.whatwg.org/#dom-request-referrer
	get referrer() {
		if (this[request_INTERNALS].referrer === 'no-referrer') {
			return '';
		}

		if (this[request_INTERNALS].referrer === 'client') {
			return 'about:client';
		}

		if (this[request_INTERNALS].referrer) {
			return this[request_INTERNALS].referrer.toString();
		}

		return undefined;
	}

	get referrerPolicy() {
		return this[request_INTERNALS].referrerPolicy;
	}

	set referrerPolicy(referrerPolicy) {
		this[request_INTERNALS].referrerPolicy = validateReferrerPolicy(referrerPolicy);
	}

	/**
	 * Clone this request
	 *
	 * @return  Request
	 */
	clone() {
		return new Request(this);
	}

	get [Symbol.toStringTag]() {
		return 'Request';
	}
}

Object.defineProperties(Request.prototype, {
	method: {enumerable: true},
	url: {enumerable: true},
	headers: {enumerable: true},
	redirect: {enumerable: true},
	clone: {enumerable: true},
	signal: {enumerable: true},
	referrer: {enumerable: true},
	referrerPolicy: {enumerable: true}
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param {Request} request - A Request instance
 * @return The options object to be passed to http.request
 */
const getNodeRequestOptions = request => {
	const {parsedURL} = request[request_INTERNALS];
	const headers = new Headers(request[request_INTERNALS].headers);

	// Fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body === null && /^(post|put)$/i.test(request.method)) {
		contentLengthValue = '0';
	}

	if (request.body !== null) {
		const totalBytes = getTotalBytes(request);
		// Set Content-Length if totalBytes is a number (that is not NaN)
		if (typeof totalBytes === 'number' && !Number.isNaN(totalBytes)) {
			contentLengthValue = String(totalBytes);
		}
	}

	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// 4.1. Main fetch, step 2.6
	// > If request's referrer policy is the empty string, then set request's referrer policy to the
	// > default referrer policy.
	if (request.referrerPolicy === '') {
		request.referrerPolicy = DEFAULT_REFERRER_POLICY;
	}

	// 4.1. Main fetch, step 2.7
	// > If request's referrer is not "no-referrer", set request's referrer to the result of invoking
	// > determine request's referrer.
	if (request.referrer && request.referrer !== 'no-referrer') {
		request[request_INTERNALS].referrer = determineRequestsReferrer(request);
	} else {
		request[request_INTERNALS].referrer = 'no-referrer';
	}

	// 4.5. HTTP-network-or-cache fetch, step 6.9
	// > If httpRequest's referrer is a URL, then append `Referer`/httpRequest's referrer, serialized
	// >  and isomorphic encoded, to httpRequest's header list.
	if (request[request_INTERNALS].referrer instanceof URL) {
		headers.set('Referer', request.referrer);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate,br');
	}

	let {agent} = request;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	const search = getSearch(parsedURL);

	// Pass the full URL directly to request(), but overwrite the following
	// options:
	const options = {
		// Overwrite search to retain trailing ? (issue #776)
		path: parsedURL.pathname + search,
		// The following options are not expressed in the URL
		method: request.method,
		headers: headers[Symbol.for('nodejs.util.inspect.custom')](),
		insecureHTTPParser: request.insecureHTTPParser,
		agent
	};

	return {
		/** @type {URL} */
		parsedURL,
		options
	};
};

;// CONCATENATED MODULE: ./node_modules/node-fetch/src/errors/abort-error.js


/**
 * AbortError interface for cancelled requests
 */
class AbortError extends FetchBaseError {
	constructor(message, type = 'aborted') {
		super(message, type);
	}
}

// EXTERNAL MODULE: ./node_modules/fetch-blob/from.js + 2 modules
var from = __webpack_require__(749);
;// CONCATENATED MODULE: ./node_modules/node-fetch/src/index.js
/**
 * Index.js
 *
 * a request API compatible with window.fetch
 *
 * All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
 */
























const supportedSchemas = new Set(['data:', 'http:', 'https:']);

/**
 * Fetch function
 *
 * @param   {string | URL | import('./request').default} url - Absolute url or Request instance
 * @param   {*} [options_] - Fetch options
 * @return  {Promise<import('./response').default>}
 */
async function fetch(url, options_) {
	return new Promise((resolve, reject) => {
		// Build request object
		const request = new Request(url, options_);
		const {parsedURL, options} = getNodeRequestOptions(request);
		if (!supportedSchemas.has(parsedURL.protocol)) {
			throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${parsedURL.protocol.replace(/:$/, '')}" is not supported.`);
		}

		if (parsedURL.protocol === 'data:') {
			const data = dist(request.url);
			const response = new Response(data, {headers: {'Content-Type': data.typeFull}});
			resolve(response);
			return;
		}

		// Wrap http.request into fetch
		const send = (parsedURL.protocol === 'https:' ? external_node_https_namespaceObject : external_node_http_namespaceObject).request;
		const {signal} = request;
		let response = null;

		const abort = () => {
			const error = new AbortError('The operation was aborted.');
			reject(error);
			if (request.body && request.body instanceof external_node_stream_namespaceObject.Readable) {
				request.body.destroy(error);
			}

			if (!response || !response.body) {
				return;
			}

			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = () => {
			abort();
			finalize();
		};

		// Send request
		const request_ = send(parsedURL.toString(), options);

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		const finalize = () => {
			request_.abort();
			if (signal) {
				signal.removeEventListener('abort', abortAndFinalize);
			}
		};

		request_.on('error', error => {
			reject(new FetchError(`request to ${request.url} failed, reason: ${error.message}`, 'system', error));
			finalize();
		});

		fixResponseChunkedTransferBadEnding(request_, error => {
			response.body.destroy(error);
		});

		/* c8 ignore next 18 */
		if (process.version < 'v14') {
			// Before Node.js 14, pipeline() does not fully support async iterators and does not always
			// properly handle when the socket close/end events are out of order.
			request_.on('socket', s => {
				let endedWithEventsCount;
				s.prependListener('end', () => {
					endedWithEventsCount = s._eventsCount;
				});
				s.prependListener('close', hadError => {
					// if end happened before close but the socket didn't emit an error, do it now
					if (response && endedWithEventsCount < s._eventsCount && !hadError) {
						const error = new Error('Premature close');
						error.code = 'ERR_STREAM_PREMATURE_CLOSE';
						response.body.emit('error', error);
					}
				});
			});
		}

		request_.on('response', response_ => {
			request_.setTimeout(0);
			const headers = fromRawHeaders(response_.rawHeaders);

			// HTTP fetch step 5
			if (isRedirect(response_.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				let locationURL = null;
				try {
					locationURL = location === null ? null : new URL(location, request.url);
				} catch {
					// error here can only be invalid URL in Location: header
					// do not throw when options.redirect == manual
					// let the user extract the errorneous redirect URL
					if (request.redirect !== 'manual') {
						reject(new FetchError(`uri requested responds with an invalid redirect URL: ${location}`, 'invalid-redirect'));
						finalize();
						return;
					}
				}

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// Nothing to do
						break;
					case 'follow': {
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOptions = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: clone(request),
							signal: request.signal,
							size: request.size,
							referrer: request.referrer,
							referrerPolicy: request.referrerPolicy
						};

						// when forwarding sensitive headers like "Authorization",
						// "WWW-Authenticate", and "Cookie" to untrusted targets,
						// headers will be ignored when following a redirect to a domain
						// that is not a subdomain match or exact match of the initial domain.
						// For example, a redirect from "foo.com" to either "foo.com" or "sub.foo.com"
						// will forward the sensitive headers, but a redirect to "bar.com" will not.
						if (!isDomainOrSubdomain(request.url, locationURL)) {
							for (const name of ['authorization', 'www-authenticate', 'cookie', 'cookie2']) {
								requestOptions.headers.delete(name);
							}
						}

						// HTTP-redirect fetch step 9
						if (response_.statusCode !== 303 && request.body && options_.body instanceof external_node_stream_namespaceObject.Readable) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (response_.statusCode === 303 || ((response_.statusCode === 301 || response_.statusCode === 302) && request.method === 'POST')) {
							requestOptions.method = 'GET';
							requestOptions.body = undefined;
							requestOptions.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 14
						const responseReferrerPolicy = parseReferrerPolicyFromHeader(headers);
						if (responseReferrerPolicy) {
							requestOptions.referrerPolicy = responseReferrerPolicy;
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOptions)));
						finalize();
						return;
					}

					default:
						return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
				}
			}

			// Prepare response
			if (signal) {
				response_.once('end', () => {
					signal.removeEventListener('abort', abortAndFinalize);
				});
			}

			let body = (0,external_node_stream_namespaceObject.pipeline)(response_, new external_node_stream_namespaceObject.PassThrough(), error => {
				if (error) {
					reject(error);
				}
			});
			// see https://github.com/nodejs/node/pull/29376
			/* c8 ignore next 3 */
			if (process.version < 'v12.10') {
				response_.on('aborted', abortAndFinalize);
			}

			const responseOptions = {
				url: request.url,
				status: response_.statusCode,
				statusText: response_.statusMessage,
				headers,
				size: request.size,
				counter: request.counter,
				highWaterMark: request.highWaterMark
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
				response = new Response(body, responseOptions);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: external_node_zlib_namespaceObject.Z_SYNC_FLUSH,
				finishFlush: external_node_zlib_namespaceObject.Z_SYNC_FLUSH
			};

			// For gzip
			if (codings === 'gzip' || codings === 'x-gzip') {
				body = (0,external_node_stream_namespaceObject.pipeline)(body, external_node_zlib_namespaceObject.createGunzip(zlibOptions), error => {
					if (error) {
						reject(error);
					}
				});
				response = new Response(body, responseOptions);
				resolve(response);
				return;
			}

			// For deflate
			if (codings === 'deflate' || codings === 'x-deflate') {
				// Handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = (0,external_node_stream_namespaceObject.pipeline)(response_, new external_node_stream_namespaceObject.PassThrough(), error => {
					if (error) {
						reject(error);
					}
				});
				raw.once('data', chunk => {
					// See http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = (0,external_node_stream_namespaceObject.pipeline)(body, external_node_zlib_namespaceObject.createInflate(), error => {
							if (error) {
								reject(error);
							}
						});
					} else {
						body = (0,external_node_stream_namespaceObject.pipeline)(body, external_node_zlib_namespaceObject.createInflateRaw(), error => {
							if (error) {
								reject(error);
							}
						});
					}

					response = new Response(body, responseOptions);
					resolve(response);
				});
				raw.once('end', () => {
					// Some old IIS servers return zero-length OK deflate responses, so
					// 'data' is never emitted. See https://github.com/node-fetch/node-fetch/pull/903
					if (!response) {
						response = new Response(body, responseOptions);
						resolve(response);
					}
				});
				return;
			}

			// For br
			if (codings === 'br') {
				body = (0,external_node_stream_namespaceObject.pipeline)(body, external_node_zlib_namespaceObject.createBrotliDecompress(), error => {
					if (error) {
						reject(error);
					}
				});
				response = new Response(body, responseOptions);
				resolve(response);
				return;
			}

			// Otherwise, use response as-is
			response = new Response(body, responseOptions);
			resolve(response);
		});

		// eslint-disable-next-line promise/prefer-await-to-then
		writeToStream(request_, request).catch(reject);
	});
}

function fixResponseChunkedTransferBadEnding(request, errorCallback) {
	const LAST_CHUNK = external_node_buffer_namespaceObject.Buffer.from('0\r\n\r\n');

	let isChunkedTransfer = false;
	let properLastChunkReceived = false;
	let previousChunk;

	request.on('response', response => {
		const {headers} = response;
		isChunkedTransfer = headers['transfer-encoding'] === 'chunked' && !headers['content-length'];
	});

	request.on('socket', socket => {
		const onSocketClose = () => {
			if (isChunkedTransfer && !properLastChunkReceived) {
				const error = new Error('Premature close');
				error.code = 'ERR_STREAM_PREMATURE_CLOSE';
				errorCallback(error);
			}
		};

		socket.prependListener('close', onSocketClose);

		request.on('abort', () => {
			socket.removeListener('close', onSocketClose);
		});

		socket.on('data', buf => {
			properLastChunkReceived = external_node_buffer_namespaceObject.Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;

			// Sometimes final 0-length chunk and end of message code are in separate packets
			if (!properLastChunkReceived && previousChunk) {
				properLastChunkReceived = (
					external_node_buffer_namespaceObject.Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 &&
					external_node_buffer_namespaceObject.Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0
				);
			}

			previousChunk = buf;
		});
	});
}

;// CONCATENATED MODULE: ./src/voicesynthapi/Pronunciation.js


function ConvertPronunciationFast(Translations, clipText) {
    if (!Array.isArray(Translations) || Translations.length == 0 ) return clipText.toLowerCase();
    const wb = '\\b'; //word boundary 
    const dict = Object.assign({}, ...Translations.map ((t) => ({[t.Word.toLowerCase()]: t.Pronunciation})))
    var re = new RegExp(Object.keys(dict).map(k=>wb+k+wb).join("|"),"gi");  
    return clipText.toLowerCase().replace(re, function(matched){
            return dict[matched];
        });
    
}
;// CONCATENATED MODULE: ./src/audiohandler.js







const ttsEndPoint = "https://api.wellsaidlabs.com/v1/tts/stream"
const auth0EndPoint = "https://dev-l3ao-nin.us.auth0.com/.well-known/jwks.json"
const auth0NameSpace = "https://industryacademy.com/"
const defaultPageSize = 20;


async function GenerateClipAudioFile(clipId, pooledConnection) {
    const timeout = 30000; //Timeout after 30 seconds

    var result = {
        status: 200,
        message: "Successful"
    }
    try {
        let clip = await GetClipDetails(clipId), pooledConnection;
        const avatarId = clip.VoiceID;
        const rawText = clip.ClipText;

        const pronunciations = await GetPronunciations(pooledConnection);

        const text = ConvertPronunciationFast(pronunciations, rawText);

        const abortController = new AbortController();
        const id = setTimeout(() => { abortController.abort() }, timeout);

        const ttsResponse = await fetch(ttsEndPoint, {
            signal: abortController.signal,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': process.env.WELLSAID_API_KEY,
            },
            body: JSON.stringify({
                speaker_id: avatarId,
                text: text,
            }),
        });
        clearTimeout(id);

        let status = ttsResponse.status;
        if (status != 200) //TODO, this will timeout, right?
        {
            console.log('Failed to get audio file', 'tts Response Status was invalid', ttsResponse, "\nStatus: ", ttsResponse.status, '\nTimestamp: ', Date.now());
            result.status = status;
            result.message = (!ttsResponse || ttsResponse.length === 0) ? 'Unknown Error From WellSaid Generating Clip' : ttsResponse.statusText
            return result;
        }
        else {
            console.log('Successful audio generation\n', ttsResponse.headers);
        }

        //https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
        const responseBlob = await ttsResponse.blob()
        const responseArray = await responseBlob.arrayBuffer();
        const buffer = await Buffer.from(responseArray);
        clip.AudioClip = buffer;


        var saveResult = await UpdateClipAudio(clipId, buffer, pooledConnection);
        if (saveResult.Successful) {
            return result;
        }
        else {
            console.log("Bad Save")
            console.log(saveResult);
            result.status = 0
            result.message = saveResult.errorString
            return result;
        }
    }
    catch (exp) {
        console.log('Error Generating Clip:', exp, '\nTimestamp: ', Date.now())
        result.status = 0
        result.message = (!exp || exp.length === 0) ? 'Unknown Error Generating Clip' : err
        return result;
    }


}
;// CONCATENATED MODULE: ./src/lambda-index.js




// Lambda can't consume ES6 exports
exports.handler = async (evt, ctx) => {

  const con = await getPooledConnection();
  try {
    await Promise.all(evt.Records.map(async (record) => {
      const clipId = parseInt(record.messageAttributes.ClipId.stringValue)
      console.log('Begin Processing Clip:', clipId , "\n Timestamp:", Date.now());
      var result = await GenerateClipAudioFile(clipId, con);
      const newStatus = result.status==200 ? e_ClipAudioGenerationStatus.HasAudio : e_ClipAudioGenerationStatus.ErrorGeneratingAudio;
      console.log("Clip Generation Complete\n Status:",result, newStatus, "\n Timestamp: ", Date.now())
      await UpdateClipAudioStatus(clipId, newStatus, result.message, con);
      console.log("Done Generating Audio:" + clipId, "\n Database update complete\n Timestamp:", Date.now());


    }));
  }
  catch (e) {
    console.log("Error Generating Audion", "\nError:", e, "\nTimestamp: ", Date.now())
    await UpdateClipAudioStatus(clipId, e_ClipAudioGenerationStatus.ErrorGeneratingAudio, e, con);
  }
  resolvePooledConnection(con);


  return {};
}


// {
//   "Records": [
//       {
//           "messageId": "059f36b4-87a3-44ab-83d2-661975830a7d",
//           "receiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
//           "body": "test",
//           "attributes": {
//               "ApproximateReceiveCount": "1",
//               "SentTimestamp": "1545082649183",
//               "SenderId": "AIDAIENQZJOLO23YVJ4VO",
//               "ApproximateFirstReceiveTimestamp": "1545082649185"
//           },
//           "messageAttributes": {},
//           "md5OfBody": "098f6bcd4621d373cade4e832627b4f6",
//           "eventSource": "aws:sqs",
//           "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:my-queue",
//           "awsRegion": "us-east-2"
//       }
//   ]
// }

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;