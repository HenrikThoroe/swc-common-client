import connect from '@henrikthoroe/swc-client'
import handleMoveRequest from './requestHandler/handleMoveRequest'
import handleResult from './requestHandler/handleResult'
import globalState from './globalState'

connect(globalState.parseConnectOptions(), handleResult, handleMoveRequest)
    .catch(error => {
        console.error("Failed to connect: ", error)
    })
