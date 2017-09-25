require('./template');
var wcBonsterCompositions = angular.module('wcBonsterCompositions', ['ngSanitize', 'ngAnimate', 'ngMessages', 'ngMaterial', 'bonster.template']);

wcBonsterCompositions.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('light-blue', {
            'default': '600' // use shade 200 for default, and keep all other shades the same
        })
        // If you specify less than all of the keys, it will inherit from the
        // default shades
        .accentPalette('red', {
            'default': 'A700', // by default use shade 400 from the pink palette for primary intentions
            'hue-1': 'A400', // use shade 100 for the <code>md-hue-1</code> class
            'hue-2': 'A200', // use shade 600 for the <code>md-hue-2</code> class
            'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
        });
});

wcBonsterCompositions.directive('metaBoxComponent', require('./directives/metaBoxComponent'));
wcBonsterCompositions.directive('compositeWoocommerce', require('./directives/compositeWoocommerce'));

angular.element(document).ready(function() {
    var el = "body";
    if( typeof wc_bonster_admin_meta_boxes !== "undefined" && wc_bonster_admin_meta_boxes.hasOwnProperty('element_ngapp_angularjs') ){
        el = wc_bonster_admin_meta_boxes.element_ngapp_angularjs;
    }
    angular.bootstrap( angular.element(el), ['wcBonsterCompositions'] );
});
