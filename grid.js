window.onload = function () {

let img = document.querySelector("img");

let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

canvas.width = img.width;
canvas.height = img.height;

canvas.style.position = "absolute";
canvas.style.left = img.offsetLeft + "px";
canvas.style.top = (img.offsetTop + 50) + "px";
canvas.style.cursor = "crosshair";

document.body.appendChild(canvas);

/* ================= PANEL ================= */

let panel = document.createElement("div");
panel.style.margin = "10px";
panel.style.color = "white";

panel.innerHTML = `
<button id="usBtn">US</button>
<button id="enemyBtn">ENEMY</button>
<button id="arrowBtn">ARROW</button>
<button id="deleteBtn">DELETE LAST</button>
<button id="saveBtn">SAVE</button>
<button id="loadBtn">LOAD</button>
<input type="color" id="colorPick" value="#0000ff">
`;

document.body.insertBefore(panel, document.body.firstChild);

/* ================= DANE ================= */

let size = 45;
let fontSize = 7;

let currentColor = "#0000ff";
let currentTeam = "us";

let tanks = [];
let arrows = [];

let selectedTank = null;
let dragging = false;

let arrowMode = false;
let arrowStart = null;

/* ================= BUTTONY ================= */

document.getElementById("usBtn").onclick = function () {
currentTeam = "us";
currentColor = "#0000ff";
document.getElementById("colorPick").value = "#0000ff";
};

document.getElementById("enemyBtn").onclick = function () {
currentTeam = "enemy";
currentColor = "#ff0000";
document.getElementById("colorPick").value = "#ff0000";
};

document.getElementById("arrowBtn").onclick = function () {
arrowMode = !arrowMode;
};

document.getElementById("colorPick").oninput = function () {
currentColor = this.value;
};

document.getElementById("deleteBtn").onclick = function () {

if (arrows.length > 0) {
arrows.pop();
} else if (tanks.length > 0) {
tanks.pop();
}

drawAll();

};

document.getElementById("saveBtn").onclick = function () {

let data = {
tanks: tanks,
arrows: arrows
};

localStorage.setItem("minimapSave", JSON.stringify(data));

alert("Saved!");

};

document.getElementById("loadBtn").onclick = function () {

let data = localStorage.getItem("minimapSave");

if (data) {

let save = JSON.parse(data);

tanks = save.tanks || [];
arrows = save.arrows || [];

drawAll();

alert("Loaded!");

} else {

alert("No save found.");

}

};

/* ================= RYSUJ ================= */

function drawAll() {

ctx.clearRect(0, 0, canvas.width, canvas.height);

/* GRID */
ctx.strokeStyle = "rgba(255,255,255,0.35)";
ctx.lineWidth = 1;

for (let x = 0; x <= canvas.width; x += size) {
ctx.beginPath();
ctx.moveTo(x, 0);
ctx.lineTo(x, canvas.height);
ctx.stroke();
}

for (let y = 0; y <= canvas.height; y += size) {
ctx.beginPath();
ctx.moveTo(0, y);
ctx.lineTo(canvas.width, y);
ctx.stroke();
}

/* KOORDYNATY */
ctx.fillStyle = "red";
ctx.font = fontSize + "px Arial";

let letters = "ABCDEFGHIJK";

for (let r = 0; r < 11; r++) {
ctx.fillText(letters[r], 3, r * size + 22);
}

for (let c = 1; c <= 20; c++) {
ctx.fillText(c, (c - 1) * size + 18, 8);
}

/* STRZAŁKI */
for (let a of arrows) {
drawArrow(a.x1, a.y1, a.x2, a.y2, a.color);
}

/* TANKI */
for (let t of tanks) {

ctx.beginPath();
ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
ctx.fillStyle = t.color;
ctx.fill();

ctx.strokeStyle = "black";
ctx.stroke();

/* NAZWA */
ctx.fillStyle = "white";
ctx.font = "10px Arial";
ctx.fillText(t.name, t.x + 10, t.y - 10);

}

}

/* ================= STRZAŁKA ================= */

function drawArrow(x1, y1, x2, y2, color) {

ctx.strokeStyle = color;
ctx.lineWidth = 3;

ctx.beginPath();
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.stroke();

/* grot */
let angle = Math.atan2(y2 - y1, x2 - x1);

ctx.beginPath();
ctx.moveTo(x2, y2);
ctx.lineTo(x2 - 12 * Math.cos(angle - 0.4), y2 - 12 * Math.sin(angle - 0.4));
ctx.lineTo(x2 - 12 * Math.cos(angle + 0.4), y2 - 12 * Math.sin(angle + 0.4));
ctx.closePath();

ctx.fillStyle = color;
ctx.fill();

}

/* ================= ZNAJDŹ TANK ================= */

function getTank(x, y) {

for (let i = tanks.length - 1; i >= 0; i--) {

let t = tanks[i];

let dx = x - t.x;
let dy = y - t.y;

if (Math.sqrt(dx * dx + dy * dy) < 10) {
return t;
}

}

return null;

}

/* ================= KLIK ================= */

canvas.onclick = function (e) {

let rect = canvas.getBoundingClientRect();

let x = e.clientX - rect.left;
let y = e.clientY - rect.top;

/* TRYB STRZAŁEK */
if (arrowMode) {

if (!arrowStart) {

arrowStart = { x: x, y: y };

} else {

arrows.push({
x1: arrowStart.x,
y1: arrowStart.y,
x2: x,
y2: y,
color: currentColor
});

arrowStart = null;
drawAll();

}

return;

}

/* TANK */
let found = getTank(x, y);

if (!found) {

let tankName = prompt("Tank name:");

if (tankName == null) tankName = "";

tanks.push({
x: x,
y: y,
color: currentColor,
team: currentTeam,
name: tankName
});

drawAll();

}

};

/* ================= PRZESUWANIE ================= */

canvas.onmousedown = function (e) {

let rect = canvas.getBoundingClientRect();

let x = e.clientX - rect.left;
let y = e.clientY - rect.top;

selectedTank = getTank(x, y);

if (selectedTank) {
dragging = true;
}

};

canvas.onmousemove = function (e) {

if (!dragging || !selectedTank) return;

let rect = canvas.getBoundingClientRect();

selectedTank.x = e.clientX - rect.left;
selectedTank.y = e.clientY - rect.top;

drawAll();

};

canvas.onmouseup = function () {

dragging = false;
selectedTank = null;

};

drawAll();

}