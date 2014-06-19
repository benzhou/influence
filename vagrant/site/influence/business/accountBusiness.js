module.exports = function(Q, uuid, logger, errCodes, accountDataHandler){

    var
        getAdminAccountById = function(adminId){
            if(!adminId){
                throw new Error("No adminId found");
            }

            return accountDataHandler.getAdminAccountById(adminId);
        },

        createAdminAccount = function(
            tenantId,
            username,
            email,
            passwordPlainText,
            firstName,
            lastName,
            displayName,
            createdBy
        ){
            var df = Q.defer();

            //validation
            //required fields
            if(!email || !passwordPlainText || !createdBy){
                df.reject({
                    code : errCodes.C_400_001.code,
                    message : "Missing parameters"
                });
                return df.promise;
            }

            //TODO: validate the password complexity

            //defaulting values when necessary
            if(!username) {
                username = email;
            }

            //TODO:validate createdBy AdminId has rights to create a new admin account for passed in tenant

            //Ensure Email/Username uniqueness
            Q.when(accountDataHandler.findAdminAccountByEmail(email)).then(

                function(){
                    //TODO: hash plain text password
                    var passwordHash = passwordPlainText;


                    var
                        currentDate = new Date(),
                        adminDo     = {
                            tenantId            : tenantId,
                            username            : username,
                            email               : email,
                            passwordHash        : passwordHash,
                            firstName           : firstName,
                            lastName            : lastName,
                            displayName         : displayName,
                            createdBy           : createdBy,
                            createdOn           : currentDate,
                            updatedBy           : createdBy,
                            updatedOn           : currentDate
                        };

                    return accountDataHandler.upsertAdminAccountById(adminDo);
                }
            ).then(function(admin){
                    //accountDataHandler.upsertAdminAccountById is resolved!
                    logger.log('accountBusiness.createAdminAccount accountDataHandler.upsertAdminAccountById is resolved');
                    df.resolve(admin);
                }).catch(function(err){
                    //one of the promise was rejected
                    logger.log('accountBusiness.createAdminAccount catch block got an err');
                    logger.log(err);
                    df.reject(err);
                }).done(function(){
                    logger.log('accountBusiness.createAdminAccount done block was called');
                });

            return df.promise;
        },

        getAppAccountByAppKey = function(appKey){
            if(!appKey){
                throw new Error("No adminId found");
            }

            return accountDataHandler.findAppAccountByAppKey(appKey);
        },

        createAppAccount = function(
            appName,
            appDesc,
            createdBy
        ){
            //validation
            //required fields
            if(!appName || !createdBy){
                throw new Exception();
            }

            //Generate AppKey and AppSecret
            var appKey      = _getUrlSafeBase64EncodedToken(),
                appSecrect  = _getUrlSafeBase64EncodedToken();

            var
                currentDate = new Date(),
                appDo       = {
                    appKey              : appKey,
                    appSecrect          : appSecrect,
                    appName             : appName,
                    appDescription      : appDesc,
                    createdBy           : createdBy,
                    createdOn           : currentDate,
                    updatedBy           : createdBy,
                    updatedOn           : currentDate
                };

            return accountDataHandler.upsertAppAccountById(appDo);
        },

        _getUrlSafeBase64EncodedToken = function(){
            return
                (new Buffer(uuid.v4() + (new Date()).getTime()).toString('base64')).
                    replace(/\+/gi,'-').
                    replace(/\//, '_').
                    replace(/=/, ',');
        };

    return {
        createAdminAccount      : createAdminAccount,
        getAdminAccountById     : getAdminAccountById,

        getAppAccountByAppKey   : getAppAccountByAppKey,
        createAppAccount        : createAppAccount
    };
};

