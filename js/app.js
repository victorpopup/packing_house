/* filepath: d:\Documents\meus_projetos\packing_house\js\app.js */
/**
 * APP.JS - Lógica principal da aplicação refatorada
 * Versão: 2.0 - Otimizada e modular
 */

// ==================== CLASSE PACKING ====================
class Packing {
    constructor() {
        this.materiais = this.carregarDados('packing_materiais') || {};
        this.transacoes = this.carregarDados('packing_transacoes') || [];
        this.debounceTimers = new Map();
        this.inicializar();
    }

    inicializar() {
        this.atualizarInterface();
        this.configurarEventListeners();
    }

    atualizarInterface() {
        this.atualizarSelectMateriais();
        this.atualizarListaEstoque();
        this.atualizarHistorico();
        this.atualizarEstatisticas();
    }

    configurarEventListeners() {
        // Configurar busca com debounce
        const searchInput = document.getElementById('buscarEstoque');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debounceBusca(e.target.value);
            });
        }
    }

    debounceBusca(termo) {
        const timerId = this.debounceTimers.get('busca');
        if (timerId) clearTimeout(timerId);
        
        const newTimer = setTimeout(() => {
            this.filtrarEstoque(termo.toLowerCase());
        }, 300);
        
        this.debounceTimers.set('busca', newTimer);
    }

    filtrarEstoque(termo) {
        const linhas = document.querySelectorAll('#listaEstoque tr');
        linhas.forEach(linha => {
            const texto = linha.textContent.toLowerCase();
            linha.style.display = texto.includes(termo) ? '' : 'none';
        });
    }

    adicionarMaterial(nome) {
        if (!this.validarNomeMaterial(nome)) {
            mostrarNotificacao('Digite um nome válido para o material', 'error');
            return false;
        }

        if (this.materiais[nome]) {
            mostrarNotificacao('Material já existe no estoque', 'warning');
            return false;
        }

        this.mostrarConfirmacaoCadastro(nome);
    }

    validarNomeMaterial(nome) {
        return nome && typeof nome === 'string' && nome.trim().length > 0;
    }

    mostrarConfirmacaoCadastro(nome) {
        const detalhes = this.gerarDetalhesCadastro(nome);
        
        mostrarModal(
            'Confirmar Cadastro',
            `Deseja cadastrar o material "${nome}" no estoque?`,
            detalhes,
            'confirmacao',
            () => this.executarCadastro(nome)
        );
    }

    gerarDetalhesCadastro(nome) {
        return `
            <p><strong>Novo material:</strong> ${nome}</p>
            <p><strong>Quantidade inicial:</strong> 0 unidades</p>
            <p style="color: #10b981;"><strong>Próximo passo:</strong> Registre uma entrada para adicionar itens</p>
        `;
    }

    executarCadastro(nome) {
        this.materiais[nome] = 0;
        this.salvarEstoque();
        this.atualizarInterface();
        mostrarNotificacao(`Material "${nome}" adicionado com sucesso`, 'success');
        limparInput('nomeMaterial');
    }

    movimentar(material, quantidade, tipo) {
        const validacao = this.validarMovimentacao(material, quantidade, tipo);
        if (!validacao.valido) {
            mostrarNotificacao(validacao.erro, 'error');
            return false;
        }

        const resultado = this.simularMovimentacao(material, quantidade, tipo);
        
        if (!resultado.podeExecutar) {
            this.mostrarErroQuantidadeInsuficiente(resultado);
            return false;
        }

        this.mostrarConfirmacaoMovimentacao(material, quantidade, tipo, resultado);
    }

    validarMovimentacao(material, quantidade, tipo) {
        if (!material || !quantidade || quantidade <= 0) {
            return { valido: false, erro: 'Material e quantidade inválidos' };
        }
        
        if (!this.materiais[material]) {
            return { valido: false, erro: 'Material não encontrado no estoque' };
        }
        
        return { valido: true };
    }

    simularMovimentacao(material, quantidade, tipo) {
        const quantidadeAtual = this.materiais[material];
        const qtd = parseInt(quantidade);
        
        return {
            podeExecutar: tipo !== 'saida' || quantidadeAtual >= qtd,
            quantidadeAtual,
            quantidadeApos: tipo === 'entrada' ? quantidadeAtual + qtd : quantidadeAtual - qtd
        };
    }

    mostrarErroQuantidadeInsuficiente(resultado) {
        const detalhes = `
            <p><strong>Estoque atual:</strong> ${resultado.quantidadeAtual} unidades</p>
            <p style="color: #ef4444;"><strong>Faltam:</strong> ${Math.abs(resultado.quantidadeApos)} unidades</p>
        `;
        
        mostrarModal('Quantidade Insuficiente', 'Não há quantidade suficiente em estoque', detalhes, 'info');
    }

    mostrarConfirmacaoMovimentacao(material, quantidade, tipo, resultado) {
        const tipoTexto = tipo === 'entrada' ? 'Entrada' : 'Saída';
        const tipoIcon = tipo === 'entrada' ? '➕' : '➖';
        const corTipo = tipo === 'entrada' ? '#10b981' : '#f59e0b';
        
        const detalhes = `
            <p><strong>Material:</strong> ${material}</p>
            <p><strong>Tipo:</strong> <span style="color: ${corTipo};">${tipoIcon} ${tipoTexto}</span></p>
            <p><strong>Quantidade:</strong> ${quantidade} unidades</p>
            <p><strong>Estoque após:</strong> ${resultado.quantidadeApos} unidades</p>
        `;
        
        mostrarModal(
            `Confirmar ${tipoTexto}`,
            `Deseja registrar ${tipoTexto.toLowerCase()} de ${quantidade} unidades de "${material}"?`,
            detalhes,
            tipo,
            () => this.executarMovimentacao(material, quantidade, tipo)
        );
    }

    executarMovimentacao(material, quantidade, tipo) {
        const qtd = parseInt(quantidade);
        
        if (tipo === 'entrada') {
            this.materiais[material] += qtd;
        } else {
            this.materiais[material] -= qtd;
        }

        this.registrarTransacao(material, quantidade, tipo);
        this.salvarEstoque();
        this.atualizarInterface();
        
        const tipoTexto = tipo === 'entrada' ? 'Entrada' : 'Saída';
        mostrarNotificacao(`${tipoTexto} de ${qtd} un. registrada com sucesso`, 'success');
        
        this.limparCamposMovimentacao();
    }

    registrarTransacao(material, quantidade, tipo) {
        this.transacoes.push({
            data: new Date().toISOString(),
            material,
            tipo,
            quantidade: parseInt(quantidade)
        });
    }

    limparCamposMovimentacao() {
        limparInput('materialMov');
        limparInput('quantidadeMov');
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
                this.atualizarInterface();
                mostrarNotificacao(`Material "${material}" removido com sucesso`, 'success');
            }
        );
    }

    atualizarSelectMateriais() {
        const select = document.getElementById('materialMov');
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione o material</option>';
        
        Object.keys(this.materiais)
            .sort() // Ordenar alfabeticamente
            .forEach(material => {
                const option = document.createElement('option');
                option.value = material;
                option.textContent = material;
                select.appendChild(option);
            });
    }

    atualizarListaEstoque() {
        const tbody = document.querySelector('#listaEstoque') || document.getElementById('listaEstoque');
        if (!tbody) return;

        if (Object.keys(this.materiais).length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999;">Nenhum material cadastrado</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        
        Object.entries(this.materiais)
            .sort((a, b) => a[0].localeCompare(b[0])) // Ordenar alfabeticamente
            .forEach(([material, quantidade]) => {
                const tr = this.criarLinhaEstoque(material, quantidade);
                tbody.appendChild(tr);
            });
    }

    criarLinhaEstoque(material, quantidade) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${this.escapeHtml(material)}</td>
            <td>
                <span class="badge ${quantidade > 0 ? 'badge-success' : 'badge-warning'}">
                    ${quantidade} un
                </span>
            </td>
            <td>
                <button onclick="packing.deletarMaterial('${this.escapeHtml(material)}')" 
                        class="btn btn-danger" 
                        title="Remover material">
                    🗑️ Remover
                </button>
            </td>
        `;
        return tr;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    atualizarHistorico() {
        const tbody = document.getElementById('historicoTransacoes');
        if (!tbody) return;

        if (this.transacoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Nenhuma transação registrada</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        
        this.transacoes
            .slice()
            .reverse()
            .forEach((transacao, index) => {
                const tr = this.criarLinhaHistorico(transacao, index);
                tbody.appendChild(tr);
            });
    }

    criarLinhaHistorico(transacao, index) {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => this.mostrarDetalhesTransacao(transacao, index);
        
        const badge = transacao.tipo === 'entrada'
            ? '<span class="badge badge-success">➕ Entrada</span>'
            : '<span class="badge badge-warning">➖ Saída</span>';

        tr.innerHTML = `
            <td>${formatarDataHora(new Date(transacao.data))}</td>
            <td>${this.escapeHtml(transacao.material)}</td>
            <td>${badge}</td>
            <td>${transacao.quantidade}</td>
        `;
        
        return tr;
    }

    mostrarDetalhesTransacao(transacao, index) {
        const tipoTexto = transacao.tipo === 'entrada' ? 'Entrada' : 'Saída';
        const tipoIcon = transacao.tipo === 'entrada' ? '➕' : '➖';
        const corTipo = transacao.tipo === 'entrada' ? '#10b981' : '#f59e0b';

        const detalhes = `
            <p><strong>Data/Hora:</strong> ${formatarDataHora(new Date(transacao.data))}</p>
            <p><strong>Material:</strong> ${this.escapeHtml(transacao.material)}</p>
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
            totalItens.textContent = this.calcularTotalItens();
        }

        this.atualizarDashboard();
    }

    calcularTotalItens() {
        return Object.values(this.materiais).reduce((total, quantidade) => total + quantidade, 0);
    }

    atualizarDashboard() {
        const estatisticas = this.calcularEstatisticas();
        
        // Atualizar elementos do dashboard
        const elementos = {
            'dashTotalItens': estatisticas.totalItens,
            'dashTotalMateriais': estatisticas.totalMateriais,
            'dashTotalTransacoes': estatisticas.totalTransacoes,
            'dashTotalEntradas': estatisticas.totalEntradas,
            'dashTotalSaidas': estatisticas.totalSaidas
        };

        Object.entries(elementos).forEach(([id, valor]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = valor;
        });

        // Atualizar material com maior quantidade
        this.atualizarMaiorMaterial(estatisticas.maiorMaterial);
    }

    calcularEstatisticas() {
        const totalItens = this.calcularTotalItens();
        const totalMateriais = Object.keys(this.materiais).length;
        const totalTransacoes = this.transacoes.length;
        const totalEntradas = this.transacoes.filter(t => t.tipo === 'entrada').length;
        const totalSaidas = this.transacoes.filter(t => t.tipo === 'saida').length;
        
        const maiorMaterial = this.encontrarMaiorMaterial();
        
        return {
            totalItens,
            totalMateriais,
            totalTransacoes,
            totalEntradas,
            totalSaidas,
            maiorMaterial
        };
    }

    encontrarMaiorMaterial() {
        let maior = { material: '-', quantidade: 0 };
        
        Object.entries(this.materiais).forEach(([material, quantidade]) => {
            if (quantidade > maior.quantidade) {
                maior = { material, quantidade };
            }
        });
        
        return maior;
    }

    atualizarMaiorMaterial(maior) {
        const maiorEl = document.getElementById('dashMaiorMaterial');
        if (maiorEl) {
            maiorEl.textContent = maior.material !== '-' 
                ? `${maior.material} (${maior.quantidade} un)` 
                : '-';
        }
    }

    salvarEstoque() {
        this.salvarDados('packing_materiais', this.materiais);
        this.salvarDados('packing_transacoes', this.transacoes);
    }

    carregarDados(chave) {
        try {
            const dados = localStorage.getItem(chave);
            return dados ? JSON.parse(dados) : null;
        } catch (erro) {
            return null;
        }
    }

    salvarDados(chave, dados) {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
        } catch (erro) {
            mostrarNotificacao('Erro ao salvar dados', 'error');
        }
    }

    // Métodos utilitários
    exportarDados() {
        return {
            materiais: this.materiais,
            transacoes: this.transacoes,
            dataExportacao: new Date().toISOString(),
            versao: '2.0'
        };
    }

    limparTodosDados() {
        this.materiais = {};
        this.transacoes = [];
        this.salvarEstoque();
        this.atualizarInterface();
    }
}

// ==================== INSTÂNCIA GLOBAL ====================
let packing;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    packing = new Packing();
});

// ==================== FUNÇÕES GLOBAIS ====================
function adicionarMaterial() {
    const nome = document.getElementById('nomeMaterial').value;
    if (packing && packing.adicionarMaterial(nome)) {
        document.getElementById('nomeMaterial').value = '';
    }
}

function movimentar(tipo) {
    const material = document.getElementById('materialMov').value;
    const quantidade = document.getElementById('quantidadeMov').value;
    if (packing && packing.movimentar(material, quantidade, tipo)) {
        document.getElementById('materialMov').value = '';
        document.getElementById('quantidadeMov').value = '';
    }
}