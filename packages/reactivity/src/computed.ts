/**
 * computed最终返回值是一个Ref，这里使用类模仿了Ref的写法，这也是computed取值时也需要.value的原因
 * computed具有缓存机制，依赖不改变的话，不会重新计算属性
 * 而且具有懒更新的特性，依赖的值改变以后不会立即触发计算，只有到真正取值的时候才会重新计算
 */
import { effect, trigger, track } from './effect'
import { Options } from './types'
import { hasChange } from '@Biu/utils'

export function computed(getter: Function) {
    return new ComputedImpl(getter)

}

class ComputedImpl {
    __value: any;
    __dirty: Boolean; // 脏值检查，判断依赖是否已经更新
    effect: Function; // 一个特殊的effect函数，带有懒启动+自定义调度器的特性
    constructor(getter: Function) {
        this.__dirty = true; // 体现了懒加载特性，初始化时不直接执行effect函数，而是做一个标记，在get()函数时才首次计算
        this.effect = effect(getter, {
            lazy: true,
            /**
             *自定义调度器，会挂载到effectFn函数身上，在trigger遍历执行依赖的effect函数时，如果发现effectFn函数下有scheduler，会执行scheduler而不是effectFn函数
             *使用自定义调度器的目的主要是在set()函数调用trigger触发副作用函数时，顺带把类的dirty标记改为false，在下次取值时会重新计算值   
             * */
            scheduler: () => {
                this.__dirty = true;
            }
        })
    }
    get value() {
        // dirty标记为true，说明依赖已更新，需要重新计算值
        if (this.__dirty) {
            this.__dirty = false;
            this.__value = this.effect(); // effect函数最终返回值是传进去的副作用函数，我们传递了getter进去，所以getter会返回最新的值。（顺带使用了effect去收集依赖）
            track(this, 'value') // 收集读取本计算属性的副作用函数（跟上一行不同，上一行收集的是getter函数中读取值的依赖，而这里则是收集我们计算函数的依赖）
        }
        return this.__value;
    }
}