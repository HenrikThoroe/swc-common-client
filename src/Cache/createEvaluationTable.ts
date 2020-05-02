import LookupTable from "./LookupTable";
import { State } from "@henrikthoroe/swc-client";
import hashState from "../utils/hashState";
import appendTurnValue from "../utils/appendTurnValue";
import globalState from "../globalState";
import removeTurnValue from "../utils/removeTurnValue";

export type EvaluationTable = LookupTable<State, number>

/**
 * Creates a `LookupTable` for storing the results of state evaluations.
 */
export default function createEvaluationTable(): EvaluationTable {
    // Estimated Size: ~500MB
    return new LookupTable(2688170, hashState)
    // return new LookupTable(
    //     2688170, 
    //     hashState, 
    //     (state, value) => appendTurnValue(state, value, { color: globalState.color }),
    //     (state, value) => removeTurnValue(state, value, { color: globalState.color })
    // )
}