export default function sum(array: number[]): number {
    let result = 0
    for (let i = 0; i < array.length; ++i) {
        result += array[i]
    }
    return result
}