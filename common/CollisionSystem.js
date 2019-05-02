import SAT from 'sat'


const response = new SAT.Response()

class CollisionSystem {
    constructor() {

    }


}


CollisionSystem.moveWithCollisions = (entity, obstacles) => {
    obstacles.forEach(obstacle => {   
        if (SAT.testCirclePolygon(entity.collider, obstacle.collider, response)) {
            //console.log('res', response)
            entity.x -= response.overlapV.x
            entity.y -= response.overlapV.y           
        }
        response.clear()
    })
}


CollisionSystem.checkCirclePolygon = (circleCollider, polygonCollider, response) => {
    return SAT.testCirclePolygon(circleCollider, polygonCollider, response)
}

CollisionSystem.checkLineCircle = (x1, y1, x2, y2, circleCollider) => {
    const line = new SAT.Polygon(new SAT.Vector(), [
        new SAT.Vector(x1, y1),
        new SAT.Vector(x2, y2)
    ])
    return SAT.testCirclePolygon(circleCollider, line)
}

export default CollisionSystem
