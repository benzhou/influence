(function(){
    "use strict";

    angular.module('influenceAdminApp.adminPermissions', [
        'influenceAdminApp.constants'
    ])
        .directive('adminPermissions', function($log){
            var controller = function($scope, $rootScope, $log, influenceAdminAppConstants){
                $log.log("adminPermissions controller: ");
                $log.log($scope.actions);

                var
                    unSubQueue = [],
                    perms = $scope.permissions || {},
                    permModel = {

                    };

                if(!perms.actions){
                    permModel.actions = [];
                }else{
                    if(perms.actions === "*"){
                        permModel.allAppActions = true;
                    }
                }


                //Handlers
                unSubQueue.push($scope.$watch("permissionLevel", function(){
                    $log.log("adminPermissions controller: $watch permissionLevel changed!");
                    $log.log($scope.permissionLevel);
                    if($scope.permissionLevel.level === "tenant" && !$scope.selectedTenent){
                        $scope.loadingStart();
                        $scope.loadTenants().then(
                            function(result){
                                $scope.tenants = result.data.tenants;
                            }
                        ).catch(
                            function(err){
                                $log.log("adminPermissions controller: $watch permissionLevel loadTenants promise caught an error!");
                                $log.log(err);

                                $scope.onError(err);
                            }
                        ).finally(
                            function(){
                                $scope.loadingEnd();
                            }
                        );
                    }

                    if($scope.permissionLevel.level === "affiliate"){

                    }else{
                        //When any other level, clear $scope.selectedAffilaite
                        $scope.selectedAffilaite = null;
                    }
                }));
                $scope.$on(influenceAdminAppConstants.EVENTS.DESTROY, function(){
                    $log.log('influenceAdminAppConstants event DESTROY, listened in adminPermissions directive controller');
                    angular.forEach(unSubQueue, function(unSubFunc){
                        unSubFunc();
                    });
                });

                $scope.isAppActionsContains = function(action){
                    if(permModel.actions === "*") return true;

                    return permModel.actions.indexOf(action) > 0;
                };
                $scope.isTenantActionsContains = function(action){
                    if(permModel.actions === "*") return true;

                    return permModel.actions.indexOf(action) > 0;
                };
                $scope.isAffiliateActionsContains = function(action){
                    if(permModel.actions === "*") return true;

                    return permModel.actions.indexOf(action) > 0;
                };
            };

            return {
                scope : {
                    permissionLevel : "=",
                    actions : "=",
                    permissions : "=",
                    loadingStart: "&",
                    loadingEnd: "&",
                    onError:"&",
                    loadTenants : "&",
                    loadAffiliates : "&"
                },
                link : function(scope, element, attrs){
                    $log.log("permissions directive link function: ");
                    $log.log(scope.actions);
                },
                restrict: 'E',
                controller : controller,
                templateUrl : '/admin/scripts/views/directives/permissions.html'
            }
        });
})();
