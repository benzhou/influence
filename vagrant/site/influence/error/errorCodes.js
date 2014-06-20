module.exports = function(){
    var SYSTEM_ERROR = "SYSTEM_ERROR",
        INTERNAL_ERROR = "INTERNAL_ERROR";

    //http://www.w3.org/Protocols/HTTP/HTRESP.html

    return {
        S_500_000_001       : { type : SYSTEM_ERROR, httpStatus: 500,  code : 500000001, desc : "System error" },
        //accountBusiness.js createAdminAccount
        C_400_001_001       : { type : INTERNAL_ERROR, httpStatus: 400, code : 400001001, desc : "Missing required parameters" },
        C_400_001_002       : { type : INTERNAL_ERROR, httpStatus: 400, code : 400001002, desc : "Admin with same email address: %s already exists!" },
        C_400_001_003       : { type : INTERNAL_ERROR, httpStatus: 400, code : 400001003, desc : "Admin with same username: %s already exists!" },

        //authBusiness.js adminAccountLogin
        C_400_002_001       : { type : INTERNAL_ERROR, httpStatus: 400, code : 400002001, desc : "Missing required parameters" },
        C_400_002_002       : { type : INTERNAL_ERROR, httpStatus: 400, code : 400002002, desc : "Invalid username/password" },
        C_400_002_003       : { type : INTERNAL_ERROR, httpStatus: 400, code : 400002003, desc : "Invalid username/password" }
    };
}();

