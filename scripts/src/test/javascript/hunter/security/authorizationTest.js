describe('The Authorization Module', function() {
    beforeEach(module('hunter.authorization'));

    describe('It contains a NotAuthizedRequestHandler', function() {
        var deferMock;
        beforeEach(function() {
            deferMock = {reject: jasmine.createSpy(),
                resolve: jasmine.createSpy()};

            module(function($provide) {
                $provide.value('$q', deferMock);
            });
        });
        it('It rejects 401 ', inject(function(NotAuthorizedRequestHandler) {
            NotAuthorizedRequestHandler.handleNotAuthorized({});
            expect(deferMock.reject).toHaveBeenCalled();
            expect(deferMock.resolve).not.toHaveBeenCalled();
        })
                );
    });

    describe('It contains a responseInterceptor for not authorized Requests.', function() {
        var responseHandlerMock;
        beforeEach(function() {
            responseHandlerMock = {
                handleNotAuthorized: jasmine.createSpy()
            };

            module(function($provide) {
                $provide.value('NotAuthorizedRequestHandler', responseHandlerMock);
            });
        });
        it('Only on HTTP-Error 401 it should call the NotAuthorizedRequestHandler', inject(function($httpBackend, $http) {

            for (var i = 200; i < 600; i++) {
                $httpBackend.when("GET", i).respond(i, i, {});
                $http.get(i);
                $httpBackend.flush();
            }
            expect(responseHandlerMock.handleNotAuthorized.callCount).toEqual(1);
            expect(responseHandlerMock.handleNotAuthorized.mostRecentCall.args[0].status).toEqual(401);
        }));

    });
});
