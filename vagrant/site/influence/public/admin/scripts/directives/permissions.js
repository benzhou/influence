(function(){
    "use strict";

    angular.module('influenceAdminApp.adminPermissions', [
        'influenceAdminApp.constants'
    ])
        .directive('adminPermissions', function($log){
            var controller = function($scope, $rootScope, $log){
                $log.log("adminPermissions controller: ");
                $log.log($scope.actions);

                var
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


                $scope.isAppActionsContains = function(action){
                    if(permModel.actions === "*") return true;

                    return permModel.actions.indexOf(action) > 0;
                }
            }

            return {
                scope : {
                    permissionLevel : "=",
                    actions : "=",
                    permissions : "=",
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
