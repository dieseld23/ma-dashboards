/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
* @ngdoc service
* @name maServices.cssInjector
*
* @description
* Provides a service for injecting CSS into the head of the document. 
The CSS will only be injected if the directive using this service is used on a page.
*
* ### Example
*
* <pre>
*  // inserts a style tag to style <a> tags with accent color
*  if ($MD_THEME_CSS) {
    var acc = $mdColors.getThemeColor('accent-500-1.0');
    var accT = $mdColors.getThemeColor('accent-500-0.2');
    var accD = $mdColors.getThemeColor('accent-700-1.0');
    var styleContent =
        'a:not(.md-button) {color: ' + acc +'; border-bottom-color: ' + accT + ';}\n' +
        'a:not(.md-button):hover, a:not(.md-button):focus {color: ' + accD + '; border-bottom-color: ' + accD + ';}\n';

    cssInjector.injectStyle(styleContent, null, '[md-theme-style]');
}
* </pre>
*/


/**
* @ngdoc method
* @methodOf maServices.cssInjector
* @name cssInjector#isInjected
*
* @description
* A method that returns `true` or `false` based on whether CSS has been injected
* @param {boolean} trackingName Identifier used to determine if CSS has already been injected by another directive.
* @param {boolean} set Boolean value of `true` should be used to state a CSS injection with the given tracking name has taken place.
* @returns {boolean} Returns true or false.
*
*/

/**
* @ngdoc method
* @methodOf maServices.cssInjector
* @name cssInjector#injectLink
*
* @description
* A method that injects a link to an external CSS file from a link into the document head.
* @param {string} href File path of the external CSS document.
* @param {string} trackingName Identifier used to determine if this particular CSS injection has already been done, as to not duplicate the CSS.
* @param {boolean=} afterSelector If provided the CSS will be injected within the head, after the given element.
*
*/

/**
* @ngdoc method
* @methodOf maServices.cssInjector
* @name cssInjector#injectStyle
*
* @description
* A method that injects a `<style>` element with CSS into the document head.
* @param {string} content String of CSS that will be injected.
* @param {string} trackingName Identifier used to determine if CSS has already been injected by another directive.
* @param {boolean=} afterSelector If provided the CSS will be injected within the head, after the given element.
*
*/


function cssInjectorFactory() {
    function CssInjector() {
        this.injected = {};
    }
    
    CssInjector.prototype.isInjected = function(trackingName, set) {
        if (trackingName) {
            if (this.injected[trackingName]) {
                return true;
            }
            if (set) this.injected[trackingName] = true;
        }
        return false;
    };
    
    CssInjector.prototype.injectLink = function(href, trackingName, afterSelector) {
        if (this.isInjected(trackingName, true)) return;
        
        var linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('href', href);
        insert(linkElement, afterSelector);
    };
    
    CssInjector.prototype.injectStyle = function(content, trackingName, afterSelector) {
        if (this.isInjected(trackingName, true)) return;
        
        var styleElement = document.createElement('style');
        styleElement.appendChild(document.createTextNode(content));
        insert(styleElement, afterSelector);
    };
    
    function insert(element, afterSelector) {
        if (afterSelector) {
            var matches = document.head.querySelectorAll(afterSelector);
            if (matches.length) {
                var last = matches[matches.length - 1];
                angular.element(last).after(element);
                return;
            }
        }
        
        angular.element(document.head).prepend(element);
    }

	return new CssInjector();
}

cssInjectorFactory.$inject = [];

return cssInjectorFactory;

}); // define
