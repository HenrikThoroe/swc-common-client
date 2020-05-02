import LookupTable from "./LookupTable";
import { State, Move } from "@henrikthoroe/swc-client";
import hashState from "../utils/hashState";
import appendTurnValue from "../utils/appendTurnValue";
import globalState from "../globalState";
import removeTurnValue from "../utils/removeTurnValue";

export enum TranspositionTableFlag {
    Exact,
    LowerBound,
    UpperBound
}

export interface TranspositionTableEntry {
    flag: TranspositionTableFlag
    value: number
    depth: number
    move: Move | number
}

export type TranspositionTable = LookupTable<State, TranspositionTableEntry>

export default function createTranspositionTable(): TranspositionTable {
    return new LookupTable(500000, hashState, 
        (state, entry) => {
            entry.value = appendTurnValue(state, entry.value, { color: globalState.color })
            return entry
        },
        (state, entry) => {
            entry.value = removeTurnValue(state, entry.value, { color: globalState.color })
            return entry
        }
    )
}