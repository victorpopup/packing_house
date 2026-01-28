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
        'producao': 'Produção'
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