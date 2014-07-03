(function () {
    "use strict";

    angular.module('influenceAdminApp', [
        'ngRoute',
        'influenceAdminApp.constants',
        //'influenceAdminApp.config',
        'influenceAdminApp.loadingModal',
        'influenceAdminApp.navigation',
        'influenceAdminApp.menu',
        'influenceAdminApp.controllers'
    ]).config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: '/admin/scripts/views/partials/index.html',
                    controller: 'influenceAdminIndexCtrl'
                }).
                when('/login', {
                    templateUrl: '/admin/scripts/views/partials/login.html',
                    controller: 'influenceAdminLoginCtrl'
                }).
                when('/logout',{
                    templateUrl : '/admin/scripts/views/partials/logout.html',
                    controller: 'influenceAdminLogoutCtrl'
                }).
                when('/welcome', {
                    templateUrl: '/admin/scripts/views/partials/welcome.html',
                    controller: 'influenceAdminHomeCtrl'
                }).
                when('/home/affiliates', {
                    templateUrl: '/admin/scripts/views/partials/affiliates.html',
                    controller: 'influenceAdminHomeCtrl'
                }).
                when('/home/posts', {
                    templateUrl: '/admin/scripts/views/partials/posts.html',
                    controller: 'influenceAdminHomeCtrl'
                }).
                when('/home/tenants', {
                    templateUrl: '/admin/scripts/views/partials/tenants.html',
                    controller: 'influenceAdminHomeCtrl'
                }).
                when('/contactus', {
                    templateUrl: '/admin/scripts/views/partials/contactus.html',
                    controller: 'influenceAdminContactusCtrl'
                }).
                when('/not-found', {
                    templateUrl: '/admin/scripts/views/partials/notFound.html',
                    controller: 'influenceAdminContactusCtrl'
                }).
                when('/error', {
                    templateUrl: '/admin/scripts/views/partials/error.html',
                    controller: 'influenceAdminContactusCtrl'
                }).
                otherwise({
                    redirectTo: '/not-found'
                });
        }]);
}());


