import nengi from 'nengi'

class MoveCommand {
    constructor(forward, left, backward, right, rotation, delta) {
        this.forward = forward
        this.left = left
        this.backward = backward
        this.right = right
        this.rotation = rotation
        this.delta = delta
    }
}

MoveCommand.protocol = {
    forward: nengi.Boolean,
    left: nengi.Boolean,
    backward: nengi.Boolean,
    right: nengi.Boolean,
    rotation: nengi.Float32,
    delta: nengi.Float32
}

export default MoveCommand
