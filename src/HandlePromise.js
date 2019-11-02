import React, { Component } from "react";

class HandlePromise extends Component {
  componentDidMount() {
    this.runPromise();
  }

  runPromise = () => {
    // 定义变量存储promise状态
    const pending = 0;
    const resolveValue = 1;
    const rejectValue = 2;

    // 定义promise构造函数 函数为参数
    function MyPromise(fn) {
      const that = this;
      that.state = pending; // 存储状态
      that.value = null; // 存储回调的值
      that.resolveCallBacks = []; // 成功then中的回调
      that.rejectCallBacks = []; // 拒绝then中的回调

      // 定义resolve
      function resolve(value) {
        // 保证执行顺序一致
        if (that.state === pending) {
          setTimeout(() => {
            that.state = resolveValue;
            that.value = value;
            that.resolveCallBacks.forEach(cb => cb(value));
          });
        }
      }

      // 定义reject
      function reject(value) {
        // 保证执行顺序一致 同步push进去所有回调 下一轮开始再处理所有回调
        if (that.state === pending) {
          setTimeout(() => {
            that.state = rejectValue;
            that.value = value;
            that.rejectCallBacks.forEach(cb => cb(value));
          });
        }
      }

      // 执行函数fn
      try {
        fn(resolve, reject);
      } catch (err) {
        reject(err);
      }
    }

    MyPromise.prototype.then = function(onResolve, onReject) {
      const that = this;
      let called = false;
      onResolve = typeof onResolve === "function" ? onResolve : value => value;
      onReject =
        typeof onReject === "function"
          ? onReject
          : err => {
              return err;
            };

      if (that.state === resolveValue) {
        console.log(called)
        if (called) return;
        called = true;
        return new MyPromise((resolve, reject) => {
          setTimeout(value => {
            try {
              let x = onResolve(value); // 判断返回的x
              if (x instanceof MyPromise) {
                x.then(resolve);
              } else {
                resolve(value);
              }
            } catch (e) {
              reject(e);
            }
          });
        });
      } else if (that.state === rejectValue) {
        console.log(called)
        if (called) return;
        called = true;
        return new MyPromise((resolve, reject) => {
          setTimeout(value => {
            try {
              let x = onReject(value); // 判断返回的x
              if (x instanceof MyPromise) {
                x.then(resolve);
              } else {
                resolve(that.value);
              }
            } catch (e) {
              reject(e);
            }
          });
        });
      } else {
        return new MyPromise((resolve, reject) => {
          that.resolveCallBacks.push(value => {
            try {
              let x = onResolve(value);
              if (x instanceof MyPromise) {
                x.then(resolve);
              } else {
                resolve(x);
              }
            } catch (err) {
              reject(err);
            }
          });

          that.rejectCallBacks.push(value => {
            try {
              let x = onReject(value);
              if (x instanceof MyPromise) {
                x.then(resolve);
              } else {
                resolve(x);
              }
            } catch (err) {
              reject(err);
            }
          });
        });
      }
    };

    // 实现all
    MyPromise.all = function(promiseArr) {
      return new MyPromise((resolve, reject) => {
        let cnt = 0;
        let result = [];
        for (let i = 0; i < promiseArr.length; i++) {
          promiseArr[i].then(
            res => {
              result[i] = res;
              if (++cnt === promiseArr.length) {
                resolve(result);
              }
            },
            err => {
              reject(err);
            }
          );
        }
      });
    };

    // 实现race
    MyPromise.race = promiseArr => {
      return new MyPromise((resolve, reject) => {
        for (let i = 0; i < promiseArr.length; i++) {
          promiseArr[i].then(resolve, reject);
        }
      });
    };

    const p1 = new MyPromise((resolve, reject) => {
      reject("hello1");
    });
    // .then(result => result);

    const p2 = new MyPromise((resolve, reject) => {
      resolve("err");
    });
    // .then(result => result,err => console.log('err'));

    MyPromise.race([p1, p2]).then(
      result => {
        console.log("成功", result);
      },
      err => {
        console.log("失败", err);
      }
    );
    // .catch(e => console.log(e));

    // const p = new MyPromise((resolve, reject) => {
    //   resolve(1);
    // }).then(
    //   value => {
    //     return new MyPromise((resolve, reject) => {
    //       reject("成功");
    //     }).then(
    //       value => {
    //         console.log("成功", value);
    //       },
    //       err => {
    //         console.log(err);
    //       }
    //     );
    //   },
    //   value => console.log("err", value)
    // );
  };

  render() {
    return <div>handlePromise</div>;
  }
}

export default HandlePromise;
