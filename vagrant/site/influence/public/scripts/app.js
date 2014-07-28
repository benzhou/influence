(function () {
    "use strict";

    angular.module('influenceApp', [
        'ngRoute',
        'influenceApp.controllers'
    ]).config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: '/scripts/views/partials/main.html',
                    controller: 'influenceMainCtrl'
                }).
                when('/contactus', {
                    templateUrl: '/scripts/views/partials/contactus.html',
                    controller: 'influenceAdminContactusCtrl'
                }).
                when('/not-found', {
                    templateUrl: '/scripts/views/partials/notFound.html',
                    controller: 'influenceAdminContactusCtrl'
                }).
                when('/error', {
                    templateUrl: '/scripts/views/partials/error.html',
                    controller: 'influenceAdminContactusCtrl'
                }).
                otherwise({
                    redirectTo: '/not-found'
                });
        }]);
}());


