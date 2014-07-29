(function () {
    "use strict";

    angular.module('influenceApp.controllers', [
        "influenceApp.config",
        'ui.bootstrap',
        'influenceApp.apiService'
    ])
        .controller('influenceMainCtrl', function ($scope,$window,$q, $log, $modal, influenceAppConfig, locationApiService, postApiService) {
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

            $scope.postCompleted = false;

            $scope.selectVenue = function(venue){
                $scope.selectedVenue = venue;
            };

            $scope.submitPost = function(){
                if(!$scope.selectedVenue) return;

                var affiliateId = $scope.selectedVenue.influence && $scope.selectedVenue.influence.affiliate.id,
                    opt = {},
                    postBody = {
                        content : $scope.postContent,
                        venueId : $scope.selectedVenue.id,
                        position: $scope.userPosition
                    };

                if(affiliateId){
                    postBody.affiliateId = affiliateId;
                }

                postApiService.save(opt, postBody).$promise.then(
                    function(result){
                        $log.log("influenceMainCtrl submitPost  postApiService.post promise caught an error!");
                        $log.log(result);

                        $scope.postCompleted = true;
                    }
                ).catch(
                    function(err){
                        $log.log("influenceMainCtrl submitPost  postApiService.post promise caught an error!");
                        $log.log(err);
                    }
                );
            };

            getLocation().then(function(position){
                $log.log("influenceMainCtrl, getLocation fulfilled!");
                $log.log(position);

                $scope.userPosition = position;

                var ll = "34.037534,-84.567637";//[position.coords.latitude,',', position.coords.longitude].join('');
                locationApiService.get({ll : ll}).$promise.then(
                    function(result){
                        $log.log("influenceMainCtrl, locationApiService.get fulfilled!");
                        $log.log(result);

                        $scope.venues = result.data.venues;
                    }
                ).catch(
                    function(err){
                        $log.log("influenceMainCtrl, locationApiService.get rejected!");
                        $log.log(err);
                    }
                ).finally(function(){
                        modelInstance.dismiss("cancel");
                    }
                );

            }).catch(function(err){
                $log.log("influenceMainCtrl, getLocation rejected!");
                $log.log(err);

            }).finally();


        }
    );
}());

