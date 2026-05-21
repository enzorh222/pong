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
const PADDLE_ACTIVE_COLOR = "RED";
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

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// CLIENTE WebSocket del NETWORK ENGINE
// ------------------------------------------------------------------------------------------------------------------------------------------------------
const WEBSOCKET_SERVER = ""; //127.0.0.1, 0.0.0.0, ws://172.23.45.32:3000
let socket;

function initServerConnection(){
    //Iniciamos la conexión con el servidor
    socket = io(WEBSOCKET_SERVER);

    //Solicitamos la incorporación del jugador
    socket.emit('new player' /*, {cvsWidth: cvs.width, cvsHeight: cvs.height} */);

    //Indicamos como atender el evento o mensaje de conexión
    socket.on('connect', () => {
        console.log(`Conexión de ${socket.id}`);
    });

    socket.on('state', onUpdate);
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// MOTOR DE CONTROL (CONTROL ENGINE)
// ------------------------------------------------------------------------------------------------------------------------------------------------------

// Manejador de Eventos (Handle del Ratón)
function initPaddleMovement(){
    cvs.addEventListener('mousemove', (event)=>{
        if(gameState !== gameStateEnum.PLAY) return;
        
        const rect = cvs.getBoundingClientRect();
        const localPlayer = players[socket.id];

        localPlayer.y = event.clientY - (localPlayer.height/2) - rect.top;
        socket.emit('move player', localPlayer.y);
    });
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// MOTOR DE JUEGO (GAME ENGINE)
// ------------------------------------------------------------------------------------------------------------------------------------------------------

const CANVAS_WIDTH = cvs.width;
const CANVAS_HEIGHT = cvs.height;

// OBJETOS DEL JUEGO -----------------------------------------------------------------------------------------------------------------------------------

// Declaramos los objetos del juego
let gameState = gameStateEnum.SYNC;
let players = {};
let ball = {};

// BUCLE DEL JUEGO --------------------------------------------------------------------------------------------------------------------------------

function onUpdate(gameObjects){
    players = gameObjects.players;
    players[socket.id].color = PADDLE_ACTIVE_COLOR;
    ball = gameObjects.ball;
    gameState = gameObjects.gameState
}

function render(){
    if(gameState === gameStateEnum.PAUSE){
        drawText('PAUSA', CANVAS_WIDTH/4, CANVAS_HEIGHT/2);
        return;
    }

    if(gameState === gameStateEnum.SYNC){
        drawText('Esperando rival...', CANVAS_WIDTH/4, CANVAS_HEIGHT/2);
        return;
    }

    if(gameState === gameStateEnum.PLAY){
        drawBoard();
        drawScore(players);
        for(let id in players){
            drawPaddle(players[id]);
        }
        drawBall(ball);
    }

    if(gameState === gameStateEnum.END){
        drawBoard();
        drawScore(players);
        for(let id in players){
            drawPaddle(players[id]);
        }

        drawText('Game Over...', CANVAS_WIDTH/3, CANVAS_HEIGHT/2);
    }
}

function next(){
    // Si ha terminado la partida...
    if(gameState === gameStateEnum.END){
        console.log('Game Over');
        stopGameLoop();
        socket.disconnect();
        return;
    }
}

// Helpers para gestionar el bucle del juego
let gameLoopId; // Identifica el bucle del guego

function gameLoop(){
    render();
    next();
}

function initGameLoop(){
    gameLoopId = setInterval(gameLoop, 1000 / FRAME_PER_SECOND);
}

function stopGameLoop(){
    clearInterval(gameLoopId);
}

// -----------------------------------------------------------------------------------------------------------------------------------------------
// Inicialización del Motor del Juego
// -----------------------------------------------------------------------------------------------------------------------------------------------

function init(){
    initServerConnection();
    drawBoard();
    initPaddleMovement();
    initGameLoop();
}

// Punto de Entrada: Iniciamos el juego
init();
