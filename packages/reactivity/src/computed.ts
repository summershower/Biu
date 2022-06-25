/**
 * computed最终返回值是一个Ref，这里使用类模仿了Ref的写法，这也是computed取值时也需要.value的原因
 * computed具有缓存机制，依赖不改变的话，不会重新计算属性
 * 而且具有懒更新的特性，依赖的值改变以后不会立即触发计算，只有到真正取值的时候才会重新计算
 */
import { effect, track, trigger } from './effect'
import { ComputedOptions } from './types'
import { isFunction } from '@Biu/utils'

export function computed(getterOrOptions: Function | ComputedOptions) {
    let getter, setter
    if (isFunction(getterOrOptions)) {
        getter = <Function>getterOrOptions
        setter = () => console.warn('Readonly Computed')
    } else {
        ({ get: getter = () => { }, set: setter = () => { } } = <ComputedOptions>getterOrOptions)
    }
    return new ComputedImpl(getter, setter)
}

class ComputedImpl {
    __value: any;
    __dirty: Boolean; // 脏值检查，判断依赖是否已经更新
    __effect: Function; // 一个特殊的effect函数，带有懒启动+自定义调度器的特性
    __setter?: Function; // 用户自定义的setter函数
    constructor(getter: Function, setter: Function) {
        this.__dirty = true; // 体现了懒加载特性，初始化时不直接执行effect函数并保存最终的value，而是做一个标记，在真正被读取时才首次计算getter函数的返回值
        setter && (this.__setter = setter) // 将用户传入的setter存到实例下
        this.__effect = effect(getter, {
            lazy: true,
            /**
             *自定义调度器，会挂载到effectFn函数身上，在trigger遍历执行依赖的副作用函数时，如果发现effectFn函数下有scheduler，会执行scheduler而不是effectFn函数（此处为getter函数）
             *使用自定义调度器的目的主要是在set()函数调用trigger触发副作用函数时，顺带把类的dirty标记改为false，在下次取值时会重新计算值   
             * */
            scheduler: () => {
                if (!this.__dirty) {
                    this.__dirty = true;
                    /**
                     * 当getter中依赖的某个属性值被改变时，我们的getter函数作为其依赖，会在该属性值的set函数中被trigger触发。
                     * 但因为我们使用了自定义调度器，因此并不执行getter函数，而是执行本段代码。
                     * 按照Ref的逻辑，trigger应该在自己被set的时候通知执行。但跟Ref不同，我们并不保存自己的value值，而只是保存一个getter函数。因此getter依赖的值通知我们时，我们也需要通知所有依赖于我们的副作用函数重新执行。
                     */
                    trigger(this, 'value');
                }
            }
        })
    }
    get value() {
        // dirty标记为true，说明依赖已更新，需要重新计算值
        if (this.__dirty) {
            this.__dirty = false;
            this.__value = this.__effect(); // effect函数最终返回值是传进去的副作用函数，我们传递了getter进去，所以getter会返回最新的值。（顺带使用了effect去收集依赖）
            track(this, 'value') // 收集读取本计算属性的副作用函数（跟上一行不同，上一行收集的是getter函数中读取值的依赖，而这里则是收集我们计算函数的依赖）
        }
        return this.__value;
    }
    set value(newValue) {
        this.__setter && this.__setter(newValue)
    }
}