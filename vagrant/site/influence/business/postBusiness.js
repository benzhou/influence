var Q = require("q"),
    util = require("util"),
    errorCodes    = require('../error/errorCodes'),
    InfluenceError = require('../error/influenceError');

module.exports = function(helpers, logger, postDataHandler){
    //Posts
    var findPostById = function(postId){
        var df = Q.defer();

        logger.log("postBusiness.js findPostById, postId:%s", postId);
        if(!postId){
            df.reject(new InfluenceError(errorCodes.C_400_027_001.code));

            return df.promise;
        }

        Q.when(postDataHandler.findPostById(postId)).then(
            function(post){
                logger.log("postBusiness.js findPostById: postDataHandler.findPostById promise resolved");
                logger.log("here is the affiliate object");
                logger.log(post);

                if(!post){
                    throw new InfluenceError(errorCodes.C_400_027_002.code);
                }

                df.resolve(post);
            }
        ).catch(function(err){
                logger.log("postBusiness.js findPostById caught an error!");
                logger.log(err);

                df.reject(err);
            }).done(function(){
                logger.log("postBusiness.js findPostById done!");
            });

        return df.promise;
    },

        createPost = function(affiliateId, content, createdBy){
            var df = Q.defer();

            logger.log("createPost, content: %s,affiliateId:%s createdBy: %s", content, affiliateId, createdBy);

            //validation
            //required fields
            if(!content || !affiliateId){
                df.reject(new InfluenceError(errorCodes.C_400_028_001.code));

                return df.promise;
            }

            var

                post = {
                    content     : content,
                    affiliateId : affiliateId,
                    createdOn   : new Date(),
                    createdBy   : createdBy,
                    updatedOn   : new Date(),
                    updatedBy   : createdBy
                };

            Q.when(postDataHandler.createPost(post)).then(
                function(newPost){
                    logger.log("postBusiness.js createPost: postDataHandler.createPost promise resolved");
                    logger.log("here is the newPost object");
                    logger.log(newPost);

                    df.resolve(newPost);
                }
            ).catch(function(err){
                    logger.log("postBusiness.js createPost: caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("postBusiness.js createPost: done!");
                });


            return df.promise;
        },

        updatePost = function(postId, content, updatedBy){
            var df = Q.defer();

            //validation
            //required fields
            if(!postId || !content || !updatedBy){
                df.reject(new InfluenceError(errorCodes.C_400_029_001.code));

                return df.promise;
            }

            //TODO params verification, e.g.
            // - name length

            logger.log("updatePost, postId: %s, content: %s, updatedBy: %s", postId, content, updatedBy);

            var

                post = {
                    updatedOn   : new Date(),
                    updatedBy   : updatedBy
                };

            if(content != null){
                post.content = content;
            }

            Q.when(postDataHandler.updatePost(postId, post)).then(
                //
                function(updatedPost){
                    logger.log("postBusiness.js updatePost: postDataHandler.updatePost promise resolved");
                    logger.log("here is the updatedPost object");
                    logger.log(updatedPost);

                    df.resolve(updatedPost);
                }
            ).catch(function(err){
                    logger.log("postBusiness.js updatePost: caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("postBusiness.js updatePost: done!");
                });


            return df.promise;
        },

        loadPosts = function(filter, numberOfPage, pageNumber, sort){
            var df = Q.defer();

            //Cleaning and set defaults
            numberOfPage = numberOfPage || 10;
            pageNumber   = pageNumber || 1;

            numberOfPage = parseInt(numberOfPage);
            pageNumber = parseInt(pageNumber);

            if(isNaN(numberOfPage)){
                numberOfPage = 10;
            }

            if(isNaN(pageNumber)){
                pageNumber = 1;
            }

            var cleanedFilter = helpers.cleanSearchFilter({tenantId : 1, affiliateId : 1}, filter),
                cleanedSort     = helpers.isEmptyObject(sort) ? {createdOn : -1}: helpers.cleanSort({tenantId : 1, affiliateId : 1}, sort);

            Q.when(postDataHandler.loadPosts(cleanedFilter, numberOfPage, pageNumber, cleanedSort)).then(
                function(posts){
                    logger.log("postBusiness.js loadPosts: postDataHandler.loadPosts promise resolved");
                    logger.log("here is the posts object");
                    logger.log(posts);

                    df.resolve(posts);
                }
            ).catch(function(err){
                    logger.log("postBusiness.js loadPosts caught an error!");
                    logger.log(err);

                    df.reject(err);
                }).done(function(){
                    logger.log("postBusiness.js loadPosts done!");
                });


            return df.promise;
        };

    return {
        //Posts
        createPost                          : createPost,
        updatePost                          : updatePost,
        findPostById                        : findPostById,
        loadPosts                           : loadPosts
    };
};