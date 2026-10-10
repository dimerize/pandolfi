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

  void main() {
    vec2 point = vPhotoPoint;
    float spread = 2.25 + 0.25 * clamp(uPassingPosition.z, 0.0, 1.5);
    float travel = bell(point.x, uPassingPosition.x, spread);

    // The headlights originate below the frame. Their wash reaches the
    // pavement first, then the storefront and a small part of the facade.
    float pavement = bell(point.y, uPassingPosition.y + 1.25, 0.84);
    float storefront = bell(point.y, uPassingPosition.y + 2.18, 0.68);
    float facade = bell(point.y, uPassingPosition.y + 3.05, 0.78);
    float belowSky = 1.0 - smoothstep(-4.08, -3.47, point.y);
    float footprint = travel * belowSky *
      (0.76 * pavement + 0.68 * storefront + 0.15 * facade);

    float doorHeight = bell(point.y, -5.65, 0.58);
    float leftJamb = bell(point.x, 5.20, 0.095);
    float rightJamb = bell(point.x, 5.68, 0.085);
    float jamb = travel * doorHeight * (leftJamb + rightJamb) * 0.28;
    float occlusion = 1.0 - 0.88 * doorLeaf(point);
    float exposure = clamp((footprint + jamb) * occlusion, 0.0, 1.0);
    float alpha = clamp(uStrength * exposure * 0.56, 0.0, 0.72);
    if (alpha < 0.001) discard;

    vec3 ink = texture2D(uPhoto, vUv).rgb;
    // Lift the existing pixels rather than laying a flat beam over them:
    // cracks, stone, glass, and pavement keep their photographed contrast.
    vec3 warmed = ink * vec3(1.82, 1.72, 1.49);
    float detail = dot(ink, vec3(0.2126, 0.7152, 0.0722));
    warmed += vec3(0.70, 0.65, 0.51) * (0.013 + detail * 0.075);
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
