import LookupTable from "./LookupTable";
import encodeBase64 from "../utils/encodeBase64";

export type StateMemoryTable = LookupTable<number, number>

/**
 * Creates a table which holds the rating of a state with it's turn as key.
 */
export default function createStateMemoryTable(): StateMemoryTable {
    return new LookupTable(70, x => encodeBase64(x))
}