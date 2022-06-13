// 存放部分公共函数

// 判断传入的类型是否为对象
export function isObject(target: unknown) {
    // 在JS中typeof null也是返回object，因此需要排除
    return typeof target === 'object' && target !== null
}