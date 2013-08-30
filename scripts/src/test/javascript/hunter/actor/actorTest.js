describe('The Actor module', function() {
    beforeEach(module('hunter.actor'));

    it('should have a singleton Actor service for injection', inject(function(Actor) {
        expect(Actor).toBeDefined();
    }));

    describe('The ActorDirective', function() {
        var directive = '<div accountkey="1"></div>';

        it('initializes the accountKey of the Actor from an html-element attribute', inject(function($compile, $rootScope, Actor) {
            expect(Actor.accountkey).not.toBeDefined();
            element = angular.element(directive);
            scope = $rootScope.$new();
            linkFn = $compile(directive);
            linkFn(scope);
            scope.$digest();
            expect(Actor.accountkey).toEqual(1);
        }));
    });
});