import React, { Component } from "react";

class NewPromise extends Component {
  componentDidMount() {
    this.newPromiseTest();
  }

  newPromiseTest = () => {
    // 定义常量 promise的状态
    const PENDING = "pending";
    const RESOLVED = "resolved";
    const REJECTED = "rejected";

    console.log("执行函数");

    // promise构造函数 参数为所要异步的函数
    function MyPromise(fn) {
      console.log("new promise", fn);
      const that = this; // 保存正确的this
      that.state = PENDING; // 初始化promise状态
      that.value = null; // 保存成功或者失败中返回的值
      that.resolvedCallbacks = []; // 存储then中成功回调的函数
      that.rejectedCallbacks = []; // 存储then中失败回调的函数

      // 函数内部resolve方法 promise内部定义 外部调用
      function resolve(value) {
        console.log("内部成功函数", value);
        if (value instanceof MyPromise) {
          // 如果成功传递一个promise等传入promise状态改变
          return value.then(resolve, reject);
        }

        // 保证函数执行顺序
        setTimeout(() => {
          if (that.state === PENDING) {
            that.state = RESOLVED;
            that.value = value;
            that.resolvedCallbacks.forEach(cb => cb(that.value));
          }
        }, 0);
      }

      // 函数内部rejected方法
      function reject(value) {
        console.log("内部失败函数", value);
        // 保证函数执行顺序
        setTimeout(() => {
          if (that.state === PENDING) {
            that.state = REJECTED;
            that.value = value;
            that.rejectedCallbacks.forEach(cb => cb(that.value));
          }
        }, 0);
      }

      // 立即执行传入promise的函数 并将resolve和reject作为参数
      try {
        fn(resolve, reject);
      } catch (e) {
        reject(e);
      }
    }

    // 定义promise的then函数返回新的promise
    MyPromise.prototype.then = function(onFulfilled, onRejected) {
      const that = this;
      console.log("进入then函数", that.state);
      onFulfilled = typeof onFulfilled === "function" ? onFulfilled : v => v;
      onRejected =
        typeof onRejected === "function"
          ? onRejected
          : v => {
              throw v;
            };

      function resolutionProcedure(promise2, x, resolve, reject) {
        // 防止循环引用
        console.log("promise防止引用", promise2, x);
        if (promise2 === x) {
          return reject(new TypeError("error"));
        }

        // 如果返回的是promise继续调用
        if (x instanceof MyPromise) {
          x.then(function(value) {
            resolutionProcedure(promise2, value, resolve, reject);
          }, reject);
        }

        let called = false; // 判断是否已经调用过函数

        if (x !== null && (typeof x === "object" || typeof x === "function")) {
          try {
            let then = x.then;
            if (typeof then === "function") {
              // 调用x的this中的then方法
              then.call(
                x,
                y => {
                  // 成功的回调
                  if (called) return;
                  called = true;
                  resolutionProcedure(promise2, y, resolve, reject);
                },
                e => {
                  // 失败的回调
                  if (called) return;
                  called = true;
                  reject(e);
                }
              );
            } else {
              resolve(x);
            }
          } catch (e) {
            if (called) return;
            called = true;
            reject(e);
          }
        } else {
          // 返回的不是对象和函数直接调用resolve
          resolve(x);
        }
      }

      if (that.state === RESOLVED) {
        console.log("成功", that.value);
        let promise2 = new MyPromise((resolve, reject) => {
          setTimeout(() => {
            try {
              const x = onFulfilled(that.value);
              console.log("x", x);
              resolutionProcedure(promise2, x, resolve, reject);
            } catch (r) {
              reject(r);
            }
          }, 0);
        });

        return promise2;
      } else if (that.state === REJECTED) {
        let promise2 = new MyPromise((resolve, reject) => {
          setTimeout(() => {
            try {
              const x = onRejected(that.value);
              resolutionProcedure(promise2, x, resolve, reject);
            } catch (r) {
              reject(r);
            }
          }, 0);
        });

        return promise2;
      } else if (that.state === PENDING) {
        // 返回promise对象 promise传入自定义函数实现存储回调
        let promise2 = new MyPromise((resolve, reject) => {
          // 将回调存储
          that.resolvedCallbacks.push(() => {
            try {
              const x = onFulfilled(that.value);
              console.log("x", x);
              resolutionProcedure(promise2, x, resolve, reject);
            } catch (r) {
              reject(r);
            }
          });

          that.rejectedCallbacks.push(() => {
            try {
              const x = onRejected(that.value);
              resolutionProcedure(promise2, x, resolve, reject);
            } catch (r) {
              reject(r);
            }
          });
        });
        return promise2;
      }
    };

    const newP = new MyPromise((resolve, reject) => {
      console.log("传入promise的函数参数");
      resolve(1);
    }).then(value => {
      console.log("value", value);
    });

    console.log(newP);
  };

  render() {
    return <div>手写Promise</div>;
  }
}

export default NewPromise;
