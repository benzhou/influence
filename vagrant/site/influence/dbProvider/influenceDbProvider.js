module.exports = function(Q, dbProvider){

    var
        findAdminAccountById = function(adminId){
            return dbProvider.findAdminAccountById(adminId);
        },
        
        upsertAdminAccountById = function(adminAccountDo){
            return dbProvider.upsertAdminAccountById(adminAccountDo);
        },

        upsertAppAccountById = function(adminAccountDo){
            return dbProvider.upsertAppAccountById(adminAccountDo);
        };

    return {
        findAdminAccountById    : findAdminAccountById,
        upsertAdminAccountById  : upsertAdminAccountById,
        upsertAppAccountById    : upsertAppAccountById
    };
};

