module.exports = function(dbProvider){

    var
        upsertApiCallLog = function(apiCallLog){
            return dbProvider.upsertApiCallLog(apiCallLog);
        };

    return {
        upsertApiCallLog            : upsertApiCallLog
    };
};

