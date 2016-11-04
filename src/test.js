"use strict";
var promise_1 = require('./promise');
function testPromise() {
    var deferred = new promise_1["default"]();
    setTimeout(function () {
        deferred.resolve('promise is resolved!');
    }, 2000);
    return deferred.promise;
}
var promise = testPromise();
// console.log(promise);
promise.then(function (data) {
    console.log(data);
    return 'inside promise chain1';
}).then(function (data) {
    var deferred = new promise_1["default"]();
    setTimeout(function () {
        deferred.reject('promise is reject!');
    }, 0);
    return deferred.promise;
}).then(function (data) {
    console.log(data);
    return 'inside promise chain2';
}, function (err) {
    console.log(err);
}).then(function (data) {
    console.log(data);
    return 'inside promise chain3';
});
