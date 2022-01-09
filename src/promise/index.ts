import { Status } from './enum';

type Resolve<T = any> = (value: T | PromiseAPlus<T>) => void;
type Reject = (reason?: any) => void;
type Executor<T> = (resolve: Resolve<T>, reject: Reject) => void;

class PromiseAPlus<T = any> {
  status: Status = Status.PENDING;
  private reason?: any;
  private value: T | PromiseAPlus<T> | undefined;
  private onFulfilledCallback: (() => void)[] = []; //成功的回调
  private onRejectedCallback: (() => void)[] = []; //失败的回调

  constructor(executor: Executor<T>) {
    if (typeof executor !== 'function') {
      throw new TypeError(`Promise resolver ${executor} is not a function`);
    }
    try {
      executor(this._resolve.bind(this), this._reject.bind(this));
    } catch (e) {
      this._reject(e);
    }
  }

  private _resolve(value: T | PromiseAPlus<T>) {
    if (this === value) {
      return this._reject(new TypeError('Chaining cycle detected for promise #<Promise>'));
    }
    if (this.status === Status.PENDING) {
      this.status = Status.FULFILLED;
      this.value = value;
      // resolve 后执行 .then 时传入的回调
      this.onFulfilledCallback.forEach((fn) => fn());
    }
  }

  private _reject(reason: any) {
    if (this.status === Status.PENDING) {
      this.status = Status.REJECTED;
      this.reason = reason;
      this.onRejectedCallback.forEach((fn) => fn());
    }
  }

  static deferred() {
    const dfd: Partial<{ promise: PromiseAPlus; resolve: Resolve; reject: Reject }> = {};
    dfd.promise = new PromiseAPlus((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
  }
}
module.exports = PromiseAPlus;
