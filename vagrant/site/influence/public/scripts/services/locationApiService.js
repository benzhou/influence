(function(){
    angular.module('influenceApp.locationApiServices', [
        'ngResource',
        'influenceAdminApp.config'
    ]).factory('locationApiService', [
        '$resource',
        'influenceAdminAppConfig'
        ,
        function($resource, influenceAdminAppConfig){
            var apiConfig = influenceAdminAppConfig.API;
            return $resource(
                [apiConfig.URL, "/auth/admin/login/:tenantId/:username/:password"].join(''), //endpoint
                {},
                {
                    adminLogin      : { method: "GET", params:{appKey:influenceAdminAppConfig.API.KEY}},
                    adminLogout     : { method: "GET", url : [apiConfig.URL, "/auth/adminToken/invalidate"].join('')},
                    adminAuthToken  : { method: "GET", url : [apiConfig.URL, "/auth/adminToken"].join('')}
                }
            );
        }
    ]);

})();