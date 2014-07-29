(function(){
    angular.module('influenceApp.apiService', [
        'ngResource',
        'influenceApp.config'
    ]).factory('locationApiService', [
        '$resource',
        'influenceAppConfig'
        ,
        function($resource, influenceAppConfig){
            var apiConfig = influenceAppConfig.API;
            return $resource(
                [apiConfig.URL, "/searchVenue"].join('')
            );
        }
    ]).factory('postApiService', [
        '$resource',
        'influenceAppConfig'
        ,
        function($resource, influenceAppConfig){
            var apiConfig = influenceAppConfig.API;
            return $resource(
                [apiConfig.URL, "/post/:postId"].join('')
            );
        }
    ]);

})();