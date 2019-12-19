import connect from '@henrikthoroe/swc-client'

connect({ host: "localhost", port: 13050 }, (state, undeployed, player, available) => {
    if (available.length === 0) {
        throw new Error("No available moves")
    }

    const index = Math.floor(Math.random() * available.length)
    return available[index]
})
.catch(error => {
    console.error(error)
})