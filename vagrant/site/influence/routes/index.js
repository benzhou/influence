module.exports = function(router, logger, clientController){

    router.get('/',
        function(req, res, next) {
            clientController.getIndexAction(req, res, next);
        }
    );

    return router;
};
