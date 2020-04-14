import { Color } from "@henrikthoroe/swc-client"
import Aspect from "./Aspect"

export default interface ConcreteAspect<T> {
    own: T
    opponent: T
}

export function substantiateAspect<T>(color: Color, aspect: Aspect<T>): ConcreteAspect<T> {
    const ownValue = color === Color.Red ? aspect.red : aspect.blue
    const oppValue = color === Color.Blue ? aspect.red : aspect.blue

    return {
        own: ownValue,
        opponent: oppValue
    }
}