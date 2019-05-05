import * as PIXI from 'pixi.js'

class BackgroundGrid extends PIXI.Container {
    constructor()  {
        super()

        for (var i = 0; i < 11; i++) {           
            let line = new PIXI.Graphics()
            line.lineStyle(2, 0x333333)
            line.moveTo(i * 100, 0)
            line.lineTo(i * 100, 1000)
            this.addChild(line)
        }

        for (var i = 0; i < 11; i++) {           
            let line = new PIXI.Graphics()
            line.lineStyle(2, 0x333333)
            line.moveTo(0, i * 100)
            line.lineTo(1000, i * 100)
            this.addChild(line)
        }
    }
}

export default BackgroundGrid;