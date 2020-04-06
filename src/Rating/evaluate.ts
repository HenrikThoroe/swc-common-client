import { State, fetchMoves, Move } from "@henrikthoroe/swc-client";
import Rating, { Aspect, substantiateAspect, ConcreteAspect } from ".";
import rateMobility from "./rateMobility";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import scanSurrounding from "./Scanner/scanSurrounding";
import Mobility, { sumPieceCollection } from "./Mobility";
import scanMobility from "./Scanner/scanMobility";
import GamePhase, { chooseGamePhase } from "./GamePhase";
import createEvaluationTable from "../Cache/createEvaluationTable";
import evaluateSurrounding from "./evaluateSurrounding";
import enumerateBoard from "../utils/enumerateBoard";
import isDraggable from "@henrikthoroe/swc-client/dist/client/Worker/Moves/isDraggable";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";
import invertColor from "../utils/invertColor";
import isBeePinned from "../utils/isBeePinned";

const evaluationTable = createEvaluationTable()

function conclude(phase: GamePhase, surrounding: ConcreteAspect<number>, mobility: ConcreteAspect<number>, pinned: ConcreteAspect<boolean>) {
    if (Math.min(surrounding.own, surrounding.opponent) <= 0) {
        return mobility.own - mobility.opponent 
    }

    let surroundingValue: number = evaluateSurrounding(surrounding) 
    let mobilityValue: number = mobility.own - mobility.opponent 
    let beeValue = 0

    switch (phase) {
        case "early":
            mobilityValue *= 20
        case "mid":
            mobilityValue *= 1
        case "late":
            mobilityValue *= 1
    }

    beeValue += pinned.own ? -50 : 50
    beeValue += pinned.opponent ? 50 : -50

    return surroundingValue + mobilityValue + beeValue
}

function calculateValue(state: State, player: Color, surrounding: Aspect, mobility: Aspect<Mobility>): number {
    const phase = chooseGamePhase(player, surrounding, mobility)
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const concreteMobility = substantiateAspect(player, mobility)

    return conclude(phase, concreteSurrounding, rateMobility(state, phase, concreteMobility), substantiateAspect(player, isBeePinned(state)))
}

export default function evaluate(state: State, player: Color): Rating {
    const cached = evaluationTable.read(state)
    const surrounding = scanSurrounding(state)
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const isLastMove = (Math.max(surrounding.blue, surrounding.red) >= 6 && state.currentPlayer === Color.Blue) || state.turn >= 59

    if (cached !== null) {
        return {
            isGameOver: isLastMove,
            value: cached,
            surrounding: concreteSurrounding
        }
    }

    
    const mobility = { red: scanMobility(state, Color.Red), blue: scanMobility(state, Color.Blue) }

    if ((isLastMove && concreteSurrounding.opponent === 6) || (isLastMove && concreteSurrounding.own < concreteSurrounding.opponent)) {
        // Environment.debugPrint("Expected end (good): ", state.turn)
        return {
            isGameOver: isLastMove,
            value: 200,
            surrounding: concreteSurrounding
        }
    }

    if ((isLastMove && concreteSurrounding.own === 6) || (isLastMove && concreteSurrounding.own > concreteSurrounding.opponent)) {
        // Environment.debugPrint("Expected end (bad): ", state.turn)
        return {
            isGameOver: isLastMove,
            value: -200,
            surrounding: concreteSurrounding
        }
    }

    const value = calculateValue(state, player, surrounding, mobility)

    evaluationTable.push(state, value)

    return {
        isGameOver: isLastMove,
        value: value,
        surrounding: concreteSurrounding
    }
}