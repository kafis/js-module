(function(angular) {
    var module = angular.module('hunter.authorization', []),
            NotAuthorizedRequestInterceptor,
            NotAuthorizedRequestHandler;

    NotAuthorizedRequestHandler = function($q, $window) {
        return{
            handleNotAuthorized: function(response) {
                return $q.reject(response);
            }
        };
    };
    NotAuthorizedRequestHandler.$inject = ["$q", "$window"];
    module.factory('NotAuthorizedRequestHandler', NotAuthorizedRequestHandler);

    NotAuthorizedRequestInterceptor = function($q, NotAuthorizedRequestHandler) {
        return{
            'responseError': function(response) {
                if (response.status === 401) {
                    return NotAuthorizedRequestHandler.handleNotAuthorized(response);
                }
                return $q.reject(response);
            }
        };
    };
    NotAuthorizedRequestInterceptor.$inject = ["$q", "NotAuthorizedRequestHandler"];
    module.factory('NotAuthorizedRequestInterceptor', NotAuthorizedRequestInterceptor);


    module.config(['$httpProvider', function($httpProvider) {

            $httpProvider.interceptors.push('NotAuthorizedRequestInterceptor');
        }]);

}(angular));