(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./directives/compositeWoocommerce":2,"./directives/metaBoxComponent":3,"./template":4}],2:[function(require,module,exports){
/* --- compositeWoocommerce --- */
module.exports = ['$timeout', function($timeout) {
    return {
        restrict: "E",
        templateUrl: "templates/woocommerce/meta-box-compositions.html",
        replace: true,
        scope: {
        	compositions: "=bonsCompositions"
        },
        link: function($scope, $element, $attrs) {
        },
        controller: ['$scope', '$http', '$q', function($scope, $http, $q) {
            $scope.compositions = [];
            $scope.querySearch = querySearch;

            function querySearch(query) {
                var deferred = $q.defer();
                $http({
                    url: wc_bonster_admin_meta_boxes.ajax_url,
                    method: 'GET',
                    params: { action: 'wc_bonster_search_compositions', security: wc_bonster_admin_meta_boxes.search_compositions_nonce, term: query }
                }).then(function(response) {
                    var data = [];
                    angular.forEach(response.data, function(item, key){
                        data.push({ id: item.ID, name: item.post_title });
                    });
                    deferred.resolve(data);
                    console.log(data);
                });

                return deferred.promise;
            }

            $scope.addComposition = addComposition;
            function addComposition(item) {
                if (typeof item.id !== "undefined") {
                    item.open = true;
                    $scope.compositions.push(item);
                }
                console.log(angular.toJson($scope.compositions, true));
                $scope.searchText = "";
            }

            $scope.deleteComposition = deleteComposition;
            function deleteComposition(item) {
                $scope.compositions.splice($scope.compositions.indexOf( item ), 1);
            }

            $scope.toggleFilterCompositions = toggleFilterCompositions;
            function toggleFilterCompositions(){
                $scope.showFilterComposition = !$scope.showFilterComposition;
                if($scope.showFilterComposition){
                    $timeout(function(){
                        angular.element('input[ng-model="filterCompositions"]').focus();
                    });
                }
            }

            angular.element('#post').submit(function(e) {
                $scope.metaboxComposition.$setSubmitted();
                console.log('$scope.metaboxComposition', $scope.metaboxComposition);
                $scope.$digest();

                if($scope.metaboxComposition.$invalid){
                    return false;                   
                }else{
                    return true;
                }
                // if ($scope.post.qty) {}
            }).attr('novalidate', 'novalidate');

            $scope.validateMetabox = validateMetabox;
            function validateMetabox(key){
                var metaboxComposition = $scope.metaboxComposition;
                return metaboxComposition.$submitted
                        && metaboxComposition['componentName_'+key].$invalid; // || metaboxComposition['componentQty_'+key].$invalid;
            }
        }]
    }
}];
},{}],3:[function(require,module,exports){
/* --- metaBoxComponent --- */
module.exports = ['$timeout', function($timeout) {
    return {
        restrict: "E",
        templateUrl: "templates/composition/component-form.html",
        replace: true,
        scope: {
        	components: "=bonsComponents"
        },
        link: function($scope, $element, $attrs) {
        },
        controller: ['$scope', '$http', '$q', function($scope, $http, $q) {
            console.log($scope.components);
            $scope.components= [];
            $scope.querySearch = querySearch;

            function querySearch(query) {
                var deferred = $q.defer();
                $http({
                    url: wc_bonster_admin_meta_boxes.ajax_url,
                    method: 'GET',
                    params: { action: 'woocommerce_json_search_products', security: wc_bonster_admin_meta_boxes.search_products_nonce, term: query }
                }).then(function(response) {
                	var data = [];
                	angular.forEach(response.data, function(item, key){
                		data.push({ productId: key, name: item });
                	});
                    deferred.resolve(data);
                    console.log(data);
                });

                return deferred.promise;
            }

            $scope.addComponent = addComponent;
            function addComponent(item) {
                if (typeof item !== "undefined" && typeof item.productId !== "undefined") {
                	var name = item.name.split('&ndash;');
                    var component = { productId: item.productId, name: name[name.length-1].trim(), ref: name[0].trim(), open: true }
                    $scope.components.push(component);
                }
				console.log(angular.toJson($scope.components, true));
                $scope.searchText = "";
            }

            $scope.deleteComponent = deleteComponent;
            function deleteComponent(component) {
				$scope.components.splice($scope.components.indexOf( component ), 1);
			}

			$scope.toggleFilterComponents = toggleFilterComponents;
			function toggleFilterComponents(){
				$scope.showFilterComponent = !$scope.showFilterComponent;
				if($scope.showFilterComponent){
					$timeout(function(){
						angular.element('input[ng-model="filterComponents"]').focus();
					});
				}
			}

            angular.element('#post').submit(function(e) {
            	$scope.metaboxComponent.$setSubmitted();
            	console.log('$scope.metaboxComponent', $scope.metaboxComponent);
            	$scope.$digest();

            	if($scope.metaboxComponent.$invalid){
            		return false;            		
            	}else{
            		return true;
            	}
            	// if ($scope.post.qty) {}
            }).attr('novalidate', 'novalidate');

            $scope.validateMetabox = validateMetabox;
            function validateMetabox(key){
            	var metaboxComponent = $scope.metaboxComponent;
            	return metaboxComponent.$submitted
            			&& (metaboxComponent['componentName_'+key].$invalid || metaboxComponent['componentQty_'+key].$invalid || metaboxComponent['componentIncrementPrice_'+key].$invalid);
            }
        }]
    }
}];
},{}],4:[function(require,module,exports){
'use strict';

// file automatically generated by angular-template-cache

angular
	.module('bonster.template', [])
	.run(['$templateCache', function($templateCache) {
		$templateCache.put('templates/composition/component-form.html', '<div class="metabox-components" ng-form="metaboxComponent">\n' +
			'    <md-autocomplete flex="grow" md-selected-item="selectedItem" md-search-text-change="searchTextChange(searchText)" md-search-text="searchText" md-selected-item-change="addComponent(item)" md-items="item in querySearch(searchText)" md-item-text="item.name" md-min-length="1" placeholder="Buscar un producto para adicionar a la composición" md-menu-class="autocomplete-compositions-products">\n' +
			'        <md-item-template>\n' +
			'            <div layout="row">\n' +
			'                <div flex="nogrow">\n' +
			'                    <md-icon class="dashicons dashicons-plus-alt"></md-icon>\n' +
			'                </div>\n' +
			'                <div layout="column" style="margin-left: 10px">\n' +
			'                    <div flex ng-bind-html="item.name"></div>\n' +
			'                </div>\n' +
			'            </div>\n' +
			'        </md-item-template>\n' +
			'        <md-not-found>\n' +
			'            No hay productos que coincidan con "{{searchText}}".\n' +
			'            <!-- <a ng-click="ctrl.newState(ctrl.searchText)">Create a new one!</a> -->\n' +
			'        </md-not-found>\n' +
			'    </md-autocomplete>\n' +
			'    <div layout-gt-sm="row" layout-wrap>\n' +
			'        <md-list flex>\n' +
			'            <md-subheader class="md-no-sticky" ng-show="components.length">\n' +
			'                <div class="bons-toolbar" layout="row">\n' +
			'                    <div class="label" flex="auto">Componentes Agregados</div>\n' +
			'                    <div flex="nogrow" style="overflow: hidden">\n' +
			'                        <div layout="row">\n' +
			'                            <!-- <div layout-align="start center"> -->\n' +
			'                            <input ng-show="showFilterComponent" class="input-s1 animation-slide" flex="auto" type="text" ng-model="filterComponents" placeholder="Filtrar Componente...">\n' +
			'                            <!-- </div> -->\n' +
			'                            <!-- <div> -->\n' +
			'                            <!-- <md-icon class="dashicons dashicons-filter"></md-icon> -->\n' +
			'                            <md-button flex="nogrow" class="md-secondary md-mini md-icon-button" ng-click="toggleFilterComponents()">\n' +
			'                                <md-icon class="dashicons dashicons-filter"></md-icon>\n' +
			'                            </md-button>\n' +
			'                            <!-- </div> -->\n' +
			'                        </div>\n' +
			'                    </div>\n' +
			'                </div>\n' +
			'            </md-subheader>\n' +
			'            <md-list-item class="md-3-line md-long-text" ng-repeat="(key, component) in components | filter:filterComponents" ng-click="null" ng-class="{open: component.open}">\n' +
			'                <!-- <img ng-src="{{item.face}}?{{$index}}" class="md-avatar" alt="{{item.who}}" /> -->\n' +
			'                <div class="md-list-item-text">\n' +
			'                    <div layout="row">\n' +
			'                        <div flex="auto">\n' +
			'                            <h3>\n' +
			'    			            	<span>\n' +
			'    			            		{{ component.name }}\n' +
			'    			            	</span>\n' +
			'    			            	<!-- <button type="button" class="remove_row button">Eliminar</button> -->\n' +
			'    			            </h3>\n' +
			'                            <div class="alert alert-error" ng-show="validateMetabox(key)">Hay campos invalidos en este componente!</div>\n' +
			'                            <p>{{ component.ref }}</p>\n' +
			'                        </div>\n' +
			'                        <md-button ng-click="component.open = !component.open" class="md-fab md-mini md-primary" flex="nogrow">\n' +
			'                            <md-icon class="dashicons" ng-class="{\'dashicons-arrow-down-alt\': !component.open, \'dashicons-arrow-up-alt\': component.open}"></md-icon>\n' +
			'                        </md-button>\n' +
			'                        <md-button ng-click="deleteComponent(component)" class="md-fab md-mini md-accent" flex="nogrow">\n' +
			'                            <md-icon class="dashicons dashicons-trash"></md-icon>\n' +
			'                        </md-button>\n' +
			'                    </div>\n' +
			'                    <div layout="row" ng-show="component.open">\n' +
			'                        <md-input-container flex="33">\n' +
			'                            <label>Nombre</label>\n' +
			'                            <input required name="componentName_{{key}}" ng-model="component.name">\n' +
			'                            <div ng-messages="metaboxComponent[\'componentName_\' + key].$error">\n' +
			'                                <div ng-messages-include="error-messages"></div>\n' +
			'                            </div>\n' +
			'                        </md-input-container>\n' +
			'                        <md-input-container flex="33">\n' +
			'                            <md-tooltip md-direction="top">\n' +
			'                                Cantidad en la unidad de medida predeterminada del Producto\n' +
			'                            </md-tooltip>\n' +
			'                            <label>Cantidad</label>\n' +
			'                            <input required name="componentQty_{{key}}" ng-model="component.qty" role="alert">\n' +
			'                            <div ng-messages="metaboxComponent[\'componentQty_\' + key].$error">\n' +
			'                                <div ng-messages-include="error-messages"></div>\n' +
			'                            </div>\n' +
			'                        </md-input-container>\n' +
			'                        <md-input-container flex="33">\n' +
			'                            <label>Inc. Precio en adición</label>\n' +
			'                            <input required name="componentIncrementPrice_{{key}}" ng-model="component.incrementPrice">\n' +
			'                            <div ng-messages="metaboxComponent[\'componentIncrementPrice_\' + key].$error" role="alert">\n' +
			'                                <div ng-messages-include="error-messages"></div>\n' +
			'                            </div>\n' +
			'                        </md-input-container>\n' +
			'                    </div>\n' +
			'                </div>\n' +
			'            </md-list-item>\n' +
			'        </md-list>\n' +
			'    </div>\n' +
			'    <!-- <pre>{{ metaboxComponents | json }}</pre> -->\n' +
			'    <input type="hidden" name="wcBonsterComponents" value="{{components}}">\n' +
			'    <script type="text/ng-template" id="error-messages">\n' +
			'        <div ng-message="required">Campo requerido.</div>\n' +
			'        <!-- <div ng-message="minlength">This field is too short</div> -->\n' +
			'        <!-- <div ng-message="md-maxlength">The description must be less than 30 characters long.</div> -->\n' +
			'    </script>\n' +
			'</div>');

		$templateCache.put('templates/front/build-product-composite.html', '<div class="build-product-composite">\n' +
			'    <div class="topnav" bb-sticky>\n' +
			'        <div class="info-cart">\n' +
			'            <div class="col baseprice">\n' +
			'                <span class="bons-label">Pedido</span>\n' +
			'                <span class="value">$ <span ng-bind="vm.cart.basePrice"></span></span>\n' +
			'            </div>\n' +
			'            <div class="col addprice">\n' +
			'                <span class="bons-label">Adicionales</span>\n' +
			'                <span class="value">$ <span ng-bind="vm.cart.additionalPrice"></span></span>\n' +
			'            </div>\n' +
			'            <div class="col total">\n' +
			'                <span class="bons-label">Total</span>\n' +
			'                <span class="value">$ <span ng-bind="vm.cart.orderTotal"></span></span>\n' +
			'            </div>\n' +
			'            <div class="col btn-minicart">\n' +
			'                <a ng-click="showMinicart = !showMinicart" href="" class="btn-toggle-minicart">\n' +
			'                    <span ng-bind="showMinicart ? \'Cerrar\':\'Abrir\'"></span> Carrito <i class="glyphicon" ng-class="{\'glyphicon-chevron-down\': !showMinicart, \'glyphicon-chevron-up\': showMinicart}"></i>\n' +
			'                </a>\n' +
			'            </div>\n' +
			'        </div>\n' +
			'        <minicart ng-if="showMinicart" class="jg-woo-minicart bons-fade with-leave"></minicart>\n' +
			'        <div class="nav-cart">\n' +
			'            <!-- <div class="responsive-nav visible-xs-block">\n' +
			'				<ng-include src="\'templates/front/_part-menu-selection.html\'" scope="" onload=""></ng-include>\n' +
			'			</div> -->\n' +
			'            <!-- <div class="col step">\n' +
			'				Paso <span ng-bind="vm.step+1"></span> de <span ng-bind="vm.compositionsBase.length"></span> <i class="glyphicon glyphicon-chevron-right"></i> <span ng-bind="vm.compositionActive.name | limitTo:10" title="{{ vm.compositionActive.name }}"></span>\n' +
			'			</div>\n' +
			'			<div class="col navmenu">\n' +
			'				<ng-include src="\'templates/front/_part-menu-selection.html\'" scope="" onload=""></ng-include>\n' +
			'			</div> -->\n' +
			'            <ul class="wrap-btns">\n' +
			'            	<li class="step">\n' +
			'            		Paso <span ng-bind="vm.step+1"></span> de <span ng-bind="vm.compositionsBase.length"></span> <i class="glyphicon glyphicon-chevron-right"></i> <span ng-bind="vm.compositionActive.name | limitTo:10" title="{{ vm.compositionActive.name }}"></span>\n' +
			'            	</li>\n' +
			'                <li class="dropdown-selected" hide-on-out-click="showMenuSelected">\n' +
			'                    <a href="" class="menu-selected bons-fade" ng-click="showMenuSelected = !showMenuSelected">\n' +
			'						Tú selección <i class="glyphicon glyphicon-chevron-down"></i>\n' +
			'					</a>\n' +
			'                    <ul class="jg-dropdown bons-fade with-leave" ng-if="showMenuSelected && vm.cntCompositionsInCart > 0">\n' +
			'                        <li ng-repeat="item in vm.compositionsBase" ng-class="{selected: item==vm.compositionActive}" ng-if="vm.isCompositionSelected(item)">\n' +
			'                            <a href="" ng-bind="item.name" ng-click="vm.goStep(item)"></a>\n' +
			'                        </li>\n' +
			'                    </ul>\n' +
			'                </li>\n' +
			'                <li class="next" ng-if="vm.compositionNext && !vm.isReadyForOrder">\n' +
			'                    <a href="" class="bons-fade with-leave" ng-click="vm.nextStep()">\n' +
			'                        <span ng-bind="vm.compositionNext.name"></span> <i class="glyphicon glyphicon-chevron-right"></i>\n' +
			'                    </a>\n' +
			'                </li>\n' +
			'                <li ng-if="vm.isReadyForOrder" class="additions dropdown-selected" hide-on-out-click="showMenuAdditional">\n' +
			'                    <a href="" class="menu-selected bons-fade" ng-click="showMenuAdditional = !showMenuAdditional">\n' +
			'                        <i class="glyphicon glyphicon-plus-sign"></i> Adiciones <i class="glyphicon glyphicon-chevron-down"></i>\n' +
			'                    </a>\n' +
			'                    <ul class="jg-dropdown bons-fade with-leave" ng-if="showMenuAdditional">\n' +
			'                        <li ng-repeat="item in vm.compositionsAdditional" ng-class="{selected: item==vm.compositionActive}">\n' +
			'                            <a href="" ng-bind="item.name" ng-click="vm.goStep(item)"></a>\n' +
			'                        </li>\n' +
			'                    </ul>\n' +
			'                </li>\n' +
			'                <li class="confirm" ng-show="vm.isReadyForOrder">\n' +
			'                    <a href="" class="bons-fade with-leave" ng-click="showMinicart = true">\n' +
			'                        <span>Confirmar Pedido</span> <i class="glyphicon glyphicon-chevron-right"></i>\n' +
			'                    </a>\n' +
			'                </li>\n' +
			'            </ul>\n' +
			'        </div>\n' +
			'    </div>\n' +
			'    <div class="composition-active">\n' +
			'        <div class="row">\n' +
			'            <div class="component col-md-3 col-sm-4 col-xs-6 bons-fade" ng-repeat="component in vm.compositionActive.components" ng-class="{selected: component.selected, \'without-shadow\': vm.compositionActive.isAdditional}">\n' +
			'                <div class="wrap-img">\n' +
			'                    <img ng-click="vm.selectComponent(component)" class="img-responsive" ng-src="{{ component.img[0] }}" alt="{{ component.name }}">\n' +
			'                    <i ng-if="component.selected && !vm.compositionActive.isAdditional" class="check glyphicon glyphicon-check bons-fade"></i>\n' +
			'                    <i ng-if="component.selected && vm.compositionActive.isAdditional" class="check-additional glyphicon glyphicon-ok-sign bons-fade"></i>\n' +
			'                    <input ng-if="vm.compositionActive.isAdditional && component.selected" ng-model="component.qtyOrder" ng-change="vm.changeQtyOrder(component)" ng-click="return;" class="qty-order bons-fade with-leave" type="number" min="1">\n' +
			'                </div>\n' +
			'                <div ng-click="vm.selectComponent(component)" class="name" ng-bind="component.name" title="{{ component.name }}"></div>\n' +
			'            </div>\n' +
			'        </div>\n' +
			'    </div>\n' +
			'    <!-- <pre>{{ vm.cart | json:4 }}</pre> -->\n' +
			'    <input name="bons_data_order" type="hidden" value="{{ vm.cart }}">\n' +
			'</div>');

		$templateCache.put('templates/front/minicart.html', '<div class="jg-minicart">\n' +
			'	<div ng-if="buildCtrl.cntCompositionsInCart > 0">\n' +
			'	    <table class="table basic-items">\n' +
			'	        <thead>\n' +
			'	            <tr>\n' +
			'	                <th>Pedido</th>\n' +
			'	                <th class="text-center">Cantidad</th>\n' +
			'	                <th class="text-right">Precio</th>\n' +
			'	            </tr>\n' +
			'	        </thead>\n' +
			'	        <tbody>\n' +
			'	            <tr ng-repeat="(key, component) in buildCtrl.cart.basicItems">\n' +
			'	                <td class="item-image">\n' +
			'	                	<div class="item">\n' +
			'	                		<img class="img-responsive" ng-src="{{ vm.getImage(component) }}" alt="{{ component.name }}">\n' +
			'	                    	<div class="bons-label" ng-bind="component.name | limitTo:10" title="{{component.name}}"></div>\n' +
			'	                	</div>\n' +
			'	                </td>\n' +
			'	                <td class="text-center">\n' +
			'	                    <span class="qty" ng-bind="component.qtyOrder"></span>\n' +
			'	                </td>\n' +
			'	                <td class="price text-right">\n' +
			'	                    $ <span ng-bind="component.price"></span>\n' +
			'	                </td>\n' +
			'	            </tr>\n' +
			'	        </tbody>\n' +
			'	    </table>\n' +
			'	    <table class="table additional-items">\n' +
			'	        <thead>\n' +
			'	            <tr class="sub-header">\n' +
			'	                <th class="text-center" colspan="4">Adicionales</th>\n' +
			'	            </tr>\n' +
			'	        </thead>\n' +
			'	        <tbody>\n' +
			'	            <tr ng-repeat="(key, composition) in buildCtrl.cart.additionalItems" ng-if="buildCtrl.cntCompositionsAddInCart > 0">\n' +
			'	                <td class="table-inside" colspan="4">\n' +
			'	                    <table class="table">\n' +
			'	                        <thead>\n' +
			'					            <tr ng-if="vm.isFirstItem(key)">\n' +
			'					                <th width="25%">Adición</th>\n' +
			'					                <th width="25%" class="text-center">Cantidad</th>\n' +
			'					                <th width="25%" class="text-right">Precio</th>\n' +
			'					                <th width="25%" class="text-center">Eliminar</th>\n' +
			'					            </tr>\n' +
			'	                            <tr>\n' +
			'	                            	<td colspan="4">\n' +
			'		                            	<h2 ng-bind="vm.getCompositionName(key)" class="entry-title"></h2>\n' +
			'		                            </td>\n' +
			'	                            </tr>\n' +
			'	                        </thead>\n' +
			'	                        <tbody>\n' +
			'	                            <tr class="bons-fade with-leave" ng-repeat="(keyComp, component) in composition">\n' +
			'					                <td width="25%" class="item-image">\n' +
			'					                	<div class="item">\n' +
			'					                		<img class="img-responsive" ng-src="{{ vm.getImage(component) }}" alt="{{ component.name }}">\n' +
			'					                    	<div class="bons-label" ng-bind="component.name | limitTo:10" title="{{component.name}}"></div>\n' +
			'					                	</div>\n' +
			'					                </td>\n' +
			'					                <td class="text-center">\n' +
			'					                    <span class="qty" ng-bind="component.qtyOrder"></span>\n' +
			'	                                    <!-- <input ng-model="component.qtyOrder" type="number"> -->\n' +
			'					                </td>\n' +
			'					                <td class="price text-right">\n' +
			'					                    $ <span ng-bind="component.price"></span>\n' +
			'					                </td>\n' +
			'	                                <td width="25%" class="btn-remove text-center">\n' +
			'	                                	<a ng-click="vm.removeItem(component, key)" href="" class="btn">\n' +
			'											<i class="glyphicon glyphicon-remove-sign"></i>\n' +
			'	                                	</a>\n' +
			'	                                </td>\n' +
			'	                            </tr>\n' +
			'	                        </tbody>\n' +
			'	                    </table>\n' +
			'	                </td>\n' +
			'	            </tr>\n' +
			'	            <tr ng-if="buildCtrl.cntCompositionsAddInCart <= 0">\n' +
			'	            	<td colspan="4">\n' +
			'						<div class="cart-empty">\n' +
			'							No tiene adiciones en el carrito de compras.\n' +
			'						</div>\n' +
			'	            	</td>\n' +
			'	            </tr>\n' +
			'	        </tbody>\n' +
			'	    </table>\n' +
			'\n' +
			'	    <button type="submit" class="ng-submit-minicart bons-animate-bg btn btn-warning">Enviar Orden/Llenar Solicitud</button>\n' +
			'	</div>\n' +
			'	<div class="cart-empty" ng-if="buildCtrl.cntCompositionsInCart <= 0">\n' +
			'		No ha agregado items al carrito de compras.\n' +
			'	</div>\n' +
			'</div>');

		$templateCache.put('templates/woocommerce/meta-box-compositions.html', '<div class="meta-box-composition" ng-form="metaboxComposition">\n' +
			'	<md-autocomplete flex="grow" md-selected-item="selectedItem" md-search-text-change="searchTextChange(searchText)" md-search-text="searchText" md-selected-item-change="addComposition(item)" md-items="item in querySearch(searchText)" md-item-text="item.name" md-min-length="1" placeholder="Buscar una Composición para adicionar al Producto" md-menu-class="autocomplete-compositions-products">\n' +
			'        <md-item-template>\n' +
			'            <div layout="row">\n' +
			'                <div flex="nogrow">\n' +
			'                    <md-icon class="dashicons dashicons-plus-alt"></md-icon>\n' +
			'                </div>\n' +
			'                <div layout="column" style="margin-left: 10px">\n' +
			'                    <div flex ng-bind-html="item.name"></div>\n' +
			'                </div>\n' +
			'            </div>\n' +
			'        </md-item-template>\n' +
			'        <md-not-found>\n' +
			'            No hay composiciones que coincidan con "{{searchText}}".\n' +
			'            <!-- <a ng-click="ctrl.newState(ctrl.searchText)">Create a new one!</a> -->\n' +
			'        </md-not-found>\n' +
			'    </md-autocomplete>\n' +
			'\n' +
			'\n' +
			'    <div layout-gt-sm="row" layout-wrap>\n' +
			'        <md-list flex>\n' +
			'            <md-subheader class="md-no-sticky" ng-show="compositions.length">\n' +
			'                <div class="bons-toolbar" layout="row">\n' +
			'                    <div class="label" flex="auto">Composiciones Agregadas</div>\n' +
			'                    <div flex="nogrow" style="overflow: hidden">\n' +
			'                        <div layout="row">\n' +
			'                            <!-- <div layout-align="start center"> -->\n' +
			'                            <input ng-show="showFilterComposition" class="input-s1 animation-slide" flex="auto" type="text" ng-model="filterCompositions" placeholder="Filtrar Composición...">\n' +
			'                            <!-- </div> -->\n' +
			'                            <!-- <div> -->\n' +
			'                            <!-- <md-icon class="dashicons dashicons-filter"></md-icon> -->\n' +
			'                            <md-button flex="nogrow" class="md-secondary md-mini md-icon-button" ng-click="toggleFilterCompositions()">\n' +
			'                                <md-icon class="dashicons dashicons-filter"></md-icon>\n' +
			'                            </md-button>\n' +
			'                            <!-- </div> -->\n' +
			'                        </div>\n' +
			'                    </div>\n' +
			'                </div>\n' +
			'            </md-subheader>\n' +
			'            <md-list-item class="md-3-line md-long-text" ng-repeat="(key, composition) in compositions | filter:filterCompositions" ng-click="null" ng-class="{open: composition.open}">\n' +
			'                <!-- <img ng-src="{{item.face}}?{{$index}}" class="md-avatar" alt="{{item.who}}" /> -->\n' +
			'                <div class="md-list-item-text">\n' +
			'                    <div layout="row">\n' +
			'                        <div flex>\n' +
			'                            <md-input-container class="md-block">\n' +
			'                                <label>Nombre</label>\n' +
			'                                <input required name="compositionName_{{key}}" ng-model="composition.name">\n' +
			'                                <div ng-messages="metaboxComposition[\'compositionName_\' + key].$error">\n' +
			'                                    <div ng-messages-include="error-messages"></div>\n' +
			'                                </div>\n' +
			'                            </md-input-container>\n' +
			'                            <!-- <div class="alert alert-error" ng-show="validateMetabox(key)">Hay campos invalidos en esta composición!</div> -->\n' +
			'                            <!-- <p>{{ composition.ref }}</p> -->\n' +
			'                        </div>\n' +
			'                        <div flex="nogrow" flex-offset="5">\n' +
			'                            <md-switch ng-model="composition.isAdditional" aria-label="¿Adicional?">¿Adicional?</md-switch>\n' +
			'                        </div>\n' +
			'                        <!-- <md-button ng-click="composition.open = !composition.open" class="md-fab md-mini md-primary" flex="nogrow">\n' +
			'                            <md-icon class="dashicons" ng-class="{\'dashicons-arrow-down-alt\': !composition.open, \'dashicons-arrow-up-alt\': composition.open}"></md-icon>\n' +
			'                        </md-button> -->\n' +
			'                        <md-button ng-click="deleteComposition(composition)" class="md-fab md-mini md-accent" flex="nogrow" flex-offset="5">\n' +
			'                            <md-icon class="dashicons dashicons-trash"></md-icon>\n' +
			'                        </md-button>\n' +
			'                    </div>\n' +
			'                    <!-- <div layout="row" ng-show="composition.open">\n' +
			'                        <md-input-container flex="50">\n' +
			'                            <label>Nombre</label>\n' +
			'                            <input required name="compositionName_{{key}}" ng-model="composition.name">\n' +
			'                            <div ng-messages="metaboxComposition[\'compositionName_\' + key].$error">\n' +
			'                                <div ng-messages-include="error-messages"></div>\n' +
			'                            </div>\n' +
			'                        </md-input-container>\n' +
			'                        \n' +
			'                        <md-input-container flex="50">\n' +
			'                            <label>Inc. Precio en adición</label>\n' +
			'                            <input required name="compositionIncrementPrice_{{key}}" ng-model="composition.incrementPrice">\n' +
			'                            <div ng-messages="metaboxComposition[\'compositionIncrementPrice_\' + key].$error" role="alert">\n' +
			'                                <div ng-messages-include="error-messages"></div>\n' +
			'                            </div>\n' +
			'                        </md-input-container>\n' +
			'                    </div> -->\n' +
			'                </div>\n' +
			'            </md-list-item>\n' +
			'        </md-list>\n' +
			'    </div>\n' +
			'    <!-- <pre>{{ metaboxComponents | json }}</pre> -->\n' +
			'    <input type="hidden" name="wcBonsterCompositions" value="{{compositions}}">\n' +
			'    <script type="text/ng-template" id="error-messages">\n' +
			'        <div ng-message="required">Campo requerido.</div>\n' +
			'        <!-- <div ng-message="minlength">This field is too short</div> -->\n' +
			'        <!-- <div ng-message="md-maxlength">The description must be less than 30 characters long.</div> -->\n' +
			'    </script>\n' +
			'\n' +
			'	<!-- <div class="options_group">\n' +
			'		<p class="form-field">HOLA JJ</p>\n' +
			'	</div> -->\n' +
			'</div>');
	}
]);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2RpcmVjdGl2ZXMvY29tcG9zaXRlV29vY29tbWVyY2UuanMiLCJzcmMvZGlyZWN0aXZlcy9tZXRhQm94Q29tcG9uZW50LmpzIiwic3JjL3RlbXBsYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUoJy4vdGVtcGxhdGUnKTtcclxudmFyIHdjQm9uc3RlckNvbXBvc2l0aW9ucyA9IGFuZ3VsYXIubW9kdWxlKCd3Y0JvbnN0ZXJDb21wb3NpdGlvbnMnLCBbJ25nU2FuaXRpemUnLCAnbmdBbmltYXRlJywgJ25nTWVzc2FnZXMnLCAnbmdNYXRlcmlhbCcsICdib25zdGVyLnRlbXBsYXRlJ10pO1xyXG5cclxud2NCb25zdGVyQ29tcG9zaXRpb25zLmNvbmZpZyhmdW5jdGlvbigkbWRUaGVtaW5nUHJvdmlkZXIpIHtcclxuICAgICRtZFRoZW1pbmdQcm92aWRlci50aGVtZSgnZGVmYXVsdCcpXHJcbiAgICAgICAgLnByaW1hcnlQYWxldHRlKCdsaWdodC1ibHVlJywge1xyXG4gICAgICAgICAgICAnZGVmYXVsdCc6ICc2MDAnIC8vIHVzZSBzaGFkZSAyMDAgZm9yIGRlZmF1bHQsIGFuZCBrZWVwIGFsbCBvdGhlciBzaGFkZXMgdGhlIHNhbWVcclxuICAgICAgICB9KVxyXG4gICAgICAgIC8vIElmIHlvdSBzcGVjaWZ5IGxlc3MgdGhhbiBhbGwgb2YgdGhlIGtleXMsIGl0IHdpbGwgaW5oZXJpdCBmcm9tIHRoZVxyXG4gICAgICAgIC8vIGRlZmF1bHQgc2hhZGVzXHJcbiAgICAgICAgLmFjY2VudFBhbGV0dGUoJ3JlZCcsIHtcclxuICAgICAgICAgICAgJ2RlZmF1bHQnOiAnQTcwMCcsIC8vIGJ5IGRlZmF1bHQgdXNlIHNoYWRlIDQwMCBmcm9tIHRoZSBwaW5rIHBhbGV0dGUgZm9yIHByaW1hcnkgaW50ZW50aW9uc1xyXG4gICAgICAgICAgICAnaHVlLTEnOiAnQTQwMCcsIC8vIHVzZSBzaGFkZSAxMDAgZm9yIHRoZSA8Y29kZT5tZC1odWUtMTwvY29kZT4gY2xhc3NcclxuICAgICAgICAgICAgJ2h1ZS0yJzogJ0EyMDAnLCAvLyB1c2Ugc2hhZGUgNjAwIGZvciB0aGUgPGNvZGU+bWQtaHVlLTI8L2NvZGU+IGNsYXNzXHJcbiAgICAgICAgICAgICdodWUtMyc6ICdBMTAwJyAvLyB1c2Ugc2hhZGUgQTEwMCBmb3IgdGhlIDxjb2RlPm1kLWh1ZS0zPC9jb2RlPiBjbGFzc1xyXG4gICAgICAgIH0pO1xyXG59KTtcclxuXHJcbndjQm9uc3RlckNvbXBvc2l0aW9ucy5kaXJlY3RpdmUoJ21ldGFCb3hDb21wb25lbnQnLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvbWV0YUJveENvbXBvbmVudCcpKTtcclxud2NCb25zdGVyQ29tcG9zaXRpb25zLmRpcmVjdGl2ZSgnY29tcG9zaXRlV29vY29tbWVyY2UnLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvY29tcG9zaXRlV29vY29tbWVyY2UnKSk7XHJcblxyXG5hbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGVsID0gXCJib2R5XCI7XHJcbiAgICBpZiggdHlwZW9mIHdjX2JvbnN0ZXJfYWRtaW5fbWV0YV9ib3hlcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3Y19ib25zdGVyX2FkbWluX21ldGFfYm94ZXMuaGFzT3duUHJvcGVydHkoJ2VsZW1lbnRfbmdhcHBfYW5ndWxhcmpzJykgKXtcclxuICAgICAgICBlbCA9IHdjX2JvbnN0ZXJfYWRtaW5fbWV0YV9ib3hlcy5lbGVtZW50X25nYXBwX2FuZ3VsYXJqcztcclxuICAgIH1cclxuICAgIGFuZ3VsYXIuYm9vdHN0cmFwKCBhbmd1bGFyLmVsZW1lbnQoZWwpLCBbJ3djQm9uc3RlckNvbXBvc2l0aW9ucyddICk7XHJcbn0pO1xyXG4iLCIvKiAtLS0gY29tcG9zaXRlV29vY29tbWVyY2UgLS0tICovXHJcbm1vZHVsZS5leHBvcnRzID0gWyckdGltZW91dCcsIGZ1bmN0aW9uKCR0aW1lb3V0KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiBcIkVcIixcclxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJ0ZW1wbGF0ZXMvd29vY29tbWVyY2UvbWV0YS1ib3gtY29tcG9zaXRpb25zLmh0bWxcIixcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgXHRjb21wb3NpdGlvbnM6IFwiPWJvbnNDb21wb3NpdGlvbnNcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckaHR0cCcsICckcScsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRxKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jb21wb3NpdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgJHNjb3BlLnF1ZXJ5U2VhcmNoID0gcXVlcnlTZWFyY2g7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBxdWVyeVNlYXJjaChxdWVyeSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICRodHRwKHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IHdjX2JvbnN0ZXJfYWRtaW5fbWV0YV9ib3hlcy5hamF4X3VybCxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczogeyBhY3Rpb246ICd3Y19ib25zdGVyX3NlYXJjaF9jb21wb3NpdGlvbnMnLCBzZWN1cml0eTogd2NfYm9uc3Rlcl9hZG1pbl9tZXRhX2JveGVzLnNlYXJjaF9jb21wb3NpdGlvbnNfbm9uY2UsIHRlcm06IHF1ZXJ5IH1cclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChyZXNwb25zZS5kYXRhLCBmdW5jdGlvbihpdGVtLCBrZXkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goeyBpZDogaXRlbS5JRCwgbmFtZTogaXRlbS5wb3N0X3RpdGxlIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmFkZENvbXBvc2l0aW9uID0gYWRkQ29tcG9zaXRpb247XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFkZENvbXBvc2l0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbS5pZCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ub3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbXBvc2l0aW9ucy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYW5ndWxhci50b0pzb24oJHNjb3BlLmNvbXBvc2l0aW9ucywgdHJ1ZSkpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNlYXJjaFRleHQgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuZGVsZXRlQ29tcG9zaXRpb24gPSBkZWxldGVDb21wb3NpdGlvbjtcclxuICAgICAgICAgICAgZnVuY3Rpb24gZGVsZXRlQ29tcG9zaXRpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbXBvc2l0aW9ucy5zcGxpY2UoJHNjb3BlLmNvbXBvc2l0aW9ucy5pbmRleE9mKCBpdGVtICksIDEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUudG9nZ2xlRmlsdGVyQ29tcG9zaXRpb25zID0gdG9nZ2xlRmlsdGVyQ29tcG9zaXRpb25zO1xyXG4gICAgICAgICAgICBmdW5jdGlvbiB0b2dnbGVGaWx0ZXJDb21wb3NpdGlvbnMoKXtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zaG93RmlsdGVyQ29tcG9zaXRpb24gPSAhJHNjb3BlLnNob3dGaWx0ZXJDb21wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIGlmKCRzY29wZS5zaG93RmlsdGVyQ29tcG9zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgnaW5wdXRbbmctbW9kZWw9XCJmaWx0ZXJDb21wb3NpdGlvbnNcIl0nKS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJyNwb3N0Jykuc3VibWl0KGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5tZXRhYm94Q29tcG9zaXRpb24uJHNldFN1Ym1pdHRlZCgpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJyRzY29wZS5tZXRhYm94Q29tcG9zaXRpb24nLCAkc2NvcGUubWV0YWJveENvbXBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kZGlnZXN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoJHNjb3BlLm1ldGFib3hDb21wb3NpdGlvbi4kaW52YWxpZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gaWYgKCRzY29wZS5wb3N0LnF0eSkge31cclxuICAgICAgICAgICAgfSkuYXR0cignbm92YWxpZGF0ZScsICdub3ZhbGlkYXRlJyk7XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUudmFsaWRhdGVNZXRhYm94ID0gdmFsaWRhdGVNZXRhYm94O1xyXG4gICAgICAgICAgICBmdW5jdGlvbiB2YWxpZGF0ZU1ldGFib3goa2V5KXtcclxuICAgICAgICAgICAgICAgIHZhciBtZXRhYm94Q29tcG9zaXRpb24gPSAkc2NvcGUubWV0YWJveENvbXBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ldGFib3hDb21wb3NpdGlvbi4kc3VibWl0dGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIG1ldGFib3hDb21wb3NpdGlvblsnY29tcG9uZW50TmFtZV8nK2tleV0uJGludmFsaWQ7IC8vIHx8IG1ldGFib3hDb21wb3NpdGlvblsnY29tcG9uZW50UXR5Xycra2V5XS4kaW52YWxpZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1dXHJcbiAgICB9XHJcbn1dOyIsIi8qIC0tLSBtZXRhQm94Q29tcG9uZW50IC0tLSAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IFsnJHRpbWVvdXQnLCBmdW5jdGlvbigkdGltZW91dCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogXCJFXCIsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwidGVtcGxhdGVzL2NvbXBvc2l0aW9uL2NvbXBvbmVudC1mb3JtLmh0bWxcIixcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgXHRjb21wb25lbnRzOiBcIj1ib25zQ29tcG9uZW50c1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRodHRwJywgJyRxJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJHEpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmNvbXBvbmVudHMpO1xyXG4gICAgICAgICAgICAkc2NvcGUuY29tcG9uZW50cz0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5xdWVyeVNlYXJjaCA9IHF1ZXJ5U2VhcmNoO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcXVlcnlTZWFyY2gocXVlcnkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiB3Y19ib25zdGVyX2FkbWluX21ldGFfYm94ZXMuYWpheF91cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHsgYWN0aW9uOiAnd29vY29tbWVyY2VfanNvbl9zZWFyY2hfcHJvZHVjdHMnLCBzZWN1cml0eTogd2NfYm9uc3Rlcl9hZG1pbl9tZXRhX2JveGVzLnNlYXJjaF9wcm9kdWN0c19ub25jZSwgdGVybTogcXVlcnkgfVxyXG4gICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgXHR2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgXHRhbmd1bGFyLmZvckVhY2gocmVzcG9uc2UuZGF0YSwgZnVuY3Rpb24oaXRlbSwga2V5KXtcclxuICAgICAgICAgICAgICAgIFx0XHRkYXRhLnB1c2goeyBwcm9kdWN0SWQ6IGtleSwgbmFtZTogaXRlbSB9KTtcclxuICAgICAgICAgICAgICAgIFx0fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuYWRkQ29tcG9uZW50ID0gYWRkQ29tcG9uZW50O1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBhZGRDb21wb25lbnQoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpdGVtICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBpdGVtLnByb2R1Y3RJZCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICAgICAgXHR2YXIgbmFtZSA9IGl0ZW0ubmFtZS5zcGxpdCgnJm5kYXNoOycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSB7IHByb2R1Y3RJZDogaXRlbS5wcm9kdWN0SWQsIG5hbWU6IG5hbWVbbmFtZS5sZW5ndGgtMV0udHJpbSgpLCByZWY6IG5hbWVbMF0udHJpbSgpLCBvcGVuOiB0cnVlIH1cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblx0XHRcdFx0Y29uc29sZS5sb2coYW5ndWxhci50b0pzb24oJHNjb3BlLmNvbXBvbmVudHMsIHRydWUpKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zZWFyY2hUZXh0ID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmRlbGV0ZUNvbXBvbmVudCA9IGRlbGV0ZUNvbXBvbmVudDtcclxuICAgICAgICAgICAgZnVuY3Rpb24gZGVsZXRlQ29tcG9uZW50KGNvbXBvbmVudCkge1xyXG5cdFx0XHRcdCRzY29wZS5jb21wb25lbnRzLnNwbGljZSgkc2NvcGUuY29tcG9uZW50cy5pbmRleE9mKCBjb21wb25lbnQgKSwgMSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdCRzY29wZS50b2dnbGVGaWx0ZXJDb21wb25lbnRzID0gdG9nZ2xlRmlsdGVyQ29tcG9uZW50cztcclxuXHRcdFx0ZnVuY3Rpb24gdG9nZ2xlRmlsdGVyQ29tcG9uZW50cygpe1xyXG5cdFx0XHRcdCRzY29wZS5zaG93RmlsdGVyQ29tcG9uZW50ID0gISRzY29wZS5zaG93RmlsdGVyQ29tcG9uZW50O1xyXG5cdFx0XHRcdGlmKCRzY29wZS5zaG93RmlsdGVyQ29tcG9uZW50KXtcclxuXHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdGFuZ3VsYXIuZWxlbWVudCgnaW5wdXRbbmctbW9kZWw9XCJmaWx0ZXJDb21wb25lbnRzXCJdJykuZm9jdXMoKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCcjcG9zdCcpLnN1Ym1pdChmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIFx0JHNjb3BlLm1ldGFib3hDb21wb25lbnQuJHNldFN1Ym1pdHRlZCgpO1xyXG4gICAgICAgICAgICBcdGNvbnNvbGUubG9nKCckc2NvcGUubWV0YWJveENvbXBvbmVudCcsICRzY29wZS5tZXRhYm94Q29tcG9uZW50KTtcclxuICAgICAgICAgICAgXHQkc2NvcGUuJGRpZ2VzdCgpO1xyXG5cclxuICAgICAgICAgICAgXHRpZigkc2NvcGUubWV0YWJveENvbXBvbmVudC4kaW52YWxpZCl7XHJcbiAgICAgICAgICAgIFx0XHRyZXR1cm4gZmFsc2U7ICAgICAgICAgICAgXHRcdFxyXG4gICAgICAgICAgICBcdH1lbHNle1xyXG4gICAgICAgICAgICBcdFx0cmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIFx0fVxyXG4gICAgICAgICAgICBcdC8vIGlmICgkc2NvcGUucG9zdC5xdHkpIHt9XHJcbiAgICAgICAgICAgIH0pLmF0dHIoJ25vdmFsaWRhdGUnLCAnbm92YWxpZGF0ZScpO1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLnZhbGlkYXRlTWV0YWJveCA9IHZhbGlkYXRlTWV0YWJveDtcclxuICAgICAgICAgICAgZnVuY3Rpb24gdmFsaWRhdGVNZXRhYm94KGtleSl7XHJcbiAgICAgICAgICAgIFx0dmFyIG1ldGFib3hDb21wb25lbnQgPSAkc2NvcGUubWV0YWJveENvbXBvbmVudDtcclxuICAgICAgICAgICAgXHRyZXR1cm4gbWV0YWJveENvbXBvbmVudC4kc3VibWl0dGVkXHJcbiAgICAgICAgICAgIFx0XHRcdCYmIChtZXRhYm94Q29tcG9uZW50Wydjb21wb25lbnROYW1lXycra2V5XS4kaW52YWxpZCB8fCBtZXRhYm94Q29tcG9uZW50Wydjb21wb25lbnRRdHlfJytrZXldLiRpbnZhbGlkIHx8IG1ldGFib3hDb21wb25lbnRbJ2NvbXBvbmVudEluY3JlbWVudFByaWNlXycra2V5XS4kaW52YWxpZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XVxyXG4gICAgfVxyXG59XTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIGZpbGUgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgYnkgYW5ndWxhci10ZW1wbGF0ZS1jYWNoZVxuXG5hbmd1bGFyXG5cdC5tb2R1bGUoJ2JvbnN0ZXIudGVtcGxhdGUnLCBbXSlcblx0LnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcblx0XHQkdGVtcGxhdGVDYWNoZS5wdXQoJ3RlbXBsYXRlcy9jb21wb3NpdGlvbi9jb21wb25lbnQtZm9ybS5odG1sJywgJzxkaXYgY2xhc3M9XCJtZXRhYm94LWNvbXBvbmVudHNcIiBuZy1mb3JtPVwibWV0YWJveENvbXBvbmVudFwiPlxcbicgK1xuXHRcdFx0JyAgICA8bWQtYXV0b2NvbXBsZXRlIGZsZXg9XCJncm93XCIgbWQtc2VsZWN0ZWQtaXRlbT1cInNlbGVjdGVkSXRlbVwiIG1kLXNlYXJjaC10ZXh0LWNoYW5nZT1cInNlYXJjaFRleHRDaGFuZ2Uoc2VhcmNoVGV4dClcIiBtZC1zZWFyY2gtdGV4dD1cInNlYXJjaFRleHRcIiBtZC1zZWxlY3RlZC1pdGVtLWNoYW5nZT1cImFkZENvbXBvbmVudChpdGVtKVwiIG1kLWl0ZW1zPVwiaXRlbSBpbiBxdWVyeVNlYXJjaChzZWFyY2hUZXh0KVwiIG1kLWl0ZW0tdGV4dD1cIml0ZW0ubmFtZVwiIG1kLW1pbi1sZW5ndGg9XCIxXCIgcGxhY2Vob2xkZXI9XCJCdXNjYXIgdW4gcHJvZHVjdG8gcGFyYSBhZGljaW9uYXIgYSBsYSBjb21wb3NpY2nDs25cIiBtZC1tZW51LWNsYXNzPVwiYXV0b2NvbXBsZXRlLWNvbXBvc2l0aW9ucy1wcm9kdWN0c1wiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgPG1kLWl0ZW0tdGVtcGxhdGU+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPGRpdiBsYXlvdXQ9XCJyb3dcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPGRpdiBmbGV4PVwibm9ncm93XCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICA8bWQtaWNvbiBjbGFzcz1cImRhc2hpY29ucyBkYXNoaWNvbnMtcGx1cy1hbHRcIj48L21kLWljb24+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICA8ZGl2IGxheW91dD1cImNvbHVtblwiIHN0eWxlPVwibWFyZ2luLWxlZnQ6IDEwcHhcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDxkaXYgZmxleCBuZy1iaW5kLWh0bWw9XCJpdGVtLm5hbWVcIj48L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICA8L21kLWl0ZW0tdGVtcGxhdGU+XFxuJyArXG5cdFx0XHQnICAgICAgICA8bWQtbm90LWZvdW5kPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgIE5vIGhheSBwcm9kdWN0b3MgcXVlIGNvaW5jaWRhbiBjb24gXCJ7e3NlYXJjaFRleHR9fVwiLlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgIDwhLS0gPGEgbmctY2xpY2s9XCJjdHJsLm5ld1N0YXRlKGN0cmwuc2VhcmNoVGV4dClcIj5DcmVhdGUgYSBuZXcgb25lITwvYT4gLS0+XFxuJyArXG5cdFx0XHQnICAgICAgICA8L21kLW5vdC1mb3VuZD5cXG4nICtcblx0XHRcdCcgICAgPC9tZC1hdXRvY29tcGxldGU+XFxuJyArXG5cdFx0XHQnICAgIDxkaXYgbGF5b3V0LWd0LXNtPVwicm93XCIgbGF5b3V0LXdyYXA+XFxuJyArXG5cdFx0XHQnICAgICAgICA8bWQtbGlzdCBmbGV4PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgIDxtZC1zdWJoZWFkZXIgY2xhc3M9XCJtZC1uby1zdGlja3lcIiBuZy1zaG93PVwiY29tcG9uZW50cy5sZW5ndGhcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJvbnMtdG9vbGJhclwiIGxheW91dD1cInJvd1wiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxhYmVsXCIgZmxleD1cImF1dG9cIj5Db21wb25lbnRlcyBBZ3JlZ2Fkb3M8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDxkaXYgZmxleD1cIm5vZ3Jvd1wiIHN0eWxlPVwib3ZlcmZsb3c6IGhpZGRlblwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgbGF5b3V0PVwicm93XCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gPGRpdiBsYXlvdXQtYWxpZ249XCJzdGFydCBjZW50ZXJcIj4gLS0+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBuZy1zaG93PVwic2hvd0ZpbHRlckNvbXBvbmVudFwiIGNsYXNzPVwiaW5wdXQtczEgYW5pbWF0aW9uLXNsaWRlXCIgZmxleD1cImF1dG9cIiB0eXBlPVwidGV4dFwiIG5nLW1vZGVsPVwiZmlsdGVyQ29tcG9uZW50c1wiIHBsYWNlaG9sZGVyPVwiRmlsdHJhciBDb21wb25lbnRlLi4uXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gPC9kaXY+IC0tPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tIDxkaXY+IC0tPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tIDxtZC1pY29uIGNsYXNzPVwiZGFzaGljb25zIGRhc2hpY29ucy1maWx0ZXJcIj48L21kLWljb24+IC0tPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bWQtYnV0dG9uIGZsZXg9XCJub2dyb3dcIiBjbGFzcz1cIm1kLXNlY29uZGFyeSBtZC1taW5pIG1kLWljb24tYnV0dG9uXCIgbmctY2xpY2s9XCJ0b2dnbGVGaWx0ZXJDb21wb25lbnRzKClcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxtZC1pY29uIGNsYXNzPVwiZGFzaGljb25zIGRhc2hpY29ucy1maWx0ZXJcIj48L21kLWljb24+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tIDwvZGl2PiAtLT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICA8L21kLXN1YmhlYWRlcj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICA8bWQtbGlzdC1pdGVtIGNsYXNzPVwibWQtMy1saW5lIG1kLWxvbmctdGV4dFwiIG5nLXJlcGVhdD1cIihrZXksIGNvbXBvbmVudCkgaW4gY29tcG9uZW50cyB8IGZpbHRlcjpmaWx0ZXJDb21wb25lbnRzXCIgbmctY2xpY2s9XCJudWxsXCIgbmctY2xhc3M9XCJ7b3BlbjogY29tcG9uZW50Lm9wZW59XCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgIDwhLS0gPGltZyBuZy1zcmM9XCJ7e2l0ZW0uZmFjZX19P3t7JGluZGV4fX1cIiBjbGFzcz1cIm1kLWF2YXRhclwiIGFsdD1cInt7aXRlbS53aG99fVwiIC8+IC0tPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWQtbGlzdC1pdGVtLXRleHRcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDxkaXYgbGF5b3V0PVwicm93XCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBmbGV4PVwiYXV0b1wiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+XFxuJyArXG5cdFx0XHQnICAgIFx0XHRcdCAgICAgICAgICAgIFx0PHNwYW4+XFxuJyArXG5cdFx0XHQnICAgIFx0XHRcdCAgICAgICAgICAgIFx0XHR7eyBjb21wb25lbnQubmFtZSB9fVxcbicgK1xuXHRcdFx0JyAgICBcdFx0XHQgICAgICAgICAgICBcdDwvc3Bhbj5cXG4nICtcblx0XHRcdCcgICAgXHRcdFx0ICAgICAgICAgICAgXHQ8IS0tIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwicmVtb3ZlX3JvdyBidXR0b25cIj5FbGltaW5hcjwvYnV0dG9uPiAtLT5cXG4nICtcblx0XHRcdCcgICAgXHRcdFx0ICAgICAgICAgICAgPC9oMz5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LWVycm9yXCIgbmctc2hvdz1cInZhbGlkYXRlTWV0YWJveChrZXkpXCI+SGF5IGNhbXBvcyBpbnZhbGlkb3MgZW4gZXN0ZSBjb21wb25lbnRlITwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD57eyBjb21wb25lbnQucmVmIH19PC9wPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDxtZC1idXR0b24gbmctY2xpY2s9XCJjb21wb25lbnQub3BlbiA9ICFjb21wb25lbnQub3BlblwiIGNsYXNzPVwibWQtZmFiIG1kLW1pbmkgbWQtcHJpbWFyeVwiIGZsZXg9XCJub2dyb3dcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG1kLWljb24gY2xhc3M9XCJkYXNoaWNvbnNcIiBuZy1jbGFzcz1cIntcXCdkYXNoaWNvbnMtYXJyb3ctZG93bi1hbHRcXCc6ICFjb21wb25lbnQub3BlbiwgXFwnZGFzaGljb25zLWFycm93LXVwLWFsdFxcJzogY29tcG9uZW50Lm9wZW59XCI+PC9tZC1pY29uPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDwvbWQtYnV0dG9uPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDxtZC1idXR0b24gbmctY2xpY2s9XCJkZWxldGVDb21wb25lbnQoY29tcG9uZW50KVwiIGNsYXNzPVwibWQtZmFiIG1kLW1pbmkgbWQtYWNjZW50XCIgZmxleD1cIm5vZ3Jvd1wiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bWQtaWNvbiBjbGFzcz1cImRhc2hpY29ucyBkYXNoaWNvbnMtdHJhc2hcIj48L21kLWljb24+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDxkaXYgbGF5b3V0PVwicm93XCIgbmctc2hvdz1cImNvbXBvbmVudC5vcGVuXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgPG1kLWlucHV0LWNvbnRhaW5lciBmbGV4PVwiMzNcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPk5vbWJyZTwvbGFiZWw+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCByZXF1aXJlZCBuYW1lPVwiY29tcG9uZW50TmFtZV97e2tleX19XCIgbmctbW9kZWw9XCJjb21wb25lbnQubmFtZVwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG5nLW1lc3NhZ2VzPVwibWV0YWJveENvbXBvbmVudFtcXCdjb21wb25lbnROYW1lX1xcJyArIGtleV0uJGVycm9yXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG5nLW1lc3NhZ2VzLWluY2x1ZGU9XCJlcnJvci1tZXNzYWdlc1wiPjwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICA8L21kLWlucHV0LWNvbnRhaW5lcj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICA8bWQtaW5wdXQtY29udGFpbmVyIGZsZXg9XCIzM1wiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bWQtdG9vbHRpcCBtZC1kaXJlY3Rpb249XCJ0b3BcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhbnRpZGFkIGVuIGxhIHVuaWRhZCBkZSBtZWRpZGEgcHJlZGV0ZXJtaW5hZGEgZGVsIFByb2R1Y3RvXFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbWQtdG9vbHRpcD5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkNhbnRpZGFkPC9sYWJlbD5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHJlcXVpcmVkIG5hbWU9XCJjb21wb25lbnRRdHlfe3trZXl9fVwiIG5nLW1vZGVsPVwiY29tcG9uZW50LnF0eVwiIHJvbGU9XCJhbGVydFwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG5nLW1lc3NhZ2VzPVwibWV0YWJveENvbXBvbmVudFtcXCdjb21wb25lbnRRdHlfXFwnICsga2V5XS4kZXJyb3JcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgbmctbWVzc2FnZXMtaW5jbHVkZT1cImVycm9yLW1lc3NhZ2VzXCI+PC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDwvbWQtaW5wdXQtY29udGFpbmVyPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDxtZC1pbnB1dC1jb250YWluZXIgZmxleD1cIjMzXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5JbmMuIFByZWNpbyBlbiBhZGljacOzbjwvbGFiZWw+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCByZXF1aXJlZCBuYW1lPVwiY29tcG9uZW50SW5jcmVtZW50UHJpY2Vfe3trZXl9fVwiIG5nLW1vZGVsPVwiY29tcG9uZW50LmluY3JlbWVudFByaWNlXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgbmctbWVzc2FnZXM9XCJtZXRhYm94Q29tcG9uZW50W1xcJ2NvbXBvbmVudEluY3JlbWVudFByaWNlX1xcJyArIGtleV0uJGVycm9yXCIgcm9sZT1cImFsZXJ0XCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG5nLW1lc3NhZ2VzLWluY2x1ZGU9XCJlcnJvci1tZXNzYWdlc1wiPjwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICA8L21kLWlucHV0LWNvbnRhaW5lcj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICA8L21kLWxpc3QtaXRlbT5cXG4nICtcblx0XHRcdCcgICAgICAgIDwvbWQtbGlzdD5cXG4nICtcblx0XHRcdCcgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgIDwhLS0gPHByZT57eyBtZXRhYm94Q29tcG9uZW50cyB8IGpzb24gfX08L3ByZT4gLS0+XFxuJyArXG5cdFx0XHQnICAgIDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIndjQm9uc3RlckNvbXBvbmVudHNcIiB2YWx1ZT1cInt7Y29tcG9uZW50c319XCI+XFxuJyArXG5cdFx0XHQnICAgIDxzY3JpcHQgdHlwZT1cInRleHQvbmctdGVtcGxhdGVcIiBpZD1cImVycm9yLW1lc3NhZ2VzXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICA8ZGl2IG5nLW1lc3NhZ2U9XCJyZXF1aXJlZFwiPkNhbXBvIHJlcXVlcmlkby48L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgIDwhLS0gPGRpdiBuZy1tZXNzYWdlPVwibWlubGVuZ3RoXCI+VGhpcyBmaWVsZCBpcyB0b28gc2hvcnQ8L2Rpdj4gLS0+XFxuJyArXG5cdFx0XHQnICAgICAgICA8IS0tIDxkaXYgbmctbWVzc2FnZT1cIm1kLW1heGxlbmd0aFwiPlRoZSBkZXNjcmlwdGlvbiBtdXN0IGJlIGxlc3MgdGhhbiAzMCBjaGFyYWN0ZXJzIGxvbmcuPC9kaXY+IC0tPlxcbicgK1xuXHRcdFx0JyAgICA8L3NjcmlwdD5cXG4nICtcblx0XHRcdCc8L2Rpdj4nKTtcblxuXHRcdCR0ZW1wbGF0ZUNhY2hlLnB1dCgndGVtcGxhdGVzL2Zyb250L2J1aWxkLXByb2R1Y3QtY29tcG9zaXRlLmh0bWwnLCAnPGRpdiBjbGFzcz1cImJ1aWxkLXByb2R1Y3QtY29tcG9zaXRlXCI+XFxuJyArXG5cdFx0XHQnICAgIDxkaXYgY2xhc3M9XCJ0b3BuYXZcIiBiYi1zdGlja3k+XFxuJyArXG5cdFx0XHQnICAgICAgICA8ZGl2IGNsYXNzPVwiaW5mby1jYXJ0XCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbCBiYXNlcHJpY2VcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJib25zLWxhYmVsXCI+UGVkaWRvPC9zcGFuPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZhbHVlXCI+JCA8c3BhbiBuZy1iaW5kPVwidm0uY2FydC5iYXNlUHJpY2VcIj48L3NwYW4+PC9zcGFuPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wgYWRkcHJpY2VcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJib25zLWxhYmVsXCI+QWRpY2lvbmFsZXM8L3NwYW4+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidmFsdWVcIj4kIDxzcGFuIG5nLWJpbmQ9XCJ2bS5jYXJ0LmFkZGl0aW9uYWxQcmljZVwiPjwvc3Bhbj48L3NwYW4+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbCB0b3RhbFwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImJvbnMtbGFiZWxcIj5Ub3RhbDwvc3Bhbj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2YWx1ZVwiPiQgPHNwYW4gbmctYmluZD1cInZtLmNhcnQub3JkZXJUb3RhbFwiPjwvc3Bhbj48L3NwYW4+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbCBidG4tbWluaWNhcnRcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPGEgbmctY2xpY2s9XCJzaG93TWluaWNhcnQgPSAhc2hvd01pbmljYXJ0XCIgaHJlZj1cIlwiIGNsYXNzPVwiYnRuLXRvZ2dsZS1taW5pY2FydFwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgPHNwYW4gbmctYmluZD1cInNob3dNaW5pY2FydCA/IFxcJ0NlcnJhclxcJzpcXCdBYnJpclxcJ1wiPjwvc3Bhbj4gQ2Fycml0byA8aSBjbGFzcz1cImdseXBoaWNvblwiIG5nLWNsYXNzPVwie1xcJ2dseXBoaWNvbi1jaGV2cm9uLWRvd25cXCc6ICFzaG93TWluaWNhcnQsIFxcJ2dseXBoaWNvbi1jaGV2cm9uLXVwXFwnOiBzaG93TWluaWNhcnR9XCI+PC9pPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICA8L2E+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICA8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgIDxtaW5pY2FydCBuZy1pZj1cInNob3dNaW5pY2FydFwiIGNsYXNzPVwiamctd29vLW1pbmljYXJ0IGJvbnMtZmFkZSB3aXRoLWxlYXZlXCI+PC9taW5pY2FydD5cXG4nICtcblx0XHRcdCcgICAgICAgIDxkaXYgY2xhc3M9XCJuYXYtY2FydFwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgIDwhLS0gPGRpdiBjbGFzcz1cInJlc3BvbnNpdmUtbmF2IHZpc2libGUteHMtYmxvY2tcIj5cXG4nICtcblx0XHRcdCdcdFx0XHRcdDxuZy1pbmNsdWRlIHNyYz1cIlxcJ3RlbXBsYXRlcy9mcm9udC9fcGFydC1tZW51LXNlbGVjdGlvbi5odG1sXFwnXCIgc2NvcGU9XCJcIiBvbmxvYWQ9XCJcIj48L25nLWluY2x1ZGU+XFxuJyArXG5cdFx0XHQnXHRcdFx0PC9kaXY+IC0tPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgIDwhLS0gPGRpdiBjbGFzcz1cImNvbCBzdGVwXCI+XFxuJyArXG5cdFx0XHQnXHRcdFx0XHRQYXNvIDxzcGFuIG5nLWJpbmQ9XCJ2bS5zdGVwKzFcIj48L3NwYW4+IGRlIDxzcGFuIG5nLWJpbmQ9XCJ2bS5jb21wb3NpdGlvbnNCYXNlLmxlbmd0aFwiPjwvc3Bhbj4gPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tcmlnaHRcIj48L2k+IDxzcGFuIG5nLWJpbmQ9XCJ2bS5jb21wb3NpdGlvbkFjdGl2ZS5uYW1lIHwgbGltaXRUbzoxMFwiIHRpdGxlPVwie3sgdm0uY29tcG9zaXRpb25BY3RpdmUubmFtZSB9fVwiPjwvc3Bhbj5cXG4nICtcblx0XHRcdCdcdFx0XHQ8L2Rpdj5cXG4nICtcblx0XHRcdCdcdFx0XHQ8ZGl2IGNsYXNzPVwiY29sIG5hdm1lbnVcIj5cXG4nICtcblx0XHRcdCdcdFx0XHRcdDxuZy1pbmNsdWRlIHNyYz1cIlxcJ3RlbXBsYXRlcy9mcm9udC9fcGFydC1tZW51LXNlbGVjdGlvbi5odG1sXFwnXCIgc2NvcGU9XCJcIiBvbmxvYWQ9XCJcIj48L25nLWluY2x1ZGU+XFxuJyArXG5cdFx0XHQnXHRcdFx0PC9kaXY+IC0tPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgIDx1bCBjbGFzcz1cIndyYXAtYnRuc1wiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgIFx0PGxpIGNsYXNzPVwic3RlcFwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgIFx0XHRQYXNvIDxzcGFuIG5nLWJpbmQ9XCJ2bS5zdGVwKzFcIj48L3NwYW4+IGRlIDxzcGFuIG5nLWJpbmQ9XCJ2bS5jb21wb3NpdGlvbnNCYXNlLmxlbmd0aFwiPjwvc3Bhbj4gPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tcmlnaHRcIj48L2k+IDxzcGFuIG5nLWJpbmQ9XCJ2bS5jb21wb3NpdGlvbkFjdGl2ZS5uYW1lIHwgbGltaXRUbzoxMFwiIHRpdGxlPVwie3sgdm0uY29tcG9zaXRpb25BY3RpdmUubmFtZSB9fVwiPjwvc3Bhbj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICBcdDwvbGk+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cImRyb3Bkb3duLXNlbGVjdGVkXCIgaGlkZS1vbi1vdXQtY2xpY2s9XCJzaG93TWVudVNlbGVjdGVkXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiXCIgY2xhc3M9XCJtZW51LXNlbGVjdGVkIGJvbnMtZmFkZVwiIG5nLWNsaWNrPVwic2hvd01lbnVTZWxlY3RlZCA9ICFzaG93TWVudVNlbGVjdGVkXCI+XFxuJyArXG5cdFx0XHQnXHRcdFx0XHRcdFx0VMO6IHNlbGVjY2nDs24gPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tZG93blwiPjwvaT5cXG4nICtcblx0XHRcdCdcdFx0XHRcdFx0PC9hPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiamctZHJvcGRvd24gYm9ucy1mYWRlIHdpdGgtbGVhdmVcIiBuZy1pZj1cInNob3dNZW51U2VsZWN0ZWQgJiYgdm0uY250Q29tcG9zaXRpb25zSW5DYXJ0ID4gMFwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBuZy1yZXBlYXQ9XCJpdGVtIGluIHZtLmNvbXBvc2l0aW9uc0Jhc2VcIiBuZy1jbGFzcz1cIntzZWxlY3RlZDogaXRlbT09dm0uY29tcG9zaXRpb25BY3RpdmV9XCIgbmctaWY9XCJ2bS5pc0NvbXBvc2l0aW9uU2VsZWN0ZWQoaXRlbSlcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIlwiIG5nLWJpbmQ9XCJpdGVtLm5hbWVcIiBuZy1jbGljaz1cInZtLmdvU3RlcChpdGVtKVwiPjwvYT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgPC91bD5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPC9saT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwibmV4dFwiIG5nLWlmPVwidm0uY29tcG9zaXRpb25OZXh0ICYmICF2bS5pc1JlYWR5Rm9yT3JkZXJcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJcIiBjbGFzcz1cImJvbnMtZmFkZSB3aXRoLWxlYXZlXCIgbmctY2xpY2s9XCJ2bS5uZXh0U3RlcCgpXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbmctYmluZD1cInZtLmNvbXBvc2l0aW9uTmV4dC5uYW1lXCI+PC9zcGFuPiA8aSBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1yaWdodFwiPjwvaT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDwvYT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPC9saT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPGxpIG5nLWlmPVwidm0uaXNSZWFkeUZvck9yZGVyXCIgY2xhc3M9XCJhZGRpdGlvbnMgZHJvcGRvd24tc2VsZWN0ZWRcIiBoaWRlLW9uLW91dC1jbGljaz1cInNob3dNZW51QWRkaXRpb25hbFwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIlwiIGNsYXNzPVwibWVudS1zZWxlY3RlZCBib25zLWZhZGVcIiBuZy1jbGljaz1cInNob3dNZW51QWRkaXRpb25hbCA9ICFzaG93TWVudUFkZGl0aW9uYWxcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tcGx1cy1zaWduXCI+PC9pPiBBZGljaW9uZXMgPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tZG93blwiPjwvaT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDwvYT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cImpnLWRyb3Bkb3duIGJvbnMtZmFkZSB3aXRoLWxlYXZlXCIgbmctaWY9XCJzaG93TWVudUFkZGl0aW9uYWxcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICA8bGkgbmctcmVwZWF0PVwiaXRlbSBpbiB2bS5jb21wb3NpdGlvbnNBZGRpdGlvbmFsXCIgbmctY2xhc3M9XCJ7c2VsZWN0ZWQ6IGl0ZW09PXZtLmNvbXBvc2l0aW9uQWN0aXZlfVwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiXCIgbmctYmluZD1cIml0ZW0ubmFtZVwiIG5nLWNsaWNrPVwidm0uZ29TdGVwKGl0ZW0pXCI+PC9hPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICA8L3VsPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICA8L2xpPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJjb25maXJtXCIgbmctc2hvdz1cInZtLmlzUmVhZHlGb3JPcmRlclwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIlwiIGNsYXNzPVwiYm9ucy1mYWRlIHdpdGgtbGVhdmVcIiBuZy1jbGljaz1cInNob3dNaW5pY2FydCA9IHRydWVcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5Db25maXJtYXIgUGVkaWRvPC9zcGFuPiA8aSBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1yaWdodFwiPjwvaT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDwvYT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPC9saT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICA8L3VsPlxcbicgK1xuXHRcdFx0JyAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgIDwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICA8ZGl2IGNsYXNzPVwiY29tcG9zaXRpb24tYWN0aXZlXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICA8ZGl2IGNsYXNzPVwicm93XCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbXBvbmVudCBjb2wtbWQtMyBjb2wtc20tNCBjb2wteHMtNiBib25zLWZhZGVcIiBuZy1yZXBlYXQ9XCJjb21wb25lbnQgaW4gdm0uY29tcG9zaXRpb25BY3RpdmUuY29tcG9uZW50c1wiIG5nLWNsYXNzPVwie3NlbGVjdGVkOiBjb21wb25lbnQuc2VsZWN0ZWQsIFxcJ3dpdGhvdXQtc2hhZG93XFwnOiB2bS5jb21wb3NpdGlvbkFjdGl2ZS5pc0FkZGl0aW9uYWx9XCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3cmFwLWltZ1wiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgPGltZyBuZy1jbGljaz1cInZtLnNlbGVjdENvbXBvbmVudChjb21wb25lbnQpXCIgY2xhc3M9XCJpbWctcmVzcG9uc2l2ZVwiIG5nLXNyYz1cInt7IGNvbXBvbmVudC5pbWdbMF0gfX1cIiBhbHQ9XCJ7eyBjb21wb25lbnQubmFtZSB9fVwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgPGkgbmctaWY9XCJjb21wb25lbnQuc2VsZWN0ZWQgJiYgIXZtLmNvbXBvc2l0aW9uQWN0aXZlLmlzQWRkaXRpb25hbFwiIGNsYXNzPVwiY2hlY2sgZ2x5cGhpY29uIGdseXBoaWNvbi1jaGVjayBib25zLWZhZGVcIj48L2k+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICA8aSBuZy1pZj1cImNvbXBvbmVudC5zZWxlY3RlZCAmJiB2bS5jb21wb3NpdGlvbkFjdGl2ZS5pc0FkZGl0aW9uYWxcIiBjbGFzcz1cImNoZWNrLWFkZGl0aW9uYWwgZ2x5cGhpY29uIGdseXBoaWNvbi1vay1zaWduIGJvbnMtZmFkZVwiPjwvaT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBuZy1pZj1cInZtLmNvbXBvc2l0aW9uQWN0aXZlLmlzQWRkaXRpb25hbCAmJiBjb21wb25lbnQuc2VsZWN0ZWRcIiBuZy1tb2RlbD1cImNvbXBvbmVudC5xdHlPcmRlclwiIG5nLWNoYW5nZT1cInZtLmNoYW5nZVF0eU9yZGVyKGNvbXBvbmVudClcIiBuZy1jbGljaz1cInJldHVybjtcIiBjbGFzcz1cInF0eS1vcmRlciBib25zLWZhZGUgd2l0aC1sZWF2ZVwiIHR5cGU9XCJudW1iZXJcIiBtaW49XCIxXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICA8ZGl2IG5nLWNsaWNrPVwidm0uc2VsZWN0Q29tcG9uZW50KGNvbXBvbmVudClcIiBjbGFzcz1cIm5hbWVcIiBuZy1iaW5kPVwiY29tcG9uZW50Lm5hbWVcIiB0aXRsZT1cInt7IGNvbXBvbmVudC5uYW1lIH19XCI+PC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICA8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgIDwhLS0gPHByZT57eyB2bS5jYXJ0IHwganNvbjo0IH19PC9wcmU+IC0tPlxcbicgK1xuXHRcdFx0JyAgICA8aW5wdXQgbmFtZT1cImJvbnNfZGF0YV9vcmRlclwiIHR5cGU9XCJoaWRkZW5cIiB2YWx1ZT1cInt7IHZtLmNhcnQgfX1cIj5cXG4nICtcblx0XHRcdCc8L2Rpdj4nKTtcblxuXHRcdCR0ZW1wbGF0ZUNhY2hlLnB1dCgndGVtcGxhdGVzL2Zyb250L21pbmljYXJ0Lmh0bWwnLCAnPGRpdiBjbGFzcz1cImpnLW1pbmljYXJ0XCI+XFxuJyArXG5cdFx0XHQnXHQ8ZGl2IG5nLWlmPVwiYnVpbGRDdHJsLmNudENvbXBvc2l0aW9uc0luQ2FydCA+IDBcIj5cXG4nICtcblx0XHRcdCdcdCAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSBiYXNpYy1pdGVtc1wiPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICA8dGhlYWQ+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICA8dHI+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICAgICAgPHRoPlBlZGlkbzwvdGg+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwidGV4dC1jZW50ZXJcIj5DYW50aWRhZDwvdGg+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwidGV4dC1yaWdodFwiPlByZWNpbzwvdGg+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICA8L3RyPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICA8L3RoZWFkPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICA8dGJvZHk+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICA8dHIgbmctcmVwZWF0PVwiKGtleSwgY29tcG9uZW50KSBpbiBidWlsZEN0cmwuY2FydC5iYXNpY0l0ZW1zXCI+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiaXRlbS1pbWFnZVwiPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgICAgIFx0PGRpdiBjbGFzcz1cIml0ZW1cIj5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgICAgICBcdFx0PGltZyBjbGFzcz1cImltZy1yZXNwb25zaXZlXCIgbmctc3JjPVwie3sgdm0uZ2V0SW1hZ2UoY29tcG9uZW50KSB9fVwiIGFsdD1cInt7IGNvbXBvbmVudC5uYW1lIH19XCI+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICAgICAgICAgIFx0PGRpdiBjbGFzcz1cImJvbnMtbGFiZWxcIiBuZy1iaW5kPVwiY29tcG9uZW50Lm5hbWUgfCBsaW1pdFRvOjEwXCIgdGl0bGU9XCJ7e2NvbXBvbmVudC5uYW1lfX1cIj48L2Rpdj5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgICAgICBcdDwvZGl2PlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgICAgIDwvdGQ+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwidGV4dC1jZW50ZXJcIj5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJxdHlcIiBuZy1iaW5kPVwiY29tcG9uZW50LnF0eU9yZGVyXCI+PC9zcGFuPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgICAgIDwvdGQ+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwicHJpY2UgdGV4dC1yaWdodFwiPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgICAgICAgICAkIDxzcGFuIG5nLWJpbmQ9XCJjb21wb25lbnQucHJpY2VcIj48L3NwYW4+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICAgICAgPC90ZD5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgIDwvdHI+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgIDwvdGJvZHk+XFxuJyArXG5cdFx0XHQnXHQgICAgPC90YWJsZT5cXG4nICtcblx0XHRcdCdcdCAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSBhZGRpdGlvbmFsLWl0ZW1zXCI+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgIDx0aGVhZD5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgIDx0ciBjbGFzcz1cInN1Yi1oZWFkZXJcIj5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJ0ZXh0LWNlbnRlclwiIGNvbHNwYW49XCI0XCI+QWRpY2lvbmFsZXM8L3RoPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgPC90cj5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgPC90aGVhZD5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgPHRib2R5PlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgPHRyIG5nLXJlcGVhdD1cIihrZXksIGNvbXBvc2l0aW9uKSBpbiBidWlsZEN0cmwuY2FydC5hZGRpdGlvbmFsSXRlbXNcIiBuZy1pZj1cImJ1aWxkQ3RybC5jbnRDb21wb3NpdGlvbnNBZGRJbkNhcnQgPiAwXCI+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwidGFibGUtaW5zaWRlXCIgY29sc3Bhbj1cIjRcIj5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGVcIj5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cXG4nICtcblx0XHRcdCdcdFx0XHRcdFx0ICAgICAgICAgICAgPHRyIG5nLWlmPVwidm0uaXNGaXJzdEl0ZW0oa2V5KVwiPlxcbicgK1xuXHRcdFx0J1x0XHRcdFx0XHQgICAgICAgICAgICAgICAgPHRoIHdpZHRoPVwiMjUlXCI+QWRpY2nDs248L3RoPlxcbicgK1xuXHRcdFx0J1x0XHRcdFx0XHQgICAgICAgICAgICAgICAgPHRoIHdpZHRoPVwiMjUlXCIgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPkNhbnRpZGFkPC90aD5cXG4nICtcblx0XHRcdCdcdFx0XHRcdFx0ICAgICAgICAgICAgICAgIDx0aCB3aWR0aD1cIjI1JVwiIGNsYXNzPVwidGV4dC1yaWdodFwiPlByZWNpbzwvdGg+XFxuJyArXG5cdFx0XHQnXHRcdFx0XHRcdCAgICAgICAgICAgICAgICA8dGggd2lkdGg9XCIyNSVcIiBjbGFzcz1cInRleHQtY2VudGVyXCI+RWxpbWluYXI8L3RoPlxcbicgK1xuXHRcdFx0J1x0XHRcdFx0XHQgICAgICAgICAgICA8L3RyPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdDx0ZCBjb2xzcGFuPVwiNFwiPlxcbicgK1xuXHRcdFx0J1x0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHQ8aDIgbmctYmluZD1cInZtLmdldENvbXBvc2l0aW9uTmFtZShrZXkpXCIgY2xhc3M9XCJlbnRyeS10aXRsZVwiPjwvaDI+XFxuJyArXG5cdFx0XHQnXHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ciBjbGFzcz1cImJvbnMtZmFkZSB3aXRoLWxlYXZlXCIgbmctcmVwZWF0PVwiKGtleUNvbXAsIGNvbXBvbmVudCkgaW4gY29tcG9zaXRpb25cIj5cXG4nICtcblx0XHRcdCdcdFx0XHRcdFx0ICAgICAgICAgICAgICAgIDx0ZCB3aWR0aD1cIjI1JVwiIGNsYXNzPVwiaXRlbS1pbWFnZVwiPlxcbicgK1xuXHRcdFx0J1x0XHRcdFx0XHQgICAgICAgICAgICAgICAgXHQ8ZGl2IGNsYXNzPVwiaXRlbVwiPlxcbicgK1xuXHRcdFx0J1x0XHRcdFx0XHQgICAgICAgICAgICAgICAgXHRcdDxpbWcgY2xhc3M9XCJpbWctcmVzcG9uc2l2ZVwiIG5nLXNyYz1cInt7IHZtLmdldEltYWdlKGNvbXBvbmVudCkgfX1cIiBhbHQ9XCJ7eyBjb21wb25lbnQubmFtZSB9fVwiPlxcbicgK1xuXHRcdFx0J1x0XHRcdFx0XHQgICAgICAgICAgICAgICAgICAgIFx0PGRpdiBjbGFzcz1cImJvbnMtbGFiZWxcIiBuZy1iaW5kPVwiY29tcG9uZW50Lm5hbWUgfCBsaW1pdFRvOjEwXCIgdGl0bGU9XCJ7e2NvbXBvbmVudC5uYW1lfX1cIj48L2Rpdj5cXG4nICtcblx0XHRcdCdcdFx0XHRcdFx0ICAgICAgICAgICAgICAgIFx0PC9kaXY+XFxuJyArXG5cdFx0XHQnXHRcdFx0XHRcdCAgICAgICAgICAgICAgICA8L3RkPlxcbicgK1xuXHRcdFx0J1x0XHRcdFx0XHQgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwidGV4dC1jZW50ZXJcIj5cXG4nICtcblx0XHRcdCdcdFx0XHRcdFx0ICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInF0eVwiIG5nLWJpbmQ9XCJjb21wb25lbnQucXR5T3JkZXJcIj48L3NwYW4+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tIDxpbnB1dCBuZy1tb2RlbD1cImNvbXBvbmVudC5xdHlPcmRlclwiIHR5cGU9XCJudW1iZXJcIj4gLS0+XFxuJyArXG5cdFx0XHQnXHRcdFx0XHRcdCAgICAgICAgICAgICAgICA8L3RkPlxcbicgK1xuXHRcdFx0J1x0XHRcdFx0XHQgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwicHJpY2UgdGV4dC1yaWdodFwiPlxcbicgK1xuXHRcdFx0J1x0XHRcdFx0XHQgICAgICAgICAgICAgICAgICAgICQgPHNwYW4gbmctYmluZD1cImNvbXBvbmVudC5wcmljZVwiPjwvc3Bhbj5cXG4nICtcblx0XHRcdCdcdFx0XHRcdFx0ICAgICAgICAgICAgICAgIDwvdGQ+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCB3aWR0aD1cIjI1JVwiIGNsYXNzPVwiYnRuLXJlbW92ZSB0ZXh0LWNlbnRlclwiPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdDxhIG5nLWNsaWNrPVwidm0ucmVtb3ZlSXRlbShjb21wb25lbnQsIGtleSlcIiBocmVmPVwiXCIgY2xhc3M9XCJidG5cIj5cXG4nICtcblx0XHRcdCdcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZS1zaWduXCI+PC9pPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdDwvYT5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgICAgICA8L3RkPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgPC90cj5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgIDx0ciBuZy1pZj1cImJ1aWxkQ3RybC5jbnRDb21wb3NpdGlvbnNBZGRJbkNhcnQgPD0gMFwiPlxcbicgK1xuXHRcdFx0J1x0ICAgICAgICAgICAgXHQ8dGQgY29sc3Bhbj1cIjRcIj5cXG4nICtcblx0XHRcdCdcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY2FydC1lbXB0eVwiPlxcbicgK1xuXHRcdFx0J1x0XHRcdFx0XHRcdFx0Tm8gdGllbmUgYWRpY2lvbmVzIGVuIGVsIGNhcnJpdG8gZGUgY29tcHJhcy5cXG4nICtcblx0XHRcdCdcdFx0XHRcdFx0XHQ8L2Rpdj5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgIFx0PC90ZD5cXG4nICtcblx0XHRcdCdcdCAgICAgICAgICAgIDwvdHI+XFxuJyArXG5cdFx0XHQnXHQgICAgICAgIDwvdGJvZHk+XFxuJyArXG5cdFx0XHQnXHQgICAgPC90YWJsZT5cXG4nICtcblx0XHRcdCdcXG4nICtcblx0XHRcdCdcdCAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cIm5nLXN1Ym1pdC1taW5pY2FydCBib25zLWFuaW1hdGUtYmcgYnRuIGJ0bi13YXJuaW5nXCI+RW52aWFyIE9yZGVuL0xsZW5hciBTb2xpY2l0dWQ8L2J1dHRvbj5cXG4nICtcblx0XHRcdCdcdDwvZGl2PlxcbicgK1xuXHRcdFx0J1x0PGRpdiBjbGFzcz1cImNhcnQtZW1wdHlcIiBuZy1pZj1cImJ1aWxkQ3RybC5jbnRDb21wb3NpdGlvbnNJbkNhcnQgPD0gMFwiPlxcbicgK1xuXHRcdFx0J1x0XHRObyBoYSBhZ3JlZ2FkbyBpdGVtcyBhbCBjYXJyaXRvIGRlIGNvbXByYXMuXFxuJyArXG5cdFx0XHQnXHQ8L2Rpdj5cXG4nICtcblx0XHRcdCc8L2Rpdj4nKTtcblxuXHRcdCR0ZW1wbGF0ZUNhY2hlLnB1dCgndGVtcGxhdGVzL3dvb2NvbW1lcmNlL21ldGEtYm94LWNvbXBvc2l0aW9ucy5odG1sJywgJzxkaXYgY2xhc3M9XCJtZXRhLWJveC1jb21wb3NpdGlvblwiIG5nLWZvcm09XCJtZXRhYm94Q29tcG9zaXRpb25cIj5cXG4nICtcblx0XHRcdCdcdDxtZC1hdXRvY29tcGxldGUgZmxleD1cImdyb3dcIiBtZC1zZWxlY3RlZC1pdGVtPVwic2VsZWN0ZWRJdGVtXCIgbWQtc2VhcmNoLXRleHQtY2hhbmdlPVwic2VhcmNoVGV4dENoYW5nZShzZWFyY2hUZXh0KVwiIG1kLXNlYXJjaC10ZXh0PVwic2VhcmNoVGV4dFwiIG1kLXNlbGVjdGVkLWl0ZW0tY2hhbmdlPVwiYWRkQ29tcG9zaXRpb24oaXRlbSlcIiBtZC1pdGVtcz1cIml0ZW0gaW4gcXVlcnlTZWFyY2goc2VhcmNoVGV4dClcIiBtZC1pdGVtLXRleHQ9XCJpdGVtLm5hbWVcIiBtZC1taW4tbGVuZ3RoPVwiMVwiIHBsYWNlaG9sZGVyPVwiQnVzY2FyIHVuYSBDb21wb3NpY2nDs24gcGFyYSBhZGljaW9uYXIgYWwgUHJvZHVjdG9cIiBtZC1tZW51LWNsYXNzPVwiYXV0b2NvbXBsZXRlLWNvbXBvc2l0aW9ucy1wcm9kdWN0c1wiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgPG1kLWl0ZW0tdGVtcGxhdGU+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPGRpdiBsYXlvdXQ9XCJyb3dcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPGRpdiBmbGV4PVwibm9ncm93XCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICA8bWQtaWNvbiBjbGFzcz1cImRhc2hpY29ucyBkYXNoaWNvbnMtcGx1cy1hbHRcIj48L21kLWljb24+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICA8ZGl2IGxheW91dD1cImNvbHVtblwiIHN0eWxlPVwibWFyZ2luLWxlZnQ6IDEwcHhcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDxkaXYgZmxleCBuZy1iaW5kLWh0bWw9XCJpdGVtLm5hbWVcIj48L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICA8L21kLWl0ZW0tdGVtcGxhdGU+XFxuJyArXG5cdFx0XHQnICAgICAgICA8bWQtbm90LWZvdW5kPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgIE5vIGhheSBjb21wb3NpY2lvbmVzIHF1ZSBjb2luY2lkYW4gY29uIFwie3tzZWFyY2hUZXh0fX1cIi5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICA8IS0tIDxhIG5nLWNsaWNrPVwiY3RybC5uZXdTdGF0ZShjdHJsLnNlYXJjaFRleHQpXCI+Q3JlYXRlIGEgbmV3IG9uZSE8L2E+IC0tPlxcbicgK1xuXHRcdFx0JyAgICAgICAgPC9tZC1ub3QtZm91bmQ+XFxuJyArXG5cdFx0XHQnICAgIDwvbWQtYXV0b2NvbXBsZXRlPlxcbicgK1xuXHRcdFx0J1xcbicgK1xuXHRcdFx0J1xcbicgK1xuXHRcdFx0JyAgICA8ZGl2IGxheW91dC1ndC1zbT1cInJvd1wiIGxheW91dC13cmFwPlxcbicgK1xuXHRcdFx0JyAgICAgICAgPG1kLWxpc3QgZmxleD5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICA8bWQtc3ViaGVhZGVyIGNsYXNzPVwibWQtbm8tc3RpY2t5XCIgbmctc2hvdz1cImNvbXBvc2l0aW9ucy5sZW5ndGhcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJvbnMtdG9vbGJhclwiIGxheW91dD1cInJvd1wiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxhYmVsXCIgZmxleD1cImF1dG9cIj5Db21wb3NpY2lvbmVzIEFncmVnYWRhczwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgPGRpdiBmbGV4PVwibm9ncm93XCIgc3R5bGU9XCJvdmVyZmxvdzogaGlkZGVuXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBsYXlvdXQ9XCJyb3dcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSA8ZGl2IGxheW91dC1hbGlnbj1cInN0YXJ0IGNlbnRlclwiPiAtLT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IG5nLXNob3c9XCJzaG93RmlsdGVyQ29tcG9zaXRpb25cIiBjbGFzcz1cImlucHV0LXMxIGFuaW1hdGlvbi1zbGlkZVwiIGZsZXg9XCJhdXRvXCIgdHlwZT1cInRleHRcIiBuZy1tb2RlbD1cImZpbHRlckNvbXBvc2l0aW9uc1wiIHBsYWNlaG9sZGVyPVwiRmlsdHJhciBDb21wb3NpY2nDs24uLi5cIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSA8L2Rpdj4gLS0+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gPGRpdj4gLS0+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gPG1kLWljb24gY2xhc3M9XCJkYXNoaWNvbnMgZGFzaGljb25zLWZpbHRlclwiPjwvbWQtaWNvbj4gLS0+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxtZC1idXR0b24gZmxleD1cIm5vZ3Jvd1wiIGNsYXNzPVwibWQtc2Vjb25kYXJ5IG1kLW1pbmkgbWQtaWNvbi1idXR0b25cIiBuZy1jbGljaz1cInRvZ2dsZUZpbHRlckNvbXBvc2l0aW9ucygpXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bWQtaWNvbiBjbGFzcz1cImRhc2hpY29ucyBkYXNoaWNvbnMtZmlsdGVyXCI+PC9tZC1pY29uPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L21kLWJ1dHRvbj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSA8L2Rpdj4gLS0+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPC9tZC1zdWJoZWFkZXI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPG1kLWxpc3QtaXRlbSBjbGFzcz1cIm1kLTMtbGluZSBtZC1sb25nLXRleHRcIiBuZy1yZXBlYXQ9XCIoa2V5LCBjb21wb3NpdGlvbikgaW4gY29tcG9zaXRpb25zIHwgZmlsdGVyOmZpbHRlckNvbXBvc2l0aW9uc1wiIG5nLWNsaWNrPVwibnVsbFwiIG5nLWNsYXNzPVwie29wZW46IGNvbXBvc2l0aW9uLm9wZW59XCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgIDwhLS0gPGltZyBuZy1zcmM9XCJ7e2l0ZW0uZmFjZX19P3t7JGluZGV4fX1cIiBjbGFzcz1cIm1kLWF2YXRhclwiIGFsdD1cInt7aXRlbS53aG99fVwiIC8+IC0tPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWQtbGlzdC1pdGVtLXRleHRcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDxkaXYgbGF5b3V0PVwicm93XCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBmbGV4PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bWQtaW5wdXQtY29udGFpbmVyIGNsYXNzPVwibWQtYmxvY2tcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5Ob21icmU8L2xhYmVsPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHJlcXVpcmVkIG5hbWU9XCJjb21wb3NpdGlvbk5hbWVfe3trZXl9fVwiIG5nLW1vZGVsPVwiY29tcG9zaXRpb24ubmFtZVwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBuZy1tZXNzYWdlcz1cIm1ldGFib3hDb21wb3NpdGlvbltcXCdjb21wb3NpdGlvbk5hbWVfXFwnICsga2V5XS4kZXJyb3JcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG5nLW1lc3NhZ2VzLWluY2x1ZGU9XCJlcnJvci1tZXNzYWdlc1wiPjwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbWQtaW5wdXQtY29udGFpbmVyPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tIDxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1lcnJvclwiIG5nLXNob3c9XCJ2YWxpZGF0ZU1ldGFib3goa2V5KVwiPkhheSBjYW1wb3MgaW52YWxpZG9zIGVuIGVzdGEgY29tcG9zaWNpw7NuITwvZGl2PiAtLT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSA8cD57eyBjb21wb3NpdGlvbi5yZWYgfX08L3A+IC0tPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgZmxleD1cIm5vZ3Jvd1wiIGZsZXgtb2Zmc2V0PVwiNVwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bWQtc3dpdGNoIG5nLW1vZGVsPVwiY29tcG9zaXRpb24uaXNBZGRpdGlvbmFsXCIgYXJpYS1sYWJlbD1cIsK/QWRpY2lvbmFsP1wiPsK/QWRpY2lvbmFsPzwvbWQtc3dpdGNoPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gPG1kLWJ1dHRvbiBuZy1jbGljaz1cImNvbXBvc2l0aW9uLm9wZW4gPSAhY29tcG9zaXRpb24ub3BlblwiIGNsYXNzPVwibWQtZmFiIG1kLW1pbmkgbWQtcHJpbWFyeVwiIGZsZXg9XCJub2dyb3dcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG1kLWljb24gY2xhc3M9XCJkYXNoaWNvbnNcIiBuZy1jbGFzcz1cIntcXCdkYXNoaWNvbnMtYXJyb3ctZG93bi1hbHRcXCc6ICFjb21wb3NpdGlvbi5vcGVuLCBcXCdkYXNoaWNvbnMtYXJyb3ctdXAtYWx0XFwnOiBjb21wb3NpdGlvbi5vcGVufVwiPjwvbWQtaWNvbj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICA8L21kLWJ1dHRvbj4gLS0+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgPG1kLWJ1dHRvbiBuZy1jbGljaz1cImRlbGV0ZUNvbXBvc2l0aW9uKGNvbXBvc2l0aW9uKVwiIGNsYXNzPVwibWQtZmFiIG1kLW1pbmkgbWQtYWNjZW50XCIgZmxleD1cIm5vZ3Jvd1wiIGZsZXgtb2Zmc2V0PVwiNVwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bWQtaWNvbiBjbGFzcz1cImRhc2hpY29ucyBkYXNoaWNvbnMtdHJhc2hcIj48L21kLWljb24+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgPC9tZC1idXR0b24+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDwhLS0gPGRpdiBsYXlvdXQ9XCJyb3dcIiBuZy1zaG93PVwiY29tcG9zaXRpb24ub3BlblwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgIDxtZC1pbnB1dC1jb250YWluZXIgZmxleD1cIjUwXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5Ob21icmU8L2xhYmVsPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgcmVxdWlyZWQgbmFtZT1cImNvbXBvc2l0aW9uTmFtZV97e2tleX19XCIgbmctbW9kZWw9XCJjb21wb3NpdGlvbi5uYW1lXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgbmctbWVzc2FnZXM9XCJtZXRhYm94Q29tcG9zaXRpb25bXFwnY29tcG9zaXRpb25OYW1lX1xcJyArIGtleV0uJGVycm9yXCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG5nLW1lc3NhZ2VzLWluY2x1ZGU9XCJlcnJvci1tZXNzYWdlc1wiPjwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICA8L21kLWlucHV0LWNvbnRhaW5lcj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICBcXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICA8bWQtaW5wdXQtY29udGFpbmVyIGZsZXg9XCI1MFwiPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+SW5jLiBQcmVjaW8gZW4gYWRpY2nDs248L2xhYmVsPlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgcmVxdWlyZWQgbmFtZT1cImNvbXBvc2l0aW9uSW5jcmVtZW50UHJpY2Vfe3trZXl9fVwiIG5nLW1vZGVsPVwiY29tcG9zaXRpb24uaW5jcmVtZW50UHJpY2VcIj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBuZy1tZXNzYWdlcz1cIm1ldGFib3hDb21wb3NpdGlvbltcXCdjb21wb3NpdGlvbkluY3JlbWVudFByaWNlX1xcJyArIGtleV0uJGVycm9yXCIgcm9sZT1cImFsZXJ0XCI+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IG5nLW1lc3NhZ2VzLWluY2x1ZGU9XCJlcnJvci1tZXNzYWdlc1wiPjwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgICAgICA8L21kLWlucHV0LWNvbnRhaW5lcj5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgICAgIDwvZGl2PiAtLT5cXG4nICtcblx0XHRcdCcgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArXG5cdFx0XHQnICAgICAgICAgICAgPC9tZC1saXN0LWl0ZW0+XFxuJyArXG5cdFx0XHQnICAgICAgICA8L21kLWxpc3Q+XFxuJyArXG5cdFx0XHQnICAgIDwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICA8IS0tIDxwcmU+e3sgbWV0YWJveENvbXBvbmVudHMgfCBqc29uIH19PC9wcmU+IC0tPlxcbicgK1xuXHRcdFx0JyAgICA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ3Y0JvbnN0ZXJDb21wb3NpdGlvbnNcIiB2YWx1ZT1cInt7Y29tcG9zaXRpb25zfX1cIj5cXG4nICtcblx0XHRcdCcgICAgPHNjcmlwdCB0eXBlPVwidGV4dC9uZy10ZW1wbGF0ZVwiIGlkPVwiZXJyb3ItbWVzc2FnZXNcIj5cXG4nICtcblx0XHRcdCcgICAgICAgIDxkaXYgbmctbWVzc2FnZT1cInJlcXVpcmVkXCI+Q2FtcG8gcmVxdWVyaWRvLjwvZGl2PlxcbicgK1xuXHRcdFx0JyAgICAgICAgPCEtLSA8ZGl2IG5nLW1lc3NhZ2U9XCJtaW5sZW5ndGhcIj5UaGlzIGZpZWxkIGlzIHRvbyBzaG9ydDwvZGl2PiAtLT5cXG4nICtcblx0XHRcdCcgICAgICAgIDwhLS0gPGRpdiBuZy1tZXNzYWdlPVwibWQtbWF4bGVuZ3RoXCI+VGhlIGRlc2NyaXB0aW9uIG11c3QgYmUgbGVzcyB0aGFuIDMwIGNoYXJhY3RlcnMgbG9uZy48L2Rpdj4gLS0+XFxuJyArXG5cdFx0XHQnICAgIDwvc2NyaXB0PlxcbicgK1xuXHRcdFx0J1xcbicgK1xuXHRcdFx0J1x0PCEtLSA8ZGl2IGNsYXNzPVwib3B0aW9uc19ncm91cFwiPlxcbicgK1xuXHRcdFx0J1x0XHQ8cCBjbGFzcz1cImZvcm0tZmllbGRcIj5IT0xBIEpKPC9wPlxcbicgK1xuXHRcdFx0J1x0PC9kaXY+IC0tPlxcbicgK1xuXHRcdFx0JzwvZGl2PicpO1xuXHR9XG5dKTtcbiJdfQ==
