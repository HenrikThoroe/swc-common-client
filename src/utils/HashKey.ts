const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("")

export default class HashKey {

    count: number

    data: Uint32Array

    constructor(capacity: number) {
        this.count = 0
        this.data = new Uint32Array(capacity)
    }

    get capacity(): number {
        return this.data.length * 32
    }

    push(chunk: number, effectiveLength: number) {
        if (chunk > 4294967295) {
            console.warn(`Hash key can only treat numbers in range 0 to UInt32.max (4294967295). Given: ${chunk}`)
            return
        }

        let size = this.count % 32                                      // The effective size of the last number in data
        let availableBits = 32 - size                                   // The bits available in the last number
        let index = Math.floor(this.count / 32)                         // The current working index
        
        if (size == 0 && this.count > 0) {                              // The last UInt32 in data is empty and not the first item
            this.data[index + 1] = chunk                                // Append whole chunk to data
        } else {
            this.data[index] = chunk << size ^ this.data[index]         // Add as many bits to the last number as available
        }
        
        if (effectiveLength > availableBits) {                          // If chunk is bigger than the available space in the last number
            this.data[index + 1] = chunk >>> availableBits              // Create a new number with the remaining bits and add it to data
        }
        
        this.count += effectiveLength                                   // Increase count by bytes added
    }

    encodeChunk(index: number): string {
        let result = ""
        const x = this.data[index]
        const blockLength = 6
        const bitsToShift = 32 - blockLength
        
        for (let i = 0; i < 6; ++i) {
            const offset = i * blockLength                                  
            const shifted = x >>> offset                                    
            const block = (shifted << bitsToShift) >>> bitsToShift        
            result += base64Alphabet[block]   
        }

        return result
    }

    encode(): string {
        let encoded = ""
        
        for (let i = 0; i < this.data.length; ++i) {
            encoded += this.encodeChunk(i)
        }

        return encoded
    }

}