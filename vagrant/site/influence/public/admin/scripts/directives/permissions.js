(function(){
    "use strict";

    angular.module('influenceAdminApp.adminPermissions', [
        'influenceAdminApp.constants'
    ])
        .directive('adminPermissions', function($log){
            var controller = function($scope, $rootScope, $log, $q, influenceAdminAppConstants){
                $log.log("adminPermissions controller: ");
                $log.log($scope.actions);

                var
                    unSubQueue = [],
                    perms = $scope.permissions || {},
                    permModel = {
                        all : {}
                    },
                    refreshAffiliates = function(){
                        $scope.loadingStart();
                        var tenantsPromiseForAffiliates;
                        if(!$scope.metaData.tenants){
                            tenantsPromiseForAffiliates = $scope.loadTenants();
                        }

                        $q.when(tenantsPromiseForAffiliates).then(
                            function(result){
                                //only set tenants when there is a result back
                                if(result){
                                    $scope.metaData.tenants = result.data.tenants;
                                    $scope.data.selectedTenant = result.data.tenants[0];
                                }

                                return  $scope.loadAffiliates({tenant: $scope.data.selectedTenant});
                            }
                        ).then(
                            function(result){
                                $scope.metaData.affiliates = result.data.affiliates;
                                $scope.data.selectedAffiliate = result.data.affiliates[0];
                            }
                        ).catch(
                            function(err){
                                $log.log("adminPermissions controller: refreshAffiliates loadTenants or loadAffiliates promise caught an error!");
                                $log.log(err);

                                $scope.onError(err);
                            }
                        ).finally(
                            function(){
                                $scope.loadingEnd();
                            }
                        );
                    },
                    permParser = function(perm){
                        var parsed = {},
                            _parser = function(input, type){
                                var ret = {},
                                    retType;
                                if(!type){
                                    retType = ret;
                                }else{
                                    retType = ret[type];
                                }

                                if(!input[type]){
                                    if(retType != ret){
                                        retType = [];
                                    }
                                }else{
                                    if(input[type] === "*"){
                                        if(!ret.all) ret.all = {};
                                        ret.all[type] = true;
                                    }
                                    if(angular.isArray(input[type])){
                                        angular.forEach(input[type], function(item){

                                        });
                                        ret[type] = input[type];
                                    }
                                }
                                return ret;
                            };

                        parsed = _parser(perm);
                    };

                $scope.metaData = {};
                $scope.data = {};

                if(!perms.actions){
                    permModel.actions = [];
                }else{
                    if(perms.actions === "*"){
                        permModel.allActions = true;
                    }
                }

                if(!perms.tenants){
                    permModel.tenants = [];
                }else{
                    if(perms.tenants === "*"){
                        permModel.allTenents = true;
                    }else{
                        if(angular.isArray(perms.tenants)){
                            permModel.tenants = [];
                            angular.forEach(perms.tenants, function(tenant){
                                if(!tenant.actions){

                                }
                            });
                        }
                    }
                }


                //Handlers
                unSubQueue.push($scope.$watch("permissionLevel", function(){
                    $log.log("adminPermissions controller: $watch permissionLevel changed!");
                    $log.log($scope.permissionLevel);
                    if($scope.permissionLevel.level === "tenant" && !$scope.metaData.tenants){
                        $scope.loadingStart();
                        $scope.loadTenants().then(
                            function(result){
                                $scope.metaData.tenants = result.data.tenants;
                                $scope.data.selectedTenant = result.data.tenants[0];
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
                        refreshAffiliates();
                    }else{
                        //When any other level, clear $scope.selectedAffilaite
                        $scope.selectedAffiliate = null;
                        $scope.metaData.affiliates = null;
                    }
                }));
                $scope.$on(influenceAdminAppConstants.EVENTS.DESTROY, function(){
                    $log.log('influenceAdminAppConstants event DESTROY, listened in adminPermissions directive controller');
                    angular.forEach(unSubQueue, function(unSubFunc){
                        unSubFunc();
                    });
                });

                $scope.onChangeTenant = function(){
                    $log.log("permission directive onChangeTenant");
                    refreshAffiliates();
                }

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
                    loadingStart: "&asynLoadBegin",
                    loadingEnd: "&asynLoadEnd",
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
