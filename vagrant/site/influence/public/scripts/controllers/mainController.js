(function () {
    "use strict";

    angular.module('influenceApp.controllers', [
        "influenceApp.config",
        'ui.bootstrap'
    ])
        .controller('influenceMainCtrl', function ($scope,$window,$q, $log, $modal, influenceAppConfig) {
            var getLocation = function () {
                var df = $q.defer();

                if ($window.navigator && $window.navigator.geolocation) {
                    $window.navigator.geolocation.getCurrentPosition(
                        function(position){
                            df.resolve(position);
                        }, function(err){
                            df.reject(err);
                        });
                }
                else {
                    df.reject({code:1});
                }

                return df.promise;
            },
                modelInstance = $modal.open({
                    template: "<div>Please Allow the page to retrieve your current location<div>",
                    controller: function ($scope, $modalInstance) {

                    },
                    //size: size,
                    resolve: {}
                });

            getLocation().then(function(position){
                $log.log("influenceMainCtrl, getLocation fulfilled!");
                $log.log(position);

                modelInstance.dismiss("cancel");

            }).catch(function(err){
                $log.log("influenceMainCtrl, getLocation rejected!");
                $log.log(err);

            }).finally();


        }
    );
}());

