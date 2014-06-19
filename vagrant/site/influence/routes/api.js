module.exports = function(router, apiController){

    router.get('/test', function(req, res, next) {
        apiController.test(req,res,next);
    });

    //Account
    //Admin
    router.get('/account/admin/:adminId', function(req, res, next) {
        apiController.getAdminAccount(req,res,next);
    });
    router.post('/account/admin/:adminId', function(req, res, next) {
        apiController.postAdminAccount(req,res,next);
    });

    //App
    router.get('/account/app/:appKey', function(req, res, next) {
        apiController.getAppAccount(req,res,next);
    });
    router.post('/account/app/:appKey', function(req, res, next) {
        apiController.getAppAccount(req,res,next);
    });


    //Auth
    router.get('/auth/appToken', function(req, res, next) {
        apiController.getAppAccount(req,res,next);
    });
    router.get('/auth/adminToken', function(req, res, next) {
        apiController.getAppAccount(req,res,next);
    });

    return router;
};
