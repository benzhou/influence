module.exports = function(){
    var SYSTEM_ERROR    = "SYSTEM_ERROR",
        CLIENT_ERROR    = "CLIENT_ERROR",
        SUCCESS         = "SUCCESS";

    //http://www.w3.org/Protocols/HTTP/HTRESP.html

    return {
        SU_200              : { type : SUCCESS,      httpStatus: 200,  code : 200000000, desc : "Success" },
        S_500_000_001       : { type : SYSTEM_ERROR, httpStatus: 500,  code : 500000001, desc : "System error" },

        //accountBusiness.js createAdminAccount
        C_400_001_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400001001, desc : "Missing required parameters" },
        C_400_001_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400001002, desc : "Admin with same email address: %s already exists!" },
        C_400_001_003       : { type : CLIENT_ERROR, httpStatus: 400, code : 400001003, desc : "Admin with same username: %s already exists!" },

        //authBusiness.js adminAccountLogin
        C_400_002_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400002001, desc : "Missing required parameters" },
        C_400_002_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400002002, desc : "Invalid username/password" },
        C_400_002_003       : { type : CLIENT_ERROR, httpStatus: 400, code : 400002003, desc : "Invalid username/password" },
        C_400_002_004       : { type : CLIENT_ERROR, httpStatus: 400, code : 400002004, desc : "Unexpected error when create admin auth token" },
        C_400_002_005       : { type : CLIENT_ERROR, httpStatus: 400, code : 400002005, desc : "Not able to create admin auth token" },

        //authBusiness.js createAdminLoginToken
        C_400_003_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400003001, desc : "Missing required parameters" },
        C_400_003_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400003002, desc : "Invalid username/password" },
        C_400_003_003       : { type : CLIENT_ERROR, httpStatus: 400, code : 400003003, desc : "Invalid username/password" },

        //authBusiness.js validateAdminAuthToken
        C_400_004_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400004001, desc : "Invalid token." },
        C_400_004_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400004002, desc : "Invalid token." },

        //tenantsBusiness.js getTenantById
        C_400_005_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400005001, desc : "Missing required parameters" },
        C_400_005_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400005002, desc : "Invalid TenantId" },

        //tenantsBusiness.js createTenant
        C_400_006_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400006001, desc : "Missing required parameters" },

        //accountBusiness.js getAdminAccountById
        C_400_007_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400007001, desc : "Missing required parameters" },
        C_400_007_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400007002, desc : "Invalid adminId." },

        //accountBusiness.js getAppAccountById
        C_400_008_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400008001, desc : "Missing required parameters" },
        C_400_008_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400008002, desc : "Invalid appKey" },

        //accountBusiness.js createAppAccount
        C_400_009_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400009001, desc : "Missing required parameters" },
        C_400_009_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400009002, desc : "Not able to create an app." },

        //adminAuthenticationMiddleware.js adminTokenAuthentication
        C_401_001_001       : { type : CLIENT_ERROR, httpStatus: 401, code : 401001001, desc : "Unauthorized" },
        C_401_001_002       : { type : CLIENT_ERROR, httpStatus: 401, code : 401001002, desc : "Unauthorized" }
    };
}();

