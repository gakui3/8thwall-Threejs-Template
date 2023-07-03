/* global XR8 */
/* global THREE */

// import testVert from "./shaders/test.vert";
// import testFrag from "./shaders/test.frag";

export const initScenePipelineModule = () => {
  let clock;

  const initXrScene = ({scene, camera, renderer}) => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-1, 4, -0.5);
    directionalLight.castShadow = true;
    camera.position.set(0, 3, 0);
    scene.add(directionalLight);
    scene.add(new THREE.AmbientLight(0x404040, 2));

    directionalLight.shadow.mapSize.width = 4096; // default
    directionalLight.shadow.mapSize.height = 4096; // default
    directionalLight.shadow.camera.near = 0.05; // default
    directionalLight.shadow.camera.far = 100; // default
    directionalLight.shadow.camera.bottom = -15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;

    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 10, 10),
      new THREE.ShadowMaterial({
        color: new THREE.Color(0.1, 0.1, 0.1),
        opacity: 0.8,
        depthWrite: false,
      })
    );
    surface.rotateX(-3.14 / 2);
    surface.position.set(0, 0, 0);
    surface.receiveShadow = true;
    scene.add(surface);

    const ge = new THREE.SphereGeometry(1, 10, 10);
    const ma = new THREE.MeshPhongMaterial({});
    ma.flatShading = true;
    ma.skinning = true;
    const me = new THREE.Mesh(ge, ma);
    me.castShadow = true;
    me.receiveShadow = true;
    me.position.set(0, 2, -5);
    scene.add(me);
  };

  return {
    name: "threejsinitscene",

    onStart: async ({canvas, canvasWidth, canvasHeight}) => {
      const {scene, camera} = XR8.Threejs.xrScene();

      initXrScene({scene, camera});

      clock = new THREE.Clock();
      clock.start();

      XR8.XrController.updateCameraProjectionMatrix({
        origin: camera.position,
        facing: camera.quaternion,
      });
    },

    onUpdate: () => {},
  };
};
