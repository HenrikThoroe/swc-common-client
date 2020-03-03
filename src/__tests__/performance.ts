import Timer from "../utils/Timer"

test("performance", () => {
    console.time()

    for (let i = 0; i <= 100000; ++i) {
        let x = Math.random()

        x += x - x
    }

    console.timeEnd()
})