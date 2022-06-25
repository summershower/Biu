import { Type, Props, Children, VNode } from './types'
import { isString, isNumber, isArray } from '@Biu/utils';
/**
 * 判断VNode的类型我们可以通过type属性来实现
 * 但ShapeFlags用于通过位运算来判断VNode及其子节点的类型，性能更高
 */
export enum ShapeFlags {
    ELEMENT = 1, // 普通元素， 00000001
    TEXT = 1 << 1, // 文本元素， 00000010
    FRAGMENT = 1 << 2, // 虚拟元素，00000100
    COMPONENT = 1 << 3, // 组件，00001000
    TEXT_CHILDREN = 1 << 4, // 文本子节点，00010000
    ARRAY_CHILDREN = 1 << 5, // 数组子节点，00100000
    CHILDREN = (1 << 4) | (1 << 5) // 00110000
}

// 文本元素和Fragment元素的type使用Symbol做唯一标识
export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')

export function h(type: Type, props: Props, children: Children): VNode {
    let shapeFlag: number;
    // 先判断需要生成的元素类型
    if (isString(type)) {
        shapeFlag = ShapeFlags.ELEMENT
    } else if (type === Text) {
        shapeFlag = ShapeFlags.TEXT
    } else if (type === Fragment) {
        shapeFlag = ShapeFlags.FRAGMENT
    } else {
        // 目前只实现四种核心类型，因此其余一律作为Component处理
        shapeFlag = ShapeFlags.COMPONENT
    }

    if (isString(children) || isNumber(children)) {
        // 或等运算
        shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if (isArray(children)) {
        shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }
    return {
        type,
        props,
        children,
        shapeFlag: 123
    }

}