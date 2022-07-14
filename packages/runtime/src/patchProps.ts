import { Props, Container, CSSStyleName } from './types'
import { isBoolean } from '@Biu/utils'

const domPropsReg = /[A-Z]|^(value|checked|selected|muted|disabled)$/; //A-Z为了匹配innerHTML和textContent
const eventReg = /^(on)[A-Z][a-zA-Z]*/;

export function patchProps(oldProps: Props, newProps: Props, el: Container) {
    if (oldProps === newProps) return
    !oldProps && (oldProps = {})
    !newProps && (newProps = {})
    // 对比新旧属性，如果不相同，进行追加
    for (const key in newProps) {
        const newValue = newProps[key]
        const prevValue = oldProps ? oldProps[key] : ''
        if (prevValue !== newValue) {
            patchDomProps(prevValue, newValue, key, el)
        }
    }
    // 移除不存在的旧属性
    for (const key in oldProps) {
        if (newProps!.hasOwnProperty(key)) {
            patchDomProps(oldProps[key], null, key, el)
        }
    }
}

/**
 * 目前只实现基本类型的props的识别：
 * 1、class只能是字符串类型
 * 2、style只能是对象类型
 * 3、事件只能以on开头，且事件名首字母大写
 */
/**
 * About Attributes and DOM Properties
 * Attr：存在于标签上的属性，Prop：存在于DOM对象的属性
 * 浏览器在生成DOM对象时，如果检测到标准属性，DOM对象中也会包含对应的属性名（即Prop）
 * 例如document.body.id。
 * 而非标准属性不会转化成Prop。
 * 如：在标签设置了custom = '123' ,document.body.custom = undefined
 * 而setAttribute则可以将自定义属性设置到Prop中，看似是万能的，但：
 * 1、setAttribute会把所有属性都设置为string类型，
 * 2、checked、disabled只要出现了，对应的property就会被初始化为true（即使传递了"false"），只有removeAttribute，才会变成false
 */

function patchDomProps(prev: any, next: any, key: string, el: Container) {
    switch (key) {
        case 'class':
            el.className = next ?? '';
            break;
        case 'style':
            for (const styleName in next) {
                el.style[<CSSStyleName>styleName] = next[styleName]
            }
            // 移除已删除的样式
            if (prev) {
                for (const styleName in prev) {
                    if (!next[styleName]) {
                        el.style[<any>styleName] = ''
                    }
                }
            }
            break;
        default:
            if (eventReg.test(key)) {
                // 判定为事件
                const eventName = key.slice(2).toLowerCase()
                if (prev) {
                    el.removeEventListener(eventName, prev)
                }
                if (next) {
                    el.addEventListener(eventName, next)
                }
            } else if (domPropsReg.test(key)) {
                // 处理一种特殊情况，<input checked />, 虚拟DOM解析为{checked: ""}，直接赋值会被解析为false，应当手动设置为true
                if (next === "" && isBoolean(el[key])) {
                    next = true;
                    // 判定为特殊的Attr，直接在DOM上设置
                    el[key] = next;
                }
                if (next === false || next === undefined || next === null) {
                    el.removeAttribute(key)
                }

            } else {
                // 处理特殊情况, {checked: false}, 应当使用removeAttribute去设置
                if (next === false || next === undefined || next === null) {
                    el.removeAttribute(key)
                } else {
                    // 其他的一律直接使用setAttribute进行设置
                    el.setAttribute(key, next)
                }

            }
    }
}