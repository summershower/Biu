// 存放部分公共函数

// 判断传入的类型是否为对象
export function isObject(target: unknown): Boolean {
    // 在JS中typeof null也是返回object，因此需要排除
    return typeof target === 'object' && target !== null
}

export function isArray(target: any): Boolean {
    return Array.isArray(target)
}

// 需要排除NaN和NaN不全等的情况
export function hasChange(oldValue: unknown, newValue: unknown): Boolean {
    return oldValue !== newValue && !(Number.isNaN(oldValue) && Number.isNaN(newValue))
}

