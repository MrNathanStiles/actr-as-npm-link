import { ServiceProvider } from "../service-container/service-provider";

export class ProgramObject {

    public static readonly objects: Array<ProgramObject> = new Array();
    private static readonly toDestroy: Array<ProgramObject> = new Array();
    
    public static updateAll(delta: f64): void {
        for (let i = 0; i < this.objects.length; i++) {
            const obj = this.objects[i];
            if (obj.destroyed) continue;
            obj.update(delta);
        }
        for (let i = 0; i < this.toDestroy.length; i++) {
            const obj = this.objects[i];
            if (obj.index < 0) continue;
            obj._destroy();
        }
    }

    private index: i32;
    private destroyed: bool = false;

    public constructor(
        public readonly services: ServiceProvider,
    ) {
        this.index = ProgramObject.objects.push(this) - 1;
    }
    
    private _destroy(): void {
        const last = ProgramObject.objects.length - 1;
        if (last == 0) {
            ProgramObject.objects.pop();
            return;
        }
        const replacement = ProgramObject.objects[last];
        ProgramObject.objects[this.index] = replacement;
        replacement.index = this.index;
        this.index = -1;
    }

    public destroy(): void {
        this.destroyed = true;
        ProgramObject.toDestroy.push(this);
    }
    
    protected update(delta: f64): void { }

}
