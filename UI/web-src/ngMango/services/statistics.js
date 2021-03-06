/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

statisticsFactory.$inject = ['$http', '$q', 'maUtil'];
function statisticsFactory($http, $q, Util) {
    const pointValuesUrl = '/rest/v1/point-values/';

    function Statistics() {
    }
    
    Statistics.prototype.getStatisticsForXid = function getStatisticsForXid(xid, options) {
        try {
            if (typeof xid !== 'string') throw new Error('Requires xid parameter');
            if (!options || typeof options !== 'object') throw new Error('Requires options parameter');
            
            let url = pointValuesUrl + encodeURIComponent(xid) + (options.firstLast ? '/first-last' : '/statistics');
            const params = [];
            
            if (options.from !== undefined && options.to !== undefined) {
                const now = new Date();
                const from = Util.toMoment(options.from, now, options.dateFormat);
                const to = Util.toMoment(options.to, now, options.dateFormat);
                
                if (from.valueOf() === to.valueOf()) {
                    return $q.when({});
                }
                
                params.push('from=' + encodeURIComponent(from.toISOString()));
                params.push('to=' + encodeURIComponent(to.toISOString()));
            } else {
                throw new Error('Requires options.to and options.from');
            }
            
            if (options.rendered || options.rendered === undefined) {
                params.push('useRendered=true');
            }
            
            url += '?' + params.join('&');
            
            const canceler = $q.defer();
            const cancelOrTimeout = Util.cancelOrTimeout(canceler.promise, options.timeout);

            return $http.get(url, {
                timeout: cancelOrTimeout,
                headers: {
                    'Accept': 'application/json'
                },
                cache: true
            }).then(function(response) {
                if (!response || !response.data) {
                    throw new Error('Incorrect response from REST end point ' + url);
                }
                return response.data;
            }).setCancel(canceler.resolve);
        } catch (error) {
            return $q.reject(error);
        }
    };

    return new Statistics();
}

export default statisticsFactory;

