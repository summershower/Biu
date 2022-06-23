import { Options,effectFn } from './types'
let activeEffect: Function | null; // 一个全局临时变量，用来存储当前调用的effect函数。每次调用effect函数，都会把自身赋值到这个变量，这样在Proxy对象的get()方法中就可以根据这个值是否为空，来判断是不是由effect函数触发的读取行为，进而决定是否需要进行依赖收集。
let effectStack: Function[] = []; // 当effect函数里又嵌套了effect函数时, 有可能出现里层的effect函数赋值到activeEffect并执行完毕以后, 清除了activeEffect的值, 导致外层函数读取Proxy值时无法被作为依赖收集的情况, 需要一个栈存储所有的effect函数


/**
 * effect接收一个函数参数，我们称这个参数为副作用函数。
 * 副作用函数在被传入时会立即执行一次，在这个过程中中如果读取了某个Proxy对象的属性值，那么副作用函数自身将被收集到该属性的依赖数组中。
 * 之后在每次该属性值数据发生变化时，都会重新执行其依赖数组的所有副作用函数，因此此函数将被重新触发。
 */
export function effect(fn: Function, options: Options) {
    const effectFn = () => {
        // 使用try finally包裹，保证无论执行结果如何，最后都要清理掉全局的activeEffect变量
        try {
            activeEffect = effectFn;
            // 先入栈暂存, 防止里层有effect函数,finally把外层的effect函数清除掉
            effectStack.push(effectFn);
            return fn()
        }
        finally {
            // 执行完里层的effect时, 把自己出栈, 然后拿回外层的effect出来,重新赋值到activeEffect去
            effectStack.pop();
            activeEffect = effectStack[effectStack.length - 1] ?? null
        }
    }
    // 正常情况下effect会立即执行一次，但预留一个Options对象，如果lazy属性为true，那首次不执行
    !options.lazy && effectFn()
    // 如果传入了自定义调度器，那就挂在到effectFn下，trigger执行时会检测是否有自定义调度器
    options.scheduler && (effectFn.scheduler = options.scheduler)
    return effectFn;
}

/**
 * 创建一个WeakMap对象，用来存放每个属性值的依赖函数数组。
 * （WeakMap只能接受Object作为key，如果这个key变成了null，会被自动从WeakMap中清除掉，防止内存溢出）
 * 数据结构为: {
 *     Proxy对象: {
 *          Proxy对象的属性值: [调用此属性值的effect方法]
 *      }
 * }
 * 这样子，每次调用Proxy对象的某个属性时，就把里面存储副作用函数的Set数组拿出来遍历一次调用即可。
 */
const proxyObjectRecordMap = new WeakMap();

/**
 * 跟踪器：收集依赖某个属性的effect函数的方法。跟踪器会在handler的get()方法中被调用。
 */
export function track(target: Object, key: String | Symbol) {
    /**
     * Proxy对象的属性被读取时，要判断是不是被副作用函数所读取的。
     * 我们知道，在调用effect函数时，会把自己赋值到activeEffect变量去，因此只要判断这个值是否为空即可。
     * 不是被副作用函数读取的，无需进行任何操作。
     */
    if (!activeEffect) return

    // 先从proxyObjectRecordMap中取出对应的Proxy对象的记录
    let depsMap = proxyObjectRecordMap.get(target)
    // 如果这个Proxy对象还没有被记录过，那我们先给他创建一个空的存进去
    if (!depsMap) {
        proxyObjectRecordMap.set(target, depsMap = new Map())
    }

    // 再从Proxy对象记录中取出对应属性值的记录
    let deps = depsMap.get(key)
    // 该属性值没有被记录过的话，那继续给他新建一个
    if (!deps) {
        depsMap.set(key, deps = new Set())
    }

    // 把这次所使用的effect函数存到该属性值的set数组去即可
    deps.add(activeEffect);
    // console.log('追加依赖', '依赖数组：', deps, '目标值：', target, '属性名：', key, 'Proxy对象map：', depsMap);

}

/**
 * 触发器：当某个属性值被修改时，会触发依赖该属性值的effect函数的方法。触发器会在handler的set()方法中被调用。
 */
export function trigger(target: Object, key: String | Symbol | number) {
    // 同理，先从proxyObjectRecordMap中取出某个Proxy对象的记录
    const depsMap = proxyObjectRecordMap.get(target);
    // console.log(depsMap, '取出proxymap');

    if (!depsMap) return;

    // 再从Proxy对象的记录中取出某个属性值的记录
    const deps = depsMap.get(key)
    // console.log(deps,key, '取出属性值map');

    if (!deps) return


    // 遍历这个数组的函数执行即可
    deps.forEach((effectFn: effectFn) => {

        // 如果有自定义调度器，那就执行自定义调度器（详见Computed）
        if (effectFn.scheduler) {
            effectFn.scheduler()
        } else {
            effectFn()
        }
    })
}