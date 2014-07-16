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
        containsArray                   : containsArray
    }
}();

