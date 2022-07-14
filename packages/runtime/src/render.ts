import { VNode, Container, Props, CSSStyleName } from './types'
import { ShapeFlags } from './vnode'
import { isBoolean } from '@Biu/utils'
import { patchProps } from './patchProps'

/** 渲染函数，将传入的虚拟DOM解析、处理并渲染到页面的真实DOM上 */
export function render(vnode: VNode, container: Container) {
    const preVNode = container._vnode;
    // 先判断新VNode是否存在
    if (!vnode) {
        // 没有新VNode，进行销毁流程
        if (preVNode) {
            unmount(preVNode);
        }
    } else {
        // 新VNode存在，就对新旧节点进行patch操作
        patch(preVNode, vnode, container)
    }
    // 将本次渲染的Vnode保存到container对象上，下次进行render时，取出旧的VNode进行对比
    container._vnode = vnode;
}

export function mount(vnode: VNode, container: Container) {

}

/**
 * 卸载节点，Component和Fragment需要做一些特殊处理
 * Text和Element节点直接removeChild即可
 */
export function unmount(vnode: VNode) {
    let { shapeFlag, el } = vnode;
    if (shapeFlag & ShapeFlags.COMPONENT) {
        unmountComponent(vnode);
    } else if (shapeFlag & ShapeFlags.FRAGMENT) {
        unmountFragment(vnode)
    } else {
        el!.parentNode!.removeChild(<HTMLElement>el);
    }
}
export function unmountComponent(vnode: VNode) { }
export function unmountFragment(vnode: VNode) { }



/**
 * Process类函数主要用于判断是否存在旧VNode，从而决定使用Patch还是Mount方法
 */
export function processComponent(preVNode: VNode | null, vnode: VNode, container: Container) { }
export function processFragment(preVNode: VNode | null, vnode: VNode, container: Container) { }
export function processText(preVNode: VNode | null, vnode: VNode, container: Container) {
    if (preVNode) {
        preVNode!.el!.textContent = (vnode.children) as string;
    } else {
        mountTextNode(vnode, container)
    }
}
export function processElement(preVNode: VNode | null, vnode: VNode, container: Container) {
    if (preVNode) {
        patchElement(preVNode, vnode, container)
    } else {
        mountElement(vnode, container)
    }
}

export function patchElement(preVNode: VNode, vnode: VNode, container: Container) {
    vnode.el = preVNode!.el;
    patchProps(preVNode!.props as Props, vnode.props as Props, vnode.el as Container)
    patchChildren(preVNode, vnode, vnode.el  as Container)
}

export function patch(preVNode: VNode | null, vnode: VNode, container: Container) {
    // 新旧节点类型不同，直接销毁旧节点
    if (preVNode && !isSameVNodeType(preVNode, vnode)) {
        unmount(preVNode);
        preVNode = null;
    }

    const { shapeFlag } = vnode;
    if (shapeFlag && ShapeFlags.COMPONENT) {
        processComponent(preVNode, vnode, container)
    } else if (shapeFlag && ShapeFlags.FRAGMENT) {
        processFragment(preVNode, vnode, container)
    } else if (shapeFlag && ShapeFlags.TEXT) {
        processText(preVNode, vnode, container)
    } else {
        processElement(preVNode, vnode, container)
    }
}



// Text节点的children就是他的文本内容
function mountTextNode(vnode: VNode, container: Container) {
    const textNode = document.createTextNode(<string>(vnode.children))
    container.appendChild(textNode)
    vnode.el = textNode;
}

function mountElement(vnode: VNode, container: Container) {
    const { type, props, shapeFlag, children } = vnode;
    const el = document.createElement(<keyof HTMLElementTagNameMap>type);
    // props && mountProps(props, el);
    props && patchProps(null, props, el);
    // mountChildren(vnode, el);


    // const { shapeFlag, children } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        mountTextNode(vnode, container)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children as VNode[], container)
    }

    container.appendChild(el);
    vnode.el = el;
}

function unmountChildren(vnode: VNode) {
    vnode.el.parentNode.removeChild(vnode.el as HTMLElement)

}
/**
 * patch更新子节点
 * 需要判断新旧子节点是文本/数组/其他类型,共处理九种情况
 */
export function patchChildren(preVNode: VNode, vnode: VNode, container: Container) {
    const { shapeFlag: prevShapeFlag, children: prevChildren } = preVNode;
    const { shapeFlag, children } = vnode;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 新节点是文本
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 新旧子节点都是Text，修改文本内容
            container.textContent = children as string;
        } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 旧节点是数组，先卸载
            unmountChildren(preVNode)
            container.textContent = children as string;

        } else {

        }
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {

        } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {

        } else {

        }
    } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {

        } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {

        } else {

        }
    }
}

function mountChildren(children: VNode[] | null, container: Container) {
    (<VNode[]>children).forEach(child => {
        // mount(child, container)
        patch(null, child, container);
    })

}

function isSameVNodeType(preVNode: VNode, vnode: VNode): Boolean {
    return preVNode.type === vnode.type
}