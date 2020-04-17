import HashKey from "../utils/HashKey"

test("Hash Key", () => {
    // const key = new HashKey(5)
    // key.push(0b01110101, 7)
    // key.push(0b10010111, 8)
    // key.push(4294967295, 32)
    // key.push(0b101, 3)
    // console.log(Array.from(key.data).map(n => n.toString(2)))
    // console.log(key.encode())

    let start = process.hrtime()
    for (let i = 0; i < 2000000; ++i) {
        const key = new HashKey(5)
        key.push(0b01110101, 7)
        key.push(0b10010111, 8)
        key.push(4294967295, 32)
        key.push(0b101, 3)
        key.push(4294967295, 32)
        key.push(4294967295, 32)
        key.push(4294967295, 32)
    }

    let elapsed = process.hrtime(start)[1]
    let single = elapsed / 2000000
    console.log("No Encoding")
    console.log(`2,000,000: ${elapsed}ns ; ${elapsed / 1000}us ; ${elapsed / 1000000}ms`)
    console.log(`1: ${single}ns ; ${single / 1000}us ; ${single / 1000000}ms`)

    start = process.hrtime()
    for (let i = 0; i < 2000000; ++i) {
        const key = new HashKey(5)
        key.push(0b01110101, 7)
        key.push(0b10010111, 8)
        key.push(4294967295, 32)
        key.push(0b101, 3)
        key.push(4294967295, 32)
        key.push(4294967295, 32)
        key.push(4294967295, 32)
        let e = key.encode()
        e += e + ""
    }

    elapsed = process.hrtime(start)[1]
    single = elapsed / 2000000
    console.log("Encoding")
    console.log(`2,000,000: ${elapsed}ns ; ${elapsed / 1000}us ; ${elapsed / 1000000}ms`)
    console.log(`1: ${single}ns ; ${single / 1000}us ; ${single / 1000000}ms`)
})