function hash(x: number): number {
    x = ((x >> 16) ^ x) * 0x45d9f3b
    x = ((x >> 16) ^ x) * 0x45d9f3b
    x = (x >> 16) ^ x

    return x
}

export default function hashTest() {
    const iterations = 2000
    const num  = 0b1111111111111111
    const num2 = 0b0101110001010110
    const combined = (num << 16) ^ num2
    const start = process.hrtime()[1]
    
    for (let i = 0; i < iterations; ++i) {
        const a = hash(combined)
    }
    
    const elapsed = (process.hrtime()[1] - start) / iterations
    
    console.log(elapsed)
}