import { actr_log } from "@actr-wasm/as/src/log";
import { ActrOctreeBounds } from "@actr-wasm/as/src/octree-bounds";
import { ActrOctreeLeaf } from "@actr-wasm/as/src/octree-leaf";

export const results = new Array<string>();

const leaf = new ActrOctreeLeaf(32, 32, -32, 1, 1, 1, 0);
// results.push(`${leaf} center ${leaf.center()}`); 

// results.push(`${bounds} ${contains ? 'contains' : 'does not contain'} ${leaf}`);

for (let x: i64 = 0; x < 64; x++) {
    for (let y: i64 = 0; y < 64; y++) {
        for (let z: i64 = 0; z < 64; z++) {
            continue;
            let bounds = new ActrOctreeBounds(x, y, -z, 16);
            let contains = bounds.containsLeaf(leaf);
            if (contains) {
                results.push(`${bounds} ${contains ? 'contains' : 'does not contain'} ${leaf}`);
                results.push(`${leaf} center ${leaf.center()}`);
                results.push(`${bounds} center ${bounds.center()}`); 

            }
            
        }
    }    
}

for (let x: i64 = 0; x < 64; x++) {
    for (let y: i64 = 0; y < 64; y++) {
        for (let z: i64 = 0; z < 64; z++) {
            let bounds = new ActrOctreeBounds(x, y, -z, 1);
            let intersects = bounds.intersectsLeaf(leaf);
            if (intersects) {
                results.push(`${bounds} ${intersects ? 'intersects' : 'does not intersect'} ${leaf}`);
                results.push(`${leaf} center ${leaf.center()}`);
                results.push(`${bounds} center ${bounds.center()}`); 

            }
            
        }
    }    
}



