import yargs from "yargs"
import path from "path"
import util from "util"
import * as fs from "fs"

async function main() {
    const args = yargs
        .option("destination", {
            alias: "d",
            type: "string"
        })
        .option("tag", {
            alias: "t",
            type: "string"
        })
        .option("force", {
            alias: "f",
            type: "boolean"
        })
        .parse()

    if (args.destination === undefined) {
        throw new Error(`To export the software a destination must be provided.`)
    }

    const exists = util.promisify(fs.exists)
    const rmdir = util.promisify(fs.rmdir)
    const unlink = util.promisify(fs.unlink)
    const mkdir = util.promisify(fs.mkdir)
    const copyFile = util.promisify(fs.copyFile)
    const destinationDir = `${args.destination}/swc-player${args.tag ? "-" + args.tag : ""}`
    const destinationDist = `${destinationDir}/dist`
    
    const src = {
        start: path.resolve(__dirname, "./start.sh"),
        bundle: path.resolve(__dirname, "./dist/bundle.js")
    }

    const dest = {
        start: `${destinationDir}/start.sh`,
        bundle: `${destinationDist}/bundle.js`
    }

    if (args.force && await exists(destinationDir)) {
        console.warn(`Trying to remove ${destinationDir}`)

        await unlink(dest.start)
        await unlink(dest.bundle)
        await rmdir(destinationDist)
        await rmdir(destinationDir)
    }

    await mkdir(destinationDir)
    await copyFile(src.start, dest.start)
    await mkdir(destinationDist)
    await copyFile(src.bundle, dest.bundle)
}

main()
    .then(() => {
        console.log("Successfully exported application")
    })
    .catch(e => {
        console.error("Failed to export application")
        console.error(e)
    })
