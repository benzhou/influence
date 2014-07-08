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
                [apiConfig.URL, "/account/admin/:adminId"].join(''), //endpoint
                {},
                {
                    query     : { method: "GET", url : [apiConfig.URL, "/account/admins/:tenantId/:numberOfPage/:pageNumber"].join('')},
                }
            );
        }
    ]).factory('tenantsService', [
        '$resource',
        'influenceAdminAppConfig'
        ,
        function($resource, influenceAdminAppConfig){
            var apiConfig = influenceAdminAppConfig.API;
            return $resource(
                [apiConfig.URL, "/tenant/:tenantId"].join(''), //endpoint
                {},
                {
                    query     : { method: "GET", url : [apiConfig.URL, "/tenants/:numberOfPage/:pageNumber"].join('')},
                }
            );
        }
    ]).factory('affiliatesService', [
        '$resource',
        'influenceAdminAppConfig'
        ,
        function($resource, influenceAdminAppConfig){
            var apiConfig = influenceAdminAppConfig.API;
            return $resource(
                [apiConfig.URL, "/affiliate/:affiliateId"].join(''), //endpoint
                {},
                {
                    query     : { method: "GET", url : [apiConfig.URL, "/affiliates/:tenantId/:numberOfPage/:pageNumber"].join('')}
                }
            );
        }
    ]).factory('actionsService', [
        '$resource',
        'influenceAdminAppConfig'
        ,
        function($resource, influenceAdminAppConfig){
            var apiConfig = influenceAdminAppConfig.API;
            return $resource(
                [apiConfig.URL, "/action/:actionId"].join(''), //endpoint
                {},
                {
                    query     : { method: "GET", url : [apiConfig.URL, "/actions/:numberOfPage/:pageNumber"].join('')}
                }
            );
        }
    ]);

})();