import { Builder } from "./builder";
import { RegidBody } from "./component/rigid-body";
import { Transform } from "./component/transform";
import { MAX_ENTITIES } from "./entity-manager";

export class ComponenetManagerBuilder extends Builder {

    

}

@unmanaged
export class ComponenetManager {

    private readonly transforms: StaticArray<Transform> = new StaticArray(MAX_ENTITIES);
    private readonly regidBodies: StaticArray<RegidBody> = new StaticArray(MAX_ENTITIES);

}
