"use strict";
const setMaximalConcurrency = (asyncFunction, threads) => {
    let free = threads;
    const queue = [];
    const run = () => {
        if (free) {
            const task = queue.shift();
            if (task) {
                free--;
                const {args, resolve, reject} = task;
                asyncFunction(...args)
                    .then(resolve)
                    .catch(reject);
            }
        }
    };
    return (...args) =>
        new Promise((res, rej) => {
            queue.push({
                args,
                resolve: value => {
                    free++;
                    run();
                    return res(value);
                },
                reject: reason => {
                    free++;
                    run();
                    return rej(reason);
                }
            });
            run();
        });
};
const setThrottling = (asyncFunction, timeout) => {
    let allowed = true;
    const queue = [];
    const run = () => {
        if (allowed) {
            const task = queue.shift();
            if (task) {
                allowed = false;
                setTimeout(() => {
                    allowed = true;
                    run();
                }, timeout);
                const {args, resolve, reject} = task;
                asyncFunction(...args)
                    .then(resolve)
                    .catch(reject);
            }
        }
    };
    return (...args) =>
        new Promise((resolve, reject) => {
            queue.push({
                args,
                resolve,
                reject
            });
            run();
        });
};
const setRetryCount = (asyncFunction, count = Infinity) => (...args) =>
    count
        ? asyncFunction(...args).catch(() =>
            setRetryCount(asyncFunction, count - 1)(...args)
        )
        : asyncFunction(...args);
module.exports = {
    setMaximalConcurrency,
    setThrottling,
    setRetryCount
};
