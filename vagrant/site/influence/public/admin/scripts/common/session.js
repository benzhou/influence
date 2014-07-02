(function(){
    angular.module('influenceAdminApp.session',[
        'ngCookies'
    ]).service('influenceAdminAppSession', function ($cookies) {
        this.init = function(){
            if($cookies.influence_admin_app){
                this.token = angular.fromJson($cookies.influence_admin_app);
            }

        };
        this.create = function (token, admin) {
            this.token = token;
            this.admin = admin;
            $cookies.influence_admin_app = JSON.stringify(token);

        };
        this.destroy = function () {
            this.token = null;
            this.admin = null;
            $cookies.influence_admin_app = null;
        };

        return this;
    });
})();
