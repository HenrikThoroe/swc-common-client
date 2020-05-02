import Environment from "../utils/Environment"

interface HashFunction<T> {
    (arg0: T): string
}

interface Table<T> {
    [key: string]: T | undefined
}

interface Transformer<K, V> {
    (arg0: K, arg1: V): V
}

/**
 * A general purpose hashtable with restricted capacity.
 */
export default class LookupTable<Key, Value> {

    private static counter: number = 0

    /**
     * A value which sets an limit for the item capacity of the lookup table. 
     * It is not equivalent to the size of the table.
     */
    readonly capacity: number

    readonly hasher: HashFunction<Key>

    private table = new Map<string, Value>()

    private keyStore: string[] = []

    private count: number = 0

    private positiveReads: number = 0

    private negativeReads: number = 0

    private readonly id: number

    private defaultReadTransformer: Transformer<Key, Value> 

    private defaultWriteTransformer: Transformer<Key, Value> 

    constructor(capacity: number, hasher: HashFunction<Key>, readTransformer?: Transformer<Key, Value>,  writeTransformer?: Transformer<Key, Value>) {
        this.capacity = capacity
        this.hasher = hasher
        this.id = LookupTable.counter++
        this.defaultReadTransformer = readTransformer || ((_k, v) => v)
        this.defaultWriteTransformer = writeTransformer || ((_k, v) => v)
    }

    push(key: Key, value: Value, transformer?: Transformer<Key, Value>) {
        if (this.count >= this.capacity) {
            this.table.delete(this.keyStore.shift()!)
        } else {
            this.count += 1
        }

        const hash = this.hasher(key)
        const transformedValue = transformer ? transformer(key, value) : this.defaultWriteTransformer(key, value)
        
        this.table.set(hash, transformedValue)
        this.keyStore.push(hash)
    }

    read(key: Key, transformer?: Transformer<Key, Value>): Value | null {
        const value = this.table.get(this.hasher(key))

        if (value !== undefined) {
            this.positiveReads += 1

            if (this.positiveReads % 100000 === 0) {
                const ratio = this.positiveReads / (this.positiveReads + this.negativeReads)
                Environment.debugPrint(`Successfully cached ${this.positiveReads} items [id: ${this.id}][cached: ${(ratio * 100).toFixed(2)}%]`)
            }

            const transformedValue = transformer ? transformer(key, value) : this.defaultReadTransformer(key, value)

            return transformedValue
        }

        this.negativeReads += 1

        return null
    }

    get(key: Key, fallback: () => Value, transformer?: Transformer<Key, Value>): Value {
        const c = this.read(key, transformer)

        if (c !== null) {
            return c
        } else {
            const value = fallback() // TODO should fallback be transformed?
            this.push(key, value)
            return value
        }
    }

}