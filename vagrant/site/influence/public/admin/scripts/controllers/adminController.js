(function () {
    "use strict";

    angular.module('influenceAdminApp.controllers', [
        'influenceAdminApp.constants',
        'influenceAdminApp.config',
        'influenceAdminApp.apiServices'
    ])
        .controller('influenceAdminCtrl', function ($scope, $rootScope, $location, $log, influenceAdminAppConstants) {
            $log.log("influenceAdminCtrl called!");

            $scope.login = function(){
                $location.path('/login');
            };

            $rootScope.$broadcast(influenceAdminAppConstants.EVENTS.LOCATION_CHANGED, $location.path());
        })
        .controller('influenceAdminLoginCtrl', function ($scope, $rootScope, $location, $log, influenceAdminAppConstants, influenceAdminAppConfig, authService) {
            //$scope.
            $log.log("influenceAdminLoginCtrl called!");
            $scope.adminLogin = function(username, password, rememberMe){
                authService.adminLogin({
                    tenantId:influenceAdminAppConfig.API.TENANT_ID,
                    username:$scope.credential.username,
                    password:$scope.credential.password
                }).$promise.then(
                    function(result) {
                        $log.log('influenceAdminLoginCtrl adminLogin fulfilled!');
                        $log.log(result.data.token.token);
                    }
                ).catch(function(err){
                        $log.log('influenceAdminLoginCtrl adminLogin rejected!');
                        $log.log(err);
                    }
                );
            }

            $rootScope.$broadcast(influenceAdminAppConstants.EVENTS.LOCATION_CHANGED, $location.path());
        });
}());

