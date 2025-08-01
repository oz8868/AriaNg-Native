(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgCommonService', ['$window', '$location', '$timeout', 'base64', 'moment', 'SweetAlert', 'ariaNgConstants', 'ariaNgLocalizationService', 'ariaNgNativeElectronService', function ($window, $location, $timeout, base64, moment, SweetAlert, ariaNgConstants, ariaNgLocalizationService, ariaNgNativeElectronService) {
        var getTimeOption = function (time) {
            var name = '';
            var value = time;

            if (time < 1000) {
                value = time;
                name = (value === 1 ? 'format.time.millisecond' : 'format.time.milliseconds');
            } else if (time < 1000 * 60) {
                value = time / 1000;
                name = (value === 1 ? 'format.time.second' : 'format.time.seconds');
            } else if (time < 1000 * 60 * 24) {
                value = time / 1000 / 60;
                name = (value === 1 ? 'format.time.minute' : 'format.time.minutes');
            } else {
                value = time / 1000 / 60 / 24;
                name = (value === 1 ? 'format.time.hour' : 'format.time.hours');
            }

            return {
                name: name,
                value: value,
                optionValue: time
            };
        };

        var showDialog = function (title, text, type, callback, options) {
            $timeout(function () {
                ariaNgNativeElectronService.updateTitleBarBackgroundColorWithSweetAlertOverlay();

                SweetAlert.swal({
                    title: title,
                    text: text,
                    type: type,
                    confirmButtonText: options && options.confirmButtonText || null
                }, function () {
                    ariaNgNativeElectronService.updateTitleBarBackgroundColor();

                    if (callback) {
                        callback();
                    }
                });
            }, 100);
        };

        var showConfirmDialog = function (title, text, type, callback, notClose, extendSettings) {
            var options = {
                title: title,
                text: text,
                type: type,
                showCancelButton: true,
                showLoaderOnConfirm: !!notClose,
                closeOnConfirm: !notClose,
                confirmButtonText: extendSettings && extendSettings.confirmButtonText || null,
                cancelButtonText: extendSettings && extendSettings.cancelButtonText || null
            };

            if (type === 'warning') {
                options.confirmButtonColor = '#F39C12';
            }

            ariaNgNativeElectronService.updateTitleBarBackgroundColorWithSweetAlertOverlay();

            SweetAlert.swal(options, function (isConfirm) {
                ariaNgNativeElectronService.updateTitleBarBackgroundColor();

                if (!isConfirm) {
                    return;
                }

                if (callback) {
                    callback();
                }
            });
        }

        return {
            getFullPageUrl: function () {
                return $window.location.protocol + '//'
                    + $window.location.host
                    + $window.location.pathname
                    + ($window.location.search ? $window.location.search : '');
            },
            base64Encode: function (value) {
                return base64.encode(value);
            },
            base64Decode: function (value) {
                return base64.decode(value);
            },
            base64UrlEncode: function (value) {
                return base64.urlencode(value);
            },
            base64UrlDecode: function (value) {
                return base64.urldecode(value);
            },
            generateUniqueId: function () {
                var sourceId = ariaNgConstants.appPrefix + '_' + Math.round(new Date().getTime() / 1000) + '_' + Math.random();
                var hashedId = this.base64Encode(sourceId);

                return hashedId;
            },
            showDialog: function (title, text, type, callback, extendSettings) {
                if (!extendSettings) {
                    extendSettings = {};
                }

                if (title) {
                    title = ariaNgLocalizationService.getLocalizedText(title);
                }

                if (text) {
                    text = ariaNgLocalizationService.getLocalizedText(text, extendSettings.textParams);
                }

                extendSettings.confirmButtonText = ariaNgLocalizationService.getLocalizedText('OK');

                showDialog(title, text, type, callback, extendSettings);
            },
            showInfo: function (title, text, callback, extendSettings) {
                this.showDialog(title, text, 'info', callback, extendSettings);
            },
            showError: function (text, callback, extendSettings) {
                this.showDialog('Error', text, 'error', callback, extendSettings);
            },
            showOperationSucceeded: function (text, callback) {
                this.showDialog('Operation Succeeded', text, 'success', callback);
            },
            confirm: function (title, text, type, callback, notClose, extendSettings) {
                if (!extendSettings) {
                    extendSettings = {};
                }

                if (title) {
                    title = ariaNgLocalizationService.getLocalizedText(title);
                }

                if (text) {
                    text = ariaNgLocalizationService.getLocalizedText(text, extendSettings.textParams);
                }

                extendSettings.confirmButtonText = ariaNgLocalizationService.getLocalizedText('OK');
                extendSettings.cancelButtonText = ariaNgLocalizationService.getLocalizedText('Cancel');

                showConfirmDialog(title, text, type, callback, notClose, extendSettings);
            },
            closeAllDialogs: function () {
                SweetAlert.close();
            },
            getFileExtension: function (filePath) {
                if (!filePath || filePath.lastIndexOf('.') < 0) {
                    return filePath;
                }

                return filePath.substring(filePath.lastIndexOf('.'));
            },
            parseUrlsFromOriginInput: function (s) {
                if (!s) {
                    return [];
                }

                var lines = s.split('\n');
                var result = [];

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];

                    if (line.match(/^(http|https|ftp|sftp):\/\/.+$/)) {
                        result.push(line);
                    } else if (line.match(/^magnet:\?.+$/)) {
                        result.push(line);
                    }
                }

                return result;
            },
            decodePercentEncodedString: function (s) {
                if (!s) {
                    return s;
                }

                var ret = '';

                for (var i = 0; i < s.length; i++) {
                    var ch = s.charAt(i);

                    if (ch === '%' && i < s.length - 2) {
                        var code = s.substring(i + 1, i + 3);
                        ret += String.fromCharCode(parseInt(code, 16));
                        i += 2;
                    } else {
                        ret += ch;
                    }
                }

                return ret;
            },
            extendArray: function (sourceArray, targetArray, keyProperty) {
                if (!targetArray || !sourceArray || sourceArray.length !== targetArray.length) {
                    return false;
                }

                for (var i = 0; i < targetArray.length; i++) {
                    if (targetArray[i][keyProperty] === sourceArray[i][keyProperty]) {
                        angular.extend(targetArray[i], sourceArray[i]);
                    } else {
                        return false;
                    }
                }

                return true;
            },
            copyObjectTo: function (from, to) {
                if (!to) {
                    return from;
                }

                for (var name in from) {
                    if (!from.hasOwnProperty(name)) {
                        continue;
                    }

                    var fromValue = from[name];
                    var toValue = to[name];

                    if (angular.isObject(fromValue) || angular.isArray(fromValue)) {
                        to[name] = this.copyObjectTo(from[name], to[name]);
                    } else {
                        if (fromValue !== toValue) {
                            to[name] = fromValue;
                        }
                    }
                }

                return to;
            },
            pushArrayTo: function (array, items) {
                if (!angular.isArray(array)) {
                    array = [];
                }

                if (!angular.isArray(items) || items.length < 1) {
                    return array;
                }

                for (var i = 0; i < items.length; i++) {
                    array.push(items[i]);
                }

                return array;
            },
            combineArray: function () {
                var result = [];

                for (var i = 0; i < arguments.length; i++) {
                    if (angular.isArray(arguments[i])) {
                        this.pushArrayTo(result, arguments[i]);
                    } else {
                        result.push(arguments[i]);
                    }
                }

                return result;
            },
            countArray: function (array, value) {
                if (!angular.isArray(array) || array.length < 1) {
                    return 0;
                }

                var count = 0;

                for (var i = 0; i < array.length; i++) {
                    count += (array[i] === value ? 1 : 0);
                }

                return count;
            },
            parseOrderType: function (value) {
                var values = value.split(':');

                var obj = {
                    type: values[0],
                    order: values[1],
                    equals: function (obj) {
                        if (angular.isUndefined(obj.order)) {
                            return this.type === obj.type;
                        } else {
                            return this.type === obj.type && this.order === obj.order;
                        }
                    },
                    getValue: function () {
                        return this.type + ':' + this.order;
                    }
                };

                Object.defineProperty(obj, 'reverse', {
                    get: function () {
                        return this.order === 'desc';
                    },
                    set: function (value) {
                        this.order = (value ? 'desc' : 'asc');
                    }
                });

                return obj;
            },
            getCurrentUnixTime: function () {
                return moment().format('X');
            },
            getLongTimeFromUnixTime: function (unixTime) {
                return moment(unixTime, 'X').format('HH:mm:ss');
            },
            isUnixTimeAfter: function (datetime, duration, unit) {
                return moment(datetime, 'X').isAfter(moment().add(duration, unit));
            },
            formatDateTime: function (datetime, format) {
                return moment(datetime).format(format);
            },
            getTimeOption: function (time) {
                return getTimeOption(time);
            },
            getTimeOptions: function (timeList, withDisabled) {
                var options = [];

                if (withDisabled) {
                    options.push({
                        name: 'Disabled',
                        value: 0,
                        optionValue: 0
                    });
                }

                if (!angular.isArray(timeList) || timeList.length < 1) {
                    return options;
                }

                for (var i = 0; i < timeList.length; i++) {
                    var time = timeList[i];
                    var option = getTimeOption(time);

                    options.push(option);
                }

                return options;
            }
        };
    }]);
}());
