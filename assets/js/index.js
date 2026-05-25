const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const WORLD = { width: 1800, height: 1280 };
const STOPS = [
  {
    id: "intro",
    label: "Base Camp",
    x: 300,
    y: 360,
    color: "#d6a54b",
    kind: "camp",
  },
  {
    id: "backend",
    label: "Backend Toolkit",
    x: 690,
    y: 325,
    color: "#3f6f8d",
    kind: "toolkit",
  },
  {
    id: "projects",
    label: "Production Trail",
    x: 1210,
    y: 565,
    color: "#c47b43",
    kind: "trail",
  },
  {
    id: "career",
    label: "Archive Point",
    x: 820,
    y: 850,
    color: "#8f6a4a",
    kind: "archive-point",
  },
  {
    id: "contact",
    label: "Signal Station",
    x: 360,
    y: 900,
    color: "#d6c15d",
    kind: "signal",
  },
];

const ROUTE_BENDS = [
  [{ x: 505, y: 475 }],
  [{ x: 940, y: 535 }],
  [{ x: 1030, y: 820 }],
  [{ x: 590, y: 920 }],
];

const TREES = [
  [120, 250], [230, 1080], [500, 210], [1390, 230],
  [1580, 390], [1540, 1020], [940, 1110], [560, 1080],
  [135, 780], [1640, 760], [1260, 145],
];

const FLOWERS = [
  [450, 420], [820, 430], [1245, 610],
  [1190, 830], [540, 840], [280, 690],
  [1440, 555], [1515, 620], [575, 995],
];

class FieldMap {
  constructor() {
    this.canvas = qs("#field-map");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;
    this.scrollProgress = 0;
    this.smoothProgress = 0;
    this.camera = { x: 0, y: 0 };
    this.player = { x: STOPS[0].x, y: STOPS[0].y + 110, bob: 0 };
    this.activeStop = STOPS[0].id;
    this.currentStopEl = qs("#current-stop");
    this.progressEl = qs("#route-progress");
    this.markers = qsa("[data-stop-marker]");
    this.navLinks = qsa(".route-nav a");
    this.sections = STOPS.map((stop) => qs(`#${stop.id}`)).filter(Boolean);
    this.raf = null;
    this.lastTime = 0;
    this.hoverStop = null;
    this.archiveIconLoaded = false;
    this.archiveIcon = new Image();
    this.archiveIcon.onload = () => {
      this.archiveIconLoaded = true;
    };
    this.archiveIcon.src = "assets/image/map_icons/career-library-transparent.png";

    this.resize = this.resize.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.loop = this.loop.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
  }

  init() {
    if (!this.ctx) return;
    this.resize();
    this.onScroll();
    this.bind();
    this.raf = requestAnimationFrame(this.loop);
  }

  bind() {
    window.addEventListener("resize", this.resize);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerleave", this.onPointerLeave);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = Math.max(320, rect.width || window.innerWidth);
    this.height = Math.max(320, rect.height || window.innerHeight);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.updateCamera();
  }

  onScroll() {
    if (this.sections.length < 2) {
      this.scrollProgress = 0;
      return;
    }

    const y = window.scrollY;
    const lastIndex = this.sections.length - 1;

    if (y <= this.sections[0].offsetTop) {
      this.scrollProgress = 0;
      return;
    }

    if (y >= this.sections[lastIndex].offsetTop) {
      this.scrollProgress = 1;
      return;
    }

    for (let index = 0; index < lastIndex; index += 1) {
      const currentTop = this.sections[index].offsetTop;
      const nextTop = this.sections[index + 1].offsetTop;
      if (y >= currentTop && y < nextTop) {
        const local = (y - currentTop) / Math.max(1, nextTop - currentTop);
        this.scrollProgress = (index + local) / lastIndex;
        return;
      }
    }
  }

  loop(time) {
    const delta = Math.min(2, (time - this.lastTime) / 16.67 || 1);
    this.lastTime = time;
    this.smoothProgress += (this.scrollProgress - this.smoothProgress) * 0.035;
    const point = this.pointOnRoute(this.smoothProgress);
    this.player.x = point.x;
    this.player.y = point.y;
    this.player.bob += 0.12 * delta;
    this.updateCamera();
    this.updateActiveStop(this.scrollProgress);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  }

  pointOnRoute(progress) {
    const maxIndex = STOPS.length - 1;
    const scaled = progress * maxIndex;
    const segmentIndex = Math.min(maxIndex - 1, Math.floor(scaled));
    const local = scaled - segmentIndex;
    const segmentPoints = this.routeSegmentPoints(segmentIndex);
    const segmentPartCount = segmentPoints.length - 1;
    const partScaled = local * segmentPartCount;
    const partIndex = Math.min(segmentPartCount - 1, Math.floor(partScaled));
    const partLocal = partScaled - partIndex;
    const ease = partLocal * partLocal * (3 - 2 * partLocal);
    const start = segmentPoints[partIndex];
    const end = segmentPoints[partIndex + 1];
    return {
      x: start.x + (end.x - start.x) * ease,
      y: start.y + (end.y - start.y) * ease,
      index: segmentIndex,
    };
  }

  routeSegmentPoints(index) {
    const start = { x: STOPS[index].x, y: STOPS[index].y + 112 };
    const end = { x: STOPS[index + 1].x, y: STOPS[index + 1].y + 112 };
    return [start, ...(ROUTE_BENDS[index] || []), end];
  }

  routeDrawingPoints() {
    const points = [];
    for (let index = 0; index < STOPS.length - 1; index += 1) {
      const segment = this.routeSegmentPoints(index);
      if (index === 0) points.push(segment[0]);
      points.push(...segment.slice(1));
    }
    return points;
  }

  updateCamera() {
    const splitDesktop = window.innerWidth > 1060;
    const biasX = splitDesktop ? 0 : 0;
    const biasY = splitDesktop ? -this.height * 0.04 : -this.height * 0.08;
    this.camera.x = Math.max(0, Math.min(WORLD.width - this.width, this.player.x - this.width * 0.5 + biasX));
    this.camera.y = Math.max(0, Math.min(WORLD.height - this.height, this.player.y - this.height * 0.52 + biasY));
  }

  onPointerMove(event) {
    const stop = this.stopAtEvent(event);
    this.hoverStop = stop?.id || null;
    this.canvas.style.cursor = stop ? "pointer" : "default";
  }

  onPointerLeave() {
    this.hoverStop = null;
    this.canvas.style.cursor = "default";
  }

  onPointerDown(event) {
    const stop = this.stopAtEvent(event);
    if (!stop) return;
    const section = qs(`#${stop.id}`);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  stopAtEvent(event) {
    const rect = this.canvas.getBoundingClientRect();
    const worldX = event.clientX - rect.left + this.camera.x;
    const worldY = event.clientY - rect.top + this.camera.y;

    return STOPS.find((stop) => (
      worldX >= stop.x - 118 &&
      worldX <= stop.x + 118 &&
      worldY >= stop.y - 120 &&
      worldY <= stop.y + 120
    ));
  }

  updateActiveStop(progress = this.smoothProgress) {
    const routePoint = this.pointOnRoute(progress);
    let closest = STOPS[0];
    let closestDistance = Infinity;
    STOPS.forEach((stop) => {
      const distance = Math.hypot(routePoint.x - stop.x, routePoint.y - (stop.y + 112));
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = stop;
      }
    });

    if (this.activeStop !== closest.id) {
      this.activeStop = closest.id;
    }

    this.currentStopEl.textContent = closest.label;
    this.progressEl.style.width = `${Math.round(progress * 100)}%`;
    this.markers.forEach((marker) => {
      marker.classList.toggle("is-active", marker.dataset.stopMarker === closest.id);
    });
    this.navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${closest.id}`);
    });
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);
    this.drawGround(ctx);
    this.drawWater(ctx);
    this.drawRoads(ctx);
    this.drawDecor(ctx);
    this.drawStops(ctx);
    this.drawPlayer(ctx);
    ctx.restore();
    this.drawOverlayHints(ctx);
  }

  drawGround(ctx) {
    ctx.fillStyle = "#9fbd75";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    for (let y = 0; y < WORLD.height; y += 36) {
      for (let x = 0; x < WORLD.width; x += 36) {
        const shade = (x * 7 + y * 11) % 4;
        ctx.fillStyle = shade === 0 ? "#95b56e" : shade === 1 ? "#aac77d" : "#9fbd75";
        ctx.fillRect(x, y, 36, 36);
        if ((x + y) % 144 === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.18)";
          ctx.fillRect(x + 8, y + 12, 5, 2);
          ctx.fillRect(x + 19, y + 24, 7, 2);
        }
      }
    }
  }

  drawWater(ctx) {
    ctx.fillStyle = "#7fc0cf";
    ctx.fillRect(0, 0, WORLD.width, 130);
    ctx.fillRect(1650, 0, 150, WORLD.height);
    ctx.fillStyle = "rgba(255,255,255,0.32)";
    for (let x = 30; x < WORLD.width; x += 110) {
      ctx.fillRect(x, 58 + (x % 4) * 5, 42, 4);
    }
    for (let y = 180; y < WORLD.height; y += 96) {
      ctx.fillRect(1690, y, 48, 4);
    }
  }

  drawRoads(ctx) {
    const route = this.routeDrawingPoints();
    ctx.save();
    ctx.strokeStyle = "#c8b179";
    ctx.lineWidth = 80;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    route.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 8;
    ctx.setLineDash([28, 26]);
    ctx.beginPath();
    route.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  drawDecor(ctx) {
    FLOWERS.forEach(([x, y], index) => this.drawFlower(ctx, x, y, index));
    TREES.forEach(([x, y]) => this.drawTree(ctx, x, y));
    this.drawSign(ctx, 430, 555, "Scroll route");
  }

  drawStops(ctx) {
    STOPS.forEach((stop) => {
      const active = stop.id === this.activeStop || stop.id === this.hoverStop;
      if (stop.kind === "toolkit") this.drawToolkitChest(ctx, stop.x, stop.y, stop.color, active);
      else if (stop.kind === "trail") this.drawTrailMarker(ctx, stop.x, stop.y, stop.color, active);
      else if (stop.kind === "archive-point") this.drawArchivePoint(ctx, stop.x, stop.y, stop.color, active);
      else if (stop.kind === "signal") this.drawSignalStation(ctx, stop.x, stop.y, stop.color, active);
      else this.drawBaseCamp(ctx, stop.x, stop.y, stop.color, active);
      this.drawLabel(ctx, stop.x, stop.y - 92, stop.label, active);
    });
  }

  drawBaseCamp(ctx, x, y, color, active) {
    this.drawShadow(ctx, x - 72, y + 70, 144, 26);
    ctx.fillStyle = "#7b4b33";
    ctx.fillRect(x - 58, y + 16, 116, 56);
    ctx.fillStyle = "#f2d68d";
    ctx.beginPath();
    ctx.moveTo(x - 72, y + 20);
    ctx.lineTo(x, y - 54);
    ctx.lineTo(x + 72, y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c47b43";
    ctx.fillRect(x - 22, y + 22, 44, 50);
    ctx.fillStyle = color;
    ctx.fillRect(x - 8, y - 8, 16, 40);
    this.drawActiveRing(ctx, x, y, active);
  }

  drawToolkitChest(ctx, x, y, color, active) {
    const t = performance.now() / 420;
    const open = active ? 1 : 0;
    this.drawShadow(ctx, x - 82, y + 72, 164, 26);

    ctx.fillStyle = "#7b4b33";
    ctx.fillRect(x - 76, y - 4, 152, 76);
    ctx.fillStyle = "#9b623d";
    ctx.fillRect(x - 68, y + 8, 136, 52);
    ctx.fillStyle = color;
    ctx.fillRect(x - 70, y + 28, 140, 12);
    ctx.fillStyle = "#f2d68d";
    ctx.fillRect(x - 10, y + 25, 20, 20);

    ctx.save();
    ctx.translate(x, y - 4);
    ctx.rotate(open ? -0.18 : 0);
    ctx.fillStyle = "#5a3627";
    ctx.fillRect(-78, -34 - open * 22, 156, 34);
    ctx.fillStyle = "#c47b43";
    ctx.fillRect(-66, -28 - open * 22, 132, 18);
    ctx.restore();

    if (active) {
      const items = [
        { label: "Py", color: "#4d7fa8", dx: -58, dy: -76 },
        { label: "Dj", color: "#3f7c5b", dx: -18, dy: -104 },
        { label: "DB", color: "#8065a8", dx: 24, dy: -92 },
        { label: "Q", color: "#c47b43", dx: 62, dy: -66 },
      ];

      items.forEach((item, index) => {
        const float = Math.sin(t + index * 0.8) * 4;
        const ix = x + item.dx;
        const iy = y + item.dy + float;
        ctx.fillStyle = "rgba(247, 226, 167, 0.5)";
        ctx.fillRect(ix - 16, iy - 16, 32, 32);
        ctx.fillStyle = item.color;
        ctx.fillRect(ix - 13, iy - 13, 26, 26);
        ctx.fillStyle = "#fff6d8";
        ctx.font = "700 11px Fira Code, monospace";
        ctx.fillText(item.label, ix - 8, iy + 4);
      });
    }

    this.drawActiveRing(ctx, x, y, active);
  }

  drawTrailMarker(ctx, x, y, color, active) {
    this.drawShadow(ctx, x - 92, y + 72, 184, 28);
    ctx.fillStyle = "#7b4b33";
    ctx.fillRect(x - 8, y - 60, 16, 132);
    ctx.fillStyle = color;
    ctx.fillRect(x - 70, y - 72, 140, 42);
    ctx.fillStyle = "#f0d28c";
    ctx.fillRect(x - 58, y - 61, 116, 8);
    ctx.fillStyle = "#c8b179";
    ctx.fillRect(x - 86, y + 42, 172, 28);
    ctx.fillStyle = "#fff4c7";
    ctx.fillRect(x - 58, y + 50, 42, 10);
    ctx.fillRect(x + 12, y + 50, 42, 10);
    this.drawActiveRing(ctx, x, y, active);
  }

  drawArchivePoint(ctx, x, y, color, active) {
    if (this.archiveIconLoaded) {
      this.drawShadow(ctx, x - 94, y + 82, 188, 26);
      ctx.drawImage(this.archiveIcon, x - 95, y - 86, 190, 190);
      this.drawActiveRing(ctx, x, y, active);
      return;
    }

    this.drawShadow(ctx, x - 88, y + 72, 176, 28);
    ctx.fillStyle = "#c7b18c";
    ctx.fillRect(x - 72, y + 16, 144, 56);
    ctx.fillStyle = "#9a6d4c";
    ctx.fillRect(x - 54, y - 38, 108, 54);
    ctx.fillStyle = "#f3d68f";
    ctx.fillRect(x - 38, y - 24, 76, 12);
    ctx.fillStyle = color;
    ctx.fillRect(x - 18, y + 28, 36, 44);
    this.drawActiveRing(ctx, x, y, active);
  }

  drawSignalStation(ctx, x, y, color, active) {
    this.drawShadow(ctx, x - 80, y + 72, 160, 28);
    ctx.fillStyle = "#7b4b33";
    ctx.fillRect(x - 10, y - 58, 20, 130);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - 70, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f7e2a7";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y - 70, 48, -0.5, 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y - 70, 68, -0.42, 0.42);
    ctx.stroke();
    ctx.fillStyle = "#f1dfa9";
    ctx.fillRect(x - 44, y + 36, 88, 36);
    this.drawActiveRing(ctx, x, y, active);
  }

  drawActiveRing(ctx, x, y, active) {
    if (!active) return;
    ctx.save();
    ctx.strokeStyle = "#f7e2a7";
    ctx.lineWidth = 5;
    ctx.setLineDash([12, 9]);
    ctx.strokeRect(x - 112, y - 112, 224, 204);
    ctx.restore();
  }

  drawLabel(ctx, x, y, text, active) {
    ctx.save();
    ctx.font = "700 17px Fira Code, monospace";
    const width = ctx.measureText(text).width + 28;
    ctx.fillStyle = active ? "#f7e2a7" : "rgba(247, 226, 167, 0.86)";
    ctx.fillRect(x - width / 2, y - 18, width, 32);
    ctx.strokeStyle = "#18211e";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - width / 2, y - 18, width, 32);
    ctx.fillStyle = "#18211e";
    ctx.fillText(text, x - width / 2 + 14, y + 4);
    ctx.restore();
  }

  drawPlayer(ctx) {
    const { x, y } = this.player;
    const bob = Math.sin(this.player.bob) * 2;
    this.drawShadow(ctx, x - 18, y + 18, 36, 10);
    ctx.fillStyle = "#24312c";
    ctx.fillRect(x - 10, y - 20 + bob, 20, 18);
    ctx.fillStyle = "#e8b782";
    ctx.fillRect(x - 8, y - 11 + bob, 16, 16);
    ctx.fillStyle = "#3f6f8d";
    ctx.fillRect(x - 12, y + 4 + bob, 24, 25);
    ctx.fillStyle = "#18211e";
    ctx.fillRect(x - 9, y + 27 + bob, 7, 13);
    ctx.fillRect(x + 2, y + 27 + bob, 7, 13);
    ctx.fillStyle = "#f7f4e8";
    ctx.fillRect(x - 5, y - 5 + bob, 3, 3);
    ctx.fillRect(x + 4, y - 5 + bob, 3, 3);
  }

  drawTree(ctx, x, y) {
    this.drawShadow(ctx, x - 24, y + 38, 48, 14);
    ctx.fillStyle = "#7b4b33";
    ctx.fillRect(x - 8, y + 16, 16, 36);
    ctx.fillStyle = "#3f7858";
    ctx.fillRect(x - 30, y - 14, 60, 38);
    ctx.fillStyle = "#559166";
    ctx.fillRect(x - 22, y - 38, 44, 34);
    ctx.fillStyle = "#72b56f";
    ctx.fillRect(x - 10, y - 50, 20, 20);
  }

  drawFlower(ctx, x, y, index) {
    ctx.fillStyle = index % 2 ? "#e5c75a" : "#c96b7b";
    ctx.fillRect(x - 3, y - 3, 6, 6);
    ctx.fillRect(x - 9, y, 6, 6);
    ctx.fillRect(x + 3, y, 6, 6);
    ctx.fillStyle = "#3f7858";
    ctx.fillRect(x, y + 6, 3, 12);
  }

  drawSign(ctx, x, y, text) {
    ctx.fillStyle = "#7b4b33";
    ctx.fillRect(x - 4, y, 8, 42);
    ctx.fillStyle = "#f2d68d";
    ctx.fillRect(x - 50, y - 28, 100, 32);
    ctx.strokeStyle = "#18211e";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 50, y - 28, 100, 32);
    ctx.fillStyle = "#18211e";
    ctx.font = "700 12px Fira Code, monospace";
    ctx.fillText(text, x - 40, y - 8);
  }

  drawShadow(ctx, x, y, w, h) {
    ctx.fillStyle = "rgba(13, 18, 16, 0.16)";
    ctx.fillRect(x, y, w, h);
  }

  drawOverlayHints(ctx) {
    if (this.width < 1060) return;
    ctx.save();
    ctx.fillStyle = "rgba(247, 244, 232, 0.72)";
    ctx.font = "600 13px Fira Code, monospace";
    ctx.fillText("Scroll to walk the route", this.width - 238, this.height - 34);
    ctx.restore();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const fieldMap = new FieldMap();
  window.fieldMap = fieldMap;
  fieldMap.init();
});
