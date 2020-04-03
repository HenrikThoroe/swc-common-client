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

const evaluationTable = createEvaluationTable()

function conclude(state: State, player: Color, phase: GamePhase, surrounding: ConcreteAspect<number>, mobility: ConcreteAspect<number>) {
    if (Math.min(surrounding.own, surrounding.opponent) <= 0) {
        return mobility.own - mobility.opponent 
    }

    let surroundingValue: number = evaluateSurrounding(surrounding) 
    let mobilityValue: number = mobility.own - mobility.opponent 

    switch (phase) {
        case "early":
            mobilityValue *= 20
        case "mid":
            mobilityValue *= 1
        case "late":
            mobilityValue *= 1
    }

    enumerateBoard(state.board, field => {
        if (field.pieces.length > 0) {
            const index = field.pieces.findIndex(piece => piece.type === Type.BEE)

            if (index > -1) {
                let pinned = true

                if (index === field.pieces.length - 1) {
                    pinned = !isDraggable(state, field.position)
                }
                
                if (field.pieces[index].owner === player && pinned) {
                    mobilityValue -= 80
                } else if (field.pieces[index].owner === invertColor(player) && pinned) {
                    mobilityValue += 80
                }
            }
        }
    })

    return surroundingValue + mobilityValue
}

function calculateValue(state: State, player: Color, surrounding: Aspect, mobility: Aspect<Mobility>): number {
    const phase = chooseGamePhase(player, surrounding, mobility)
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const concreteMobility = substantiateAspect(player, mobility)

    return conclude(state, player, phase, concreteSurrounding, rateMobility(state, phase, concreteMobility))
}

export default function evaluate(state: State, player: Color): Rating {
    const cached = evaluationTable.read(state)
    const surrounding = scanSurrounding(state)
    const isLastMove = (Math.max(surrounding.blue, surrounding.red) >= 6 && state.currentPlayer === Color.Blue) || state.turn >= 60

    if (cached) {
        return {
            isGameOver: isLastMove,
            value: cached
        }
    }

    
    const mobility = { red: scanMobility(state, Color.Red), blue: scanMobility(state, Color.Blue) }
    const concreteSurrounding = substantiateAspect(player, surrounding)

    if ((concreteSurrounding.opponent === 6 && player === Color.Blue) || (isLastMove && concreteSurrounding.own < concreteSurrounding.opponent)) {
        return {
            isGameOver: isLastMove,
            value: 200
        }
    }

    if ((concreteSurrounding.own === 6 && player === Color.Blue) || (isLastMove && concreteSurrounding.own > concreteSurrounding.opponent)) {
        return {
            isGameOver: isLastMove,
            value: -200
        }
    }

    const value = calculateValue(state, player, surrounding, mobility)

    evaluationTable.push(state, value)

    return {
        isGameOver: isLastMove,
        value: value
    }
}