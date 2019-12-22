import createArray from "./createArray";

export default function createCubeArray<T>(len: number, content: T): T[][][] {
    return createArray(len, createArray(len, createArray(len, content)))
}