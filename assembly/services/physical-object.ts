import { ServiceProvider } from "../service-container/service-provider";
import { ProgramObject } from "../interface";
import { ActrPoint3 } from "@actr-wasm/as/src/point";

export class PhysicalObject implements ProgramObject {
    private static readonly objects: Array<PhysicalObject> = new Array<PhysicalObject>();

    public position: ActrPoint3<f64> = ActrPoint3.zero<f64>();
    public velocity: ActrPoint3<f64> = ActrPoint3.zero<f64>();
    
    public rotation: ActrPoint3<f64> = ActrPoint3.zero<f64>();
    public angularVelocity: ActrPoint3<f64> = ActrPoint3.zero<f64>();
    
    public mass: f64 = 1;

    public constructor(
        private readonly services: ServiceProvider
    ) {



    }

    public update(delta: f64): void {
        this.position.addMutate(this.velocity.multiply(delta));
    }


}