import { actr_log } from "@actr-wasm/as/src/log";

export type Service = Object | null;

enum ServiceType {
    Unknown,
    Singleton,
    Service,
    Transient
}
export type ServiceFactory<T extends Service> = (provider: ServiceProvider) => T;

export class ServiceProviderBuilder {

    private min: u32 = u32.MAX_VALUE;
    private max: u32 = u32.MIN_VALUE;

    private readonly serviceMap: Map<u32, ServiceType> = new Map();
    private readonly singletonMap: Map<u32, Service> = new Map();
    private readonly factoryMap: Map<u32, ServiceFactory<Service>> = new Map();

    public addSingleton<T>(instance: T): void {
        const id = this.register<T>(ServiceType.Singleton)
        this.singletonMap.set(id, instance as Service);
    }

    public registerSingleton<T extends Service>(factory: ServiceFactory<T>): void {
        this.registerFactory<T>(ServiceType.Singleton, factory);
    }

    public registerService<T extends Service>(factory: ServiceFactory<T>): void {
        this.registerFactory<T>(ServiceType.Service, factory);
    }

    public registerTransient<T extends Service>(factory: ServiceFactory<T>): void {
        this.registerFactory<T>(ServiceType.Transient, factory);
    }

    private registerFactory<T extends Service>(serviceType: ServiceType, factory: ServiceFactory<T>): void {
        const id = this.register<T>(serviceType);
        this.factoryMap.set(id, factory as ServiceFactory<Service>);
    }

    private register<T>(type: ServiceType): u32 {
        const id = idof<T>();
        this.min = min(this.min, id);
        this.max = max(this.max, id);
        if (this.serviceMap.has(id)) {
            abort('Service already registered.');
        }
        this.serviceMap.set(id, type);
        return id;
    }

    public build(): ServiceProvider {
        const offset = this.min;
        const range = this.max - offset + 1;
        
        actr_log(`building min:${this.min}, max:${this.max}, offset:${offset}, range:${range}`);

        const serviceTypes: StaticArray<ServiceType> = new StaticArray(range);

        const serviceKey = this.serviceMap.keys();
        for (let i = 0; i < serviceKey.length; i++) {
            const id = serviceKey[i];
            serviceTypes[id - this.min] = this.serviceMap.get(id);
        }

        const singletons: StaticArray<Service> = new StaticArray(range);
        const singletonKey = this.singletonMap.keys();
        for (let i = 0; i < singletonKey.length; i++) {
            const id = singletonKey[i];
            singletons[id - this.min] = this.singletonMap.get(id)
        }

        const factories: StaticArray<ServiceFactory<Service>> = new StaticArray(range);
        const factoryKey = this.factoryMap.keys();
        for (let i = 0; i < factoryKey.length; i++) {
            const id = factoryKey[i];
            factories[id - this.min] = this.factoryMap.get(id);
        }

        return new ServiceProvider(range, offset, serviceTypes, singletons, factories);
    }

}

export class ServiceProvider {

    private readonly services: StaticArray<Service>;
    public constructor(
        private readonly range: u32,
        private readonly offset: u32,
        private readonly serviceTypes: StaticArray<ServiceType>,
        private readonly singletons: StaticArray<Service>,
        private readonly factories: StaticArray<ServiceFactory<Service>>,
    ) {
        this.services = new StaticArray(range);
    }

    public addService<T extends Service>(instance: T): void {
        const index = idof<T>() - this.offset;
        this.services[index] = instance;
    }

    public getScopedProvider(): ServiceProvider {
        return new ServiceProvider(this.range, this.offset, this.serviceTypes, this.singletons, this.factories);
    }

    public getTransient<T extends Service>(): T {
        const index = idof<T>() - this.offset;
        const factory = this.factories[index];
        return factory(this) as T;
    }

    public getService<T extends Service>(): T {
        const index = idof<T>() - this.offset;

        //actr_log(`getService ${index}`);
        
        // check for known instance
        let result = this.services[index];
        if (result) {
            return result as T;
        }

        const serviceType = this.serviceTypes[index];
        if (serviceType == ServiceType.Transient) {
            const factory = this.factories[index];
            return factory(this) as T;
        }

        //actr_log(`getService checking for singleton`);
        // check for singleton
        result = this.singletons[index];
        if (result) {
            this.services[index] = result;
            return result as T;
        }

        //actr_log(`getService checking for factory`);
        // check for factory
        const factory = this.factories[index];
        result = factory(this);
        
        
        if (serviceType == ServiceType.Singleton) {
            this.singletons[index] = result;
        }

        this.services[index] = result;
        return result as T;
    }
}
