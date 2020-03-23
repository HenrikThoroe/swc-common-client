import hashTest from './hash'
import testHashtable from './hashtable'
import testStateHash from './statehash'
import testBase64 from './base64'
import mapVsObj from './mapVsObj'

interface Tests {
    [index: string]: () => void
}

const tests: Tests = {
    // "hash": hashTest,
    // "hashtable": testHashtable,
    // "statehash": testStateHash,
    // "testBase64": testBase64,
    "mapVsObj": mapVsObj
}

for (let p in tests) {
    console.group(p)
    tests[p]()
    console.groupEnd()
} 