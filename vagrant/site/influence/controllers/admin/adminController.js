module.exports = function(logger, config){

    var
        getIndexAction = function(req, res, next){
            res.render('adminApp/index', {
                showTitle: true,
                config: {
                    app : {
                        key : config.app.key
                    }
                },
                helpers: {
                    foo: function(){
                        return 'Hello Ben';
                    }
                }
            });
        };

    return {
        getIndexAction  : getIndexAction
    };
}