(function () {
    "use strict";

    angular.module('influenceAdminApp.controllers', [
        'ui.bootstrap',
        'influenceAdminApp.constants',
        'influenceAdminApp.config',
        'influenceAdminApp.session',
        'influenceAdminApp.apiServices'
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

            $scope.adminLogin = function(username, password, rememberMe){
                $rootScope.$emit(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL);

                authService.adminLogin({
                    tenantId:influenceAdminAppConfig.API.TENANT_ID,
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

                if($scope.tenant && $scope.tenant._id){
                    params.tenantId = $scope.tenant._id;
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
                tenantsService.query({numberOfPage:numberOfPage,pageNumber:pageNumber,token: influenceAdminAppSession.token.token}).$promise.then(
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

                $location.path(['/home/config/tenant/', tenant._id].join(''));
            };

            $scope.createTenant = function(){
                $log.log("Creating tenant:");
                $location.path('/home/config/tenant')
            };

            //initial load
            loadTenants($scope.numberOfPage, $scope.pageNumber);

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

