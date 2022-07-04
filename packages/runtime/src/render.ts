import { VNode, Container, Props, CSSStyleName } from './types'
import { ShapeFlags } from './vnode'

import { isBoolean } from '@Biu/utils'
/** 渲染函数，将传入的虚拟DOM解析、处理并渲染到页面的真实DOM上 */
export function render(vnode: VNode, container: Container) {
    mount(vnode, container)
}

function mount(vnode: VNode, container: Container) {
    const { shapeFlag } = vnode;
    // 用位与运算确定类型，再调用相应的挂载函数
    if (shapeFlag & ShapeFlags.ELEMENT) {
        mountElement(vnode, container)
    } else if (shapeFlag & ShapeFlags.TEXT) {
        mountTextNode(vnode, container)
    } else if (shapeFlag & ShapeFlags.FRAGMENT) {
        mountFragment(vnode, container)
    } else {
        mountComponent(vnode, container)
    }


}

function mountElement(vnode: VNode, container: Container) {
    const { type, props } = vnode;
    const el = document.createElement(<keyof HTMLElementTagNameMap>type);
    props && mountProps(props, el);
    mountChildren(vnode, el);
    container.appendChild(el);
}

// Text节点的children就是他的文本内容
function mountTextNode(vnode: VNode, container: Container) {
    const textNode = document.createTextNode(<string>(vnode.children))
    container.appendChild(textNode)
}

function mountFragment(vnode: VNode, container: Container) {
    mountChildren(vnode, container)
}
function mountComponent(vnode: VNode, container: Container) {

}

function mountChildren(vnode: VNode, container: Container) {
    const { shapeFlag, children } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        mountTextNode(vnode, container)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        (<VNode[]>children).forEach(child => {
            mount(child, container)
        })
    }
}
/**
 * 目前只实现基本类型的props的识别：
 * 1、class只能是字符串类型
 * 2、style只能是对象类型
 * 3、事件只能以on开头，且事件名首字母大写
 */

/**
 * About Attributes and DOM Properties
 * Attr：存在于标签上的属性，Prop：存在于DOM对象的属性
 * 浏览器在生成DOM对象时，如果检测到标准属性，DOM对象中也会包含对应的属性名（即Prop）
 * 例如document.body.id。
 * 而非标准属性不会转化成Prop。
 * 如：在标签设置了custom = '123' ,document.body.custom = undefined
 * 而setAttribute则可以将自定义属性设置到Prop中，看似是万能的，但：
 * 1、setAttribute会把所有属性都设置为string类型，
 * 2、checked、disabled只要出现了，对应的property就会被初始化为true（即使传递了"false"），只有removeAttribute，才会变成false
 */
const domPropsReg = /[A-Z]|^(value|checked|selected|muted|disabled)$/; //A-Z为了匹配innerHTML和textContent
const eventReg = /^(on)[A-Z][a-zA-Z]*/;
function mountProps(props: Props, el: Container) {
    for (const key in props) {
        let value = props[key]
        switch (key) {
            case 'class':
                console.log(value);

                el.className = value;
                break;
            case 'style':
                for (const styleName in value) {
                    el.style[<CSSStyleName>styleName] = value[styleName]
                }
                break;
            default:
                if (eventReg.test(key)) {
                    // 判定为事件
                    const eventName = key.slice(2).toLowerCase()
                    el.addEventListener(eventName, value)
                } else if (domPropsReg.test(key)) {
                    // 处理一种特殊情况，<input checked />, 虚拟DOM解析为{checked: ""}，直接赋值会被解析为false，应当手动设置为true
                    if (value === "" && isBoolean(value)) {
                        value = true;
                    }
                    // 判定为特殊的Attr，必须直接在DOM上设置
                    el[key] = value;

                } else {
                    // 处理特殊情况, {checked: false}, 应当使用removeAttrbute去设置
                    if (value === false || value === undefined || value === null) {
                        el.removeAttribute(key)
                    }
                    // 其他的一律直接使用setAttrbute进行设置
                    el.setAttribute(key, value)
                }
        }
    }
}