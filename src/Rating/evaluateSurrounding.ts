import { ConcreteAspect } from ".";

export default function evaluateSurrounding(surrounding: ConcreteAspect<number>): number {
    return Math.pow(2, surrounding.opponent) - Math.pow(2, surrounding.own)
}