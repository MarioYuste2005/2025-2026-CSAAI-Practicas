const canvas = document.getElementById("canvas");

//-- Definir el tamaño del canvas
canvas.width = 300;
canvas.height = 175;
const ctx = canvas.getContext("2d");

//-- Leer la imagen del documento html
//-- Esta deshabilitada
var player = document.getElementById("jugador");
//
player.onload = ()=> {
  //-- Insertar la imagen en el canvas, una vez que
  //-- ya esté cargada!
  ctx.drawImage(player, 140,135);
};
let x = 0;
let y = 10;

//-- Velocidades del objeto
let velx = 3;
let vely = 1;

//-- Función principal de animación
function update() 
{
  console.log("test");
  //-- Algoritmo de animación:
  //-- 1) Actualizar posición del  elemento
  //-- (física del movimiento rectilíneo uniforme)

   //-- Condición de rebote en extremos verticales del canvas
   if (x < 0 || x >= (canvas.width - 20) ) {
    velx = -velx;
  }

  //-- Condición de rebote en extremos horizontales del canvas
  if (y <= 0 || y > 80) {
    vely = -vely;
  }

  //-- Actualizar la posición
  x = x + velx;
  y = y + vely;

  //-- 2) Borrar el canvas
  ctx.clearImage(0, 0, canvas.width, canvas.height);

  //-- 3) Dibujar los elementos visibles
  ctx.beginPath();
    ctx.drawImage(player, 140,135);


  //-- 4) Volver a ejecutar update cuando toque
  requestAnimationFrame(update);
}

//-- Empezar la animación
update();