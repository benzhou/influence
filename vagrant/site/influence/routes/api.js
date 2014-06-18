module.exports = function(router, apiController){

    router.get('/test', function(req, res, next) {
        apiController.test(req,res,next);
    });

    router.get('/account/admin/:adminId', function(req, res, next) {
        apiController.getAdminAccount(req,res,next);
    });

    router.post('/account/admin/:adminId', function(req, res, next) {
        console.log("apiRouter: entered");
        apiController.postAdminAccount(req,res,next);
    });

    router.get('/account/app', function(req, res, next) {
        apiController.getAppAccount(req,res,next);
    });

    router.post('/account/app', function(req, res, next) {
        apiController.getAppAccount(req,res,next);
    });

    router.get('/auth/appToken', function(req, res, next) {
        apiController.getAppAccount(req,res,next);
    });

    router.get('/auth/adminToken', function(req, res, next) {
        apiController.getAppAccount(req,res,next);
    });

    return router;
};
