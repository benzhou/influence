module.exports = function(config){

    var log = function(){
        console.log.apply(this, [].slice.apply(arguments));
    };
    return {
        log     : log
    };
}
