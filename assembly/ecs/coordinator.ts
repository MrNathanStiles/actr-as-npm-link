export const MAX_ENTITIES: u32 = 4096;

export type SystemFunction = (delta: f32) => void;
export type Component = Object;
export class ECSIdentity {

}

export class ComponentRegistration {
    private static sequence: u64 = 1;
    public readonly identity: u64;
    
    public constructor(
        public readonly pointer: usize,
        public readonly size: usize,
    ) {
        this.identity = ComponentRegistration.sequence;
        ComponentRegistration.sequence *= 2;
    }
}
export class SystemRegistration {
    private static sequence: u64 = 1;
    public readonly identity: u64;
    public constructor(
        public readonly update: SystemFunction
    ) {
        this.identity = SystemRegistration.sequence;
        SystemRegistration.sequence *= 2;
    }
}
export class CoordinatorBuilder {
    // start at 8 for the 64bit flags for active systems
    private componentFlag: u64 = 1;
    
    private readonly componentSizeMap: Map<u32, usize> = new Map();
    private readonly componentFlagMap: Map<u32, u64> = new Map();

    public registerComponent<T extends Component>() {
        this.componentSizeMap.set(idof<T>(), sizeof<T>());
        this.componentFlagMap.set(idof<T>(), this.componentFlag);
        this.componentFlag *= 2;
    }

    private readonly systemLookup: Array<SystemRegistration> = [];

    public registerSystem(update: SystemFunction): SystemRegistration {
        const registration = new SystemRegistration(update);
        this.systemLookup.push(registration);
        return registration;
    }

    public build(): Coordinator {
        const componentMemory: Map<u32, usize> = new Map();
        const componentIds = this.componentSizeMap.keys();
        for (let i = 0; i < componentIds.length; i++) {
            const id = componentIds[i];
            const pointer: usize = heap.alloc(this.componentSizeMap.get(id) * MAX_ENTITIES);
            componentMemory.set(id, pointer);
        }
    }

}

export class ComponentMemory {
    private next: usize;
    private readonly entityToIndex: Map<u32, usize> = new Map();
    private readonly indexToEntity: Map<u32, usize> = new Map();
    private readonly pointer: usize;

    public constructor(
        private readonly componentSize: usize,
    ) {
        this.pointer = heap.alloc(this.componentSize * MAX_ENTITIES);
        this.next = pointer;
    }

    public addComponent(entity: u32): void {
        this.entityToIndex.set(entity, this.next);
        this.indexToEntity.set(this.next, entity);
        this.next += this.componentSize;
    }

    public removeComponent(entity: u32): void {
        this.next -= this.componentSize;
        const index = this.entityToIndex.get(entity);
        if (this.next != this.pointer) {
            const moving = this.indexToEntity.get(this.next);
            this.entityToIndex.set(moving, index);
            this.indexToEntity.set(index, moving);
            memory.copy(index, this.next, this.componentSize);
        } else {
            this.indexToEntity.delete(index);
        }
        this.entityToIndex.delete(entity);
        memory.fill(this.next, 0, this.componentSize);
    }

    public getComponent(entity: u32): usize {
        return this.entityToIndex.get(entity);
    }
}

export class Coordinator {
    
    public constructor(
        private readonly componentMemory: Map<u32, usize>
    ) { }


}