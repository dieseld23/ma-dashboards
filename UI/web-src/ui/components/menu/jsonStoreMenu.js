/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

JsonStoreMenuController.$inject = ['$scope', 'maUiMenu'];
function JsonStoreMenuController($scope, Menu) {

    this.$onInit = function() {
        this.retrieveMenu();
        
        $scope.$on('maUIMenuChanged', function(event, menuHierarchy) {
            this.createMenuItemArray(menuHierarchy);
        }.bind(this));
    };

    this.retrieveMenu = function() {
        Menu.getMenuHierarchy().then(function(menuHierarchy) {
            this.createMenuItemArray(menuHierarchy);
        }.bind(this));
    };
    
    this.createMenuItemArray = function(menuHierarchy) {
        const rootArray = menuHierarchy.children.slice();
        
        // combine root menu items and items under ui into a top level menu array
        rootArray.some(function(item, index, array) {
            if (item.name === 'ui') {
                array.splice(index, 1);
                Array.prototype.push.apply(array, item.children);
                return true;
            }
        });
        
        this.menuItems = rootArray;
    };
}

export default {
    controller: JsonStoreMenuController,
    template: '<ma-ui-menu menu-items="$ctrl.menuItems" user="$ctrl.user"></ma-ui-menu>',
    bindings: {
        user: '<user'
    }
};


