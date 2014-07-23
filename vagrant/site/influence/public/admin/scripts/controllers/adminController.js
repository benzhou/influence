(function () {
    "use strict";

    angular.module('influenceAdminApp.controllers', [
        'ui.bootstrap',
        'influenceAdminApp.constants',
        'influenceAdminApp.config',
        'influenceAdminApp.session',
        'influenceAdminApp.apiServices',
        'influenceAdminApp.dirtyChecker'
    ])
        .controller('influenceAdminAppCtrl', function($scope, $rootScope, $log, influenceAdminAppConstants){
            $log.log("!!!!!!!!influenceAdminAppCtrl called!");




        })
        .controller('influenceAdminIndexCtrl', function ($scope, $rootScope, $location, $log, influenceAdminAppConstants, influenceAdminAppSession) {
            $log.log("influenceAdminIndexCtrl called!");

            $scope.login = function(){
                $location.path('/login');
            };


            //If user already authenticated, then go to welcome view directly
            if(influenceAdminAppSession.isAuthenticated()){
                $location.path('/welcome');
                return;
            }

        })
        .controller('influenceAdminLoginCtrl', function (
            $scope, $rootScope, $location, $log,
            influenceAdminAppConstants, influenceAdminAppConfig,
            authService, adminService,
            influenceAdminAppSession) {

            $log.log("influenceAdminLoginCtrl called!");

            //If user already authenticated, then go to welcome view directly
            if(influenceAdminAppSession.isAuthenticated()){
                $location.path('/welcome');
                return;
            }

            $scope.credential = {
                tenantId : influenceAdminAppConfig.API.TENANT_ID
            };
            $scope.adminLogin = function(username, password, rememberMe){
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);

                authService.adminLogin({
                    tenantId:$scope.credential.tenantId,
                    username:$scope.credential.username,
                    password:$scope.credential.password
                }).$promise.then(
                    function(result) {
                        $log.log('influenceAdminLoginCtrl adminLogin fulfilled!');
                        $log.log(result.data.token);
                        influenceAdminAppSession.create(result.data.token);

                        $location.path('/welcome');

                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.ADMIN_AUTHENTICATED);
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminLoginCtrl adminLogin rejected!');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );
            };

        })
        .controller('influenceAdminHomeCtrl', function(
            $scope, $rootScope, $location, $log,
            influenceAdminAppConstants, influenceAdminAppSession){
            $log.log("influenceAdminHomeCtrl called!");

            //If user not authenticated, then go to home/index view directly
            if(!influenceAdminAppSession.isAuthenticated()){
                $location.path('/');
                return;
            }
        })
        .controller('influenceAdminLogoutCtrl', function(
            $scope, $rootScope, $location, $log,
            influenceAdminAppConstants, influenceAdminAppSession,
            authService){
            $log.log("influenceAdminLogoutCtrl called!");
            $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);

            authService.adminLogout({token: influenceAdminAppSession.token.token}).$promise.then(
                function(result){
                    $log.log(result);
                    influenceAdminAppSession.destroy();
                    $location.path('/');
                }
            ).catch(
                function(err){
                    $log.log('influenceAdminLogoutCtrl adminLogin rejected!');
                    $log.log(err);

                    if(err.data.code === 400004004){
                        influenceAdminAppSession.destroy();
                        $location.path('/');
                    }else{
                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                }
            ).finally(
                function(){
                    $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                }
            );

        })
        .controller('influenceAdminAccountsCtrl', function(
            $scope, $rootScope, $location, $log, $q,
            influenceAdminAppConstants, influenceAdminAppSession,
            adminService, tenantsService){
            $log.log("influenceAdminAccountsCtrl called!");

            //If user not authenticated, then go to home/index view directly
            if(!influenceAdminAppSession.isAuthenticated()){
                $location.path('/');
                return;
            }

            var
                loadTenants = function(){
                    var df = $q.defer();

                    tenantsService.queryConfigurable({configOptions:"admin",numberOfPage:1000,pageNumber:1,token: influenceAdminAppSession.token.token}).$promise.then(
                        function(docs){
                            $log.log('influenceAdminAccountsCtrl loadTenants fulfilled');

                            $scope.tenants = docs.data.tenants;

                            df.resolve(docs);
                        }
                    ).catch(
                        function(err){
                            $log.log('influenceAdminAccountsCtrl loadTenants rejected');
                            $log.log(err);
                            df.reject(err);
                        }
                    );

                    return df.promise;
                },
                loadAdmins = function(tenantId, numberOfPage, pageNumber){
                    var df = $q.defer();

                    adminService.queryConfigurable({tenantId: tenantId, numberOfPage:numberOfPage,pageNumber:pageNumber,token: influenceAdminAppSession.token.token}).$promise.then(
                        function(docs){
                            $log.log('influenceAdminAccountsCtrl query fullfilled.');
                            $scope.admins = docs.data.admins;

                            df.resolve(docs);
                        }
                    ).catch(
                        function(err){
                            $log.log('influenceAdminAccountsCtrl query rejected!');
                            $log.log(err);

                            df.reject(err);
                        }
                    ).finally(
                        function(){
                            //$rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                        }
                    );

                    return df.promise;
                },
                refresh = function(){
                    $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                    loadAdmins($scope.selectedTenant.id, $scope.numberOfPage, $scope.pageNumber)
                        .finally(function(){
                            $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                        });
                };

            $scope.numberOfPage = 10;
            $scope.pageNumber = 1;

            $scope.nextPage = function(){
                refresh();
            };

            $scope.editAdmin = function(admin){
                $log.log("Editing admin:");
                $log.log(admin);

                $location.path(['/home/config/admin/', admin.id].join(''));
            };

            $scope.editAdminPermission = function(admin){
                $log.log("Editing admin permission:");
                $log.log(admin);

                $location.path(['/home/config/permissions/', admin.id].join(''));
            };

            $scope.createAdmin = function(){
                $log.log("Creating admin:");
                $location.path('/home/config/admin')
            };

            $scope.onChangeTenant = function(){
                $log.log("changed tenant:");
                refresh();
            }

            //initial load
            $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
            loadTenants().then(
                function(result){
                    $log.log('influenceAdminAccountsCtrl initial Load fulfiled!');

                    if(result.data.tenants.length === 0){
                        return;
                    }

                    $scope.selectedTenant = result.data.tenants[0];

                    return loadAdmins($scope.selectedTenant.id, $scope.numberOfPage, $scope.pageNumber);
                }
            ).catch(
                function(err){
                    $log.log('influenceAdminAccountsCtrl initial Load rejected!');
                    $log.log(err);

                    $location.path('/error').search({code:err.data.code, msg:err.data.message});
                }
            ).finally(function(){
                    $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                }
            );

        })
        .controller('influenceAdminAccountCtrl', function(
            $scope, $rootScope, $location, $log, $routeParams,
            influenceAdminAppConstants, influenceAdminAppSession,
            adminService, tenantsService){
            $log.log("influenceAdminAccountCtrl called!");

            //If user not authenticated, then go to home/index view directly
            if(!influenceAdminAppSession.isAuthenticated()){
                $location.path('/');
                return;
            }

            var adminId = $routeParams.adminId;

            //Code for when load the admin view
            if(!adminId){
                //When no passed-in adminId, assume this is an create
                $scope.admin = {};

                tenantsService.queryConfigurable({configOptions:"admin",numberOfPage:1000,pageNumber:1,token: influenceAdminAppSession.token.token}).$promise.then(
                    function(docs){
                        $log.log('influenceAdminAccountCtrl tenantsService.query fulfilled');
                        $log.log(docs);

                        $scope.tenants = docs.data.tenants;
                        $scope.admin.tenantId = $scope.tenants[0].id;
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminAccountCtrl tenantsService.query rejected');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                );

            }else{
                //When has passed in adminId, assume this is an update
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                adminService.get({adminId:adminId, token: influenceAdminAppSession.token.token}).$promise.then(
                    function(result){
                        $log.log('influenceAdminAccountCtrl get fulfilled!');
                        $log.log(result.data.admin);

                        $scope.admin = result.data.admin;
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminAccountCtrl get rejected!');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );
            }

            //Handler when user update or create admin
            $scope.createUpdateAdmin = function(){
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                $log.log('influenceAdminAccountCtrl createUpdateAdmin.');

                var params = {
                        token: influenceAdminAppSession.token.token
                    },
                    postData = {
                        email       : $scope.admin.email,
                        username    : $scope.admin.username,
                        firstName   : $scope.admin.firstName,
                        lastName    : $scope.admin.lastName,
                        displayName : $scope.admin.displayName
                    };

                if($scope.admin && $scope.admin.id){
                    params.adminId = $scope.admin.id;
                }else{
                    postData.tenantId = $scope.admin.tenantId;
                    postData.password = $scope.admin.password;
                }

                adminService.save(
                    //params
                    params,
                    //Post data
                    postData
                ).$promise.then(
                    function(result){
                        $log.log('influenceAdminAccountCtrl post fulfilled!');
                        $log.log(result.data.admin);
                        $scope.admin = result.data.admin;
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminAccountCtrl post rejected!');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );
            }
        })
        .controller('influenceAdminTenantCtrl', function(
            $scope, $rootScope, $location, $log, $routeParams,
            influenceAdminAppConstants, influenceAdminAppSession,
            tenantsService){
            $log.log("influenceAdminTenantCtrl called!");

            //If user not authenticated, then go to home/index view directly
            if(!influenceAdminAppSession.isAuthenticated()){
                $location.path('/');
                return;
            }

            var tenantid = $routeParams.tenantId;
            $log.log('influenceAdminTenantCtrl $routeParams');
            $log.log($routeParams);

            //Code for when load the tenant view
            if(!tenantid){
                //When no passed-in tenantId, assume this is an create
                $scope.tenant = {

                };


            }else{
                //When has passed in tenantId, assume this is an update
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                tenantsService.get({tenantId:tenantid,token: influenceAdminAppSession.token.token}).$promise.then(
                    function(result){
                        $log.log('influenceAdminTenantCtrl get fulfilled!');
                        $log.log(result.data.tenant);
                        $scope.tenant = result.data.tenant;
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminTenantCtrl get rejected!');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );
            }

            //Handler when user update or create tenant
            $scope.createUpdateTenant = function(){
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                $log.log('influenceAdminTenantCtrl createUpdateTenant.');

                var params = {
                        token: influenceAdminAppSession.token.token
                    },
                    postData = {
                        name : $scope.tenant.name
                    };

                if($scope.tenant && $scope.tenant.id){
                    params.tenantId = $scope.tenant.id;
                    postData.isActive = $scope.tenant.isActive;
                }

                tenantsService.save(
                    //params
                    params,
                    //Post data
                    postData
                ).$promise.then(
                    function(result){
                        $log.log('influenceAdminTenantCtrl post fulfilled!');
                        $log.log(result.data.tenant);
                        $scope.tenant = result.data.tenant;
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminTenantCtrl post rejected!');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );
            }
        })
        .controller('influenceAdminTenantsCtrl', function(
            $scope, $rootScope, $location, $log,
            influenceAdminAppConstants, influenceAdminAppSession,
            tenantsService){
            $log.log("influenceAdminTenantsCtrl called!");

            //If user not authenticated, then go to home/index view directly
            if(!influenceAdminAppSession.isAuthenticated()){
                $location.path('/');
                return;
            }

            var loadTenants = function(numberOfPage, pageNumber){
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                tenantsService.queryConfigurable({configOptions:"tenant", ao:0,numberOfPage:numberOfPage,pageNumber:pageNumber,token: influenceAdminAppSession.token.token}).$promise.then(
                    function(docs){
                        $log.log('influenceAdminTenantsCtrl');
                        $scope.tenants = docs.data.tenants;
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminTenantsCtrl query rejected!');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );
            };

            $scope.numberOfPage = 10;
            $scope.pageNumber = 1;

            $scope.nextPage = function(){
                loadTenants($scope.numberOfPage, $scope.pageNumber);
            };

            $scope.editTenant = function(tenant){
                $log.log("Editing tenant:");
                $log.log(tenant);

                $location.path(['/home/config/tenant/', tenant.id].join(''));
            };

            $scope.createTenant = function(){
                $log.log("Creating tenant:");
                $location.path('/home/config/tenant')
            };

            //initial load
            loadTenants($scope.numberOfPage, $scope.pageNumber);

        })
        .controller('influenceAdminActionCtrl', function(
            $scope, $rootScope, $location, $log, $routeParams,
            influenceAdminAppConstants, influenceAdminAppSession,
            actionsService){
            $log.log("influenceAdminActionCtrl called!");

            //If user not authenticated, then go to home/index view directly
            if(!influenceAdminAppSession.isAuthenticated()){
                $location.path('/');
                return;
            }

            var actionId = $routeParams.actionId;
            $log.log('influenceAdminActionCtrl $routeParams');
            $log.log($routeParams);

            //Code for when load the action view
            if(!actionId){
                //When no passed-in actionId, assume this is an create
                $scope.action = {};


            }else{
                //When has passed in tenantId, assume this is an update
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                actionsService.get({actionId:actionId,token: influenceAdminAppSession.token.token}).$promise.then(
                    function(result){
                        $log.log('influenceAdminActionCtrl get fulfilled!');
                        $log.log(result.data.action);
                        $scope.action = result.data.action;
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminActionCtrl get rejected!');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );
            }

            //Handler when user update or create action
            $scope.createUpdateAction = function(){
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                $log.log('influenceAdminActionCtrl createUpdateAction.');

                var params = {
                        token: influenceAdminAppSession.token.token
                    },
                    postData = {
                        name : $scope.action.name,
                        key : $scope.action.key
                    };

                if($scope.action && $scope.action.id){
                    params.actionId = $scope.action.id;
                }

                actionsService.save(
                    //params
                    params,
                    //Post data
                    postData
                ).$promise.then(
                    function(result){
                        $log.log('influenceAdminActionCtrl post fulfilled!');
                        $log.log(result.data.action);
                        $scope.action = result.data.action;
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminActionCtrl post rejected!');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );
            }
        })
        .controller('influenceAdminActionsCtrl', function(
            $scope, $rootScope, $location, $log,
            influenceAdminAppConstants, influenceAdminAppSession,
            actionsService){
            $log.log("influenceAdminActionsCtrl called!");

            //If user not authenticated, then go to home/index view directly
            if(!influenceAdminAppSession.isAuthenticated()){
                $location.path('/');
                return;
            }

            var loadActions = function(numberOfPage, pageNumber){
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                actionsService.query({numberOfPage:numberOfPage,pageNumber:pageNumber,token: influenceAdminAppSession.token.token}).$promise.then(
                    function(docs){
                        $log.log('influenceAdminActionsCtrl');
                        $scope.actions = docs.data.actions;
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminActionsCtrl query rejected!');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );
            };

            $scope.numberOfPage = 10;
            $scope.pageNumber = 1;

            $scope.nextPage = function(){
                loadActions($scope.numberOfPage, $scope.pageNumber);
            };

            $scope.editAction = function(action){
                $log.log("Editing action:");
                $log.log(action);

                $location.path(['/home/config/action/', action.id].join(''));
            };

            $scope.createAction = function(){
                $log.log("Creating action:");
                $location.path('/home/config/action')
            };

            //initial load
            loadActions($scope.numberOfPage, $scope.pageNumber);

        })

        //Affiliates
        .controller('influenceAdminAffiliatesCtrl', function(
            $scope, $rootScope, $location, $log, $q,
            influenceAdminAppConstants, influenceAdminAppSession,
            tenantsService, affiliatesService){
            $log.log("influenceAdminAffiliatesCtrl called!");

            //If user not authenticated, then go to home/index view directly
            if(!influenceAdminAppSession.isAuthenticated()){
                $location.path('/');
                return;
            }

            var
                loadTenants = function(){
                    var df = $q.defer();

                    tenantsService.queryConfigurable({configOptions: "affiliate",numberOfPage:1000,pageNumber:1,token: influenceAdminAppSession.token.token}).$promise.then(
                        function(docs){
                            $log.log('influenceAdminAffiliatesCtrl loadTenants fulfilled');

                            $scope.tenants = docs.data.tenants;

                            df.resolve(docs);
                        }
                    ).catch(
                        function(err){
                            $log.log('influenceAdminAffiliatesCtrl loadTenants rejected');
                            $log.log(err);
                            df.reject(err);
                        }
                    );

                    return df.promise;
                },

                loadAffiliates = function(tenantId, numberOfPage, pageNumber, sortFieldName, sortFieldAscOrDesc){
                    var df = $q.defer();

                    affiliatesService.queryConfigurable(
                        {
                            numberOfPage:numberOfPage,
                            pageNumber:pageNumber,
                            tenantId : tenantId,
                            sfn    : sortFieldName,
                            sad    : sortFieldAscOrDesc,
                            token: influenceAdminAppSession.token.token
                        }
                    ).$promise.then(function(result){
                            $log.log('influenceAdminAffiliatesCtrl loadAffiliates fulfilled!');
                            $log.log(result);

                            $scope.affiliates = result.data.affiliates;
                            df.resolve(result);
                        }
                    ).catch(
                        function(err){
                            $log.log('influenceAdminAffiliatesCtrl loadAffiliates rejected!');
                            $log.log(err);

                            df.reject(err);
                        }
                    ).finally();

                    return df.promise;
                },
                refresh = function(){
                    $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                    loadAffiliates($scope.selectedTenant.id, $scope.numberOfPage, $scope.pageNumber, $scope.sortFieldName, $scope.sortFieldAscOrDesc)
                        .finally(function(){
                            $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                        });
                };

            $scope.numberOfPage = 10;
            $scope.pageNumber = 1;
            $scope.sortFieldName = "name";
            $scope.sortFieldAscOrDesc = 1;

            $scope.nextPage = function(){
                refresh();
            };

            $scope.editAffiliate = function(affiliate){
                $log.log("Editing affiliate:");
                $log.log(affiliate);

                $location.path(['/home/config/affiliate/', affiliate.id].join(''));
            };

            $scope.createAffiliate = function(){
                $log.log("Creating Affiliate:");
                $location.path('/home/config/affiliate');
            };

            $scope.onChangeTenant = function(){
                $log.log("changed tenant:");
                $log.log($scope.selectedTenant);
                refresh();
            }

            //initial load
            $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
            loadTenants().then(
                function(result){
                    $log.log('influenceAdminAffiliatesCtrl initial Load : loadTenants fulfilled!');
                    $log.log(result);

                    if(result.data.tenants.length === 0){
                        return;
                    }

                    $scope.selectedTenant = result.data.tenants[0];
                    return loadAffiliates($scope.selectedTenant.id, $scope.numberOfPage, $scope.pageNumber, $scope.sortFieldName, $scope.sortFieldAscOrDesc);
                }
            ).catch(
                function(err){
                    $log.log('influenceAdminAffiliatesCtrl initial Load rejected!');
                    $log.log(err);

                    $location.path('/error').search({code:err.data.code, msg:err.data.message});
                }
            ).finally(function(){
                    $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                }
            );

        })
        .controller('influenceAdminAffiliateCtrl', function(
            $scope, $rootScope, $location, $log, $routeParams,
            influenceAdminAppConstants, influenceAdminAppSession, dirtyCheckerService,
            tenantsService, affiliatesService){
            $log.log("influenceAdminAffiliateCtrl called!");

            //If user not authenticated, then go to home/index view directly
            if(!influenceAdminAppSession.isAuthenticated()){
                $location.path('/');
                return;
            }

            var affiliateId = $routeParams.affiliateId,
                originalAffiliate;
            $log.log('influenceAdminAffiliateCtrl $routeParams');
            $log.log($routeParams);

            //$scope.selectedTenant = {};

            //Code for when load the affiliate view
            if(!affiliateId){
                //When no passed-in affiliateId, assume this is an create
                $scope.affiliate = {};

                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                tenantsService.queryConfigurable({configOptions: "affiliate",numberOfPage:1000,pageNumber:1,token: influenceAdminAppSession.token.token}).$promise.then(
                    function(docs){
                        $log.log('influenceAdminAffiliateCtrl tenantsService.query fulfilled');
                        $log.log(docs);
                        $scope.tenants = docs.data.tenants;

                        //$scope.selectedTenant.tenant = $scope.tenants[0];
                        $scope.affiliate.tenantId = $scope.tenants[0].id;
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminAffiliateCtrl tenantsService.query rejected');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );

            }else{
                //When has passed in affiliateId, assume this is an update
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                affiliatesService.get({affiliateId:affiliateId,token: influenceAdminAppSession.token.token}).$promise.then(
                    function(result){
                        $log.log('influenceAdminAffiliateCtrl get fulfilled!');
                        $log.log(result.data.affiliate);
                        $scope.affiliate = result.data.affiliate;
                        originalAffiliate = angular.copy(result.data.affiliate);
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminAffiliateCtrl get rejected!');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );
            }

            //Handler when user update or create affiliate
            $scope.createUpdateAffiliate = function(){
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                $log.log('influenceAdminAffiliateCtrl createUpdateAffiliate.');

                var params = {
                        token: influenceAdminAppSession.token.token
                    },
                    postData = {};

                //Edit
                if($scope.affiliate && $scope.affiliate.id){
                    params.affiliateId = $scope.affiliate.id;

                    //Dirty check
                    postData = dirtyCheckerService.getDirtyProperties(originalAffiliate, $scope.affiliate);

                }else{
                    //Create
                    postData.tenantId = $scope.affiliate.tenantId;
                    postData.name = $scope.affiliate.name;
                }

                affiliatesService.save(
                    //params
                    params,
                    //Post data
                    postData
                ).$promise.then(
                    function(result){
                        $log.log('influenceAdminAffiliateCtrl post fulfilled!');
                        $log.log(result.data.affiliate);
                        $scope.affiliate = result.data.affiliate;
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminAffiliateCtrl post rejected!');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );
            }
        })

        //Admin Permissions
        .controller('influenceAdminAdminPermissionsCtrl', function(
            $scope, $rootScope, $location, $log, $routeParams, $q,
            influenceAdminAppConstants, influenceAdminAppSession, dirtyCheckerService,
            actionsService, tenantsService, affiliatesService, adminService, adminPermissionsService){
            $log.log("influenceAdminAdminPermissionsCtrl called!");

            //If user not authenticated, then go to home/index view directly
            if(!influenceAdminAppSession.isAuthenticated()){
                $location.path('/');
                return;
            }
            var adminId = $routeParams.adminId;

            if(!adminId){
                $location.path('/error').search({code:500000000, msg:"Admin ID is required to edit admin permission"});
                return;
            }

            $scope.loadTenants = function(){
                var df = $q.defer();

                tenantsService.queryConfigurable({configOptions:"admin_permission", numberOfPage:1000,pageNumber:1,token: influenceAdminAppSession.token.token}).$promise.then(
                    function(docs){
                        $log.log('influenceAdminAdminPermissionsCtrl loadTenants promise fulfilled!');

                        df.resolve(docs);
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminAdminPermissionsCtrl loadTenants promise rejected!');
                        $log.log(err);

                        df.reject(err);
                    }
                ).finally(
                    function(){

                    }
                );

                return df.promise;
            };

            $scope.loadAffiliates = function(tenant){
                var df = $q.defer();

                affiliatesService.query({tenantId:tenant.id, numberOfPage:1000,pageNumber:1,token: influenceAdminAppSession.token.token}).$promise.then(
                    function(docs){
                        $log.log('influenceAdminAdminPermissionsCtrl loadAffiliates promise fulfilled!');

                        df.resolve(docs);
                    }
                ).catch(
                    function(err){
                        $log.log('influenceAdminAdminPermissionsCtrl loadAffiliates promise rejected!');
                        $log.log(err);

                        df.reject(err);
                    }
                ).finally(
                    function(){

                    }
                );

                return df.promise;
            };

            $scope.loadingStart = function(){
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
            };

            $scope.loadingEnd = function(){
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
            };

            $scope.onError = function(err){
                $location.path('/error').search({code:err.data.code, msg:err.data.message});
            };

            $scope.savePermissions = function(){
                $log.log("savePermissions clicked!");
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);
                adminPermissionsService.save(
                    {adminId:adminId, token:influenceAdminAppSession.token.token},
                    $scope.permissions
                ).$promise.then(
                    function(result){
                        $scope.permissions = result.data.permissions;
                    }
                ).catch(
                    function(err){
                        $log.log('savePermissions get rejected!');
                        $log.log(err);

                        $location.path('/error').search({code:err.data.code, msg:err.data.message});
                    }
                ).finally(
                    function(){
                        $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                    }
                );
            };

            //Initial page load
            $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);

            $q.all([
                actionsService.query({numberOfPage:1000,pageNumber:1,token: influenceAdminAppSession.token.token}).$promise,
                adminService.get({adminId:adminId, token: influenceAdminAppSession.token.token}).$promise,
                adminPermissionsService.get({adminId:adminId, token: influenceAdminAppSession.token.token}).$promise
            ])
            .then(
                function(results){
                    $log.log('influenceAdminAdminPermissionsCtrl actionsService.query({numberOfPage:1000,pageNumber:1,token: influenceAdminAppSession.token.token}).$promise get fulfilled!');
                    $log.log('influenceAdminAdminPermissionsCtrl adminService.get({adminId:adminId, token: influenceAdminAppSession.token.token}).$promise get fulfilled!');
                    $log.log('influenceAdminAdminPermissionsCtrl adminPermissionsService.get({adminId:adminId, token: influenceAdminAppSession.token.token}).$promise get fulfilled!');

                    $log.log(results[0].data.actions);
                    $log.log(results[1].data.admin);
                    $log.log(results[2].data.permissions);

                    $scope.actions = results[0].data.actions;
                    $scope.admin = results[1].data.admin;
                    $scope.permissions = results[2].data.permissions || {};
                }
            ).catch(
                function(err){
                    $log.log('influenceAdminAdminPermissionsCtrl get rejected!');
                    $log.log(err);

                    $location.path('/error').search({code:err.data.code, msg:err.data.message});
                }
            ).finally(
                function(){
                    $rootScope.$emit(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL);
                }
            );

        })

        .controller('influenceAdminContactusCtrl', function($scope, $log){
            $log.log("influenceAdminContactusCtrl called!");

        })
        .controller('influenceAdminNotFoundCtrl', function($scope, $log){
            $log.log("influenceAdminNotFoundCtrl called!");

        }).controller('influenceAdminErrorCtrl', function($scope, $log){
            $log.log("influenceAdminErrorCtrl called!");

        });

}());

