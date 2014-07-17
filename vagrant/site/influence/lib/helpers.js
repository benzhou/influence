var crypto = require('crypto'),
    uuid = require("node-uuid"),
    _ = require("underscore"),
    util = require("util");

module.exports = function(plain){
    var
        sha256Hash = function(plain) {
            return crypto.createHash('sha256').update(plain).digest('base64');
        },

        typeIs = (function(global) {
            var cache = {};
            return function(obj) {
                var key;
                return obj === null ? 'null' // null
                    : obj === global ? 'global' // window in browser or global in nodejs
                    : (key = typeof obj) !== 'object' ? key // basic: string, boolean, number, undefined, function
                    : obj.nodeType ? 'object' // DOM element
                    : cache[key = ({}).toString.call(obj)] // cached. date, regexp, error, object, array, math
                    || (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
            };
        }(this)),

        getUrlSafeBase64EncodedToken = function(){
            return (new Buffer(uuid.v4() + ":" + uuid.v4()).toString('base64')).replace(/\+/gi,'-').replace(/\//gi, '_').replace(/\=/gi, ',');
        },

        mixin = function(){
            var args = [].slice(arguments);
            return _.extend.apply(this, args);
        },

        containsArray = function(origArr, containArr){
            var bContainAll = true;

            bContainAll = !containArr.some(function(item){
                if(origArr.indexOf(item) === -1){
                    return true;
                }
            });

            return bContainAll;
        },

        equals = function(o1, o2) {
            if (o1 === o2) return true;
            if (o1 === null || o2 === null) return false;
            if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
            var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
            if (t1 == t2) {
                if (t1 == 'object') {
                    if (isArray(o1)) {
                        if (!isArray(o2)) return false;
                        if ((length = o1.length) == o2.length) {
                            for(key=0; key<length; key++) {
                                if (!equals(o1[key], o2[key])) return false;
                            }
                            return true;
                        }
                    } else if (isDate(o1)) {
                        return isDate(o2) && o1.getTime() == o2.getTime();
                    } else if (isRegExp(o1) && isRegExp(o2)) {
                        return o1.toString() == o2.toString();
                    } else {
                        if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2)) return false;
                        keySet = {};
                        for(key in o1) {
                            if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
                            if (!equals(o1[key], o2[key])) return false;
                            keySet[key] = true;
                        }
                        for(key in o2) {
                            if (!keySet.hasOwnProperty(key) &&
                                key.charAt(0) !== '$' &&
                                o2[key] !== undefined &&
                                !isFunction(o2[key])) return false;
                        }
                        return true;
                    }
                }
            }
            return false;
        },

        isFunction = function(value){return typeof value === 'function';},

        array_indexOfObject = function(array, obj, compareFuc){
            if(!array || !obj || !util.isArray(array)) return -1;
            if(_.isString(obj)){
                return [].prototype.indexOf.apply(array, obj);
            }

            var ret = -1;
            for(var i= 0,l=array.length;i<l;i++){
                if(compareFuc && isFunction(compareFuc)){
                    if(compareFuc(array[i], obj)){
                        ret = i;
                    }
                }else{
                    if(equals(array[i], obj)){
                        ret = i;
                    }
                }
            }

            return ret;
        },

        dedupArray = function(inputArray){
            if(!util.isArray(inputArray)) return inputArray;

            var memory = [];
            inputArray.forEach(function(item){
                if(memory.indexOf(item) === -1){
                    memory.push(item);
                }
            });

            return memory;
/*
            //A different way of doing the same thing
            var a = array.concat();
            for(var i=0; i<a.length; ++i) {
                for(var j=i+1; j<a.length; ++j) {
                    if(a[i] === a[j])
                        a.splice(j--, 1);
                }
            }

            return a;
            */
        },

        extend = function() {
            var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false,
                toString = Object.prototype.toString,
                hasOwn = Object.prototype.hasOwnProperty,
                push = Array.prototype.push,
                slice = Array.prototype.slice,
                trim = String.prototype.trim,
                indexOf = Array.prototype.indexOf,
                class2type = {
                    "[object Boolean]": "boolean",
                    "[object Number]": "number",
                    "[object String]": "string",
                    "[object Function]": "function",
                    "[object Array]": "array",
                    "[object Date]": "date",
                    "[object RegExp]": "regexp",
                    "[object Object]": "object"
                },
                jQuery = {
                    isFunction: function (obj) {
                        return jQuery.type(obj) === "function"
                    },
                    isArray: Array.isArray ||
                        function (obj) {
                            return jQuery.type(obj) === "array"
                        },
                    isWindow: function (obj) {
                        return obj != null && obj == obj.window
                    },
                    isNumeric: function (obj) {
                        return !isNaN(parseFloat(obj)) && isFinite(obj)
                    },
                    type: function (obj) {
                        return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
                    },
                    isPlainObject: function (obj) {
                        if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
                            return false
                        }
                        try {
                            if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                                return false
                            }
                        } catch (e) {
                            return false
                        }
                        var key;
                        for (key in obj) {}
                        return key === undefined || hasOwn.call(obj, key)
                    }
                };
            if (typeof target === "boolean") {
                deep = target;
                target = arguments[1] || {};
                i = 2;
            }
            if (typeof target !== "object" && !jQuery.isFunction(target)) {
                target = {}
            }
            if (length === i) {
                target = this;
                --i;
            }
            for (i; i < length; i++) {
                if ((options = arguments[i]) != null) {
                    for (name in options) {
                        src = target[name];
                        copy = options[name];
                        if (target === copy) {
                            continue
                        }
                        if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && jQuery.isArray(src) ? src : []
                            } else {
                                clone = src && jQuery.isPlainObject(src) ? src : {};
                            }
                            // WARNING: RECURSION
                            target[name] = extend(deep, clone, copy);
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }
            return target;
        },

        deepEqual = function(){
            var i, l, leftChain, rightChain;

            function compare2Objects (x, y) {
                var p;

                // remember that NaN === NaN returns false
                // and isNaN(undefined) returns true
                if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
                    return true;
                }

                // Compare primitives and functions.
                // Check if both arguments link to the same object.
                // Especially useful on step when comparing prototypes
                if (x === y) {
                    return true;
                }

                // Works in case when functions are created in constructor.
                // Comparing dates is a common scenario. Another built-ins?
                // We can even handle functions passed across iframes
                if ((typeof x === 'function' && typeof y === 'function') ||
                    (x instanceof Date && y instanceof Date) ||
                    (x instanceof RegExp && y instanceof RegExp) ||
                    (x instanceof String && y instanceof String) ||
                    (x instanceof Number && y instanceof Number)) {
                    return x.toString() === y.toString();
                }

                // At last checking prototypes as good a we can
                if (!(x instanceof Object && y instanceof Object)) {
                    return false;
                }

                if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
                    return false;
                }

                if (x.constructor !== y.constructor) {
                    return false;
                }

                if (x.prototype !== y.prototype) {
                    return false;
                }

                // check for infinitive linking loops
                if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
                    return false;
                }

                // Quick checking of one object beeing a subset of another.
                // todo: cache the structure of arguments[0] for performance
                for (p in y) {
                    if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                        return false;
                    }
                    else if (typeof y[p] !== typeof x[p]) {
                        return false;
                    }
                }

                for (p in x) {
                    if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                        return false;
                    }
                    else if (typeof y[p] !== typeof x[p]) {
                        return false;
                    }

                    switch (typeof (x[p])) {
                        case 'object':
                        case 'function':

                            leftChain.push(x);
                            rightChain.push(y);

                            if (!compare2Objects (x[p], y[p])) {
                                return false;
                            }

                            leftChain.pop();
                            rightChain.pop();
                            break;

                        default:
                            if (x[p] !== y[p]) {
                                return false;
                            }
                            break;
                    }
                }

                return true;
            }

            if (arguments.length < 1) {
                return true; //Die silently? Don't know how to handle such case, please help...
                // throw "Need two or more arguments to compare";
            }

            for (i = 1, l = arguments.length; i < l; i++) {

                leftChain = []; //todo: this can be cached
                rightChain = [];

                if (!compare2Objects(arguments[0], arguments[i])) {
                    return false;
                }
            }

            return true;
        },

        deepEqualFast = function(obj1, obj2){
            return JSON.stringify(obj1) === JSON.stringify(obj2);
        },

        clone =function(a) {
            return JSON.parse(JSON.stringify(a));
        },

        cleanSearchFilter = function(allowedFilters, passedInFilter){
            var cleanedFilter = {};
            if(!passedInFilter) return cleanedFilter;

            for(var prop in passedInFilter){
                if(passedInFilter.hasOwnProperty(prop) && allowedFilters.hasOwnProperty(prop)){
                    cleanedFilter[prop] = passedInFilter[prop];
                }
            }

            return cleanedFilter;
        },

        cleanSort = function(allowedSortFiles, passedInSort){
            var cleanedSort = {};
            if(!passedInSort) return cleanedSort;

            for(var prop in passedInSort){
                if(passedInSort.hasOwnProperty(prop) && allowedSortFiles.hasOwnProperty(prop)){
                    cleanedSort[prop] = passedInSort[prop];
                }
            }

            return cleanedSort
        };

    return {
        sha256Hash                      : sha256Hash,
        getUrlSafeBase64EncodedToken    : getUrlSafeBase64EncodedToken,
        typeIs                          : typeIs,
        mixin                           : mixin,
        cleanSearchFilter               : cleanSearchFilter,
        cleanSort                       : cleanSort,
        dedupArray                      : dedupArray,
        containsArray                   : containsArray,
        extend                          : extend,
        array_indexOfObject             : array_indexOfObject,
        deepEqual                       : deepEqual,
        deepEqualFast                   : deepEqualFast,
        clone                           : clone,
        isFunction                      : isFunction
    }
}();

