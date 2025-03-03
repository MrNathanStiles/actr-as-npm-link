import { Services } from "./container";

export type Service = Object | null;
export type ServiceFactory<T extends Service> = (provider: ServiceProvider) => T;

export class ServiceProvider {
    private static serviceCount: i32 = 0;
    private static serviceFactories: StaticArray<ServiceFactory<Service>> | null;
    private static transientFactories: StaticArray<ServiceFactory<Service> | null> | null;
    private static singletons: StaticArray<Service> | null;
    private static _identity: i32 = 0;

    public static initialize(serviceCount: i32): void {
        ServiceProvider.serviceCount = serviceCount;
        ServiceProvider.serviceFactories = new StaticArray(serviceCount);
        ServiceProvider.transientFactories = new StaticArray(serviceCount);
        ServiceProvider.singletons = new StaticArray(serviceCount);
    }

    public static registerSingleton(service: Services, instance: Service): void {
        ServiceProvider.singletons![service] = instance;
    }

    public static registerService(service: Services, factory: ServiceFactory<Service>): void {
        ServiceProvider.serviceFactories![service] = factory;
    }

    public static registeTransient(service: Services, factory: ServiceFactory<Service>): void {
        ServiceProvider.transientFactories![service] = factory;
    }

    public static getScopedProvider(): ServiceProvider {
        return new ServiceProvider();
    }

    public readonly identity: i32;
    private readonly services: StaticArray<Service>;

    private constructor() {
        this.identity = ++ServiceProvider._identity;
        this.services = new StaticArray<Service>(ServiceProvider.serviceCount);
    }
    public add(service: Services, instance: Service): void {
        this.services[service] = instance;
    }
    public getExistingService<T>(service: Services): T {
        return this.services[service] as T;
    }
    
    public getService<T>(service: Services): T {
        let result = this.services[service];
        if (result == null) {
            result = ServiceProvider.singletons![service];
            if (result != null) {
                this.services[service] = result;
                return result as T;
            }
            const transientFactory = ServiceProvider.transientFactories![service];
            if (transientFactory == null) {
                this.services[service] = result = ServiceProvider.serviceFactories![service](this);
            } else {
                result = transientFactory(this);
            }
        }
        return result as T;
    }
    
}