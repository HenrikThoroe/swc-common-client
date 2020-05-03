import { State, getNeighbours } from "@henrikthoroe/swc-client";
import Rating from ".";
import rateMobility from "./rateMobility";
import Color from "@henrikthoroe/swc-client/dist/client/Model/Color";
import scanSurrounding from "./Scanner/scanSurrounding";
import Mobility from "./Mobility";
import scanMobility from "./Scanner/scanMobility";
import GamePhase, { chooseGamePhase } from "./GamePhase";
import createEvaluationTable from "../Cache/createEvaluationTable";
import evaluateSurrounding from "./evaluateSurrounding";
import isBeePinned from "../utils/isBeePinned";
import ConcreteAspect, { substantiateAspect } from "./ConcreteAspect";
import Aspect from "./Aspect";
import isBeetleOnBee from "./Scanner/isBeetleOnBee";
import scanRunaways from "./Scanner/scanRunaways";
import globalState from "../globalState";
import enumerateBoard from "../utils/enumerateBoard";
import { Type } from "@henrikthoroe/swc-client/dist/client/Model/Piece";

const evaluationTable = createEvaluationTable()

function conclude(state: State, color: Color, phase: GamePhase, surrounding: ConcreteAspect<number>, mobility: ConcreteAspect<number>, pinned: ConcreteAspect<boolean>, isBeetleOnBee: boolean, runaways: ConcreteAspect<number>, undeployed: ConcreteAspect<number>) {
    if (Math.min(surrounding.own, surrounding.opponent) <= 0) {
        return mobility.own - mobility.opponent 
    }

    let surroundingValue: number = evaluateSurrounding(surrounding) 
    let mobilityValue: number = mobility.own - mobility.opponent 
    let beeValue = 0

    // switch (phase) {
    //     case "early":
    //         mobilityValue *= 20
    //     case "mid":
    //         mobilityValue *= 1
    //     case "late":
    //         mobilityValue *= 1
    // }

    let points = surroundingValue + mobilityValue
    const maximumExtraPoints = Math.pow(2, surrounding.opponent)

    if (isBeetleOnBee) {
        beeValue += maximumExtraPoints
    } else if (pinned.opponent && surrounding.opponent > 1) {
        beeValue += maximumExtraPoints * 0.8
    }

    points *= 1 - (0.1 * runaways.own)
    points += (points / 200) * ((undeployed.own / 11)) 

    enumerateBoard(state.board, field => {
        if (field.pieces.length > 0 && field.pieces.some(piece => piece.type === Type.BEE && piece.owner === color)) {
            if (Math.abs(field.position.x) + Math.abs(field.position.y) + Math.abs(field.position.z) === 10 || getNeighbours(state.board, field.position).some(f => f.isObstructed)) {
                points *= 0.5
            }
        }
    })


    return points + beeValue
}

function calculateValue(state: State, player: Color, surrounding: Aspect<number>, mobility: Aspect<Mobility>): number {
    const phase = chooseGamePhase(player, surrounding, mobility)
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const concreteMobility = substantiateAspect(player, mobility)

    const undeployed = substantiateAspect(player, {
        red: state.undeployed.red.length,
        blue: state.undeployed.blue.length
    })

    return conclude(state, player, phase, concreteSurrounding, rateMobility(state, phase, concreteMobility), substantiateAspect(player, isBeePinned(state)), isBeetleOnBee(state, player), substantiateAspect(player, scanRunaways(state)), undeployed)
}

export default function evaluate(state: State, player: Color, color: number = 1): Rating {
    const cached = evaluationTable.read(state)
    const surrounding = scanSurrounding(state)
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const isGameOver = (Math.max(surrounding.blue, surrounding.red) >= 6 && state.currentPlayer === Color.Red) || state.turn >= 60
    

    if (cached !== null && !isGameOver) {
        return {
            isGameOver: isGameOver,
            value: cached,
            surrounding: concreteSurrounding
        }
    }

    
    const mobility = { red: scanMobility(state, Color.Red), blue: scanMobility(state, Color.Blue) }
    const win = (isGameOver && concreteSurrounding.opponent === 6) || (isGameOver && concreteSurrounding.own < concreteSurrounding.opponent)
    const loose = (isGameOver && concreteSurrounding.own === 6) || (isGameOver && concreteSurrounding.own > concreteSurrounding.opponent)
    const draw = (!win && !loose && isGameOver) || (win && loose)

    if (draw) {
        return {
            isGameOver: isGameOver,
            value: color === 0 ? 0 : 190 * color,
            surrounding: concreteSurrounding
        }
    }

    if (win) {
        // Environment.debugPrint("Expected end (good): ", state.turn)
        return {
            isGameOver: isGameOver,
            value: 200 + (concreteSurrounding.opponent - concreteSurrounding.own),
            surrounding: concreteSurrounding
        }
    }

    if (loose) {
        // Environment.debugPrint("Expected end (bad): ", state.turn)
        return {
            isGameOver: isGameOver,
            value: -200 - (concreteSurrounding.own - concreteSurrounding.opponent),
            surrounding: concreteSurrounding
        }
    }

    const value = calculateValue(state, player, surrounding, mobility)

    evaluationTable.push(state, value)

    return {
        isGameOver: isGameOver,
        value: value,
        surrounding: concreteSurrounding
    }
}