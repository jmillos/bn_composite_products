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