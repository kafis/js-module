(function(angular) {
    var module = angular.module('hunter.validation', []),
            ServerSideValidationDirective,
            EMailAvailableDirective,
            ServerValidationController;

    ServerValidationController = function($scope, $element) {
        var ngModelCtrl = {},
                pendingValidators = 0,
                validators = {},
                pending = {},
                modelValueChanged = false,
                pendingCtrl = this,
                togglePendingCss = function() {
            if (pendingValidators > 0) {
                $element.addClass("ng-pending");
            } else {
                $element.removeClass("ng-pending");
            }
        };
        this.$modelChanged = function() {
            modelValueChanged = true;
        };
        this.$setPending = function(key, isPending) {
            if (isPending) {
                pendingValidators++;
            }
            else {
                pendingValidators--;
            }
            pending[key] = isPending;
        };

        this.addNgModelCtrl = function(ctrl) {
            ngModelCtrl = ctrl;
            ngModelCtrl.$pending = pending;
            ngModelCtrl.$viewChangeListeners.push(this.$modelChanged);
        };
        this.$addPendingValidator = function(key, validation) {
            validators[key] = validation;
            pending[key] = false;
        };
        this.validate = function() {
            if (ngModelCtrl.$modelValue !== undefined && modelValueChanged) {
                modelValueChanged = false;
                angular.forEach(validators, function(fn, key) {
                    $scope.$apply(pendingCtrl.$setPending(key, true));
                    togglePendingCss();
                    fn(ngModelCtrl.$modelValue).then(function(value) {
                        ngModelCtrl.$setValidity(key, true);
                    }, function(value) {
                        ngModelCtrl.$setValidity(key, false);
                        ngModelCtrl.$setViewValue(undefined);
                    })['finally'](function() {
                        pendingCtrl.$setPending(key, false);
                        togglePendingCss();
                    });
                });
            }
        };
    };
    ServerValidationController.$inject = ['$scope', '$element'];
    module.controller('ServerValidationCtrl', ServerValidationController);

    ServerSideValidationDirective = function() {
        return {
            restrict: 'A',
            controller: 'ServerValidationCtrl',
            require: ['serverValidation', 'ngModel'],
            link: function(scope, elm, attr, ctrl) {
                ctrl[0].addNgModelCtrl(ctrl[1]);
                elm.on('blur', ctrl[0].validate);
            }
        };
    };
    module.directive('serverValidation', ServerSideValidationDirective);

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