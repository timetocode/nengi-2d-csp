import nengi from 'nengi'
import nengiConfig from '../common/nengiConfig'
import PlayerCharacter from '../common/entity/PlayerCharacter'
import Identity from '../common/message/Identity'
import WeaponFired from '../common/message/WeaponFired'
import CollisionSystem from '../common/CollisionSystem'
import Obstacle from '../common/entity/Obstacle'

import followPath from './followPath'
import damagePlayer from './damagePlayer'


class GameInstance {
    constructor() {
        this.players = new Map()
        this.instance = new nengi.Instance(nengiConfig, { port: 8079 })
        this.instance.onConnect((client, clientData, callback) => {

            // create a entity for this client
            const rawEntity = new PlayerCharacter()
    
            // make the raw entity only visible to this client
            const channel = new nengi.Channel(nengiConfig)
            this.instance.addChannel(channel)
            channel.subscribe(client)
            channel.addEntity(rawEntity)
            //this.instance.addEntity(rawEntity)
            client.channel = channel

            // smooth entity is visible to everyone
            const smoothEntity = new PlayerCharacter()
            smoothEntity.collidable = true
            this.instance.addEntity(smoothEntity)

            // tell the client which entities it controls
            this.instance.message(new Identity(rawEntity.nid, smoothEntity.nid), client)

            // establish a relation between this entity and the client
            rawEntity.client = client
            client.rawEntity = rawEntity
            smoothEntity.client = client
            client.smoothEntity = smoothEntity
            client.positions = []

            // define the view (the area of the game visible to this client, all else is culled)
            client.view = {
                x: rawEntity.x,
                y: rawEntity.y,
                halfWidth: 99999,
                halfHeight: 99999
            }

            //this.players.set(rawEntity.nid, rawEntity)

            callback({ accepted: true, text: 'Welcome!' })
        })

        this.instance.onDisconnect(client => {
            this.instance.removeEntity(client.rawEntity)
            this.instance.removeEntity(client.smoothEntity)
            this.instance.removeChannel(client.channel)
        })

        // setup a few obstacles

        const obstacles = new Map()

        const obsA = new Obstacle(150, 150, 250, 150)
        this.instance.addEntity(obsA)
        obstacles.set(obsA.nid, obsA)

        const obsB = new Obstacle(450, 600, 60, 150)
        this.instance.addEntity(obsB)
        obstacles.set(obsB.nid, obsB)

        this.obstacles = obstacles
    }

    lagCompensatedHitscanCheck(x1, y1, x2, y2, timeAgo, onHit) {
        const area = {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2,
            halfWidth: Math.abs(x2 - x1),
            halfHeight: Math.abs(y2 - y1)
        }

        const compensatedEntityPositions = this.instance.historian.getLagCompensatedArea(timeAgo, area)
        compensatedEntityPositions.forEach(entityProxy => {
            // look up the real entity
            const realEntity = this.instance.entities.get(entityProxy.nid)
      
            if (realEntity && realEntity.collidable) {
                const tempX = realEntity.collider.pos.x
                const tempY = realEntity.collider.pos.y

                // rewind
                realEntity.collider.pos.x = entityProxy.x
                realEntity.collider.pos.y = entityProxy.y

                const hit = CollisionSystem.checkLineCircle(x1, y1, x2, y2, realEntity.collider)

                // restore
                realEntity.collider.pos.x = tempX
                realEntity.collider.pos.y = tempY

                if (hit) {
                    onHit(realEntity)
                }
            }
        })
    }

    update(delta, tick, now) {
        let cmd = null
        while (cmd = this.instance.getNextCommand()) {
            const tick = cmd.tick
            const client = cmd.client

            for (let i = 0; i < cmd.commands.length; i++) {
                const command = cmd.commands[i]
                const rawEntity = client.rawEntity
                const smoothEntity = client.smoothEntity

                if (command.protocol.name === 'MoveCommand') {
                    rawEntity.processMove(command, this.obstacles)
                    client.positions.push({
                        x: rawEntity.x,
                        y: rawEntity.y,
                        rotation: rawEntity.rotation
                    })
                    rawEntity.weaponSystem.update(command.delta)
                }

                if (command.protocol.name === 'FireCommand') {

                    if (rawEntity.fire()) {            
                        const timeAgo = client.latency + 100

                        this.lagCompensatedHitscanCheck(rawEntity.x, rawEntity.y, command.x, command.y, timeAgo, (victim) => {
                            if (victim.nid !== rawEntity.nid && victim.nid !== smoothEntity.nid) {
                                damagePlayer(victim)
                            }
                        })

                        this.instance.addLocalMessage(new WeaponFired(smoothEntity.nid, smoothEntity.x, smoothEntity.y, command.x, command.y))
                    }
                }
            }
        } 

        this.instance.clients.forEach(client => {
            client.view.x = client.rawEntity.x
            client.view.y = client.rawEntity.y

            const smoothEntity = client.smoothEntity
            if (smoothEntity) {
                const maximumMovementPerFrameInPixels = 410 * delta
                followPath(smoothEntity, client.positions, maximumMovementPerFrameInPixels)
            }
        })

        // when instance.updates, nengi sends out snapshots to every client
        this.instance.update()
    }
}

export default GameInstance