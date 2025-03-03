import { Services } from "./container";

export type Service = Object | null;
export type ServiceFactory<T extends Service> = (provider: ServiceProvider) => T;

export class ServiceProvider {
    private static serviceCount: i32 = 0;
    private static serviceFactories: StaticArray<ServiceFactory<Service>> | null;
    private static singletons: StaticArray<Service> | null;

    public static initialize(serviceCount: i32): void {
        ServiceProvider.serviceCount = serviceCount;
        ServiceProvider.serviceFactories = new StaticArray(serviceCount);
        ServiceProvider.singletons = new StaticArray(serviceCount);
    }

    public static registerSingleton(service: Services, instance: Service): void {
        ServiceProvider.singletons![service] = instance;
    }

    public static registerService(service: Services, factory: ServiceFactory<Service>): void {
        ServiceProvider.serviceFactories![service] = factory;
    }
    

    public static getScopedProvider(): ServiceProvider {
        return new ServiceProvider();
    }

    private readonly services: StaticArray<Service>;

    private constructor() {
        this.services = new StaticArray<Service>(ServiceProvider.serviceCount);
    }

    public getService<T>(service: Services): T {
        let result = this.services[service];
        if (result == null) {
            result = ServiceProvider.singletons![service];
            if (result != null) return result as T;
            const provider = ServiceProvider.serviceFactories![service];
            result = provider(this);
            this.services[service] = result;
        }
        return result as T;
    }
    
}