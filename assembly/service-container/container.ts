import { PerspectiveCamera } from "@actr-wasm/as/src/three-camera";
import { ServiceProvider } from "./service-provider";
import { Scene } from "@actr-wasm/as/src/three-scene";
import { ActrOctree } from "@actr-wasm/as/src/octree";
import { PhysicalObject } from "../services/physical-object";
import { SurfaceNetGenerator } from "@actr-wasm/as/src/surface-net-generator";
import { PerlinNoise } from "@actr-wasm/as/src/perlin-noise";
import { ActrPoint3 } from "@actr-wasm/as/src/point";

export enum Services {
    PhysicalObject,
    Scene,
    ActrOctree,
    PerspectiveCamera,
    SurfaceNetGenerator,
    PerlinNoise,
    LAST
}

export function initializeServiceProvider(): ServiceProvider {
    ServiceProvider.initialize(Services.LAST);
    
    const result = ServiceProvider.getScopedProvider();

    ServiceProvider.registerSingleton(Services.PerspectiveCamera, new PerspectiveCamera(90, 0.1, 50000.1));
    ServiceProvider.registerSingleton(Services.Scene, new Scene());
    // result.getService<Scene>(Services.Scene)
    ServiceProvider.registerSingleton(Services.ActrOctree, new ActrOctree(true, ActrPoint3.splat<i64>(-32), 64, null, null));
    ServiceProvider.registerSingleton(Services.SurfaceNetGenerator, new SurfaceNetGenerator());
    ServiceProvider.registerSingleton(Services.PerlinNoise, new PerlinNoise(false));
    
    ServiceProvider.registerService(Services.PhysicalObject, sp => new PhysicalObject(sp));

    return result;
}
