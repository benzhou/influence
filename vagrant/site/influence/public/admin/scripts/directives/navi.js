(function () {
    "use strict";

    angular.module('influenceAdminApp.navigation', [
        'influenceAdminApp.constants',
        'influenceAdminApp.session'
    ])
    .directive('naviDirective', function(){

        return {
            scope : {},
            restrict: 'E',
            controller : function($scope, $rootScope, $location, $log, influenceAdminAppConstants, influenceAdminAppSession){
                $log.log('naviDirective Controller called');

                var
                    items,
                    LoggedOutItems = [
                        { name : "Home", href : "/", active : false},
                        { name : "Login",href : "/login",active : false},
                        { name : "Contact Us", href : "/contactus", active : false}
                    ],
                    loggedInItems = [
                        { name : "Home", href : "/welcome", active : false},
                        { name : "Logout", href : "/logout", active : false},
                        { name : "Contact Us", href : "/contactus", active : false}
                    ],
                    refreshNavi = function(loc){
                        var isAuthenticated = influenceAdminAppSession.isAuthenticated();

                        if(isAuthenticated){
                            var admin = influenceAdminAppSession.token.admin;
                            $scope.admin = {
                                name : admin.displayName || admin.firstName || admin.username
                            };
                        }else{
                            $scope.admin = null;
                        }

                        $scope.items = items = isAuthenticated ? loggedInItems : LoggedOutItems;


                        angular.forEach(items, function(itm) {
                            itm.active = (itm.href === (loc ||$location.path()));
                        });
                    };

                refreshNavi();

                var
                    locChangedUnSub = $rootScope.$on(influenceAdminAppConstants.EVENTS.LOCATION_CHANGED, function(e, loc){
                        $log.log('influenceAdminAppConstants event fired, listened in naviDirective controller');

                        refreshNavi();
                    }),
                    authenticatedUnSub = $rootScope.$on(influenceAdminAppConstants.EVENTS.ADMIN_AUTHENTICATED, function(){
                        $log.log('naviDirective influenceAdminAppConstants.EVENTS.ADMIN_AUTHENTICATED handled!');

                        refreshNavi();
                    }),
                    loggedOutUnSub = $rootScope.$on(influenceAdminAppConstants.EVENTS.ADMIN_LOGGED_OUT, function(){
                        $log.log('naviDirective influenceAdminAppConstants.EVENTS.ADMIN_LOGGED_OUT handled!');
                        refreshNavi();
                    });

                $scope.$on(influenceAdminAppConstants.EVENTS.DESTROY, function(){
                    locChangedUnSub();
                    authenticatedUnSub();
                    loggedOutUnSub();
                });


            },
            templateUrl : '/admin/scripts/views/partials/navi.html'
        }
    });
}());