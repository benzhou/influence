(function () {
    "use strict";

    angular.module('influenceAdminApp.navigation', [
        'influenceAdminApp.constants'
    ])
    .directive('naviDirective', function(){
        return {
            scope : {},
            restrict: 'E',
            controller : function($scope, $location, $log, influenceAdminAppConstants){
                var items = $scope.items = [
                    {
                        name : "Home",
                        href : "/",
                        active : false
                    },
                    {
                        name : "Login",
                        href : "/login",
                        active : false
                    },
                    {
                        name : "Contact Us",
                        href : "/contactus",
                        active : false
                    }
                ];

                $log.log('naviDirective Controller called');
                $log.log(influenceAdminAppConstants);

                $scope.$on(influenceAdminAppConstants.EVENTS.LOCATION_CHANGED, function(e, loc){
                    $log.log('influenceAdminAppConstants event fired, listened in naviDirective controller');
                    //$log.log(arguments);
                    angular.forEach(items, function(itm) {
                        itm.active = (itm.href === loc);
                    });
                });

                $scope.naviClick = function(item){
                    angular.forEach(items, function(itm) {
                        itm.active = false;
                    });
                    item.active = true;
                    $location.path(item.href);
                }

            },
            templateUrl : '/admin/scripts/views/partials/navi.html'
        }
    });
}());