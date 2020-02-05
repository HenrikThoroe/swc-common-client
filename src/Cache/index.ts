import fs from 'fs'
import path from 'path'
import storage from 'node-persist'

export type CCBranch = "drag_factor" | "set_factor"

class CacheHandler {

    // private dragValues: number[] = []
    
    // async set(branch: CCBranch, key: string, value: number) {
    //     await storage.init({ dir: `./Assets/${branch}` })
    //     await storage.setItem(key, value)

    //     storage.create
    // }

    // async get(branch: CCBranch, key: string): Promise<number> {
    //     await storage.init({ dir: `./Assets/${branch}` })
    //     return await storage.getItem(key) as number
    // }

    private dragMoves: number[]

    private setMoves: number[]

    constructor() {
        this.dragMoves = JSON.parse(fs.readFileSync(path.resolve(`./Assets/${"drag_factor"}.json`), "utf8")) || new Array<number>(61).fill(0)
        this.setMoves = JSON.parse(fs.readFileSync(path.resolve(`./Assets/${"set_factor"}.json`), "utf8")) || new Array<number>(61).fill(0)
    }

    set(branch: CCBranch, key: number, value: number) {
        switch (branch) {
            case "set_factor":
                this.setMoves[key] = value
                break
            case "drag_factor":
                this.dragMoves[key] = value
                break
        }

        fs.writeFileSync(path.resolve(`./Assets/${"drag_factor"}.json`), JSON.stringify(this.dragMoves))
        fs.writeFileSync(path.resolve(`./Assets/${"set_factor"}.json`), JSON.stringify(this.setMoves))
    }

    get(branch: CCBranch, key: number): number {
        switch (branch) {
            case "set_factor":
                return this.setMoves[key]
            case "drag_factor":
                return this.dragMoves[key]
        }
    }

}

export default new CacheHandler()