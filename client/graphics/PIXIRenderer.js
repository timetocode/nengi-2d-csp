import * as PIXI from 'pixi.js'
import PlayerCharacter from './PlayerCharacter'
import BackgroundGrid from './BackgroundGrid'
import Obstacle from './Obstacle'

class PIXIRenderer {
    constructor(input, sounds) {
        this.canvas = document.getElementById('main-canvas')

        this.masterScale = 1
        this.myEntity = null
        this.entities = new Map()

        this.renderer = PIXI.autoDetectRenderer({
            width: window.innerWidth, 
            height: window.innerHeight, 
            view: this.canvas,
            antialiasing: false,
            transparent: false,
            resolution: 1
        })

        this.stage = new PIXI.Container()
        this.camera = new PIXI.Container()
        this.background = new PIXI.Container()
        this.middleground = new PIXI.Container()
        this.foreground = new PIXI.Container()

        this.camera.addChild(this.background)
        this.camera.addChild(this.middleground)
        this.camera.addChild(this.foreground)
        this.stage.addChild(this.camera)

        this.background.addChild(new BackgroundGrid())

        window.addEventListener('resize', () => {
            this.resize()
        })

        this.resize()
    }

    drawBulletEnd(alreadyHitPlayer, x, y) {
        if (alreadyHitPlayer) return
        var effect = new ImpactEffect(x, y)
        this.camera.addChild(effect)
        this.effects.push(effect)
    }


    resize() {
        this.renderer.resize(window.innerWidth, window.innerHeight)
    }

    createEntity(entity) {
        console.log('renderer create', entity)
        if (entity.protocol.name === 'PlayerCharacter') {  
            const clientEntity = new PlayerCharacter(entity)
            this.entities.set(entity.nid, clientEntity)
            this.middleground.addChild(clientEntity)
        }

        
        if (entity.protocol.name === 'Obstacle') {
            console.log('creating an OBSTACLE')
            const clientEntity = new Obstacle(entity)
            this.entities.set(entity.nid, clientEntity)
            this.middleground.addChild(clientEntity)
        }
    }

    updateEntity(update) {
        const entity = this.entities.get(update.nid)
        entity[update.prop] = update.value
    }

    message(message) {

    }

    deleteEntity(nid) {
        if (this.entities.get(nid)) {
            this.foreground.removeChild(this.entities.get(nid))
            this.middleground.removeChild(this.entities.get(nid))
            this.entities.delete(nid)
        }
    }

    localMessage(message) {
        if (message.protocol.name === 'WeaponFired') {

        }
    }

    drawHitscan(x, y, targetX, targetY, color) {
        let graphics = new PIXI.Graphics()
        graphics.lineStyle(1, color)
        graphics.moveTo(x, y)
        graphics.lineTo(targetX, targetY)
        this.middleground.addChild(graphics)
        setTimeout(() => {
            this.middleground.removeChild(graphics)
            graphics.destroy({
                children: true,
                texture: true,
                baseTexture: true
            })
        }, 64)
    }

 
    centerCamera(entity) {
        this.camera.x = -entity.x + 0.5 * window.innerWidth
        this.camera.y = -entity.y + 0.5 * window.innerHeight
    }

    followSmoothlyWithCamera(entity, delta) {
        const cameraSpeed = 5
        const targetX = -entity.x + 0.5 * window.innerWidth
        const targetY = -entity.y + 0.5 * window.innerHeight
        const dx = targetX - this.camera.x
        const dy = targetY - this.camera.y
        this.camera.x += dx * cameraSpeed * delta
        this.camera.y += dy * cameraSpeed * delta
    }

    toWorldCoordinates(mouseX, mouseY) {
        return {
            x: -this.camera.x + mouseX,
            y: -this.camera.y + mouseY
        }
    }

    move(nid, x, y, rotation) {
        const entity = this.entities.get(nid)
        entity.x = x
        entity.y = y
        entity.rotation = rotation
    }


    update(delta) {
        if (this.myEntity) {
            this.centerCameraAndFollowScope(this.myEntity, 0.5, delta)
        }

        this.entities.forEach(entity => {
            entity.update(delta)
        })

        this.renderer.render(this.stage)
    }
}

export default PIXIRenderer
