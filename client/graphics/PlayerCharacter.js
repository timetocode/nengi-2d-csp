import * as PIXI from 'pixi.js'
import HitpointBar from './HitpointBar'

class PlayerCharacter extends PIXI.Container {
    constructor(entity) {
        super()
        this.nid = entity.nid
        this.x = entity.x
        this.y = entity.y
        this.isAlive = entity.isAlive

        this.hitpointBar = new HitpointBar()
        this.hitpointBar.x = -6
        this.hitpointBar.y = -20
        this.hitpointBar.setHitpointPercentage(entity._hitpoints/100)

        this._hitpoints = 0
        this.hitpoints = entity.hitpoints
        this.rotation = entity.rotation

        this.body = new PIXI.Graphics()
        this.body.beginFill(0xffffff)
        this.body.drawCircle(0, 0, 25)
        this.body.endFill()

        this.body.tint = 0xff0000

        this.nose = new PIXI.Graphics()
        this.nose.beginFill(0xff99999)
        this.nose.moveTo(0, -25)
        this.nose.lineTo(40, 0)
        this.nose.lineTo(0, 25)
        this.nose.endFill()
        
        this.addChild(this.nose)
        this.addChild(this.body)

        this.addChild(this.hitpointBar)
    }

    set hitpoints(value) {
        this._hitpoints = value
        this.hitpointBar.setHitpointPercentage(value/100)
    }

    hide() {
        console.log('trying to hide')
        this.body.visible = false
        this.hitpointBar.visible = false
        this.nose.visible = false
    }

    update(delta) {
        if (!this.isAlive) {
            this.nose.alpha = 0
        } else {
            this.nose.alpha = 1
        }
    }
}

export default PlayerCharacter