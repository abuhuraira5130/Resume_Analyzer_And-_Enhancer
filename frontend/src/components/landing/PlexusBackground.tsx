import { useEffect, useRef } from "react";

/**
 * Subtle Plexus-style background using Three.js.
 * Soft purple/blue translucent points connected by thin lines.
 * Reacts gently to mouse movement (parallax).
 */
export function PlexusBackground({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import("three");
      if (cancelled || !mountRef.current) return;

      const width = mount.clientWidth;
      const height = mount.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      camera.position.z = 60;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      // Build particle cloud
      const COUNT = window.innerWidth < 768 ? 60 : 110;
      const RANGE = 90;
      const positions = new Float32Array(COUNT * 3);
      const velocities = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * RANGE;
        positions[i * 3 + 1] = (Math.random() - 0.5) * RANGE * 0.6;
        positions[i * 3 + 2] = (Math.random() - 0.5) * RANGE * 0.6;
        velocities[i * 3] = (Math.random() - 0.5) * 0.04;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.04;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
      }

      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0x9b87f5,
        size: 0.55,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });
      const points = new THREE.Points(pGeo, pMat);
      scene.add(points);

      // Lines (allocated once with max possible segments)
      const MAX_LINES = COUNT * 6;
      const linePositions = new Float32Array(MAX_LINES * 2 * 3);
      const lineColors = new Float32Array(MAX_LINES * 2 * 3);
      const lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
      lGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
      const lMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const lines = new THREE.LineSegments(lGeo, lMat);
      scene.add(lines);

      const COL_A = new THREE.Color(0xa78bfa); // soft purple
      const COL_B = new THREE.Color(0x7dd3fc); // soft blue

      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: MouseEvent) => {
        const r = mount.getBoundingClientRect();
        mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMove);

      const onResize = () => {
        if (!mountRef.current) return;
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      const MAX_DIST = 14;
      const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
      let raf = 0;

      const animate = () => {
        raf = requestAnimationFrame(animate);

        // Parallax easing
        mouse.x += (mouse.tx - mouse.x) * 0.04;
        mouse.y += (mouse.ty - mouse.y) * 0.04;
        camera.position.x = mouse.x * 6;
        camera.position.y = -mouse.y * 4;
        camera.lookAt(0, 0, 0);

        // Drift particles
        const pos = pGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < COUNT; i++) {
          pos[i * 3] += velocities[i * 3];
          pos[i * 3 + 1] += velocities[i * 3 + 1];
          pos[i * 3 + 2] += velocities[i * 3 + 2];
          for (let a = 0; a < 3; a++) {
            const limit = a === 0 ? RANGE / 2 : (RANGE * 0.6) / 2;
            if (pos[i * 3 + a] > limit || pos[i * 3 + a] < -limit) {
              velocities[i * 3 + a] *= -1;
            }
          }
        }
        pGeo.attributes.position.needsUpdate = true;

        // Rebuild lines
        let segIdx = 0;
        for (let i = 0; i < COUNT && segIdx < MAX_LINES; i++) {
          for (let j = i + 1; j < COUNT && segIdx < MAX_LINES; j++) {
            const dx = pos[i * 3] - pos[j * 3];
            const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
            const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < MAX_DIST_SQ) {
              const alpha = 1 - d2 / MAX_DIST_SQ;
              const k = segIdx * 6;
              linePositions[k] = pos[i * 3];
              linePositions[k + 1] = pos[i * 3 + 1];
              linePositions[k + 2] = pos[i * 3 + 2];
              linePositions[k + 3] = pos[j * 3];
              linePositions[k + 4] = pos[j * 3 + 1];
              linePositions[k + 5] = pos[j * 3 + 2];
              const col = COL_A.clone().lerp(COL_B, alpha);
              lineColors[k] = col.r * alpha;
              lineColors[k + 1] = col.g * alpha;
              lineColors[k + 2] = col.b * alpha;
              lineColors[k + 3] = col.r * alpha;
              lineColors[k + 4] = col.g * alpha;
              lineColors[k + 5] = col.b * alpha;
              segIdx++;
            }
          }
        }
        lGeo.setDrawRange(0, segIdx * 2);
        lGeo.attributes.position.needsUpdate = true;
        (lGeo.attributes.color as { needsUpdate: boolean }).needsUpdate = true;

        renderer.render(scene, camera);
      };

      if (!reduced) animate();
      else renderer.render(scene, camera);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("resize", onResize);
        pGeo.dispose();
        pMat.dispose();
        lGeo.dispose();
        lMat.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}

export default PlexusBackground;