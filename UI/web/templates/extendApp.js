/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([
    'angular',
    'ngMango/ngMangoMaterial'
], function(angular, ngMangoMaterial) {
'use strict';

var myApp = angular.module('myApp', ['ngMangoMaterial']);

myApp.run(['$rootScope', function($rootScope) {
    $rootScope.pi = function() {
        return Math.PI;
    };
}]);

myApp.directive('myCustomComponent', function() {
    return {
        restrict: 'E',
        scope: {
            name: '@'
        },
        template: '<span>Hello {{name}}!</span>'
    };
});

angular.element(document).ready(function() {
    angular.bootstrap(document.documentElement, ['myApp']);
});

/*
 * Replace the block above with the following if you want to auto-login a user
 * 
var injector = angular.injector(['myApp']);
var User = injector.get('maUser');
User.login({
    username: 'username',
    password: 'password',
    logout: true
}).$promise.then(function() {
    angular.element(document).ready(function() {
        angular.bootstrap(document.documentElement, ['myApp']);
    });
});
*/

}); // define