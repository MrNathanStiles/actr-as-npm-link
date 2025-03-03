import { PerspectiveCamera } from "@actr-wasm/as/src/three-camera";
import { ServiceProvider } from "./service-provider";
import { Scene } from "@actr-wasm/as/src/three-scene";
import { ActrOctree } from "@actr-wasm/as/src/octree";
import { PhysicalObject } from "../services/physical-object";
import { SurfaceNetGenerator } from "@actr-wasm/as/src/surface-net-generator";
import { PerlinNoise } from "@actr-wasm/as/src/perlin-noise";
import { ActrPoint3 } from "@actr-wasm/as/src/point";
import { Missile } from "../services/missile";
import { GameObject } from "../services/game-object";
import { SphereGeometry } from "@actr-wasm/as/src/three-geometry";
import { MeshStandardMaterial } from "@actr-wasm/as/src/three-material";
import { Mesh } from "@actr-wasm/as/src/three-mesh";

export enum Services {
    GameObject,
    PhysicalObject,
    Scene,
    ActrOctree,
    PerspectiveCamera,
    SurfaceNetGenerator,
    PerlinNoise,
    Missile,
    Sphere,
    Material,
    Mesh,
    LAST
}

export function initializeServiceProvider(): ServiceProvider {
    ServiceProvider.initialize(Services.LAST);
    
    const result = ServiceProvider.getScopedProvider();

    // singletons
    ServiceProvider.registerSingleton(Services.PerspectiveCamera, new PerspectiveCamera(90, 0.1, 10000.1));
    ServiceProvider.registerSingleton(Services.Scene, new Scene());
    // result.getService<Scene>(Services.Scene)
    ServiceProvider.registerSingleton(Services.ActrOctree, new ActrOctree(true, ActrPoint3.splat<i64>(-32), 64, null, null));
    ServiceProvider.registerSingleton(Services.SurfaceNetGenerator, new SurfaceNetGenerator());
    ServiceProvider.registerSingleton(Services.PerlinNoise, new PerlinNoise(false));
    ServiceProvider.registerSingleton(Services.Material, new MeshStandardMaterial(0xffffff, 0xffffff, false, 1, false, true));

    
    // unique scope
    ServiceProvider.registeTransient(Services.Missile, () => new Missile(ServiceProvider.getScopedProvider()));
    

    // inherited scope
    ServiceProvider.registerService(Services.PhysicalObject, sp => new PhysicalObject(sp));
    

    return result;
}
