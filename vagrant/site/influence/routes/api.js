var
    InfluenceError = require('../error/influenceError');

module.exports = function(router, logger, adminAuthenticationMiddleware, apiLogMiddleware, apiController){

    var _hookUpAdminRoutes = function(router, verb, route, ctrlAction, authorizationRequirements){
        var
            self = this;

        router[verb](
            route,
            function(req, res, next){
                adminAuthenticationMiddleware.adminTokenAuth(req, res, next, authorizationRequirements);
            },
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
    _hookUpAdminRoutes(router, 'get', '/account/admins/:tenantId', apiController.getAdminAccounts);
    _hookUpAdminRoutes(router, 'get', '/account/admin/:adminId', apiController.getAdminAccount);
    //_hookUpAdminRoutes(router, 'put', '/account/admin/:adminId?', apiController.putAdminAccount);
    _hookUpAdminRoutes(router, 'post', '/account/admin/:adminId?', apiController.postAdminAccount);

    //App
    _hookUpAdminRoutes(router, 'get',  '/account/app/:appKey', apiController.getAppAccount);
    _hookUpAdminRoutes(router, 'post',  '/account/app:appKey?', apiController.postAppAccount);

    //Auth
    _hookUpAdminRoutes(router, 'get', '/auth/appToken', apiController.getAppAccount);
    _hookUpAdminRoutes(router, 'get', '/auth/adminToken', apiController.getAdminAuthToken);
    _hookUpAdminRoutes(router, 'get', '/auth/adminToken/invalidate', apiController.deleteAdminAuthToken);
    _hookUpAdminRoutes(router, 'delete', '/auth/adminToken', apiController.deleteAdminAuthToken);
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
    _hookUpAdminRoutes(router, 'get', '/permissions/admin/:adminId?', apiController.getAdminPermissions);
    _hookUpAdminRoutes(router, 'post', '/permissions/admin/:adminId?', apiController.postAdminPermissions);

    //Tenants
    _hookUpAdminRoutes(router, 'get', '/tenants', apiController.getTenants);
    _hookUpAdminRoutes(router, 'get', '/tenant/:tenantId', apiController.getTenant);
    _hookUpAdminRoutes(router, 'put', '/tenant/:tenantId?', apiController.putTenant);
    _hookUpAdminRoutes(router, 'post', '/tenant/:tenantId?', apiController.postTenant);

    //Actions
    _hookUpAdminRoutes(router, 'get', '/actions/:numberOfPage?/:pageNumber?', apiController.getActions);
    _hookUpAdminRoutes(router, 'get', '/action/key/:actionKey?', apiController.getActionByKey);
    _hookUpAdminRoutes(router, 'get', '/action/:actionId', apiController.getAction);
    _hookUpAdminRoutes(router, 'post', '/action/:actionId?', apiController.postAction);

    //Affiliates
    _hookUpAdminRoutes(router, 'get', '/affiliates/:tenantId', apiController.getAffiliates);
    _hookUpAdminRoutes(router, 'get', '/affiliate/:affiliateId', apiController.getAffiliate);
    _hookUpAdminRoutes(router, 'post', '/affiliate/:affiliateId?', apiController.postAffiliate);

    //Posts
    _hookUpAdminRoutes(router, 'get', '/posts/:affiliateId', apiController.getPosts);
    _hookUpAdminRoutes(router, 'get', '/post/:postId', apiController.getPost);

    //Config
    _hookUpAdminRoutes(router, 'get', '/config/tenants/:configOptions', apiController.getTenants);
    _hookUpAdminRoutes(router, 'get', '/config/affiliates/:tenantId/:configOptions?', function(req, res, next){
        req.params.configOptions = req.params.configOptions || "affiliate";
        return apiController.getAffiliates(req, res, next);
    });
    _hookUpAdminRoutes(router, 'get', '/config/admins/:tenantId/:configOptions?', function(req, res, next){
        req.params.configOptions = req.params.configOptions || "admin";
        return apiController.getAdminAccounts(req, res, next);
    });


    router.get(
        '/searchVenue',
        function(req, res, next) {
            try{
                apiController.getSearchVenue(req,res,next);
            }catch(e){
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
    router.post(
        '/post/:postId?',
        function(req, res, next) {
            try{
                apiController.postPostConsumer(req,res,next);
            }catch(e){
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

    return router;
};
