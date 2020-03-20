const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("")

export default function encodeBase64(x: number): string {
    let result = ""
    const bitsToShift = 32 - 6

    while (x > 0) {
        const y = x << bitsToShift >>> bitsToShift
        x = x >>> 3
        result += base64Alphabet[y]
    }

    return result
}