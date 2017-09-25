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