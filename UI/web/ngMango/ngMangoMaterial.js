/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular',
        './ngMango',
        './components/colorPreview/colorPreview',
        './services/dialogHelper',
        './services/fileStoreDialog',
        './services/statsDialog',
        './services/setPointDialog',
        'angular-material',
        'mdPickers',
        'angular-material-data-table'], function(angular, ngMango, colorPreview, dialogHelperFactory, fileStoreDialogFactory, statsDialogFactory, setPointDialogFactory) {
'use strict';

var ngMangoMaterial = angular.module('ngMangoMaterial', ['ngMango', 'ngMaterial', 'mdPickers', 'md.data.table']);
ngMangoMaterial.component('maColorPreview', colorPreview);
ngMangoMaterial.factory('maDialogHelper', dialogHelperFactory);
ngMangoMaterial.factory('maFileStoreDialog', fileStoreDialogFactory);
ngMangoMaterial.factory('maStatsDialog', statsDialogFactory);
ngMangoMaterial.factory('maSetPointDialog', setPointDialogFactory);
return ngMangoMaterial;

}); // define