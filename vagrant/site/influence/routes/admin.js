module.exports = function(router){

    router.get('/', function(req, res) {
        res.render('index', {
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
