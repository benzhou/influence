'use strict';

/* App Module */

var influenceAdminApp = angular.module('influenceAdminApp', [
    'ngRoute',
    'influenceAdminControllers'
]);

influenceAdminApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: '/admin/scripts/views/partials/index.html',
                controller: 'influenceAdminCtrl'
            }).
            when('/login', {
                templateUrl: '/admin/scripts/views/partials/login.html',
                controller: 'influenceAdminCtrl'
            }).
            when('/contactus', {
                templateUrl: '/admin/scripts/views/partials/contactus.html',
                controller: 'influenceAdminCtrl'
            }).
            otherwise({
                redirectTo: '/404'
            });
    }]);
