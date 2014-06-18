module.exports = function(){
    var SYSTEM_ERROR = "SYSTEM_ERROR",
        INTERNAL_ERROR = "INTERNAL_ERROR";

    return {
        S_500_001       : { type : SYSTEM_ERROR, code : 500001, desc : "System error" },
        C_400_001       : { type : INTERNAL_ERROR, code : 400001, desc : "Missing required parameters" }
    };
};

