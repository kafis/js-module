(function(angular){
    var module = angular.module('hunter.actor', []),
        Actor,
        ActorDirective;

        /**
     * An Actor contains the Basic Informations about the current User, that is
     * authenticated and interacts with the Application.
     * An Actor is an Injectable Service and therefore available in all Modules.
     * An Actor is initialized on PageLoad via the ActorCtrl and ActorDirective and
     * is immedeately available.
     * @returns {undefined}
     */
    Actor = function(){
        return {

        };
    };
    module.factory("Actor", Actor);

    ActorDirective = function(Actor){

        return {
            restrict: 'A',
            link: function($scope, element, attributes, ctrl) {

                Actor.accountkey = parseInt(attributes.accountkey,10);
            }};
    };
    ActorDirective.$inject= ["Actor"];
    module.directive("accountkey",ActorDirective);



}(angular));