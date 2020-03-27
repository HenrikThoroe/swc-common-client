import LookupTable from "./LookupTable";
import { State } from "@henrikthoroe/swc-client";
import hashState from "../utils/hashState";

export enum TranspositionTableFlag {
    Exact,
    LowerBound,
    UpperBound
}

export interface TranspositionTableEntry {
    flag: TranspositionTableFlag
    value: number
    depth: number
}

export type TranspositionTable = LookupTable<State, TranspositionTableEntry>

export default function createTranspositionTable(): TranspositionTable {
    return new LookupTable(500000, hashState)
}