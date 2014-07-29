(function(){
    'use strict';

    angular.module('geolocation',[

    ]).factory('geolocation', ['$q','$rootScope','$window',function ($q,$rootScope,$window) {
            return {
                getLocation: function (opts) {
                    var deferred = $q.defer();
                    if ($window.navigator && $window.navigator.geolocation) {
                        $window.navigator.geolocation.getCurrentPosition(function(position){
                            $rootScope.$apply(function(){deferred.resolve(position);});
                        }, function(error) {
                            switch (error.code) {
                                case 1:
                                    $rootScope.$broadcast('error',{});
                                    $rootScope.$apply(function() {
                                        deferred.reject(geolocation_msgs['errors.location.permissionDenied']);
                                    });
                                    break;
                                case 2:
                                    $rootScope.$broadcast('error',geolocation_msgs['errors.location.positionUnavailable']);
                                    $rootScope.$apply(function() {
                                        deferred.reject(geolocation_msgs['errors.location.positionUnavailable']);
                                    });
                                    break;
                                case 3:
                                    $rootScope.$broadcast('error',geolocation_msgs['errors.location.timeout']);
                                    $rootScope.$apply(function() {
                                        deferred.reject(geolocation_msgs['errors.location.timeout']);
                                    });
                                    break;
                            }
                        }, opts);
                    }
                    else
                    {
                        $rootScope.$broadcast('error',geolocation_msgs['errors.location.unsupportedBrowser']);
                        $rootScope.$apply(function(){deferred.reject(geolocation_msgs['errors.location.unsupportedBrowser']);});
                    }
                    return deferred.promise;
                }
            };
        }]);
})();
