(function () {
    "use strict";

    var influenceAdminControllers =
        angular.module('influenceAdminApp.controllers', []);

    influenceAdminControllers.controller('influenceAdminCtrl', function ($scope, $location, $log) {
        $log.log("influenceAdminCtrl called!");

        $scope.login = function(){
            $location.path('/login');
        };


    });

    influenceAdminControllers.controller('influenceAdminLoginCtrl', function ($scope, $location, $log) {
        //$scope.
        $log.log("influenceAdminLoginCtrl called!");
    });
}());

