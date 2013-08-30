describe('The Configuration Module', function() {
    beforeEach(function(){
        module('hunter.configuration');
    });

    it('should configure all httpcalls to the same base url', inject(function($httpBackend, $http) {
        $httpBackend.when('GET','/rest/test').respond(200,200,200);
        var config={
            method:"GET",
            url:"/test"
        };
        $http(config).then(function(response){
           config = response.config;
        });
        $httpBackend.flush();
        expect(config.url).toEqual('/rest/test');

        $http(config).then(function(response){
           config = response.config;
        });
        $httpBackend.flush();
        expect(config.url).toEqual('/rest/test');

    }));


});