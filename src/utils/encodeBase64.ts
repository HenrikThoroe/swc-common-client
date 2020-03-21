const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("")

export default function encodeBase64(x: number): string {
    let result = ""
    const blockLength = 6
    const bitsToShift = 32 - blockLength

    while (x > 0) {
        const y = x << bitsToShift >>> bitsToShift  // Read block
        x = x >>> blockLength                       // Remove block from number
        result = base64Alphabet[y] + result         // look up the associated character for block
    }

    return result

    // return Buffer.alloc(8, x).toString("base64").replace("==", "")

    // let result = ""
    // let temp = 0

    // while (x > 0) {
    //     temp = x % 64
    //     result = base64Alphabet[temp] + result
    //     x = Math.floor(x / 64)
    // }

    // return result
}