var
    InfluenceError = require('../error/influenceError');

module.exports = function(router, logger, adminAuthenticationMiddleware, apiLogMiddleware, apiController){

    var _hookUpRoutes = function(router, verb, route, ctrlAction){
        var
            self = this;

        router[verb](
            route,
            adminAuthenticationMiddleware.adminTokenAuth,
            function(req, res, next){
                try{
                    ctrlAction.apply(self, [req, res, next]);
                }catch(e){
                    logger.log(e);
                    logger.log(e.stack);
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
    };

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
    _hookUpRoutes(router, 'get', '/account/admins/:tenantId?/:numberOfPage?/:pageNumber?', apiController.getAdminAccounts);
    _hookUpRoutes(router, 'get', '/account/admin/:adminId?', apiController.getAdminAccount);
    //_hookUpRoutes(router, 'put', '/account/admin/:adminId?', apiController.putAdminAccount);
    _hookUpRoutes(router, 'post', '/account/admin/:adminId?', apiController.postAdminAccount);

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

    //Admin Permissions
    _hookUpRoutes(router, 'get', '/permissions/admin/:adminId?', apiController.getAdminPermissions);
    _hookUpRoutes(router, 'post', '/permissions/admin/:actionId?', apiController.postAdminPermissions);

    //Tenants
    _hookUpRoutes(router, 'get', '/tenants/:numberOfPage?/:pageNumber?', apiController.getTenants);
    _hookUpRoutes(router, 'get', '/tenant/:tenantId?', apiController.getTenant);
    _hookUpRoutes(router, 'put', '/tenant/:tenantId?', apiController.putTenant);
    _hookUpRoutes(router, 'post', '/tenant/:tenantId?', apiController.postTenant);

    //Actions
    _hookUpRoutes(router, 'get', '/actions/:numberOfPage?/:pageNumber?', apiController.getActions);
    _hookUpRoutes(router, 'get', '/action/key/:actionKey?', apiController.getActionByKey);
    _hookUpRoutes(router, 'get', '/action/:actionId?', apiController.getAction);
    _hookUpRoutes(router, 'post', '/action/:actionId?', apiController.postAction);

    //Affiliates
    _hookUpRoutes(router, 'get', '/affiliates/:tenantId/:numberOfPage?/:pageNumber?', apiController.getAffiliates);
    _hookUpRoutes(router, 'get', '/affiliate/:affiliateId?', apiController.getAffiliate);
    _hookUpRoutes(router, 'post', '/affiliate/:affiliateId?', apiController.postAffiliate);



    return router;
};
