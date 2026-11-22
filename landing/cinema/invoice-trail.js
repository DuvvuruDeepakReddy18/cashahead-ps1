import { MathUtils, Matrix4, PerspectiveCamera, Vector3 } from "three";

// Layer 1 carries Dock’s physical invoice. Both passes use the same mesh, textures and lights.
export function invoiceTrailPass(scene, invoice) {
  invoice.traverse((object) => object.layers.set(1));
  scene.traverse((object) => {
    if (object.isLight) object.layers.enable(1);
  });
  const paperCamera = new PerspectiveCamera(),
    adjustment = new Matrix4();
  const center = new Vector3(),
    top = new Vector3(),
    bottom = new Vector3();
  return function drawTrail(
    renderer,
    camera,
    width,
    height,
    topInset,
    bottomInset,
    track,
  ) {
    const { offset, mix, x, y, size, lean } = track;
    renderer.autoClear = false;
    renderer.clear();
    const visibleBottom = height + offset - bottomInset;
    if (visibleBottom > topInset) {
      // Expose the same part of the desk as its caption and background scroll away.
      renderer.setViewport(0, -offset, width, height);
      renderer.setScissor(
        0,
        height - visibleBottom,
        width,
        visibleBottom - topInset,
      );
      renderer.setScissorTest(true);
      camera.layers.set(0);
      renderer.render(scene, camera);
      renderer.setScissorTest(false);
    }
    camera.layers.enable(1);
    renderer.setViewport(0, 0, width, height);
    renderer.clearDepth();
    camera.updateMatrixWorld();
    invoice.getWorldPosition(center).project(camera);
    invoice.localToWorld(top.set(0, 0.52, 0)).project(camera);
    invoice.localToWorld(bottom.set(0, -0.52, 0)).project(camera);
    const sourceHeight = Math.abs(top.y - bottom.y) * height * 0.5;
    const scale = MathUtils.lerp(1, size / Math.max(1, sourceHeight), mix);
    const turn = lean * mix,
      cs = Math.cos(turn) * scale,
      sn = Math.sin(turn) * scale;
    const nx = MathUtils.lerp(center.x, (2 * x) / width - 1, mix);
    const ny = MathUtils.lerp(
      center.y - (2 * offset) / height,
      1 - (2 * y) / height,
      mix,
    );
    const a = cs,
      b = (sn * height) / width,
      c = (-sn * width) / height,
      d = cs;
    adjustment.set(
      a,
      b,
      0,
      nx - a * center.x - b * center.y,
      c,
      d,
      0,
      ny - c * center.x - d * center.y,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    );
    paperCamera.copy(camera);
    paperCamera.projectionMatrix.premultiply(adjustment);
    paperCamera.projectionMatrixInverse
      .copy(paperCamera.projectionMatrix)
      .invert();
    paperCamera.layers.set(1);
    // Screen-space edge where the blue thread meets the moving sheet.
    track.edgeX = (nx + 1) * width * 0.5;
    track.edgeY = (1 - ny) * height * 0.5 + sourceHeight * scale * 0.49;
    renderer.render(scene, paperCamera);
    renderer.autoClear = true;
  };
}
