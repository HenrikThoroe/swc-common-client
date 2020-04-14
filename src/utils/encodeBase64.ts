const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("")

/**
 * Encodes a number to a base 64 string.
 * This method focuses on performance.
 * @param x The number to be converted to base64 string
 */
export default function encodeBase64(x: number): string {
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