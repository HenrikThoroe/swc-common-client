import { Color } from "@henrikthoroe/swc-client"
import Mobility, { sumPieceCollection } from "./Mobility"
import Aspect from "./Aspect"
import { substantiateAspect } from "./ConcreteAspect"

type GamePhase = "early" | "mid" | "late"

export function chooseGamePhase(player: Color, surrounding: Aspect<number>, mobility: Aspect<Mobility>): GamePhase {
    const concreteSurrounding = substantiateAspect(player, surrounding)
    const concreteMobility = substantiateAspect(player, mobility)

    if (concreteSurrounding.own < 5 && (11 - sumPieceCollection(concreteMobility.own.undeployed) < 5)) {
        return "early"
    }

    if (concreteSurrounding.own > 4 || concreteSurrounding.opponent > 4) {
        return "late"
    }

    return "mid"
}

export default GamePhase