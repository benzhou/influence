'use strict';

/* App Module */

angular.module('influenceAdminApp', [
    'ngRoute',
    //'influenceAdminApp.config',
    'influenceAdminApp.navigation',
    'influenceAdminApp.controllers'
]).config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: '/admin/scripts/views/partials/index.html',
                controller: 'influenceAdminCtrl'
            }).
            when('/login', {
                templateUrl: '/admin/scripts/views/partials/login.html',
                controller: 'influenceAdminLoginCtrl'
            }).
            when('/contactus', {
                templateUrl: '/admin/scripts/views/partials/contactus.html',
                controller: 'influenceAdminCtrl'
            }).
            otherwise({
                redirectTo: '/404'
            });
    }]);
