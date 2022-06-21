import { reactive } from './reactive'
import { effect } from './effect'

const b = window as any;
const a = reactive({
    a: 123,
    b: 777
});
b.a = a;



effect(() => {
    effect(() => {
        console.log('里层', b.a.b)
    })
    console.log('外层', b.a.a)
})
