import handler from './'
import sig from '../utils/sig'

export default async function build() {
    for (let i = 0; i <= 60; ++i) {
        await handler.set("drag_factor", i, sig(i / 60, -14, 0.8, 0.5))
        await handler.set("set_factor", i, sig(i / 60, 14, 0.8, 0.5))
    }
}

build()
    .catch(e => console.error(e))
    .then(() => console.log("Built Cache"))