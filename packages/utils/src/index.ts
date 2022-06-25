// 存放部分公共函数

export function isObject(target: unknown): Boolean {
    // 在JS中typeof null也是返回object，因此需要排除
    return typeof target === 'object' && target !== null
}

export function isArray(target: unknown): Boolean {
    return Array.isArray(target)
}

export function isFunction(target: unknown): Boolean {
    return typeof target === 'function'
}

export function isString(target: unknown): Boolean {
    return typeof target === 'string'
}

export function isNumber(target: unknown): Boolean {
    return typeof target === 'number'
}

export function isBoolean(target: unknown): Boolean {
    return typeof target === 'boolean'
}

// 需要排除NaN和NaN不全等的情况
export function hasChange(oldValue: unknown, newValue: unknown): Boolean {
    return oldValue !== newValue && !(Number.isNaN(oldValue) && Number.isNaN(newValue))
}

