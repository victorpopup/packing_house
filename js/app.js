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

        const detalhes = `
            <p><strong>Novo material:</strong> ${nome}</p>
            <p><strong>Quantidade inicial:</strong> 0 unidades</p>
            <p style="color: #10b981;"><strong>Próximo passo:</strong> Registre uma entrada para adicionar itens</p>
        `;

        mostrarModal(
            'Confirmar Cadastro',
            `Deseja cadastrar o material "${nome}" no estoque?`,
            detalhes,
            'confirmacao',
            () => {
                this.materiais[nome] = 0;
                this.salvarEstoque();
                this.inicializar();
                mostrarNotificacao(`Material "${nome}" adicionado com sucesso`, 'success');
                limparInput('nomeMaterial');
            }
        );
    }

    movimentar(material, quantidade, tipo) {
        if (!validarEntrada(material) || quantidade <= 0) {
            mostrarNotificacao('Material e quantidade inválidos', 'error');
            return false;
        }

        const qtd = parseInt(quantidade);
        const quantidadeAtual = this.materiais[material] || 0;
        const tipoTexto = tipo === 'entrada' ? 'Entrada' : 'Saída';
        const tipoIcon = tipo === 'entrada' ? '➕' : '➖';
        const corTipo = tipo === 'entrada' ? '#10b981' : '#f59e0b';

        // Verificar se há quantidade suficiente para saída
        if (tipo === 'saida' && quantidadeAtual < qtd) {
            mostrarModal(
                'Quantidade Insuficiente',
                `Não é possível registrar a saída de ${qtd} unidades de "${material}".`,
                `
                    <p><strong>Material:</strong> ${material}</p>
                    <p><strong>Quantidade atual:</strong> ${quantidadeAtual} unidades</p>
                    <p><strong>Quantidade solicitada:</strong> ${qtd} unidades</p>
                    <p style="color: #ef4444;"><strong>Faltam:</strong> ${qtd - quantidadeAtual} unidades</p>
                `,
                'info'
            );
            return false;
        }

        const detalhes = `
            <p><strong>Material:</strong> ${material}</p>
            <p><strong>Tipo:</strong> <span style="color: ${corTipo};">${tipoIcon} ${tipoTexto}</span></p>
            <p><strong>Quantidade:</strong> ${qtd} unidades</p>
            <p><strong>Estoque atual:</strong> ${quantidadeAtual} unidades</p>
            <p><strong>Estoque após:</strong> ${tipo === 'entrada' ? quantidadeAtual + qtd : quantidadeAtual - qtd} unidades</p>
        `;

        mostrarModal(
            `Confirmar ${tipoTexto}`,
            `Deseja registrar ${tipoTexto.toLowerCase()} de ${qtd} unidades de "${material}"?`,
            detalhes,
            tipo,
            () => {
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
                mostrarNotificacao(`${tipoTexto} de ${qtd} un. registrada com sucesso`, 'success');
                limparInput('materialMov');
                limparInput('quantidadeMov');
            }
        );
    }

    deletarMaterial(material) {
        const quantidade = this.materiais[material] || 0;
        const detalhes = `
            <p><strong>Material:</strong> ${material}</p>
            <p><strong>Quantidade atual:</strong> ${quantidade} unidades</p>
            <p style="color: #ef4444;"><strong>Atenção:</strong> Esta ação não pode ser desfeita!</p>
        `;

        mostrarModal(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir o material "${material}"?`,
            detalhes,
            'exclusao',
            () => {
                delete this.materiais[material];
                this.salvarEstoque();
                this.inicializar();
                mostrarNotificacao(`Material "${material}" removido com sucesso`, 'success');
            }
        );
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
        const tbody = document.getElementById('historicoTransacoes');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.transacoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Nenhuma transação registrada</td></tr>';
            return;
        }

        this.transacoes.slice().reverse().forEach((transacao, index) => {
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

            // Adicionar evento de clique para mostrar detalhes
            tr.style.cursor = 'pointer';
            tr.onclick = () => this.mostrarDetalhesTransacao(transacao, index);

            tbody.appendChild(tr);
        });
    }

    mostrarDetalhesTransacao(transacao, index) {
        const tipoTexto = transacao.tipo === 'entrada' ? 'Entrada' : 'Saída';
        const tipoIcon = transacao.tipo === 'entrada' ? '➕' : '➖';
        const corTipo = transacao.tipo === 'entrada' ? '#10b981' : '#f59e0b';

        const detalhes = `
            <p><strong>Data/Hora:</strong> ${formatarDataHora(new Date(transacao.data))}</p>
            <p><strong>Material:</strong> ${transacao.material}</p>
            <p><strong>Tipo:</strong> <span style="color: ${corTipo};">${tipoIcon} ${tipoTexto}</span></p>
            <p><strong>Quantidade:</strong> ${transacao.quantidade} unidades</p>
            <p><strong>ID da Transação:</strong> #${index + 1}</p>
        `;

        mostrarModal(
            'Detalhes da Transação',
            `Informações completas da transação de ${tipoTexto.toLowerCase()}`,
            detalhes,
            'info'
        );
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
    }
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
    const tbody = document.getElementById('historicoTransacoes');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (this.transacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Nenhuma transação registrada</td></tr>';
        return;
    }

    this.transacoes.slice().reverse().forEach((transacao, index) => {
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

        // Adicionar evento de clique para mostrar detalhes
        tr.style.cursor = 'pointer';
        tr.onclick = () => this.mostrarDetalhesTransacao(transacao, index);

        tbody.appendChild(tr);
    });
}

mostrarDetalhesTransacao(transacao, index) {
    const tipoTexto = transacao.tipo === 'entrada' ? 'Entrada' : 'Saída';
    const tipoIcon = transacao.tipo === 'entrada' ? '➕' : '➖';
    const corTipo = transacao.tipo === 'entrada' ? '#10b981' : '#f59e0b';

    const detalhes = `
        <p><strong>Data/Hora:</strong> ${formatarDataHora(new Date(transacao.data))}</p>
        <p><strong>Material:</strong> ${transacao.material}</p>
        <p><strong>Tipo:</strong> <span style="color: ${corTipo};">${tipoIcon} ${tipoTexto}</span></p>
        <p><strong>Quantidade:</strong> ${transacao.quantidade} unidades</p>
        <p><strong>ID da Transação:</strong> #${index + 1}</p>
    `;

    mostrarModal(
        'Detalhes da Transação',
        `Informações completas da transação de ${tipoTexto.toLowerCase()}`,
        detalhes,
        'info'
    );
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
}

salvarEstoque() {
    salvarDados('estoque_materiais', this.materiais);
    salvarDados('estoque_transacoes', this.transacoes);
}

// ==================== INSTÂNCIA GLOBAL ====================
const estoque = new Estoque();

// ==================== FUNÇÕES GLOBAIS ====================
function adicionarMaterial() {
    const nome = document.getElementById('nomeMaterial').value;
    if (estoque.adicionarMaterial(nome)) {
        // Limpar campo após sucesso
        document.getElementById('nomeMaterial').value = '';
    }
}

function movimentar(tipo) {
    const material = document.getElementById('materialMov').value;
    const quantidade = document.getElementById('quantidadeMov').value;
    if (estoque.movimentar(material, quantidade, tipo)) {
        // Limpar campos após sucesso
        document.getElementById('materialMov').value = '';
        document.getElementById('quantidadeMov').value = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
});