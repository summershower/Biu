var BiuRuntime = (() => {
  // packages/utils/src/index.ts
  function isArray(target) {
    return Array.isArray(target);
  }
  function isString(target) {
    return typeof target === "string";
  }
  function isNumber(target) {
    return typeof target === "number";
  }
  function isBoolean(target) {
    return typeof target === "boolean";
  }

  // packages/runtime/src/vnode.ts
  var Text = Symbol("Text");
  var Fragment = Symbol("Fragment");
  function h(type, props, children) {
    let shapeFlag;
    if (isString(type)) {
      shapeFlag = 1 /* ELEMENT */;
    } else if (type === Text) {
      shapeFlag = 2 /* TEXT */;
    } else if (type === Fragment) {
      shapeFlag = 4 /* FRAGMENT */;
    } else {
      shapeFlag = 8 /* COMPONENT */;
    }
    if (isString(children) || isNumber(children)) {
      shapeFlag |= 16 /* TEXT_CHILDREN */;
      isNumber(children) && (children = children.toString());
    } else if (isArray(children)) {
      shapeFlag |= 32 /* ARRAY_CHILDREN */;
    }
    return {
      type,
      props,
      children,
      shapeFlag
    };
  }

  // packages/runtime/src/render.ts
  function render(vnode2, container) {
    mount(vnode2, container);
  }
  function mount(vnode2, container) {
    const { shapeFlag } = vnode2;
    if (shapeFlag & 1 /* ELEMENT */) {
      mountElement(vnode2, container);
    } else if (shapeFlag & 2 /* TEXT */) {
      mountTextNode(vnode2, container);
    } else if (shapeFlag & 4 /* FRAGMENT */) {
      mountFragment(vnode2, container);
    } else {
      mountComponent(vnode2, container);
    }
  }
  function mountElement(vnode2, container) {
    const { type, props } = vnode2;
    const el = document.createElement(type);
    props && mountProps(props, el);
    mountChildren(vnode2, el);
    container.appendChild(el);
  }
  function mountTextNode(vnode2, container) {
    const textNode = document.createTextNode(vnode2.children);
    container.appendChild(textNode);
  }
  function mountFragment(vnode2, container) {
    mountChildren(vnode2, container);
  }
  function mountComponent(vnode2, container) {
  }
  function mountChildren(vnode2, container) {
    const { shapeFlag, children } = vnode2;
    if (shapeFlag & 16 /* TEXT_CHILDREN */) {
      mountTextNode(vnode2, container);
    } else if (shapeFlag & 32 /* ARRAY_CHILDREN */) {
      children.forEach((child) => {
        mount(child, container);
      });
    }
  }
  var domPropsReg = /[A-Z]|^(value|checked|selected|muted|disabled)$/;
  var eventReg = /^(on)[A-Z][a-zA-Z]*/;
  function mountProps(props, el) {
    for (const key in props) {
      let value = props[key];
      switch (key) {
        case "class":
          console.log(value);
          el.className = value;
          break;
        case "style":
          for (const styleName in value) {
            el.style[styleName] = value[styleName];
          }
          break;
        default:
          if (eventReg.test(key)) {
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, value);
          } else if (domPropsReg.test(key)) {
            if (value === "" && isBoolean(value)) {
              value = true;
            }
            el[key] = value;
          } else {
            if (value === false || value === void 0 || value === null) {
              el.removeAttribute(key);
            }
            el.setAttribute(key, value);
          }
      }
    }
  }

  // packages/runtime/src/index.ts
  var vnode = h("div", {
    class: "a b",
    style: {
      border: "1px solid darkred",
      fontSize: "14px"
    },
    onClick: () => console.log("?"),
    id: "foo",
    checked: false,
    custom: false
  }, [h("ul", null, [
    h("li", { style: { color: "red" } }, 1),
    h("li", null, 2),
    h("li", { style: { color: "blue" } }, 3),
    h(Fragment, null, [
      h("li", null, 4),
      h("li", null, 55)
    ]),
    h("li", null, [h(Text, null, "hello world")])
  ])]);
  var c = render(vnode, document.body);
})();
//# sourceMappingURL=runtime.js.map
