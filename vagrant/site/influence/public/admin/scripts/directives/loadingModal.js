(function () {
    "use strict";

    angular.module('influenceAdminApp.loadingModal', [
        'ui.bootstrap',
        'influenceAdminApp.constants'
    ])
        .directive('loadingModalDirective', function(){
            var loadingModelInstance,
                lastCallToOpenOrClose = false,
                unsubQueue = [],
                modalInstanceCtrl = function ($scope, $modalInstance) {

                },
                controller = function($scope, $rootScope, $log, $modal, influenceAdminAppConstants){
                    $log.log('loadingModalDirective Controller called');

                    var
                        templateContent = "",
                        openOrClose = function(bOpenOrClose){
                            $log.log('***********loadingModalDirective openOrClose: %s', bOpenOrClose);
                            if(lastCallToOpenOrClose === bOpenOrClose) return;
                            lastCallToOpenOrClose = bOpenOrClose;

                            if(loadingModelInstance){
                                try{
                                    //Noticing an intermittent issue when call dismiss ModelInstance, it couldn't find
                                    //this model instance it tries to dismiss, It could possibly caused by two quick dismiss
                                    //call and the first one is still in gress, try to catch the error and set the instance to null
                                    //Since it doesn't exists any more.
                                    loadingModelInstance.dismiss("cancel");
                                }catch(e){
                                    $log.log("xxxxxxxxxxxxxxx---- loadingModelInstance doesn't exist when try to dismiss it");
                                }
                                loadingModelInstance = null;
                            }

                            if(bOpenOrClose){
                                loadingModelInstance = $modal.open({
                                        template: templateContent,
                                        controller: modalInstanceCtrl,
                                        //size: size,
                                        resolve: {}
                                    }
                                );
                            }
                        };

                    $scope.setTemplate = function(template){
                        templateContent = template;
                    };


                    unsubQueue.push(
                        $rootScope.$on(influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL, function(){
                            $log.log('loadingModalDirective influenceAdminAppConstants.EVENTS.SHOW_LOADING_MODAL handled');
                            openOrClose(true);
                        })
                    );

                    unsubQueue.push(
                        $rootScope.$on(influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL, function(){
                            $log.log('loadingModalDirective influenceAdminAppConstants.EVENTS.HIDE_LOADING_MODAL handled');
                            openOrClose(false);
                        })
                    );

                    $scope.$on(influenceAdminAppConstants.EVENTS.DESTROY, function(){
                        $log.log('influenceAdminAppConstants event DESTROY, listened in loadingModalDirective controller');
                        angular.forEach(unsubQueue, function(unsubFunc){
                            unsubFunc();
                        });
                    });

                };

            return {
                scope : {

                },
                restrict: 'E',
                controller : controller,
                link : function(scope, element, attrs){
                    //console.log(scope);
                    scope.setTemplate(element.html());
                    element.html('');
                },
                templateUrl : '/admin/scripts/views/partials/loadingModal.html'
            }
        });
}());