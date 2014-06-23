module.exports = function(){
    var SYSTEM_ERROR = "SYSTEM_ERROR",
        CLIENT_ERROR = "CLIENT_ERROR";

    //http://www.w3.org/Protocols/HTTP/HTRESP.html

    return {
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

        //authBusiness.js createAdminLoginToken
        C_400_003_001       : { type : CLIENT_ERROR, httpStatus: 400, code : 400003001, desc : "Missing required parameters" },
        C_400_003_002       : { type : CLIENT_ERROR, httpStatus: 400, code : 400003002, desc : "Invalid username/password" },
        C_400_003_003       : { type : CLIENT_ERROR, httpStatus: 400, code : 400003003, desc : "Invalid username/password" }
    };
}();

