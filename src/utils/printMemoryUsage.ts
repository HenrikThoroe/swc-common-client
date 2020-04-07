import Environment from "./Environment"

export default function printMemoryUsage() {
    const usage = process.memoryUsage()
    const toMB = (mem: number) => (mem / 1024 / 1024).toFixed(2) + " Megabyte"

    Environment.print("---Memory Usage---")
    Environment.print(`RSS: ${toMB(usage.rss)}`)
    Environment.print(`Heap Total: ${toMB(usage.heapTotal)}`)
    Environment.print(`Heap Used: ${toMB(usage.heapUsed)}`)
    Environment.print(`External: ${toMB(usage.external)}`)
    Environment.print(`Array Buffers: ${toMB(usage.arrayBuffers)}`)
    Environment.print("------------------")
}