angular.module('influenceAdminNavi', ['influenceAdminApp.config'])
    /*
    .controller('naviCtrl', ['$scope', function($scope, $location){
        $scope.activeNavi = function(currentRoute){
            console.log("Hello activeNavi");
            console.log($location.path());
        };

    }])
    */
    .directive('naviDirective', ['influenceAdminAppConfig', function(influenceAdminAppConfig){
        return {
            scope : {},
            restrict: 'E',
            controller : function($scope, $location, $log, influenceAdminAppConfig){
                var items = $scope.items = [
                    {
                        name : "Home",
                        href : "/",
                        active : true
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

                $log.log('naviDirective controller called: ');
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
    }]);
