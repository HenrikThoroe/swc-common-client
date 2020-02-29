export default function sig(x: number, gradient: number, yOffset: number = 0, xOffset: number = 0.5) {
    const e = Math.exp(gradient * (x - xOffset))
    return ((1 - yOffset) / (1 + e)) + yOffset
}