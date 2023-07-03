// Copyright (c) 2018 8th Wall, Inc.
/* global XR8 */
/* global XRExtras */

import {customThreejsPipelineModule} from "./customThreejsPipelineModule.js";
import {initScenePipelineModule} from "./threejsSceneInit.js";

const onxrloaded = () => {
  const canvas = document.getElementById("camerafeed");

  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(), // Draws the camera feed.
    // XR8.Threejs.pipelineModule(), // Creates a ThreeJS AR Scene.
    customThreejsPipelineModule(),
    initScenePipelineModule(),
    XR8.XrController.pipelineModule(), // Enables SLAM tracking.
    XRExtras.AlmostThere.pipelineModule(), // Detects unsupported browsers and gives hints.
    XRExtras.RuntimeError.pipelineModule(), // Shows an error image on runtime error.
    XRExtras.FullWindowCanvas.pipelineModule(),
    // XRExtras.Loading.pipelineModule(),
  ]);

  // Open the camera and start running the camera run loop.
  XR8.run({canvas});
};

window.onload = () => {
  window.XR ? onxrloaded() : window.addEventListener("xrloaded", onxrloaded);
};
