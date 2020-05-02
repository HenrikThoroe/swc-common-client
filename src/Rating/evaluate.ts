import { State } from "@henrikthoroe/swc-client";
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
import appendTurnValue from "../utils/appendTurnValue";
import generateMoves from "../LookAhead/generateMoves";

const evaluationTable = createEvaluationTable()

function conclude(surrounding: ConcreteAspect<number>, mobility: ConcreteAspect<number>, pinned: ConcreteAspect<boolean>, isBeetleOnBee: boolean, runaways: ConcreteAspect<number>, undeployed: ConcreteAspect<number>) {
    let surroundingValue: number = evaluateSurrounding(surrounding) 
    let mobilityValue: number = mobility.own - mobility.opponent 
    let beeValue = 0

    let points = surroundingValue + mobilityValue
    const maximumExtraPoints = Math.pow(2, surrounding.opponent)

    if (isBeetleOnBee) {
        beeValue += maximumExtraPoints
    } else if (pinned.opponent && surrounding.opponent > 1) {
        beeValue += maximumExtraPoints * 0.8
    }

    points *= 1 - (0.1 * runaways.own)

    // if (phase !== "early") {
    //     points += (1 - (undeployed.own / 11)) * 10
    // }

    points += ((undeployed.own / 11)) * 10

    return points + beeValue
}

function calculateValue(state: State, player: Color, surrounding: Aspect<number>): number {
    // const phase = chooseGamePhase(player, surrounding, mobility)
    const mobility = { red: scanMobility(state, Color.Red), blue: scanMobility(state, Color.Blue) }
    const phase = chooseGamePhase(player, surrounding, mobility)
    const concreteMobility = rateMobility(state, phase, substantiateAspect(player, mobility))
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const undeployed = substantiateAspect(player, {
        red: state.undeployed.red.length,
        blue: state.undeployed.blue.length
    })

    if (Math.min(concreteSurrounding.own, concreteSurrounding.opponent) <= 0) {
        return concreteMobility.own - concreteMobility.opponent 
    }

    return conclude(concreteSurrounding, concreteMobility, substantiateAspect(player, isBeePinned(state)), isBeetleOnBee(state, player), substantiateAspect(player, scanRunaways(state)), undeployed)
}

function applyTimeFactor(turn: number, value: number, surrounding: number): number {
    const factor = 1 + (0.5 - ((turn / 60) * 0.5))
    const diff = value - surrounding

    return (surrounding * factor) + diff
}

export default function evaluate(state: State, player: Color, color: number = 1, noMoves: boolean = false): Rating {
    const surrounding = scanSurrounding(state)
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const isGameOver = (Math.max(surrounding.blue, surrounding.red) >= 6 && state.currentPlayer === Color.Red) || state.turn >= 60
    const cached = evaluationTable.read(state)

    if (cached !== null && !isGameOver) {
        return {
            isGameOver: isGameOver,
            value: cached,
            surrounding: concreteSurrounding
        }
    }

    
    // const mobility = { red: scanMobility(state, Color.Red), blue: scanMobility(state, Color.Blue) }
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

    if (loose || generateMoves(state, false).length === 0) {
        // Environment.debugPrint("Expected end (bad): ", state.turn)
        return {
            isGameOver: isGameOver,
            value: -200 - (concreteSurrounding.own - concreteSurrounding.opponent),
            surrounding: concreteSurrounding
        }
    }

    const value = calculateValue(state, player, surrounding)

    evaluationTable.push(state, value)

    return {
        isGameOver: isGameOver,
        value: value,
        surrounding: concreteSurrounding
    }
}