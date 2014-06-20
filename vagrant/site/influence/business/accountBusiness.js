module.exports = function(uuid, errCodes, accountDataHandler, logger){

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
            //validation
            //required fields
            if(!email || !passwordPlainText || !createdBy){
                throw new Error("Required Fields are missing");
            }

            //defaulting values when necessary
            if(!username) {
                username = email;
            }

            //TODO:validate createdBy AdminId has rights to create a new admin account for passed in tenant

            //TODO: validate the password complexity



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

