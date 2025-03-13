/*
 * Implementation of the game of Breakout
 *
 * María Rivera
 * 2025-03-12
 */

"use strict";

// Global variables
const canvasWidth = 800;
const canvasHeight = 600;

let oldTime;
const paddleVelocity = 1.0;
const speedIncrease = 1.1;
const initialSpeed = 0.5;

let bricks = [];
let lives = 3;

// Context of the Canvas
let ctx;

// Clases for the Breakout game
class Ball extends GameObject {
    constructor(position, width, height, color) {
        super(position, width, height, color, "ball");
        this.reset();
    }

    update(deltaTime) {
        this.position = this.position.plus(this.velocity.times(deltaTime));
    }

    initVelocity() {
        this.inPlay = true;
        let angle = Math.random() * (Math.PI / 2) - (Math.PI / 4);
        this.velocity = new Vec(Math.cos(angle), Math.sin(angle)).times(initialSpeed);
    }

    reset() {
        this.inPlay = false;
        this.position = new Vec(canvasWidth / 2, canvasHeight / 2);
        this.velocity = new Vec(0, 0);
    }
}

class Paddle extends GameObject {
    constructor(position, width, height, color) {
        super(position, width, height, color, "paddle");
        this.velocity = new Vec(0.0, 0.0);
    }

    update(deltaTime) {
        this.position = this.position.plus(this.velocity.times(deltaTime));
        
        if (this.position.x < 0) {
            this.position.x = 0;
        } else if (this.position.x + this.width > canvasWidth) {
            this.position.x = canvasWidth - this.width;
        }
    }
}

class Brick extends GameObject {
    constructor(position, width, height, color) {
        super(position, width, height, color, "brick");
        this.destroyed = false;
    }
}

function createBricks() {
    bricks = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            let x = j * 135 + 65;
            let y = i * 30 + 75;
            bricks.push(new Brick(new Vec(x, y), 130, 20, "blue"));
        }
    }
}

// Game Objects
const box = new Ball(new Vec(canvasWidth / 2, canvasHeight / 2), 20, 20, "red");
const bottomPaddle = new Paddle(new Vec(canvasWidth / 2, canvasHeight - 100), 100, 20, "white");
const topBar = new GameObject(new Vec(0, 0), canvasWidth, 20, "black", "obstacle");
const bottomBar = new GameObject(new Vec(0, canvasHeight - 20), canvasWidth, 20, "green", "obstacle");
const leftBar = new GameObject(new Vec(0, 0), 20, canvasHeight, "black", "leftGoal");
const rightBar = new GameObject(new Vec(canvasWidth - 20, 0), 20, canvasHeight, "black", "rightGoal");
const leftLabel = new TextLabel(100, 50, "40px Ubuntu Mono", "white");
const rightLabel = new TextLabel(500, 50, "40px Ubuntu Mono", "white");

function main() {
    const canvas = document.getElementById("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext("2d");

    createEventListeners();
    createBricks();
    drawScene(0);
}

function createEventListeners() {
    window.addEventListener("keydown", (event) => {
        if (event.code === "ArrowLeft") {
            bottomPaddle.velocity = new Vec(-paddleVelocity, 0);
        } else if (event.code === "ArrowRight") {
            bottomPaddle.velocity = new Vec(paddleVelocity, 0);
        }
    });

    window.addEventListener("keyup", (event) => {
        if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
            bottomPaddle.velocity = new Vec(0, 0);
        }
        if (event.key === "s" && !box.inPlay) {
            box.initVelocity();
        }
    });
}

function drawScene(newTime) {
    if (oldTime === undefined) {
        oldTime = newTime;
    }
    let deltaTime = newTime - oldTime;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    leftLabel.draw(ctx, `Bricks: ${bricks.length}`);
    rightLabel.draw(ctx, `Lives: ${lives}`);
    leftBar.draw(ctx);
    rightBar.draw(ctx);
    topBar.draw(ctx);
    bottomBar.draw(ctx);
    bottomPaddle.draw(ctx);
    box.draw(ctx);

    for (let brick of bricks) {
        if (!brick.destroyed) brick.draw(ctx);
    }

    box.update(deltaTime);
    bottomPaddle.update(deltaTime);

    if (boxOverlap(box, bottomPaddle)) {
        box.velocity.y *= -1;
        box.velocity = box.velocity.times(speedIncrease);
    }
    if (boxOverlap(box, leftBar) || boxOverlap(box, rightBar)) {
        box.velocity.x *= -1;
        box.velocity = box.velocity.times(speedIncrease);
    }
    if (boxOverlap(box, topBar)) {
        box.velocity.y *= -1;
        box.velocity = box.velocity.times(speedIncrease);
    }
    if (boxOverlap(box, bottomBar)) {
        lives -= 1;
        box.reset();
    }

    for (let i = 0; i < bricks.length; i++) {
        if (!bricks[i].destroyed && boxOverlap(box, bricks[i])) {
            bricks[i].destroyed = true;
            bricks.splice(i, 1);
            box.velocity.y *= -1;
            if (bricks.length === 0) {
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.font = "48px Arial";
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.fillText("YOU WIN!", canvasWidth / 2, canvasHeight / 2);
                return;
            }
        }
    }

    if (lives === 0) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.font = "48px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2);
        return;
    }

    oldTime = newTime;
    requestAnimationFrame(drawScene);
}
