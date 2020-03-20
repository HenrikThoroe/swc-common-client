import LookupTable from "./LookupTable";
import { State, Piece } from "@henrikthoroe/swc-client";
import enumerateBoard from "../utils/enumerateBoard";
import encodeBase64 from "../utils/encodeBase64";

export type EvaluationTable = LookupTable<State, number>

export default function createEvaluationTable(): EvaluationTable {
    return new LookupTable(4000, state => {
        let key = ""

        enumerateBoard(state.board, field => {
            for (let i = 0; i < field.pieces.length; ++i) {
                const id = (field.position.x << 12) ^ (field.position.y << 8) ^ (field.position.z << 4) ^ (field.pieces[i].type << 3) ^ field.pieces[i].owner
                key += encodeBase64(id)
            }
        })

        return key
    })
}