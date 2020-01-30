export default function mapWithCopies<T, U>(array: T[], compare: (arg0: T, arg1: T) => boolean, callback: (item: T, isCopy: boolean, index: number) => U): U[] {
    const result: U[] = []

    for (let i = 0; i < array.length; ++i) {
        let isCopy = false

        for (let n = 0; n < i; ++n) {
            if (compare(array[n], array[i])) {
                isCopy = true
            }
        }

        result.push(callback(array[i], isCopy, i))
    }

    return result
}