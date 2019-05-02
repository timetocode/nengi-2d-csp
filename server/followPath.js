const followPath = (entity, path, movementBudget) => {
    let budget = movementBudget 
    while (budget > 0 && path.length > 0) {
        const position = path[0]
        const dx = position.x - entity.x
        const dy = position.y - entity.y

        const dist = Math.sqrt(dx * dx + dy * dy)

        if (budget >= dist) {
            budget -= dist
            Object.assign(entity, position)
            path.shift(position)
        } else if (budget < dist) {
            const ratio = budget / dist
            budget = 0
            entity.x += dx * ratio
            entity.y += dy * ratio
            path.unshift(position)
        }
    }    
}

export default followPath