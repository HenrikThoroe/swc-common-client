import LookupTable from "./LookupTable";
import { State, Move } from "@henrikthoroe/swc-client";
import hashState from "../utils/hashState";
import hashMove from "../utils/hashMove";

export type KillerTable = LookupTable<[State, Move], boolean>

export default function createKillerTable(): KillerTable {
    return new LookupTable(1000000, key => {
        return hashState(key[0]) + hashMove(key[1])
    })
}