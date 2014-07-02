(function(){
    angular.module('influenceAdminApp.session',[
        'ngCookies',
        'influenceAdminApp.constants'
    ]).service('influenceAdminAppSession', function ($cookies, $rootScope, influenceAdminAppConstants) {
        var initialized = false,
            self = this;
            _isAuthenticated = function(){
                return self.token != null;
            };

        self.token = null;

        self.init = function(){
            if($cookies.influence_admin_app){
                self.token = angular.fromJson($cookies.influence_admin_app);
            }
            initialized = true;

            if(_isAuthenticated()) {
                $rootScope.$broadcast(influenceAdminAppConstants.EVENTS.ADMIN_AUTHENTICATED);
            }else{
                $rootScope.$broadcast(influenceAdminAppConstants.EVENTS.ADMIN_LOGGED_OUT);
            }
        };

        self.isAuthenticated = function(){
            if(!initialized){
                self.init();
            }

            return _isAuthenticated();
        };

        self.create = function (token, admin) {
            self.token = token;
            $cookies.influence_admin_app = JSON.stringify(token);
        };

        self.destroy = function () {
            self.token = null;
            $cookies.influence_admin_app = null;
        };

        return self;
    });
})();
