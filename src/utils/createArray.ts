export default function createArray<T>(len: number, content: T): T[] {
    return Array.from(Array<number>(len)).map(() => content)
}