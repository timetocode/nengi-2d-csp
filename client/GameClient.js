import nengi from 'nengi'
import nengiConfig from '../common/nengiConfig'
import Simulator from './Simulator'

class GameClient {
    constructor() {
        this.client = new nengi.Client(nengiConfig, 100) 
        this.simulator = new Simulator(this.client)

        this.client.onConnect(res => {
            console.log('onConnect response:', res)
        })

        this.client.onClose(() => {
            console.log('connection closed')
        })

        this.client.connect('ws://localhost:8079')       
    }

    update(delta, tick, now) {
        const network = this.client.readNetwork()

        network.entities.forEach(snapshot => {
            snapshot.createEntities.forEach(entity => {
                this.simulator.createEntity(entity)
            })
    
            snapshot.updateEntities.forEach(update => {
                this.simulator.updateEntity(update)
            })
    
            snapshot.deleteEntities.forEach(id => {
                this.simulator.deleteEntity(id)
            })
        })

        network.predictionErrors.forEach(predictionErrorFrame => {
            this.simulator.processPredictionError(predictionErrorFrame)
        })

        network.messages.forEach(message => {
            this.simulator.processMessage(message)
        })

        network.localMessages.forEach(localMessage => {
            this.simulator.processLocalMessage(localMessage)
        })

        this.simulator.update(delta)
        this.client.update()
    }
}

export default GameClient
