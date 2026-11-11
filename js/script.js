console.log('script.js carregou');

/* =========================================================
   SCRIPT - LOJA 3D PRINT (Aula 11)

   TEMA: preços dos produtos no Pix (10% de desconto),
         classificados em faixas.
   PADRÃO: processar → classificar → mostrar
     - calcularPrecoPix:  processa (aplica o desconto do Pix)
     - classificarFaixa:  classifica (barato / médio / caro)
     - criarCartaoProduto: monta o elemento do produto (DOM)

   Aproveita o CSS que o projeto já tem: .grade-produtos e
   .card-produto (layout.css), .card (style.css) e .etiqueta
   (faixas.css). A cor de cada faixa vem da variável --tone.
   ========================================================= */

// ---------------------------------------------------------
// 1. DADOS
// ---------------------------------------------------------
const produtosVitrine = [
  { nome: 'Miniatura de dragão (10cm)', categoria: 'Miniaturas e action figures', preco: 49.9 },
  { nome: 'Suporte de celular articulado', categoria: 'Suportes e organizadores', preco: 29.9 },
  { nome: 'Vaso geométrico decorativo', categoria: 'Peças decorativas', preco: 39.9 },
  { nome: 'Action figure articulado', categoria: 'Miniaturas e action figures', preco: 89.9 },
  { nome: 'Porta-cabos organizador', categoria: 'Suportes e organizadores', preco: 19.9 },
  { nome: 'Luminária lithophane', categoria: 'Peças decorativas', preco: 119.9 },
];

// Texto mostrado para cada faixa (a chave também vira classe CSS)
const rotulosFaixa = {
  barato: 'Barato',
  medio: 'Médio',
  caro: 'Caro',
};

// ---------------------------------------------------------
// 2. FUNÇÕES QUE CALCULAM (não mexem na página)
// ---------------------------------------------------------

// Processa: devolve o preço pagando no Pix, arredondado em centavos.
// O desconto tem valor padrão de 10% (0.1) e o preço original não muda.
function calcularPrecoPix(preco, desconto = 0.1) {
  const precoComDesconto = preco * (1 - desconto);
  return Math.round(precoComDesconto * 100) / 100;
}

// Classifica: devolve a chave da faixa (3 faixas, da menor para a maior)
function classificarFaixa(precoPix) {
  if (precoPix < 40) {
    return 'barato';
  } else if (precoPix < 100) {
    return 'medio';
  } else {
    return 'caro';
  }
}

// Formata um número como dinheiro: 44.91 vira "R$ 44,91"
function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ---------------------------------------------------------
// 3. TESTES NO CONSOLE (confira à mão antes de ligar à página)
//    calcularPrecoPix(100)       → 90
//    calcularPrecoPix(100, 0.5)  → 50
//    calcularPrecoPix(100, 0)    → 100
//    classificarFaixa(39.99)     → "barato"
//    classificarFaixa(40)        → "medio"
//    classificarFaixa(100)       → "caro"
// ---------------------------------------------------------

// ---------------------------------------------------------
// 4. ARRAYS: map, filter, reduce e sort (em uma cópia)
// ---------------------------------------------------------
function analisarLista(lista) {
  // map: um novo array com o resultado de cada produto (o original não muda)
  const analisados = lista.map((produto) => {
    const precoPix = calcularPrecoPix(produto.preco);
    return { ...produto, precoPix, faixa: classificarFaixa(precoPix) };
  });

  // filter: só os produtos da faixa "caro"
  const caros = analisados.filter((produto) => produto.faixa === 'caro');

  // sort: copiamos com [...] antes, porque o sort altera o array original
  const ordenados = [...analisados].sort((a, b) => a.precoPix - b.precoPix);

  // reduce: valor total da vitrine pagando no Pix
  const total = analisados.reduce((soma, produto) => soma + produto.precoPix, 0);

  return { ordenados, caros, total, media: total / analisados.length };
}

// ---------------------------------------------------------
// 5. FUNÇÕES QUE MEXEM NA PÁGINA (DOM)
// ---------------------------------------------------------

// Monta e devolve o elemento de um produto
function criarCartaoProduto(produto) {
  const cartao = document.createElement('article');
  cartao.classList.add('card', 'card-produto', `faixa-${produto.faixa}`);

  const titulo = document.createElement('h3');
  titulo.classList.add('card-produto-titulo');
  titulo.textContent = produto.nome;

  const etiqueta = document.createElement('span');
  etiqueta.classList.add('etiqueta');
  etiqueta.textContent = rotulosFaixa[produto.faixa];

  const categoria = document.createElement('p');
  categoria.classList.add('card-produto-descricao');
  categoria.textContent = produto.categoria;

  const preco = document.createElement('p');
  preco.classList.add('card-produto-preco');
  preco.textContent = `${formatarPreco(produto.precoPix)} no Pix (de ${formatarPreco(produto.preco)})`;

  cartao.append(titulo, etiqueta, categoria, preco);
  return cartao;
}

// Monta e devolve a grade com um cartão por produto
function criarGradeCartoes(produtos) {
  const grade = document.createElement('div');
  grade.classList.add('grade-produtos');
  produtos.forEach((produto) => {
    grade.append(criarCartaoProduto(produto));
  });
  return grade;
}

// Monta e devolve o parágrafo de resumo
function criarResumo(total, media, quantidadeCaros) {
  const resumo = document.createElement('p');
  resumo.classList.add('secao-dica', 'resumo-produtos');
  const palavra = quantidadeCaros === 1 ? 'produto caro' : 'produtos caros';
  resumo.textContent =
    `Vitrine toda no Pix: ${formatarPreco(total)} · ` +
    `Preço médio: ${formatarPreco(media)} · ` +
    `${quantidadeCaros} ${palavra}`;
  return resumo;
}

// Seleciona a área e confirma que existe; se não existir, cria uma
function obterAreaResultado() {
  let area = document.querySelector('#resultado');
  if (area !== null) return area;

  console.warn('Área #resultado não encontrada no index.html. Criando uma.');
  area = document.createElement('section');
  area.id = 'resultado';

  const titulo = document.createElement('h2');
  titulo.textContent = 'Preços no Pix';
  area.append(titulo);

  const referencia = document.querySelector('#destaques');
  if (referencia !== null) {
    referencia.after(area);
  } else {
    (document.querySelector('main') ?? document.body).append(area);
  }
  return area;
}

function mostrarResultado() {
  const area = obterAreaResultado();
  const { ordenados, caros, total, media } = analisarLista(produtosVitrine);

  area.append(
    criarResumo(total, media, caros.length),
    criarGradeCartoes(ordenados)
  );
}

mostrarResultado();
