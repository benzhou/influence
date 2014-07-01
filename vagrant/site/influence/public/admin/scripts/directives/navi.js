angular.module('influenceAdminApp.navigation', [])
    .directive('naviDirective', function(){
        return {
            scope : {},
            restrict: 'E',
            controller : function($scope, $location, $log){
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
