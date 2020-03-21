import hashTest from './hash'
import testHashtable from './hashtable'
import testStateHash from './statehash'
import testBase64 from './base64'

interface Tests {
    [index: string]: () => void
}

const tests: Tests = {
    "hash": hashTest,
    "hashtable": testHashtable,
    "statehash": testStateHash,
    "testBase64": testBase64
}

for (let p in tests) {
    console.group(p)
    tests[p]()
    console.groupEnd()
} 