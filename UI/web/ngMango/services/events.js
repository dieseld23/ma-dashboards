/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';
/**
* @ngdoc service
* @name ngMangoServices.maEvents
*
* @description
* Provides a service for retrieving, adding, and acknowledging events/alarms
* - Used by <a ui-sref="ui.docs.ngMango.maEventsTable">`<ma-events-table>`</a> 
*
*
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#get
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v1/events`
* @returns {array} Returns an Array of event objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#save
*
* @description
* A default action provided by $resource. Makes a http POST call to the rest endpoint `/rest/v1/events`
* @returns {array} Returns an Array of event objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#remove
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/events`
* @returns {array} Returns an Array of event objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#delete
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/events`
* @param {object} query Object for the query, can have a `contains` property for querying events that contain the given string.
* @returns {array} Returns an Array of event objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#query
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v1/events`
* @param {object} query Object for the query, can have a `contains` property for querying events that contain the given string.
* @returns {array} Returns an Array of event objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#objQuery
*
* @description
* Can be passed an object with an rql string or object with values to build query
* @param {object} query Object for the query, can have a `query` property set to an RQL string or set to an object with keys and values.
* @returns {array} Returns an Array of event objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#getActiveSummary
*
* @description
* Returns a list of counts for all active events by type and the most recent active alarm for each.

* @returns {array} Returns an Array of counts for all active events by type and the most recent active alarm for each.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#acknowledge
*
* @description
* Acknowledges a single event by passing in an event id.
* @param {object} id Passed in an object with an id property cooresponding to the event id.
* @returns {object} Returns an event object with an id property if successful.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#acknowledgeViaRql
*
* @description
* Acknowledge many events using an RQL string as a parameter
* @param {object} rql Object with an rql string property equal to the rql used to find all the events that you wish to acknowledge.
* @returns {object} Returns an object with a count property equal to the number of events acknowledged.
*
*/

eventsFactory.$inject = ['$resource', 'maUtil', 'maNotificationManager'];
function eventsFactory($resource, Util, NotificationManager) {
    var Events = $resource('/rest/v1/events', {
        id: '@id'
    }, {
        query: {
            method: 'GET',
            isArray: true,
            transformResponse: Util.transformArrayResponse,
            interceptor: {
                response: Util.arrayResponseInterceptor
            },
            cancellable: true
        },
        rql: {
        	url: '/rest/v1/events?:query',
            method: 'GET',
            isArray: true,
            transformResponse: Util.transformArrayResponse,
            interceptor: {
                response: Util.arrayResponseInterceptor
            },
            cancellable: true
        },
        acknowledge: {
            method: 'PUT',
            url: '/rest/v1/events/acknowledge/:id',
            transformRequest: (data, headersGetter) => {
                return null;
            }
        },
        acknowledgeViaRql: {
            method: 'POST',
            url: '/rest/v1/events/acknowledge/?:rql'
        },
        getActiveSummary: {
        	url: '/rest/v1/events/active-summary',
            method: 'GET',
            isArray: true
        }
    });
    
    const subscriptionMessage = {
        eventTypes: ['RAISED', 'ACKNOWLEDGED', 'RETURN_TO_NORMAL', 'DEACTIVATED'],
        levels: ['LIFE_SAFETY', 'CRITICAL', 'URGENT', 'WARNING', 'IMPORTANT', 'INFORMATION', 'NONE']
    };
    
    Events.notificationManager = new NotificationManager({
        webSocketUrl: '/rest/v1/websocket/events',
        onOpen() {
            this.sendMessage(subscriptionMessage);
        },
        notifyFromPayload(payload) {
            if (payload.type && payload.event) {
                const item = new Events(payload.event);
                this.notify(payload.type, item);
            }
        }
    });
    
    Events.objQuery = function(options) {
        if (!options) return this.query();
        if (typeof options.query === 'string') {
            return this.rql({query: options.query});
        }

        var params = [];
        if (options.query) {
            var and = !!options.query.$and;
            var exact = !!options.query.$exact;
            delete options.query.$exact;
            delete options.query.$and;

            var parts = [];
            for (var key in options.query) {
                var val = options.query[key] || '';
                var comparison = '=';
                var autoLike = false;
                if (val.indexOf('=') < 0 && !exact) {
                    comparison += 'like=*';
                    autoLike = true;
                }
                parts.push(key + comparison + val + (autoLike ? '*': ''));
            }

            var queryPart;
            if (and || parts.length === 1) {
                queryPart = parts.join('&');
            } else {
                queryPart = 'or(' + parts.join(',') + ')';
            }
            params.push(queryPart);
        }
        
        return params.length ? this.rql({query: params.join('&')}) : this.query();
    };

    Events.getRQL = function(options) {
        const params = [];

        if (options.alarmLevel && options.alarmLevel !== 'any') {
            params.push(`alarmLevel=${options.alarmLevel}`);
        }
        if (options.eventType && options.eventType !== 'any') {
            params.push(`eventType=${options.eventType}`);
        }
        if (options.pointId) {
            params.push(`dataPointId=${options.pointId}`);
        }
        if (options.eventId) {
            params.push(`id=${options.eventId}`);
        }
        if (options.activeStatus && options.activeStatus !== 'any') {
            if (options.activeStatus==='active') {
                params.push('active=true');
            }
            else if (options.activeStatus==='noRtn') {
                params.push('rtnApplicable=false');
            }
            else if (options.activeStatus==='normal') {
                params.push('active=false');
            }
        }
        if (options.from && options.dateFilter) {
            const from = options.from.valueOf();
            params.push(`activeTimestamp=ge=${from}`);
        }
        if (options.to && options.dateFilter) {
            const to = options.to.valueOf();
            params.push(`activeTimestamp=lt=${to}`);
        }

        const ackAllParams = params.slice();
        ackAllParams.push('acknowledged=false');
        
        const countUnAckParams = params.slice();
        countUnAckParams.push('acknowledged=false', 'limit(0)');

        if (options.acknowledged != null && options.acknowledged !== 'any') {
            params.push(`acknowledged=${options.acknowledged}`);
        }

        if (options.sort) {
            let sort = options.sort;
            if (angular.isArray(sort)) {
                sort = sort.join(',');
            }
            params.push(`sort(${sort})`);
        }
        if (options.limit) {
            const start = options.start || 0;
            params.push(`limit(${options.limit},${start})`);
        }

        return {
            RQLforAcknowldege: ackAllParams.join('&'),
            RQLforCountUnacknowledged: countUnAckParams.join('&'),
            RQLforDisplay: params.join('&')
        };
    };

    return Events;
}

return eventsFactory;

}); // define