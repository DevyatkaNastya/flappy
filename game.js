const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

let frames = 0;

const sprite = new Image();
sprite.src = "img/sprite.png";

//game states
const state = {
    current: 0,
    ready: 0,
    game: 1,
    over: 2
}

//start butt
const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29
}

cvs.addEventListener("click", function(evt) {
    switch (state.current) {
        case state.ready:
            state.current = state.game;
            break;
        case state.game:
            bird.flap();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;

            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                wall.reset();
                bird.speedReset();
                score.reset();
                state.current = state.ready;
            }
            break;
    }
});

//back
const bg = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: cvs.height - 226,

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
}

//fore
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    dx: 2,

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);

    },

    update: function() {
        if (state.current == state.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }
}

//bird
const bird = {
    animation: [
        { sX: 276, sY: 112 },
        { sX: 276, sY: 139 },
        { sX: 276, sY: 164 },
        { sX: 276, sY: 139 },
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,

    radius: 12,

    frame: 0,
    gravity: 0.25,
    jump: 5,
    speed: 0,

    draw: function() {
        let bird = this.animation[this.frame];
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    },

    flap: function() {
        this.speed = -this.jump;
    },

    update: function() {
        //if ready - bird flap slowly
        this.period = state.current == state.ready ? 10 : 5;
        this.frame += frames % this.period == 0 ? 1 : 0;
        this.frame = this.frame % this.animation.length;

        if (state.current == state.ready) {
            this.y = 150; //after over
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            if (this.y + this.h / 2 >= cvs.height - fg.h) {
                this.y = cvs.height - fg.h - this.h / 2;
                if (state.current == state.game) {
                    state.current = state.over;
                }
            }
            if (this.speed >= this.jump) {
                this.frame = 1;
            }
        }
    },
    speedReset: function() {
        this.speed = 0;
    }
}

//message *ready*
const ready = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width / 2 - 172 / 2,
    y: 80,

    draw: function() {
        if (state.current == state.ready) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

//game over
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width / 2 - 224 / 2,
    y: 90,

    draw: function() {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

//wall
const wall = {
    position: [],

    top: {
        sX: 553,
        sY: 0
    },

    bottom: {
        sX: 502,
        sY: 0
    },
    w: 53,
    h: 400,
    gap: 100,
    maxYPos: -150,
    dx: 2,

    draw: function() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            //top
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);
            //bottom
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    update: function() {
        if (state.current !== state.game) return;

        if (frames % 100 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let bottomWallYPos = p.y + this.h + this.gap;

            //collision
            //top
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                state.current = state.over;
            }
            //bottom
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomWallYPos && bird.y - bird.radius < bottomWallYPos + this.h) {
                state.current = state.over;
            }

            p.x -= this.dx;

            if (p.x + this.w <= 0) {
                this.position.shift();
                score.value += 1;

                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },
    reset: function() {
        this.position = [];
    }
}

const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,

    draw: function() {
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";

        if (state.current == state.game) {
            ctx.lineWidth = 2;
            ctx.font = "40px Teko";
            ctx.fillText(this.value, cvs.width / 2, 50);
            ctx.strokeText(this.value, cvs.width / 2, 50);

        } else if (state.current == state.over) {
            ctx.font = "30px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            //best
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);

        }
    },
    reset: function() {
        this.value = 0;
    }
}

function draw() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    bg.draw();
    wall.draw();
    fg.draw();
    bird.draw();
    ready.draw();
    gameOver.draw();
    score.draw();

}

function update() {
    bird.update();
    fg.update();
    wall.update();

}

function loop() {
    update();
    draw();
    frames++;

    requestAnimationFrame(loop);

}
loop();