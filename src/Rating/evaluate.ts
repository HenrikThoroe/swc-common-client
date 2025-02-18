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

const evaluationTable = createEvaluationTable()

function conclude(phase: GamePhase, surrounding: ConcreteAspect<number>, mobility: ConcreteAspect<number>, pinned: ConcreteAspect<boolean>, isBeetleOnBee: boolean, runaways: ConcreteAspect<number>) {
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

    let points = surroundingValue + mobilityValue
    const maximumExtraPoints = Math.pow(2, surrounding.opponent)

    if (isBeetleOnBee) {
        beeValue += maximumExtraPoints
    } else if (pinned.opponent && surrounding.opponent > 2) {
        beeValue += maximumExtraPoints * 0.8
    }

    points *= 1 - (0.1 * runaways.own)

    return points + beeValue
}

function calculateValue(state: State, player: Color, surrounding: Aspect<number>, mobility: Aspect<Mobility>): number {
    const phase = chooseGamePhase(player, surrounding, mobility)
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const concreteMobility = substantiateAspect(player, mobility)

    return conclude(phase, concreteSurrounding, rateMobility(state, phase, concreteMobility), substantiateAspect(player, isBeePinned(state)), isBeetleOnBee(state, player), substantiateAspect(player, scanRunaways(state)))
}

export default function evaluate(state: State, player: Color): Rating {
    const cached = evaluationTable.read(state)
    const surrounding = scanSurrounding(state)
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const isGameOver = (Math.max(surrounding.blue, surrounding.red) >= 6 && state.currentPlayer === Color.Red) || state.turn >= 60
    

    if (cached !== null) {
        return {
            isGameOver: isGameOver,
            value: cached,
            surrounding: concreteSurrounding
        }
    }

    
    const mobility = { red: scanMobility(state, Color.Red), blue: scanMobility(state, Color.Blue) }
    const  win = (isGameOver && concreteSurrounding.opponent === 6) || (isGameOver && concreteSurrounding.own < concreteSurrounding.opponent)
    const loose = (isGameOver && concreteSurrounding.own === 6) || (isGameOver && concreteSurrounding.own > concreteSurrounding.opponent)

    if (win && loose) {
        return {
            isGameOver: isGameOver,
            value: 190,
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