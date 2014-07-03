var
    InfluenceError = require('../error/influenceError');

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
            try{
                apiController.getAdminAccount(req,res,next);
            }catch(e){
                logger.log(e);
                var resObj = e instanceof InfluenceError ? e : new InfluenceError(e);
                res.json(
                    resObj.httpStatus,
                    {
                        code : resObj.code,
                        message : resObj.message
                    }
                );
                next();
            }
        },
        apiLogMiddleware.apiLogger
    );
    router.post(
        '/account/admin',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            try{
                apiController.postAdminAccount(req,res,next);
            }catch(e){
                logger.log(e);
                var resObj = e instanceof InfluenceError ? e : new InfluenceError(e);
                res.json(
                    resObj.httpStatus,
                    {
                        code : resObj.code,
                        message : resObj.message
                    }
                );
                next();
            }
        },
        apiLogMiddleware.apiLogger
    );

    //App
    router.get(
        '/account/app/:appKey',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            try{
                apiController.getAppAccount(req,res,next);
            }catch(e){
                logger.log(e);
                var resObj = e instanceof InfluenceError ? e : new InfluenceError(e);
                res.json(
                    resObj.httpStatus,
                    {
                        code : resObj.code,
                        message : resObj.message
                    }
                );
                next();
            }
        },
        apiLogMiddleware.apiLogger
    );
    router.post(
        '/account/app',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            try{
                apiController.postAppAccount(req,res,next);
            }catch(e){
                logger.log(e);
                var resObj = e instanceof InfluenceError ? e : new InfluenceError(e);
                res.json(
                    resObj.httpStatus,
                    {
                        code : resObj.code,
                        message : resObj.message
                    }
                );
                next();
            }
        },
        apiLogMiddleware.apiLogger
    );


    //Auth
    router.get(
        '/auth/appToken',
        function(req, res, next) {
            try{
                apiController.getAppAccount(req,res,next);
            }catch(e){
                logger.log(e);
                var resObj = e instanceof InfluenceError ? e : new InfluenceError(e);
                res.json(
                    resObj.httpStatus,
                    {
                        code : resObj.code,
                        message : resObj.message
                    }
                );
                next();
            }
        },
        apiLogMiddleware.apiLogger
    );
    router.get(
        '/auth/adminToken',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            try{
                apiController.getAdminAuthToken(req,res,next);
            }catch(e){
                logger.log(e);
                var resObj = e instanceof InfluenceError ? e : new InfluenceError(e);
                res.json(
                    resObj.httpStatus,
                    {
                        code : resObj.code,
                        message : resObj.message
                    }
                );
                next();
            }
        },
        apiLogMiddleware.apiLogger
    );
    router.get(
        '/auth/adminToken/invalidate',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            try{
                apiController.deleteAdminAuthToken(req,res,next);
            }catch(e){
                logger.log(e);
                var resObj = e instanceof InfluenceError ? e : new InfluenceError(e);
                res.json(
                    resObj.httpStatus,
                    {
                        code : resObj.code,
                        message : resObj.message
                    }
                );
                next();
            }
        },
        apiLogMiddleware.apiLogger
    );
    router.delete(
        '/auth/adminToken',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            try{
                apiController.deleteAdminAuthToken(req,res,next);
            }catch(e){
                logger.log(e);
                var resObj = e instanceof InfluenceError ? e : new InfluenceError(e);
                res.json(
                    resObj.httpStatus,
                    {
                        code : resObj.code,
                        message : resObj.message
                    }
                );
                next();
            }
        },
        apiLogMiddleware.apiLogger
    );

    router.get(
        '/auth/admin/login/:tenantId/:username/:password',
        function(req, res, next) {
            try{
                apiController.getAdminAccountLogin(req,res,next);
            }catch(e){
                logger.log(e);
                var resObj = e instanceof InfluenceError ? e : new InfluenceError(e);
                res.json(
                    resObj.httpStatus,
                    {
                        code : resObj.code,
                        message : resObj.message
                    }
                );
                next();
            }
        },
        apiLogMiddleware.apiLogger
    );

    //Tenants
    router.get(
        '/tenants/:numberOfPage/:pageNumber',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next){
            try{
                apiController.getTenants(req,res, next);
            }catch(e){
                logger.log(e);
                var resObj = e instanceof InfluenceError ? e : new InfluenceError(e);
                res.json(
                    resObj.httpStatus,
                    {
                        code : resObj.code,
                        message : resObj.message
                    }
                );
                next();
            }
        },
        apiLogMiddleware.apiLogger
    );


    return router;
};
