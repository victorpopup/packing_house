/* filepath: d:\Documents\meus_projetos\packing_house\js\app.js */
/**
 * APP.JS - Lógica principal da aplicação
 */

// ==================== CLASSE ESTOQUE ====================
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
        this.atualizarEstatisticas();
    }

    adicionarMaterial(nome) {
        if (!validarEntrada(nome)) {
            mostrarNotificacao('Digite um nome válido para o material', 'error');
            return false;
        }

        if (this.materiais[nome]) {
            mostrarNotificacao('Material já existe no estoque', 'warning');
            return false;
        }

        this.materiais[nome] = 0;
        this.salvarEstoque();
        this.inicializar();
        mostrarNotificacao(`Material "${nome}" adicionado com sucesso`, 'success');
        return true;
    }

    movimentar(material, quantidade, tipo) {
        if (!validarEntrada(material) || quantidade <= 0) {
            mostrarNotificacao('Material e quantidade inválidos', 'error');
            return false;
        }

        const qtd = parseInt(quantidade);

        if (tipo === 'saida' && this.materiais[material] < qtd) {
            mostrarNotificacao('Quantidade insuficiente no estoque', 'error');
            return false;
        }

        if (tipo === 'entrada') {
            this.materiais[material] += qtd;
        } else if (tipo === 'saida') {
            this.materiais[material] -= qtd;
        }

        this.transacoes.push({
            data: new Date().toISOString(),
            material: material,
            tipo: tipo,
            quantidade: qtd
        });

        this.salvarEstoque();
        this.inicializar();
        const msg = tipo === 'entrada' ? 'Entrada' : 'Saída';
        mostrarNotificacao(`${msg} de ${qtd} un. registrada com sucesso`, 'success');
        return true;
    }

    deletarMaterial(material) {
        if (confirm(`Tem certeza que deseja deletar "${material}"?`)) {
            delete this.materiais[material];
            this.salvarEstoque();
            this.inicializar();
            mostrarNotificacao(`Material "${material}" removido`, 'success');
        }
    }

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

    atualizarListaEstoque() {
        const tbody = document.querySelector('#listaEstoque') || document.getElementById('listaEstoque');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (Object.keys(this.materiais).length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999;">Nenhum material cadastrado</td></tr>';
            return;
        }

        Object.entries(this.materiais).forEach(([material, quantidade]) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${material}</td>
                <td>
                    <span class="badge ${quantidade > 0 ? 'badge-success' : 'badge-warning'}">
                        ${quantidade} un
                    </span>
                </td>
                <td>
                    <button onclick="estoque.deletarMaterial('${material}')" class="btn btn-danger">🗑️ Remover</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    atualizarHistorico() {
        const tbody = document.querySelector('#historicoTransacoes tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (this.transacoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Nenhuma transação registrada</td></tr>';
            return;
        }

        this.transacoes.slice().reverse().forEach(transacao => {
            const tr = document.createElement('tr');
            const badge = transacao.tipo === 'entrada' 
                ? '<span class="badge badge-success">➕ Entrada</span>'
                : '<span class="badge badge-warning">➖ Saída</span>';
            
            tr.innerHTML = `
                <td>${formatarDataHora(new Date(transacao.data))}</td>
                <td>${transacao.material}</td>
                <td>${badge}</td>
                <td>${transacao.quantidade}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    atualizarEstatisticas() {
        const totalItens = document.getElementById('totalItens');
        if (totalItens) {
            totalItens.textContent = Object.values(this.materiais).reduce((a, b) => a + b, 0);
        }
        
        // Atualizar dashboard
        this.atualizarDashboard();
    }

    atualizarDashboard() {
        const totalItens = Object.values(this.materiais).reduce((a, b) => a + b, 0);
        const totalMateriais = Object.keys(this.materiais).length;
        const totalTransacoes = this.transacoes.length;
        const totalEntradas = this.transacoes.filter(t => t.tipo === 'entrada').length;
        const totalSaidas = this.transacoes.filter(t => t.tipo === 'saida').length;
        
        // Encontrar material com maior quantidade
        let maiorMaterial = '-';
        let maiorQtd = 0;
        Object.entries(this.materiais).forEach(([mat, qtd]) => {
            if (qtd > maiorQtd) {
                maiorMaterial = mat;
                maiorQtd = qtd;
            }
        });

        // Atualizar elementos do dashboard
        const elements = {
            'dashTotalItens': totalItens,
            'dashTotalMateriais': totalMateriais,
            'dashTotalTransacoes': totalTransacoes,
            'dashTotalEntradas': totalEntradas,
            'dashTotalSaidas': totalSaidas
        };

        Object.entries(elements).forEach(([id, valor]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = valor;
        });

        // Atualizar material com maior quantidade
        const maiorEl = document.getElementById('dashMaiorMaterial');
        if (maiorEl) {
            maiorEl.textContent = maiorMaterial !== '-' ? `${maiorMaterial} (${maiorQtd} un)` : '-';
        }

        // Atualizar últimas transações
        this.atualizarUltimasTransacoes();
    }

    atualizarUltimasTransacoes() {
        const tbody = document.getElementById('dashUltimasTransacoes');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.transacoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Nenhuma transação registrada</td></tr>';
            return;
        }

        // Pegar últimas 5 transações
        this.transacoes.slice().reverse().slice(0, 5).forEach(transacao => {
            const tr = document.createElement('tr');
            const badge = transacao.tipo === 'entrada' 
                ? '<span class="badge badge-success">➕ Entrada</span>'
                : '<span class="badge badge-warning">➖ Saída</span>';
            
            tr.innerHTML = `
                <td>${formatarDataHora(new Date(transacao.data))}</td>
                <td>${transacao.material}</td>
                <td>${badge}</td>
                <td>${transacao.quantidade}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    salvarEstoque() {
        salvarDados('estoque_materiais', this.materiais);
        salvarDados('estoque_transacoes', this.transacoes);
    }
}

// ==================== INSTÂNCIA GLOBAL ====================
const estoque = new Estoque();

// ==================== FUNÇÕES GLOBAIS ====================
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
        return true;
    }

    deletarMaterial(material) {
        if (confirm(`Tem certeza que deseja deletar "${material}"?`)) {
            delete this.materiais[material];
            this.salvarEstoque();
            this.inicializar();
            mostrarAlerta(`Material "${material}" removido`, 'sucesso');
        }
    }

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

    salvarEstoque() {
        salvarDados('estoque_materiais', this.materiais);
        salvarDados('estoque_transacoes', this.transacoes);
    }
}

// ==================== INSTÂNCIA GLOBAL ====================
const estoque = new Estoque();

// ==================== FUNÇÕES GLOBAIS ====================
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('🏭 Packing House iniciado');
});