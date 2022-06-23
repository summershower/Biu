export interface ProxyTarget {
    __isReactive?: Boolean
}

export interface Options {
    lazy?: Boolean;
    scheduler?: Function
}

export interface effectFn extends Function{
    scheduler?:Function
}

