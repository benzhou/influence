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
                    perms = $scope.permissions || {
                        actions: ["CONFIG_TENANTS"], //App level
                        tenants : [
                            {
                                tenantId : "53b374ba0d45fa990c8dc866",
                                actions: ["READ_ACTIONS"], //Tenant_ID_1 level
                                affiliates : [
                                    {
                                        affiliateId: "53bc0794a28c2dfe1fb7d03a",
                                        actions: ["READ_ACTIONS", "EDIT_ACTIONS"] //Affiliate_ID_1_IN_TEANANT_ID_1 level
                                    },
                                    {
                                        affiliateId: "53bc07a3a28c2dfe1fb7d040",
                                        actions: ["READ_ACTIONS"] //Affiliate_ID_2_IN_TEANANT_ID_1 level
                                    },
                                    {
                                        affiliateId: "53bc0a49a28c2dfe1fb7d06a",
                                        actions: ["EDIT_ACTIONS"] //Affiliate_ID_3_IN_TEANANT_ID_1 level
                                    }
                                ]
                            },
                            {
                                tenantId : "53bc07aba28c2dfe1fb7d043",
                                actions: ["READ_ACTIONS", "EDIT_ACTIONS", "CONFIG_TENANTS"], //Tenant_ID_1 level
                                affiliates : [
                                    {
                                        affiliateId: "53bc0f5ca28c2dfe1fb7d079",
                                        actions: ["READ_ACTIONS", "EDIT_ACTIONS","ACTION_ID_3"] //Affiliate_ID_1_IN_TEANANT_ID_2 level
                                    },
                                    {
                                        affiliateId: "53bc0f7aa28c2dfe1fb7d07f",
                                        actions: ["READ_ACTIONS", "ACTION_ID_2","ACTION_ID_3"] //Affiliate_ID_2_IN_TEANANT_ID_2 level
                                    }
                                ]
                            }
                        ]
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
                    permParser = function(permDataModel){
                        var
                            _parser = function(input){
                                var ret = {};

                                for(var prop in input){
                                    if(input.hasOwnProperty(prop) && ["actions","roles", "tenantId", "affiliateId" ,"tenants","affiliates"].indexOf(prop) >= 0){
                                        var isStringArrayProp = ["actions", "roles"].indexOf(prop) >=0,
                                            isIdProp = ["tenantId", "affiliateId"].indexOf(prop) >= 0,
                                            isLevelProp = ["tenants","affiliates"].indexOf(prop) >= 0;

                                        if(input[prop] === "*"){
                                            if(!ret.all) ret.all = {};
                                            ret.all[prop] = true;
                                        }else{
                                            ret[prop] = {};
                                            if(angular.isArray(input[prop])){
                                                //"actions", "roles"
                                                angular.forEach(input[prop], function(item){
                                                    if(isStringArrayProp){
                                                        //so our ret.actions will contain these keys for actions. e.g.
                                                        //permissions.actions.READ_RIGHTS
                                                        ret[prop][item] = true;
                                                    }else{
                                                        //"tenants", "affiliates"
                                                        if(isLevelProp){
                                                            //Not the best way of doing this
                                                            if(item.tenantId || item.affiliateId){
                                                                ret[prop]["ID_" + (item.tenantId || item.affiliateId)] =_parser(item);
                                                            }
                                                        }
                                                    }
                                                });
                                            }else{
                                                //"tenantId", "affiliateId"
                                                if(isIdProp){
                                                    ret[prop] = input[prop];
                                                }
                                            }
                                        }
                                    }
                                }

                                return ret;
                            };

                        return _parser(permDataModel);
                    },
                    viewModelToPerm = function(vm){
                        /*{
                            all : {
                                actions : true,
                                roles   : true,
                                tenants : true
                            },
                            actions : {
                                READ_ACTIONS : true,
                                EDIT_ACTIONS : true
                            },
                            tenants : {
                                ID_123456789 : {
                                    actions : {
                                        "READ_ACTIONS" : true
                                    },
                                    affiliates : {
                                        ID_987654321 : {
                                            actions : {
                                                "EDIT_ACTIONS" : true
                                            }
                                        },
                                        ID_567899999 : {
                                            all : {
                                                actions : true
                                            }
                                        }
                                    }
                                }
                            }
                        }*/
                    },
                    permViewModel = permParser(perms);

                $log.info("permVieModel:");
                $log.debug(permViewModel);

                $scope.metaData = {};
                $scope.data = {};


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
                    //if(permViewModel.all.actions) return true;
                    if(!permViewModel.actions) return false;

                    return permViewModel.actions[action.key];
                };
                $scope.isTenantActionsContains = function(tenant, action){
                    if(!permViewModel.actions) return false;
                    //if(permViewModel.all.actions || permViewModel.tenants.all.actions || permViewModel.tenants["ID_" + tenant.tenantId].all.actions) return true;
                    var permViewModelTenant = permViewModel.tenants['ID_'+tenant._id];
                    return  permViewModelTenant && permViewModelTenant.actions[action.key];
                };
                $scope.isAffiliateActionsContains = function(tenant, affiliate, action){
                    if(!permViewModel.actions) return false;
                    //if(permViewModel.actions === "*" || permViewModel.tenants.all.actions || permViewModel.tenants["ID_" + tenant.tenantId].all.actions) return true;

                    var permViewModelTenant = permViewModel.tenants['ID_'+tenant._id],
                        permViewModelTenantAffiliate = permViewModelTenant && permViewModelTenant["ID_" + affiliate.id];
                    return  permViewModelTenant && permViewModelTenantAffiliate && permViewModelTenantAffiliate.actions[action.key];
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
