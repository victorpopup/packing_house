let estoque = [];

function mostrarTela(telaId) {
    // Esconde a imagem inicial
    document.getElementById('telaInicial').style.display = 'none';

    // Esconde todas as telas
    document.querySelectorAll('.tela').forEach(tela => {
        tela.classList.add('hidden');
    });

    // Mostra a tela selecionada
    document.getElementById(telaId).classList.remove('hidden');
}

function adicionarMaterial() {
    const nome = document.getElementById('nomeMaterial').value.trim();
    if (!nome) return alert("Digite o nome do material");

    estoque.push({ nome, quantidade: 0 });
    atualizarTela();
    document.getElementById('nomeMaterial').value = "";
}

function movimentar(tipo) {
    const material = document.getElementById('materialMov').value;
    const quantidade = parseInt(document.getElementById('quantidadeMov').value);

    if (!material || !quantidade) {
        alert('Selecione o material e a quantidade!');
        return;
    }

    // Aqui você atualiza o estoque (seu código existente)
    // ...

    // Registrar no histórico
    registrarTransacao(material, tipo, quantidade);

    // Limpar campos
    document.getElementById('quantidadeMov').value = '';
    document.getElementById('materialMov').value = '';
}


function atualizarTela() {
    const lista = document.getElementById('listaEstoque');
    const select = document.getElementById('materialMov');

    lista.innerHTML = "";
    select.innerHTML = '<option value="">Selecione o material</option>';

    estoque.forEach((item, index) => {
        lista.innerHTML += `<li>${item.nome} - ${item.quantidade}</li>`;
        select.innerHTML += `<option value="${index}">${item.nome}</option>`;
    });
}

function mostrarTela(tela) {
    // esconder todas as telas
    document.querySelectorAll('.tela').forEach(sec => sec.classList.add('hidden'));
    document.getElementById('telaInicial').classList.add('hidden');

    // mostrar a tela selecionada
    if(tela === 'inicial'){
        document.getElementById('telaInicial').classList.remove('hidden');
    } else {
        document.getElementById(tela).classList.remove('hidden');
    }
}

function registrarTransacao(material, tipo, quantidade) {
    const tbody = document.querySelector('#historicoTransacoes tbody');
    const dataHora = new Date().toLocaleString(); // pega data e hora atual

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${dataHora}</td>
        <td>${material}</td>
        <td>${tipo}</td>
        <td>${quantidade}</td>
    `;

    tbody.prepend(tr); // adiciona no topo da tabela
}
