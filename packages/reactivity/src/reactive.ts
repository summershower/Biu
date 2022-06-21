import { isObject, isArray, hasChange } from '@Biu/utils'
import { track, trigger } from './effect'

const proxyMap = new WeakMap();

export function reactive(target: unknown): any {

    // 传入类型非Object的话，直接返回原值
    if (!isObject(target)) return target

    // 如果传入的已经是一个由Reactive生成的Proxy对象，直接返回原值
    if (isProxy(target as Object)) return target

    // 如果传入的原始对象已经被Reactive处理过,返回对应的Proxy对象
    if (proxyMap.has(target as Object)) return proxyMap.get(target as Object)

    // 创建一个新的Proxy对象
    const proxy = new Proxy(target as Object, {
        get(target, key, receiver) {
            // 提供给isProxy函数使用, 如果读取__isReactive这个属性, 那就一律返回true, 证明已经被代理过
            if (key === '__isReactive') return true

            // 进行依赖收集
            track(target, key);

            /**  在Proxy中，必须使用Reflect响应对应的操作。如果直接return target[key]会导致依赖丢失问题。
             * 比方说我们有一个对象obj: { 
             *    name: 'angel', 
             *    get getUsername() {    //这是访问器属性
             *        return this.name
             *    } 
             *}
             * 然后我们将这个对象obj转化成Proxy对象，在读取getUsername属性时，return target[key]返回的是原对象上的name属性，因此只有getUsername被加入到依赖数组中。
             * Reflect的receiver参数的意义在于将this重新指向proxy对象自身，这样在读取getUsername时，proxy对象的name属性也被读取，保证依赖有效收集。
             */
            const res = Reflect.get(target, key, receiver)

            /**
             * 这里是Vue2与Vue3响应式实现的一个关键差异,当遇到深层Object时,Vue2会主动递归,进行深层代理
             * Vue3这种做法可以称为"懒代理",只有真正通过get读取到深层的Object时,才去进行Reactive递归处理,节约了性能
             */
            return isObject(res) ? reactive(res) : res
        },
        set<T extends Object | [], K extends keyof T>(target: T, key: K, value: any, receiver: any) {

            // oldValue和oldValue需要放在前面,因为Reflect一旦执行,就已经更改了值
            const oldLength = isArray(target) ? (<[]>target).length : null
            const oldValue = target[key]
            const res = Reflect.set(target, key, value, receiver)

            // 如果新修改的值跟原来的一样,无需执行Trigger操作
            if (hasChange(oldValue, target[key])) {

                // 当这个值被改变时，通知所有依赖于自身的函数重新执行一次
                trigger(target, key)
                /** 
                 * 如果目标值是数组,还需要对他的length属性做单独的响应
                 * 我们的trigger是根据Proxy对象的属性名进行响应的
                 * 如果对数组进行push等操作, length隐性改变了, 但因为不是直接操作属性名length,所以无法通知到对应依赖
                 * */
                if (isArray(target) && ((<[]>target).length !== oldLength)) {
                    trigger(target, length)
                }
            }
            return res
        }
    })
    // 记录这个原始对象
    proxyMap.set(target as Object, proxy);
    return proxy
}

interface proxyTarget {
    __isReactive?: Boolean
}
/**
 * 通过读取被代理对象上__isReactive这个特殊的属性名，判断是否已经是被代理过
 * 如果是Vue2中，会把这个属性值真实地写入到对象上
 * 但我们拦截了get操作，即使不写入到对象上，在拦截到该属性读取的时候返回true即可
 */
export function isProxy(target: proxyTarget): Boolean {
    return target && Boolean(target.__isReactive);
}