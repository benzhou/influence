module.exports = function(dbProvider){

    var
        insertApiCallLog = function(apiCallLog){
            return dbProvider.insertApiCallLog(apiCallLog);
        },
        createNewConsumerPostLog = function(postLog){
            return dbProvider.createNewConsumerPostLog(postLog);
        };

    return {
        insertApiCallLog            : insertApiCallLog,
        createNewConsumerPostLog    : createNewConsumerPostLog
    };
};

