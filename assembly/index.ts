import {
  actr_three_init, actr_three_render, ActrOctree, AmbientLight, BufferGeometry,
  DirectionalLight, Mesh, MeshStandardMaterial, PerlinNoise, PerspectiveCamera,
  Scene,
  SurfaceNetGenerator, Vector3
} from '@actr-wasm/as';
import { Cube } from '@actr-wasm/as/src/cube';

export { actr_construct } from '@actr-wasm/as';


// let geo!: BoxGeometry;

let cubeO!: Cube;
let cubeX!: Cube;
let cubeY!: Cube;
let cubeZ!: Cube;


let lightAmbient!: AmbientLight;
let lightDirectional!: DirectionalLight;
let scene!: Scene;
let camera!: PerspectiveCamera;
let tree!: ActrOctree;
// let light2!: DirectionalLight;

function spherePointGen(x: f32, y: f32, z: f32): f32 {
  return x * x + y * y + z * z - 1;
}

function asteroidPointGen(x: f32, y: f32, z: f32): f32 {
  return (x * x + y * y + z * z) - noise.generate(x * 2, y * 2, z * 2);
}

function randomPointGen(x: f32, y: f32, z: f32): f32 {
  return (f32)(Math.random() - 0.5);
}

function sinWave(x: f32, y: f32, z: f32): f32 {
  return (f32)(Math.sin(x) + Math.sin(y) + Math.sin(z));
}

let noise!: PerlinNoise;

function surfaceNetStuff(scene: Scene): void {
  noise = new PerlinNoise(true);
  const row1 = StaticArray.fromArray<f32>([-1.0, 1.0, 0.05]);
  const dims = StaticArray.fromArray([row1, row1, row1]);
  const gen = new SurfaceNetGenerator();
  const surfaceNet = gen.makeData(dims, asteroidPointGen).generateNet();
  surfaceNet.addToScene(scene);
  //tree.insertSurfaceNet(surfaceNet);
}

export function actr_init(w: i32, h: i32): void {
  actr_three_init(90, 1, 1001);
  scene = new Scene();
  camera = new PerspectiveCamera(90, 0.1, 5000.1)
  camera.position = new Vector3(0, 0, 0)
  camera.lookAt(0, 0, 0);
  tree = new ActrOctree(true, -32, -32, 32, 64, null, scene);

  surfaceNetStuff(scene);

  // geo = new BoxGeometry(1, 1, 1);
  // y == up

  lightAmbient = new AmbientLight(0xffffff, 0.5);
  lightDirectional = new DirectionalLight(0xb36ff6, 0.5);
  // light2 = new DirectionalLight(0x000000);


  lightDirectional.position = new Vector3(1000, 0, 0);

  scene.add(lightDirectional);
  scene.add(lightAmbient);
  //actr_three_scene_add(light2.identity);
  //actr_three_scene_add(roid.identity);

  cubeO = Cube.makeSimple(0.1, 0, 0, 0, 0xffffff);
  //cubeO.addToScene(scene);

  cubeX = Cube.makeSimple(1, 110, 0, 0, 0xff0000);
  cubeX.addToScene(scene);

  cubeY = Cube.makeSimple(1, 0, 110, 0, 0x00ff00);
  cubeY.addToScene(scene);

  cubeZ = Cube.makeSimple(1, 0, 0, -110, 0x0000ff);
  cubeZ.addToScene(scene);

  //cubeX.addToTree(tree);
  //cubeY.addToTree(tree);
  //cubeZ.addToTree(tree);




}
const keyboard: StaticArray<bool> = new StaticArray<bool>(256);

let insertCube: bool = false;
export function actr_key_down(key: i32): void {

  keyboard[key] = true;
  // actr_log(`${key}`);
}

export function actr_key_up(key: i32): void {
  keyboard[key] = false;
  if (32 == key) {
    insertCube = true;
  }
}

export function actr_resize(w: i32, h: i32): void {

}

export function actr_pointer_move(x: i32, y: i32): void {

}

export function actr_pointer_tap(x: i32, y: i32): void {


}

let stage: f32 = 0;
let dist: f32 = 100;
let step: i32 = 0;

function br(): f64 {
  return (Math.random() + Math.random() + Math.random()) / 3;
}
export function actr_step(delta: f32): void {
  step++;
  

  if (insertCube) {
    const nc = Cube.makeSimple(1, camera.position.x, camera.position.y, camera.position.z, 0xff00ff);
    nc.addToScene(scene);
    nc.addToTree(tree);
    insertCube = false;
  }
  if (keyboard[1]) {
    stage += 1 * delta;
  } else if (keyboard[2]) {
    stage -= 1 * delta;
  }

  if (keyboard[5]) {
    dist -= 10 * delta;
  } else if (keyboard[6]) {
    dist += 10 * delta;
  }

  if (keyboard[113]) {
    camera.position = camera.position.add(0, 10 * delta, 0);
  } else if (keyboard[101]) {
    camera.position = camera.position.add(0, -10 * delta, 0);
  }

  // roid.rotation = roid.rotation.add(0.1 * delta, 0, 0);
  camera.position = new Vector3(
    (f32)(Math.cos(stage) * dist),
    camera.position.y,
    (f32)(Math.sin(stage) * dist)
  );
  
  camera.lookAt(0, 0, 0);
  
  actr_three_render();
}
