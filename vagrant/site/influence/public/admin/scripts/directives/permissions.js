(function(){
    "use strict";

    angular.module('influenceAdminApp.adminPermissions', [
        'ui.bootstrap',
        'influenceAdminApp.constants'
    ])
        .directive('adminPermissions', function($log){
            var controller = function($scope, $rootScope, $log, $q, $filter, influenceAdminAppConstants){
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
                                        actions: ["READ_ACTIONS", "EDIT_ACTIONS"]
                                    },
                                    {
                                        affiliateId: "53bc07a3a28c2dfe1fb7d040",
                                        actions: ["READ_ACTIONS"]
                                    },
                                    {
                                        affiliateId: "53bc0a49a28c2dfe1fb7d06a",
                                        actions: ["EDIT_ACTIONS"]
                                    }
                                ]
                            },
                            {
                                tenantId : "53bc07aba28c2dfe1fb7d043",
                                actions: ["READ_ACTIONS", "EDIT_ACTIONS", "CONFIG_TENANTS"],
                                affiliates : [
                                    {
                                        affiliateId: "53bc0f5ca28c2dfe1fb7d079",
                                        actions: ["READ_ACTIONS", "EDIT_ACTIONS","ACTION_ID_3"]
                                    },
                                    {
                                        affiliateId: "53bc0f7aa28c2dfe1fb7d07f",
                                        actions: ["READ_ACTIONS", "ACTION_ID_2","ACTION_ID_3"]
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
                $scope.data = {
                    permViewModel : permViewModel,
                    perms          : perms
                };


                //Handlers
                /*unSubQueue.push($scope.$watch("permissionLevel", function(){
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
*/
                $scope.onChangeTenant = function(){
                    $log.log("permission directive onChangeTenant");
                    refreshAffiliates();
                }

                var removeAction = function(obj, action){
                    if(!obj || !obj.actions || !angular.isArray(obj.actions) || obj.actions.length === 0){
                        return false;
                    }
                    var index = obj.actions.indexOf(action);
                    if(index === -1) return false;

                    obj.actions.splice(index, 1);
                    return true;


                },
                    addAction = function(obj, action){
                        obj = obj || {};
                        obj.actions = obj.actions || [];

                        if(!angular.isArray(obj.actions) || obj.actions.indexOf(action) > -1){
                            return false;
                        }

                        obj.actions.push(action);
                        return true;
                    },
                    removeOrAddTenantAction = function(tenant, action, removeOrAddFuc){
                        if(perms.tenants && angular.isArray(perms.tenants)){
                            var indexOfTargetTenant = -1;
                            for(var i= 0,l=perms.tenants.length; i<l;i++){
                                if(perms.tenants[i].tenantId === tenant.tenantId){
                                    indexOfTargetTenant = i;
                                    break;
                                }
                            }
                            if(indexOfTargetTenant > -1 && removeOrAddFuc(perms.tenants[indexOfTargetTenant], action)){
                                permViewModel = permParser(perms);
                            }
                        }
                    },
                    removeOrAddTenantAffiliateAction = function(tenant, affiliate, action, removeOrAddFuc){
                        if(perms.tenants && angular.isArray(perms.tenants)){
                            var indexOfTargetTenant = -1,
                                indexOfTargetAffiliate = -1;
                            for(var i= 0,l=perms.tenants.length; i<l;i++){
                                if(perms.tenants[i].tenantId === tenant.tenantId){
                                    indexOfTargetTenant = i;
                                    if(perms.tenants[i].affiliates && angular.isArray(perms.tenants[i].affiliates)){
                                        for(var k= 0,n=perms.tenants[i].affiliates.length;k<n;k++){
                                            if(perms.tenants[i].affiliates[k].affiliateId = affiliate.affiliateId){
                                                indexOfTargetAffiliate = k;
                                                break;
                                            }
                                        }
                                    }

                                    break;
                                }
                            }
                            if(indexOfTargetAffiliate > -1 && removeOrAddFuc(perms.tenants[indexOfTargetTenant].affiliates[indexOfTargetAffiliate], action)){
                                permViewModel = permParser(perms);
                            }
                        }
                    };
                $scope.removeActionFromApp = function(actionKey){
                    if(removeAction(perms, actionKey)){
                        permViewModel = permParser(perms);
                    }
                };
                $scope.removeActionFromTenant = function(tenant, actionKey){
                    removeOrAddTenantAction(tenant, actionKey, removeAction);
                };
                $scope.removeActionFromTenantAffiliate = function(tenant, affiliate, actionKey){
                    removeOrAddTenantAffiliateAction(tenant, affiliate, actionKey, removeAction);
                };

                $scope.addActionToApp = function(action){
                    if(addAction(perms, action.key)){
                        permViewModel = permParser(perms);
                    }
                };
                $scope.addActionToTenant = function(tenant, action){
                    removeOrAddTenantAction(tenant, action.key, addAction);
                };
                $scope.addActionToTenantAffiliate = function(tenant, affiliate, action){
                    removeOrAddTenantAffiliateAction(tenant, affiliate, action.key, addAction);
                };

                /*$scope.isAppActionsContains = function(action){
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
                };*/
            };

            return {
                scope : {
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
