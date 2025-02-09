// Setup
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const sidebar = document.getElementById("sidebar");
const toroidButton = sidebar.querySelector("#toroidButton");
const resetButton = sidebar.querySelector("#resetButton");
const cellSizeSlider = sidebar.querySelector("#cellSizeSlider");
const cellSize = sidebar.querySelector("#value");
cellSize.textContent = cellSizeSlider.value;

canvas.width = 1200;
canvas.height = 1000;

const ALIVE = "#FFF";
const DEAD = "#000";

class Effect {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.running = 1;
        this.isDragging = 0;
        this.toroidal = 0;
        this.init();

        //this.debug = false;
        //this.pause = false;

        this.canvas.addEventListener("mousedown", (e) => {
            this.isDragging ^= 1;
            this.toggleCell(e.clientX, e.clientY);
        });

        this.canvas.addEventListener("mousemove", (e) => {
            if (this.isDragging == 1) this.toggleCell(e.clientX, e.clientY);
        });

        this.canvas.addEventListener("mouseup", () => {
            this.isDragging ^= 1;
        });

        toroidButton.addEventListener("click", () => {
            this.toroidal ^= 1;
            toroidButton.textContent = `Toroid: ${this.toroidal == 1 ? "On" : "Off"}`;
            console.log(this.toroidal);
        });

        //
        //window.addEventListener("keydown", (e) => {
        //    if (e.key === "p") this.pause = !this.pause;
        //});
        //
        //window.addEventListener("resize", (e) => {
        //    this.resize(e.target.innerWidth, e.target.innerHeight);
        //});
    }
    init() {
        this.cellSize = parseInt(document.getElementById("cellSizeSlider").value);
        this.columns = Math.floor(this.width / this.cellSize);
        this.rows = Math.floor(this.height / this.cellSize);
        this.gridSize = Math.floor(this.columns * this.rows);
        console.log(this.columns, this.rows, this.gridSize);
        this.grid = new Uint8Array(this.gridSize);
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = Math.random() < 0.8 ? 0 : 1;
        }
        //this.history = [this.grid];
    }

    render(ctx) {
        for (let i = 0; i < this.gridSize; i++) {
            if (this.grid[i] === 1) {
                let x = i % this.columns;
                let y = Math.floor(i / this.columns);
                ctx.save();
                ctx.fillStyle = ALIVE;
                ctx.fillRect(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize - 0.5,
                    this.cellSize - 0.5,
                );
                ctx.restore();
            }
        }
    }
    iterate() {
        if (this.running == 1) {
            let grid = new Uint8Array(this.gridSize);
            for (let i = 0; i < this.gridSize; i++) {
                let count = this.countAliveNeighbors(i);
                if (this.grid[i] === 1 && (count === 2 || count === 3)) grid[i] = 1;
                else if (this.grid[i] === 0 && count === 3) grid[i] = 1;
                else grid[i] = 0;
            }
            this.grid = grid;
        }
    }
    countAliveNeighbors(index) {
        let count = 0;
        const x = index % this.columns; // Get x and y indices of current index
        const y = Math.floor(index / this.columns);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue; // Skip self index

                let nx = x + dx;
                let ny = y + dy;
                if (this.toroidal === 1) {
                    // Calculate neighbors with toroidal grid.
                    nx = (nx + this.columns) % this.columns;
                    ny = (ny + this.rows) % this.rows;
                }

                if (nx >= 0 && nx < this.columns && nx >= 0 && ny < this.rows) {
                    let nIndex = nx + this.columns * ny;
                    count += this.grid[nIndex];
                }
            }
        }
        return count;
    }
    getGridIndex(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((clientX - rect.left) / this.cellSize);
        const y = Math.floor((clientY - rect.top) / this.cellSize);
        return y * this.columns + x;
    }
    toggleCell(clientX, clientY) {
        const index = this.getGridIndex(clientX, clientY);
        this.grid[index] = 1;
    }
}

const effect = new Effect(canvas);
let msPrev = window.performance.now();
const fps = 24;
const msPerFrame = 1000 / fps;

resetButton.addEventListener("click", () => {
    effect.init();
});
pauseButton.addEventListener("click", () => {
    effect.running ^= 1;
});

cellSizeSlider.addEventListener("input", (event) => {
    cellSize.textContent = event.target.value;
    effect.cellSize = event.target.value;
    effect.init();
});

function animate() {
    requestAnimationFrame(animate);
    const msNow = window.performance.now();
    const msPassed = msNow - msPrev;

    if (msPassed < msPerFrame) return;

    ctx.fillStyle = DEAD;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    effect.render(ctx);
    effect.iterate();

    const exccessTime = msPassed % msPerFrame;
    msPrev = msNow - exccessTime;
}
animate();
