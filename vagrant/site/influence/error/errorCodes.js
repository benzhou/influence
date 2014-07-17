module.exports = function(){
    var SYSTEM_ERROR    = "SYSTEM_ERROR",
        CLIENT_ERROR    = "CLIENT_ERROR",
        SUCCESS         = "SUCCESS";

    //http://www.w3.org/Protocols/HTTP/HTRESP.html

    return {
        SU_200              : { type : SUCCESS,      httpStatus: 200,  code : 200000000, desc : "Success" },
        S_500_000_001       : { type : SYSTEM_ERROR, httpStatus: 500,  code : 500000001, desc : "System error" },

        //apiLogBusiness.js log
        S_500_001_001       : { type : SYSTEM_ERROR, httpStatus: 500, code : 500001001, desc : "Not able to write apiCallLog." },

        //adminAuthenticationMiddleware.js adminTokenAuthentication
        C_401_001_001       : { type : CLIENT_ERROR, httpStatus: 401, code : 401001001, desc : "Unauthorized" },
        C_401_001_002       : { type : CLIENT_ERROR, httpStatus: 401, code : 401001002, desc : "Unauthorized" },

        C_404_001_001       : { type : CLIENT_ERROR, httpStatus: 404, code : 404001001, desc : "End Point not found" },

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
        C_400_004_003       : { type : CLIENT_ERROR, httpStatus: 400, code : 400004003, desc : "Inactive token." },
        C_400_004_004       : { type : CLIENT_ERROR, httpStatus: 400, code : 400004004, desc : "Expired token." },

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

        //authBusiness.js invalidateAdminAuthToken
        C_400_010_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400010001, desc : "Missing required parameters" },
        C_400_010_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400010002, desc : "Failed to invalidate token." },

        //authBusiness.js findAdminAuthToken
        C_400_011_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400011001, desc : "Missing required parameters" },
        C_400_011_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400011002, desc : "xxx" },

        //tenantsBusiness.js  updateTenant
        C_400_012_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400012001, desc : "Missing required parameters" },

        //accountBusiness.js  updateAdmin
        C_400_013_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400013001, desc : "Missing required parameters" },
        C_400_013_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400013002, desc : "Invalid Admin ID, not able to update." },
        C_400_013_003       : { type : CLIENT_ERROR, httpStatus: 400, code : 400013003, desc : "Email or Username has already been taken by an other admin." },

        //accountBusiness.js  loadAdminAccounts
        C_400_014_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400014001, desc : "Missing required parameters" },

        //authBusiness.js  findActionById
        C_400_015_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400015001, desc : "Missing required parameters" },
        C_400_015_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400015002, desc : "Invalid Action ID" },

        //authBusiness.js createAction
        C_400_016_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400016001, desc : "Missing required parameters" },
        C_400_016_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400016002, desc : "Action Key already exist!" },

        //authBusiness.js updateAction
        C_400_017_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400017001, desc : "Missing required parameters" },
        C_400_017_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400017002, desc : "Action Key already exists!" },

        //tenantsBusiness.js  findAffiliateById
        C_400_018_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400018001, desc : "Missing required parameters" },
        C_400_018_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400018002, desc : "Invalid Affiliate ID" },

        //tenantsBusiness.js createAffiliate
        C_400_019_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400019001, desc : "Missing required parameters" },

        //tenantsBusiness.js updateAffiliate
        C_400_020_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400020001, desc : "Missing required parameters" },

        //authBusiness.js findActionByKey
        C_400_021_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400021001, desc : "Missing required parameters" },
        C_400_021_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400021002, desc : "Invalid Action Key" },

        //authBusiness.js findAdminAuthorizationsByAdminId
        C_400_022_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400022001, desc : "Missing required parameters" },

        //authBusiness.js createAdminPermissions
        C_400_023_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400023001, desc : "Missing required parameters" },
        C_400_023_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400023002, desc : "Invalid Affiliates Permission" },
        C_400_023_003       : { type : CLIENT_ERROR, httpStatus: 400, code : 400023003, desc : "Invalid Tenants Permission" },
        C_400_023_004       : { type : CLIENT_ERROR, httpStatus: 400, code : 400023004, desc : "Invalid Admin ID" },
        C_400_023_005       : { type : CLIENT_ERROR, httpStatus: 400, code : 400023005, desc : "Missing valid permissions." },
        C_400_023_006       : { type : CLIENT_ERROR, httpStatus: 400, code : 400023006, desc : "Invalid permissions when editing." },

        //accountBusiness.js  findAdminAccountByTenantAndUsername
        C_400_024_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400024001, desc : "Missing required parameters" },
        C_400_024_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400024002, desc : "Username doesn't exist in Tenant" },

        //accountBusiness.js  findAdminAccountByTenantAndEmail
        C_400_025_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400025001, desc : "Missing required parameters" },
        C_400_025_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400025002, desc : "Email doesn't exist in Tenant" }


    };
}();

