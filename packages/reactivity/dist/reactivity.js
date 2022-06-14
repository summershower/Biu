var BiuReactivity = (() => {
  // packages/reactivity/src/utils.ts
  function isObject(target) {
    return typeof target === "object" && target !== null;
  }

  // packages/reactivity/src/effect.ts
  var activeEffect;
  function effect(fn) {
    const effectFn = () => {
      activeEffect = effectFn;
      return fn();
    };
    effectFn();
    return effectFn;
  }
  var targetMap = /* @__PURE__ */ new WeakMap();
  function track(target, key) {
    if (!activeEffect)
      return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let deps = depsMap.get(key);
    if (!deps) {
      depsMap.set(key, deps = /* @__PURE__ */ new Set());
    }
    deps.add(activeEffect);
  }
  function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap)
      return;
    const deps = depsMap.get(key);
    if (!deps)
      return;
    deps.forEach((fn) => fn());
  }

  // packages/reactivity/src/reactive.ts
  function reactive(target) {
    if (!isObject(target))
      return target;
    const proxy = new Proxy(target, {
      get(target2, key, receiver) {
        track(target2, key);
        return Reflect.get(target2, key, receiver);
      },
      set(target2, key, value, receiver) {
        trigger(target2, key);
        return Reflect.set(target2, key, value, receiver);
      }
    });
    return proxy;
  }

  // packages/reactivity/src/index.ts
  var b = window;
  var a = reactive({
    count: 1
  });
  b.a = a;
  effect(() => {
    console.log(b.a.count);
  });
})();
//# sourceMappingURL=reactivity.js.map
