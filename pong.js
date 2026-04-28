'use strict'

// Constantes básicas del juego
const FRAME_PER_SECOND = 50;

const NUM_BALLS = 5;

const BG_COLOR = 'BLACK';

const FONT_COLOR = 'GREEN';
const FONT_SCORE_COLOR = 'WHITE';
const FONT_GAME_OVER_COLOR = 'BLUE';
const FONT_FAMILY = 'impact';
const FONT_SIZE = '45px';

const NET_COLOR = 'WHITE';
const NET_WIDTH = 4;
const NET_HEIGHT = 10;
const NET_PADDING = 15;

const PADDLE_RIGHT_COLOR = 'WHITE';
const PADDLE_LEFT_COLOR = 'WHITE';
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;

const BALL_COLOR = 'WHITE';
const BALL_RADIUS = 10;
const BALL_DELTA_VELOCITY = 0.5;
const BALL_VELOCITY = 5;

const gameStateEnum = {
    SYNC: 0,
    PLAY: 1,
    PAUSE: 2,
    END: 3,
};

//----------------------------------------------------------------------------
//MOTOR GRAFICO (GRAPHIC ENGINE)
//----------------------------------------------------------------------------

//Recuperamos el canvas de la página web
const cvs = document.getElementById('pong_canvas');

//obntenemos el contexto 2d del canvas
const ctx =  cvs.getContext('2d');

//Layer 0: BASIC CANVAS DRAW HELPERS -----------------------------------------

function drawRect(x,y,w,h,color){

    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
}

function drawCircle(x,y,r,color){
    ctx.fillStyle = color

    ctx.beginPath();
    ctx. arc(x,y,r,0,2*Math.PI);
    ctx.closePath();
    ctx.fill();
}

function drawText(text,x,y,color = FONT_COLOR, fontSize = FONT_SIZE, fontFamily = FONT_FAMILY){

    ctx.fillStyle = color; //'BLUE'
    ctx.font = `${fontSize} ${fontFamily}`//'45px impact';
    ctx.fillText(text, x,y);
}

const CANVAS_WIDTH=cvs.width;
const CANVAS_HEIGHT=cvs.height;

drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT, BG_COLOR);
drawCircle(70,80,10,BALL_COLOR);
drawText('Saludos',200,200);


