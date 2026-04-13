let seaweeds = [];
let fishes = [];
let bubbles = [];
let worksCount = 6; // 假設目前有 6 個作品

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1');

  // 初始化海草：隨著作品數量越多，海草會長得越高
  for (let i = 0; i < 12; i++) {
    seaweeds.push(new Seaweed(random(width), height, worksCount));
  }

  // 初始化魚群
  for (let i = 0; i < 8; i++) {
    fishes.push(new Fish(random(width), random(height)));
  }

  // 初始化氣泡（代表各週作品）
  for (let i = 0; i < worksCount; i++) {
    bubbles.push(new Bubble(random(100, width - 100), random(100, height - 150), i + 1));
  }
}

function draw() {
  // 水底背景漸層
  setGradient(0, 0, width, height, color(0, 105, 148), color(0, 25, 50));

  // 更新與繪製海草
  for (let s of seaweeds) {
    s.update();
    s.display();
  }

  // 更新與繪製魚群
  for (let f of fishes) {
    f.update();
    f.display();
  }

  let isHovering = false;
  // 更新與繪製氣泡
  for (let b of bubbles) {
    b.update();
    b.display();
    if (b.isHovered(mouseX, mouseY)) {
      isHovering = true;
    }
  }
  
  // 滑鼠游標改變提示可點擊
  if (isHovering) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 點擊氣泡時觸發 iframe
function mousePressed() {
  for (let b of bubbles) {
    if (b.isHovered(mouseX, mouseY)) {
      openIframe(b.id);
    }
  }
}

function openIframe(id) {
  // 檢查是否已經有 iframe，有的話先移除
  let existingIframe = document.getElementById('workIframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  // 建立彈出視窗容器
  let iframeContainer = createDiv('');
  iframeContainer.id('workIframe');
  iframeContainer.style('position', 'absolute');
  iframeContainer.style('top', '10%');
  iframeContainer.style('left', '10%');
  iframeContainer.style('width', '80%');
  iframeContainer.style('height', '80%');
  iframeContainer.style('background', 'rgba(255, 255, 255, 0.95)');
  iframeContainer.style('border-radius', '10px');
  iframeContainer.style('box-shadow', '0 4px 15px rgba(0,0,0,0.5)');
  iframeContainer.style('display', 'flex');
  iframeContainer.style('flex-direction', 'column');
  iframeContainer.style('z-index', '10');

  // 建立關閉按鈕
  let closeBtn = createButton('關閉 X');
  closeBtn.parent(iframeContainer);
  closeBtn.style('align-self', 'flex-end');
  closeBtn.style('margin', '10px');
  closeBtn.style('padding', '5px 15px');
  closeBtn.style('cursor', 'pointer');
  closeBtn.style('border', 'none');
  closeBtn.style('background', '#ff5c5c');
  closeBtn.style('color', 'white');
  closeBtn.style('border-radius', '5px');
  closeBtn.mousePressed(() => {
    iframeContainer.remove();
  });

  // 建立 iframe
  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://example.com/week_' + id); // 替換為實際的作品網址
  iframe.parent(iframeContainer);
  iframe.style('flex-grow', '1');
  iframe.style('border', 'none');
  iframe.style('border-radius', '0 0 10px 10px');
}

// 繪製漸層背景函式
function setGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

// 海草 Class
class Seaweed {
  constructor(x, y, works) {
    this.x = x;
    this.y = y;
    // 作品數量越多，海草長得越高（節點越多），並加入隨機變化讓高度錯落不一
    let baseSegments = map(works, 0, 20, 5, 30);
    this.segments = parseInt(random(baseSegments * 0.5, baseSegments * 1.5)); 
    this.segmentLength = 15;
    this.baseAngle = random(TWO_PI);
  }

  update() {
    this.angleOffset = sin(frameCount * 0.02 + this.baseAngle) * 0.5;
  }

  display() {
    push();
    stroke(34, 139, 34, 180);
    strokeWeight(12);
    noFill();
    beginShape();
    let currentX = this.x;
    let currentY = this.y;
    vertex(currentX, currentY);
    for (let i = 0; i < this.segments; i++) {
      // 越往上搖擺幅度越大，形成水流推動的效果
      let sway = map(i, 0, this.segments, 0, this.angleOffset * 40);
      currentX += sway;
      currentY -= this.segmentLength;
      curveVertex(currentX, currentY);
    }
    endShape();
    pop();
  }
}

// 魚群 Class
class Fish {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(0.5, 1.2);
    this.speed = random(1.5, 3);
    this.color = color(random(150, 255), random(100, 200), random(50, 150));
    this.yOffset = random(TWO_PI);
  }

  update() {
    this.x += this.speed;
    this.y += sin(frameCount * 0.05 + this.yOffset) * 1.5;
    // 超出螢幕右側就回到左邊
    if (this.x > width + 50) {
      this.x = -50;
      this.y = random(height);
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.size);
    fill(this.color);
    noStroke();
    
    // 使用 beginShape / curveVertex 描繪魚的曲線
    beginShape();
    vertex(20, 0); // 魚嘴
    curveVertex(20, 0);
    curveVertex(0, -10); // 上半身
    curveVertex(-20, 0); // 魚尾連接處
    curveVertex(-30, -15); // 尾鰭上端
    vertex(-30, 15); // 尾鰭下端
    curveVertex(-20, 0); // 魚尾連接處
    curveVertex(0, 10); // 下半身
    curveVertex(20, 0);
    endShape(CLOSE);

    // 魚眼睛
    fill(255);
    ellipse(10, -2, 6, 6);
    fill(0);
    ellipse(11, -2, 3, 3);
    
    pop();
  }
}

// 氣泡 Class (代表各週作品)
class Bubble {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.size = 70;
    this.yOffset = random(TWO_PI);
  }

  update() {
    // 微微上下漂浮
    this.y += sin(frameCount * 0.03 + this.yOffset) * 0.4;
  }

  display() {
    push();
    if (this.isHovered(mouseX, mouseY)) {
      fill(255, 255, 255, 150);
    } else {
      fill(255, 255, 255, 80);
    }
    stroke(255, 255, 255, 200);
    strokeWeight(2);
    ellipse(this.x, this.y, this.size);
    
    // 氣泡高光反射
    noStroke();
    fill(255, 255, 255, 200);
    ellipse(this.x - 15, this.y - 15, 12, 12);

    // 顯示週次文字
    fill(0, 50, 100);
    textAlign(CENTER, CENTER);
    textSize(14);
    textStyle(BOLD);
    text("Week " + this.id, this.x, this.y);
    pop();
  }

  isHovered(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < this.size / 2;
  }
}
