import hashTest from './hash'
import testHashtable from './hashtable'
import testStateHash from './statehash'

interface Tests {
    [index: string]: () => void
}

const tests: Tests = {
    "hash": hashTest,
    "hashtable": testHashtable,
    "statehash": testStateHash
}

for (let p in tests) {
    console.group(p)
    tests[p]()
    console.groupEnd()
} 