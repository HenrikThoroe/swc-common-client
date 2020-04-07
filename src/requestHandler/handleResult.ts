import { Result } from "@henrikthoroe/swc-client"
import printMemoryUsage from "../utils/printMemoryUsage"
import Environment from "../utils/Environment"

export default function handleResult(result: Result) {
    printMemoryUsage()
    Environment.print(result)
    process.exit()
}