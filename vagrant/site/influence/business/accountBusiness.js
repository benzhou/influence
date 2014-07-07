var
    Q = require("q"),
    InfluenceError = require('../error/influenceError'),
    errorCodes      = require('../error/errorCodes'),
    crypto = require('crypto');

module.exports = function(helpers, util, logger, accountDataHandler){

    var
        //Admin Accounts
        loadAdminAccounts = function(tenantId, numberOfPage, pageNumber){
            var df = Q.defer();

            //validation
            //required fields
            if(!tenantId){
                df.reject(
                    new InfluenceError(errorCodes.C_400_014_001.code)
                );

                return df.promise;
            }

            //Cleaning and set defaults
            numberOfPage = numberOfPage || 10;
            pageNumber   = pageNumber || 1;

            numberOfPage = parseInt(numberOfPage);
            pageNumber = parseInt(pageNumber);

            if(isNaN(numberOfPage)){
                numberOfPage = 10;
            }

            if(isNaN(pageNumber)){
                pageNumber = 1;
            }

            Q.when(accountDataHandler.loadAdminAccounts(tenantId, numberOfPage, pageNumber)).then(
                function(admins){

                    df.resolve(admins);
                }
            ).catch(
                function(err){
                    logger.log('accountBusiness.loadAdminAccounts catch block got an err:');
                    logger.log(err);

                    df.reject(err);
                }
            ).done(
                function(){
                    logger.log('accountBusiness.loadAdminAccounts done block was called');
                }
            );

            return df.promise;
        },

        getAdminAccountById = function(adminId){
            var df = Q.defer();

            //validation
            //required fields
            if(!adminId){
                df.reject(
                    new InfluenceError(errorCodes.C_400_007_001.code)
                );

                return df.promise;
            }

            Q.when(accountDataHandler.getAdminAccountById(adminId)).then(
                function(admin){
                    if(!admin){
                        throw new InfluenceError(errorCodes.C_400_007_002.code);
                    }

                    df.resolve(admin);
                }
            ).catch(
                function(err){
                    logger.log('accountBusiness.getAdminAccountById catch block got an err:');
                    logger.log(err);

                    df.reject(err);
                }
            ).done(
                function(){
                    logger.log('accountBusiness.getAdminAccountById done block was called');
                }
            );

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

            logger.log("accountBusiness.js createAdminAccount, tenantId:%s, email:%s, passwordPlainText:%s, createdBy %s", tenantId, email, passwordPlainText, createdBy);
            //validation
            //required fields
            if(!tenantId || !email || !passwordPlainText || !createdBy){
                df.reject(new InfluenceError(errorCodes.C_400_001_001.code));

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
                            errorCodes.C_400_001_002.code,
                            util.format(errorCodes.C_400_001_002.desc, email)
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
                            errorCodes.C_400_001_003.code,
                            util.format(errorCodes.C_400_001_003.desc, email)
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

        updateAdminAccount = function(
            adminId,
            username,
            email,
            firstName,
            lastName,
            displayName,
            updatedBy
            ){
            var df = Q.defer();

            logger.log("accountBusiness.js updateAdminAccount, adminId:%s", adminId);
            //validation
            //required fields
            if(!adminId || !updatedBy){
                df.reject(new InfluenceError(errorCodes.C_400_013_001.code));

                return df.promise;
            }

            //TODO: validate Email format (length, invalid characters etc.)
            //TODO: validate Username format (length, invalid characters etc.)
            //TODO: validate firstName, lastName, displayName length


            //TODO:validate createdBy AdminId has rights to create a new admin account for passed in tenant


            Q.when(getAdminAccountById(adminId)).then(
                function(admin){
                    logger.log('accountBusiness.updateAdminAccount getAdminAccountById fulfilled');
                    logger.log('===> to be updated Admin Document: ');
                    logger.log(admin);

                    if(!admin){
                        throw new InfluenceError(errorCodes.C_400_013_002.code);
                    }

                    //Check if email or username is changed
                    if(admin.email !== email){
                        return accountDataHandler.findAdminAccountByTenantAndEmail(admin.tenantId, email);
                    }else{
                        if(email !== username && admin.username != username){
                            return accountDataHandler.findAdminAccountByTenantAndUsername(admin.tenantId, username);
                        }
                    }
                }
            ).then(
                function(adminMatch){
                    logger.log('===> Matched Admin Document: ');
                    logger.log(adminMatch);

                    if(adminMatch && adminMatch._id === adminId){
                        //If admin exists, means findAdminAccountByTenantAndEmail or findAdminAccountByTenantAndUsername
                        //found an existing admin in the tenant with the same email or username
                        throw new InfluenceError(errorCodes.C_400_013_003.code);
                    }

                    //now start to update the admin
                    var updateAdminDo = {
                        updatedBy           : updatedBy,
                        updatedOn           : new Date()
                    };

                    if(username){
                        updateAdminDo.username = username;
                    }
                    if(email){
                        updateAdminDo.email = email;
                    }
                    if(firstName){
                        updateAdminDo.firstName = firstName;
                    }
                    if(lastName){
                        updateAdminDo.lastName = lastName;
                    }
                    if(displayName){
                        updateAdminDo.displayName = displayName;
                    }

                    return accountDataHandler.updateAdminAccount(adminId, updateAdminDo);
                }
            ).then(
                function(newAdmin){
                    //accountDataHandler.updateAdminAccount is resolved!
                    logger.log('accountBusiness.updateAdminAccount accountDataHandler.updateAdminAccount is fulfilled');
                    logger.log(newAdmin);

                    df.resolve(newAdmin);
                }
            ).catch(
                function(err){
                    //one of the promises was rejected
                    logger.log('accountBusiness.updateAdminAccount catch block got an err');
                    logger.log(err && err.stack?err.stack:err);

                    df.reject(err);
                }
            ).done(

                function(){
                    logger.log('accountBusiness.updateAdminAccount done block was called');
                }
            );

            return df.promise;
        },

        //App Account
        getAppAccountByAppKey = function(appKey){
            var df = Q.defer();

            //validation
            //required fields
            if(!appKey){
                df.reject(
                    new InfluenceError(errorCodes.C_400_008_001.code)
                );

                return df.promise;
            }

            Q.when(accountDataHandler.findAppAccountByAppKey(appKey)).then(
                function(app){
                    if(!app){
                        //if admin is false value, means we didn't find the admin by the tenantId and username
                        throw new InfluenceError(errorCodes.C_400_008_002.code);
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
                df.reject(new InfluenceError(errorCodes.C_400_009_001.code));
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

            Q.when(accountDataHandler.upsertAppAccountByAppkey(appDo)).then(
                function(app){
                    if(!app){
                        throw new InfluenceError(errorCodes.C_400_009_002.code);
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

            return df.promise;
        };

    return {
        loadAdminAccounts       : loadAdminAccounts,
        createAdminAccount      : createAdminAccount,
        getAdminAccountById     : getAdminAccountById,
        updateAdminAccount      : updateAdminAccount,

        getAppAccountByAppKey   : getAppAccountByAppKey,
        createAppAccount        : createAppAccount
    };
};

