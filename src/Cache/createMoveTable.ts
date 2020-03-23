import LookupTable from "./LookupTable";
import { State, Move } from "@henrikthoroe/swc-client";
import hashState from "../utils/hashState";

export type MoveTable = LookupTable<State, Move[]>

/**
 * Creates a lookup table for move calculation.
 */
export default function createMoveTable(): MoveTable {
    // Estimated Size: ~100MB
    return new LookupTable(413223, hashState)
}