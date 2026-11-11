/* =========================================================
   LÓGICA - LOJA 3D PRINT (Aula 09)

   TEMA: controle de estoque dos produtos da loja
         (nome, categoria, preço e estoque).
   ENTRADA: o estoque mínimo desejado (1 a 50), digitado com prompt,
            e depois uma lista de produtos para o orçamento, até
            digitar "sair".
   PROCESSAMENTO: classificar cada produto pela situação do estoque,
            escolher a seção da loja pela categoria (switch) e resumir
            (contar o que precisa repor, somar o valor em estoque e
            achar o produto mais caro).
   SAÍDA: frases no console (template literal) e relatório
            com console.table.

   PSEUDOCÓDIGO:
   1. Ler o estoque mínimo e validar (cancelar, vazio, texto, inteiro, faixa)
   2. Para cada produto do estoque:
        2.1 classificar: Esgotado, Baixo (abaixo do mínimo) ou Normal
        2.2 escolher a seção da loja pela categoria (switch)
        2.3 se Esgotado ou Baixo, contar como "precisa repor"
        2.4 somar preço x estoque e atualizar o produto mais caro
   3. Pedir produtos para o orçamento até digitar "sair"
   4. Mostrar o resumo e o relatório com console.table

   TESTE DE MESA (3 primeiras voltas do laço principal, estoque mínimo = 5):
   | volta | produto                       | estoque | situação | precisaRepor | valorTotalEstoque | mais caro                |
   |-------|-------------------------------|---------|----------|--------------|-------------------|--------------------------|
   |   1   | Miniatura de dragão (10cm)    |   12    | Normal   |      0       |      598.80       | Miniatura de dragão 49.90|
   |   2   | Suporte de celular articulado |    3    | Baixo    |      1       |      688.50       | Miniatura de dragão 49.90|
   |   3   | Vaso geométrico decorativo    |    0    | Esgotado |      2       |      688.50       | Miniatura de dragão 49.90|
   ========================================================= */

// ---------------------------------------------------------
// 1. DADOS
// ---------------------------------------------------------
const produtosEstoque = [
  { nome: 'Miniatura de dragão (10cm)', categoria: 'miniaturas', preco: 49.9, estoque: 12 },
  { nome: 'Suporte de celular articulado', categoria: 'suportes', preco: 29.9, estoque: 3 },
  { nome: 'Vaso geométrico decorativo', categoria: 'decoracao', preco: 39.9, estoque: 0 },
  { nome: 'Action figure articulado', categoria: 'miniaturas', preco: 89.9, estoque: 7 },
  { nome: 'Porta-cabos organizador', categoria: 'suportes', preco: 19.9, estoque: 25 },
  { nome: 'Luminária lithophane', categoria: 'decoracao', preco: 119.9, estoque: 4 },
];

// ---------------------------------------------------------
// 2. ENTRADA COM VALIDAÇÃO
// ---------------------------------------------------------
// Devolve um número inteiro entre 1 e 50, ou null se a pessoa cancelar
function lerEstoqueMinimo() {
  while (true) {
    const entrada = prompt('Digite o estoque mínimo desejado por produto (1 a 50):');

    if (entrada === null) return null; // clicou em Cancelar

    const texto = entrada.trim();
    if (texto === '') {
      alert('Você não digitou nada. Tente de novo.');
      continue;
    }

    const numero = Number(texto);
    if (Number.isNaN(numero)) {
      alert('Digite apenas números, por exemplo 5.');
      continue;
    }
    if (!Number.isInteger(numero)) {
      alert('Digite um número inteiro, sem vírgula.');
      continue;
    }
    if (numero < 1 || numero > 50) {
      alert('O estoque mínimo precisa estar entre 1 e 50.');
      continue;
    }

    return numero;
  }
}

// ?? usa 5 como padrão quando a entrada for null (Cancelar)
const estoqueMinimo = lerEstoqueMinimo() ?? 5;

// ---------------------------------------------------------
// 3. LAÇO PRINCIPAL: classificar e resumir
// ---------------------------------------------------------
let totalPrecisaRepor = 0; // contador
let valorTotalEstoque = 0; // acumulador
let produtoMaisCaro = produtosEstoque[0]; // máximo
const relatorioEstoque = [];

for (const produto of produtosEstoque) {
  // 3.1 if / else if / else: o caso mais grave vem primeiro
  let situacao;
  if (produto.estoque === 0) {
    situacao = 'Esgotado';
  } else if (produto.estoque < estoqueMinimo) {
    situacao = 'Baixo';
  } else {
    situacao = 'Normal';
  }

  // 3.2 switch sobre a categoria (texto), com break e default
  let secao;
  switch (produto.categoria) {
    case 'miniaturas':
      secao = 'Miniaturas e action figures';
      break;
    case 'decoracao':
      secao = 'Peças decorativas para casa';
      break;
    case 'suportes':
      secao = 'Suportes e organizadores';
      break;
    default:
      secao = 'Outras categorias';
      break;
  }

  // 3.3 padrões de laço: contador, acumulador e máximo
  if (situacao !== 'Normal') {
    totalPrecisaRepor++;
  }
  valorTotalEstoque += Math.round(produto.preco * produto.estoque * 100) / 100;
  if (produto.preco > produtoMaisCaro.preco) {
    produtoMaisCaro = produto;
  }

  console.log(
    `${produto.nome} → ${situacao} | ${secao} | ${produto.estoque} un.`
  );

  relatorioEstoque.push({
    produto: produto.nome,
    secao,
    preco: produto.preco,
    estoque: produto.estoque,
    situacao,
  });
}

// ---------------------------------------------------------
// 4. WHILE: produtos para o orçamento até digitar "sair"
// ---------------------------------------------------------
const pedidos = [];
let comando = prompt('Digite o nome de um produto para o orçamento (ou "sair" para terminar):');

while (comando !== null && comando.trim().toLowerCase() !== 'sair') {
  const nomePedido = comando.trim();
  if (nomePedido !== '') {
    pedidos.push(nomePedido);
  }
  // a condição é atualizada aqui dentro: sem isso, o laço seria infinito
  comando = prompt(
    `Produtos no orçamento até agora: ${pedidos.length}. Digite outro nome ou "sair":`
  );
}

// ---------------------------------------------------------
// 5. RESULTADO
// ---------------------------------------------------------
const palavraRepor = totalPrecisaRepor === 1 ? 'produto precisa' : 'produtos precisam';

console.log(`Estoque mínimo escolhido: ${estoqueMinimo}`);
console.log(`${totalPrecisaRepor} ${palavraRepor} de reposição.`);
console.log(`Valor total em estoque: R$ ${valorTotalEstoque.toFixed(2)}`);
console.log(`Produto mais caro: ${produtoMaisCaro.nome} (R$ ${produtoMaisCaro.preco.toFixed(2)})`);
console.log(
  pedidos.length === 0
    ? 'Nenhum produto foi adicionado ao orçamento.'
    : `Produtos no orçamento: ${pedidos.join(', ')}.`
);
console.table(relatorioEstoque);
