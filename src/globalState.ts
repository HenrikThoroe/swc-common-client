import { ConnectOptions, Color } from "@henrikthoroe/swc-client"
import Environment from "./utils/Environment"
import yargs from "yargs"

export interface State {
    host: string,
    port: number,
    reservation?: string,
    simpleClient: boolean,
    productionMode: boolean,
    color: Color
    printAvailableMoves: boolean
    depth: number
}

class GlobalState implements State {

    color: Color

    readonly host: string

    readonly port: number

    readonly reservation: string | undefined

    readonly simpleClient: boolean

    readonly productionMode: boolean

    readonly printAvailableMoves: boolean

    readonly depth: number

    constructor(state: State) {
        this.host = state.host
        this.port = state.port
        this.simpleClient = state.simpleClient
        this.productionMode = state.productionMode
        this.reservation = state.reservation
        this.color = state.color
        this.printAvailableMoves = state.printAvailableMoves
        this.depth = state.depth
        this.prepareEnvironment()
    }

    private prepareEnvironment() {
        Environment.mode = this.productionMode ? "production" : "development"
        process.on("exit", e => {
            Environment.print(`Process terminated with error code ${e}`)
        })
    }

    parseConnectOptions(): ConnectOptions {
        return {
            host: this.host, 
            port: this.port, 
            joinOptions: { 
                rc: this.reservation 
            } 
        }
    }

    static fromCommandLineArguments() {
        const args = yargs
            .option("host", {
                alias: "h",
                type: "string"
            })
            .option("port", {
                alias: "p",
                type: "number"
            })
            .option("reservation", {
                alias: "r",
                type: "string"
            })
            .option("stupid", {
                alias: "s",
                type: 'boolean'
            })
            .options("production", {
                type: "boolean"
            })
            .option("printAvailableMoves", {
                type: "boolean"
            })
            .option("depth", {
                type: "number",
                alias: "d"
            })
            .parse()
        
        const state: State = {
            host: args.host || "localhost",
            port: args.port || 13050,
            reservation: args.reservation,
            simpleClient: args.stupid || false,
            productionMode: args.production || false,
            color: Color.Red,
            printAvailableMoves: args.printAvailableMoves || false,
            depth: args.depth || 3
        }

        return new GlobalState(state)
    }

}

/**
 * An object which contains information about the state of the application to share this state between multiple files.
 * It is not related to the game state. 
 */
const globalState = GlobalState.fromCommandLineArguments()

export default globalState