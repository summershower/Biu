var BiuReactivity = (() => {
  // packages/utils/src/index.ts
  function isObject(target) {
    return typeof target === "object" && target !== null;
  }
  function isArray(target) {
    return Array.isArray(target);
  }
  function hasChange(oldValue, newValue) {
    return oldValue !== newValue && !(Number.isNaN(oldValue) && Number.isNaN(newValue));
  }

  // packages/reactivity/src/effect.ts
  var activeEffect;
  var effectStack = [];
  function effect(fn) {
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
    effectFn();
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
    deps.forEach((fn) => fn());
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
            trigger(target2, length);
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

  // packages/reactivity/src/index.ts
  var b = window;
  var a = reactive({
    a: 123,
    b: 777
  });
  b.a = a;
  effect(() => {
    effect(() => {
      console.log("\u91CC\u5C42", b.a.b);
    });
    console.log("\u5916\u5C42", b.a.a);
  });
})();
//# sourceMappingURL=reactivity.js.map
