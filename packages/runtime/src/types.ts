export type Type = keyof HTMLElementTagNameMap | Object | Symbol
export type Props = Object | null
export type Children = string | Number | [] | null

export interface VNode {
    type: Type,
    props?: Props,
    children?: Children,
    shapeFlag: number
}

export type Container = HTMLElement 