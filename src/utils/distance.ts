import { Position } from "@henrikthoroe/swc-client";

function normalize(pos: Position, origin: Position): Position {
    return {
        x: pos.x - origin.x,
        y: pos.y - origin.y,
        z: pos.z - origin.z
    }
}

function sum(pos: Position): number {
    return Math.abs(pos.x) + Math.abs(pos.y) + Math.abs(pos.z)
}

export default function distance(a: Position, b: Position) {
    return sum(normalize(b, a)) / 2
} 