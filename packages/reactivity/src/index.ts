import { reactive } from './reactive'
import { effect } from './effect'

const b = window as any;
const a = reactive({
    count: 1
});
b.a = a;

effect(() => {
    console.log(b.a.count)
})