/* filepath: d:\Documents\meus_projetos\packing_house\js\modules\estoque.js */
/**
 * Módulo de Estoque
 * Gerencia cadastro, movimentação e histórico de materiais
 */

class Estoque {
    constructor() {
        this.materiais = recuperarDados('estoque_materiais') || {};
        this.transacoes = recuperarDados('estoque_transacoes') || [];
        this.inicializar();
    }

    inicializar() {
        this.atualizarSelectMateriais();
        this.atualizarListaEstoque();
        this.atualizarHistorico();
    }

    // Adicionar novo material
    adicionarMaterial(nome) {
        if (!validarEntrada(nome)) {
            mostrarAlerta('Digite um nome válido para o material', 'erro');
            return false;
        }

        if (this.materiais[nome]) {
            mostrarAlerta('Material já existe no estoque', 'aviso');
            return false;
        }

        this.materiais[nome] = 0;
        this.salvarEstoque();
        this.inicializar();
        mostrarAlerta(`Material "${nome}" adicionado com sucesso`, 'sucesso');
        return true;
    }

    // Movimentação (entrada ou saída)
    movimentar(material, quantidade, tipo) {
        if (!validarEntrada(material) || quantidade <= 0) {
            mostrarAlerta('Material e quantidade inválidos', 'erro');
            return false;
        }

        const qtd = parseInt(quantidade);

        if (tipo === 'saida' && this.materiais[material] < qtd) {
            mostrarAlerta('Quantidade insuficiente no estoque', 'erro');
            return false;
        }

        // Atualizar quantidade
        if (tipo === 'entrada') {
            this.materiais[material] += qtd;
        } else if (tipo === 'saida') {
            this.materiais[material] -= qtd;
        }

        // Registrar transação
        this.transacoes.push({
            data: new Date(),
            material: material,
            tipo: tipo,
            quantidade: qtd
        });

        this.salvarEstoque();
        this.inicializar();
        mostrarAlerta(`${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso`, 'sucesso');
        return true;
    }

    // Deletar material
    deletarMaterial(material) {
        if (confirm(`Tem certeza que deseja deletar "${material}"?`)) {
            delete this.materiais[material];
            this.salvarEstoque();
            this.inicializar();
            mostrarAlerta(`Material "${material}" removido`, 'sucesso');
        }
    }

    // Atualizar select de materiais
    atualizarSelectMateriais() {
        const select = document.getElementById('materialMov');
        select.innerHTML = '<option value="">Selecione o material</option>';

        Object.keys(this.materiais).forEach(material => {
            const option = document.createElement('option');
            option.value = material;
            option.textContent = material;
            select.appendChild(option);
        });
    }

    // Atualizar lista de estoque
    atualizarListaEstoque() {
        const lista = document.getElementById('listaEstoque');
        lista.innerHTML = '';

        if (Object.keys(this.materiais).length === 0) {
            lista.innerHTML = '<p style="text-align: center; color: #999;">Nenhum material cadastrado</p>';
            return;
        }

        Object.entries(this.materiais).forEach(([material, quantidade]) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <span class="item-nome">${material}</span>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span class="item-quantidade">${quantidade} un</span>
                    <button onclick="estoque.deletarMaterial('${material}')" style="padding: 5px 10px; background-color: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer;">🗑️</button>
                </div>
            `;
            lista.appendChild(li);
        });
    }

    // Atualizar histórico de transações
    atualizarHistorico() {
        const tbody = document.querySelector('#historicoTransacoes tbody');
        tbody.innerHTML = '';

        if (this.transacoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Nenhuma transação registrada</td></tr>';
            return;
        }

        this.transacoes.slice().reverse().forEach(transacao => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatarDataHora(new Date(transacao.data))}</td>
                <td>${transacao.material}</td>
                <td>${transacao.tipo === 'entrada' ? '➕ Entrada' : '➖ Saída'}</td>
                <td>${transacao.quantidade}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Salvar dados
    salvarEstoque() {
        salvarDados('estoque_materiais', this.materiais);
        salvarDados('estoque_transacoes', this.transacoes);
    }
}

// Instância global
const estoque = new Estoque();

// Funções para HTML
function adicionarMaterial() {
    const nome = document.getElementById('nomeMaterial').value;
    if (estoque.adicionarMaterial(nome)) {
        limparInput('nomeMaterial');
    }
}

function movimentar(tipo) {
    const material = document.getElementById('materialMov').value;
    const quantidade = document.getElementById('quantidadeMov').value;
    if (estoque.movimentar(material, quantidade, tipo)) {
        document.getElementById('materialMov').value = '';
        limparInput('quantidadeMov');
    }
}