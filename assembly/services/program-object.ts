import { ServiceProvider } from "../service-container/service-provider";

export class ProgramObject {
    public static readonly objects: Array<ProgramObject> = new Array<ProgramObject>();
    public constructor(public readonly services: ServiceProvider) {
        ProgramObject.objects.push(this);
     }
    public update(delta: f64): void { }
}
