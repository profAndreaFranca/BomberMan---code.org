// ======================================
// BOMBER MAN SIMPLIFICADO - GAME LAB
// ======================================

var jogador;
var paredes;
var caixas;
var inimigos;
var bombas;
var fogos;

var pontos = 0;
var vidas = 3;
var gameState = "jogar";

var velocidadeJogador = 2.5;
var tempoParaNovaBomba = 0;
var podeSoltarBomba = false;

var poderes;
var bombaForte = false;

iniciarJogo();

function draw() {
  background("green");

  if (gameState == "jogar") {
    controlarJogador();
    moverInimigos();
    atualizarBombas();
    atualizarFogos();
    verificarDanos();
    verificarVitoria();
    jogador.overlap(poderes, pegarPoder);
  }

  drawSprites();
  desenharPainel();

  if (gameState == "gameOver") {
    telaGameOver();
  }

  if (gameState == "venceu") {
    telaVitoria();
  }
}

function iniciarJogo() {
  removerGrupoSeExistir(paredes);
  removerGrupoSeExistir(caixas);
  removerGrupoSeExistir(inimigos);
  removerGrupoSeExistir(bombas);
  removerGrupoSeExistir(fogos);
  removerGrupoSeExistir(poderes);

  paredes = createGroup();
  caixas = createGroup();
  inimigos = createGroup();
  bombas = createGroup();
  fogos = createGroup();
  poderes = createGroup();

  pontos = 0;
  vidas = 3;
  gameState = "jogar";
  tempoParaNovaBomba = 0;
  podeSoltarBomba = false;
  bombaForte = false;

  criarCenario();
  criarJogador();
  criarInimigos();
}

function reiniciarJogo() {
  if (jogador) {
    jogador.remove();
  }
  iniciarJogo();
}

function removerGrupoSeExistir(grupo) {
  if (grupo) {
    for (var i = grupo.length - 1; i >= 0; i--) {
      grupo[i].remove();
    }
  }
}

function criarCenario() {
  for (var x = 12.5; x <= 387.5; x = x + 25) {
    adicionarParede(x, 37.5);
    adicionarParede(x, 387.5);
  }

  for (var y = 37.5; y <= 387.5; y = y + 25) {
    adicionarParede(12.5, y);
    adicionarParede(387.5, y);
  }

  for (var y = 87.5; y <= 337.5; y = y + 50) {
    for (var x = 62.5; x <= 337.5; x = x + 50) {
      adicionarParede(x, y);
    }
  }

  criarCaixas();
}

function adicionarParede(x, y) {
  var parede = createSprite(x, y, 25, 25);
  parede.setAnimation("wall");
  parede.scale = 0.25;
  paredes.add(parede);
}

function adicionarCaixa(x, y) {
  var caixa = createSprite(x, y, 25, 25);
  caixa.setAnimation("box");
  caixa.scale = 0.25;
  caixas.add(caixa);
}

function criarCaixas() {
  for (var y = 62.5; y <= 362.5; y = y + 25) {
    for (var x = 37.5; x <= 362.5; x = x + 25) {

      if (posicaoLivreParaCaixa(x, y) && randomNumber(1, 100) <= 65) {
        adicionarCaixa(x, y);
      }
    }
  }
}

function posicaoLivreParaCaixa(x, y) {
  var teste = createSprite(x, y, 25, 25);
  teste.visible = false;

  var livre = true;

  // não criar caixa onde já tem parede fixa
  if (teste.isTouching(paredes)) {
    livre = false;
  }

  // área inicial do jogador livre
  if (x <= 80 && y < 100) {
    livre = false;
  }

  // áreas dos inimigos livres
  if ((x <= 70 && y > 330)||
      (x > 330 && y> 330)||
      (x > 330 && y < 100)
      ) {
    livre = false;
  }

  teste.remove();
  return livre;
}

function criarJogador() {
  jogador = createSprite(37.5, 62.5, 25, 25);
  //jogador.shapeColor = "blue";
  jogador.setAnimation("bomberman-frente");
  
  jogador.scale = 0.2;
}

function controlarJogador() {
  jogador.velocityX = 0;
  jogador.velocityY = 0;

  if (keyDown("left")) {
    jogador.velocityX = -velocidadeJogador;
    jogador.setAnimation("bomberman-esquerda");
  }
  if (keyDown("right")) {
    jogador.velocityX = velocidadeJogador;
    jogador.setAnimation("bomberman-direita");
  }
  if (keyDown("up")) {
    jogador.velocityY = -velocidadeJogador;
    jogador.setAnimation("bomberman-costas");
  }
  if (keyDown("down")) {
    jogador.velocityY = velocidadeJogador;
    jogador.setAnimation("bomberman-frente");
  }

  jogador.collide(paredes);
  jogador.collide(caixas);

  if (tempoParaNovaBomba > 0) {
    tempoParaNovaBomba = tempoParaNovaBomba - 1;
  }

  if (!keyDown("space")) {
    podeSoltarBomba = true;
  }

  if (keyDown("space") && podeSoltarBomba && tempoParaNovaBomba <= 0 && gameState == "jogar") {
    criarBomba();
    tempoParaNovaBomba = 25;
    podeSoltarBomba = false;
  }
}

function criarBombaPara(x, y, dono, tempo) {
  var bx = alinharNaGrade(x);
  var by = alinharNaGrade(y);

  for (var i = 0; i < bombas.length; i++) {
    if (bombas[i].x == bx && bombas[i].y == by) {
      return;
    }
  }

  var bomba = createSprite(bx, by, 22, 22);
  bomba.setAnimation("bomb");
  bomba.scale = 0.3;
  bomba.tempo = tempo;
  bomba.dono = dono;
  bombas.add(bomba);
}

function criarBomba() {
  criarBombaPara(jogador.x, jogador.y, "jogador", 60);
}

function criarBombaInimigo(inimigo) {
  criarBombaPara(inimigo.x, inimigo.y, "inimigo", 70);
}

function alinharNaGrade(valor) {
  var celula = Math.round((valor - 12.5) / 25);
  return 12.5 + celula * 25;
}

function atualizarBombas() {
  for (var i = bombas.length - 1; i >= 0; i--) {
    bombas[i].tempo = bombas[i].tempo - 1;

    if (bombas[i].tempo <= 0) {
      explodirBomba(bombas[i]);
    }
  }
}

function explodirBomba(bomba) {
  var x = bomba.x;
  var y = bomba.y;
  var dono = bomba.dono;

  criarFogo(x, y, dono, "chama0");

  criarFogoDirecao(x, y, 25, 0, dono);
  criarFogoDirecao(x, y, -25, 0, dono);
  criarFogoDirecao(x, y, 0, 25, dono);
  criarFogoDirecao(x, y, 0, -25, dono);

  if (bombaForte && dono == "jogador") {
    criarFogoDirecao(x + 25, y, 25, 0, dono);
    criarFogoDirecao(x - 25, y, -25, 0, dono);
    criarFogoDirecao(x, y + 25, 0, 25, dono);
    criarFogoDirecao(x, y - 25, 0, -25, dono);
  }

  bomba.remove();
}

function criarFogoDirecao(x, y, dx, dy, dono) {
  var novoX = x + dx;
  var novoY = y + dy;
  var animation = "chama0";
  if(dx != 0){
    animation = "chama1";
  }
  if (dy != 0){
    animation = "chama2";
  }

  if (temParedeEm(novoX, novoY)) {
    return;
  }
  criarFogo(novoX, novoY, dono,animation);
  destruirCaixaEm(novoX, novoY);
}

function criarFogo(x, y, dono,animation) {
  var fogo = createSprite(x, y, 24, 24);
  fogo.setAnimation(animation);
  fogo.scale = 0.3;
  fogo.tempo = 18;
  fogo.dono = dono;
  fogos.add(fogo);
}

function atualizarFogos() {
  for (var i = fogos.length - 1; i >= 0; i--) {
    fogos[i].tempo = fogos[i].tempo - 1;

    if (fogos[i].tempo <= 0) {
      fogos[i].remove();
    }
  }
}

function temParedeEm(x, y) {
  for (var i = 0; i < paredes.length; i++) {
    if (paredes[i].x == x && paredes[i].y == y) {
      return true;
    }
  }
  return false;
}

function destruirCaixaEm(x, y) {
  for (var i = caixas.length - 1; i >= 0; i--) {
    if (caixas[i].x == x && caixas[i].y == y) {
      caixas[i].remove();
      pontos = pontos + 5;

      if (randomNumber(1, 100) <= 25) {
        criarPoder(x, y);
      }

      return true;
    }
  }
  return false;
}

function criarPoder(x, y) {
  var poder = createSprite(x, y, 20, 20);
  poder.setAnimation("power");
  poder.scale = 0.25;
  poderes.add(poder);
}

function pegarPoder(jogador, poder) {
  poder.remove();
  bombaForte = true;
}

function criarInimigos() {
  adicionarInimigo(337.5, 62.5, "inimigo1");
  adicionarInimigo(337.5, 337.5,"inimigo2");
  adicionarInimigo(37.5, 337.5, "inimigo3");
}

function adicionarInimigo(x, y,animacao) {
  var inimigo = createSprite(x, y, 24, 24);
  //inimigo.shapeColor = cor;
  inimigo.setAnimation(animacao);
  inimigo.scale = 0.2;
  inimigo.velocidade = 1;
  inimigo.tempoDirecao = 0;
  inimigo.tempoBomba = randomNumber(80, 160);
  inimigo.velocityX = 0;
  inimigo.velocityY = 0;
  escolherNovaDirecao(inimigo);
  inimigos.add(inimigo);
}

function moverInimigos() {
  for (var i = 0; i < inimigos.length; i++) {
    var inimigo = inimigos[i];

    inimigo.collide(paredes);
    inimigo.collide(caixas);

    inimigo.tempoDirecao = inimigo.tempoDirecao - 1;

    if (inimigo.tempoDirecao <= 0) {
      escolherNovaDirecao(inimigo);
    }

    if (inimigo.velocityX == 0 && inimigo.velocityY == 0) {
      escolherNovaDirecao(inimigo);
    }

    inimigo.tempoBomba = inimigo.tempoBomba - 1;

    if (inimigo.tempoBomba <= 0 && gameState == "jogar") {
      criarBombaInimigo(inimigo);
      inimigo.tempoBomba = randomNumber(100, 180);
    }
  }
}

function escolherNovaDirecao(inimigo) {
  var direcao = randomNumber(1, 4);
  var v = inimigo.velocidade;

  inimigo.velocityX = 0;
  inimigo.velocityY = 0;

  if (direcao == 1) {
    inimigo.velocityX = v;
  } else if (direcao == 2) {
    inimigo.velocityX = -v;
  } else if (direcao == 3) {
    inimigo.velocityY = v;
  } else {
    inimigo.velocityY = -v;
  }

  inimigo.tempoDirecao = randomNumber(20, 50);
}

function verificarDanos() {
  for (var i = inimigos.length - 1; i >= 0; i--) {
    for (var j = 0; j < fogos.length; j++) {
      if (fogos[j].dono == "jogador" && inimigos[i].isTouching(fogos[j])) {
        inimigos[i].remove();
        pontos = pontos + 20;
        break;
      }
    }
  }

  if (jogador.isTouching(fogos)) {
    perderVida();
    return;
  }

  if (jogador.isTouching(inimigos)) {
    perderVida();
    return;
  }
}

function perderVida() {
  vidas = vidas - 1;

  jogador.x = 60;
  jogador.y = 60;
  jogador.velocityX = 0;
  jogador.velocityY = 0;
  bombaForte = false;

  if (vidas <= 0) {
    gameState = "gameOver";
    pararJogo();
  }
}

function verificarVitoria() {
  if (inimigos.length == 0) {
    gameState = "venceu";
    pararJogo();
  }
}

function pararJogo() {
  jogador.velocityX = 0;
  jogador.velocityY = 0;

  for (var i = 0; i < inimigos.length; i++) {
    inimigos[i].velocityX = 0;
    inimigos[i].velocityY = 0;
  }
}
function desenharPainel() {
  fill("white");
  textSize(18);
  textAlign(LEFT);
  text("Pontos: " + pontos, 20, 20);
  text("Vidas: " + vidas, 300, 20);
  textSize(12);
  text("Setas para mover | Espaço para bomba", 70, 395);
}
function telaGameOver() {
  fill("red");
  textAlign(CENTER);
  textSize(28);
  text("GAME OVER", 200, 180);
  fill("white");
  textSize(18);
  text("Aperte espaço para reiniciar", 200, 220);
  if (keyDown("space")) {
    reiniciarJogo();
  }
}
function telaVitoria() {
  fill("yellow");
  textAlign(CENTER);
  textSize(28);
  text("VOCÊ VENCEU!", 200, 180);
  fill("white");
  textSize(18);
  text("Aperte espaço para jogar novamente", 200, 220);
  if (keyDown("space")) {
    reiniciarJogo();
  }
}
