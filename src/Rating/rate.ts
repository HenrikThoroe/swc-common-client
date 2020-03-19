import { State, fetchMoves, Move } from "@henrikthoroe/swc-client";
import Rating, { Aspect, substantiateAspect, ConcreteAspect } from ".";
import rateMobility from "./rateMobility";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import rateSurrounding from "./rateSurrounding";
import Timer from "../utils/Timer";
import rateFocus from "./rateFocus";
import Mobility, { PieceCollection, sumPieceCollection } from "./Mobility";
import getMobility from "./getMobility";
import GamePhase from "./GamePhase";

const mobilityTable = new Map([[0, 3], [1, 2], [2, 1.5], [3, 1], [4, 0.9], [5, 0.9], [6, 0.9]])

function guard(x: number, min: number, max: number): number {
    if (x > max) return max
    if (x < min) return min

    return x
}

function conclude(phase: GamePhase, surrounding: ConcreteAspect<number>, mobility: ConcreteAspect<number>) {
    const index = phase === "early" ? 0 : phase === "mid" ? 1 : 2

    const factors = {
        surrounding:    [2, 8, 10],
        mobility:       [8, 2, 0]
    }

    // const surroundingConclusion = {
    //     own: Math.pow(2, surrounding.opponent),
    //     opp: Math.pow(2, surrounding.own) / (phase === "mid" ? 2 : 1)
    // }

    if (Math.max(mobility.own, mobility.opponent) > 1 || Math.max(mobility.own, mobility.opponent) < 0) {
        console.log("something went wrong", mobility)
    }

    let surroundingValue: number = (surrounding.opponent - surrounding.own) / 6
    let mobilityValue: number = mobility.own - mobility.opponent 

    switch (phase) {
        case "early":
            // surroundingValue = surrounding.opponent > surrounding.own ? 1 : 0
            mobilityValue *= 5
        case "mid":
            mobilityValue *= 0.7
            // surroundingValue = surrounding.opponent > surrounding.own ? 1 : 0
        case "late":
            mobilityValue *= 0.5
            // surroundingValue = surrounding.opponent >= surrounding.own ? 1 : 0
    }

    return surroundingValue + mobilityValue

    

    // const mobilityConclusion = {
    //     own: surroundingConclusion.own * mobility.own,
    //     opp: surroundingConclusion.opp * mobility.opponent,
    // }

    // return ((surroundingConclusion.own * factors.surrounding[index] + mobilityConclusion.own * factors.mobility[index]) - (surroundingConclusion.opp * factors.surrounding[index] + mobilityConclusion.opp * factors.mobility[index])) / 10
}

function chooseGamePhase(player: Color, surrounding: Aspect, mobility: Aspect<Mobility>): GamePhase {
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const concreteMobility = substantiateAspect(player, mobility)

    if (concreteSurrounding.own < 5 && (11 - sumPieceCollection(concreteMobility.own.undeployed) < 5)) {
        return "early"
    }

    if (Math.max(concreteSurrounding.own, concreteSurrounding.opponent) > 4) {
        return "late"
    }

    return "mid"
}

function calculateValue(state: State, player: Color, surrounding: Aspect, mobility: Aspect<Mobility>): number {
    const phase = chooseGamePhase(player, surrounding, mobility)
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const concreteMobility = substantiateAspect(player, mobility)

    return conclude(phase, concreteSurrounding, rateMobility(state, phase, concreteMobility))
}

export default function rate(state: State, player: Color, causingMove?: Move, moves?: Move[]): Rating {
    const surrounding = rateSurrounding(state)
    const mobility = { red: getMobility(state, Color.Red), blue: getMobility(state, Color.Blue) }
    const isLastMove = (Math.max(surrounding.blue, surrounding.red) >= 6 && state.currentPlayer === Color.Blue) || state.turn >= 60
    const concreteSurrounding = substantiateAspect(player, surrounding)

    if (concreteSurrounding.opponent === 6) {
        return {
            isGameOver: isLastMove,
            value: 200
        }
    }

    if (concreteSurrounding.own === 6) {
        return {
            isGameOver: isLastMove,
            value: -200
        }
    }

    const value = calculateValue(state, player, surrounding, mobility)

    return {
        isGameOver: isLastMove,
        value: value
    }
}