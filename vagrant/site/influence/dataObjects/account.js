module.exports = function(baseObj){

    baseObj.adminAccount = {
        adminId : 0,
        tenantId : 0,
        username : null,
        email : null,
        passwordHash : null,
        firstName : null,
        lastName : null,
        displayName : null,
        createdBy   : null,
        createdOn : Date.now()
    };

    baseObj.tenant = {
        tenantId : 0,
        name : null,
        displayName : null,
        description : null
    };

    baseObj.appAccount = {
        appId : 0,
        appName : null,
        appKey : null,
        appSecret : null
    };

    return baseObj;
};

