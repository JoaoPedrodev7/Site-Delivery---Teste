const carrinhoItens = []

const abrirBtn = document.getElementById('abrir-carrinho')
const carrinhoLateral = document.getElementById('carrinho-lateral')
const fecharBtn = document.getElementById('fechar-carrinho')

const listaCarrinhoEl = document.getElementById('lista-carrinho')
const subTotalEl = document.getElementById('subtotal')
const freteEl = document.getElementById('frete')
const totalEl = document.getElementById('total')
const btnFinalizar = document.getElementById('btn-finalizar')

const FRETE_FIXO = 0.00
const TELEFONE_HAMBURGUERIA = '5589994501815'

function abrirCarrinho() {
    carrinhoLateral.classList.add('active')
    carrinhoLateral.setAttribute('aria-hidden', 'false')

}

function fecharCarrinho() {
    carrinhoLateral.classList.remove('active')
    carrinhoLateral.setAttribute('aria-hidden', 'true')

    document.body.style.overflow = ''
}

if (abrirBtn) abrirBtn.addEventListener('click', abrirCarrinho)
if (fecharBtn) fecharBtn.addEventListener('click', fecharCarrinho)

function formatBRL(valor) { 
    return 'R$ ' + Number(valor).toFixed(2).replace('.', ',')
}

document.querySelectorAll('.produto').forEach(produtoEl => {
    const btn = produtoEl.querySelector('.btn')
    if (!btn) return

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const nome = produtoEl.dataset.nome;
        const preco = parseFloat(produtoEl.dataset.preco);
        if (!nome || isNaN(preco)) return

        adicionarAoCarrinho({ nome, preco, quantidade: 1});
        abrirCarrinho();

    })
})

function adicionarAoCarrinho({ nome, preco, quantidade = 1}) {

    const existente = carrinhoItens.find(item => item.nome === nome);
    if (existente) { 
        existente.quantidade += quantidade;
        existente.subtotal = existente.quantidade * existente.preco;
    } else {
        carrinhoItens.push({
            nome,
            preco,
            quantidade,
            subtotal: preco * quantidade
        });
    }
    atualizarCarrinho();
}

function atualizarCarrinho() {
    listaCarrinhoEl.innerHTML = '';

    let subtotal = 0;

    carrinhoItens.forEach((item, index) => {
        subtotal += item.subtotal;

        const li = document.createElement('li');

        li.innerHTML = `
        <div class="item-info">
        <strong>${item.nome}</strong>
        <div class="item-price">Unit: ${formatBRL(item.preco)}</div>
      </div>

      <div class="item-controls">
        <div class="item-qty">
          <button class="qty-btn" data-action="minus" data-index="${index}">-</button>
          <span class="qty-value">${item.quantidade}</span>
          <button class="qty-btn" data-action="plus" data-index="${index}">+</button>
        </div>
        <div class="item-sub">${formatBRL(item.subtotal)}</div>
        <button class="remove-btn" data-index="${index}">Remover</button>
      </div>
        `;

        listaCarrinhoEl.appendChild(li);
    })

    subTotalEl.textContent = formatBRL(subtotal);
    freteEl.textContent = formatBRL(FRETE_FIXO);
    totalEl.textContent = formatBRL(subtotal + FRETE_FIXO);

    btnFinalizar.disabled = carrinhoItens.length === 0;

    ligarControlesDeItens();
}

function ligarControlesDeItens() { 
    
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.onclick = () => {
            const index = Number(btn.dataset.index);
            const acao = btn.dataset.action;
            alterarQuantidadeItem(index, acao === 'plus' ? 1 : -1);
        };
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.onclick = () => { 
            const index = Number(btn.dataset.index);
            removerItem(index);
        }
    })

}

function alterarQuantidadeItem(index, delta) {
    const item = carrinhoItens[index];
    if (!item) return;
    item.quantidade += delta;
    if (item.quantidade < 1) item.quantidade = 1;
    item.subtotal = item.quantidade * item.preco;
    atualizarCarrinho();
}

function removerItem(index) {
    carrinhoItens.splice(index, 1);
    atualizarCarrinho();
}

btnFinalizar.addEventListener('click', () => {
    if (carrinhoItens.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    let mensagem = 'Olá, gostaria de fazer o pedido:\n\n';

    carrinhoItens.forEach(item => {
        mensagem += `- ${item.quantidade}x ${item.nome} - ${item.subtotal.toFixed(2).replace('.', ',')}\n`;
    });

    const subtotal = carrinhoItens.reduce((s, it ) => s + it.subtotal, 0);
    mensagem += `\nSubtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    mensagem += `\nFrete: R$ ${FRETE_FIXO.toFixed(2).replace('.', ',')}`;
    mensagem += `\nTotal: R$ ${(subtotal + FRETE_FIXO).toFixed(2).replace('.', ',')}`

    const url = `https://wa.me/${TELEFONE_HAMBURGUERIA}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
});