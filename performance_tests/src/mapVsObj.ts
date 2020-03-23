const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("")

function encodeBase64(x: number): string {
    let result = ""
    const blockLength = 6                           // 6 bit can contain 2^6 (64) different information = one character of base64
    const bitsToShift = 32 - blockLength            // JS treats numbers as 32 bit integers if bitwise operations are performed on it

    while (x > 0) {
        const y = x << bitsToShift >>> bitsToShift  // Read block
        x = x >>> blockLength                       // Remove block from input
        result = base64Alphabet[y] + result         // look up the associated character for block
    }

    return result
}

interface ObjMap {
    [key: string]: number
}

export default function mapVsObj() {
    const keys: string[] = []
    const keyCount = 90000
    const obj: ObjMap = {}
    const map = new Map<string, number>()

    for (let i = 0; i < keyCount; ++i) {
        let key = ""
        for (let y = 0; y < 22; ++y) {
            const num = Math.floor(Math.random() * 65000)
            key += encodeBase64(num)
        }
        keys.push(key)

    }

    let start = process.hrtime()[1]
    const log = (label: string) => {
        console.log(label, (process.hrtime()[1] - start) / 1000000)
        start = process.hrtime()[1]
    }

    for (const key of keys) {
        obj[key] = 10
    }

    log("Object Write")

    for (const key of keys) {
        const a = obj[key]
    }

    log("Object Read")

    for (const key of keys) {
        delete obj[key]
    }

    log("Object Delete")

    for (const key of keys) {
        map.set(key, 10)
    }

    log("Map Write")

    for (const key of keys) {
        const a = map.get(key)
    }

    log("Map Read")

    for (const key of keys) {
        map.delete(key)
    }

    log("Map Delete")
}