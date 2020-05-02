import ConcreteAspect from "./ConcreteAspect";

export default function evaluateSurrounding(surrounding: ConcreteAspect<number>): number {
    return Math.pow(2, surrounding.opponent) * ((1 - surrounding.own / 6) * 0.5 + 1) - Math.pow(2, surrounding.own)
}