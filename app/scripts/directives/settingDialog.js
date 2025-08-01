(function () {
    'use strict';

    angular.module('ariaNg').directive('ngSettingDialog', ['ariaNgCommonService', 'aria2SettingService', 'ariaNgNativeElectronService', function (ariaNgCommonService, aria2SettingService, ariaNgNativeElectronService) {
        return {
            restrict: 'E',
            templateUrl: 'views/setting-dialog.html',
            replace: true,
            scope: {
                setting: '='
            },
            link: function (scope, element, attrs) {
                scope.context = {
                    isLoading: false,
                    availableOptions: [],
                    globalOptions: []
                };

                scope.setGlobalOption = function (key, value, optionStatus) {
                    return aria2SettingService.setGlobalOption(key, value, function (response) {
                        if (response.success && response.data === 'OK') {
                            optionStatus.setSuccess();
                        } else {
                            optionStatus.setFailed(response.data.message);
                        }
                    }, true);
                };

                var loadOptions = function (type) {
                    var keys = aria2SettingService.getAria2QuickSettingsAvailableOptions(type);

                    if (!keys) {
                        ariaNgCommonService.showError('Type is illegal!');
                        return;
                    }

                    scope.context.availableOptions = aria2SettingService.getSpecifiedOptions(keys);
                };

                var loadAria2OptionsValue = function () {
                    scope.context.isLoading = true;

                    return aria2SettingService.getGlobalOption(function (response) {
                        scope.context.isLoading = false;

                        if (response.success) {
                            scope.context.globalOptions = response.data;
                        }
                    });
                };

                angular.element(element).on('show.bs.modal', function () {
                    ariaNgNativeElectronService.updateTitleBarBackgroundColorWithModalOverlay();
                });

                angular.element(element).on('hide.bs.modal', function () {
                    ariaNgNativeElectronService.updateTitleBarBackgroundColor();
                });

                angular.element(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.setting = null;
                        scope.context.availableOptions = [];
                        scope.context.globalOptions = [];
                    });
                });

                scope.$watch('setting', function (setting) {
                    if (setting) {
                        loadOptions(setting.type);
                        loadAria2OptionsValue();

                        angular.element(element).modal('show');
                    }
                }, true);
            }
        };
    }]);
}());
