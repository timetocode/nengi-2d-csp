import * as PIXI from 'pixi.js'

class HitpointBar extends PIXI.Container {
    constructor() {
        super()

        this.background = new PIXI.Graphics()
        this.background.beginFill(0x000000)
        this.background.drawRect(0, 0, 12, 40)
        this.background.endFill()
        this.addChild(this.background)

        this.foreground = new PIXI.Graphics()
        this.foreground.beginFill(0x00ff00)
        this.foreground.drawRect(1, 1, 10, 38)
        this.foreground.endFill()
        this.addChild(this.foreground)
    }

    setHitpointPercentage(percent) {
        this.foreground.scale.y = percent
    }

}

export default HitpointBar;