(function () {
    "use strict";

     angular.module('influenceAdminApp.constants', []).provider('influenceAdminAppConstants', function(){
        var constants = {
            EVENTS : {
                LOCATION_CHANGED : "$routeChangeSuccess",
                ADMIN_AUTHENTICATED: "INFLUENCE_ADMIN_APP_CONSTANTS_EVENTS_ADMIN_AUTHENTICATED",
                ADMIN_LOGGED_OUT: "INFLUENCE_ADMIN_APP_CONSTANTS_EVENTS_ADMIN_LOGGED_OUT",
                DESTROY : "$destroy",

                SHOW_LOADING_MODAL : "INFLUENCE_ADMIN_APP_CONSTANTS_EVENTS_SHOW_LOADING_MODAL",
                HIDE_LOADING_MODAL : "INFLUENCE_ADMIN_APP_CONSTANTS_EVENTS_HIDE_LOADING_MODAL"
            }
        };

         if(Object && Object.freeze) {
             constants = Object.freeze(constants);
         }

         this.$get = function(){

            return constants;
        }
    });

}());