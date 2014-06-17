module.exports = function(){
    return {
        db : {
            type :              "mongoDB",
            connectionString :  "mongodb://localhost:27017/influenceDb",
            poolSize :          10
        }
    };
};


