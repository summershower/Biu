export type Type = string | Object | Symbol
export type Props = Object | null
export type Children = string | [] | null

export interface VNode {
    type: Type,
    props?: Props,
    children?: Children,
    shapeFlag: number
}