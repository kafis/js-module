describe('The Validation Module', function() {
    beforeEach(module('hunter.validation'));

    describe('The ServerValidationDirective', function() {
        var element,
                scope,
                ngModelCtrl,
                serverValidationCtrl,
                validator;
        beforeEach(inject(function($controller, $rootScope, $q) {
            scope = $rootScope.$new();
            element = angular.element("<div></div>");
            ngModelCtrl = {
                $modelValue: undefined,
                $setValidity: function() {},
                $setViewValue: function() {},
                $viewChangeListeners: []
            };
            defered = $q.defer();
            validator = {
                validate: function(value){
                    return defered.promise;
                },
                getDefered: function(){
                    return defered;
                }
            };
            spyOn(validator, 'validate').andCallThrough();
            spyOn(ngModelCtrl,'$setValidity');
            spyOn(ngModelCtrl,'$setViewValue');
            serverValidationCtrl = $controller('ServerValidationCtrl', {$scope: scope, $element: element});
            serverValidationCtrl.addNgModelCtrl(ngModelCtrl);
            serverValidationCtrl.$addPendingValidator("test",validator.validate);
        }));

        it('should not validate, when model is undefined', function() {
            serverValidationCtrl.$modelChanged();
            serverValidationCtrl.validate();
            expect(validator.validate).not.toHaveBeenCalled();
            expect(ngModelCtrl.$setValidity).not.toHaveBeenCalled();
            expect(element).not.toHaveClass('ng-pending');
        });
        it('should not validate, when model is not changed', function() {
           ngModelCtrl.$modelValue = "test";
            serverValidationCtrl.validate();
            expect(validator.validate).not.toHaveBeenCalled();
            expect(ngModelCtrl.$setValidity).not.toHaveBeenCalled();
            expect(element).not.toHaveClass('ng-pending');
        });
        it('should validate, when model is changed', function() {
            ngModelCtrl.$modelValue = "test";
            serverValidationCtrl.$modelChanged();
            serverValidationCtrl.validate();
            expect(validator.validate).toHaveBeenCalled();
            expect(ngModelCtrl.$setValidity).not.toHaveBeenCalled();
            expect(element).toHaveClass('ng-pending');
        });
        it('should set validity to true', function() {
            ngModelCtrl.$modelValue = "test";
            serverValidationCtrl.$modelChanged();
            serverValidationCtrl.validate();
            expect(element).toHaveClass('ng-pending');
            validator.getDefered().resolve(true);
            scope.$digest();
            expect(validator.validate).toHaveBeenCalled();
            expect(ngModelCtrl.$setValidity).toHaveBeenCalledWith("test",true);
            expect(element).not.toHaveClass('ng-pending');
        });
        it('should set validity to false', function() {
            ngModelCtrl.$modelValue = "test";
            serverValidationCtrl.$modelChanged();
            serverValidationCtrl.validate();
            expect(element).toHaveClass('ng-pending');
            validator.getDefered().reject(true);
            scope.$digest();
            expect(validator.validate).toHaveBeenCalled();
            expect(ngModelCtrl.$setValidity).toHaveBeenCalledWith("test",false);
            expect(ngModelCtrl.$setViewValue).toHaveBeenCalledWith(undefined);
            expect(element).not.toHaveClass('ng-pending');
        });
        it('should set the pending key on the control while executing', function() {
            ngModelCtrl.$modelValue = "test";
            serverValidationCtrl.$modelChanged();
            serverValidationCtrl.validate();
            expect(ngModelCtrl.$pending.test).toBe(true);
            validator.getDefered().reject(true);
            scope.$digest();
            expect(ngModelCtrl.$pending.test).toBe(false);
        });
    });


    describe('The EqualsToDirective', function() {
        var scope,
            inputA,
            inputB;
        beforeEach(inject(function($compile, $rootScope){
            scope = $rootScope.$new();
            scope.password="";

            inputA = angular.element('<input name="password" ng-model="password" type="text"/>');
            inputB = angular.element('<input name="repeat" ng-model="repeat" type="text" equal-to="password"/>');

            form = angular.element('<form name="test"/>').append(inputA).append(inputB);

            $compile(form)(scope);
            scope.$digest();
        }));

        it('should be valid, when both values are equasl',function(){
           scope.test.repeat.$setViewValue("password");
           scope.test.password.$setViewValue("password");
           scope.$digest();
           expect(scope.test.repeat.$valid).toBe(true);
           expect(scope.test.$valid).toBe(true);
        });
        it('should be invalid, when both values are not equasl',function(){
            scope.test.repeat.$setViewValue("passwo");
           scope.test.password.$setViewValue("password");

           scope.$digest();
           expect(scope.test.repeat.$valid).toBe(false);
           expect(scope.test.$valid).toBe(false);
        });
        it('should be invalid, when the value of the first is changed',function(){
           scope.test.password.$setViewValue("password");
           scope.test.repeat.$setViewValue("password");
scope.$digest();
           scope.test.password.$setViewValue("passwor");
           scope.$digest();
           expect(scope.test.repeat.$valid).toBe(false);
           expect(scope.test.$valid).toBe(false);
        });

    });
});