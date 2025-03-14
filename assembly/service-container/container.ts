import { PerspectiveCamera } from "@actr-wasm/as/src/three-camera";
import { ServiceProvider, ServiceProviderBuilder } from "./service-provider";
import { Scene } from "@actr-wasm/as/src/three-scene";
import { ActrOctree } from "@actr-wasm/as/src/octree";
import { PhysicalObject } from "../services/physical-object";
import { SurfaceNetGenerator } from "@actr-wasm/as/src/surface-net-generator";
import { PerlinNoise } from "@actr-wasm/as/src/perlin-noise";
import { ActrPoint3 } from "@actr-wasm/as/src/point";
import { Missile } from "../services/missile";
import { MeshStandardMaterial } from "@actr-wasm/as/src/three-material";

export function initializeServiceProvider(): ServiceProvider {
    // ServiceProvider.initialize(Services.LAST);
    

    
    const builder = new ServiceProviderBuilder();
    
    // singletons
    builder.registerSingleton<PerspectiveCamera>(() => new PerspectiveCamera(90, 0.1, 10000.1));
    builder.registerSingleton<ActrOctree>(() => new ActrOctree(true, ActrPoint3.splat<i64>(-32), 64, null, null));
    builder.registerSingleton<Scene>(() => new Scene());
    builder.registerSingleton<SurfaceNetGenerator>(() => new SurfaceNetGenerator());
    builder.registerSingleton<PerlinNoise>(() => new PerlinNoise(false));
    builder.registerSingleton<MeshStandardMaterial>(() => new MeshStandardMaterial(0xffffff, 0xffffff, false, 1, false, true));

    
    // unique scope
    builder.registerTransient<Missile>(provider => new Missile(provider.getScopedProvider()));
    

    // inherited scope
    builder.registerService<PhysicalObject>(provider => new PhysicalObject(provider));
    
    //*/
    return builder.build();
}
