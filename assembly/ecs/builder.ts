export class Builder {
    public min: u32 = u32.MAX_VALUE;
    public max: u32 = u32.MIN_VALUE;

    public get range(): u32 {
        return this.max - this.min;
    }

    public update(value: u32): void {
        this.min = min(this.min, value);
        this.max = max(this.max, value);
    }
}