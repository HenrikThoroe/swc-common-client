const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("")

function encodeBase64(x: number): string {
    let result = ""
    const blockLength = 6
    const bitsToShift = 32 - blockLength

    while (x > 0) {
        const y = x << bitsToShift >>> bitsToShift  // Read block
        x = x >>> blockLength                       // Remove block from number
        result = base64Alphabet[y] + result         // look up the associated character for block
    }

    return result
}

export default function testBase64() {
    const output: string[] = []

    for (let i = 0; i < 1000000; ++i) {
        const encoded = encodeBase64(i)

        for (const o of output) {
            if (o === encoded) {
                console.warn("collision")
                break
            }
        }

        output.push(encoded)
    }
}