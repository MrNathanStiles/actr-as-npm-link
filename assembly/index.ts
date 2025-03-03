import {
  actr_log, actr_three_init, actr_three_render, ActrOctree, ActrPoint3, 
  DirectionalLight, PerlinNoise, 
  PerspectiveCamera, Scene, SurfaceNet, SurfaceNetGenerator,
  TOL
} from '@actr-wasm/as';
import { Cube } from '@actr-wasm/as/src/cube';
import { ActrOctreeBounds } from '@actr-wasm/as/src/octree-bounds';
import { ActrOctreeLeaf } from '@actr-wasm/as/src/octree-leaf';
import { ServiceProvider } from './service-container/service-provider';
import { initializeServiceProvider, Services } from './service-container/container';
import { Missile } from './services/missile';
import { PhysicalObject } from './services/physical-object';
import { ProgramObject } from './services/program-object';

export { actr_construct } from '@actr-wasm/as';

// let geo!: BoxGeometry;

let cubeO!: Cube;
let cubeX!: Cube;
let cubeY!: Cube;
let cubeZ!: Cube;


let lightDirectional1!: DirectionalLight;
let lightDirectional2!: DirectionalLight;

// let light2!: DirectionalLight;

function spherePointGen(x: f32, y: f32, z: f32): f32 {
  const result = x * x + y * y + z * z - 1;
  //actr_log(`sph ${x},${y},${z} = ${result}`);
  return result;
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

const asteroids = new Array<SurfaceNet>();
function makeAsteroid(position: ActrPoint3<f32>): bool {

  const areaHalfSize: f32 = 4;
  const area = new ActrOctreeBounds(position.addXYZ(-areaHalfSize, -areaHalfSize, -areaHalfSize).to<i64>(), (i64)(areaHalfSize * 2));

  const result = tree.query(area);

  if (result.length) return false;
  const row1 = StaticArray.fromArray<f32>([-1.0, 1.0, 0.2]);
  const dims = StaticArray.fromArray([row1, row1, row1]);
  const gen = new SurfaceNetGenerator();
  const surfaceNet = gen.makeData(dims, asteroidPointGen).generateNet();
  asteroids.push(surfaceNet);
  surfaceNet.position = position;
  surfaceNet.addToScene(services.getService<Scene>(Services.Scene));
  const leaf = new ActrOctreeLeaf(
    position.addXYZ(surfaceNet.size.x / -2, surfaceNet.size.y / -2, surfaceNet.size.z / -2).to<i64>(),
    surfaceNet.size.addXYZ(1, 1, 1).max(2, 2, 2).to<i32>(),
    surfaceNet.identity
  );
  //actr_log(`${leaf}`);
  tree.insert(leaf);
  noise.shuffle();
  return true;
  //tree.insertSurfaceNet(surfaceNet);
}

const GRID_SIZE: i64 = 512;
function togrid(point: ActrPoint3<f64>): ActrPoint3<i64> {
  const x = TOL(point.x);
  const y = TOL(point.y);
  const z = TOL(point.z);
  return new ActrPoint3<i64>(
    (x < 0 ? (x - GRID_SIZE) : x) / GRID_SIZE,
    (y < 0 ? (y - GRID_SIZE) : y) / GRID_SIZE,
    (z < 0 ? (z - GRID_SIZE) : z) / GRID_SIZE,
  );
}
function fromgrid(point: ActrPoint3<i32>): ActrPoint3<f64> {
  return new ActrPoint3<f64>(
    point.x * GRID_SIZE,
    point.y * GRID_SIZE,
    point.z * GRID_SIZE
  );
}

let lastGrid: ActrPoint3<i64> = new ActrPoint3<i64>(0, 0, 0);
function currentGrid(): ActrPoint3<i64> {
  return togrid(new ActrPoint3<f64>(
    camera.position.x,
    camera.position.y,
    camera.position.z
  ));
}

let services!: ServiceProvider;
let scene!: Scene;
let camera!: PerspectiveCamera;
let tree!: ActrOctree;
let noise!: PerlinNoise;

export function actr_init(w: i32, h: i32): void {
  actr_three_init();
  services = initializeServiceProvider();
  camera = services.getService<PerspectiveCamera>(Services.PerspectiveCamera);
  scene = services.getService<Scene>(Services.Scene);
  tree = services.getService<ActrOctree>(Services.ActrOctree);
  noise = services.getService<PerlinNoise>(Services.PerlinNoise);

  camera.position = new ActrPoint3<f32>(0, 0, 0);
  camera.lookAt(0, 0, 0);
  //tree = services.getService<ActrOctree>(Services.ActrOctree);


  lastGrid = currentGrid();
  initArea(lastGrid);
  // surfaceNetStuff(scene);

  // geo = new BoxGeometry(1, 1, 1);
  // y == up

  // lightAmbient = new AmbientLight(0xffffff, 0.01);
  //lightDirectional1 = new DirectionalLight(0xd900ff, 0.5);
  lightDirectional1 = new DirectionalLight(0xffffff, 1);
  lightDirectional2 = new DirectionalLight(0xffffff, 0.01);
  // light2 = new DirectionalLight(0x000000);


  lightDirectional1.position = new ActrPoint3<f32>(1000, -10, 0);
  lightDirectional2.position = new ActrPoint3<f32>(-1000, 10, 0);

  scene.add(lightDirectional1);
  scene.add(lightDirectional2);
  //scene.add(lightAmbient);
  //actr_three_scene_add(light2.identity);
  //actr_three_scene_add(roid.identity);

  cubeO = Cube.makeSimple(new ActrPoint3<f32>(0, 0, 0), 1, 0xffffff);
  //cubeO.addToScene(scene);

  cubeX = Cube.makeSimple(new ActrPoint3<f32>(110, 0, 0), 1, 0xff0000);
  cubeX.addToScene(scene);

  cubeY = Cube.makeSimple(new ActrPoint3<f32>(0, 110, 0), 1, 0x00ff00);
  cubeY.addToScene(scene);

  cubeZ = Cube.makeSimple(new ActrPoint3<f32>(0, 0, 110), 1, 0x0000ff);
  cubeZ.addToScene(scene);

}
const keyboard: StaticArray<bool> = new StaticArray<bool>(256);

let insertCube: bool = false;
export function actr_key_down(key: i32): void {

  keyboard[key] = true;
  if (32 == key) {
    insertCube = true;
  }
  // actr_log(`${key}`);
}

export function actr_key_up(key: i32): void {
  keyboard[key] = false;
  if (32 == key) {
    insertCube = false;
  }
}

export function actr_resize(w: i32, h: i32): void {

}

export function actr_pointer_move(x: i32, y: i32): void {

}

export function actr_pointer_tap(x: i32, y: i32): void {


}

function initArea(grid: ActrPoint3<i64>): void {
  return;
  for (let x = grid.x - 1; x < grid.x + 2; x++) {
    for (let y = grid.y - 1; y < grid.y + 2; y++) {
      for (let z = grid.z - 1; z < grid.z + 2; z++) {
        const point = fromgrid(new ActrPoint3<f32>(x, y, z));
        const bounds = new ActrOctreeBounds(point, GRID_SIZE);
        const result = tree.query(bounds);
        if (result.length == 0) {
          makeAsteroid(new ActrPoint3<f32>(
            (f32)(point.x + GRID_SIZE / 2),
            (f32)(point.y + GRID_SIZE / 2),
            (f32)(point.z + GRID_SIZE / 2),
          ));
        }
      }
    }
  }
}

let step: i32 = 0;

const toAdd = 2 * 2 * 2 * 2 * 2;
function br(): f32 {
  return (f32)(((Math.random() + Math.random() + Math.random()) / 3 * 2 - 1) * toAdd);
}
let worldVelocity = new ActrPoint3<f32>(0, 0, 0);
let added: i32 = 0;


export function actr_step(delta: f32): void {

  step++;
  const nextGrid = currentGrid();
  if (!lastGrid.equals(nextGrid)) {
    // initArea(nextGrid);
    lastGrid = nextGrid;
  }

  let rotation = new ActrPoint3<f32>(0, 0, 0);

  let acceleration = new ActrPoint3<f32>(0, 0, 0);
  let rotate = false;
  let move = false;

  if (added < toAdd) {
    for (let i = 0; i < 1; i++) {
      if (makeAsteroid(new ActrPoint3<f32>(br(), br(), br()))) added++;
      if (added >= toAdd) break;
    }//const nc = Cube.makeSimple(1, br(), br(), br(), 0xff00ff);
    //nc.addToScene(scene);
    //nc.addToTree(tree);

  } else if (added == toAdd) {
    actr_log(`added ${added} asteroids`);
    added++;
  }
  if (insertCube) {
    const missile = services.getService<Missile>(Services.Missile);
    missile.init();
    missile.services.getExistingService<PhysicalObject>(Services.PhysicalObject).position = camera.position.to<f64>();

    // const nc = Cube.makeSimple(camera.position, 1, 0xff00ff);
    // nc.addToScene(scene);
    // nc.addToTree(tree);
    
  }
  // left right
  if (keyboard[1]) {
    rotate = true;
    rotation = rotation.addXYZ(0, delta, 0);
  } else if (keyboard[2]) {
    rotate = true;
    rotation = rotation.addXYZ(0, -delta, 0);
  }

  if (keyboard[119]) {
    move = true;
    acceleration = acceleration.addXYZ(0, 0, delta);
  } else if (keyboard[115]) {
    move = true;
    acceleration = acceleration.addXYZ(0, 0, -delta);
  }

  if (keyboard[97]) {
    move = true;
    acceleration = acceleration.addXYZ(-delta, 0, 0);
  } else if (keyboard[100]) {
    move = true;
    acceleration = acceleration.addXYZ(delta, 0, 0);
  }

  if (keyboard[5]) {
    rotate = true;
    rotation = rotation.addXYZ(-delta, 0, 0);
  } else if (keyboard[6]) {
    rotate = true;
    rotation = rotation.addXYZ(delta, 0, 0);
  }

  if (keyboard[113]) {
    rotate = true;
    rotation = rotation.addXYZ(0, 0, -delta);
  } else if (keyboard[101]) {
    rotate = true;
    rotation = rotation.addXYZ(0, 0, delta);
  }

  if (rotate) {
    camera.rotate(rotation.x, rotation.y, rotation.z);
  }
  if (move) {
    worldVelocity = worldVelocity.add(camera.toWorld(acceleration).subtract(camera.position));
  }
  worldVelocity = worldVelocity.multiply(0.99);
  camera.position = camera.position.add(worldVelocity);

  for (let i = 0; i < ProgramObject.objects.length; i++) {
    ProgramObject.objects[i].update(delta);
  }
  actr_three_render();
}
