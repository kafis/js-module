(function(angular){
    var module = angular.module('hunter.configuration', []),
        ConfigurationService,
        BaseUrlInterceptor;

        ConfigurationService = function(){
            function getter(value){
                return function(){
                    return value;
                };
            }
            return {
                getWelcomePage: getter("/"),
                getHomePage:getter("/home"),
                getRestBaseUrl: getter("/rest")
            };
        };
        module.factory("ConfigurationService",ConfigurationService);

        BaseUrlInterceptor = function(configuration){
            return{
                'request': function(config){
                    if(config.url.indexOf(configuration.getRestBaseUrl())!==0){
                        config.url = configuration.getRestBaseUrl() + config.url;
                    }
                    return config;
                }
            };
        };
        BaseUrlInterceptor.$inject =['ConfigurationService'];
        module.factory("BaseUrlInterceptor",BaseUrlInterceptor);

        module.config(['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push('BaseUrlInterceptor');
        }]);

}(angular));