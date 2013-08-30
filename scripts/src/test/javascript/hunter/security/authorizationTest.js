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
                $httpBackend.when("GET", "/rest/" + i).respond(i, {}, {});
                $http.get("/rest/" + i);
                $httpBackend.flush();
            }
            expect(responseHandlerMock.handleNotAuthorized.callCount).toEqual(1);
            expect(responseHandlerMock.handleNotAuthorized.mostRecentCall.args[0].status).toEqual(401);
        }));

    });

    describe('It contains an Authorizationservice', function() {
        var windowMock;
        beforeEach(function() {
            windowMock = {};
            windowMock.location = {};

            module(function($provide) {
                $provide.value('$window', windowMock);
            });
        });

        it('It will navigate to the logged in area when providing correct credentials', inject(function($httpBackend, AuthorizationService) {
            var success;
            windowMock.location.href = "/";
            $httpBackend.when("POST", "/rest/session", {email: "email@test.de",
                password: "123456"})
                    .respond(202, {}, {});
            AuthorizationService.login("email@test.de", "123456").then(function(res) {
                success = res;
            });
            $httpBackend.flush();
            expect(success).toEqual(true);
            expect(windowMock.location.href).not.toEqual("/");

        }));

        it('It wont navigate to the logged in area, when providing wrong credentials.', inject(function($httpBackend, AuthorizationService) {
            var success;
            windowMock.location.href = "/";
            $httpBackend.when("POST", "/rest/session", {email: "email@test.de",
                password: "123456"})
                    .respond(404, {}, {});
            AuthorizationService.login("email@test.de", "123456").then(function(res) {
                success = res;
            });
            $httpBackend.flush();
            expect(success).toEqual(false);
            expect(windowMock.location.href).toEqual("/");

        }));
        it('After logging out, you will be redirected to the start page', inject(function($httpBackend, AuthorizationService) {
            windowMock.location.href = "/somepage";
            $httpBackend.when("DELETE", "/rest/session")
                    .respond(202, {}, {});
            AuthorizationService.logout();
            $httpBackend.flush();
            expect(windowMock.location.href).not.toEqual("/somepage");

        }));
    });
});
