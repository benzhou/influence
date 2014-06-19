module.exports = function(){
    var
        pif = function(promise, test, consequent, alternate) {
            return promise.then(function(value) {
                return test(value)? consequent(value) : alternate(value)
            })
        },
        identity = function(a){ return a},
        when = function(promise, test, f) {
            return pif(promise, test, f, identity)
        },
        unless = function(promise, test, f) {
            return pif(promise, test, identity, f)
        };

   return {
       pif : pif,
       when : when,
       unless : unless
   }
}();

