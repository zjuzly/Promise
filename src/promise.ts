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

    status = STATUS.PENDING;
    error = null;

    constructor() {
        this.successCallBacks = [];
        this.errCallBacks = [];
        this.progressCallBacks = [];
    }
}
(<any>Object).assign(Promise.prototype, {
    then: function (successCallBack, errCallBack?, progressCallBack?) {
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
            
        }

        return <any>defer.promise;
    },

    execCallBack: function (callbackData, result) {
        var self = this;
        let res = callbackData.call(result);
        if (res instanceof Promise) {
            callbackData.defer.bind(res);
        } else if (self.status === STATUS.RESOLVE){
            callbackData.defer.resolve(res);
        } else if (self.status === STATUS.REJECT) {
            callbackData.defer.reject(res);
        } else if (self.status === STATUS.PROGRESS) {
            
        }
    }
});

export default class Defer {
    promise: any;
    constructor() {
        this.promise = new Promise();
    }

    resolve(data) {
        let promise = <any>this.promise;
        promise.data = data;
        promise.status = STATUS.RESOLVE;
        promise.successCallBacks.forEach(function (callbackData) {
            promise.execCallBack(callbackData, data);
        });
    }

    reject(error) {
        let promise = <any>this.promise;
        promise.data = error;
        promise.status = STATUS.REJECT;
        promise.errCallBacks.forEach(function (callbackData) {
            promise.execCallBack(callbackData, error);
        });
    }

    notify(data) {

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