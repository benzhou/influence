module.exports = function(dbProvider, accountDataObject){

    var
        getAdminAccountById = function(adminId){
            return dbProvider.findAdminAccountById(adminId);
        },

        upsertAdminAccountById = function(adminDo){
            return dbProvider.upsertAdminAccountById(adminDo);
        };

    return {
        getAdminAccountById     : getAdminAccountById,
        upsertAdminAccountById  : upsertAdminAccountById
    };
};

