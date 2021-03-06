/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';

/**
 * @ngdoc directive
 * @name ngMango.directive:maJsonStore
 * @restrict E
 * @description
 * `<ma-json-store xid="phoneData" item="myItem" value="myValue"></ma-json-store>`
 * - You can use this directive to store arbitrary data in Mango's JSON store.
 * - Updates to the JSON store will sync realtime over websockets with your dashboard, no refresh needed.
 * - You can set a unique `xid` and `item` to store multiple objects in the JSON store.
 * - Any data you want to store should be added to the `value` object and can be retrieved using <code ng-non-bindable>{{myItem.jsonData.myProperty}}</code>.
* - Note that if you do not set `myItem.editPermission` / `myItem.readPermission` permission of the item, only the Admin will have access to it.
You can set these permissions to 'user' to allow other users to read or edit data in the JSON store. 
The 'user' permissions group is added to created Mango users by default.
 * - <a ui-sref="ui.examples.utilities.jsonStore">View Demo</a>
 *
 * @param {string} xid Sets the `xid` used for each unique object in the JSON store.
 * @param {object} item Object used when accessing the stored data. You can also call the following methods:
<ul>
    <li>`myItem.$save()` - Saves the data from myItem in the model to the JSON store.</li>
    <li>`myItem.$delete()` - Deletes the jsonData stored at the given `xid`</li>
    <li>`myItem.$get()` - Reverts the data from myItem that has been modified in the local model to the the values from the JSON store.</li>
</ul>
 * @param {object} value Name of the object used in the model to hold the data to be stored.
 * @param {expression} item-loaded Expression called when item is loaded, $item variable is available for use inside the expression
 *
 * @usage
<ma-json-store xid="phoneData" item="myItem" value="myValue"></ma-json-store>
<input ng-model="myValue.phone">
<md-button class="md-raised md-primary md-hue-3" ng-click="myItem.$save()">
    <md-icon>save</md-icon> Save
</md-button>
<p>Phone # from JSON store: {{myItem.jsonData.phone}}</p>
 *
 */
function jsonStore(JsonStore, jsonStoreEventManager, $q) {
	const SUBSCRIPTION_TYPES = ['update'];

    return {
        scope: {
        	xid: '@',
            item: '=?',
            value: '=?',
            itemLoaded: '&?',
            itemUpdated: '&?',
            path: '<?'
        },
        link: function ($scope, $element, attr) {
            $scope.$watch('{xid: xid, path: path}', function(newValue, oldValue) {
                const newXid = newValue.xid;
                const oldXid = oldValue.xid;
                const newPath = newValue.path || null;
                
            	if (!newXid) return;
            	if (Array.isArray(newPath)) {
            	    const invalidPath = newPath.some(component => component == null);
            	    if (invalidPath) return;
            	}

            	JsonStore.newItem(newXid, newPath).$get().then(function(item) {
            		return item;
            	}, function(response) {
            	    if (response.status === 404) {
            	        const item = JsonStore.newItem(newXid, newPath);
                		item.jsonData = $scope.value || {};
                		return angular.extend(item, $scope.item);
            	    }
            		return $q.reject();
            	}).then(function(item) {
            	    if ($scope.itemLoaded) {
            	        $scope.itemLoaded({$item: item});
            	    }
                    if ($scope.itemUpdated) {
                        $scope.itemUpdated({$item: item, $firstLoad: true});
                    }
            		return ($scope.item = item);
            	});

                jsonStoreEventManager.subscribe(newXid, SUBSCRIPTION_TYPES, websocketHandler);
                if (oldXid && oldXid !== newXid) {
                	jsonStoreEventManager.unsubscribe(oldXid, SUBSCRIPTION_TYPES, websocketHandler);
                }
            }, true);

            $scope.$watch('item.jsonData', function(newData) {
            	if (newData) {
            		$scope.value = newData;
            	}
            });

            $scope.$on('$destroy', function() {
                if ($scope.item) {
                	jsonStoreEventManager.unsubscribe($scope.item.xid, SUBSCRIPTION_TYPES, websocketHandler);
                }
            });

            function websocketHandler(event, payload) {
                $scope.$applyAsync(function() {
                    const oldData = $scope.item.jsonData;
                    let newData = payload.object.jsonData;
                    const path = $scope.path || null;

                    if (Array.isArray(path)) {
                        path.some((prop) => {
                            if (newData == null) {
                                return true;
                            }
                            newData = newData[prop];
                        });
                    }

                    angular.copy(payload.object, $scope.item);
                    $scope.item.dataPath = path;
                    
                    // if the old data is the same, keep it
                    // stops updates because of new objects etc
                    if (angular.equals(newData, oldData)) {
                        $scope.item.jsonData = oldData;
                    }

                    if ($scope.itemUpdated) {
                        $scope.itemUpdated({$item: $scope.item, $firstLoad: false});
                    }
                });
            }
        },
        designerInfo: {
            translation: 'ui.dox.jsonStore',
            icon: 'sd_storage'
        }
    };
}

jsonStore.$inject = ['maJsonStore', 'maJsonStoreEventManager', '$q'];
export default jsonStore;


