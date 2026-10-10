import * as THREE from 'three';

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vPhotoPoint;

  void main() {
    vUv = uv;
    vPhotoPoint = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uPhoto;
  uniform vec3 uPassingPosition;
  uniform float uStrength;
  varying vec2 vUv;
  varying vec2 vPhotoPoint;

  float bell(float point, float center, float radius) {
    float d = (point - center) / radius;
    return exp(-d * d);
  }

  float edgeDistance(vec2 point, vec2 a, vec2 b) {
    vec2 edge = b - a;
    return -(edge.x * (point.y - a.y) - edge.y * (point.x - a.x)) / length(edge);
  }

  // The opaque leaf blocks most of the passing light. The reveal and jambs
  // remain available to catch it, as they do in the source photograph.
  float doorLeaf(vec2 point) {
    vec2 a = vec2(5.365, -5.34);
    vec2 b = vec2(5.66, -5.42);
    vec2 c = vec2(5.66, -5.99);
    vec2 d = vec2(5.37, -5.85);
    float margin = min(min(edgeDistance(point, a, b), edgeDistance(point, b, c)),
      min(edgeDistance(point, c, d), edgeDistance(point, d, a)));
    return smoothstep(-0.012, 0.022, margin);
  }

  float buildingSurface(vec2 point) {
    float x = point.x;
    // Trace the photographed roofline, rather than cutting all light off at
    // storefront height. The billboard itself occludes this layer in depth.
    float roof;
    if (x < 0.77) roof = mix(1.86, 1.64, x / 0.77);
    else if (x < 2.80) roof = mix(1.43, 1.48, (x - 0.77) / 2.03);
    else if (x < 3.48) roof = mix(1.19, 1.22, (x - 2.80) / 0.68);
    else if (x < 5.15) roof = mix(1.16, 1.24, (x - 3.48) / 1.67);
    else if (x < 5.80) roof = mix(1.14, 1.42, (x - 5.15) / 0.65);
    else roof = 0.93;
    return smoothstep(roof, roof + 0.035, -point.y);
  }

  float headlamp(vec2 point, float sourceX) {
    float rise = clamp((point.y - uPassingPosition.y) / 6.3, 0.0, 1.0);
    // Each beam fans upward from an offscreen source. Its angled leading
    // edge traverses the upper wall before the pool reaches the pavement.
    float center = sourceX + (3.05 - sourceX) * rise * 0.18;
    float width = 0.94 + rise * 0.50;
    return bell(point.x, center, width) * (1.0 - rise * 0.18);
  }

  void main() {
    vec2 point = vPhotoPoint;
    float first = headlamp(point, uPassingPosition.x - 0.62);
    float second = headlamp(point, uPassingPosition.x + 0.62);
    float travel = first + second * 0.92;
    float groundFalloff = smoothstep(-7.10, -6.45, point.y);
    float footprint = travel * buildingSurface(point) * groundFalloff;

    float doorHeight = bell(point.y, -5.65, 0.58);
    float leftJamb = bell(point.x, 5.20, 0.095);
    float rightJamb = bell(point.x, 5.68, 0.085);
    float jamb = travel * doorHeight * (leftJamb + rightJamb) * 0.20;
    float occlusion = 1.0 - 0.88 * doorLeaf(point);
    float exposure = clamp((footprint + jamb) * occlusion, 0.0, 1.0);
    float alpha = clamp(uStrength * exposure * 0.88, 0.0, 0.78);
    if (alpha < 0.001) discard;

    vec3 ink = texture2D(uPhoto, vUv).rgb;
    // Lift the existing pixels rather than laying a flat beam over them:
    // cracks, stone, glass, and pavement keep their photographed contrast.
    float detail = dot(ink, vec3(0.2126, 0.7152, 0.0722));
    // Dark masonry takes the light; existing lit windows and lamps retain
    // their exposure instead of turning into a white flash.
    float response = 1.0 - smoothstep(0.18, 0.62, detail);
    vec3 warmed = ink * (vec3(1.0) + vec3(2.3, 2.15, 1.85) * response);
    warmed += vec3(0.92, 0.88, 0.76) * (0.006 + detail * 0.05) * response;
    gl_FragColor = vec4(warmed, alpha);
    #include <colorspace_fragment>
  }
`;

/** A moving, photo-derived wash from a car that remains outside the frame. */
export class HeadlightWash {
  readonly mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;

  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.ShaderMaterial;

  constructor(texture: THREE.Texture) {
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      0, -7.1, -0.12,
      6.1, -7.1, -0.12,
      6.1, 0, -0.12,
      0, 0, -0.12,
    ], 3));
    this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute([
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    ], 2));
    this.geometry.setIndex([0, 1, 2, 0, 2, 3]);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uPhoto: { value: texture },
        uPassingPosition: { value: new THREE.Vector3(0, -7.45, 0.75) },
        uStrength: { value: 0 },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.visible = false;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1;
  }

  setPassingLight(position: { x: number; y: number; z: number }, strength: number): void {
    const valid = Number.isFinite(position.x) && Number.isFinite(position.y) &&
      Number.isFinite(position.z) && Number.isFinite(strength);
    const level = valid ? Math.max(0, Math.min(1, strength)) : 0;
    this.material.uniforms.uStrength.value = level;
    this.mesh.visible = level > 0.0001;
    if (valid) {
      (this.material.uniforms.uPassingPosition.value as THREE.Vector3)
        .set(position.x, position.y, position.z);
    }
  }

  dispose(): void {
    this.mesh.visible = false;
    this.geometry.dispose();
    this.material.dispose();
  }
}
