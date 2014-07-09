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
                when('/home/posts', {
                    templateUrl: '/admin/scripts/views/partials/posts.html',
                    controller: 'influenceAdminHomeCtrl'
                }).
                when('/home/config/admins', {
                    templateUrl: '/admin/scripts/views/partials/adminAccounts.html',
                    controller: 'influenceAdminAccountsCtrl'
                }).
                when('/home/config/admin/:adminId?', {
                    templateUrl: '/admin/scripts/views/partials/adminAccount.html',
                    controller: 'influenceAdminAccountCtrl'
                }).
                when('/home/config/permissions/:adminId?', {
                    templateUrl: '/admin/scripts/views/partials/adminPermissions.html',
                    controller: 'influenceAdminAdminPermissionsCtrl'
                }).

                when('/home/config/tenants', {
                    templateUrl: '/admin/scripts/views/partials/tenants.html',
                    controller: 'influenceAdminTenantsCtrl'
                }).
                when('/home/config/tenant/:tenantId?', {
                    templateUrl: '/admin/scripts/views/partials/tenant.html',
                    controller: 'influenceAdminTenantCtrl'
                }).
                when('/home/config/actions', {
                    templateUrl: '/admin/scripts/views/partials/actions.html',
                    controller: 'influenceAdminActionsCtrl'
                }).
                when('/home/config/action/:actionId?', {
                    templateUrl: '/admin/scripts/views/partials/action.html',
                    controller: 'influenceAdminActionCtrl'
                }).
                when('/home/config/affiliates', {
                    templateUrl: '/admin/scripts/views/partials/affiliates.html',
                    controller: 'influenceAdminAffiliatesCtrl'
                }).
                when('/home/config/affiliate/:affiliateId?', {
                    templateUrl: '/admin/scripts/views/partials/affiliate.html',
                    controller: 'influenceAdminAffiliateCtrl'
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


