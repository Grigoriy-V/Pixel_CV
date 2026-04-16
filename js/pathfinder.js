// ===== A* PATHFINDING =====

const Pathfinder = {
    findPath(startGx, startGy, endGx, endGy) {
        if (!WalkMap.isWalkable(endGx, endGy)) {
            const nearest = WalkMap.findNearestWalkable(endGx, endGy);
            if (!nearest) return null;
            endGx = nearest.x;
            endGy = nearest.y;
        }
        if (!WalkMap.isWalkable(startGx, startGy)) {
            const nearest = WalkMap.findNearestWalkable(startGx, startGy);
            if (!nearest) return null;
            startGx = nearest.x;
            startGy = nearest.y;
        }

        const SQRT2 = Math.SQRT2;
        const openSet = new MinHeap();
        const cameFrom = new Map();
        const gScore = new Map();
        const key = (x, y) => `${x},${y}`;

        const startKey = key(startGx, startGy);
        const endKey = key(endGx, endGy);

        gScore.set(startKey, 0);
        openSet.push({ x: startGx, y: startGy, f: this._heuristic(startGx, startGy, endGx, endGy) });

        const dirs = [
            { dx: 0, dy: -1, cost: 1 },
            { dx: 1, dy: 0, cost: 1 },
            { dx: 0, dy: 1, cost: 1 },
            { dx: -1, dy: 0, cost: 1 },
            { dx: 1, dy: -1, cost: SQRT2 },
            { dx: 1, dy: 1, cost: SQRT2 },
            { dx: -1, dy: 1, cost: SQRT2 },
            { dx: -1, dy: -1, cost: SQRT2 },
        ];

        while (openSet.size > 0) {
            const current = openSet.pop();
            const ck = key(current.x, current.y);

            if (ck === endKey) {
                return this._reconstructPath(cameFrom, current.x, current.y);
            }

            for (const dir of dirs) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;

                if (!WalkMap.isWalkable(nx, ny)) continue;

                const nk = key(nx, ny);
                const tentativeG = gScore.get(ck) + dir.cost;

                if (!gScore.has(nk) || tentativeG < gScore.get(nk)) {
                    gScore.set(nk, tentativeG);
                    cameFrom.set(nk, { x: current.x, y: current.y });
                    const f = tentativeG + this._heuristic(nx, ny, endGx, endGy);
                    openSet.push({ x: nx, y: ny, f });
                }
            }
        }

        return null; // no path found
    },

    _heuristic(ax, ay, bx, by) {
        // Octile distance
        const dx = Math.abs(ax - bx);
        const dy = Math.abs(ay - by);
        return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
    },

    _reconstructPath(cameFrom, ex, ey) {
        const path = [{ x: ex, y: ey }];
        let current = `${ex},${ey}`;
        while (cameFrom.has(current)) {
            const prev = cameFrom.get(current);
            path.unshift(prev);
            current = `${prev.x},${prev.y}`;
        }
        return this._smoothPath(path);
    },

    // Remove unnecessary waypoints — if you can walk straight from A to C,
    // then B in between is redundant
    _smoothPath(path) {
        if (path.length <= 2) return path;
        const smooth = [path[0]];
        let current = 0;

        while (current < path.length - 1) {
            // Try to skip as far ahead as possible
            let farthest = current + 1;
            for (let i = path.length - 1; i > current + 1; i--) {
                if (this._hasLineOfSight(path[current], path[i])) {
                    farthest = i;
                    break;
                }
            }
            smooth.push(path[farthest]);
            current = farthest;
        }
        return smooth;
    },

    // Check if all tiles along a straight line between two grid points are walkable
    _hasLineOfSight(a, b) {
        let x0 = a.x, y0 = a.y;
        const x1 = b.x, y1 = b.y;
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            if (!WalkMap.isWalkable(x0, y0)) return false;
            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
        return true;
    },
};

// Simple binary min-heap for A* open set
class MinHeap {
    constructor() {
        this.data = [];
    }
    get size() { return this.data.length; }
    push(node) {
        this.data.push(node);
        this._bubbleUp(this.data.length - 1);
    }
    pop() {
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this._sinkDown(0);
        }
        return top;
    }
    _bubbleUp(i) {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.data[i].f < this.data[parent].f) {
                [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
                i = parent;
            } else break;
        }
    }
    _sinkDown(i) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = 2 * i + 1, r = 2 * i + 2;
            if (l < n && this.data[l].f < this.data[smallest].f) smallest = l;
            if (r < n && this.data[r].f < this.data[smallest].f) smallest = r;
            if (smallest !== i) {
                [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
                i = smallest;
            } else break;
        }
    }
}
