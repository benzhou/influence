(function(){
    angular.module('influenceAdminApp.apiServices', [
        'ngResource',
        'influenceAdminApp.config'
    ]).factory('authService', [
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
    ]).factory('adminService', [
        '$resource',
        'influenceAdminAppConfig'
        ,
        function($resource, influenceAdminAppConfig){
            var apiConfig = influenceAdminAppConfig.API;
            return $resource(
                [apiConfig.URL, "/auth/admin"].join(''), //endpoint
                {}
            );
        }
    ]).factory('tenantsService', [
        '$resource',
        'influenceAdminAppConfig'
        ,
        function($resource, influenceAdminAppConfig){
            var apiConfig = influenceAdminAppConfig.API;
            return $resource(
                [apiConfig.URL, "/tenants/:numberOfPage/:pageNumber"].join(''), //endpoint
                {}
            );
        }
    ]);

})();