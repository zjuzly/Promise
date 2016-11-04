"use strict";
var promise_1 = require('./promise');
function testPromise() {
    var deferred = new promise_1["default"]();
    var counter = 0;
    var timer;
    function f() {
        if (++counter > 5) {
            clearTimeout(timer);
            timer = null;
            return;
        }
        deferred.notify('promise progressing...');
        timer = setTimeout(f, 1000);
    }
    f();
    setTimeout(function () {
        deferred.resolve('promise is resolved!');
    }, 10000);
    return deferred.promise;
}
var promise = testPromise();
promise.then(function (data) {
    console.log(data);
    return 'inside promise chain1';
}, function (err) {
}, function (data) {
    console.log(data);
}).then(function (data) {
    console.log(data);
    var deferred = new promise_1["default"]();
    setTimeout(function () {
        // deferred.resolve('then promise is resolved!');
        deferred.reject('then promise is rejected!');
    }, 3000);
    return deferred.promise;
}).catch(function (err) {
    var deferred = new promise_1["default"]();
    console.log(err + ' in catch');
    setTimeout(function () {
        deferred.resolve('catch promise is resolved!');
    }, 3000);
    return deferred.promise;
}).then(function (data) {
    console.log(data);
    return 'inside promise chain2';
}, function (err) {
    console.log(err);
}).then(function (data) {
    console.log(data);
    return 'inside promise chain3';
}).catch(function (err) {
    console.log(err);
}).finally(function (data) {
    console.log('finally ' + data);
});
// Defer.when(promise).then(function(data) {
//    console.log(data);
// }, function(err) {
// }, function (data) {
//     console.log(data);
// }); 
