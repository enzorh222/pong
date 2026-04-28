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

//Recuperamos el canvas de la página web
const cvs = document.getElementById('pong_canvas');

//obntenemos el contexto 2d del canvas
const ctx =  cvs.getContext('2d');

ctx.fillStyle = BG_COLOR;
ctx.fillRect(0,0,600,400);

ctx.fillStyle = BALL_COLOR

ctx.fillStyle = BALL_COLOR

ctx.beginPath();
ctx. arc(50,60,10,0,2*Math.PI);
ctx.closePath();
ctx.fill();

ctx.fillStyle = FONT_GAME_OVER_COLOR; //'BLUE'
ctx.font = '45px impact';
ctx.fillText('Saludos', 200,200);