export interface ProxyTarget {
    __isReactive?: Boolean
}

export interface EffectOptions {
    lazy?: Boolean;
    scheduler?: Function
}

export interface ComputedOptions {
    get: Function,
    set?: Function
}
export interface effectFn extends Function{
    scheduler?:Function
}

export interface Ref {
    value: any
}