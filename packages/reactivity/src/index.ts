import { reactive } from './reactive'
import { ref } from './ref'
import { effect } from './effect'


const b = window as any;
const a = reactive([1, 2, 3]);
const c = ref(5)
b.a = a;
b.c = c;


// effect(() => {
//     console.log(b.c.value);
// })
