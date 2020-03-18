import { Color } from "@henrikthoroe/swc-client";

export default interface Rating {
    isGameOver: boolean
    value: number
}

export interface Aspect<T = number> {
    red: T
    blue: T
}

export function substantiateAspect<T>(color: Color, aspect: Aspect<T>) {
    const ownValue = color === Color.Red ? aspect.red : aspect.blue
    const oppValue = color === Color.Blue ? aspect.red : aspect.blue

    return {
        own: ownValue,
        opponent: oppValue
    }
}