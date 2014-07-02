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
                var loggedOutItems = [
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
                    ],
                    logedInItems = [
                        {
                            name : "Home",
                            href : "/welcome",
                            active : false
                        },
                        {
                            name : "Logout",
                            href : "/logout",
                            active : false
                        },
                        {
                            name : "Contact Us",
                            href : "/contactus",
                            active : false
                        }
                    ]
                ;

//                var items = $scope.items = loggedOutItems;
//
//                angular.forEach(items, function(itm) {
//                    itm.active = (itm.href === $location.path());
//                });

                $log.log('naviDirective Controller called');
                $log.log(influenceAdminAppConstants);

                $scope.$on(influenceAdminAppConstants.EVENTS.LOCATION_CHANGED, function(e, loc){
                    $log.log('influenceAdminAppConstants event fired, listened in naviDirective controller');
                    //$log.log(arguments);
                    angular.forEach(items, function(itm) {
                        itm.active = (itm.href === loc);
                    });
                });

                $scope.$on(influenceAdminAppConstants.EVENTS.ADMIN_AUTHENTICATED, function(){
                    $log.log('naviDirective influenceAdminAppConstants.EVENTS.ADMIN_AUTHENTICATED handled!');
                    $scope.items = items = logedInItems;

                    angular.forEach(items, function(itm) {
                        itm.active = (itm.href === $location.path());
                    });
                });

                $scope.$on(influenceAdminAppConstants.EVENTS.ADMIN_LOGGED_OUT, function(){
                    $log.log('naviDirective influenceAdminAppConstants.EVENTS.ADMIN_LOGGED_OUT handled!');
                    $scope.items = items = loggedOutItems;

                    angular.forEach(items, function(itm) {
                        itm.active = (itm.href === $location.path());
                    });
                });


            },
            templateUrl : '/admin/scripts/views/partials/navi.html'
        }
    });
}());