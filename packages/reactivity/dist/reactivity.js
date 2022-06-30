var BiuReactivity = (() => {
  // packages/utils/src/index.ts
  function isObject(target) {
    return typeof target === "object" && target !== null;
  }
  function isArray(target) {
    return Array.isArray(target);
  }
  function isFunction(target) {
    return typeof target === "function";
  }
  function hasChange(oldValue, newValue) {
    return oldValue !== newValue && !(Number.isNaN(oldValue) && Number.isNaN(newValue));
  }

  // packages/reactivity/src/effect.ts
  var activeEffect;
  var effectStack = [];
  function effect(fn, options) {
    const effectFn = () => {
      var _a;
      try {
        activeEffect = effectFn;
        effectStack.push(effectFn);
        return fn();
      } finally {
        effectStack.pop();
        activeEffect = (_a = effectStack[effectStack.length - 1]) != null ? _a : null;
      }
    };
    !options.lazy && effectFn();
    options.scheduler && (effectFn.scheduler = options.scheduler);
    return effectFn;
  }
  var proxyObjectRecordMap = /* @__PURE__ */ new WeakMap();
  function track(target, key) {
    if (!activeEffect)
      return;
    let depsMap = proxyObjectRecordMap.get(target);
    if (!depsMap) {
      proxyObjectRecordMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let deps = depsMap.get(key);
    if (!deps) {
      depsMap.set(key, deps = /* @__PURE__ */ new Set());
    }
    deps.add(activeEffect);
  }
  function trigger(target, key) {
    const depsMap = proxyObjectRecordMap.get(target);
    if (!depsMap)
      return;
    const deps = depsMap.get(key);
    if (!deps)
      return;
    deps.forEach((effectFn) => {
      if (effectFn.scheduler) {
        effectFn.scheduler();
      } else {
        effectFn();
      }
    });
  }

  // packages/reactivity/src/reactive.ts
  var proxyMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target))
      return target;
    if (isProxy(target))
      return target;
    if (proxyMap.has(target))
      return proxyMap.get(target);
    const proxy = new Proxy(target, {
      get(target2, key, receiver) {
        if (key === "__isReactive")
          return true;
        track(target2, key);
        const res = Reflect.get(target2, key, receiver);
        return isObject(res) ? reactive(res) : res;
      },
      set(target2, key, value, receiver) {
        const oldLength = isArray(target2) ? target2.length : null;
        const oldValue = target2[key];
        const res = Reflect.set(target2, key, value, receiver);
        if (hasChange(oldValue, target2[key])) {
          trigger(target2, key);
          if (isArray(target2) && target2.length !== oldLength) {
            trigger(target2, "length");
          }
        }
        return res;
      }
    });
    proxyMap.set(target, proxy);
    return proxy;
  }
  function isProxy(target) {
    return target && Boolean(target.__isReactive);
  }

  // packages/reactivity/src/ref.ts
  function ref(target) {
    if (isRef(target))
      return target;
    return new RefImpl(target);
  }
  function isRef(target) {
    return !!(target && target.__isRef);
  }
  var RefImpl = class {
    constructor(target) {
      this.__isRef = true;
      this.__value = convert(target);
    }
    get value() {
      track(this, "value");
      return this.__value;
    }
    set value(newValue) {
      if (hasChange(this.__value, newValue)) {
        this.__value = convert(newValue);
        trigger(this, "value");
      }
    }
  };
  function convert(target) {
    return isObject(convert) ? reactive(target) : target;
  }

  // packages/reactivity/src/computed.ts
  function computed(getterOrOptions) {
    let getter, setter;
    if (isFunction(getterOrOptions)) {
      getter = getterOrOptions;
      setter = () => console.warn("Readonly Computed");
    } else {
      ({ get: getter = () => console.warn("Not define Getter"), set: setter = () => console.warn("Not define Setter") } = getterOrOptions);
    }
    return new ComputedImpl(getter, setter);
  }
  var ComputedImpl = class {
    constructor(getter, setter) {
      this.__dirty = true;
      setter && (this.__setter = setter);
      this.__effect = effect(getter, {
        lazy: true,
        scheduler: () => {
          if (!this.__dirty) {
            this.__dirty = true;
            trigger(this, "value");
          }
        }
      });
    }
    get value() {
      if (this.__dirty) {
        this.__dirty = false;
        this.__value = this.__effect();
        track(this, "value");
      }
      return this.__value;
    }
    set value(newValue) {
      this.__setter && this.__setter(newValue);
    }
  };

  // packages/reactivity/src/index.ts
  var tempWindow = window;
  var num = tempWindow.b = ref(0);
  tempWindow.a = computed({
    get() {
      return num.value;
    },
    set(newValue) {
      console.log("\u4F60\u7684\u4E0B\u4E00\u53E5\u8BDD\u662F\uFF1A", newValue);
      num.value = newValue;
    }
  });
})();
//# sourceMappingURL=reactivity.js.map
