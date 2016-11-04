import Defer from './promise';

function testPromise() {
    let deferred = new Defer();
    let counter = 0;
    let timer;
    function f() {
        if (++counter > 5) {
            clearTimeout(timer);
            timer = null;
            return ;
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
    let deferred = new Defer();
    setTimeout(function () {
        deferred.resolve('then promise is resolved!');
    }, 3000);
    return deferred.promise;
}).then(function (data) {
    console.log(data);
    return 'inside promise chain2';
}, function(err) {
    console.log(err);
}).then(function (data) {
    console.log(data);
    return 'inside promise chain3';
}).finally(function () {
    console.log('finally');
});

// Defer.when(promise).then(function(data) {
//    console.log(data);
// }, function(err) {

// }, function (data) {
//     console.log(data);
// });