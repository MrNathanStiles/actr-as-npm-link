import { ActrPoint3 } from "@actr-wasm/as/src/point";
import { Services } from "../service-container/container";
import { PhysicalObject } from "./physical-object";
import { SphereGeometry } from "@actr-wasm/as/src/three-geometry";
import { MeshStandardMaterial } from "@actr-wasm/as/src/three-material";
import { Mesh } from "@actr-wasm/as/src/three-mesh";
import { GameObject } from "./game-object";
import { Scene } from "@actr-wasm/as/src/three-scene";

export class Missile extends GameObject {
    private fuel: f64 = 0;

    public dispose(): void {
        const mesh = this.services.getService<Mesh>(Services.Mesh);
        this.services.getService<Scene>(Services.Scene).remove(mesh);
        mesh.geometry.dispose();
    }

    public init(): void {
        const po = this.services.getService<PhysicalObject>(Services.PhysicalObject);
        po.mass = 0.001;
        this.fuel = 1;
        const geometry = new SphereGeometry(0.1, 5, 5);
        const material = this.services.getService<MeshStandardMaterial>(Services.Material);
        const mesh = new Mesh(geometry, material)
        this.services.add(Services.Mesh, mesh);
        this.services.getService<Scene>(Services.Scene).add(mesh);
    }

    public update(delta: f64): void {
        const po = this.services.getExistingService<PhysicalObject>(Services.PhysicalObject);
        this.fuel -= delta;
        if (this.fuel > 0) {
            po.applyImpulse(new ActrPoint3<f64>(0, 0, delta));
        } else {
            this.dispose();
        }
        po.update(delta);
        this.services.getExistingService<Mesh>(Services.Mesh).position = po.position.to<f32>();
    }
}
