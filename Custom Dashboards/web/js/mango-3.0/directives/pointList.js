/**
 * Copyright (C) 2015 Deltamation Software. All rights reserved.
 * http://www.deltamation.com.au/
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function pointList(Point, $filter, $injector) {
    return {
        restrict: 'E',
        scope: {
            order: '@',
            query: '@',
            ngModel: '=?',
            initPoint: '@'
        },
        template: function(element, attrs) {
          var optionsExpr = 'pointLabel(point) for point in points | orderBy: orderArray';
          if (attrs.xidAsModel === 'true') {
            optionsExpr = 'point.xid as ' + optionsExpr;
          } else {
            optionsExpr += ' track by point.id';
          }
          
          if ($injector.has('$mdUtil')) {
              return '<md-select md-on-open="points.$promise" style="min-width: 200px;">' +
              '<md-option ng-value="point" ng-repeat="point in points | orderBy: orderArray track by point.id">{{pointLabel(point)}}</md-option>' +
              '</md-select>';
          }
          
          return '<select ng-options="' + optionsExpr + '"></select>';
        },
        replace: true,
        link: function ($scope, $element, attrs) {
            $scope.orderArray = ['deviceName', 'name'];
            $scope.initPoint = 'true';
            
            $scope.$watch('order', function() {
                if ($scope.order) {
                    $scope.orderArray = $scope.order.split(',');
                }
            });
            
            $scope.$watch('query', function(value) {
                if (value) {
                	$scope.points = Point.rql({
                    	query: value
                    });
                } else {
                	$scope.points = Point.query();
                }
                
                if (attrs.xidAsModel !== 'true' && $scope.initPoint.toLowerCase().trim() === 'true') {
                    $scope.points.$promise.then(function(points) {
                    	if (points.length) {
                        	$scope.ngModel = $filter('orderBy')(points, $scope.orderArray)[0];
                    	}
                    });
                }
            });
            
            $scope.pointLabel = function(point) {
                return point.deviceName + ' - ' + point.name;
            };
        }
    };
}

pointList.$inject = ['Point', '$filter', '$injector'];
return pointList;

}); // define
