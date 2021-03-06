/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import eventHandlerEditorTemplate from './eventHandlerEditor.html';
import './eventHandlerEditor.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventHandlerEditor
 * @restrict E
 * @description Editor for an event handler, allows creating, updating or deleting
 */

const $inject = Object.freeze(['maEventHandler', '$q', 'maDialogHelper', '$scope', '$window', 'maTranslate', '$element', 'maUtil']);
class EventHandlerEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return $inject; }
    
    constructor(maEventHandler, $q, maDialogHelper, $scope, $window, maTranslate, $element, maUtil) {
        this.maEventHandler = maEventHandler;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$window = $window;
        this.maTranslate = maTranslate;
        this.$element = $element;
        this.maUtil = maUtil;
        
        this.handlerTypes = maEventHandler.handlerTypes;
        this.handlerTypesByName = maEventHandler.handlerTypesByName;
        
        this.dynamicHeight = true;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.$scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
            if (event.defaultPrevented) return;
            
            if (!this.confirmDiscard()) {
                event.preventDefault();
                return;
            }
        });

        const oldUnload = this.$window.onbeforeunload;
        this.$window.onbeforeunload = (event) => {
            if (this.form && this.form.$dirty) {
                const text = this.maTranslate.trSync('ui.app.discardUnsavedChanges');
                event.returnValue = text;
                return text;
            }
        };
        
        this.$scope.$on('$destroy', () => {
            this.$window.onbeforeunload = oldUnload;
        });
        
        if (typeof this.onInit === 'function') {
            this.onInit({$controller: this});
        }
    }
    
    $onChanges(changes) {
    }
    
    render() {
        this.validationMessages = [];
        this.activeTab = 0;
        
        const viewValue = this.ngModelCtrl.$viewValue;
        if (viewValue) {
            if (viewValue instanceof this.maEventHandler) {
                this.eventHandler = viewValue.copy();
            } else {
                this.eventHandler = new this.maEventHandler(viewValue);
            }
        } else {
            this.eventHandler = null;
        }

        if (this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.eventHandler);
    }

    saveItem(event) {
        this.form.$setSubmitted();
        
        if (!this.form.$valid) {
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }
        
        this.validationMessages = [];
        
        this.eventHandler.save().then(item => {
            this.setViewValue();
            this.render();
            this.maDialogHelper.toast(['ui.components.eventHandlerSaved', this.eventHandler.alias || this.eventHandler.xid]);
        }, error => {
            let statusText = error.mangoStatusText;
            
            if (error.status === 422) {
                statusText = error.mangoStatusTextShort;
                this.validationMessages = error.data.validationMessages;
                
                const withProperty = this.validationMessages.filter(m => m.property);
                if (withProperty.length) {
                    const property = withProperty[0].property;
                    const inputElement = this.maUtil.findInputElement(property, this.form);
                    this.activateTab(inputElement);
                }
            }
            
            this.maDialogHelper.errorToast(['ui.components.eventHandlerSaveError', statusText]);
        });
    }
    
    revertItem(event) {
        if (this.confirmDiscard()) {
            this.render();
        }
    }

    deleteItem(event) {
        const notifyName = this.eventHandler.alias || this.eventHandler.getOriginalId();
        this.maDialogHelper.confirm(event, ['ui.components.eventHandlerConfirmDelete', notifyName]).then(() => {
            this.eventHandler.delete().then(() => {
                this.maDialogHelper.toast(['ui.components.eventHandlerDeleted', notifyName]);
                this.eventHandler = null;
                this.setViewValue();
                this.render();
            });
        }, angular.noop);
    }
    
    confirmDiscard() {
        if (this.form && this.form.$dirty) {
            return this.$window.confirm(this.maTranslate.trSync('ui.app.discardUnsavedChanges'));
        }
        return true;
    }
    
    activateTab(query) {
        if (!query) return;
        
        const tabElements = this.$element[0].querySelectorAll('md-tab-content');

        const index = Array.prototype.findIndex.call(tabElements, tab => {
            if (query instanceof Node) {
                return tab.contains(query);
            }
            
            return !!tab.querySelector(query);
        });
        
        if (index >= 0) {
            this.activeTab = index;
        }
    }
}

export default {
    template: eventHandlerEditorTemplate,
    controller: EventHandlerEditorController,
    bindings: {
        onInit: '&?',
        dynamicHeight: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.eventHandlerEditor',
        icon: 'link'
    }
};
