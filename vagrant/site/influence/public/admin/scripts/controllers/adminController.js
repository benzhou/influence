(function () {
    "use strict";

    angular.module('influenceAdminApp.controllers', [
        'influenceAdminApp.constants',
        'influenceAdminApp.config',
        'influenceAdminApp.session',
        'influenceAdminApp.apiServices'
    ])
        .controller('influenceAdminCtrl', function ($scope, $rootScope, $location, $log, influenceAdminAppConstants, influenceAdminAppSession) {
            $log.log("influenceAdminCtrl called!");

            $scope.login = function(){
                $location.path('/login');
            };

            influenceAdminAppSession.init();
            //If user already authenticated, then go to welcome view directly
            if(influenceAdminAppSession.token){
                $rootScope.$broadcast(influenceAdminAppConstants.EVENTS.ADMIN_AUTHENTICATED);
                $location.path('/welcome');
                return;
            }

            $rootScope.$broadcast(influenceAdminAppConstants.EVENTS.LOCATION_CHANGED, $location.path());
        })
        .controller('influenceAdminLoginCtrl', function (
            $scope, $rootScope, $location, $log,
            influenceAdminAppConstants, influenceAdminAppConfig, authService,
            influenceAdminAppSession) {

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
                        influenceAdminAppSession.create(result.data.token.token);
                        $location.path('/welcome');

                        $rootScope.$broadcast(influenceAdminAppConstants.EVENTS.ADMIN_AUTHENTICATED);
                    }
                ).catch(function(err){
                        $log.log('influenceAdminLoginCtrl adminLogin rejected!');
                        $log.log(err);
                    }
                );
            }

            influenceAdminAppSession.init();
            //If user already authenticated, then go to welcome view directly
            if(influenceAdminAppSession.token){
                $rootScope.$broadcast(influenceAdminAppConstants.EVENTS.ADMIN_AUTHENTICATED);
                return;
            }

            $rootScope.$broadcast(influenceAdminAppConstants.EVENTS.LOCATION_CHANGED, $location.path());
        })
        .controller('influenceAdminWelcomeCtrl', function($scope, $rootScope, $location, influenceAdminAppConstants, influenceAdminAppSession){
            influenceAdminAppSession.init();
            //If user already authenticated, then go to welcome view directly
            if(!influenceAdminAppSession.token){
                $rootScope.$broadcast(influenceAdminAppConstants.EVENTS.ADMIN_LOGGED_OUT);
                $location.path('/');
                return;
            }
        });
}());

