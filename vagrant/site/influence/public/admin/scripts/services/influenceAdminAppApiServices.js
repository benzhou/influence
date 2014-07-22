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
                    query               : { method: "GET", url : [apiConfig.URL, "/account/admins/:tenantId"].join('')},
                    queryConfigurable   : { method: "GET", url : [apiConfig.URL, "/config/admins/:tenantId"].join('')}
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
                    query                   : { method: "GET", url : [apiConfig.URL, "/tenants/:numberOfPage/:pageNumber"].join('')},
                    queryConfigurable       : { method: "GET", url : [apiConfig.URL, "/config/tenants/:configOptions"].join('')}
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
                    query               : { method: "GET", url : [apiConfig.URL, "/affiliates/:tenantId"].join('')},
                    queryConfigurable   : { method: "GET", url : [apiConfig.URL, "/config/affiliates/:tenantId"].join('')}
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
    ]).factory('adminPermissionsService', [
        '$resource',
        'influenceAdminAppConfig'
        ,
        function($resource, influenceAdminAppConfig){
            var apiConfig = influenceAdminAppConfig.API;
            return $resource(
                [apiConfig.URL, "/permissions/admin/:adminId"].join(''), //endpoint
                {}
            );
        }
    ]);

})();