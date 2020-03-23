import { Color } from "@henrikthoroe/swc-client"
import { Aspect, substantiateAspect } from "."
import Mobility, { sumPieceCollection } from "./Mobility"

type GamePhase = "early" | "mid" | "late"

export function chooseGamePhase(player: Color, surrounding: Aspect, mobility: Aspect<Mobility>): GamePhase {
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

export default GamePhase