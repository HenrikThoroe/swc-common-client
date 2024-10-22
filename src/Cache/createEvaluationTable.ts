import LookupTable from "./LookupTable";
import { State } from "@henrikthoroe/swc-client";
import hashState from "../utils/hashState";

export type EvaluationTable = LookupTable<State, number>

/**
 * Creates a `LookupTable` for storing the results of state evaluations.
 */
export default function createEvaluationTable(): EvaluationTable {
    // Estimated Size: ~500MB
    return new LookupTable(2688170, hashState)
}