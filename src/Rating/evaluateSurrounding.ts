import ConcreteAspect from "./ConcreteAspect";

export default function evaluateSurrounding(surrounding: ConcreteAspect<number>): number {
    const opponentImportance = 1 + (1 - surrounding.own / 6) 

    return Math.pow(2, surrounding.opponent) * opponentImportance - Math.pow(2, surrounding.own)
}