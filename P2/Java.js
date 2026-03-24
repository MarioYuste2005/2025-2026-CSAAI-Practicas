let tiempo = 60000;
let intervalo = null;

const reloj = document.getElementById("reloj");
const estado = document.getElementById("estado");

const start = document.getElementById("botstart");
const stop = document.getElementById("botstop");
const reset = document.getElementById("botreset");
const intentos = document.getElementById("intentos");

let codigo = [];
let display = document.querySelectorAll(".digi");

function generarCodigo(){

    codigo = [];

    for(let i = 0; i < 4; i++){

        let numero = Math.floor(Math.random() * 10);
        codigo.push(numero);

        display[i].textContent = "*";
        display[i].style.color = "#FC1723";
        
        timer = true;
        intentos.textContent = `Numero de Intentos Restantes: ${trys}`;
        
    }

}

function actualizarReloj(){

    let minutos = Math.floor(tiempo / 60000);
    let segundos = Math.floor((tiempo % 60000) / 1000);
    let milisegundos = tiempo % 1000;

    minutos = minutos.toString().padStart(2,"0");
    segundos = segundos.toString().padStart(2,"0");
    milisegundos = milisegundos.toString().padStart(3,"0");

    reloj.textContent = `${minutos}:${segundos}:${milisegundos}`;
}

function startTimer(){

    activarBotones();

    if(intervalo !== null) return;

    intervalo = setInterval(() => {

        tiempo -= 10;
        actualizarReloj();

        if(tiempo <= 0 || trys == 0){

            clearInterval(intervalo);
            intervalo = null;

            timer = false;
            reloj.textContent = "00:00:000";
            estado.textContent = "💥 BOOM!";
            bloquearBotones();
        }

    },10);

}

function stopTimer(){

    clearInterval(intervalo);
    intervalo = null;

}

function resetTimer(){

    stopTimer();

    tiempo = 60000;
    actualizarReloj();

    generarCodigo();

    estado.textContent = "Todo listo, pulsa start o un numero para empezar";

    activarBotones();

    start.disabled = false;

}

function comprobarNumero(numero){

    for(let i = 0; i < codigo.length; i++){

        if(codigo[i] === numero){

            display[i].textContent = numero;
            display[i].style.color = "#3DFF00";

        }

    }

    comprobarVictoria();

}

function comprobarVictoria(){

    let completo = true;

    for(let i = 0; i < display.length; i++){

        if(display[i].textContent === "*"){
            completo = false;
        }

    }

    if(completo){

        estado.textContent = "🎉 Bomba desactivada";
        stopTimer();
        bloquearBotones();
        start.disabled = true;

    }

}

function restar(){
    trys -= 1;
    intentos.textContent = `Numero de Intentos Restantes: ${trys}`;
}

function bloquearBotones(){

    botones.forEach(boton => {
        boton.disabled = true;
    });

}

function activarBotones(){

    botones.forEach(boton => {
        boton.disabled = false;
    });

}

start.addEventListener("click", startTimer);
stop.addEventListener("click", stopTimer);
reset.addEventListener("click", resetTimer);

trys = 7;
timer = true;
generarCodigo();
actualizarReloj();

let botones = document.querySelectorAll(".boton");

botones.forEach(boton => {
    boton.addEventListener("click", () => {

        startTimer();
        let numero = parseInt(boton.textContent);

        comprobarNumero(numero);

        boton.style.borderColor = "grey"; 
        boton.style.color = "grey"; 

        restar();

        reset.addEventListener("click", () => {
            boton.style.color = "#3DFF00"; 
            boton.style.borderColor = "#00FF44";
            trys = 7;
            intentos.textContent = `Numero de Intentos Restantes: ${trys}`;
        })
    });

});
