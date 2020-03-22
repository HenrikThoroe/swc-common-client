export default function guard(x: number, min: number, max: number): number {
    if (x > max) return max
    if (x < min) return min

    return x
}