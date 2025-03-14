import { ActrPoint3 } from "@actr-wasm/as/src/point";
import { GameObject } from "./game-object";

export class PhysicalObject extends GameObject {

    public position: ActrPoint3<f64> = ActrPoint3.zero<f64>();
    public velocity: ActrPoint3<f64> = ActrPoint3.zero<f64>();
    
    public rotation: ActrPoint3<f64> = ActrPoint3.zero<f64>();
    public angularVelocity: ActrPoint3<f64> = ActrPoint3.zero<f64>();
    
    public mass: f64 = 1;

    protected update(delta: f64): void {
        this.position = this.position.add(this.velocity.multiply(delta));
        this.rotation = this.rotation.add(this.angularVelocity.multiply(delta));
    }

    public applyImpulse(impulse: ActrPoint3<f64>): void {
        this.velocity = this.velocity.add(impulse.divide(this.mass));
    }

}