import Defer from './promise';

function testPromise() {
    let deferred = new Defer();
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
    let deferred = new Defer();
    setTimeout(function () {
        deferred.reject('promise is reject!');
    }, 0);
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