import { VNode, Container } from './types'
import { ShapeFlags } from './vnode'
/** 渲染函数，将传入的虚拟DOM解析、处理并渲染到页面的真实DOM上 */
export function render(vnode: VNode, container: Container) {

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
    const { type } = vnode;
    const el = document.createElement(<keyof HTMLElementTagNameMap>type);
    // mountProps(props, el);
    mountChildren(vnode, el)
}

function mountTextNode(vnode: VNode, container: Container) {
    const textNode = document.createTextNode(<string>(vnode.children))
    container.appendChild(textNode)
}

function mountFragment(vnode: VNode, container: Container) {

}
function mountComponent(vnode: VNode, container: Container) {

}

function mountChildren(vnode: VNode, container:Container) {
    const { shapeFlag, children } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        mountTextNode(vnode, container)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {

    }

}