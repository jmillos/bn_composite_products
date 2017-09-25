/* --- buildProductComposite --- */
module.exports = ['$filter', '$document', '$timeout', function($filter, $document, $timeout) {
    return {
        restrict: "E",
        templateUrl: "templates/front/build-product-composite.html",
        replace: true,
        scope: {
        	compositions: "=bonsCompositions",
        	basePrice: "=bonsBaseprice"
        },
        link: function($scope, $element, $attrs) {
        	/*$document.find('body').click(function (e){
                // console.log("Mouseup", $(popover), e)
                var container = angular.element($element).find('.dropdown-selected');

                if (!container.is(e.target) // if the target of the click isn't the container...
                    && container.has(e.target).length === 0){ // ... nor a descendant of the container
                    // $('.filter-options').slideUp('fast');
                    $scope.$apply(function() {
                        $scope.showMenuSelected = false;
                    });
                }
            });*/

        	/*$timeout(function(){
	        	var minicart = $element.find('.jg-woo-minicart');
	            angular.element('.product.product-type-bonscomposite .images').append(minicart);
        	});*/
        },
        controller: ['$scope', function($scope) {
        	var vm = this;
        	vm.compositions = $scope.compositions;
        	vm.compositionsBase = getCompositionsBase();
        	vm.compositionsAdditional = getCompositionsAdditional();
        	vm.cart = { basicItems: {}, additionalItems: {}, basePrice: $scope.basePrice, additionalPrice: 0, orderTotal: $scope.basePrice };
        	vm.cntCompositionsInCart = 0;
        	vm.cntCompositionsAddInCart = 0;

        	vm.nextStep = nextStep;
        	vm.prevStep = prevStep;
        	vm.goStep = goStep;
        	vm.changeQtyOrder = changeQtyOrder;
        	vm.calcTotals = calcTotals;

        	console.log(vm.compositions);
        	if(typeof vm.compositions !== "undefined" && typeof vm.compositions[0] !== "undefined"){
        		vm.step = 0;
        		vm.compositionActive = vm.compositions[0];
        	}

        	vm.selectComponent = function(component){
        		if (vm.compositionActive.hasOwnProperty('isAdditional') && vm.compositionActive.isAdditional) {
        			selectComponentAdditional(component);

        			var cnt = 0;
        			angular.forEach(vm.cart.additionalItems, function(c){
        				angular.forEach(c, function(i, key){
        					cnt++;
        				});
        			});
        			vm.cntCompositionsAddInCart = cnt;
        		}else{
        			selectComponent(component);      			
        			vm.cntCompositionsInCart = Object.keys(vm.cart.basicItems).length;
        			if(vm.cntCompositionsInCart == vm.compositionsBase.length){
        				vm.isReadyForOrder = true;
        			}
        			setCompositionsPrevNext();        			
        		}

        		calcTotals();
        	}

        	vm.isCompositionSelected = function(item){
        		return typeof vm.cart.basicItems[item.id] !== "undefined" || typeof vm.cart.additionalItems[item.id] !== "undefined";
        	}

        	function selectComponent(component){
        		if(typeof vm.cart.basicItems[vm.compositionActive.id] !== "undefined"){
        			removeSelected();
        		}
        		component.selected = true;
        		vm.cart.basicItems[vm.compositionActive.id] = {productId: component.productId, name: component.name, qty: component.qty, price: 0, qtyOrder: 1};
        	}

        	function selectComponentAdditional(component){
        		if(typeof vm.cart.additionalItems[vm.compositionActive.id] === "undefined"){
        			vm.cart.additionalItems[vm.compositionActive.id] = {};
        		}

        		if(typeof vm.cart.additionalItems[vm.compositionActive.id][component.productId] === "undefined"){
	        		component.selected = true;
	        		component.qtyOrder = 1;
	        		vm.cart.additionalItems[vm.compositionActive.id][component.productId] = {productId: component.productId, name: component.name, qty: component.qty, price: parseFloat(component.incrementPrice), qtyOrder: component.qtyOrder, isAdditional: true};
        		}else{
        			component.selected = false;
	        		delete vm.cart.additionalItems[vm.compositionActive.id][component.productId];
        		}
        	}

        	function calcTotals(){
        		vm.cart.basePrice = $scope.basePrice;
        		vm.cart.additionalPrice = 0;
        		angular.forEach(vm.cart.additionalItems, function(i){
        			angular.forEach(i, function(c){
        				vm.cart.additionalPrice += c.qtyOrder * c.price;
        			});
        		});
        		vm.cart.orderTotal = vm.cart.basePrice + vm.cart.additionalPrice;
        	}

        	function changeQtyOrder(component){
        		vm.cart.additionalItems[vm.compositionActive.id][component.productId].qtyOrder = component.qtyOrder;
        		calcTotals();
        	}

        	function prevStep(){
        		vm.step--;   
        		vm.compositionActive = vm.compositionsBase[vm.step];
        		setCompositionsPrevNext();
        	}

        	function nextStep(){
        		vm.step++;   
        		vm.compositionActive = vm.compositionsBase[vm.step];
        		setCompositionsPrevNext();
        	}

        	function goStep(composition){
        		vm.step = vm.compositions.indexOf(composition);
        		vm.compositionActive = composition;
        		setCompositionsPrevNext();        		
        	}

        	function setCompositionsPrevNext(){
        		if(typeof vm.compositionsBase[vm.step-1] !== "undefined"){
					vm.compositionPrev = vm.compositionsBase[vm.step-1];
        		}else{
        			vm.compositionPrev = false;
        		}

        		if(typeof vm.compositionsBase[vm.step+1] !== "undefined"){
					vm.compositionNext = vm.compositionsBase[vm.step+1];	
        		}else{
        			vm.compositionNext = false;
        		}
        	}

        	function removeSelected(){
        		var compPrev = $filter('filter')(vm.compositionActive.components, {productId: vm.cart.basicItems[vm.compositionActive.id].productId});
        		if(typeof compPrev !== "undefined" && typeof compPrev[0] !== "undefined"){
        			compPrev[0].selected = false;
        		}
        	}

        	function getCompositionsBase(){
        		var comps = [];
        		angular.forEach(vm.compositions, function(c){
        			if( !c.hasOwnProperty('isAdditional') || !c.isAdditional ){
        				comps.push(c);
        			}
        		});

        		return comps;
        	}

        	function getCompositionsAdditional(){
        		var comps = [];
        		angular.forEach(vm.compositions, function(c){
        			if( c.hasOwnProperty('isAdditional') && c.isAdditional ){
        				comps.push(c);
        			}
        		});

        		return comps;
        	}
		}],
		controllerAs: "vm",
    }
}];