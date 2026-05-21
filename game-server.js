'use strict';

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
const PADDLE_LEFT_COLOR = 'RED';
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

// --------------------------------------------------------------------------------------------------------------------------------------------------
// SERVIDOR DE JUEGO (GAME SERVER): Servidor Web + Servidor de Websocket (Motor de Red o Network Engin)
// --------------------------------------------------------------------------------------------------------------------------------------------------

// Incluimos las bibliotecas necesarias
const path = require('path');
const express = require('express');
const { Socket } = require('socket.io');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;

// SERVIDOR WEB -----------------------------------------------------------------------------------------------------------------------------------------

// Iniciamos el servidor HTTP para proporcionar la interfaz de juego (front-end)
function initWebServer(){
    // Configuramos el servidor para servir desde la carpeta public/
    app.use(express.static(path.join(__dirname, '/public')));

    // Indicamos cuál será la página por defecto
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    // Lanzamos el Servidor Web
    server.listen(port, () => {
        console.log(`Game Server running on port ${port}`);
    });
}

// Servidor WEBSOCKETS -------------------------------------------------------------------------------------------------------------------------

// Iniciamos el servidor WebSocket sobre el Servidor HTTP
function initNetworkEngine() {
    // Definimos la interacción con el Motor de Juego (con la interfaz gáfica del juego)

    io.on('connection', (socket) => {
        console.log(`Nuevo Jugador que quiere entrar ${socket.id}`);

        socket.on('new player', (/* data */)=> {
            // CANVAS_WIDTH = data.width;
            // CANVAS_HEIGHT = data.height;

            // Calculamos el número de jugadores a partir del objeto players
            const numberOfPlayers = Object.keys(players).length;
            //  Atendemos el evento
            onNewPlayer(socket, numberOfPlayers);

        });

        socket.on('move player', (posY) => {
            let player = players[socket.id] || {};
            player.y = posY;
        });

        socket.on('disconnect', ()=>{
            console.log(`Jugador desconectado: ${socket.id}`);
            delete players[socket.id];
        });
    });
}

function sendStatus() {
    io.emit('state', {players, ball, gameState});
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// MOTOR DE JUEGO (NETWORK ENGINE)
// ------------------------------------------------------------------------------------------------------------------------------------------------------

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

// HELPERS --------------------------------------------------------------------------------------------------------------------------------------------
function getRandomDirection(){
    return Math.random() < 0.5 ? -1 : 1;
}

function getPlayer(index){
    return Object.values(players).find(player => 
        (index===0 && player.x===0) || (index!==0 && player.x!==0)
    );
}

// OBJETOS DEL JUEGO -----------------------------------------------------------------------------------------------------------------------------------

// Declaramos los objetos del juego
let gameState = gameStateEnum.SYNC;
let players = {};
let ball = {};

// Inicializamos los objetos del juego
function onNewPlayer(socket, numberOfPlayers){

    switch (numberOfPlayers) {
        case 0:
            players[socket.id] = {
                x: 0,
                y: CANVAS_HEIGHT/2 - PADDLE_HEIGHT/2,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                color: PADDLE_LEFT_COLOR,
                score: 0
            };
            console.log(`Dando de alta al jugador A con índice ${numberOfPlayers}: ${socket.id}`);
            break;
        case 1:
            players[socket.id] = {
                x: CANVAS_WIDTH - PADDLE_WIDTH,
                y: CANVAS_HEIGHT/2 - PADDLE_HEIGHT/2,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                color: PADDLE_RIGHT_COLOR,
                score: 0
            };
            console.log(`Dando de alta al jugador B con índice ${numberOfPlayers}: ${socket.id}`);
            console.log('Ya hay 2 jugadores ...');
            console.log('Genereando nueva partida ...');

            newBall(true);

            console.log('Iniciando el juego!');
            initGameLoop();
            break;

        default:
            console.log('No se pueden unir más jugadores. Ya hay 2.');
            socket.disconnect();
            return;            
    }
}

function newBall(init=false) {
    // Si es la primera vez que se crea la pelota o si es una pelota de juego
    const directionX = init ? getRandomDirection() : (ball.velocityX>0 ? -1: 1);


    ball = {
        x: CANVAS_WIDTH/2,
        y: CANVAS_HEIGHT/2,
        radius: BALL_RADIUS,
        speed: BALL_VELOCITY,
        velocityX: BALL_VELOCITY * directionX,
        velocityY: BALL_VELOCITY * getRandomDirection(),
        color: BALL_COLOR,
    };
}

// BUCLE DEL JUEGO --------------------------------------------------------------------------------------------------------------------------------

function collisionDetect(b, p){
    // Calculamos el collider de la pelota (define la forma del objeto para colisiones)
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    //Calculamos el collider o hitbox de la pala
    p.top = p.y ;
    p.bottom = p.y+ p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    // Verificamos si hay intersección
    return b.right > p.left && b.left < p.right && b.bottom > p.top && b.top < p.bottom;

}

function update(){
    // Si no estamos en el modo PLAY saltamos
    if(gameState !== gameStateEnum.PLAY) return;

    // Pelota
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Si la pelota golpea los laterales, rebotará ........
    const ballBottom = ball.y + ball.radius;
    const ballTop = ball.y - ball.radius;

    if(ballBottom > CANVAS_HEIGHT){
        ball.y = CANVAS_HEIGHT - ball.radius;
        ball.velocityY = -ball.velocityY;
    }
    else if (ballTop < 0 ){
        ball.y = ball.radius;
        ball.velocityY = -ball.velocityY;
    }

    // Si la pelota golpea contra las palas ....
    let whatPlayer = (ball.x < CANVAS_WIDTH/2) ? getPlayer(0) : getPlayer(1);

    if (collisionDetect(ball, whatPlayer)){

        // Calculamos el punto de colisión de la pelota con la pala [-p.height/2, p.height/2]
        let collidePoint = ball.y - (whatPlayer.y + whatPlayer.height/2);

        // Normalizamos el punto de colisión [-1, 1]
        collidePoint /= whatPlayer.height/2;

        // Calculamos el ángulo de rebote en radianes [-PI/4, PI/4]
        const angleRad = collidePoint * Math.PI/4;
        
        // Calculamos el sentido de la pelota en el eje X
        const directionX = ball.x < CANVAS_WIDTH/2 ? 1 : -1;
        
        // Calculamos la velocidad (speed) de la pelota en los ejes X e Y
        ball.velocityX = ball.speed * Math.cos(angleRad) * directionX;
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        // Incrementamos la velocidad de la pelota cada vez que la golpeamos con la pala
        ball.speed += BALL_DELTA_VELOCITY;
    }

    // Si la pelota sale por los laterales...
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;

    if (ballLeft < 0) {
        console.log('Tanto del jugador de la derecha.');
        getPlayer(1).score++;
        newBall();
    }
    else if (ballRight > CANVAS_WIDTH){
        console.log('Tanto del jugador de la izquierda.');
        getPlayer(0).score++;
        newBall();
    }

    //Enviamos el estado actualizado del juego a los clientes
    sendStatus();
}

function next(){
    // Si ha terminado la partida...
    if(gameState === gameStateEnum.END){
        console.log('Game Over');
        stopGameLoop();
        return;
    }

    // Si ha ganado alguien...
    if (getPlayer(0).score>=NUM_BALLS || getPlayer(0).score>=NUM_BALLS ){
        gameState = gameStateEnum.END;
        sendStatus();
    }
}

// Helpers para gestionar el bucle del juego
let gameLoopId; // Identifica el bucle del guego

function gameLoop(){
    update();
    next();
}

function initGameLoop(){
    gameLoopId = setInterval(gameLoop, 1000 / FRAME_PER_SECOND);
    gameState = gameStateEnum.PLAY;
    sendStatus();
}

function stopGameLoop(){
    clearInterval(gameLoopId);
}

// --------------------------------------------------------------------------------------------------------------------------------------------------
// Inicialización del Servidor de Juego: Servidor Web + Servidor de WebSockets (Motor de Red)
// --------------------------------------------------------------------------------------------------------------------------------------------------

function init() {
    initWebServer();
    initNetworkEngine();
}

// Punto de entrada al código
init();


//hostname-i
//^C
//sudo ufw allow 300/tcp
//commit "Pong Multijugador en Red"
//Actualizar version a 3.0.0
//git tag v3.0.0
