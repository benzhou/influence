module.exports = function(errCodes, accountDataHandler){

    var
        getAdminAccountById = function(adminId){
            if(!adminId){
                throw new Exception();
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
                throw new Exception();
            }

            //defaulting values when necessary
            if(!username) {
                username = email;
            }

            //TODO:validate createdBy AdminId has rights to create a new admin account for passed in tenant

            //TODO: validate the password complexity



            //TODO: hash plain text password
            var passwordHash = passwordPlainText;


            var adminDo = {
                tenantId            : tenantId,
                username            : username,
                email               : email,
                passwordHash        : passwordHash,
                firstName           : firstName,
                lastName            : lastName,
                displayName         : displayName,
                createdBy           : createdBy,
                createdOn           : Date.Now()
            };

            return accountDataHandler.upsertAdminAccount(adminDo);
    };

    return {
        createAdminAccount  : createAdminAccount,
        getAdminAccountById : getAdminAccountById
    };
};

