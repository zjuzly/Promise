import Defer from './promise';

function testPromise() {
    let deferred = new Defer();
    setInterval(function () {
        deferred.notify('promise progressing...');
    }, 1000);
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
});