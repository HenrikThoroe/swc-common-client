import { State, fetchMoves, Move } from "@henrikthoroe/swc-client";
import Rating, { Aspect, substantiateAspect } from ".";
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

function conclude(ownSurrounding: number, opponentSurrounding: number, ownMobility: number, opponentMobility: number) {
    ownSurrounding = guard(ownSurrounding, 0, 6)
    opponentSurrounding = guard(opponentSurrounding, 0, 6)
    ownMobility = guard(ownMobility, 0, 1)
    opponentMobility = guard(opponentMobility, 0, 1)

    const surroundingConclusion = {
        own: Math.pow(2, opponentSurrounding),
        opp: Math.pow(2, ownSurrounding)
    }

    const moveConclusion = {
        own: surroundingConclusion.own * ownMobility, // mobilityTable.get(ownSurrounding)! * (ownMobility / 1024),
        opp: surroundingConclusion.opp * opponentMobility, // mobilityTable.get(opponentSurrounding)! * (opponentMobility / 1024)
    }

    if (moveConclusion.own === 0) {
        return 0
    } 

    if (moveConclusion.opp === 0) {
        return 100000
    }

    const ownConclusion = surroundingConclusion.own + moveConclusion.own
    const opponentConclusion = surroundingConclusion.opp + moveConclusion.opp

    return ownConclusion - opponentConclusion
}

function chooseGamePhase(player: Color, surrounding: Aspect, mobility: Aspect<Mobility>): GamePhase {
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const concreteMobility = substantiateAspect(player, mobility)

    if (concreteSurrounding.own < 4 && (11 - sumPieceCollection(concreteMobility.own.undeployed) < 6)) {
        return "early"
    }

    if (Math.max(concreteSurrounding.own, concreteSurrounding.opponent) > 4) {
        return "late"
    }

    return "mid"
}

function calculateValue(state: State, player: Color, surrounding: Aspect, mobility: Aspect<Mobility>): number {


    switch (player) {
        case Color.Red:
            if (surrounding.red === 6) {
                return -100000
            }

            if (surrounding.blue === 6) {
                return 100000
            }

            return conclude(surrounding.red, surrounding.blue, mobility.red, mobility.blue) 
        case Color.Blue:
            if (surrounding.red === 6) {
                return 100000
            }

            if (surrounding.blue === 6) {
                return -100000
            }

            return conclude(surrounding.blue, surrounding.red, mobility.blue, mobility.red) 
    }
}

export default function rate(state: State, player: Color, causingMove?: Move, moves?: Move[]): Rating {
    const surrounding = rateSurrounding(state)
    const mobility = { red: getMobility(state, Color.Red), blue: getMobility(state, Color.Blue) }
    const isLastMove = (Math.max(surrounding.blue, surrounding.red) >= 6 && state.currentPlayer === Color.Blue) || state.turn >= 60

    return {
        isGameOver: isLastMove,
        value: calculateValue(state, player, surrounding, mobility)
    }
}