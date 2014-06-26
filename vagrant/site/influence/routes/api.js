module.exports = function(router, logger, adminAuthenticationMiddleware, apiLogMiddleware, apiController){

    router.get(
        '/test',
        function(req, res, next){
            logger.log("================");
            logger.log("Middleware call");
            logger.log("================");
            next();
        },
        function(req, res, next) {
            logger.log("================");
            logger.log("Controller called");
            logger.log("================");
            apiController.test(req,res,next);
            next();
        },
        function(req, res, next){
            logger.log("================");
            logger.log("Middleware2 call");
            logger.log(res.statusCode);
            logger.log("================");

            next();
        }
    );

    //Account
    //Admin
    router.get(
        '/account/admin/:adminId?',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            apiController.getAdminAccount(req,res,next);
        },
        apiLogMiddleware.apiLogger
    );
    router.post(
        '/account/admin',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            apiController.postAdminAccount(req,res,next);
        },
        apiLogMiddleware.apiLogger
    );

    //App
    router.get(
        '/account/app/:appKey',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            apiController.getAppAccount(req,res,next);
        },
        apiLogMiddleware.apiLogger
    );
    router.post(
        '/account/app',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            apiController.postAppAccount(req,res,next);
        },
        apiLogMiddleware.apiLogger
    );


    //Auth
    router.get(
        '/auth/appToken',
        function(req, res, next) {
            apiController.getAppAccount(req,res,next);
        },
        apiLogMiddleware.apiLogger
    );
    router.get(
        '/auth/adminToken',
        function(req, res, next) {
            apiController.getAppAccount(req,res,next);
        },
        apiLogMiddleware.apiLogger
    );
    router.get(
        '/auth/admin/login/:tenantId/:username/:password',
        function(req, res, next) {
            apiController.getAdminAccountLogin(req,res,next);
        },
        apiLogMiddleware.apiLogger
    );


    return router;
};
