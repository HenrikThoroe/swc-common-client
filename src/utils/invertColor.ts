import { Color } from "@henrikthoroe/swc-client";

export default function invertColor(color: Color): Color {
    return ~color
}