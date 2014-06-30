(function () {
    "use strict";

    var influenceAdminControllers =
        angular.module('influenceAdminControllers', []);

    influenceAdminControllers.controller('influenceAdminCtrl', function ($scope, $location, $log) {
        $scope.login = function(){
            $location.path('/login');
        };

        //$scope.login();
    });

    influenceAdminControllers.controller('influenceAdminNaviCtrl', function ($scope, $location) {
        $scope.activeNavi = function(currentNavi){
            if($location.path() === currentNavi){
                return "class='active'";
            }else{
                return "";
            }
        }
    });
}());

