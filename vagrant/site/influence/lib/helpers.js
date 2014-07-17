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


        cleanSearchFilter = function(allowedFilters, passedInFilter){
            var cleanedFilter = {};
            if(!passedInFilter) return cleanedFilter;

            for(var prop in passedInFilter){
                if(passedInFilter.hasOwnProperty(prop) && allowedFilters.hasOwnProperty(prop)){
                    cleanedFilter[prop] = passedInFilter[prop];
                }
            }

            return cleanedFilter
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
        extend                          : extend
    }
}();

