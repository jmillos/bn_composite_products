/* --- utilsDirectives --- */
module.exports = {
	hideOnOutClick: ['$document', function($document) {
	    return {
	        restrict: "A",
	        link: function($scope, $element, $attrs) {
	        	$document.find('body').click(function (e){
	                // console.log("Mouseup", $(popover), e)
	                var container = angular.element($element);

	                if (!container.is(e.target) // if the target of the click isn't the container...
	                    && container.has(e.target).length === 0){ // ... nor a descendant of the container
	                    // $('.filter-options').slideUp('fast');
	                    $scope.$apply(function() {
	                        // $scope.$eval(attrs.hideOnOutClick);
	                        // $attrs.hideOnOutClick = false;
	                        $scope.$eval($attrs.hideOnOutClick + '= false');
	                    });
	                }
	            });
	        },
	    }
	}]
};