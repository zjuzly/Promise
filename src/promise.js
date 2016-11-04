// reference http://stackoverflow.com/questions/17718673/how-is-a-promise-defer-library-implemented
"use strict";
var STATUS = {
    PENDING: 'pending',
    RESOLVE: 'resolved',
    REJECT: 'reject',
    PROGRESS: 'progress'
};
var Promise = (function () {
    function Promise() {
        this.successCallBacks = [];
        this.errCallBacks = [];
        this.progressCallBacks = [];
        this.status = STATUS.PENDING;
        this.data = null;
        this.error = null;
    }
    Promise.prototype.then = function (successCallBack, errCallBack, progressCallBack) {
        var defer = new Defer();
        this.successCallBacks.push({
            call: successCallBack,
            defer: defer
        });
        if (errCallBack) {
            this.errCallBacks.push({
                call: errCallBack,
                defer: defer
            });
        }
        if (progressCallBack) {
            this.progressCallBacks.push({
                call: progressCallBack,
                defer: defer
            });
        }
        if (this.status === STATUS.RESOLVE) {
            this.execCallBack({
                call: successCallBack,
                defer: defer
            }, this.data);
        }
        else if (this.status === STATUS.REJECT) {
            this.execCallBack({
                call: errCallBack,
                defer: defer
            }, this.error);
        }
        else if (this.status === STATUS.PROGRESS) {
            this.execCallBack({
                call: progressCallBack,
                defer: defer
            }, this.error);
        }
        return defer.promise;
    };
    Promise.prototype.execCallBack = function (callbackData, result) {
        var self = this;
        var res = callbackData.call(result);
        if (res instanceof Promise) {
            callbackData.defer.bind(res);
        }
        else if (self.status === STATUS.RESOLVE) {
            callbackData.defer.resolve(res);
        }
        else if (self.status === STATUS.REJECT) {
            callbackData.defer.reject(res);
        }
        else if (self.status === STATUS.PROGRESS) {
        }
    };
    return Promise;
}());
var Defer = (function () {
    function Defer() {
        this.promise = new Promise();
    }
    Defer.prototype.resolve = function (data) {
        var promise = this.promise;
        promise.data = data;
        promise.status = STATUS.RESOLVE;
        promise.successCallBacks.forEach(function (callbackData) {
            promise.execCallBack(callbackData, data);
        });
        this.promise = null;
    };
    Defer.prototype.reject = function (error) {
        var promise = this.promise;
        promise.data = error;
        promise.status = STATUS.REJECT;
        promise.errCallBacks.forEach(function (callbackData) {
            promise.execCallBack(callbackData, error);
        });
        this.promise = null;
    };
    Defer.prototype.notify = function (data) {
        if (!this.promise) {
            return;
        }
        var promise = this.promise;
        promise.data = data;
        promise.status = STATUS.PROGRESS;
        promise.progressCallBacks.forEach(function (callbackData) {
            promise.execCallBack(callbackData, data);
        });
    };
    Defer.prototype.bind = function (promise) {
        var that = this;
        promise.then(function (res) {
            that.resolve(res);
        }, function (err) {
            that.reject(err);
        });
    };
    return Defer;
}());
exports.__esModule = true;
exports["default"] = Defer;
