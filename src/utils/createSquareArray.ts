import createArray from "./createArray";

export default function createSquareArray<T>(len: number, content: T): T[][] {
    return createArray(len, createArray(len, content))
}