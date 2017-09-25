require('./template');
var wcBonsterCompositions = angular.module('wcBonsterCompositions', ['ngSanitize', 'ngAnimate', 'ngMessages', 'bonster.template']);

wcBonsterCompositions.run(['$rootScope', function($rootScope){

	$rootScope.toggle = function(){
        $rootScope.show = !$rootScope.show;
    }
}]);
wcBonsterCompositions.directive('buildProductComposite', require('./directives/buildProductComposite'));
wcBonsterCompositions.directive('minicart', require('./directives/minicart'));
wcBonsterCompositions.directive('hideOnOutClick', require('./directives/utilsDirectives').hideOnOutClick);
wcBonsterCompositions.directive('bbSticky', function($window, $timeout) {
    return {
        restrict: "A",
        replace: true,
        scope: {

        },
        link: function($scope, $element, $attrs) {
            if ($attrs.bbDisabled == "true") { 
                return false;
            }

            $timeout(function(){
                var offsetTop = $element.offset().top,
                    offset = typeof $attrs.offset !== "undefined" ? parseInt($attrs.offset) : 0,
                    eWidth = $element.width();


                var $windowEl = angular.element($window);           

                $windowEl.on('scroll', function(e) {
                    var parentOffsetBottom = typeof $attrs.parent !== "undefined" ? (angular.element($attrs.parent).offset().top + angular.element($attrs.parent).height()) : null;

                    if (($window.innerHeight - ($element.height() + offset)) < 0){
                        $element.css({
                            position: "static"
                        });
                        return false;
                    }

                    if (parentOffsetBottom !== null) {
                        if ($windowEl.scrollTop() >= offsetTop && ($windowEl.scrollTop()+$element.height()) <= parentOffsetBottom + 20) {
                            $element.css({
                                position: "fixed",
                                top: offset+"px",
                                bottom: "inherit",
                                width: eWidth,
                                zIndex: 5,
                            });
                        } else if( ($windowEl.scrollTop()+$element.height()) > parentOffsetBottom + 20) {
                            $element.css({
                                position: "fixed",
                                top: parentOffsetBottom - ($windowEl.scrollTop()+$element.height()),
                                zIndex: 5,
                                // bottom: ($windowEl.scrollTop() + $element.height() + ($element.height()/2) - parentOffsetBottom)+"px",
                            });
                        } else {
                            $element.css({
                                position: "static",
                                width: "auto",
                            });
                        }
                    } else {
                        if($windowEl.scrollTop() >= offsetTop){
                            $element.css({
                                position: "fixed",
                                top: offset+"px",
                                width: eWidth,
                                zIndex: 5,
                            });
                        } else {
                            $element.css({
                                position: "static",
                                width: "auto",
                            });
                        }
                    }
                });
            });
        },
        controller: function($scope, $element, $attrs, $transclude) {

        }
    };
});

angular.element(document).ready(function() {
    angular.bootstrap(angular.element('body'), ['wcBonsterCompositions']);
});