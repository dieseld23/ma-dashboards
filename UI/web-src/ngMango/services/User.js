/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import moment from 'moment-timezone';
import Cldr from 'cldrjs';
import {require as requirejs} from 'requirejs';


// Stores the locales which have been loaded using require, must be cached as we can't call
// require twice and fetch the locale again.
const localeCache = {};

/**
* @ngdoc service
* @name ngMangoServices.maUser
*
* @description
* Provides a service for getting list of users from the Mango system, as well as logging users in and out.
* - All methods return <a href="https://docs.angularjs.org/api/ngResource/service/$resource" target="_blank">$resource</a>
*   objects that can call the following methods available to those objects:
*   - `$save`
*   - `$remove`
*   - `$delete`
*   - `$get`
*
* # Usage
*
* <pre prettyprint-mode="javascript">
*  var user = User.login({
    username: $scope.username,
    password: $scope.password
});

User.logout();
* </pre>
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#get
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v1/users/:username`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#save
*
* @description
* A default action provided by $resource. Makes a http POST call to the rest endpoint `/rest/v1/users/:username`
* @param {object} query Object containing a `username` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#remove
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/users/:username`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#delete
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/users/:username`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#rql
*
* @description
* Passed a string containing RQL for the query and returns an array of user objects.
* @param {string} RQL RQL string for the query
* @returns {array} An array of user objects. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#getById
*
* @description
* Query the REST endpoint `/rest/v1/users/by-id/:id` with the `GET` method.
* @param {object} query Object containing a `id` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#getCurrent
*
* @description
* Query the REST endpoint `/rest/v1/users/current` with the `GET` method to return the currently logged in user.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#login
*
* @description
* Attempts to login in the user by using `GET` method at `/rest/v2/login/:username`
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maUser
* @name User#logout
*
* @description
* Logout the current user by using `GET` method at `/rest/v2/login/:username`
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

UserProvider.$inject = ['MA_DEFAULT_TIMEZONE', 'MA_DEFAULT_LOCALE'];
function UserProvider(MA_DEFAULT_TIMEZONE, MA_DEFAULT_LOCALE) {
    let bootstrapUser = null;

    this.setUser = function(user) {
        bootstrapUser = user;
    };
    
    moment.tz.setDefault(MA_DEFAULT_TIMEZONE || moment.tz.guess());
    moment.locale(MA_DEFAULT_LOCALE || window.navigator.languages || window.navigator.language);

    this.$get = UserFactory;
    
    /*
     * Provides service for getting list of users and create, update, delete
     */
    UserFactory.$inject = ['$resource', '$cacheFactory', 'localStorageService', '$q', 'maUtil', '$http', 'maServer', '$injector', 'maNotificationManager'];
    function UserFactory($resource, $cacheFactory, localStorageService, $q, Util, $http, maServer, $injector, NotificationManager) {
        let cachedUser;
        let systemLocale;
        let systemTimezone;

        var User = $resource('/rest/v1/users/:username', {
                username: '@username'
            }, {
            query: {
                method: 'GET',
                isArray: true,
                transformResponse: Util.transformArrayResponse,
                interceptor: {
                    response: Util.arrayResponseInterceptor
                }
            },
            rql: {
                url: '/rest/v1/users?:query',
                method: 'GET',
                isArray: true,
                transformResponse: Util.transformArrayResponse,
                interceptor: {
                    response: Util.arrayResponseInterceptor
                }
            },
            getById: {
                url: '/rest/v1/users/by-id/:id',
                method: 'GET',
                isArray: false
            },
            getCurrent: {
                url: '/rest/v1/users/current',
                method: 'GET',
                isArray: false,
                interceptor: {
                    response: loginInterceptor
                }
            },
            login: {
                url: '/rest/v2/login',
                method: 'POST',
                isArray: false,
                interceptor: {
                    response: loginInterceptor
                }
            },
            switchUser: {
                url: '/rest/v2/login/su',
                method: 'POST',
                isArray: false,
                interceptor: {
                    response: loginInterceptor
                }
            },
            exitSwitchUser: {
                url: '/rest/v2/login/exit-su',
                method: 'POST',
                isArray: false,
                interceptor: {
                    response: loginInterceptor
                }
            },
            logout: {
                url: '/rest/v2/logout',
                method: 'POST',
                isArray: false,
                interceptor: {
                    response: logoutInterceptor
                }
            },
            save: {
                method: 'POST',
                url: '/rest/v1/users/'
            },
            update: {
                method: 'PUT'
            }
        });

        User.notificationManager = new NotificationManager();

        User.setUser = function(user) {
            if (!angular.equals(user, cachedUser)) {
                const firstChange = cachedUser === undefined;
                cachedUser = user;
                
                if (user) {
                    systemLocale = user.systemLocale;
                    systemTimezone = user.systemTimezone;
                }
                
                this.configureLocale();
                this.configureTimezone();
                
                this.notificationManager.notify('userChanged', user, firstChange);
            }
        };

        User.setSystemLocale = function(locale) {
            if (systemLocale !== locale) {
                systemLocale = locale;
                
                // the system locale might be the new locale if there is no cachedUser (aka not logged in)
                this.configureLocale();
            }
        };

        let angularLocaleDeferred;
        User.configureLocale = function(locale = this.getLocale()) {
            if (locale !== this.locale) {
                const firstChange = this.locale == null;
                this.locale = locale;

                // moment doesn't support locales with a script, just supply it with language and region
                const cldrAttributes = new Cldr(locale).attributes;
                moment.locale(`${cldrAttributes.language}-${cldrAttributes.region}`);

                const localeId = locale.toLowerCase();
                const $locale = $injector.get('$locale');
                if (localeId !== $locale.id) {
                    // cancel any pending request for a locale
                    if (angularLocaleDeferred) {
                        angularLocaleDeferred.reject('cancel');
                    }
                    
                    let newLocalePromise;
                    if (localeCache[localeId]) {
                        // use cached locale when available
                        newLocalePromise = $q.when(localeCache[localeId]);
                    } else {
                        let localDeferred = $q.defer();
                        angularLocaleDeferred = localDeferred;
                        
                        // load the locale using require and resolve the deferred
                        requirejs([`https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/${angular.version.full}/angular-locale_${localeId}.js`], () => {
                            // get the newly loaded locale from a new injector for ngLocale
                            var ngLocaleInjector = angular.injector(['ngLocale'], true);
                            const newLocale = ngLocaleInjector.get('$locale');
                            
                            // cache the result, we can't ever retrieve this locale again using require
                            localeCache[newLocale.id] = newLocale;
                            localDeferred.resolve(newLocale);
                        }, error => localDeferred.reject(error));
                        
                        newLocalePromise = localDeferred.promise;
                    }
                    
                    newLocalePromise.then(newLocale => {
                        // deep replace all properties of existing locale with the keys from the new locale
                        // this is necessary as the filters cache $locale.NUMBER_FORMATS for example
                        Util.deepReplace($locale, newLocale);
                    }, error => {
                        if (error === 'cancel') return;
                        throw error;
                    });
                }

                this.notificationManager.notify('localeChanged', locale, firstChange);
            }
        };

        User.configureTimezone = function(timezone = this.getTimezone()) {
            if (timezone !== this.timezone) {
                const firstChange = this.timezone == null;
                this.timezone = timezone;
                
                moment.tz.setDefault(timezone);
                
                this.notificationManager.notify('timezoneChanged', timezone, firstChange);
            }
        };
        
        User.getLocale = function() {
            if (cachedUser) {
                return cachedUser.getLocale();
            }
            return systemLocale || MA_DEFAULT_LOCALE || (window.navigator.languages && window.navigator.languages[0]) || window.navigator.language;
        };

        User.getTimezone = function() {
            if (cachedUser) {
                return cachedUser.getTimezone();
            }
            return systemTimezone || MA_DEFAULT_TIMEZONE || moment.tz.guess();
        };

        Object.defineProperty(User, 'current', {
            get: function() {
                return cachedUser;
            },
            set: User.setUser
        });

        User.loginInterceptors = [];
        User.logoutInterceptors = [];

        function loginInterceptor(data) {
            data.resource.mangoDefaultUri = data.headers('X-Mango-Default-URI');
            User.loginInterceptors.forEach(function(interceptor) {
                interceptor(data);
            });
            User.current = data.resource;
            return data.resource;
        }
        
        function logoutInterceptor(data) {
            User.logoutInterceptors.forEach(function(interceptor) {
                interceptor(data);
            });
            User.current = null;
            return data.resource;
        }

        User.storeCredentials = function storeCredentials(username, password) {
            localStorageService.set('storedCredentials', {
                username: username,
                password: password
            });
        };
        
        User.storedUsername = function autoLogin() {
            var credentials = localStorageService.get('storedCredentials');
            return credentials ? credentials.username : null;
        };
        
        User.getCredentialsFromUrl = function() {
        	const params = new URL(window.location.href).searchParams;
        	if (!params) return;
        	
        	const credentials = {
        		username: params.get('autoLoginUsername'),
        		password: params.get('autoLoginPassword') || ''
        	};
        	
        	if (params.get('autoLoginDeleteCredentials') != null) {
        		User.clearStoredCredentials();
        	} else if (params.get('autoLoginStoreCredentials') != null && credentials.username) {
        		User.storeCredentials(credentials.username, credentials.password);
        	}
        	
        	return credentials.username && credentials;
        };
        
        User.autoLogin = function autoLogin(maUiSettings) {
        	var credentials = User.getCredentialsFromUrl() || localStorageService.get('storedCredentials');
        	if (!credentials && (maUiSettings || $injector.has('maUiSettings'))) {
        		maUiSettings = maUiSettings || $injector.get('maUiSettings');
        		if (maUiSettings.autoLoginUsername) {
        			credentials = {
    					username: maUiSettings.autoLoginUsername,
    					password: maUiSettings.autoLoginPassword || ''
    				};
        		}
        	}
            if (!credentials) {
            	return $q.reject('No stored credentials');
            }
            return this.login.call(this, credentials).$promise;
        };
        
        User.clearStoredCredentials = function clearStoredCredentials() {
            localStorageService.remove('storedCredentials');
        };
        
        const passwordResetUrl = '/rest/v2/password-reset';
        
        User.sendPasswordResetEmail = function sendPasswordResetEmail(username, email) {
            return $http({
                url: `${passwordResetUrl}/send-email`,
                method: 'POST',
                data: {
                    username,
                    email
                }
            });
        };
        
        User.passwordReset = function passwordReset(token, newPassword) {
            return $http({
                url: `${passwordResetUrl}/reset`,
                method: 'POST',
                data: {
                    token,
                    newPassword
                }
            });
        };

        // returns true if user has any of the desired permissions (can be an array or comma separated string)
        User.prototype.hasPermission = function(desiredPerms) {
            if (this.admin || !desiredPerms) return true;
            if (!this.permissions) return false;

            if (typeof desiredPerms === 'string') {
                desiredPerms = desiredPerms.split(/\s*\,\s*/);
            }

            var userPerms = this.permissions.split(/\s*\,\s*/).filter(function(userPerm) {
                return !!userPerm;
            });
            
            return desiredPerms.some(function(desiredPerm) {
                return userPerms.indexOf(desiredPerm) >= 0;
            });
        };

        User.prototype.getTimezone = function() {
            return this.timezone || this.systemTimezone;
        };

        User.prototype.saveOrUpdate = function() {
            var method = '$save';
            var args = Array.prototype.slice.apply(arguments);
            if (!this.isNew) {
                method = '$update';
                if (!args.length) {
                    args.push({});
                }
                var params = args[0];
                if (!params.username) {
                    params.username = this.originalUsername || this.username;
                }
            }
            return this[method].apply(this, args);
        };
        
        User.prototype.sendTestEmail = function(toEmail, usernameInEmail) {
        	return maServer.sendTestEmail(toEmail || this.email, usernameInEmail || this.username);
        };
        
        User.prototype.getLocale = function() {
            return this.locale || this.systemLocale;
        };
        
        const authTokenBaseUrl = '/rest/v2/auth-tokens';
        
        User.createAuthToken = function createAuthToken(expiry, username) {
            return $http({
                url: `${authTokenBaseUrl}/create`,
                method: 'POST',
                data: {
                    username,
                    expiry
                }
            }).then(response => {
                return response.data.token;
            });
        };

        User.revokeAuthTokens = function revokeAuthTokens(username) {
            let url = `${authTokenBaseUrl}/revoke`;
            if (username != null && username !== (this.current && this.current.username)) {
                url += `/${encodeURIComponent(username)}`;
            }

            return $http({
                url,
                method: 'POST'
            }).then(response => {
                return response.data;
            });
        };

        User.revokeAllAuthTokens = function revokeAllAuthTokens() {
            let url = `${authTokenBaseUrl}/reset-keys`;
            return $http({
                url,
                method: 'POST'
            }).then(response => {
                return response.data;
            });
        };

        User.prototype.createAuthToken = function createAuthToken(expiry) {
            return this.constructor.createAuthToken(expiry);
        };
        
        User.prototype.revokeAuthTokens = function revokeAuthTokens() {
            return this.constructor.revokeAuthTokens();
        };

        // set the initial user and configure initial locale and timezone
        User.setUser(bootstrapUser || null);
        bootstrapUser = undefined;

        return User;
    }
}

export default UserProvider;

