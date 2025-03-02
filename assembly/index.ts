import {
  actr_log, actr_three_init, actr_three_render, ActrOctree, ActrPoint3D,
  ActrPoint3F, ActrPoint3I, ActrPoint3L, ActrSize3I, AmbientLight, DirectionalLight,
  DTOL,
  FTOI,
  FTOL,
  PerlinNoise, PerspectiveCamera, Scene, SurfaceNet, SurfaceNetGenerator,
} from '@actr-wasm/as';
import { Cube } from '@actr-wasm/as/src/cube';
import { ActrOctreeBounds } from '@actr-wasm/as/src/octree-bounds';
import { ActrOctreeLeaf } from '@actr-wasm/as/src/octree-leaf';
import { results } from './test-octree';
import { ServiceProvider } from './service-container/service-provider';
import { initializeServiceProvider, Services } from './service-container/container';

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

const noise: PerlinNoise = new PerlinNoise(true);;



const asteroids = new Array<SurfaceNet>();
function makeAsteroid(position: ActrPoint3F): bool {

  const area = new ActrOctreeBounds(FTOL(position.x) - 3, FTOL(position.y) - 3, FTOL(position.z) + 3, 6);

  const result = tree.query(area);
  if (result.length) return false;
  const row1 = StaticArray.fromArray<f32>([-1.0, 1.0, 0.3]);
  const dims = StaticArray.fromArray([row1, row1, row1]);
  const gen = new SurfaceNetGenerator();
  const surfaceNet = gen.makeData(dims, asteroidPointGen).generateNet();
  asteroids.push(surfaceNet);
  surfaceNet.position = position;
  surfaceNet.addToScene(services.getService<Scene>(Services.Scene));
  const leaf = new ActrOctreeLeaf(
    DTOL(Math.floor(position.x - surfaceNet.size.w / 2)),
    DTOL(Math.floor(position.y - surfaceNet.size.h / 2)),
    DTOL(Math.ceil(position.z + surfaceNet.size.d / 2)),
    FTOI(Mathf.max(surfaceNet.size.w + 1, 2)),
    FTOI(Mathf.max(surfaceNet.size.h + 1, 2)),
    FTOI(Mathf.max(surfaceNet.size.d + 1, 2)),
    surfaceNet.identity
  );
  //actr_log(`${leaf}`);
  tree.insert(leaf);
  noise.shuffle();
  return true;
  //tree.insertSurfaceNet(surfaceNet);
}

function logit(val: f32): void {
  const cast = (i32)(val);
  actr_log(`${val} -> ${cast}`);
}

const GRID_SIZE: i64 = 512;
function togrid(point: ActrPoint3D): ActrPoint3L {
  const x = DTOL(point.x);
  const y = DTOL(point.y);
  const z = DTOL(point.z);
  return new ActrPoint3L(
    (x < 0 ? (x - GRID_SIZE) : x) / GRID_SIZE,
    (y < 0 ? (y - GRID_SIZE) : y) / GRID_SIZE,
    (z < 0 ? (z - GRID_SIZE) : z) / GRID_SIZE,
  );
}
function fromgrid(point: ActrPoint3I): ActrPoint3D {
  return new ActrPoint3D(
    point.x * GRID_SIZE,
    point.y * GRID_SIZE,
    point.z * GRID_SIZE
  );
}

let lastGrid: ActrPoint3L = new ActrPoint3L(0, 0, 0);
function currentGrid(): ActrPoint3L {
  return togrid(new ActrPoint3D(
    camera.position.x,
    camera.position.y,
    camera.position.z
  ));
}

let scene!: Scene;
let camera!: PerspectiveCamera;
let services!: ServiceProvider;
let tree!: ActrOctree;
export function actr_init(w: i32, h: i32): void {

  actr_three_init();
  services = initializeServiceProvider();
  
  camera.position = new ActrPoint3F(0, 0, 0)
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


  lightDirectional1.position = new ActrPoint3F(1000, -10, 0);
  lightDirectional2.position = new ActrPoint3F(-1000, 10, 0);

  scene.add(lightDirectional1);
  scene.add(lightDirectional2);
  //scene.add(lightAmbient);
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

function initArea(grid: ActrPoint3L): void {
  return;
  for (let x = grid.x - 1; x < grid.x + 2; x++) {
    for (let y = grid.y - 1; y < grid.y + 2; y++) {
      for (let z = grid.z - 1; z < grid.z + 2; z++) {
        const point = fromgrid(new ActrPoint3F(x, y, z));
        const bounds = new ActrOctreeBounds(point.x, point.y, point.z, GRID_SIZE);
        const result = tree.query(bounds);
        if (result.length == 0) {
          makeAsteroid(new ActrPoint3F(
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

function br(): f32 {
  return (f32)(((Math.random() + Math.random() + Math.random()) / 3 * 2 - 1) * 512);
}
const worldVelocity = new ActrPoint3F(0, 0, 0);
let added: i32 = 0;
export function actr_step(delta: f32): void {
  step++;
  const nextGrid = currentGrid();
  if (!lastGrid.equals(nextGrid)) {
    // initArea(nextGrid);
    lastGrid = nextGrid;
  }

  let rotation = new ActrPoint3F(0, 0, 0);

  const acceleration = new ActrPoint3F(0, 0, 0);
  let rotate = false;
  let move = false;

  if (added < 512) {
    for (let i = 0; i < 10; i++) {
      if (makeAsteroid(new ActrPoint3F(br(), br(), br()))) added++;
      if (added >= 1024) break;
      if (added % 32 == 0)actr_log(`added ${added} asteroids`);
    }//const nc = Cube.makeSimple(1, br(), br(), br(), 0xff00ff);
    //nc.addToScene(scene);
    //nc.addToTree(tree);

  } else if (added == 512) {
    actr_log(`added ${added} asteroids`);
    added++;
  }
  if (insertCube) {
    const nc = Cube.makeSimple(1, camera.position.x, camera.position.y, camera.position.z, 0xff00ff);
    nc.addToScene(scene);
    nc.addToTree(tree);
    insertCube = false;
  }
  if (keyboard[1]) {
    rotate = true;
    rotation.y += delta;
  } else if (keyboard[2]) {
    rotate = true;
    rotation.y -= delta;
  }

  // 119 97 115 100
  if (keyboard[119]) {
    move = true;
    acceleration.z -= delta;
  } else if (keyboard[115]) {
    move = true;
    acceleration.z += delta;
  }

  if (keyboard[97]) {
    move = true;
    acceleration.x -= delta;
  } else if (keyboard[100]) {
    move = true;
    acceleration.x += delta;
  }

  if (keyboard[5]) {
    rotate = true;
    rotation.x -= delta;
  } else if (keyboard[6]) {
    rotate = true;
    rotation.x += delta;
  }

  if (keyboard[113]) {
    rotate = true;
    rotation.z += delta;
  } else if (keyboard[101]) {
    rotate = true;
    rotation.z -= delta;
  }

  if (rotate) {
    camera.rotate(rotation.x, rotation.y, rotation.z);
  }
  if (move) {
    worldVelocity.addIn(camera.toWorld(acceleration).subtract(camera.position));
  }
  worldVelocity.x *= 0.99;
  worldVelocity.y *= 0.99;
  worldVelocity.z *= 0.99;
  camera.position = camera.position.add(worldVelocity);

  actr_three_render();
}
