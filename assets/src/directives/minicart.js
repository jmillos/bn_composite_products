/* --- buildProductComposite --- */
module.exports = ['$filter', '$timeout', function($filter, $timeout) {
    return {
        restrict: "E",
        replace: true,
        require: '^buildProductComposite',
        templateUrl: "templates/front/minicart.html",
        scope: {
        },
        link: function($scope, $element, $attrs, buildCtrl) {
        	$scope.buildCtrl = buildCtrl;

        	angular.element('form').on('click', '.ng-submit-minicart', function(e){
        		angular.element(this).parents('form').submit();
        	});
        },
        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
        	$timeout(function(){
        		console.log('$scope.buildCtrl', $scope.buildCtrl);
        	});

        	var vm = this;

        	vm.getCompositionName = getCompositionName;
        	vm.getImage = getImage;
        	vm.isFirstItem = isFirstItem;
        	vm.removeItem = removeItem;

        	function getCompositionName(compositionId){
        		var comp = $filter('filter')($scope.buildCtrl.compositions, {id: compositionId});
        		if(typeof comp !== "undefined" && typeof comp[0] !== "undefined"){
        			return comp[0].name;
        		}
        	}

        	function getImage(component){
        		var comp = $filter('filter')($scope.buildCtrl.compositions, { components: {productId: component.productId} }, true);
        		if(typeof comp !== "undefined" && typeof comp[0] !== "undefined"){
        			var componentSel = $filter('filter')(comp[0].components, {productId: component.productId}, true);
        			if(typeof componentSel !== "undefined" && typeof componentSel[0] !== "undefined"){
        				return componentSel[0].img[0];
        			}
        		}
        	}

        	function isFirstItem(key){
        		var keys = Object.keys($scope.buildCtrl.cart.additionalItems);
        		return typeof keys[0] !== "undefined" && keys[0] == key;
        	}

        	function removeItem(component, keyComposition){
        		delete $scope.buildCtrl.cart.additionalItems[keyComposition][component.productId];

        		var comp = $filter('filter')($scope.buildCtrl.compositions, { components: {productId: component.productId} }, true);
        		if(typeof comp !== "undefined" && typeof comp[0] !== "undefined"){
        			var componentSel = $filter('filter')(comp[0].components, {productId: component.productId}, true);
        			if(typeof componentSel !== "undefined" && typeof componentSel[0] !== "undefined"){
						componentSel[0].selected = false;
        			}
        		}

        		if(Object.keys($scope.buildCtrl.cart.additionalItems[keyComposition]).length == 0){
        			delete $scope.buildCtrl.cart.additionalItems[keyComposition];
        		}

        		$scope.buildCtrl.calcTotals();
        	}
        }],
		controllerAs: "vm",
    };
}];