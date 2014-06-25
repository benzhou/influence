module.exports = function(router, adminAuthenticationMiddleware, apiController){

    router.get('/test', function(req, res, next) {
        apiController.test(req,res,next);
    });

    //Account
    //Admin
    router.get(
        '/account/admin/:adminId',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            apiController.getAdminAccount(req,res,next);
        }
    );
    router.post(
        '/account/admin',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
        apiController.postAdminAccount(req,res,next);
        }
    );

    //App
    router.get(
        '/account/app/:appKey',
        adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            apiController.getAppAccount(req,res,next);
        }
    );
    router.post(
        '/account/app',
        //adminAuthenticationMiddleware.adminTokenAuth,
        function(req, res, next) {
            apiController.postAppAccount(req,res,next);
        }
    );


    //Auth
    router.get('/auth/appToken', function(req, res, next) {
        apiController.getAppAccount(req,res,next);
    });
    router.get('/auth/adminToken', function(req, res, next) {
        apiController.getAppAccount(req,res,next);
    });
    router.get('/auth/admin/login/:tenantId/:username/:password', function(req, res, next) {
        apiController.getAdminAccountLogin(req,res,next);
    });


    return router;
};
