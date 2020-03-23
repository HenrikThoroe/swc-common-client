interface Table {
    [key: string]: number
}

export default function testHashtable() {
    const shortKeys: string[] = []
    const longKeys: string[] = []
    const count = 2000
    const value = 10
    let table: Table = {}

    for (let x = 0; x < count; ++x) {
        shortKeys.push(x.toString())
    }

    for (let x = 0; x < count; ++x) {
        let key: string = ""

        while (key.length < 22 * 16 / 10) {
            key += x.toString()
        }

        longKeys.push(key)
    }

    let start = process.hrtime()[1]

    for (const key of shortKeys) {
        table[key] = value
    }

    console.log("Short Write: ", process.hrtime()[1] - start)
    start = process.hrtime()[1]

    for (const key of shortKeys) {
        const b = table[key]
    }

    console.log("Short Read: ", process.hrtime()[1] - start)
    start = process.hrtime()[1]

    for (const key of shortKeys) {
        table[key] = value
    }

    console.log("Long Write: ", process.hrtime()[1] - start)
    start = process.hrtime()[1]

    for (const key of longKeys) {
        const b = table[key]
    }

    console.log("Long Read: ", process.hrtime()[1] - start)
}