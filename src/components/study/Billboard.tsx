'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { BillboardPhysics } from './billboard-physics';
import { site } from '@content/site';
import DoorSpill from './DoorSpill';
import DoorLink from './DoorLink';
import { PassingHeadlights } from './passing-headlights';
import styles from './Billboard.module.css';

const PHOTO = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/study/nothing-lasts-forever.png`;
type Point = [number, number, number];

/** The image stays still; a mesh replaces only the four corners of the sign. */
export default function Billboard({ lighting = false }: { lighting?: boolean }) {
  const [doorActive, setDoorActive] = useState(false);
  const lightId = useId().replace(/:/g, '');
  const rootRef = useRef<HTMLDivElement>(null);
  const photographRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const frame = photographRef.current;
    const canvas = canvasRef.current;
    const interaction = interactionRef.current;
    if (!root || !frame || !canvas || !interaction) return;
    let cancelled = false;
    let teardown = () => {};
    let dimensions = { width: 1, height: 1, scale: 1, left: 0, top: 0 };
    let resizeScene = () => {};
    let wake: (seconds?: number) => void = () => {};
    const layout = () => {
      const { width, height } = root.getBoundingClientRect();
      const scale = Math.min(width / 610, height / 710);
      const left = (width - 610 * scale) / 2;
      const top = (height - 710 * scale) / 2;
      dimensions = { width, height, scale, left, top };
      Object.assign(frame.style, { width: `${610 * scale}px`, height: `${710 * scale}px`, left: `${left}px`, top: `${top}px`, transform: 'none' });
      // The simulation can keep falling, but its rendered pixels belong only
      // to the photograph. Never let cloth or threads enter the letterbox.
      canvas.style.clipPath = `inset(${top}px ${left}px ${top}px ${left}px)`;
      Object.assign(interaction.style, {
        left: `${left + 77 * scale}px`, top: `${top + 141 * scale}px`,
        width: `${207 * scale}px`, height: `${212 * scale}px`,
      });
      resizeScene();
      wake();
    };
    const observer = new ResizeObserver(layout);
    observer.observe(root);
    layout();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => { observer.disconnect(); };
    }

    (async () => {
      const [THREE, lightingModule, washModule] = await Promise.all([
        import('three'), lighting ? import('./relighting') : Promise.resolve(null),
        lighting ? import('./headlight-wash') : Promise.resolve(null),
      ]);
      if (cancelled) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
      catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.setClearColor(0x000000, 0);
      let texture: InstanceType<typeof THREE.Texture>;
      try { texture = await new THREE.TextureLoader().loadAsync(PHOTO); }
      catch { renderer.dispose(); return; }
      if (cancelled) { texture.dispose(); renderer.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(0, 6.1, 0, -7.1, 0.01, 30);
      camera.position.z = 10;
      resizeScene = () => {
        const { width, height, scale, left, top } = dimensions;
        const units = scale * 100;
        camera.left = -left / units;
        camera.right = (width - left) / units;
        camera.top = top / units;
        camera.bottom = (top - height) / units;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      resizeScene();
      const physics = new BillboardPhysics();
      let invitationTime: number | null = null;
      try {
        if (!sessionStorage.getItem('mqn-sign-invited-v1')) invitationTime = -0.65;
      } catch { invitationTime = -0.65; }
      const stopInvitation = () => {
        if (invitationTime === null) return;
        invitationTime = null;
        physics.cancelInvitation();
        canvas.dataset.fabricInvitation = 'finished';
      };
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(physics.positions, 3).setUsage(THREE.DynamicDrawUsage));
      geometry.setAttribute('uv', new THREE.BufferAttribute(physics.uv, 2));
      geometry.setIndex(physics.indices());
      geometry.computeVertexNormals();
      const relighting = lightingModule ? new lightingModule.SignRelighting(renderer, geometry, texture) : null;
      const headlightWash = washModule ? new washModule.HeadlightWash(texture) : null;
      if (headlightWash) scene.add(headlightWash.mesh);
      const material = relighting?.clothMaterial ?? new THREE.ShaderMaterial({
        uniforms: { photograph: { value: texture } },
        side: THREE.DoubleSide,
        transparent: true,
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vUv = uv;
            vNormal = normal;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D photograph;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vec3 n = normalize(vNormal);
            vec3 imageColor = texture2D(photograph, vUv).rgb;
            float light = 0.42 + 0.58 * abs(n.z) + n.x * 0.18 - n.y * 0.12;
            if (!gl_FrontFacing) imageColor = mix(imageColor, vec3(0.16, 0.20, 0.21), 0.73);
            float alpha = 1.0 - smoothstep(5.65, 6.85, -vPosition.y);
            gl_FragColor = vec4(imageColor * light, alpha);
            #include <colorspace_fragment>
          }
        `,
      });
      const cloth = new THREE.Mesh(geometry, material);
      cloth.frustumCulled = false;
      scene.add(cloth);

      // A dark backing covers the printed square, so a cut never reveals a
      // second intact copy. Everything outside this quadrilateral is the photo.
      const backingGeometry = new THREE.BufferGeometry();
      backingGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
        0.79, -1.43, -0.08, 2.78, -1.48, -0.08,
        2.82, -3.51, -0.08, 0.85, -3.46, -0.08,
      ], 3));
      backingGeometry.setIndex([0, 2, 1, 0, 3, 2]);
      const backingMaterial = relighting?.backingMaterial ?? new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        vertexShader: `varying vec2 p; void main(){p=position.xy; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `
          varying vec2 p;
          void main(){
            float grain = fract(sin(dot(floor(p*450.0),vec2(12.9898,78.233)))*43758.5453);
            float seam = smoothstep(0.012,0.018,abs(fract(p.y*2.5)-0.5));
            vec3 c = vec3(0.007,0.012,0.011)*(0.75+grain*0.5)*mix(0.68,1.0,seam);
            gl_FragColor=vec4(c,1.0);
            #include <colorspace_fragment>
          }
        `,
      });
      scene.add(new THREE.Mesh(backingGeometry, backingMaterial));

      const edgeGeometry = new THREE.BufferGeometry();
      const edgeMaterial = relighting?.edgeMaterial ?? new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { tint: { value: new THREE.Color('#b8c8ce') } },
        vertexShader: `varying float worldY; void main(){ worldY=position.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          uniform vec3 tint;
          varying float worldY;
          void main() {
            gl_FragColor = vec4(tint, 0.65 * (1.0 - smoothstep(5.65, 6.85, -worldY)));
            #include <colorspace_fragment>
          }
        `,
      });
      const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      edges.frustumCulled = false;
      scene.add(edges);
      let edgeVertices: number[] = [];
      let edgePositions = new Float32Array();
      let topology = -1;
      const rebuild = () => {
        if (topology === physics.topologyVersion) return;
        topology = physics.topologyVersion;
        const faces = physics.indices();
        geometry.setIndex(faces);
        const counts = new Map<string, { a: number; b: number; count: number }>();
        for (let i = 0; i < faces.length; i += 3) {
          for (let j = 0; j < 3; j++) {
            const a = faces[i + j], b = faces[i + (j + 1) % 3];
            const key = a < b ? `${a}:${b}` : `${b}:${a}`;
            const edge = counts.get(key);
            if (edge) edge.count++; else counts.set(key, { a, b, count: 1 });
          }
        }
        // Keep the unbroken photograph seamless; add threads only after damage.
        edgeVertices = physics.brokenCount ? Array.from(counts.values()).filter(e => e.count === 1).flatMap(e => [e.a, e.b]) : [];
        edgePositions = new Float32Array(edgeVertices.length * 3);
        edgeGeometry.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3).setUsage(THREE.DynamicDrawUsage));
        canvas.dataset.fabricBroken = String(physics.brokenCount);
      };
      const repair = () => { stopInvitation(); physics.repair(); rebuild(); activeUntil = 0; wake(); };
      let dragging = false;
      let pointer = -1;
      let lastPoint: Point | null = null;
      const location = (e: PointerEvent): Point => {
        const rect = root.getBoundingClientRect();
        return [(e.clientX - rect.left - dimensions.left) / (dimensions.scale * 100),
          -(e.clientY - rect.top - dimensions.top) / (dimensions.scale * 100), 0];
      };
      const down = (e: PointerEvent) => {
        if (!e.isPrimary) { up(); return; }
        if (dragging || e.button !== 0 || (e.target instanceof Element && e.target.closest('a'))) return;
        stopInvitation();
        wake(7);
        const point = location(e);
        dragging = true;
        pointer = e.pointerId;
        lastPoint = point;
        interaction.dataset.dragging = 'true';
        root.setPointerCapture(pointer);
        e.preventDefault();
      };
      const move = (e: PointerEvent) => {
        if (!dragging || e.pointerId !== pointer) return;
        const point = location(e);
        if (lastPoint) {
          const radius = Math.max(0.012, (e.pointerType === 'touch' ? 4 : 1.3) / (dimensions.scale * 100));
          physics.cut(lastPoint, point, radius);
          rebuild();
          wake(7);
        }
        lastPoint = point;
        e.preventDefault();
      };
      const up = (e?: PointerEvent) => {
        if (!dragging || (e && e.pointerId !== pointer)) return;
        physics.release();
        if (root.hasPointerCapture(pointer)) root.releasePointerCapture(pointer);
        dragging = false;
        interaction.dataset.dragging = 'false';
        lastPoint = null;
      };
      const keyboard = (e: KeyboardEvent) => {
        if (e.key === 'r' || e.key === 'R') { repair(); e.preventDefault(); }
        if (e.key === 'Enter' || e.key === ' ') {
          stopInvitation();
          physics.cut([0.76, -2.48, 0], [2.87, -2.48, 0], 0.03);
          rebuild(); wake(7); e.preventDefault();
        }
      };
      root.addEventListener('pointerdown', down);
      root.addEventListener('pointermove', move);
      root.addEventListener('pointerup', up);
      root.addEventListener('pointercancel', up);
      root.addEventListener('lostpointercapture', up);
      interaction.addEventListener('keydown', keyboard);
      let frameId = 0;
      let last = 0;
      let lost = false;
      let activeUntil = 0;
      let settlingRemaining = 0;
      const passing = lighting ? new PassingHeadlights() : null;
      let passingElapsed: number | null = null;
      let passingTimer: ReturnType<typeof setTimeout> | null = null;
      let passingDue = 0;
      let passingRemaining = passing ? passing.nextDelay() * 1000 : 0;
      const schedulePassing = (delay: number) => {
        if (!passing || lost || cancelled) return;
        if (passingTimer !== null) clearTimeout(passingTimer);
        passingRemaining = delay;
        passingTimer = null;
        if (document.hidden) return;
        passingDue = performance.now() + delay;
        passingTimer = setTimeout(() => {
          passingTimer = null;
          passingElapsed = 0;
          wake();
        }, delay);
      };
      const animate = (now: number) => {
        frameId = 0;
        if (lost) return;
        const dt = last ? Math.min((now - last) / 1000, 0.04) : 1 / 60;
        last = now;
        // A distant car changes the light, not the settled fabric's pose.
        if (dragging || now < activeUntil) physics.step(dt);
        if (invitationTime !== null) {
          if (invitationTime < 0) {
            try { sessionStorage.setItem('mqn-sign-invited-v1', '1'); } catch { /* Storage is optional. */ }
          }
          invitationTime += dt;
          const progress = Math.max(0, Math.min(1, invitationTime / 2.4));
          physics.invite(progress);
          canvas.dataset.fabricInvitation = progress >= 1 ? 'finished' : progress.toFixed(2);
          if (progress >= 1) invitationTime = null;
        }
        rebuild();
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        for (let i = 0; i < edgeVertices.length; i++) {
          const p = edgeVertices[i] * 3;
          edgePositions[i * 3] = physics.positions[p];
          edgePositions[i * 3 + 1] = physics.positions[p + 1];
          edgePositions[i * 3 + 2] = physics.positions[p + 2] + 0.002;
        }
        if (edgeGeometry.attributes.position) edgeGeometry.attributes.position.needsUpdate = true;
        if (passing && passingElapsed !== null) {
          passingElapsed += dt;
          const light = passing.sample(passingElapsed);
          const strength = light.strength * 0.75;
          relighting?.setPassingLight(light.position, strength);
          headlightWash?.setPassingLight(light.position, strength);
          canvas.dataset.headlights = light.progress.toFixed(3);
          if (light.progress >= 1) {
            passingElapsed = null;
            canvas.dataset.headlights = 'waiting';
            schedulePassing(passing.nextDelay() * 1000);
          }
        }
        relighting?.update();
        renderer.render(scene, camera);
        canvas.dataset.fabricState = 'ready';
        interaction.tabIndex = 0;
        if (!document.hidden && (dragging || invitationTime !== null || passingElapsed !== null || now < activeUntil)) frameId = requestAnimationFrame(animate);
        else last = 0;
      };
      wake = (seconds = 0) => {
        activeUntil = Math.max(activeUntil, performance.now() + seconds * 1000);
        if (!frameId && !document.hidden && !lost) frameId = requestAnimationFrame(animate);
      };
      const visibility = () => {
        cancelAnimationFrame(frameId); frameId = 0;
        up(); last = 0;
        if (document.hidden) {
          settlingRemaining = Math.max(0, activeUntil - performance.now());
          activeUntil = 0;
        }
        if (document.hidden && passingTimer !== null) {
          passingRemaining = Math.max(0, passingDue - performance.now());
          clearTimeout(passingTimer); passingTimer = null;
        }
        if (!document.hidden && !lost) {
          activeUntil = performance.now() + settlingRemaining;
          settlingRemaining = 0;
          if (passingElapsed === null) schedulePassing(passingRemaining);
          wake();
        }
      };
      const contextLost = (e: Event) => {
        e.preventDefault(); lost = true; up(); cancelAnimationFrame(frameId);
        if (passingTimer !== null) clearTimeout(passingTimer);
        canvas.dataset.fabricState = 'unavailable';
        interaction.tabIndex = -1;
      };
      document.addEventListener('visibilitychange', visibility);
      canvas.addEventListener('webglcontextlost', contextLost);
      rebuild();
      if (passing) {
        canvas.dataset.headlights = 'waiting';
        schedulePassing(passingRemaining);
      }
      frameId = requestAnimationFrame(animate);
      teardown = () => {
        cancelAnimationFrame(frameId);
        if (passingTimer !== null) clearTimeout(passingTimer);
        document.removeEventListener('visibilitychange', visibility);
        canvas.removeEventListener('webglcontextlost', contextLost);
        root.removeEventListener('pointerdown', down);
        root.removeEventListener('pointermove', move);
        root.removeEventListener('pointerup', up);
        root.removeEventListener('pointercancel', up);
        root.removeEventListener('lostpointercapture', up);
        interaction.removeEventListener('keydown', keyboard);
        geometry.dispose(); texture.dispose(); backingGeometry.dispose(); edgeGeometry.dispose();
        if (relighting) relighting.dispose();
        else { material.dispose(); backingMaterial.dispose(); edgeMaterial.dispose(); }
        headlightWash?.dispose();
        renderer.dispose();
      };
    })();
    return () => { cancelled = true; observer.disconnect(); teardown(); };
  }, [lighting]);

  return (
    <div ref={rootRef} className={styles.scene} data-lighting={lighting ? 'lamps' : 'original'}>
      <div ref={photographRef} className={styles.photograph} data-door-active={doorActive}>
        <Image src={PHOTO} width={610} height={710} priority unoptimized draggable={false}
          alt="A nighttime street with a lit fabric sign reading Nothing lasts forever above the buildings." />
        {lighting && <DoorSpill active={doorActive} />}
        <svg className={styles.doorLight} viewBox="0 0 610 710" aria-hidden="true">
          <defs>
            <clipPath id={`${lightId}-opening`}>
              <path d="M520 532 L536 535 L536 585 L522 604 Z M538 530 L564 531 L564 540 L540 533 Z" />
            </clipPath>
            <filter id={`${lightId}-bright`} colorInterpolationFilters="sRGB">
              <feComponentTransfer>
                <feFuncR type="linear" slope="2.2" intercept="0.025" />
                <feFuncG type="linear" slope="2.25" intercept="0.035" />
                <feFuncB type="linear" slope="2.15" intercept="0.025" />
              </feComponentTransfer>
            </filter>
            <filter id={`${lightId}-bloom`} x="-60%" y="-40%" width="220%" height="180%">
              <feGaussianBlur stdDeviation="3.2" />
            </filter>
            <mask id={`${lightId}-occlusion`} maskUnits="userSpaceOnUse" x="495" y="510" width="95" height="125">
              <rect x="495" y="510" width="95" height="125" fill="white" />
              <path d="M536.5 534 L566 542 L566 599 L537 585 Z" fill="black" />
            </mask>
          </defs>
          <g mask={`url(#${lightId}-occlusion)`}>
            <path className={styles.bloom} d="M521 531 L536 534 L536 586 L522 605 Z M538 531 L565 532 L565 540 L540 534 Z"
              fill="#e1f5d8" filter={`url(#${lightId}-bloom)`} />
            <image className={styles.opening} href={PHOTO} width="610" height="710"
              clipPath={`url(#${lightId}-opening)`} filter={`url(#${lightId}-bright)`} />
            <path className={styles.jamb} d="M519 606 L518.5 531 L537 530.5 M565.5 531.5 L566.5 600"
              fill="none" stroke="#deedd5" strokeWidth="1.3" />
          </g>
        </svg>
        <DoorLink href={site.instagramUrl} label={`Enter the doorway: @${site.handle} on Instagram`}
          onActiveChange={setDoorActive} />
      </div>
      <canvas ref={canvasRef} className={styles.canvas} aria-label="Interactive fabric sign" data-fabric-broken="0" />
      <div ref={interactionRef} className={styles.interaction} tabIndex={-1}
        role="application" aria-label="Nothing lasts forever. Swipe to cut the fabric. Press Enter to cut across the middle; R to reset." />
    </div>
  );
}
