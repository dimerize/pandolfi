type Vec3 = [number, number, number];

type Spring = {
  a: number;
  b: number;
  rest: number;
  stiffness: number;
  kind: 'structural' | 'shear' | 'bend';
  alive: boolean;
};

export type BillboardSnapshot = {
  version: 1;
  columns: number;
  rows: number;
  broken: number[];
  faces: number[];
  positions: number[];
};

const FLOOR_Y = -8.5;
const PHOTO_WIDTH = 610;
const PHOTO_HEIGHT = 710;
const TL: [number, number] = [79, 143];
const TR: [number, number] = [278, 148];
const BR: [number, number] = [282, 351];
const BL: [number, number] = [85, 346];

/** Physical mesh for the photographed sign; the rest of the photo stays still. */
export class BillboardPhysics {
  readonly positions: Float32Array;
  readonly uv: Float32Array;
  readonly original: Float32Array;
  readonly pinIndices: number[];

  private readonly previous: Float32Array;
  private readonly springs: Spring[] = [];
  private readonly incident: number[][];
  private readonly triangles: number[] = [];
  private readonly faceAlive: Uint8Array;
  private readonly edgeFaces = new Map<string, number[]>();
  private readonly pinned: Uint8Array;
  private readonly anchored: Uint8Array;
  private readonly curl: Float32Array;
  private readonly kicked: Uint8Array;
  private readonly columns: number;
  private readonly rows: number;
  private readonly cellSize: number;
  private liveIndices: number[];
  private tornEdges: Array<{ a: number; b: number }> = [];
  private topology = 0;
  private grabbed: number | null = null;
  private target: Vec3 = [0, 0, 0];
  private time = 0;
  private activated = false;
  private damaged = false;

  constructor(options: { columns?: number; rows?: number } = {}) {
    this.columns = Math.max(4, Math.min(80, Math.floor(options.columns ?? 56)));
    this.rows = Math.max(4, Math.min(80, Math.floor(options.rows ?? 56)));
    const count = this.columns * this.rows;
    this.positions = new Float32Array(count * 3);
    this.uv = new Float32Array(count * 2);
    this.previous = new Float32Array(count * 3);
    this.pinned = new Uint8Array(count);
    this.anchored = new Uint8Array(count);
    this.curl = new Float32Array(count);
    this.kicked = new Uint8Array(count);
    this.anchored.fill(1);
    this.incident = Array.from({ length: count }, () => []);
    this.cellSize = Math.max(2.03 / (this.columns - 1), 2.03 / (this.rows - 1));

    for (let row = 0; row < this.rows; row++) {
      const v = row / (this.rows - 1);
      for (let col = 0; col < this.columns; col++) {
        const u = col / (this.columns - 1);
        const topX = TL[0] * (1 - u) + TR[0] * u;
        const topY = TL[1] * (1 - u) + TR[1] * u;
        const bottomX = BL[0] * (1 - u) + BR[0] * u;
        const bottomY = BL[1] * (1 - u) + BR[1] * u;
        const pixelX = topX * (1 - v) + bottomX * v;
        const pixelY = topY * (1 - v) + bottomY * v;
        const index = row * this.columns + col;
        const p = index * 3;
        this.positions[p] = pixelX / 100;
        this.positions[p + 1] = -pixelY / 100;
        this.positions[p + 2] = 0;
        this.uv[index * 2] = pixelX / PHOTO_WIDTH;
        this.uv[index * 2 + 1] = 1 - pixelY / PHOTO_HEIGHT;
      }
    }
    this.original = new Float32Array(this.positions);
    this.previous.set(this.positions);
    this.pinIndices = [0, this.columns - 1,
      (this.rows - 1) * this.columns, count - 1];
    for (const index of this.pinIndices) this.pinned[index] = 1;

    const spring = (a: number, b: number, stiffness: number, kind: Spring['kind']) => {
      const pa = a * 3;
      const pb = b * 3;
      const rest = Math.hypot(
        this.original[pb] - this.original[pa],
        this.original[pb + 1] - this.original[pa + 1],
      );
      const index = this.springs.length;
      this.springs.push({ a, b, rest, stiffness, kind, alive: true });
      this.incident[a].push(index);
      this.incident[b].push(index);
    };
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const a = row * this.columns + col;
        const boundary = row === 0 || row === this.rows - 1 ||
          col === 0 || col === this.columns - 1;
        if (col + 1 < this.columns) spring(a, a + 1, boundary ? 0.94 : 0.82, 'structural');
        if (row + 1 < this.rows) spring(a, a + this.columns,
          boundary ? 0.94 : 0.82, 'structural');
        if (col + 1 < this.columns && row + 1 < this.rows) {
          spring(a, a + this.columns + 1, 0.48, 'shear');
          spring(a + 1, a + this.columns, 0.48, 'shear');
        }
        if (col + 2 < this.columns) spring(a, a + 2, 0.26, 'bend');
        if (row + 2 < this.rows) spring(a, a + this.columns * 2, 0.26, 'bend');
      }
    }

    for (let row = 0; row < this.rows - 1; row++) {
      for (let col = 0; col < this.columns - 1; col++) {
        const a = row * this.columns + col;
        const b = a + 1;
        const c = a + this.columns;
        const d = c + 1;
        this.addFace(a, c, b);
        this.addFace(b, c, d);
      }
    }
    this.faceAlive = new Uint8Array(this.triangles.length / 3);
    this.faceAlive.fill(1);
    this.liveIndices = this.triangles.slice();
  }

  get topologyVersion(): number { return this.topology; }
  get brokenCount(): number { return this.tornEdges.length; }
  get brokenEdges(): Array<{ a: number; b: number }> { return this.tornEdges; }
  get grabIndex(): number | null { return this.grabbed; }

  indices(): number[] { return this.liveIndices; }

  grab(index: number, target: Vec3): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.pinned.length) return;
    if (this.pinned[index]) {
      const row = Math.floor(index / this.columns);
      const col = index % this.columns;
      const innerRow = row === 0 ? 1 : row === this.rows - 1 ? this.rows - 2 : row;
      const innerCol = col === 0 ? 1 : col === this.columns - 1 ? this.columns - 2 : col;
      index = innerRow * this.columns + innerCol;
    }
    this.grabbed = index;
    this.target = [...target];
    this.activated = true;
    this.placeGrab();
  }

  moveGrab(target: Vec3): void {
    if (this.grabbed === null) return;
    this.target = [...target];
    this.placeGrab();
  }

  release(): void { this.grabbed = null; }

  step(dtSeconds: number): void {
    if (!this.activated || !Number.isFinite(dtSeconds) || dtSeconds <= 0) return;
    const elapsed = Math.min(dtSeconds, 0.05);
    const substeps = Math.ceil(elapsed / (1 / 60));
    const dt = elapsed / substeps;
    for (let substep = 0; substep < substeps; substep++) {
      this.time += dt;
      for (let i = 0; i < this.pinned.length; i++) {
        if (this.pinned[i] || i === this.grabbed) continue;
        const p = i * 3;
        const x = this.positions[p];
        const y = this.positions[p + 1];
        const z = this.positions[p + 2];
        const px = this.previous[p];
        const py = this.previous[p + 1];
        const pz = this.previous[p + 2];
        this.previous[p] = x;
        this.previous[p + 1] = y;
        this.previous[p + 2] = z;
        const attached = this.anchored[i] !== 0;
        const damping = attached ? (this.damaged ? 0.966 : 0.94) : 0.985;
        this.positions[p] = x + (x - px) * damping;
        this.positions[p + 1] = y + (y - py) * damping +
          (attached ? (this.damaged ? -4.5 : 0) : -15) * dt * dt;
        this.positions[p + 2] = z + (z - pz) * damping +
          this.curl[i] * 5 * dt * dt +
          (attached ? 0 : 4 * Math.sin(this.time * 2.8 +
            this.original[p] * 2.4 + this.original[p + 1] * 1.7) * dt * dt);
        if (attached) {
          const tether = this.damaged ? 0.003 : 0.055;
          this.positions[p] += (this.original[p] - this.positions[p]) * tether;
          this.positions[p + 1] += (this.original[p + 1] - this.positions[p + 1]) * tether;
          this.positions[p + 2] += (this.original[p + 2] - this.positions[p + 2]) * tether;
        }
        this.curl[i] *= 0.981;
      }

      for (let iteration = 0; iteration < 6; iteration++) {
        for (const spring of this.springs) {
          if (!spring.alive) continue;
          const a = spring.a * 3;
          const b = spring.b * 3;
          const vx = this.positions[b] - this.positions[a];
          const vy = this.positions[b + 1] - this.positions[a + 1];
          const vz = this.positions[b + 2] - this.positions[a + 2];
          const length = Math.hypot(vx, vy, vz);
          if (length < 1e-7) continue;
          const moveA = !this.pinned[spring.a] && spring.a !== this.grabbed;
          const moveB = !this.pinned[spring.b] && spring.b !== this.grabbed;
          if (!moveA && !moveB) continue;
          const correction = (length - spring.rest) / length * spring.stiffness /
            (Number(moveA) + Number(moveB));
          if (moveA) {
            this.positions[a] += vx * correction;
            this.positions[a + 1] += vy * correction;
            this.positions[a + 2] += vz * correction;
          }
          if (moveB) {
            this.positions[b] -= vx * correction;
            this.positions[b + 1] -= vy * correction;
            this.positions[b + 2] -= vz * correction;
          }
        }
        this.constrainBacking();
        this.constrainFloor();
        this.placeGrab();
        this.restorePins();
      }
      this.capInertia(dt);
    }
  }

  cut(from: Vec3, to: Vec3, radius = 0.025): void {
    const r = Math.max(0.012, Math.min(0.2, radius));
    let changed = false;
    for (const spring of this.springs) {
      if (!spring.alive) continue;
      const a = spring.a * 3;
      const b = spring.b * 3;
      if (segmentDistance2D(from[0], from[1], to[0], to[1],
        this.positions[a], this.positions[a + 1],
        this.positions[b], this.positions[b + 1]) <= r) {
        this.breakSpring(spring);
        changed = true;
      }
    }
    const faceReach = r + this.cellSize * 0.3;
    for (let face = 0; face < this.faceAlive.length; face++) {
      if (!this.faceAlive[face]) continue;
      const offset = face * 3;
      const a = this.triangles[offset] * 3;
      const b = this.triangles[offset + 1] * 3;
      const c = this.triangles[offset + 2] * 3;
      const x = (this.positions[a] + this.positions[b] + this.positions[c]) / 3;
      const y = (this.positions[a + 1] + this.positions[b + 1] + this.positions[c + 1]) / 3;
      if (pointSegmentDistance2D(x, y, from[0], from[1], to[0], to[1]) <= faceReach) {
        this.faceAlive[face] = 0;
        changed = true;
      }
    }
    if (changed) {
      this.activated = true;
      this.damaged = true;
      this.kickCutEdges(from, to, r);
      this.rebuildConnectivity(true);
      this.rebuildIndices();
    }
  }

  repair(): void {
    this.positions.set(this.original);
    this.previous.set(this.original);
    for (const spring of this.springs) spring.alive = true;
    this.faceAlive.fill(1);
    this.anchored.fill(1);
    this.tornEdges = [];
    this.grabbed = null;
    this.time = 0;
    this.activated = false;
    this.damaged = false;
    this.curl.fill(0);
    this.kicked.fill(0);
    this.rebuildIndices();
  }

  snapshot(): BillboardSnapshot {
    const broken: number[] = [];
    const faces: number[] = [];
    for (let i = 0; i < this.springs.length; i++) {
      if (!this.springs[i].alive) broken.push(i);
    }
    for (let i = 0; i < this.faceAlive.length; i++) {
      if (!this.faceAlive[i]) faces.push(i);
    }
    return {
      version: 1,
      columns: this.columns,
      rows: this.rows,
      broken,
      faces,
      positions: Array.from(this.positions),
    };
  }

  restore(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false;
    const saved = value as Partial<BillboardSnapshot>;
    if (saved.version !== 1 || saved.columns !== this.columns ||
        saved.rows !== this.rows || !Array.isArray(saved.broken) ||
        !Array.isArray(saved.faces) || !Array.isArray(saved.positions) ||
        saved.broken.length > this.springs.length ||
        saved.faces.length > this.faceAlive.length ||
        saved.positions.length !== this.positions.length) return false;
    let last = -1;
    for (const index of saved.broken) {
      if (!Number.isInteger(index) || index <= last || index >= this.springs.length) return false;
      last = index;
    }
    last = -1;
    for (const index of saved.faces) {
      if (!Number.isInteger(index) || index <= last || index >= this.faceAlive.length) return false;
      last = index;
    }
    for (let i = 0; i < saved.positions.length; i++) {
      const coordinate = saved.positions[i];
      if (typeof coordinate !== 'number' || !Number.isFinite(coordinate) ||
          Math.abs(coordinate) > 32 || (i % 3 === 1 && coordinate < FLOOR_Y - 0.002)) return false;
    }
    this.positions.set(saved.positions);
    this.restorePins();
    this.previous.set(this.positions);
    for (const spring of this.springs) spring.alive = true;
    this.faceAlive.fill(1);
    this.tornEdges = [];
    for (const index of saved.broken) this.breakSpring(this.springs[index]);
    for (const index of saved.faces) this.faceAlive[index] = 0;
    this.grabbed = null;
    this.time = 0;
    this.activated = true;
    this.damaged = saved.broken.length > 0 || saved.faces.length > 0;
    this.curl.fill(0);
    this.kicked.fill(0);
    this.rebuildConnectivity(false);
    this.rebuildIndices();
    return true;
  }

  private addFace(a: number, b: number, c: number): void {
    const face = this.triangles.length / 3;
    this.triangles.push(a, b, c);
    for (const [u, v] of [[a, b], [b, c], [c, a]]) {
      const key = edgeKey(u, v);
      const adjacent = this.edgeFaces.get(key);
      if (adjacent) adjacent.push(face);
      else this.edgeFaces.set(key, [face]);
    }
  }

  private breakSpring(spring: Spring): void {
    if (!spring.alive) return;
    spring.alive = false;
    if (spring.kind === 'bend') return;
    this.tornEdges.push({ a: spring.a, b: spring.b });
    for (const face of this.edgeFaces.get(edgeKey(spring.a, spring.b)) ?? []) {
      this.faceAlive[face] = 0;
    }
  }

  private rebuildConnectivity(impulse: boolean): void {
    const wasAnchored = impulse ? new Uint8Array(this.anchored) : null;
    this.anchored.fill(0);
    const queue = new Int32Array(this.pinned.length);
    let head = 0;
    let tail = 0;
    for (const pin of this.pinIndices) {
      this.anchored[pin] = 1;
      queue[tail++] = pin;
    }
    while (head < tail) {
      const vertex = queue[head++];
      for (const index of this.incident[vertex]) {
        const spring = this.springs[index];
        if (!spring.alive) continue;
        const other = spring.a === vertex ? spring.b : spring.a;
        if (this.anchored[other]) continue;
        this.anchored[other] = 1;
        queue[tail++] = other;
      }
    }
    if (wasAnchored) {
      for (let i = 0; i < this.anchored.length; i++) {
        if (this.anchored[i] || !wasAnchored[i]) continue;
        const p = i * 3;
        this.previous[p + 2] = this.positions[p + 2] -
          (0.008 + 0.006 * Math.sin(i * 0.31));
      }
    }
  }

  private kickCutEdges(from: Vec3, to: Vec3, radius: number): void {
    const reach = Math.max(0.15, radius + this.cellSize * 2.5);
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    for (let i = 0; i < this.pinned.length; i++) {
      if (this.pinned[i] || this.kicked[i]) continue;
      const p = i * 3;
      const x = this.positions[p];
      const y = this.positions[p + 1];
      const distance = pointSegmentDistance2D(x, y,
        from[0], from[1], to[0], to[1]);
      if (distance > reach) continue;
      const side = dx * (y - from[1]) - dy * (x - from[0]);
      const falloff = Math.max(0, 1 - distance / reach);
      const strength = (side >= 0 ? 0.065 : 0.048) * falloff;
      this.positions[p + 2] += strength;
      this.previous[p + 2] -= strength * 0.5;
      this.curl[i] = Math.max(this.curl[i], (side >= 0 ? 1 : 0.72) * falloff);
      this.kicked[i] = 1;
    }
  }

  private placeGrab(): void {
    if (this.grabbed === null) return;
    const p = this.grabbed * 3;
    this.positions[p] = this.target[0];
    this.positions[p + 1] = Math.max(FLOOR_Y, this.target[1]);
    this.positions[p + 2] = Math.max(-0.035, this.target[2]);
  }

  private constrainBacking(): void {
    for (let i = 0; i < this.anchored.length; i++) {
      if (!this.anchored[i]) continue;
      const p = i * 3 + 2;
      if (this.positions[p] < -0.035) this.positions[p] = -0.035;
    }
  }

  private restorePins(): void {
    for (const index of this.pinIndices) {
      const p = index * 3;
      this.positions[p] = this.original[p];
      this.positions[p + 1] = this.original[p + 1];
      this.positions[p + 2] = this.original[p + 2];
    }
  }

  private constrainFloor(): void {
    for (let i = 0; i < this.pinned.length; i++) {
      if (this.pinned[i] || i === this.grabbed) continue;
      const p = i * 3;
      if (this.positions[p + 1] < FLOOR_Y) {
        this.positions[p + 1] = FLOOR_Y;
        this.previous[p + 1] = FLOOR_Y;
        this.previous[p] = this.positions[p] -
          (this.positions[p] - this.previous[p]) * 0.75;
        this.previous[p + 2] = this.positions[p + 2] -
          (this.positions[p + 2] - this.previous[p + 2]) * 0.75;
      }
    }
  }

  private capInertia(dt: number): void {
    const maximum = 5.5 * dt;
    for (let i = 0; i < this.pinned.length; i++) {
      if (this.pinned[i] || i === this.grabbed) continue;
      const p = i * 3;
      const vx = this.positions[p] - this.previous[p];
      const vy = this.positions[p + 1] - this.previous[p + 1];
      const vz = this.positions[p + 2] - this.previous[p + 2];
      const speed = Math.hypot(vx, vy, vz);
      if (speed > maximum) {
        const scale = maximum / speed;
        this.previous[p] = this.positions[p] - vx * scale;
        this.previous[p + 1] = this.positions[p + 1] - vy * scale;
        this.previous[p + 2] = this.positions[p + 2] - vz * scale;
      }
    }
  }

  private rebuildIndices(): void {
    const live: number[] = [];
    for (let face = 0; face < this.faceAlive.length; face++) {
      if (!this.faceAlive[face]) continue;
      const offset = face * 3;
      live.push(this.triangles[offset], this.triangles[offset + 1], this.triangles[offset + 2]);
    }
    this.liveIndices = live;
    this.topology++;
  }
}

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function pointSegmentDistance2D(px: number, py: number,
  ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared > 0 ? Math.max(0, Math.min(1,
    ((px - ax) * dx + (py - ay) * dy) / lengthSquared)) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

function segmentDistance2D(ax: number, ay: number, bx: number, by: number,
  cx: number, cy: number, dx: number, dy: number): number {
  const abx = bx - ax;
  const aby = by - ay;
  const cdx = dx - cx;
  const cdy = dy - cy;
  const cross = abx * cdy - aby * cdx;
  if (Math.abs(cross) > 1e-9) {
    const acx = cx - ax;
    const acy = cy - ay;
    const t = (acx * cdy - acy * cdx) / cross;
    const u = (acx * aby - acy * abx) / cross;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return 0;
  }
  return Math.min(
    pointSegmentDistance2D(ax, ay, cx, cy, dx, dy),
    pointSegmentDistance2D(bx, by, cx, cy, dx, dy),
    pointSegmentDistance2D(cx, cy, ax, ay, bx, by),
    pointSegmentDistance2D(dx, dy, ax, ay, bx, by),
  );
}
