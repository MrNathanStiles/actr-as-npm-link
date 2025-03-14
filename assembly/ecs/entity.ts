let sequence: u32 = 0;

export class Entity {
    public readonly identity: u32;
    public constructor() {
        this.identity = sequence++;
    }
}
