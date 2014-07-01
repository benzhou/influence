(function(){
    angular.module('influenceAdminApp.apiServices', [
        'ngResource',
        'influenceAdminApp.config'
    ]).factory('authService', ['$resource', 'influenceAdminAppConfig',
        function($resource, influenceAdminAppConfig){
            var apiConfig = influenceAdminAppConfig.API;
            return $resource(
                [apiConfig.URL, "/auth/admin/login/:tenantId/:username/:password"].join(''), //endpoint
                {},
                {
                    adminLogin : { method: "GET", params:{appKey:influenceAdminAppConfig.API.KEY}}
                }
            );
        }
    ]);

})();