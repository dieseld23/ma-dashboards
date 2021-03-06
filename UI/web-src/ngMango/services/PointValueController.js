/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

pointValueControllerFactory.$inject = ['maPointEventManager', 'maPoint', '$injector', 'maWatchdog'];
function pointValueControllerFactory(pointEventManager, Point, $injector) {

    const SUBSCRIPTION_TYPES = ['REGISTERED', 'UPDATE', 'TERMINATE', 'INITIALIZE', 'ATTRIBUTE_CHANGE'];
    
    class PointValueController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$scope', '$element', '$attrs']; }
        
        constructor($scope, $element, $attrs) {
            this.$scope = $scope;
            this.$element = $element;
            this.$attrs = $attrs;

            // stats dialog depends on ui date bar, check that too
            if ($injector.has('maStatsDialog') && $injector.has('maUiDateBar')) {
                const maStatsDialog = $injector.get('maStatsDialog');
                this.showStatsDialog = maStatsDialog.show;
            }
            if ($injector.has('maSetPointDialog')) {
                const maSetPointDialog = $injector.get('maSetPointDialog');
                this.showSetPointDialog = maSetPointDialog.show;
            }
        
            if (this.changeDuration == null)
                this.changeDuration = 400;
            
            $element.addClass('ma-live-value');
            
            $scope.$on('maWatchdog', (event, current, previous) => {
                if (current.status === 'LOGGED_IN' || current.status === 'API_UP') {
                    $element.removeClass('ma-api-down');
                } else {
                    $element.addClass('ma-api-down');
                }
            });
        }
        
        $onChanges(changes) {
            if (changes.value && !(!changes.value.currentValue && changes.value.isFirstChange())) {
                this.valueChangeHandler();
            }
            if (changes.point && !(!changes.point.currentValue && changes.point.isFirstChange())) {
                this.setPoint();
            }
            if (changes.pointXid && !(!changes.pointXid.currentValue && changes.pointXid.isFirstChange())) {
                this.getPointByXid();
            }
            if (changes.flashOnChange) {
                if (this.flashOnChange) {
                    this.$element.addClass('ma-flash-on-change');
                } else {
                    this.$element.removeClass('ma-flash-on-change');
                }
            }
        }
        
        setPoint(point) {
            if (point !== undefined)
                this.point = point;
            
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
            }
            
            this.valueChangeHandler(true);
            
            if (this.point && this.point.xid) {
                this.unsubscribe = pointEventManager.smartSubscribe(this.$scope, this.point.xid, SUBSCRIPTION_TYPES, this.websocketHandler.bind(this));
            }
        }
        
        getValue() {
            if (this.value != null) {
                return this.value;
            } else if (this.point && this.point.convertedValue != null) {
                return this.point.convertedValue;
            } else if (this.point && this.point.value != null) {
                return this.point.value;
            }
            return null;
        }
        
        getTextValue() {
            if (this.value != null) {
                if (this.renderValue) {
                    return this.renderValue({$value: this.value});
                } else {
                    return isFinite(this.value) ? this.value.toFixed(2) : this.value;
                }
            } else if (this.point && this.point.renderedValue != null) {
                return this.point.renderedValue;
            } else if (this.point && this.point.convertedValue != null) {
                return this.point.convertedValue.toFixed(2);
            } else if (this.point && this.point.value != null) {
                return this.point.value.toFixed(2);
            }
            return '';
        }
        
        websocketHandler(event, payload) {
            if (!this.point) {
                console.error('No point but got websocket msg', payload);
                return;
            }
            if (this.point.xid !== payload.xid) {
                console.error('Got websocket msg for wrong xid', payload, this.point);
                return;
            }
            
            // sets the value, convertedValue and renderedValue on the point from the websocket payload
            this.point.websocketHandler(payload);
            this.valueChangeHandler();
        }
        
        valueChangeHandler(isPointChange) {
            if (!this.point || this.point.enabled) {
                this.$element.removeClass('point-disabled');
            } else {
                this.$element.addClass('point-disabled');
            }
            
            if (!this.point || !this.point.unreliable) {
                this.$element.removeClass('point-unreliable');
            } else {
                this.$element.addClass('point-unreliable');
            }
        
            const $element = this.$element;
            
            // manually add and remove classes rather than using ng-class as point values can
            // change rapidly and result in huge slow downs / heaps of digest loops
            if (!isPointChange && this.point) {
                const valueChanged = this.previousPointValue != null && this.point.value !== this.previousPointValue;
                this.previousPointValue = this.point.value;
                
                $element.addClass('ma-point-value-time-changed');
                if (valueChanged) {
                    $element.addClass('ma-point-value-changed');
                }
                
                if (this.timeoutID) {
                    clearTimeout(this.timeoutID);
                }
        
                this.timeoutID = setTimeout(() => {
                    $element.removeClass('ma-point-value-time-changed');
                    $element.removeClass('ma-point-value-changed');
                }, this.changeDuration);
            }
            if (isPointChange) {
                if (this.timeoutID) {
                    clearTimeout(this.timeoutID);
                    delete this.timeoutID;
                }
                delete this.timeoutID;
                delete this.previousPointValue;
                $element.removeClass('ma-point-value-time-changed');
                $element.removeClass('ma-point-value-changed');
            }
            
            if (this.onValueUpdated) {
                this.onValueUpdated({point: this.point, value: this.value});
            }
        }
        
        getPointByXid() {
            if (this.point && this.pointXid === this.point.xid) return;
    
            if (this.pointRequest) {
                this.pointRequest.$cancelRequest();
            }
            
            if (!this.pointXid) {
                this.pointRequest = null;
                this.setPoint();
                return;
            }
            
            this.pointRequest = Point.get({xid: this.pointXid});
            this.pointRequest.$promise.then(point => {
                this.pointRequest = null;
                this.setPoint(point);
            }, () => {
                this.pointRequest = null;
                this.setPoint(null);
            });
        }
    
    }
    
    return PointValueController;
}

export default pointValueControllerFactory;
