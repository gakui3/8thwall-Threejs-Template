/* global XR8 */
/* global THREE */

export const customThreejsPipelineModule = () => {
  let scene3;
  let engaged = false;

  const xrScene = () => {
    return scene3;
  };

  const engage = ({ canvas, canvasWidth, canvasHeight, GLctx }) => {
    if (engaged) {
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60.0 /* initial field of view; will get set based on device info later. */,
      canvasWidth / canvasHeight,
      0.01,
      1000.0,
    );
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      context: GLctx,
      alpha: true,
      antialias: true,
    });
    renderer.autoClear = false;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene3 = { scene, camera, renderer };
    engaged = true;

    window.scene3 = scene3;
    window.XR8.Threejs.xrScene = xrScene;
  };

  // This is a workaround for https://bugs.webkit.org/show_bug.cgi?id=237230
  // Once the fix is released, we can add `&& parseFloat(device.osVersion) < 15.x`
  const device = XR8.XrDevice.deviceEstimate();
  const needsPrerenderFinish =
    device.os === "iOS" && parseFloat(device.osVersion) >= 15.4;

  return {
    name: "customthreejs",
    onStart: (args) => engage(args),
    onAttach: (args) => engage(args),
    onDetach: () => {
      engaged = false;
    },
    onUpdate: ({ processCpuResult }) => {
      const realitySource =
        processCpuResult.reality || processCpuResult.facecontroller;

      if (!realitySource) {
        return;
      }

      const { rotation, position, intrinsics } = realitySource;
      const { camera } = scene3;

      for (let i = 0; i < 16; i++) {
        camera.projectionMatrix.elements[i] = intrinsics[i];
      }

      // Fix for broken raycasting in r103 and higher. Related to:
      //   https://github.com/mrdoob/three.js/pull/15996
      // Note: camera.projectionMatrixInverse wasn't introduced until r96 so check before setting
      // the inverse
      if (camera.projectionMatrixInverse) {
        if (camera.projectionMatrixInverse.invert) {
          // THREE 123 preferred version
          camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
        } else {
          // Backwards compatible version
          camera.projectionMatrixInverse.getInverse(camera.projectionMatrix);
        }
      }

      if (rotation) {
        camera.setRotationFromQuaternion(rotation);
      }
      if (position) {
        camera.position.set(position.x, position.y, position.z);
      }
    },
    onCanvasSizeChange: ({ canvasWidth, canvasHeight }) => {
      if (!engaged) {
        return;
      }
      const { renderer } = scene3;
      renderer.setSize(canvasWidth, canvasHeight);
    },
    onRender: () => {
      const { scene, camera, renderer } = scene3;
      renderer.clearDepth();
      if (needsPrerenderFinish) {
        renderer.getContext().finish();
      }
      renderer.render(scene, camera);
    },
    // Get a handle to the xr scene, camera and renderer. Returns:
    // {
    //   scene: The Threejs scene.
    //   camera: The Threejs main camera.
    //   renderer: The Threejs renderer.
    // }
    xrScene: () => {
      return scene3;
    },
  };
};
