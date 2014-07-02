(function () {
    "use strict";

    angular.module('influenceAdminApp.loadingModal', [
        'ui.bootstrap',
        'influenceAdminApp.constants'
    ])
        .directive('loadingModalDirective', function(){
            var loadingModelInstance,
                controller = function($scope, $log, $modal){
                    $log.log('loadingModalDirective Controller called');

                    $scope.openOrClose = function(bOpenOrClose){
                        loadingModelInstance && loadingModelInstance.close();

                        if(bOpenOrClose){
                            /*loadingModelInstance = $modal.open(
                                templateUrl : '/admin/scripts/views/partials/loadingModal.html'
                            );*/
                        }
                    }

                };

            return {
                scope : {},
                restrict: 'E',
                controller : controller,
                link : function(scope, element, attrs){
                    scope.open(attrs.show);
                }
            }
        });
}());