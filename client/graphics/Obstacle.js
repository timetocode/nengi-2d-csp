import * as PIXI from 'pixi.js'

class Obstacle extends PIXI.Container {
    constructor(entity) {
        super()
        this.x = entity.x
        this.y = entity.y
        this.width = entity.width
        this.height = entity.height

        this.body = new PIXI.Graphics()
        this.body.beginFill(0xffffff)
        // for some reason this was not happy with 'this.width' and 'this.height'
        this.body.drawRect(0, 0, entity.width, entity.height)
        this.body.endFill()
        this.body.tint = 0xff0000    
        this.addChild(this.body)
    }

    update(delta) {

    }
}

export default Obstacle