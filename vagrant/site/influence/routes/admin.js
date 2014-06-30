module.exports = function(router, logger, adminController){

    router.get('/',
        function(req, res, next) {
            adminController.getIndexAction(req, res, next);
        }
    );

    return router;
};
