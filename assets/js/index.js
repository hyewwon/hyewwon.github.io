const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const TILE = 32;
const WORLD = { width: 1600, height: 1100 };

const PORTFOLIO = {
  home: {
    label: "Home",
    place: "개발자의 집",
    title: "About Kim Hyewwon",
    kicker: "Home / About",
    x: 345,
    y: 335,
    color: "#c85f5f",
    body: `
      <p>AI 서비스와 프로덕션 백엔드를 설계하고 운영하는 백엔드 개발자입니다.</p>
      <p>Python과 Django 기반 API, 인증/권한, 데이터 구조, 비동기 처리, 외부 AI 모델 연동을 중심으로 서비스를 구현해왔습니다.</p>
      <ul class="tag-list">
        <li>API Design</li>
        <li>Async Processing</li>
        <li>AI Service Backend</li>
        <li>Production Ops</li>
      </ul>
    `,
  },
  server: {
    label: "Server Room",
    place: "서버실",
    title: "Backend Stack",
    kicker: "Server Room / Stack",
    x: 760,
    y: 300,
    color: "#4d7fa8",
    body: `
      <p>운영 가능한 API 서버 구조를 만들고, 서비스 요구사항에 맞춰 데이터와 비동기 작업 흐름을 설계합니다.</p>
      <ul class="tag-list">
        <li>Python</li>
        <li>Django</li>
        <li>Django REST framework</li>
        <li>PostgreSQL</li>
        <li>MariaDB</li>
        <li>Redis</li>
        <li>Celery</li>
        <li>Docker / AWS</li>
      </ul>
      <div class="notice">API, 인증/권한, 관리자 도구, Swagger 문서화까지 백엔드 운영 관점으로 다룹니다.</div>
    `,
  },
  lab: {
    label: "AI Lab",
    place: "AI 연구소",
    title: "AI Pipeline & Providers",
    kicker: "AI Lab / Integration",
    x: 1125,
    y: 330,
    color: "#8c6bb1",
    body: `
      <p>외부 AI 모델을 단순 호출하는 데서 끝내지 않고, 제품 기능으로 안정적으로 연결하는 파이프라인을 구성합니다.</p>
      <ul class="tag-list">
        <li>OpenAI</li>
        <li>Fal.ai</li>
        <li>Replicate</li>
        <li>ComfyUI</li>
        <li>Image Generation</li>
        <li>Voice Generation</li>
      </ul>
      <div class="notice">요청 생성, 큐 적재, provider 호출, 결과 저장, 실패 처리 흐름을 백엔드에서 정리합니다.</div>
    `,
  },
  workshop: {
    label: "Projects",
    place: "프로젝트 작업장",
    title: "Production Projects",
    kicker: "Workshop / Cases",
    x: 1080,
    y: 760,
    color: "#d58c42",
    body: `
      <p>실제 서비스에서 맡았던 주요 백엔드 프로젝트입니다.</p>
      <ul class="project-list">
        <li><strong>삼성전자 이미지 생성 AI 툴</strong>AI 이미지 생성 파이프라인 및 인증 기반 백엔드 API 개발</li>
        <li><strong>플러스엑스 GenAI</strong>AI 이미지 생성 서비스 백엔드 구조 설계 및 운영</li>
        <li><strong>T Universe Figma Plugin</strong>AI 이미지 생성 플러그인 백엔드 및 비동기 처리 구조 개발</li>
        <li><strong>Another Class</strong>AI 음성 생성 서비스 백엔드 개발 및 실시간 처리 연동</li>
        <li><strong>GNC Solution EMAX</strong>전력 소모 예측 AI 서비스의 데이터 관리 및 예측 자동화 백엔드 설계</li>
        <li><strong>BuildPay</strong>전자지갑/빌드몰 연동을 위한 결제 및 정산 백엔드 API 개발</li>
      </ul>
    `,
  },
  library: {
    label: "Experience",
    place: "경험 도서관",
    title: "Experience Timeline",
    kicker: "Library / Career",
    x: 515,
    y: 775,
    color: "#8f6a4a",
    body: `
      <ul class="project-list">
        <li><strong>2024.09 - 현재 / 플러스엑스</strong>Backend Engineer. API, 인증/권한, 데이터 구조, AI 서비스 백엔드와 운영 구조 개발.</li>
        <li><strong>2022.08 - 2024.08 / GNC Solution</strong>Backend Engineer. 리워드 결제, 예측 AI 서비스, 비동기 스케줄링, 결제 API 개발.</li>
        <li><strong>2022.06.17</strong>정보처리기사 취득.</li>
        <li><strong>2022.01 - 2022.06</strong>AI 기반 챗봇 및 OCR 개발 전문가 과정 수료, 프로젝트 평가 종합 성적 우수상 수상.</li>
      </ul>
    `,
  },
  mail: {
    label: "Contact",
    place: "우체국",
    title: "Contact Endpoint",
    kicker: "Mail Office / Response",
    x: 820,
    y: 890,
    color: "#e6c55f",
    body: `
      <p>새로운 문제를 안정적인 백엔드 흐름으로 바꾸는 일에 관심이 있습니다.</p>
      <div class="endpoint-list">
        <a href="https://github.com/hyewwon" target="_blank" rel="noopener noreferrer">
          <strong>GET /github</strong>github.com/hyewwon
        </a>
        <a href="mailto:rlagp424@gmail.com">
          <strong>GET /email</strong>rlagp424@gmail.com
        </a>
      </div>
    `,
  },
};

const DECOR = {
  trees: [
    [130, 250], [185, 310], [240, 220], [1350, 230], [1435, 305],
    [1210, 910], [1320, 830], [260, 850], [210, 735], [1420, 700],
    [970, 145], [625, 150], [430, 990], [85, 545], [1490, 515],
  ],
  flowers: [
    [470, 430], [520, 455], [945, 380], [1010, 405], [1180, 640],
    [1175, 690], [645, 690], [705, 710], [740, 835], [700, 890],
    [305, 505], [365, 540], [1275, 525], [1325, 565],
  ],
  rocks: [[650, 505], [695, 530], [905, 615], [965, 655], [365, 690], [1230, 435]],
};

class PortfolioVillage {
  constructor() {
    this.canvas = qs("#world-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;
    this.camera = { x: 0, y: 0 };
    this.player = { x: 800, y: 560, size: 24, speed: 3.1, dir: "down", step: 0 };
    this.keys = new Set();
    this.activePlace = null;
    this.panelOpen = false;
    this.lastTime = 0;
    this.raf = null;

    this.currentPlaceEl = qs("#current-place");
    this.hintEl = qs("#interaction-hint");
    this.panel = qs("#portfolio-panel");
    this.panelKicker = qs("#panel-kicker");
    this.panelTitle = qs("#panel-title");
    this.panelBody = qs("#panel-body");

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
  }

  init() {
    this.resize();
    this.bindEvents();
    this.jumpTo("home", false);
    this.raf = requestAnimationFrame(this.loop);
  }

  bindEvents() {
    window.addEventListener("resize", this.resize);
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
        event.preventDefault();
        this.keys.add(key);
      }
      if (key === "enter") {
        event.preventDefault();
        this.interact();
      }
      if (key === "escape") {
        this.closePanel();
      }
    });

    window.addEventListener("keyup", (event) => {
      this.keys.delete(event.key.toLowerCase());
    });

    qsa("[data-travel]").forEach((button) => {
      button.addEventListener("click", () => this.jumpTo(button.dataset.travel));
    });

    qsa("[data-move]").forEach((button) => {
      const key = button.dataset.move;
      const start = () => this.keys.add(`touch-${key}`);
      const end = () => this.keys.delete(`touch-${key}`);
      button.addEventListener("pointerdown", start);
      button.addEventListener("pointerup", end);
      button.addEventListener("pointercancel", end);
      button.addEventListener("pointerleave", end);
    });

    qs("[data-interact]").addEventListener("click", () => this.interact());
    qs(".panel-close").addEventListener("click", () => this.closePanel());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.updateCamera();
  }

  jumpTo(id, open = true) {
    const place = PORTFOLIO[id];
    if (!place) return;
    this.player.x = place.x;
    this.player.y = place.y + 92;
    this.player.dir = "up";
    this.updateCamera();
    this.updateActivePlace();
    if (open) this.openPanel(id);
  }

  update(delta) {
    let dx = 0;
    let dy = 0;
    if (this.keys.has("arrowup") || this.keys.has("w") || this.keys.has("touch-up")) dy -= 1;
    if (this.keys.has("arrowdown") || this.keys.has("s") || this.keys.has("touch-down")) dy += 1;
    if (this.keys.has("arrowleft") || this.keys.has("a") || this.keys.has("touch-left")) dx -= 1;
    if (this.keys.has("arrowright") || this.keys.has("d") || this.keys.has("touch-right")) dx += 1;

    if (dx || dy) {
      const length = Math.hypot(dx, dy) || 1;
      dx /= length;
      dy /= length;
      this.player.x = Math.max(54, Math.min(WORLD.width - 54, this.player.x + dx * this.player.speed * delta));
      this.player.y = Math.max(86, Math.min(WORLD.height - 60, this.player.y + dy * this.player.speed * delta));
      this.player.step += 0.18 * delta;
      if (Math.abs(dx) > Math.abs(dy)) this.player.dir = dx > 0 ? "right" : "left";
      else this.player.dir = dy > 0 ? "down" : "up";
    }

    this.updateCamera();
    this.updateActivePlace();
  }

  updateCamera() {
    this.camera.x = Math.max(0, Math.min(WORLD.width - this.width, this.player.x - this.width / 2));
    this.camera.y = Math.max(0, Math.min(WORLD.height - this.height, this.player.y - this.height / 2));
  }

  updateActivePlace() {
    let nearest = null;
    let nearestDistance = Infinity;
    Object.entries(PORTFOLIO).forEach(([id, place]) => {
      const distance = Math.hypot(this.player.x - place.x, this.player.y - (place.y + 65));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = id;
      }
    });

    this.activePlace = nearestDistance < 118 ? nearest : null;
    const place = this.activePlace ? PORTFOLIO[this.activePlace] : null;
    this.currentPlaceEl.textContent = place ? place.place : "마을 산책 중";
    this.hintEl.textContent = place ? "Enter로 열기" : "건물 앞에서 Enter";

    qsa("[data-travel]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.travel === this.activePlace);
    });
  }

  interact() {
    if (this.activePlace) this.openPanel(this.activePlace);
  }

  openPanel(id) {
    const place = PORTFOLIO[id];
    if (!place) return;
    this.panelKicker.textContent = place.kicker;
    this.panelTitle.textContent = place.title;
    this.panelBody.innerHTML = place.body;
    this.panel.classList.add("is-open");
    this.panel.setAttribute("aria-hidden", "false");
    this.panelOpen = true;
  }

  closePanel() {
    this.panel.classList.remove("is-open");
    this.panel.setAttribute("aria-hidden", "true");
    this.panelOpen = false;
  }

  loop(timestamp) {
    const delta = Math.min(2, (timestamp - this.lastTime) / 16.67 || 1);
    this.lastTime = timestamp;
    this.update(delta);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  }

  worldToScreen(x, y) {
    return { x: Math.round(x - this.camera.x), y: Math.round(y - this.camera.y) };
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);
    this.drawGround(ctx);
    this.drawWater(ctx);
    this.drawPaths(ctx);
    this.drawDecor(ctx);
    this.drawBuildings(ctx);
    this.drawPlayer(ctx);
    this.drawInteractionMarkers(ctx);
    ctx.restore();
    this.drawVignette(ctx);
  }

  drawGround(ctx) {
    ctx.fillStyle = "#94c765";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    for (let y = 0; y < WORLD.height; y += TILE) {
      for (let x = 0; x < WORLD.width; x += TILE) {
        const n = (x * 13 + y * 17) % 5;
        ctx.fillStyle = n === 0 ? "#8fbe5d" : n === 1 ? "#9cca6b" : "#96c466";
        ctx.fillRect(x, y, TILE, TILE);
        if ((x + y) % 128 === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.13)";
          ctx.fillRect(x + 6, y + 8, 4, 2);
          ctx.fillRect(x + 14, y + 20, 5, 2);
        }
      }
    }
  }

  drawWater(ctx) {
    ctx.fillStyle = "#6fb4c8";
    ctx.fillRect(0, 0, WORLD.width, 110);
    ctx.fillRect(1380, 0, 220, WORLD.height);
    ctx.fillStyle = "rgba(255,255,255,0.26)";
    for (let x = 20; x < WORLD.width; x += 90) {
      ctx.fillRect(x, 42 + (x % 3) * 8, 36, 4);
    }
    for (let y = 145; y < WORLD.height; y += 88) {
      ctx.fillRect(1435, y, 42, 4);
    }
  }

  drawPaths(ctx) {
    ctx.fillStyle = "#d7b77a";
    this.drawPixelRoad(ctx, 330, 420, 1160, 70);
    this.drawPixelRoad(ctx, 770, 260, 70, 660);
    this.drawPixelRoad(ctx, 430, 735, 770, 66);
    this.drawPixelRoad(ctx, 500, 360, 72, 470);

    ctx.fillStyle = "#b98955";
    for (let x = 340; x < 1150; x += 52) ctx.fillRect(x, 450, 22, 6);
    for (let y = 278; y < 910; y += 52) ctx.fillRect(802, y, 6, 22);
  }

  drawPixelRoad(ctx, x, y, w, h) {
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (let px = x + 12; px < x + w - 12; px += 36) {
      for (let py = y + 10; py < y + h - 10; py += 24) {
        ctx.fillRect(px, py, 10, 4);
      }
    }
    ctx.fillStyle = "#d7b77a";
  }

  drawDecor(ctx) {
    DECOR.flowers.forEach(([x, y], index) => this.drawFlower(ctx, x, y, index));
    DECOR.rocks.forEach(([x, y]) => this.drawRock(ctx, x, y));
    DECOR.trees.forEach(([x, y]) => this.drawTree(ctx, x, y));
    this.drawSign(ctx, 735, 545, "Start");
  }

  drawBuildings(ctx) {
    Object.entries(PORTFOLIO).forEach(([id, place]) => {
      const active = id === this.activePlace;
      if (id === "mail") this.drawPostOffice(ctx, place.x, place.y, place.color, active);
      else if (id === "lab") this.drawLab(ctx, place.x, place.y, place.color, active);
      else if (id === "server") this.drawServerRoom(ctx, place.x, place.y, place.color, active);
      else if (id === "workshop") this.drawWorkshop(ctx, place.x, place.y, place.color, active);
      else if (id === "library") this.drawLibrary(ctx, place.x, place.y, place.color, active);
      else this.drawHouse(ctx, place.x, place.y, place.color, active);
      this.drawLabel(ctx, place.x, place.y - 86, place.label, active);
    });
  }

  drawHouse(ctx, x, y, color, active) {
    this.drawShadow(ctx, x - 78, y + 50, 156, 28);
    ctx.fillStyle = "#6f3f2c";
    ctx.fillRect(x - 72, y - 24, 144, 96);
    ctx.fillStyle = color;
    ctx.fillRect(x - 82, y - 58, 164, 46);
    ctx.fillStyle = "#4d2a22";
    ctx.fillRect(x - 62, y + 20, 34, 52);
    ctx.fillStyle = "#f9d98a";
    ctx.fillRect(x + 22, y + 2, 34, 28);
    this.drawBuildingGlow(ctx, x, y, active);
  }

  drawServerRoom(ctx, x, y, color, active) {
    this.drawShadow(ctx, x - 85, y + 50, 170, 28);
    ctx.fillStyle = "#374b5e";
    ctx.fillRect(x - 78, y - 48, 156, 120);
    ctx.fillStyle = color;
    ctx.fillRect(x - 88, y - 68, 176, 26);
    ctx.fillStyle = "#1f2e3a";
    ctx.fillRect(x - 54, y - 20, 34, 92);
    ctx.fillRect(x + 22, y - 20, 34, 92);
    ctx.fillStyle = "#78f0b6";
    for (let yy = y - 10; yy < y + 52; yy += 24) {
      ctx.fillRect(x - 45, yy, 8, 8);
      ctx.fillRect(x + 31, yy, 8, 8);
    }
    this.drawBuildingGlow(ctx, x, y, active);
  }

  drawLab(ctx, x, y, color, active) {
    this.drawShadow(ctx, x - 90, y + 52, 180, 28);
    ctx.fillStyle = "#e8ecf1";
    ctx.fillRect(x - 74, y - 26, 148, 98);
    ctx.fillStyle = color;
    ctx.fillRect(x - 88, y - 58, 176, 40);
    ctx.fillStyle = "#76c7d9";
    ctx.fillRect(x - 26, y - 88, 52, 34);
    ctx.fillStyle = "#2f4150";
    ctx.fillRect(x - 18, y + 20, 36, 52);
    ctx.fillStyle = "#78d5e8";
    ctx.fillRect(x - 54, y - 4, 30, 26);
    ctx.fillRect(x + 26, y - 4, 30, 26);
    this.drawBuildingGlow(ctx, x, y, active);
  }

  drawWorkshop(ctx, x, y, color, active) {
    this.drawShadow(ctx, x - 92, y + 50, 184, 28);
    ctx.fillStyle = "#7f5236";
    ctx.fillRect(x - 82, y - 34, 164, 106);
    ctx.fillStyle = color;
    ctx.fillRect(x - 92, y - 66, 184, 36);
    ctx.fillStyle = "#523525";
    ctx.fillRect(x - 20, y + 16, 44, 56);
    ctx.fillStyle = "#f4d27f";
    ctx.fillRect(x - 62, y - 4, 34, 28);
    ctx.fillRect(x + 36, y - 4, 34, 28);
    this.drawBuildingGlow(ctx, x, y, active);
  }

  drawLibrary(ctx, x, y, color, active) {
    this.drawShadow(ctx, x - 88, y + 52, 176, 28);
    ctx.fillStyle = "#9a6d4c";
    ctx.fillRect(x - 80, y - 46, 160, 118);
    ctx.fillStyle = color;
    ctx.fillRect(x - 88, y - 76, 176, 36);
    ctx.fillStyle = "#6b4630";
    ctx.fillRect(x - 18, y + 16, 36, 56);
    ctx.fillStyle = "#f8df9a";
    for (let xx = x - 58; xx <= x + 38; xx += 48) {
      ctx.fillRect(xx, y - 16, 28, 28);
    }
    this.drawBuildingGlow(ctx, x, y, active);
  }

  drawPostOffice(ctx, x, y, color, active) {
    this.drawShadow(ctx, x - 80, y + 48, 160, 28);
    ctx.fillStyle = "#f5e0a0";
    ctx.fillRect(x - 70, y - 30, 140, 102);
    ctx.fillStyle = color;
    ctx.fillRect(x - 82, y - 60, 164, 36);
    ctx.fillStyle = "#7b4b33";
    ctx.fillRect(x - 18, y + 18, 36, 54);
    ctx.fillStyle = "#c85f5f";
    ctx.fillRect(x - 38, y - 6, 76, 34);
    ctx.fillStyle = "#fff6d8";
    ctx.fillRect(x - 22, y + 4, 44, 6);
    this.drawBuildingGlow(ctx, x, y, active);
  }

  drawBuildingGlow(ctx, x, y, active) {
    if (!active) return;
    ctx.save();
    ctx.strokeStyle = "#fff6a6";
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(x - 104, y - 94, 208, 178);
    ctx.restore();
  }

  drawLabel(ctx, x, y, text, active) {
    ctx.save();
    ctx.font = "700 16px Fira Code, monospace";
    const width = ctx.measureText(text).width + 24;
    ctx.fillStyle = active ? "#fff6d8" : "rgba(255, 246, 216, 0.82)";
    ctx.fillRect(x - width / 2, y - 18, width, 30);
    ctx.strokeStyle = "#2a1d18";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - width / 2, y - 18, width, 30);
    ctx.fillStyle = "#2a1d18";
    ctx.fillText(text, x - width / 2 + 12, y + 3);
    ctx.restore();
  }

  drawPlayer(ctx) {
    const { x, y } = this.player;
    const bob = Math.sin(this.player.step) * 2;
    this.drawShadow(ctx, x - 16, y + 17, 32, 10);
    ctx.fillStyle = "#2a1d18";
    ctx.fillRect(x - 10, y - 18 + bob, 20, 20);
    ctx.fillStyle = "#f1b985";
    ctx.fillRect(x - 8, y - 11 + bob, 16, 16);
    ctx.fillStyle = "#4d7fa8";
    ctx.fillRect(x - 11, y + 5 + bob, 22, 24);
    ctx.fillStyle = "#2a1d18";
    ctx.fillRect(x - 9, y + 27 + bob, 7, 12);
    ctx.fillRect(x + 2, y + 27 + bob, 7, 12);
    ctx.fillStyle = "#fff6d8";
    ctx.fillRect(x - 5, y - 5 + bob, 3, 3);
    ctx.fillRect(x + 4, y - 5 + bob, 3, 3);
  }

  drawInteractionMarkers(ctx) {
    if (!this.activePlace) return;
    const place = PORTFOLIO[this.activePlace];
    const t = performance.now() / 250;
    ctx.save();
    ctx.fillStyle = "#fff6a6";
    ctx.strokeStyle = "#2a1d18";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(place.x, place.y + 96 + Math.sin(t) * 4, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#2a1d18";
    ctx.font = "700 14px Fira Code, monospace";
    ctx.fillText("E", place.x - 4, place.y + 101 + Math.sin(t) * 4);
    ctx.restore();
  }

  drawTree(ctx, x, y) {
    this.drawShadow(ctx, x - 24, y + 38, 48, 15);
    ctx.fillStyle = "#7b4b33";
    ctx.fillRect(x - 8, y + 16, 16, 36);
    ctx.fillStyle = "#2f6a4f";
    ctx.fillRect(x - 28, y - 16, 56, 38);
    ctx.fillStyle = "#3d8059";
    ctx.fillRect(x - 20, y - 38, 40, 34);
    ctx.fillStyle = "#6fb36b";
    ctx.fillRect(x - 10, y - 48, 20, 20);
  }

  drawFlower(ctx, x, y, index) {
    ctx.fillStyle = index % 2 ? "#f2d15f" : "#e0718b";
    ctx.fillRect(x - 3, y - 3, 6, 6);
    ctx.fillRect(x - 9, y, 6, 6);
    ctx.fillRect(x + 3, y, 6, 6);
    ctx.fillStyle = "#2f6a4f";
    ctx.fillRect(x, y + 6, 3, 12);
  }

  drawRock(ctx, x, y) {
    this.drawShadow(ctx, x - 14, y + 10, 28, 8);
    ctx.fillStyle = "#8b8f87";
    ctx.fillRect(x - 14, y - 2, 28, 16);
    ctx.fillStyle = "#a8aea4";
    ctx.fillRect(x - 8, y - 8, 18, 8);
  }

  drawSign(ctx, x, y, text) {
    ctx.fillStyle = "#7b4b33";
    ctx.fillRect(x - 4, y, 8, 42);
    ctx.fillStyle = "#f0c36d";
    ctx.fillRect(x - 34, y - 24, 68, 28);
    ctx.strokeStyle = "#2a1d18";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 34, y - 24, 68, 28);
    ctx.fillStyle = "#2a1d18";
    ctx.font = "700 12px Fira Code, monospace";
    ctx.fillText(text, x - 22, y - 6);
  }

  drawShadow(ctx, x, y, w, h) {
    ctx.fillStyle = "rgba(55, 38, 28, 0.24)";
    ctx.fillRect(x, y, w, h);
  }

  drawVignette(ctx) {
    const gradient = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      Math.min(this.width, this.height) * 0.2,
      this.width / 2,
      this.height / 2,
      Math.max(this.width, this.height) * 0.72
    );
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(1, "rgba(55,38,28,0.18)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const village = new PortfolioVillage();
  window.portfolioVillage = village;
  village.init();
});
