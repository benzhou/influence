module.exports = function(dbProvider){

    var
        //Posts
        createPost = function(postDo){
            return dbProvider.createPost(postDo);
        },
        updatePost = function(postId, updateDo){
            return dbProvider.updatePost(postId, updateDo);
        },
        findPostById = function(postId){
            return dbProvider.findPostById(postId);
        },
        loadPosts = function(filter, numberOfPage, pageNumber, sort) {
            return dbProvider.loadPosts(filter, numberOfPage, pageNumber, sort);
        };

    return {
        createPost              : createPost,
        updatePost              : updatePost,
        findPostById            : findPostById,
        loadPosts               : loadPosts
    };
};

