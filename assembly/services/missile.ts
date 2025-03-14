import { ActrPoint3 } from "@actr-wasm/as/src/point";
import { PhysicalObject } from "./physical-object";
import { SphereGeometry } from "@actr-wasm/as/src/three-geometry";
import { MeshStandardMaterial } from "@actr-wasm/as/src/three-material";
import { Mesh } from "@actr-wasm/as/src/three-mesh";
import { GameObject } from "./game-object";
import { Scene } from "@actr-wasm/as/src/three-scene";

export class Missile extends GameObject {
    private fuel: f64 = 0;

    private disposed: bool = false;

    public dispose(): void {
        const mesh = this.services.getService<Mesh>();
        this.services.getService<Scene>().remove(mesh);
        this.destroy();
    }

    public init(): void {
        const po = this.services.getService<PhysicalObject>();
        po.mass = 0.1;
        this.fuel = 1;
        const geometry = new SphereGeometry(0.1, 5, 5);
        const material = this.services.getService<MeshStandardMaterial>();
        const mesh = new Mesh(geometry, material)
        this.services.addService(mesh);
        this.services.getService<Scene>().add(mesh);
    }

    protected update(delta: f64): void {
        const po = this.services.getService<PhysicalObject>();
        this.fuel -= delta;
        if (this.fuel > 0) {
            po.applyImpulse(new ActrPoint3<f64>(0, 0, delta));
        } else {
            this.dispose();
        }
        this.services.getService<Mesh>().position = po.position.to<f32>();
    }
}
