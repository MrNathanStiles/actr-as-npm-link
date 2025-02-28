import { 
  actr_log,
  actr_three_camera_position, actr_three_init, actr_three_render, actr_three_scene_add, 
  ActrOctree, 
  AmbientLight, 
  BufferGeometry, DirectionalLight, Mesh, MeshStandardMaterial, PerlinNoise, SurfaceNetGenerator, Vector3 
} from '@actr-wasm/as';
import { Cube } from '@actr-wasm/as/src/cube';

export { actr_construct } from '@actr-wasm/as';


// let geo!: BoxGeometry;
let geo!: BufferGeometry;
let mat!: MeshStandardMaterial;
let roid!: Mesh;

let cubeX!: Cube;
let cubeY!: Cube;
let cubeZ!: Cube;

let cube0!: Cube;
let cube1!: Cube;
let cube2!: Cube;
let cube3!: Cube;
let cube4!: Cube;
let cube5!: Cube;
let cube6!: Cube;
let cube7!: Cube;

let lightAmbient!: AmbientLight;
let lightDirectional!: DirectionalLight;
let camera!: Vector3;
let noise!: PerlinNoise;
let tree!: ActrOctree;
// let light2!: DirectionalLight;

function spherePointGen(x: f32, y: f32, z: f32): f32 {
  return x * x + y * y + z * z - 1;
}

function asteroidPointGen(x: f32, y: f32, z: f32): f32 {
  return (x * x + y * y + z * z) - noise.generate(x*2,y*2,z*2);
}

function randomPointGen(x: f32, y: f32, z: f32): f32 {
  return (f32)(Math.random() - 0.5);
}

function sinWave(x: f32, y: f32, z: f32): f32 {
  return (f32)(Math.sin(x) + Math.sin(y) + Math.sin(z));
}

export function actr_init(w: i32, h: i32): void {

  noise = new PerlinNoise(true);
  const row1 = StaticArray.fromArray<f32>([-1.0, 1.0, 0.1]);
  const dims = StaticArray.fromArray([row1, row1, row1]);
  const gen = new SurfaceNetGenerator();  
  const surfaceNet = gen.makeData(dims, asteroidPointGen).generateNet();
  actr_three_init(90, 0.1, 50000);
  tree = new ActrOctree(true, -32, -32, 32, 64, null, true);


  // geo = new BoxGeometry(1, 1, 1);
  geo = new BufferGeometry(0, surfaceNet.faces.length, surfaceNet.faces, surfaceNet.vertices.length, surfaceNet.vertices);
  mat = new MeshStandardMaterial(0xffffff, 0x000000);
  roid = new Mesh(geo, mat);
  // y == up

  roid.position = new Vector3(0, 0, 0);
  lightAmbient = new AmbientLight(0xffffff, 0.5);
  lightDirectional = new DirectionalLight(0xb36ff6, 0.5);
  // light2 = new DirectionalLight(0x000000);

  camera = new Vector3(0, 10, 0);
  
  lightDirectional.position = new Vector3(1000, 0, 0);

  actr_three_scene_add(lightAmbient.identity);
  actr_three_scene_add(lightDirectional.identity);

  //actr_three_scene_add(light2.identity);
  //actr_three_scene_add(roid.identity);
  actr_three_camera_position(camera.x, camera.y, camera.z);

  cubeX = new Cube(1, -14, -10, -10, 0xff0000);
  cubeY = new Cube(1, -12, -10, -10, 0x00ff00);
  cubeZ = new Cube(1, -10, -10, -10, 0x0000ff);
  
  cubeX.addToTree(tree);
  //cubeY.addToTree(tree);
  cubeZ.addToTree(tree);

  cube0 = new Cube(10, 0, 0, 0, 0xffffff);
  cube1 = new Cube(10, 11, 0, 0, 0xffffff);
  cube2 = new Cube(10, 11, 0, 11, 0xffffff);
  cube3 = new Cube(10, 0, 0, 11, 0xffffff);

  cube4 = new Cube(10, 0, 11, 0, 0xffffff);
  cube5 = new Cube(10, 11, 11, 0, 0xffffff);
  cube6 = new Cube(10, 11, 11, 11, 0xffffff);
  cube7 = new Cube(10, 0, 11, 11, 0xffffff);
  
  cubeX.addToScene();
  //cubeY.addToScene();
  cubeZ.addToScene();

  // cube0.addToScene();
  // cube1.addToScene();
  // cube2.addToScene();
  // cube3.addToScene();
  // cube4.addToScene();
  // cube5.addToScene();
  // cube6.addToScene();
  // cube7.addToScene();

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
let dist: f32 = 200;
let step: i32 = 0;
export function actr_step(delta: f32): void {
  step++;

  if (insertCube) {
    const nc = new Cube(11, camera.x, camera.y, camera.z, 0xff00ff);
    nc.addToScene();
    nc.addToTree(tree);
    insertCube = false;
  }
  if (keyboard[1]) {
    stage += 1 * delta;
  } else if (keyboard[2]) {
    stage -= 1 * delta;
  }

  if (keyboard[5]) {
    dist -= 100 * delta;
  } else if (keyboard[6]) {
    dist += 100 * delta;
  }

  if (keyboard[113]) {
    camera.y += 100 * delta;
  } else if (keyboard[101]) {
    camera.y -= 100 * delta;
  }

  const rot = roid.rotation;
  const speed: f32 = 0.1;
  rot.x += speed;
  //rot.y += 0.01;
  rot.z += speed;
  roid.rotation = rot;
  camera.x = (f32)(Math.cos(stage) * dist);
  camera.z = (f32)(Math.sin(stage) * dist);
  
  //light1.position = camera;
  actr_three_camera_position(camera.x, camera.y, camera.z);


  actr_three_render();
}
