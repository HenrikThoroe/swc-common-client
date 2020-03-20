interface HashFunction<T> {
    (arg0: T): string
}

interface Table<T> {
    [key: string]: T | undefined
}

export default class LookupTable<Key, Value> {

    readonly capacity: number

    readonly hasher: HashFunction<Key>

    private table: Table<Value> = {}

    private keyStore: string[] = []

    private count: number = 0

    private positiveReads: number = 0

    constructor(capacity: number, hasher: HashFunction<Key>) {
        this.capacity = capacity
        this.hasher = hasher
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
                console.log("Succesfully cahced: ", this.positiveReads)
            }

            return value
        }

        return null
    }

}