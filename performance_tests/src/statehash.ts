const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("")

function convert(x: number): string {
    let result = ""
    const bitsToShift = 32 - 6

    while (x > 0) {
        const y = x << bitsToShift >>> bitsToShift
        x = x >>> 3
        result += base64Alphabet[y]
    }

    return result
}

interface Table {
    [key: string]: number
}

export default function testStateHash() {
    const items = 22
    const itemArray: number[] = []
    const table: Table = {}
    const iterations = 4000

    for (let i = 0; i < items; ++i) {
        itemArray.push(Math.floor(Math.random() * (Math.pow(2, 16) + 1)))
    }

    const start = process.hrtime()[1]

    for (let i = 0; i < iterations; ++i) {
        let key = ""

        for (let index = 0; index < items; ++index) {
            key += convert(itemArray[index])
        }

        table[key] = 10
    }

    console.log((process.hrtime()[1] - start) / iterations)
    const estimatedSpace = iterations * (8 + 2 * (22 * 4))
    console.log("Estimated Space", estimatedSpace / 1000, "Kilobyte")
}