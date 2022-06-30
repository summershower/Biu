import { HTMLAttributes, StyleHTMLAttributes } from "vue"

export type Type = keyof HTMLElementTagNameMap | Object | Symbol
export type CSSStyleName = keyof Omit<CSSStyleDeclaration, 'length' | 'parentRule'>


export type EventName = keyof HTMLElementTagNameMap
export type Props = {
    class?: string,
    style?: Record<CSSStyleName, string>,
    [x: string]: any
} | null
export type Children = string | Number | [] | null

export interface VNode {
    type: Type,
    props?: Props,
    children?: Children,
    shapeFlag: number
}

export type Container = HTMLElement 
