(function(angular) {
    var module = angular.module('hunter.authorization', ['hunter.actor','hunter.configuration']),
            AuthorizationService,
            NotAuthorizedRequestInterceptor,
            NotAuthorizedRequestHandler;

    AuthorizationService = function($http, $window, $q, configuration){
        return{
            login: function(email,password){
                var result = $q.defer();
                $http({
                    method:'POST',
                    url:'/session',
                    data:{
                        email:email,
                        password:password
                    }
                }).then(function(response){
                    result.resolve(true);
                    $window.location.href = configuration.getHomePage();
                },function(response){
                    result.resolve(false);
                });
                return result.promise;
            },
            logout: function(){
                $http({
                    method: 'DELETE',
                    url: '/session'}).then(function(){
                    $window.location.href = configuration.getWelcomePage();
                });
            }
        };

    };
    AuthorizationService.$inject = ["$http", "$window", "$q", "ConfigurationService"];
    module.factory('AuthorizationService', AuthorizationService);

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