import LookupTable from "./LookupTable";
import { State, Piece } from "@henrikthoroe/swc-client";
import enumerateBoard from "../utils/enumerateBoard";
import encodeBase64 from "../utils/encodeBase64";
import hashState from "../utils/hashState";

export type EvaluationTable = LookupTable<State, number>

export default function createEvaluationTable(): EvaluationTable {
    return new LookupTable(10000, hashState)
}