(function(){
    "use strict";

    angular.module('influenceAdminApp.adminPermissions', [
        'ui.bootstrap',
        'influenceAdminApp.bootstrap.ui.extend',
        'influenceAdminApp.constants'
    ])
        .directive('adminPermissions', function($log){
            var controller = function($scope, $rootScope, $log, $q, $filter, influenceAdminAppConstants){
                $log.log("adminPermissions controller: ");

                var
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
                    permViewModel = permParser($scope.permissions),
                    removeAction = function(obj, action, compareFuc){
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
                        if($scope.permissions.tenants && angular.isArray($scope.permissions.tenants)){
                            var indexOfTargetTenant = -1;
                            for(var i= 0,l=$scope.permissions.tenants.length; i<l;i++){
                                if($scope.permissions.tenants[i].tenantId === tenant.tenantId){
                                    indexOfTargetTenant = i;
                                    break;
                                }
                            }
                            if(indexOfTargetTenant > -1 && removeOrAddFuc($scope.permissions.tenants[indexOfTargetTenant], action)){
                                permViewModel = permParser($scope.permissions);
                            }
                        }
                    },
                    removeOrAddTenantAffiliateAction = function(tenant, affiliate, action, removeOrAddFuc){
                        if($scope.permissions.tenants && angular.isArray($scope.permissions.tenants)){
                            var indexOfTargetTenant = -1,
                                indexOfTargetAffiliate = -1;
                            for(var i= 0,l=$scope.permissions.tenants.length; i<l;i++){
                                if($scope.permissions.tenants[i].tenantId === tenant.tenantId){
                                    indexOfTargetTenant = i;
                                    if($scope.permissions.tenants[i].affiliates && angular.isArray($scope.permissions.tenants[i].affiliates)){
                                        for(var k= 0,n=$scope.permissions.tenants[i].affiliates.length;k<n;k++){
                                            if($scope.permissions.tenants[i].affiliates[k].affiliateId === affiliate.affiliateId){
                                                indexOfTargetAffiliate = k;
                                                break;
                                            }
                                        }
                                    }

                                    break;
                                }
                            }
                            if(indexOfTargetAffiliate > -1 && removeOrAddFuc($scope.permissions.tenants[indexOfTargetTenant].affiliates[indexOfTargetAffiliate], action)){
                                permViewModel = permParser($scope.permissions);
                            }
                        }
                    },
                    indexOfArray = function(array, obj, compareFuc){
                        if(!array || !obj || !angular.isArray(array)) return -1;
                        if(angular.isString(obj)){
                            return [].prototype.indexOf.apply(array, obj);
                        }
                        if(angular.isObject(obj)){
                            var ret = -1;
                            for(var i= 0,l=array.length;i<l;i++){
                                if(compareFuc && angular.isFunction(compareFuc)){
                                    if(compareFuc(array[i], obj)){
                                        ret = i;
                                    }
                                }else{
                                    if(angular.equals(array[i], obj)){
                                        ret = i;
                                    }
                                }
                            }

                            return ret;
                        }
                        return -1;
                    };



                $scope.metaData = {};

                $scope.loadingStart();
                $scope.loadTenants().then(
                    function(result){
                        $scope.metaData.tenants = result.data.tenants;
                    }
                ).catch(
                    function(err){
                        $log.log("permission directive loadTenants promise caught an error!");
                        $log.log(err);

                        $scope.onError(err);
                    }
                ).finally(
                    function(){
                        $scope.loadingEnd();
                    }
                );


                //Handlers
                $scope.removeActionFromApp = function(actionKey){
                    if(removeAction($scope.permissions, actionKey)){
                        permViewModel = permParser($scope.permissions);
                    }
                };
                $scope.removeActionFromTenant = function(tenant, actionKey){
                    removeOrAddTenantAction(tenant, actionKey, removeAction);
                };
                $scope.removeActionFromTenantAffiliate = function(tenant, affiliate, actionKey){
                    removeOrAddTenantAffiliateAction(tenant, affiliate, actionKey, removeAction);
                };

                $scope.addActionToApp = function(action){
                    if(addAction($scope.permissions, action.key)){
                        permViewModel = permParser($scope.permissions);
                    }
                };
                $scope.addActionToTenant = function(tenant, action){
                    removeOrAddTenantAction(tenant, action.key, addAction);
                };
                $scope.addActionToTenantAffiliate = function(tenant, affiliate, action){
                    removeOrAddTenantAffiliateAction(tenant, affiliate, action.key, addAction);
                };

                $scope.addTenant = function(tenant){
                    $scope.permissions = $scope.permissions || {};
                    $scope.permissions.tenants = $scope.permissions.tenants || [];

                    //In case it was an object
                    if(!angular.isArray($scope.permissions.tenants)){
                        $scope.permissions.tenants = [];
                    }

                    if(indexOfArray($scope.permissions.tenants, tenant, function(o1,o2){ return o1.tenantId === o2._id;}) === -1){
                        $scope.permissions.tenants.push({
                            tenantId : tenant._id
                        });
                        permViewModel = permParser($scope.permissions);
                    }
                };
                $scope.removeTenant = function(tenant){
                    if($scope.permissions && $scope.permissions.tenants && angular.isArray($scope.permissions.tenants)){
                        var index = indexOfArray($scope.permissions.tenants, tenant, function(o1, o2){ return o1.tenantId === tenant.tenantId;});
                        if(index > -1){
                            $scope.permissions.tenants.splice(index, 1);
                            permViewModel = permParser($scope.permissions);
                        }
                    }
                };

                $scope.loadTenantAffiliates = function(tenant){

                    $scope.metaData.tenantAffiliate = $scope.metaData.tenantAffiliate || {};

                    if($scope.metaData.tenantAffiliate["ID_" + tenant.tenantId]){
                        return $scope.metaData.tenantAffiliate["ID_" + tenant.tenantId];
                    }

                    var df = $q.defer();

                    $scope.loadingStart();
                    $scope.loadAffiliates({tenant: {_id:tenant.tenantId}}).then(
                        function(result){
                            $scope.metaData.tenantAffiliate["ID_" + tenant.tenantId] = result.data.affiliates || [];

                            df.resolve($scope.metaData.tenantAffiliate["ID_" + tenant.tenantId]);
                        }
                    ).catch(
                        function(err){
                            $log.log("loadAffiliates promise caught an error!");
                            $log.log(err);

                            df.resolve([]);
                            $scope.onError(err);
                        }
                    ).finally(
                        function(){
                            $scope.loadingEnd();
                        }
                    );

                    return df.promise;
                }
                $scope.addTenantAffiliate = function(tenant, affiliate){
                    var index = indexOfArray($scope.permissions.tenants, tenant, function(o1,o2){ return o1.tenantId === o2.tenantId;});

                    if($scope.permissions.tenants && $scope.permissions.tenants[index]){
                        $scope.permissions.tenants[index].affiliates = $scope.permissions.tenants[index].affiliates || [];

                        //In case it was an object
                        if(!angular.isArray( $scope.permissions.tenants[index].affiliates)){
                            $scope.permissions.tenants[index].affiliates = [];
                        }

                        if(indexOfArray($scope.permissions.tenants[index].affiliates, affiliate, function(o1,o2){ return o1.affiliateId === o2.id;}) === -1){
                            $scope.permissions.tenants[index].affiliates.push({
                                affiliateId : affiliate.id
                            });
                            permViewModel = permParser($scope.permissions);
                        }
                    }
                };
                $scope.removeTenantAffiliate = function(tenant, affiliate){
                    var index = indexOfArray($scope.permissions.tenants, tenant, function(o1,o2){ return o1.tenantId === o2.tenantId;});

                    if($scope.permissions.tenants && $scope.permissions.tenants[index] && $scope.permissions.tenants[index].affiliates && angular.isArray($scope.permissions.tenants[index].affiliates)){
                        var indexAffiliate = indexOfArray($scope.permissions.tenants[index].affiliates, affiliate, function(o1, o2){ return o1.affiliateId === o2.affiliateId;});
                        if(indexAffiliate > -1){
                            $scope.permissions.tenants[index].affiliates.splice(indexAffiliate, 1);
                            permViewModel = permParser($scope.permissions);
                        }
                    }
                };
            };

            return {
                scope : {
                    actions : "=",
                    permissions : "=",
                    loadingStart: "&asynLoadBegin",
                    loadingEnd: "&asynLoadEnd",
                    onError:"&",
                    loadTenants : "&",
                    loadAffiliates : "&",
                    savePerms : "&savePermissions"
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
