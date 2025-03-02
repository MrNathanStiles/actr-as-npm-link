import { PerspectiveCamera } from "@actr-wasm/as/src/three-camera";
import { ServiceProvider } from "./service-provider";
import { Scene } from "@actr-wasm/as/src/three-scene";
import { ActrOctree } from "@actr-wasm/as/src/octree";

export enum Services {
    PhysicalObject,
    Scene,
    ActrOctree,
    PerspectiveCamera,
    LAST
}

export function initializeServiceProvider(): ServiceProvider {
    ServiceProvider.initialize(Services.LAST);
    
    const result = ServiceProvider.getScopedProvider();

    ServiceProvider.registerSingleton(Services.PerspectiveCamera, new PerspectiveCamera(90, 0.1, 50000.1));
    ServiceProvider.registerSingleton(Services.Scene, new Scene());
    ServiceProvider.registerSingleton(Services.ActrOctree, new ActrOctree(true, -32, -32, 32, 64, null, result.getService<Scene>(Services.Scene)));
  
    return result;
}
