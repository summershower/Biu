import { reactive } from './reactive'
import { ref } from './ref'
import { effect } from './effect'
import { computed } from './computed'


const tempWindow = window as any
const num = (tempWindow.b = ref(0))


tempWindow.a = computed({
    get() {
        return num.value
    },
    set(newValue:any) {
        console.log('你的下一句话是：', newValue)
        num.value = newValue
    }
})