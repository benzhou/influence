var InfluenceError = require('../error/influenceError');
var crypto = require('crypto');

module.exports = function(Q, helpers, util, logger, errCodes, accountDataHandler){

    var
        getAdminAccountById = function(adminId){
            var df = Q.defer();

            //validation
            //required fields
            if(!adminId){
                df.reject(
                    new InfluenceError(errCodes.C_400_007_001.code)
                );

                return df.promise;
            }

            Q.when(accountDataHandler.getAdminAccountById(adminId)).then(
                function(admin){
                    if(!admin){
                        throw new InfluenceError(errCodes.C_400_007_002.code);
                    }

                    df.resolve(admin);
                }
            ).catch(
                function(err){
                    logger.log('accountBusiness.getAdminAccountById catch block got an err:');
                    logger.log(err);

                    df.reject(err);
                }
            ).done();

            return df.promise;
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
                df.reject(new InfluenceError(errCodes.C_400_001_001.code));

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
                        throw new InfluenceError(
                            errCodes.C_400_001_002.code,
                            util.format(errCodes.C_400_001_002.desc, email)
                        );
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
                        throw new InfluenceError(
                            errCodes.C_400_001_003.code,
                            util.format(errCodes.C_400_001_003.desc, email)
                        );
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
                    //one of the promises was rejected
                    logger.log('accountBusiness.createAdminAccount catch block got an err');
                    logger.log(err && err.stack?err.stack:err);

                    df.reject(err);
                }).done(function(){
                    logger.log('accountBusiness.createAdminAccount done block was called');
                });

            return df.promise;
        },

        getAppAccountByAppKey = function(appKey){
            var df = Q.defer();

            //validation
            //required fields
            if(!appKey){
                df.reject(
                    new InfluenceError(errCodes.C_400_008_001.code)
                );

                return df.promise;
            }

            Q.when(accountDataHandler.findAppAccountByAppKey(appKey)).then(
                function(app){
                    if(!app){
                        //if admin is false value, means we didn't find the admin by the tenantId and username
                        throw new InfluenceError(errCodes.C_400_008_002.code);
                    }

                    df.resolve(app);
                }
            ).catch(
                function(err){
                    logger.log('accountBusiness.getAppAccountByAppKey catch block got an err:');
                    logger.log(err);

                    df.reject(err);
                }
            ).done();

            return df.promise;
        },

        createAppAccount = function(
            name,
            description,
            createdBy
        ){
            var df = Q.defer();

            //validation
            //required fields
            if(!name || !createdBy){
                df.reject(new InfluenceError(errCodes.C_400_009_001.code));
                return df.promise;
            }

            //Generate AppKey and AppSecret
            var appKey      = helpers.getUrlSafeBase64EncodedToken(),
                appSecrect  = helpers.getUrlSafeBase64EncodedToken();

            //TODO: Ensure appKey/appSecrect uniqueness

            var
                currentDate = new Date(),
                appDo       = {
                    key                 : appKey,
                    secret              : appSecrect,
                    name                : name,
                    description         : description,
                    createdBy           : createdBy,
                    createdOn           : currentDate,
                    updatedBy           : createdBy,
                    updatedOn           : currentDate
                };

            Q.when(accountDataHandler.upsertAppAccountById(appDo)).then(
                function(app){
                    if(!app){
                        throw new InfluenceError(errCodes.C_400_009_002.code);
                    }

                    df.resolve(app);
                }
            ).catch(
                function(err){
                    logger.log('accountBusiness.createAppAccount catch block got an err:');
                    logger.log(err);

                    df.reject(err);
                }
            ).done();
        };

    return {
        createAdminAccount      : createAdminAccount,
        getAdminAccountById     : getAdminAccountById,

        getAppAccountByAppKey   : getAppAccountByAppKey,
        createAppAccount        : createAppAccount
    };
};

