/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */




function rqlParamSerializerFactory($httpParamSerializer) {
    return function(params) {
        let rqlPart;
        if (params && params.hasOwnProperty('rqlQuery')) {
            rqlPart = params.rqlQuery;
            delete params.rqlQuery;
        }
        let serialized = $httpParamSerializer(params);
        if (rqlPart) {
            if (serialized)
                serialized += '&';
            serialized += rqlPart;
        }
        return serialized;
    };
}

rqlParamSerializerFactory.$inject = ['$httpParamSerializer'];

export default rqlParamSerializerFactory;


