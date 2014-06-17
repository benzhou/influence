module.exports = function(router, apiController){

    router.get('/test', function(req, res, next) {
        apiController.test(req,res,next);
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
