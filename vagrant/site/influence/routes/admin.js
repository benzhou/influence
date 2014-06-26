module.exports = function(router){

    router.get('/', function(req, res) {
        res.render('adminApp/index', {
            showTitle: true,

            helpers: {
                foo: function(){
                    return 'Hello Ben';
                }
            }
        });
    });

    return router;
};
