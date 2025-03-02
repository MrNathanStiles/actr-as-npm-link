import { Services } from "./container";

export type Service = Object | null;
export type ServiceFactory<T extends Service> = (provider: ServiceProvider) => T;

export class ServiceProvider {
    private static serviceCount: i32 | null;
    private static serviceFactories: StaticArray<ServiceFactory<Service>> | null;
    private static singletons: StaticArray<Service> | null;

    public static initialize(serviceCount: i32): void {
        ServiceProvider.serviceCount = serviceCount;
        ServiceProvider.serviceFactories = new StaticArray<ServiceFactory<Service>>(serviceCount);
        ServiceProvider.singletons = new StaticArray<Service>(serviceCount);
    }

    public static registerSingleton(service: Services, instance: Service): void {
        ServiceProvider.singletons![service] = instance;
    }

    public static registerService<T extends Service>(service: Services, factory: ServiceFactory<T>): void {
        ServiceProvider.serviceFactories![service] = factory;
    }
    

    public static getScopedProvider(): ServiceProvider {
        return new ServiceProvider();
    }

    private readonly services: StaticArray<Service>;

    private constructor() {
        this.services = new StaticArray<Service>(ServiceProvider.serviceCount!);
    }

    public getService<T extends Service>(service: Services): T {
        let result: T | null = this.services[service] as T | null;
        if (result == null) {
            result = ServiceProvider.singletons![service] as T;
            if (result != null) return result;
            const provider = ServiceProvider.serviceFactories![service] as ServiceFactory<T>;
            result = provider(this);
            this.services[service] = result;
        }
        return result;
    }
    
}