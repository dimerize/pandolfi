import * as THREE from 'three';

const SHADOW_SIZE = 512;
const BACKING_Z = -0.08;
const LAMP_POSITIONS = [
  new THREE.Vector3(1.28, -3.75, 0.85),
  new THREE.Vector3(2.20, -3.77, 0.75),
] as const;

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
  }
`;

const CLOTH = /* glsl */ `
  uniform sampler2D uPhoto;
  uniform vec3 uLamp0;
  uniform vec3 uLamp1;
  uniform vec3 uPassingPosition;
  uniform float uPassingStrength;
  varying vec2 vUv;
  varying vec3 vWorld;
  varying vec3 vNormal;

  float lamp(vec3 at, vec3 n, vec3 lightPosition) {
    vec3 ray = lightPosition - at;
    float d2 = dot(ray, ray);
    return max(dot(n, normalize(ray)), 0.0) / (1.0 + d2 * 0.82);
  }

  float passingLamp(vec3 at, vec3 n) {
    vec3 ray = uPassingPosition - at;
    float d2 = dot(ray, ray);
    return max(dot(n, normalize(ray)), 0.0) * 12.0 / (1.0 + d2 * 0.15);
  }

  void main() {
    vec3 ink = texture2D(uPhoto, vUv).rgb;
    vec3 n = normalize(vNormal);
    // Scraps disappear into the street before reaching the photograph's
    // lower edge at y=-7.1. The side fade only matters if a piece flies out.
    float foregroundFade = 1.0 - smoothstep(5.65, 6.85, -vWorld.y);
    float sideFade = smoothstep(0.0, 0.25, vWorld.x)
      * (1.0 - smoothstep(5.85, 6.10, vWorld.x));
    float alpha = foregroundFade * sideFade;
    if (alpha <= 0.001) discard;
    vec3 color;
    if (gl_FrontFacing) {
      float illuminated = lamp(vWorld, n, uLamp0) + lamp(vWorld, n, uLamp1);
      // At rest this cancels exactly. The source photograph supplies its own
      // photographed exposure; only physical movement changes illumination.
      vec3 flatPoint = vec3(vWorld.xy, 0.0);
      float photographed = lamp(flatPoint, vec3(0.0, 0.0, 1.0), uLamp0)
        + lamp(flatPoint, vec3(0.0, 0.0, 1.0), uLamp1);
      float fold = clamp((illuminated - photographed) * 1.15, -0.50, 0.42);
      float grazing = pow(1.0 - abs(n.z), 1.8);
      float fuzz = grazing * (0.035 + illuminated * 0.14);
      color = max(vec3(0.0), ink * (1.0 + fold) + vec3(0.65, 0.80, 0.84) * fuzz);
      if (uPassingStrength > 0.001) {
        float passing = min(0.8, passingLamp(vWorld, n)) * uPassingStrength;
        // A warm grazing wash follows the moving source, retaining the ink's
        // photographic texture instead of blanketing it with a flat flash.
        color += ink * passing * 0.38 + vec3(0.74, 0.72, 0.60) * passing * 0.08;
      }
    } else {
      // The reverse reads as dull cloth with only a trace of the printed ink.
      float transmitted = lamp(vWorld, -n, uLamp0) + lamp(vWorld, -n, uLamp1);
      color = vec3(0.095, 0.12, 0.13) + ink * 0.16
        + vec3(0.16, 0.22, 0.25) * min(transmitted, 0.7);
      if (uPassingStrength > 0.001) {
        float through = passingLamp(vWorld, vec3(0.0, 0.0, 1.0)) * uPassingStrength;
        color += vec3(0.20, 0.20, 0.16) * min(through, 0.8);
      }
    }
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

const BACKING = /* glsl */ `
  uniform sampler2D uShadow0;
  uniform sampler2D uShadow1;
  uniform sampler2D uShadowPassing;
  uniform mat4 uShadowMatrix0;
  uniform mat4 uShadowMatrix1;
  uniform mat4 uShadowMatrixPassing;
  uniform vec2 uShadowTexel;
  uniform vec3 uLamp0;
  uniform vec3 uLamp1;
  uniform vec3 uPassingPosition;
  uniform float uPassingStrength;
  uniform float uPassingShadowReady;
  uniform float uShadowsReady;
  varying vec3 vWorld;

  float linearDepth(float d, float farPlane) {
    const float nearPlane = 0.05;
    return nearPlane * farPlane / max(0.001, farPlane - d * (farPlane - nearPlane));
  }

  float visibility(sampler2D depthMap, mat4 shadowMatrix, float farPlane, float bias) {
    if (uShadowsReady < 0.5) return 1.0;
    vec4 projected = shadowMatrix * vec4(vWorld, 1.0);
    vec3 q = projected.xyz / projected.w;
    if (q.x <= 0.002 || q.x >= 0.998 || q.y <= 0.002 || q.y >= 0.998 ||
        q.z <= 0.0 || q.z >= 1.0) return 1.0;
    float blockerDepth = texture2D(depthMap, q.xy).r;
    float separation = max(0.0, linearDepth(q.z, farPlane) - linearDepth(blockerDepth, farPlane));
    // The shadow is crisp against the backing and broadens as torn fabric
    // lifts away from it. The sample radius follows actual depth separation.
    float radius = clamp(0.7 + separation * 5.0, 0.7, 4.0);
    float covered = 0.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 sampleUv = q.xy + vec2(float(x), float(y)) * uShadowTexel * radius;
        float surface = texture2D(depthMap, sampleUv).r;
        covered += step(surface + bias, q.z);
      }
    }
    return 1.0 - covered / 9.0;
  }

  float radiance(vec3 lightPosition) {
    vec3 ray = lightPosition - vWorld;
    float distanceSquared = dot(ray, ray);
    float front = max(ray.z * inversesqrt(distanceSquared), 0.0);
    return front / (1.0 + distanceSquared * 0.82);
  }

  float passingRadiance() {
    vec3 ray = uPassingPosition - vWorld;
    float distanceSquared = dot(ray, ray);
    float front = max(ray.z * inversesqrt(distanceSquared), 0.0);
    return front * 12.0 / (1.0 + distanceSquared * 0.15);
  }

  void main() {
    float grain = fract(sin(dot(floor(vWorld.xy * 450.0), vec2(12.9898, 78.233))) * 43758.5453);
    vec3 board = vec3(0.009, 0.016, 0.018) * (0.88 + grain * 0.24);
    // A small fraction of each lamp bounces within the sign recess even
    // where direct light is occluded. Direct geometry shadows still retain
    // most of their contrast, while a cut cannot read as a featureless void.
    float first = radiance(uLamp0) * (0.20 + 0.80 * visibility(uShadow0, uShadowMatrix0, 8.0, 0.00025));
    float second = radiance(uLamp1) * (0.20 + 0.80 * visibility(uShadow1, uShadowMatrix1, 8.0, 0.00025));
    vec3 bounced = vec3(0.31, 0.42, 0.49) * first * 1.55
      + vec3(0.32, 0.42, 0.47) * second * 1.4;
    // Light through a cut lands on the backing; soft texture retains the
    // nighttime photograph's slight grain instead of forming a flat fill.
    // The recess stays charcoal when exposed; it should never read as a
    // second illuminated screen behind the printed cloth.
    vec3 color = board + bounced * 0.16 * (0.95 + grain * 0.10);
    if (uPassingStrength > 0.001) {
      float passingVisibility = uPassingShadowReady > 0.5
        ? visibility(uShadowPassing, uShadowMatrixPassing, 20.0, 0.000045) : 1.0;
      float passing = min(0.75, passingRadiance()) * uPassingStrength;
      // The low source casts a traveling, long-edged shadow from lifted flaps.
      // A little indirect bounce keeps the hole legible when direct light is blocked.
      color += vec3(0.30, 0.32, 0.28) * passing
        * (0.12 + 0.88 * passingVisibility) * (0.96 + grain * 0.08);
    }
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

function shadowTarget(): THREE.WebGLRenderTarget {
  const target = new THREE.WebGLRenderTarget(SHADOW_SIZE, SHADOW_SIZE, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: true,
    stencilBuffer: false,
  });
  target.depthTexture = new THREE.DepthTexture(SHADOW_SIZE, SHADOW_SIZE, THREE.UnsignedShortType);
  target.depthTexture.minFilter = THREE.NearestFilter;
  target.depthTexture.magFilter = THREE.NearestFilter;
  return target;
}

/**
 * Two lamp positions illuminate only the photographed sign. Both cast live
 * geometry shadows into the backing; cuts and lifted folds update the maps.
 * The host owns the cloth, backing, and edge meshes and calls update() after
 * its vertex/index buffers change, before rendering the main scene.
 */
export class SignRelighting {
  readonly clothMaterial: THREE.ShaderMaterial;
  readonly backingMaterial: THREE.ShaderMaterial;
  readonly edgeMaterial: THREE.ShaderMaterial;

  private readonly renderer: THREE.WebGLRenderer;
  private readonly shadowScene = new THREE.Scene();
  private readonly shadowMesh: THREE.Mesh;
  private readonly shadowMaterial: THREE.MeshBasicMaterial;
  private readonly targets = [shadowTarget(), shadowTarget()] as const;
  private readonly passingTarget = shadowTarget();
  private readonly cameras: [THREE.PerspectiveCamera, THREE.PerspectiveCamera];
  private readonly matrices = [new THREE.Matrix4(), new THREE.Matrix4()] as const;
  private readonly passingPosition = new THREE.Vector3(1.8, -7.45, 0.75);
  private readonly passingCamera = new THREE.PerspectiveCamera(45, 1, 0.05, 20);
  private readonly passingMatrix = new THREE.Matrix4();
  private passingStrength = 0;
  private readonly bias = new THREE.Matrix4().set(
    0.5, 0, 0, 0.5,
    0, 0.5, 0, 0.5,
    0, 0, 0.5, 0.5,
    0, 0, 0, 1,
  );
  private disposed = false;

  constructor(renderer: THREE.WebGLRenderer, geometry: THREE.BufferGeometry, texture: THREE.Texture) {
    this.renderer = renderer;
    this.shadowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    this.shadowMesh = new THREE.Mesh(geometry, this.shadowMaterial);
    this.shadowMesh.frustumCulled = false;
    this.shadowScene.add(this.shadowMesh);

    this.cameras = [0, 1].map(index => {
      const camera = new THREE.PerspectiveCamera(105, 1, 0.05, 8);
      camera.position.copy(LAMP_POSITIONS[index]);
      camera.lookAt(1.80, -2.46, BACKING_Z);
      camera.updateMatrixWorld();
      this.matrices[index].copy(this.bias)
        .multiply(camera.projectionMatrix).multiply(camera.matrixWorldInverse);
      return camera;
    }) as [THREE.PerspectiveCamera, THREE.PerspectiveCamera];
    this.passingCamera.position.copy(this.passingPosition);
    this.passingCamera.lookAt(1.80, -2.46, BACKING_Z);
    this.passingCamera.updateMatrixWorld();
    this.passingMatrix.copy(this.bias)
      .multiply(this.passingCamera.projectionMatrix).multiply(this.passingCamera.matrixWorldInverse);

    this.clothMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPhoto: { value: texture },
        uLamp0: { value: LAMP_POSITIONS[0] },
        uLamp1: { value: LAMP_POSITIONS[1] },
        uPassingPosition: { value: this.passingPosition },
        uPassingStrength: { value: 0 },
      },
      vertexShader: VERTEX,
      fragmentShader: CLOTH,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: true,
    });
    this.backingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uShadow0: { value: this.targets[0].depthTexture },
        uShadow1: { value: this.targets[1].depthTexture },
        uShadowPassing: { value: this.passingTarget.depthTexture },
        uShadowMatrix0: { value: this.matrices[0] },
        uShadowMatrix1: { value: this.matrices[1] },
        uShadowMatrixPassing: { value: this.passingMatrix },
        uShadowTexel: { value: new THREE.Vector2(1 / SHADOW_SIZE, 1 / SHADOW_SIZE) },
        uLamp0: { value: LAMP_POSITIONS[0] },
        uLamp1: { value: LAMP_POSITIONS[1] },
        uPassingPosition: { value: this.passingPosition },
        uPassingStrength: { value: 0 },
        uPassingShadowReady: { value: 0 },
        uShadowsReady: { value: 0 },
      },
      vertexShader: VERTEX,
      fragmentShader: BACKING,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
    this.edgeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPassingPosition: { value: this.passingPosition },
        uPassingStrength: { value: 0 },
      },
      vertexShader: `
        varying vec3 vWorld;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: `
        uniform vec3 uPassingPosition;
        uniform float uPassingStrength;
        varying vec3 vWorld;
        void main() {
          float foregroundFade = 1.0 - smoothstep(5.65, 6.85, -vWorld.y);
          float sideFade = smoothstep(0.0, 0.25, vWorld.x)
            * (1.0 - smoothstep(5.85, 6.10, vWorld.x));
          float alpha = foregroundFade * sideFade * 0.76;
          if (alpha <= 0.001) discard;
          vec3 color = vec3(0.65, 0.73, 0.76);
          if (uPassingStrength > 0.001) {
            vec3 ray = uPassingPosition - vWorld;
            float d2 = dot(ray, ray);
            float wash = max(ray.z * inversesqrt(d2), 0.0) * 12.0
              / (1.0 + d2 * 0.15) * uPassingStrength;
            color += vec3(0.14, 0.13, 0.08) * min(wash, 0.8);
          }
          gl_FragColor = vec4(color, alpha);
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }

  /**
   * Position is in billboard world units (photo pixels / 100, downward y is
   * negative). The host may sweep x from -3 to 9 at y=-7.45, z=0.75 and ramp
   * strength from 0 to about 0.75 and back. Zero restores the idle rendering.
   */
  setPassingLight(position: { x: number; y: number; z: number }, strength: number): void {
    if (this.disposed) return;
    const validPosition = Number.isFinite(position.x) && Number.isFinite(position.y) && Number.isFinite(position.z);
    const nextStrength = validPosition && Number.isFinite(strength)
      ? THREE.MathUtils.clamp(strength, 0, 1) : 0;
    this.passingStrength = nextStrength;
    this.clothMaterial.uniforms.uPassingStrength.value = nextStrength;
    this.backingMaterial.uniforms.uPassingStrength.value = nextStrength;
    this.edgeMaterial.uniforms.uPassingStrength.value = nextStrength;
    if (nextStrength <= 0.001) {
      this.backingMaterial.uniforms.uPassingShadowReady.value = 0;
      return;
    }
    this.passingPosition.set(position.x, position.y, position.z);
    this.passingCamera.position.copy(this.passingPosition);
    this.passingCamera.lookAt(1.80, -2.46, BACKING_Z);
    this.passingCamera.updateMatrixWorld();
    this.passingMatrix.copy(this.bias)
      .multiply(this.passingCamera.projectionMatrix).multiply(this.passingCamera.matrixWorldInverse);
  }

  update(): void {
    if (this.disposed) return;
    const oldTarget = this.renderer.getRenderTarget();
    const oldColor = this.renderer.getClearColor(new THREE.Color()).clone();
    const oldAlpha = this.renderer.getClearAlpha();
    const oldAutoClear = this.renderer.autoClear;
    try {
      this.renderer.autoClear = true;
      this.renderer.setClearColor(0xffffff, 1);
      for (let i = 0; i < 2; i++) {
        this.renderer.setRenderTarget(this.targets[i]);
        this.renderer.clear(true, true, true);
        this.renderer.render(this.shadowScene, this.cameras[i]);
      }
      this.backingMaterial.uniforms.uShadowsReady.value = 1;
      if (this.passingStrength > 0.001) {
        this.renderer.setRenderTarget(this.passingTarget);
        this.renderer.clear(true, true, true);
        this.renderer.render(this.shadowScene, this.passingCamera);
        this.backingMaterial.uniforms.uPassingShadowReady.value = 1;
      } else {
        this.backingMaterial.uniforms.uPassingShadowReady.value = 0;
      }
    } catch {
      // Depth textures are optional on a few older WebGL contexts. The two
      // lamps still illuminate cloth and backing without geometry shadows.
      this.backingMaterial.uniforms.uShadowsReady.value = 0;
      this.backingMaterial.uniforms.uPassingShadowReady.value = 0;
    } finally {
      this.renderer.setRenderTarget(oldTarget);
      this.renderer.setClearColor(oldColor, oldAlpha);
      this.renderer.autoClear = oldAutoClear;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.clothMaterial.dispose();
    this.backingMaterial.dispose();
    this.edgeMaterial.dispose();
    this.shadowMaterial.dispose();
    for (const target of this.targets) target.dispose();
    this.passingTarget.dispose();
  }
}
