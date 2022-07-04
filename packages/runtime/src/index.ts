// export { h, Text, Fragment } from './vnode'
// export { render } from './render'
import { h, Text, Fragment } from './vnode'
import { render } from './render'



const vnode = h('div', {
    class: 'a b',
    style: {
        border: '1px solid darkred',
        fontSize: '14px',
    },
    onClick: () => console.log('?'),
    id: 'foo',
    checked: false,
    custom: false
}, [h('ul', null, [
    h('li', { style: { color: 'red' } }, 1),
    h('li', null, 2),
    h('li', { style: { color: 'blue' } }, 3),
    h(Fragment, null, [
        h('li', null, 4),
        h('li',null,55)
    ]),
    h('li', null, [h(Text, null, 'hello world')])
])])

const c =
    render(vnode, document.body)