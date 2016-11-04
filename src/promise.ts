// reference http://stackoverflow.com/questions/17718673/how-is-a-promise-defer-library-implemented

const STATUS = {
    PENDING: 'pending',
    RESOLVE: 'resolved',
    REJECT: 'reject',
    PROGRESS: 'progress'
}

class Promise {
    successCallBacks:   Array<Object>;
    errCallBacks:       Array<Object>;
    progressCallBacks:  Array<Object>;
    finallyCallBack:    Function;

    status:             string;
    data;
    error;
    __defer__;

    constructor() {
        this.successCallBacks = [];
        this.errCallBacks = [];
        this.progressCallBacks = [];
        this.finallyCallBack = null;
        this.status = STATUS.PENDING;
        this.data = null;
        this.error = null;
    }

    then(successCallBack, errCallBack?, progressCallBack?) {
        var defer = new Defer();
        this.__defer__ = defer;
        if (successCallBack) {
            this.successCallBacks.push({
                call: successCallBack,
                defer: defer
            });
        }

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
        } else if (this.status === STATUS.REJECT) {
            this.execCallBack({
                call: errCallBack,
                defer: defer
            }, this.error);
        } else if (this.status === STATUS.PROGRESS) {
            this.execCallBack({
                call: progressCallBack,
                defer: defer
            }, this.error);
        }

        return <any>defer.promise;
    }

    catch(errCallBack) {
        return this.then(null, errCallBack);
    }

    finally(finallyCallBack) {
        this.finallyCallBack = finallyCallBack;
    }

    execCallBack(callbackData, result) {
        var self = this;
        if (!callbackData) {
            if (self.__defer__) {
                self.__defer__.resolve(result);
            }
            return ;
        }
        let res = callbackData.call(result);
        if (res instanceof Promise) {
            callbackData.defer.bind(res);
        } else if (self.status === STATUS.RESOLVE){
            callbackData.defer.resolve(res);
        } else if (self.status === STATUS.REJECT) {
            callbackData.defer.reject(result, true);
        } else if (self.status === STATUS.PROGRESS) {
            
        }
    }
}

export default class Defer {
    promise: any;
    constructor() {
        this.promise = new Promise();
    }

    static when(args?) {
        if (args instanceof Promise) {
            return args;
        }
        let deferred = new Defer();
        setTimeout(function () {
            if (args) {
                if (args instanceof Function) {
                    deferred.resolve(args());
                } else {
                    deferred.resolve(args);
                }
            } else {
                deferred.resolve();
            }
        }, 0);
        return deferred.promise;
    }

    resolve(data?) {
        let promise = <any>this.promise;
        promise.data = data;
        promise.status = STATUS.RESOLVE;
        promise.successCallBacks.forEach(function (callbackData) {
            promise.execCallBack(callbackData, data);
        });
        if (promise.successCallBacks.length == 0) {
            promise.execCallBack(null, data);
        }
        if (promise.finallyCallBack) {
            promise.finallyCallBack(data);
            this.promise = null;
        }
        return promise;
    }

    reject(error?, gotoFinally?) {
        let promise = <any>this.promise;
        promise.error = error;
        promise.status = STATUS.REJECT;
        if (promise.finallyCallBack) {
            promise.finallyCallBack(error);
            this.promise = null;
        } else {
            if (!gotoFinally) {
                promise.errCallBacks.forEach(function (callbackData) {
                    promise.execCallBack(callbackData, error);
                });
            } else if (promise.__defer__) {
                promise.__defer__.reject(error, gotoFinally);
            }
        }
        return promise;     
    }

    notify(data?) {
        if (!this.promise) {
            return ;
        }
        let promise = <any>this.promise;
        promise.data = data;
        promise.status = STATUS.PROGRESS;
        promise.progressCallBacks.forEach(function (callbackData) {
            promise.execCallBack(callbackData, data);
        });
    }

    bind(promise) {
        let that = this;
        promise.then(function (res) {
            that.resolve(res);
        }, function(err) {
            that.reject(err);
        });
    }
}