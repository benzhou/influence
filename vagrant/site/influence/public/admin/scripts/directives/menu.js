(function () {
    "use strict";

    angular.module('influenceAdminApp.menu', [
        'influenceAdminApp.constants',
        'influenceAdminApp.session'
    ])
        .directive('menuDirective', function(){
            var controller = function($scope, $rootScope, $location, $log, influenceAdminAppConstants, influenceAdminAppSession){
                $log.log('menuDirective Controller called');

                var menuSections = $scope.menuSections = [
                        {
                            name : "main",
                            menues : [
                                {name:"Overview", active:true, href:"/welcome"},
                                {name:"Affiliates", active:false, href:"/home/affiliates"},
                                {name:"Posts", active:false, href:"/home/posts"}
                            ]
                        },
                        {
                            name : "config",
                            menues : [
                                {name:"Admins", active:true, href:"/home/config/admins"},
                                {name:"Apps", active:false, href:"/home/config/apps"},
                                {name:"Tenants", active:false, href:"/home/config/tenants"}
                            ]
                        }
                    ],
                    refreshMenu = function(loc){
                        angular.forEach(menuSections, function(menuSection) {
                            angular.forEach(menuSection.menues, function(menu) {
                                menu.active = (menu.href === (loc ||$location.path()));
                            });
                        });
                    };

                refreshMenu();

                var locChangedUnsub = $rootScope.$on(influenceAdminAppConstants.EVENTS.LOCATION_CHANGED, function(e, loc){
                    $log.log('influenceAdminAppConstants event LOCATION_CHANGED fired, listened in menuDirective controller');

                    refreshMenu(loc);
                });

                $scope.$on(influenceAdminAppConstants.EVENTS.DESTROY, function(){
                    $log.log('influenceAdminAppConstants event DESTROY, listened in menuDirective controller');
                    locChangedUnsub();
                });
            };

            return {
                scope : {},
                restrict: 'E',
                controller : controller,
                templateUrl : '/admin/scripts/views/partials/menu.html'
            }
        });
}());