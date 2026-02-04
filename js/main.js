/* filepath: d:\Documents\meus_projetos\packing_house\js\main.js */
/**
 * MAIN.JS - Sistema de navegação e UI refatorado
 * Versão: 2.0 - Performance otimizada
 */

// ==================== SISTEMA DE NAVEGAÇÃO ====================
class Navegacao {
    constructor() {
        this.paginaAtual = 'dashboard';
        this.historicoNavegacao = [];
        this.animacoesAtivadas = true;
        this.breakpoints = {
            mobile: 768,
            tablet: 1024
        };
        this.inicializar();
    }

    inicializar() {
        this.configurarEventListenersGlobais();
        this.configurarObservadores();
        this.inicializarSistema();
    }

    configurarEventListenersGlobais() {
        // Eventos de navegação
        document.addEventListener('keydown', (e) => this.handleTeclasAtalho(e));
        
        // Eventos de resize com debounce
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.handleResize(), 250);
        });

        // Prevenção de duplo clique em navegação
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item, [onclick*="mostrarTela"]')) {
                this.prevenirDuploNavegacao(e.target);
            }
        });
    }

    configurarObservadores() {
        // Observer para mudanças na página
        if ('MutationObserver' in window) {
            this.observerPagina = new MutationObserver(() => {
                this.aoMudarPagina();
            });
            
            this.observerPagina.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    inicializarSistema() {
        // Inicializar relógio
        this.inicializarRelogio();
        
        // Carregar página inicial
        const paginaSalva = localStorage.getItem('paginaAtual') || 'dashboard';
        this.mostrarTela(paginaSalva, false);
        
        // Configurar busca
        this.configurarBuscaGlobal();
    }
    
    mostrarTela(telaNome, adicionarAoHistorico = true) {
        // Validação
        if (!this.validarPagina(telaNome)) return;
        
        // Previnir navegação desnecessária
        if (this.paginaAtual === telaNome) return;
        
        // Adicionar ao histórico
        if (adicionarAoHistorico) {
            this.adicionarAoHistorico(this.paginaAtual);
        }
        
        // Atualizar estado
        const paginaAnterior = this.paginaAtual;
        this.paginaAtual = telaNome;
        
        // Salvar preferência
        localStorage.setItem('paginaAtual', telaNome);
        
        // Executar transição
        this.executarTransicaoPagina(telaNome, paginaAnterior);
    }

    validarPagina(telaNome) {
        const paginasValidas = [
            'dashboard', 'estoque', 'qualidade', 
            'recepcao', 'producao', 'configuracao'
        ];
        return paginasValidas.includes(telaNome);
    }

    adicionarAoHistorico(pagina) {
        if (pagina && pagina !== 'dashboard') {
            this.historicoNavegacao.push(pagina);
            // Manter apenas últimos 10 itens no histórico
            if (this.historicoNavegacao.length > 10) {
                this.historicoNavegacao.shift();
            }
        }
    }

    executarTransicaoPagina(telaNome, paginaAnterior) {
        // Atualizar navegação
        this.atualizarNavegacao(telaNome);
        
        // Atualizar conteúdo
        this.atualizarConteudo(telaNome);
        
        // Configurar página específica
        this.configurarPaginaEspecifica(telaNome);
        
        // Ações pós-navegação
        this.aposNavegacao(telaNome, paginaAnterior);
    }

    atualizarNavegacao(telaNome) {
        // Atualizar título
        this.atualizarTitulo(telaNome);
        
        // Atualizar menu ativo
        this.atualizarMenuAtivo(telaNome);
    }

    atualizarTitulo(telaNome) {
        const pageTitle = document.getElementById('pageTitle');
        if (!pageTitle) return;
        
        const titulos = {
            dashboard: 'Dashboard',
            estoque: 'Estoque',
            qualidade: 'Controle de Qualidade',
            recepcao: 'Recepção de Fruta',
            producao: 'Produção',
            configuracao: 'Configurações'
        };
        
        pageTitle.textContent = titulos[telaNome] || 'Packing House';
        
        // Atualizar título da página
        document.title = `${titulos[telaNome] || 'Packing House'} - Packing House`;
    }

    atualizarMenuAtivo(telaNome) {
        const menuItems = document.querySelectorAll('.nav-item');
        
        // Remover classe active de todos
        menuItems.forEach(item => item.classList.remove('active'));
        
        // Adicionar classe active ao item clicado
        if (telaNome !== 'dashboard') {
            const itemAtivo = document.querySelector(`[data-menu="${telaNome}"]`);
            itemAtivo?.classList.add('active');
        } else {
            // Dashboard não tem item no menu - ativar primeiro
            menuItems[0]?.classList.add('active');
        }
    }
    
    atualizarConteudo(telaNome) {
        // Esconder todas as páginas com animação
        const paginas = document.querySelectorAll('.page');
        
        if (this.animacoesAtivadas) {
            paginas.forEach(page => {
                if (page.classList.contains('active')) {
                    page.style.animation = 'fadeOut 0.2s ease';
                    setTimeout(() => page.classList.remove('active'), 200);
                }
            });
            
            // Mostrar página selecionada com animação
            setTimeout(() => {
                const page = document.getElementById(telaNome);
                if (page) {
                    page.classList.add('active');
                    page.style.animation = 'fadeIn 0.3s ease';
                }
            }, 100);
        } else {
            paginas.forEach(page => page.classList.remove('active'));
            document.getElementById(telaNome)?.classList.add('active');
        }
    }

    configurarPaginaEspecifica(telaNome) {
        // Configurações específicas para cada página
        const configuracoes = {
            dashboard: () => this.configurarDashboard(),
            estoque: () => this.configurarEstoque(),
            qualidade: () => this.configurarQualidade(),
            configuracao: () => this.configurarConfiguracao()
        };
        
        if (configuracoes[telaNome]) {
            configuracoes[telaNome]();
        }
    }

    configurarDashboard() {
        if (typeof estoque !== 'undefined') {
            estoque.atualizarDashboard();
        }
    }

    configurarEstoque() {
        if (typeof estoque !== 'undefined') {
            estoque.atualizarHistorico();
        }
    }

    configurarQualidade() {
        // Configurações específicas da página de qualidade
        if (typeof qualidade !== 'undefined') {
            qualidade.atualizarHistorico();
        }
    }

    configurarConfiguracao() {
        if (typeof atualizarPaginaConfiguracao === 'function') {
            atualizarPaginaConfiguracao();
        }
    }

    aposNavegacao(telaNome, paginaAnterior) {
        // Fechar sidebar em mobile
        if (window.innerWidth <= this.breakpoints.mobile) {
            this.fecharSidebar();
        }
        
        // Scroll ao topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Foco no primeiro elemento interativo
        this.focarPrimeiroElemento(telaNome);
    }

    focarPrimeiroElemento(telaNome) {
        const pagina = document.getElementById(telaNome);
        if (!pagina) return;
        
        const primeiroInterativo = pagina.querySelector(
            'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (primeiroInterativo) {
            setTimeout(() => primeiroInterativo.focus(), 300);
        }
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        sidebar.classList.toggle('open');
        
        // Adicionar overlay em mobile
        if (window.innerWidth <= this.breakpoints.mobile) {
            this.toggleOverlay(sidebar.classList.contains('open'));
        }
    }

    fecharSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
            this.toggleOverlay(false);
        }
    }

    toggleOverlay(mostrar) {
        let overlay = document.getElementById('sidebar-overlay');
        
        if (mostrar && !overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebar-overlay';
            overlay.className = 'sidebar-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999;
                display: none;
            `;
            
            overlay.addEventListener('click', () => this.fecharSidebar());
            document.body.appendChild(overlay);
        }
        
        if (overlay) {
            overlay.style.display = mostrar ? 'block' : 'none';
        }
    }

    // ==================== SISTEMA DE RELÓGIO ====================
    inicializarRelogio() {
        this.atualizarHora();
        setInterval(() => this.atualizarHora(), 1000);
    }

    atualizarHora() {
        const horaElement = document.getElementById('currentTime');
        if (!horaElement) return;
        
        const agora = new Date();
        const horaFormatada = this.formatarHora(agora);
        horaElement.textContent = horaFormatada;
        
        // Atualizar atributo para acessibilidade
        horaElement.setAttribute('datetime', agora.toISOString());
    }

    formatarHora(data) {
        return data.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // ==================== SISTEMA DE MODAIS ====================
    mostrarModal(titulo, mensagem, detalhes = '', tipo = 'confirmacao', acaoCallback = null) {
        const modal = document.getElementById('modal');
        if (!modal) return;
        
        // Configurar conteúdo
        this.configurarModal(modal, titulo, mensagem, detalhes, tipo, acaoCallback);
        
        // Mostrar com animação
        this.animarModalEntrada(modal);
        
        // Configurar foco e acessibilidade
        this.configurarAcessibilidadeModal(modal);
    }

    configurarModal(modal, titulo, mensagem, detalhes, tipo, acaoCallback) {
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

        // Configurar botão baseado no tipo
        const config = this.obterConfiguracaoModalTipo(tipo);
        confirmBtn.textContent = config.texto;
        confirmBtn.className = `btn ${config.classe}`;

        // Armazenar ação pendente
        window.acaoPendente = acaoCallback;
    }

    obterConfiguracaoModalTipo(tipo) {
        const tipos = {
            confirmacao: { texto: 'Confirmar', classe: 'btn-primary' },
            exclusao: { texto: 'Excluir', classe: 'btn-danger' },
            entrada: { texto: 'Registrar Entrada', classe: 'btn-success' },
            saida: { texto: 'Registrar Saída', classe: 'btn-warning' },
            info: { texto: 'Entendi', classe: 'btn-primary' }
        };
        
        return tipos[tipo] || tipos.confirmacao;
    }

    animarModalEntrada(modal) {
        modal.classList.add('show');
        modal.style.animation = 'fadeIn 0.2s ease';
    }

    configurarAcessibilidadeModal(modal) {
        // Trap focus dentro do modal
        const focoElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focoElements.length > 0) {
            focoElements[0].focus();
        }
        
        // Adicionar event listeners para teclado
        modal.addEventListener('keydown', (e) => this.handleModalKeydown(e));
    }

    handleModalKeydown(e) {
        if (e.key === 'Escape') {
            this.fecharModal();
        }
    }

    fecharModal() {
        const modal = document.getElementById('modal');
        if (!modal) return;
        
        modal.classList.remove('show');
        window.acaoPendente = null;
        
        // Remover event listener
        modal.removeEventListener('keydown', this.handleModalKeydown);
    }

    confirmarAcao() {
        if (typeof window.acaoPendente === 'function') {
            window.acaoPendente();
        }
        this.fecharModal();
    }

    // ==================== UTILITÁRIOS DE NAVEGAÇÃO ====================
    handleTeclasAtalho(e) {
        // Alt + número para navegação rápida
        if (e.altKey) {
            const atalhos = {
                '1': 'dashboard',
                '2': 'estoque',
                '3': 'qualidade',
                '4': 'recepcao',
                '5': 'producao',
                '6': 'configuracao'
            };
            
            if (atalhos[e.key]) {
                e.preventDefault();
                this.mostrarTela(atalhos[e.key]);
            }
        }
        
        // ESC para fechar sidebar/modal
        if (e.key === 'Escape') {
            this.fecharSidebar();
        }
        
        // Ctrl + K para busca global
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            this.focarBuscaGlobal();
        }
    }

    handleResize() {
        // Fechar sidebar em mobile se estiver aberta
        if (window.innerWidth <= this.breakpoints.mobile) {
            this.fecharSidebar();
        }
        
        // Ajustar animações baseado no dispositivo
        this.animacoesAtivadas = window.innerWidth > this.breakpoints.mobile;
    }

    aoMudarPagina() {
        // Callback para quando a página muda
        // Pode ser usado para analytics, logging, etc.
    }

    prevenirDuploNavegacao(elemento) {
        elemento.style.pointerEvents = 'none';
        setTimeout(() => {
            elemento.style.pointerEvents = '';
        }, 300);
    }

    voltar() {
        if (this.historicoNavegacao.length > 0) {
            const paginaAnterior = this.historicoNavegacao.pop();
            this.mostrarTela(paginaAnterior, false);
        } else {
            this.mostrarTela('dashboard');
        }
    }

    configurarBuscaGlobal() {
        // Implementar busca global aqui se necessário
    }

    focarBuscaGlobal() {
        const buscaInput = document.getElementById('buscarEstoque');
        if (buscaInput && this.paginaAtual === 'estoque') {
            buscaInput.focus();
        }
    }

    // ==================== MÉTODOS PÚBLICOS ====================
    irPara(pagina) {
        this.mostrarTela(pagina);
    }
    
    recarregarPagina() {
        this.configurarPaginaEspecifica(this.paginaAtual);
    }
    
    obterPaginaAtual() {
        return this.paginaAtual;
    }
    
    obterHistorico() {
        return [...this.historicoNavegacao];
    }
}

// ==================== INSTÂNCIA GLOBAL ====================
const navegacao = new Navegacao();

// ==================== FUNÇÕES LEGADO (COMPATIBILIDADE) ====================
function mostrarTela(telaNome) {
    navegacao.mostrarTela(telaNome);
}

function toggleSidebar() {
    navegacao.toggleSidebar();
}

function fecharModal() {
    navegacao.fecharModal();
}

function confirmarAcao() {
    navegacao.confirmarAcao();
}

function mostrarModal(titulo, mensagem, detalhes, tipo, acaoCallback) {
    navegacao.mostrarModal(titulo, mensagem, detalhes, tipo, acaoCallback);
}

// Event listeners globais para compatibilidade
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        navegacao.fecharModal();
    }
    
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target)) {
        navegacao.fecharSidebar();
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏭 Packing House v2.0 iniciado');
});