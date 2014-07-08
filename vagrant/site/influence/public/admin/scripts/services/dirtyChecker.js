(function(){

    function dirtyChecker(){
        var getDirtyProperties = function(updatedObj, originalObj){
            var returnObj = {};

            for(var prop in originalObj){
                if(originalObj.hasOwnProperty(prop) && originalObj[prop] !== updatedObj[prop]){
                    returnObj[prop] = updatedObj[prop];
                }
            }

            return returnObj;
        }

        this.getDirtyProperties = getDirtyProperties;
    }

    angular.module('influenceAdminApp.dirtyChecker', []).service('dirtyCheckerService', dirtyChecker);
})();

