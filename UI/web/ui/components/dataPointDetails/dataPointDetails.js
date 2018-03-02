/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

import angular from 'angular';
import requirejs from 'requirejs/require';


DataPointDetailsController.$inject = ['$scope', '$element', '$stateParams', '$state', 'localStorageService', 'maPointHierarchy', 'maUiDateBar', 'maUser'];
function DataPointDetailsController($scope, $element, $stateParams, $state, localStorageService, PointHierarchy, maUiDateBar, User) {

    this.dateBar = maUiDateBar;
    this.User = User;
    
    this.chartType = 'smoothedLine';
    
    this.$onInit = function() {
        if ($stateParams.pointXid) {
            this.pointXid = $stateParams.pointXid;
        } else if ($stateParams.pointId) {
            this.pointId = $stateParams.pointId;
        } else {
            // Attempt load pointXid from local storage
            var storedPoint = localStorageService.get('lastDataPointDetailsItem');
            if (storedPoint) {
                this.pointXid = storedPoint.xid;
            }
        }
        
        this.retrievePreferences();
    };
    
    this.pointChanged = function(point) {
        if (!point) return;

        delete $scope.pointValues;
        delete $scope.realtimePointValues;
        
        $scope.myPoint = point;
        var xid = point.xid;

        $state.go('.', {pointXid: xid}, {location: 'replace', notify: false});
        
        localStorageService.set('lastDataPointDetailsItem', {
            xid: xid
        });
        
        PointHierarchy.pathByXid({xid: xid}).$promise.then(function(response) {
            this.path = response;
        }.bind(this));
        
        var pointType = $scope.myPoint.pointLocator.dataType;
        this.dateBar.rollupTypesFilter = pointType === 'NUMERIC' ? {} : { nonNumeric: true };

        this.chartType = $scope.myPoint.amChartsGraphType();
    };

    this.updatePreferences = function() {
        var preferences = localStorageService.get('uiPreferences');
        preferences.numberOfPointValues = this.numValues;
        preferences.realtimeMode = this.realtimeMode;
        preferences.showCachedData = this.showCachedData;
        localStorageService.set('uiPreferences', preferences);
    };
    
    this.retrievePreferences = function() {
        var defaults = {
            numberOfPointValues: 100,
            realtimeMode: true,
            showCachedData: false
        };
        var preferences = angular.merge(defaults, localStorageService.get('uiPreferences'));
        this.numValues = preferences.numberOfPointValues;
        this.realtimeMode = preferences.realtimeMode;
        this.showCachedData = preferences.showCachedData;
    };
}

export default {
    controller: DataPointDetailsController,
    templateUrl: requirejs.toUrl('./dataPointDetails.html')
};

