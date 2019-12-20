import { State } from "@henrikthoroe/swc-client";
import Rating from ".";

export default function rate(state: State): Rating {
    return {
        mobility: {
            me: state.undeployed.red.length,
            opponent: 0
        },
        surrounding: {
            me: 0,
            opponent: 0
        }
    }
}