(function () {
    "use strict";

     angular.module('influenceAdminApp.constants', []).provider('influenceAdminAppConstants', function(){
        var constants = {
            EVENTS : {
                LOCATION_CHANGED : "INFLUENCE_ADMIN_APP_CONSTANTS_EVENTS_LOCATION_CHANGED"
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