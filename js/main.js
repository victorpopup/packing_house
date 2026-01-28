/* filepath: d:\Documents\meus_projetos\packing_house\js\main.js */
/**
 * Script principal - Controle de navegação e UI
 */

// ==================== NAVEGAÇÃO ====================
function mostrarTela(telaNome) {
    // Atualizar título da página
    const pageTitle = document.getElementById('pageTitle');
    const menuItems = document.querySelectorAll('.nav-item');
    
    // Remover classe active de todos os itens
    menuItems.forEach(item => item.classList.remove('active'));
    
    // Adicionar classe active ao item clicado
    if (telaNome !== 'dashboard') {
        document.querySelector(`[data-menu="${telaNome}"]`)?.classList.add('active');
    } else {
        // Dashboard não tem item no menu
        menuItems[0]?.classList.add('active');
    }
    
    // Atualizar título baseado na página
    const titles = {
        'dashboard': 'Dashboard',
        'estoque': 'Estoque',
        'qualidade': 'Controle de Qualidade',
        'recepcao': 'Recepção de Fruta',
        'producao': 'Produção',
        'configuracao': 'Configurações'
    };
    pageTitle.textContent = titles[telaNome] || 'Packing House';
    
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Mostrar página selecionada
    const page = document.getElementById(telaNome);
    if (page) {
        page.classList.add('active');
        
        // Atualizar dashboard se voltando para ele
        if (telaNome === 'dashboard' && typeof estoque !== 'undefined') {
            estoque.atualizarDashboard();
        }
        
        // Atualizar configurações se voltando para ela
        if (telaNome === 'configuracao' && typeof estoque !== 'undefined') {
            atualizarPaginaConfiguracao();
        }
    }
    
    // Fechar sidebar em mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// Fechar sidebar ao clicar fora
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});

// ==================== RELÓGIO ====================
function atualizarHora() {
    const horaElement = document.getElementById('currentTime');
    if (horaElement) {
        const agora = new Date();
        const horas = String(agora.getHours()).padStart(2, '0');
        const minutos = String(agora.getMinutes()).padStart(2, '0');
        horaElement.textContent = `${horas}:${minutos}`;
    }
}

// Atualizar hora a cada minuto
setInterval(atualizarHora, 1000);
atualizarHora();

// ==================== MODAIS ====================
let acaoPendente = null;

function mostrarModal(titulo, mensagem, detalhes = '', tipo = 'confirmacao', acaoCallback = null) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalDetails = document.getElementById('modalDetails');
    const confirmBtn = document.getElementById('modalConfirmBtn');

    modalTitle.textContent = titulo;
    modalMessage.textContent = mensagem;
    
    if (detalhes) {
        modalDetails.innerHTML = detalhes;
        modalDetails.style.display = 'block';
    } else {
        modalDetails.style.display = 'none';
    }

    // Configurar botão de confirmação baseado no tipo
    const tiposConfig = {
        'confirmacao': { texto: 'Confirmar', classe: 'btn-primary' },
        'exclusao': { texto: 'Excluir', classe: 'btn-danger' },
        'entrada': { texto: 'Registrar Entrada', classe: 'btn-success' },
        'saida': { texto: 'Registrar Saída', classe: 'btn-warning' },
        'info': { texto: 'Entendi', classe: 'btn-primary' }
    };

    const config = tiposConfig[tipo] || tiposConfig.confirmacao;
    confirmBtn.textContent = config.texto;
    confirmBtn.className = `btn ${config.classe}`;

    acaoPendente = acaoCallback;
    modal.classList.add('show');
}

function fecharModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
    acaoPendente = null;
}

function confirmarAcao() {
    if (acaoPendente && typeof acaoPendente === 'function') {
        acaoPendente();
    }
    fecharModal();
}

// Fechar modal ao clicar fora
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        fecharModal();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModal();
    }
});

// ==================== BUSCA DE ESTOQUE ====================
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('buscarEstoque');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const linhas = document.querySelectorAll('#listaEstoque tr');
            
            linhas.forEach(linha => {
                const texto = linha.textContent.toLowerCase();
                linha.style.display = texto.includes(termo) ? '' : 'none';
            });
        });
    }
    
    console.log('🏭 Packing House iniciado');
});

// ==================== CONFIGURAÇÕES ====================
function atualizarPaginaConfiguracao() {
    if (typeof estoque === 'undefined') return;
    
    // Atualizar total de materiais
    const totalMateriais = Object.keys(estoque.materiais).length;
    document.getElementById('configTotalMateriais').textContent = totalMateriais;
    
    // Atualizar total de transações
    const totalTransacoes = estoque.transacoes.length;
    document.getElementById('configTotalTransacoes').textContent = totalTransacoes;
    
    // Atualizar data/hora
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR');
    const horaFormatada = agora.toLocaleTimeString('pt-BR');
    document.getElementById('configDataHora').textContent = `${dataFormatada} ${horaFormatada}`;
}

function mostrarConfirmacaoLimparHistorico() {
    const detalhes = `
        <p style="color: #ef4444;"><strong>⚠️ ATENÇÃO:</strong> Esta ação é irreversível!</p>
        <p>Todos os registros de transações serão deletados permanentemente.</p>
        <p style="margin-top: 10px;"><strong>Total de transações a serem removidas:</strong> ${estoque?.transacoes?.length || 0}</p>
    `;
    
    mostrarModal(
        'Confirmar Limpeza de Histórico',
        'Você tem certeza que deseja limpar todo o histórico de transações?',
        detalhes,
        'exclusao',
        limparHistorico
    );
}

function limparHistorico() {
    estoque.transacoes = [];
    salvarDados('estoque_transacoes', []);
    estoque.atualizarHistorico();
    estoque.atualizarDashboard();
    atualizarPaginaConfiguracao();
    mostrarNotificacao('Histórico de transações removido com sucesso', 'success');
    mostrarTela('configuracao');
}