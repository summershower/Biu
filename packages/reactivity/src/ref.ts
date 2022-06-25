import { isObject, hasChange } from '@Biu/utils'
import { reactive } from './reactive';
import { track, trigger } from './effect'
import { Ref } from './types'
export function ref(target: unknown): Ref {
    // 已经是Ref同样返回原值
    if (isRef(target)) return (target as Ref);
    return new RefImpl(target)
}

function isRef(target: any): Boolean {
    return !!(target && target.__isRef)
}

/**
 * reactive方法使用Proxy对象实现，而ref使用普通对象实现
 * 本质上跟Vue2的defineProperty没有区别，但使用了类这个面向对象概念语法
 */
class RefImpl {
    __isRef: boolean
    __value: any
    constructor(target: unknown) {
        this.__isRef = true; // 进行自我标记，提示已经进行Ref转换
        this.__value = convert(target);
    }
    // 等同于对象的访问器属性，包含一个get函数和一个set函数，因为必须设置属性名，所以vue3的ref必须使用.value取值
    get value() {
        // 继续使用Reactive的跟踪器和触发器
        track(this, 'value')
        return this.__value
    }
    set value(newValue) {
        // 依然别忘了判断是否更改
        if (hasChange(this.__value, newValue)) {
            // 注意先赋值再触发，而且要套在convert函数里，防止传了个新对象过来
            this.__value = convert(newValue)
            trigger(this, 'value')
        }
    }
}
// 判断是否对象，是的话使用reactive进行转换
function convert(target: unknown) {
    return isObject(convert) ? reactive(target) : target
}