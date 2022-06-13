import { isObject } from './utils'
import { track, trigger } from './effect'
export function reactive(target: unknown) {

    // 传入类型非Object的话，直接返回原值
    if (!isObject(target)) return target

    // 创建一个新的Proxy对象
    const proxy = new Proxy(target as Object, {
        get(target, key, receiver) {

            // 进行依赖收集
            track(target, key)

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
            return Reflect.get(target, key, receiver)
        },
        set(target, key, value, receiver) {
            // 当这个值被改变时，通知所有依赖于自身的函数重新执行一次
            trigger(target, key)
            return Reflect.set(target, key, value, receiver)
        }
    })
    return proxy
}