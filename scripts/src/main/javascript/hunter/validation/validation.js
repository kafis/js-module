(function(angular) {
    var module = angular.module('hunter.validation', []),
            ServerSideValidationDirective,
            EMailAvailableDirective,
            ServerValidationController;

    ServerValidationController = function($scope,$element){
                var ngModelCtrl = {},
                    pendingValidators = 0,
                    validators = {},
                    pending = {},
                    modelValueChanged = false,
                    togglePendingCss = function() {
                        if (pendingValidators > 0) {
                          $element.addClass("ng-pending");
                        } else {
                            $element.removeClass("ng-pending");
                        }
                    };

                this.$pending = pending;
                this.$modelChanged = function(){
                    modelValueChanged = true;
                };
                this.addNgModelCtrl = function(ctrl){
                    ngModelCtrl = ctrl;
                    ngModelCtrl.$viewChangeListeners.push(this.$modelChanged);
                };
                this.$addPendingValidator = function(key, validation) {
                    validators[key] = validation;
                    this.$pending[key] = false;
                };
                this.validate = function(){
                    if (ngModelCtrl.$modelValue !== undefined && modelValueChanged) {
                        modelValueChanged = false;
                        angular.forEach(validators, function(fn, key) {
                            pending[key] = true;
                            pendingValidators++;
                            togglePendingCss();
                            fn(ngModelCtrl.$modelValue).then(function(value) {
                                ngModelCtrl.$setValidity(key, true);
                            }, function(value) {
                                ngModelCtrl.$setValidity(key, false);
                                ngModelCtrl.$setViewValue(undefined);
                            })['finally'](function() {
                                pendingValidators--;
                                pending[key] = false;
                                togglePendingCss();
                            });
                        });
                    }
                };
            };
    ServerValidationController.$inject = ['$scope','$element'];
    module.controller('ServerValidationCtrl',ServerValidationController);

    ServerSideValidationDirective = function() {
        return {
            restrict: 'A',
            controller: 'ServerValidationCtrl',
            require: ['serverValidation','ngModel'],
            link: function(scope, elm, attr, ctrl) {
                ctrl[0].addNgModelCtrl(ctrl[1]);
                elm.on('blur',ctrl[0].validate);
            }
        };
    };
    module.directive('serverValidation',ServerSideValidationDirective);

    EMailAvailableDirective = function($http) {
        return {
            restrict: 'A',
            require: 'serverValidation',
            link: function(scope, elm, attr, ctrl) {
                ctrl.$addPendingValidator('emailAvailable', function(email) {
                    return $http({
                        url: "/emails/" + email,
                        method: "GET"
                    });
                });
            }
        };
    };
    EMailAvailableDirective.$inject = ["$http"];
    module.directive("emailAvailable", EMailAvailableDirective);

}(angular));