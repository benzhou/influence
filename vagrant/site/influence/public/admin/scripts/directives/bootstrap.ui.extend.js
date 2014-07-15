(function () {
    "use strict";

    angular.module('influenceAdminApp.bootstrap.ui.extend', [
    ])
        .directive('dropdownToggleOnPromiseFulfilled', function ($q, $parse) {
            return {
                restrict: 'A',
                require: '?^dropdown',
                link: function(scope, element, attrs, dropdownCtrl) {
                    if ( !dropdownCtrl ) {
                        return;
                    }

                    dropdownCtrl.toggleElement = element;

                    var toggleDropdown = function(event) {
                        event.preventDefault();

                        if ( !element.hasClass('disabled') && !attrs.disabled ) {
                            var fn = $parse(attrs["dropdownToggleOnPromiseFulfilled"]);
                            scope.$apply(function() {
                                $q.when(fn(scope)).then(
                                    function(result){
                                        dropdownCtrl.toggle();
                                    }
                                );
                            });
                        }
                    };

                    element.bind('click', toggleDropdown);

                    // WAI-ARIA
                    element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
                    scope.$watch(dropdownCtrl.isOpen, function( isOpen ) {
                        element.attr('aria-expanded', !!isOpen);
                    });

                    scope.$on('$destroy', function() {
                        element.unbind('click', toggleDropdown);
                    });
                }
            };
        });
})();
