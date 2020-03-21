/**
 * This function copies an object. 
 * Note: Only primitives and arrays are copied. 
 * @param obj The object to copy
 */
export default function copy<T>(obj: T): T {
    let c: any = {}

    for (const p in obj) {
        const v: any = obj[p]
        
        if (typeof v === "number" || typeof v === "boolean" || typeof v === "string" || typeof v === "bigint") {
            c[p] = v
        } else if (v instanceof Array) {
            c[p] = [...v.map(value => copy(value))]
        } else {
            c[p] = copy(v)
        }
    }

    return c as T
}