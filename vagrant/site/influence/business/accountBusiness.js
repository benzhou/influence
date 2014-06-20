module.exports = function(Q, helpers, Pif, uuid, util, logger, errCodes, accountDataHandler){

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
            if(!tenantId || !email || !passwordPlainText || !createdBy){
                df.reject({
                    code : errCodes.C_400_001.code,
                    message : "Missing parameters"
                });
                return df.promise;
            }

            //TODO: validate Email format (length, invalid characters etc.)
            //TODO: validate Username format (length, invalid characters etc.)
            //TODO: validate the password complexity, length
            //TODO: validate firstName, lastName, displayName length

            //defaulting values when necessary
            if(!username) {
                username = email;
            }

            //TODO:validate createdBy AdminId has rights to create a new admin account for passed in tenant

            //Ensure per tenant Email/Username uniqueness
            Q.when(accountDataHandler.findAdminAccountByTenantAndEmail(tenantId, email)).then(

                function(admin){
                    logger.log('accountBusiness.createAdminAccount findAdminAccountByEmail is resolved');
                    logger.log(admin);

                    if(admin){
                        logger.log('accountBusiness.createAdminAccount findAdminAccountByEmail found an admin with the same email : ', email);
                        throw {
                            code    : errCodes.C_400_002.code,
                            message : util.format(errCodes.C_400_002.desc, email)
                        };
                    }

                    logger.log("Cannnot find admin by their email, email === username? %s", email === username);
                    if(email !== username){
                        logger.log('accountBusiness.createAdminAccount findAdminAccountByTenantAndUsername going to fire');
                        return accountDataHandler.findAdminAccountByTenantAndUsername(tenantId, username);
                    }

                    //otherwise the orginal promise from findAdminAccountByTenantAndEmail will pass to the next then
                }
            ).then(
                function(admin){
                    logger.log('accountBusiness.createAdminAccount findAdminAccountByTenantAndUsername is resolved');
                    logger.log(admin);

                    //If admin had value, then it should be already rejected from previous code when we try to check the first promise from
                    //findAdminAccountByEmail, if it is true again, means it has to from findAdminAccountByTenantAndUsername call
                    if(admin){
                        logger.log('accountBusiness.createAdminAccount findAdminAccountByTenantAndUsername found an admin with the same username : ', username);
                        throw {
                            code    : errCodes.C_400_003.code,
                            message : util.format(errCodes.C_400_003.desc, username)
                        };
                    }

                    //hash plain text password
                    var salt = crypto.randomBytes(128).toString('base64');
                    passwordHash = helpers.sha256Hash(passwordPlainText + '.' + salt);


                    var
                        currentDate = new Date(),
                        adminDo     = {
                            tenantId            : tenantId,
                            username            : username,
                            email               : email,
                            passwordHash        : passwordHash,
                            passwordSalt        : salt,
                            firstName           : firstName,
                            lastName            : lastName,
                            displayName         : displayName,
                            createdBy           : createdBy,
                            createdOn           : currentDate,
                            updatedBy           : createdBy,
                            updatedOn           : currentDate
                        };

                    return accountDataHandler.upsertAdminAccount(adminDo);
                }
            ).then(function(admin){
                    //accountDataHandler.upsertAdminAccountById is resolved!
                    logger.log('accountBusiness.createAdminAccount accountDataHandler.upsertAdminAccount is resolved');
                    logger.log(admin);
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
            return (new Buffer(uuid.v4() + ":" + uuid.v4()).toString('base64')).replace(/\+/gi,'-').replace(/\//gi, '_').replace(/\=/gi, ',');
        };

    return {
        createAdminAccount      : createAdminAccount,
        getAdminAccountById     : getAdminAccountById,

        getAppAccountByAppKey   : getAppAccountByAppKey,
        createAppAccount        : createAppAccount
    };
};

