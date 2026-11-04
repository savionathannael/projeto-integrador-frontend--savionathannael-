// =========================================================
// LOJA 3D PRINT - main.js
// 1. Categorias interativas (filtram a tabela de produtos)
// 2. Telefone com máscara e validação
// 3. Envio do formulário de orçamento
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  iniciarCategorias();
  iniciarFormulario();
});

// ---------------------------------------------------------
// 1. CATEGORIAS
// Cada <li data-categoria="..."> vira um botão. Clicar nele mostra só
// as linhas da tabela com o mesmo data-categoria. Clicar de novo limpa.
// ---------------------------------------------------------
function iniciarCategorias() {
  const secao = document.querySelector('#categorias');
  const lista = secao?.querySelector('ul');
  const itens = lista ? lista.querySelectorAll('li[data-categoria]') : [];
  if (!itens.length) return;

  const tbody = document.querySelector('#produtos tbody');
  const linhas = document.querySelectorAll('#produtos tbody tr[data-categoria]');

  // Troca o texto de cada item por um botão (acessível pelo teclado)
  itens.forEach((li) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'categoria-btn';
    botao.setAttribute('aria-pressed', 'false');
    botao.textContent = li.textContent.trim();
    li.textContent = '';
    li.append(botao);
  });

  // Mensagem de status (role="status": leitores de tela anunciam a mudança)
  const status = document.createElement('p');
  status.className = 'categoria-status';
  status.setAttribute('role', 'status');
  secao.append(status);

  // Linha exibida quando a categoria não tem nenhum produto
  let vazio = null;
  if (tbody) {
    vazio = document.createElement('tr');
    vazio.className = 'sem-produtos';
    vazio.hidden = true;
    const celula = document.createElement('td');
    celula.colSpan = tbody.closest('table').querySelectorAll('thead th').length || 2;
    celula.textContent =
      'Ainda não temos produtos nesta categoria. Peça um orçamento personalizado abaixo.';
    vazio.append(celula);
    tbody.append(vazio);
  }

  let ativa = null;

  function atualizar() {
    // Mostra ou esconde as linhas da tabela
    let visiveis = 0;
    linhas.forEach((linha) => {
      const mostrar = !ativa || linha.dataset.categoria === ativa;
      linha.hidden = !mostrar;
      if (mostrar) visiveis++;
    });
    if (vazio) vazio.hidden = !(ativa && visiveis === 0);

    // Marca o botão selecionado
    itens.forEach((li) => {
      const selecionado = li.dataset.categoria === ativa;
      li.querySelector('button').setAttribute('aria-pressed', String(selecionado));
    });

    // Sem filtro: esconde a mensagem
    if (!ativa) {
      status.replaceChildren();
      return;
    }

    const nome = [...itens]
      .find((li) => li.dataset.categoria === ativa)
      .querySelector('button').textContent;

    const texto = document.createElement('span');
    texto.textContent =
      visiveis === 0
        ? `Ainda não temos produtos em “${nome}”.`
        : `Mostrando ${visiveis} ${visiveis === 1 ? 'produto' : 'produtos'} em “${nome}”.`;

    const ver = document.createElement('a');
    ver.href = '#produtos';
    ver.textContent = 'Ver produtos';

    const limpar = document.createElement('button');
    limpar.type = 'button';
    limpar.className = 'categoria-limpar';
    limpar.textContent = 'Limpar filtro';

    status.replaceChildren(texto, ver, limpar);
  }

  lista.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.categoria-btn');
    if (!botao) return;
    const categoria = botao.closest('li').dataset.categoria;
    ativa = ativa === categoria ? null : categoria;
    atualizar();
  });

  status.addEventListener('click', (evento) => {
    if (!evento.target.closest('.categoria-limpar')) return;
    const botaoAtivo = lista.querySelector('.categoria-btn[aria-pressed="true"]');
    ativa = null;
    atualizar();
    botaoAtivo?.focus();
  });

  atualizar();
}

// ---------------------------------------------------------
// 2 e 3. FORMULÁRIO
// ---------------------------------------------------------
function iniciarFormulario() {
  const form = document.querySelector('#orcamento form');
  if (!form) return;

  const telefone = form.querySelector('#telefone');
  if (telefone) configurarTelefone(telefone);

  // Área de mensagem de sucesso
  const aviso = document.createElement('p');
  aviso.className = 'form-aviso';
  aviso.setAttribute('role', 'status');
  form.append(aviso);

  // O navegador já bloqueia campos inválidos antes deste evento
  form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const nome = form.querySelector('#nome')?.value.trim() ?? '';
    const primeiroNome = nome.split(' ')[0];

    aviso.textContent =
      `Obrigado${primeiroNome ? ', ' + primeiroNome : ''}! ` +
      'Recebemos seu pedido de orçamento e vamos responder por e-mail.';

    form.reset();
    // Restaura a dica do telefone depois de limpar o campo
    telefone?.dispatchEvent(new Event('input'));
    aviso.scrollIntoView({ block: 'nearest' });
  });
}

// Formata como (11) 99999-8888 (celular) ou (11) 3333-4444 (fixo)
function formatarTelefone(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Devolve o texto do erro, ou '' se o número está certo
function erroTelefone(digitos) {
  if (digitos.length === 0) return '';
  if (digitos.length >= 2 && Number(digitos.slice(0, 2)) < 11) {
    return 'DDD inválido. Use um DDD entre 11 e 99.';
  }
  if (digitos.length < 10) return 'Telefone incompleto. Digite o DDD e o número.';
  if (digitos.length === 11 && digitos[2] !== '9') {
    return 'Celular com 11 dígitos começa com 9 depois do DDD.';
  }
  return '';
}

function configurarTelefone(campo) {
  const DICA = 'Digite o DDD e o número. Ex: (11) 99999-8888';

  // A validação agora é feita aqui, então o pattern do HTML sai do caminho
  campo.removeAttribute('pattern');
  campo.inputMode = 'tel';
  campo.autocomplete = 'tel-national';
  campo.maxLength = 15;
  campo.placeholder = '(11) 99999-8888';

  const dica = document.createElement('small');
  dica.id = 'telefone-dica';
  dica.className = 'campo-dica';
  dica.textContent = DICA;
  campo.setAttribute('aria-describedby', dica.id);
  campo.after(dica);

  function mostrarDica(erro) {
    dica.textContent = erro || DICA;
    dica.classList.toggle('campo-dica--erro', Boolean(erro));
  }

  campo.addEventListener('input', () => {
    campo.value = formatarTelefone(campo.value);
    // O erro bloqueia o envio; a dica só vira vermelha ao sair do campo
    campo.setCustomValidity(erroTelefone(campo.value.replace(/\D/g, '')));
    mostrarDica('');
  });

  campo.addEventListener('blur', () => mostrarDica(campo.validationMessage));
  campo.addEventListener('invalid', () => mostrarDica(campo.validationMessage));
}