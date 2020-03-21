interface HashFunction<T> {
    (arg0: T): string
}

interface Table<T> {
    [key: string]: T | undefined
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

    private table: Table<Value> = {}

    private keyStore: string[] = []

    private count: number = 0

    private positiveReads: number = 0

    private readonly id: number

    constructor(capacity: number, hasher: HashFunction<Key>) {
        this.capacity = capacity
        this.hasher = hasher
        this.id = LookupTable.counter++
    }

    push(key: Key, value: Value) {
        if (this.count >= this.capacity) {
            delete this.table[this.keyStore.shift()!]
        }

        const hash = this.hasher(key)
        
        this.table[hash] = value
        this.keyStore.push(hash)
    }

    read(key: Key): Value | null {
        const value = this.table[this.hasher(key)]

        if (value) {
            this.positiveReads += 1

            if (this.positiveReads % 10000 === 0) {
                console.log(`Successfully cached ${this.positiveReads} items [id: ${this.id}]`)
            }

            return value
        }

        return null
    }

}