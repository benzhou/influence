'use strict';

/* App Module */

angular.module('influenceAdminApp', [
    'ngRoute',
    'influenceAdminApp.config',
    'influenceAdminNavi',
    'influenceAdminControllers'
]).config(['$routeProvider',
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
