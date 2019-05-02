import PIXIRenderer from './graphics/PIXIRenderer'
import PlayerCharacter from '../common/entity/PlayerCharacter'
import Obstacle from '../common/entity/Obstacle'
import InputSystem from './InputSystem'
import MoveCommand from '../common/command/MoveCommand'
import FireCommand from '../common/command/FireCommand'

// ignoring certain data from the sever b/c we will be predicting these properties on the client
const ignoreProps = ['x', 'y', 'rotation']
const shouldIgnore = (myId, update) => {
    if (update.nid === myId) {
        if (ignoreProps.indexOf(update.prop) !== -1) {
            return true
        }
    }
    return false
}

class Simulator {
    constructor(client) {
        this.client = client
        this.renderer = new PIXIRenderer()
        this.input = new InputSystem()
        this.entities = new Map()

        this.obstacles = new Map()

        this.myRawId = -1
        this.mySmoothId = -1

        this.myRawEntity = null
        this.mySmoothEntity = null
    }

    createEntity(entity) {
        console.log('create entity', entity)

        if (entity.protocol.name === 'PlayerCharacter') {
            let newEntity = new PlayerCharacter()
            Object.assign(newEntity, entity)
            this.entities.set(newEntity.nid, newEntity)

            this.renderer.createEntity(entity)
            if (entity.nid === this.myRawId) {
                // console.log('discovered self')
                this.myRawEntity = newEntity
                // for debugging purposes turn the entity we control white
                this.renderer.entities.get(entity.nid).body.tint = 0xffffff
            }

            if (entity.nid === this.mySmoothId) {
                // hide our smooth
                this.mySmoothEntity = newEntity
                this.renderer.entities.get(entity.nid).hide()
            }
        }


        if (entity.protocol.name === 'Obstacle') {
            const obs = new Obstacle(entity.x, entity.y, entity.width, entity.height)
            this.obstacles.set(entity.nid, obs)
            this.renderer.createEntity(entity)
        }
    }

    updateEntity(update) {
        if (!shouldIgnore(this.myRawId, update)) {
            //console.log('update', update)
            const entity = this.entities.get(update.nid)
            entity[update.prop] = update.value
            this.renderer.updateEntity(update)
        }
    }

    deleteEntity(id) {
        this.renderer.deleteEntity(id)
        this.entities.delete(id)
    }

    processMessage(message) {
        if (message.protocol.name === 'Identity') {
            this.myRawId = message.rawId
            this.mySmoothId = message.smoothId
            console.log('identified as', message)
        }
    }

    processLocalMessage(message) {
        if (message.protocol.name === 'WeaponFired') {
            //console.log('server says a weapon was fired', message)
            if (message.sourceId === this.mySmoothEntity.nid) {
                return
            }
            this.renderer.drawHitscan(message.x, message.y, message.tx, message.ty, 0xff0000)
        }
    }

    processPredictionError(predictionErrorFrame) {
        predictionErrorFrame.entities.forEach(predictionErrorEntity => {
            // get our clientside entity
            const entity = this.myRawEntity//localEntity.get(predictionErrorEntity.id)

            // correct any prediction errors with server values...
            predictionErrorEntity.errors.forEach(predictionError => {
                //console.log('prediciton error', predictionError)
                entity[predictionError.prop] = predictionError.actualValue
            })

            // and then re-apply any commands issued since the frame that had the prediction error
            const commandSets = this.client.getUnconfirmedCommands() // client knows which commands need redone
            commandSets.forEach((commandSet, clientTick) => {
                commandSet.forEach(command => {
                    // example assumes 'PlayerInput' is the command we are predicting
                    if (command.protocol.name === 'MoveCommand') {
                        entity.processMove(command)
                        const prediction = {
                            nid: entity.nid,
                            x: entity.x,
                            y: entity.y
                        }
                        this.client.addCustomPrediction(clientTick, prediction, ['x', 'y']) // overwrite
                    }
                })
            })
        })
    }

    simulateShot(x, y, tx, ty) {
        // TODO: simulate impact against entities/terrain
        this.renderer.drawHitscan(x, y, tx, ty, 0xffffff)
    }

    update(delta) {
        const input = this.input.frameState

        let rotation = 0
        const worldCoord = this.renderer.toWorldCoordinates(this.input.currentState.mx, this.input.currentState.my)

        if (this.myRawEntity) {
            const dx = worldCoord.x - this.myRawEntity.x
            const dy = worldCoord.y - this.myRawEntity.y
            rotation = Math.atan2(dy, dx)
        }




        this.input.releaseKeys()

        if (this.myRawEntity) {

            // movement
            const moveCommand = new MoveCommand(input.w, input.a, input.s, input.d, rotation, delta)
            this.client.addCommand(moveCommand)
            this.myRawEntity.processMove(moveCommand, this.obstacles)

            const prediction = {
                nid: this.myRawEntity.nid,
                x: this.myRawEntity.x,
                y: this.myRawEntity.y
            }
            this.client.addCustomPrediction(this.client.tick, prediction, ['x', 'y'])

            const entity = this.myRawEntity
            this.renderer.move(entity.nid, entity.x, entity.y, rotation)
            this.renderer.centerCamera(entity)

            // shooting
            this.myRawEntity.weaponSystem.update(delta)
            if (input.mouseDown) {
                if (this.myRawEntity.fire()) {
                    this.client.addCommand(new FireCommand(worldCoord.x, worldCoord.y))
                    this.simulateShot(this.myRawEntity.x, this.myRawEntity.y, worldCoord.x, worldCoord.y)
                }
            }
        }


        this.renderer.update()
    }
}

export default Simulator;