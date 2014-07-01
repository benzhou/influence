(function () {
    "use strict";

    var influenceAdminControllers =
        angular.module('influenceAdminApp.controllers', [
            'influenceAdminApp.constants'
        ])
            .controller('influenceAdminCtrl', function ($scope, $rootScope, $location, $log, influenceAdminAppConstants) {
                $log.log("influenceAdminCtrl called!");

                $scope.login = function(){
                    $location.path('/login');
                };

                $rootScope.$broadcast(influenceAdminAppConstants.EVENTS.LOCATION_CHANGED, $location.path());
            })
            .controller('influenceAdminLoginCtrl', function ($scope, $rootScope, $location, $log, influenceAdminAppConstants) {
                //$scope.
                $log.log("influenceAdminLoginCtrl called!");

                $rootScope.$broadcast(influenceAdminAppConstants.EVENTS.LOCATION_CHANGED, $location.path());
            });
}());

