import { Color } from "@henrikthoroe/swc-client";

export default interface Rating {
    isGameOver: boolean
    value: number
    surrounding: ConcreteAspect<number>
}

export interface Aspect<T = number> {
    red: T
    blue: T
}

export interface ConcreteAspect<T> {
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