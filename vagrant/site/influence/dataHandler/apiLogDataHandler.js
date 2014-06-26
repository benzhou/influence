module.exports = function(dbProvider){

    var
        insertApiCallLog = function(apiCallLog){
            return dbProvider.insertApiCallLog(apiCallLog);
        };

    return {
        insertApiCallLog            : insertApiCallLog
    };
};

