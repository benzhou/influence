module.exports = function(Q, authBusiness, accountBusiness){

    var test = function(req,res,next){
            res.json({result:true});
        },

        getAdminAccount = function(req,res,next){
            //TODO request validation

            var adminId = req.params.adminId;

            Q.when(accountBusiness.getAdminAccountById(adminId)).then(

                function(admin){
                    res.json(admin);
                },

                function(err){
                    res.json(err);
                }
            );
        },

        postAdminAccount = function(req,res,next){
            //TODO request validation

            var reqAdmin = req.body;

            //authentication/Authorization (Use middleware?)



            Q.when(
                accountBusiness
                    .createAdminAccount(
                        reqAdmin.tenantId,
                        reqAdmin.username,
                        reqAdmin.email,
                        reqAdmin.password,
                        reqAdmin.firstName,
                        reqAdmin.lastName,
                        reqAdmin.displayName,
                        1 //TODO Needs to retrieve from authenticated admin token
            )).then(

                function(admin){
                    res.json({success : 1});
                },

                function(err){
                    res.json(err);
                }
            );
        },

        getAppToken = function(req,res,next){

        };

    return {
        test : test,
        postAdminAccount    : postAdminAccount,
        getAdminAccount     : getAdminAccount
    };
};

