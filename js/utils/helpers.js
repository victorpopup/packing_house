/* filepath: d:\Documents\meus_projetos\packing_house\js\utils\helpers.js */
/**
 * Funções auxiliares e utilitários
 */

// ==================== DATA E HORA ====================
/**
 * Formata uma data para o padrão brasileiro
 */
function formatarDataHora(data) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(data);
}

// ==================== STORAGE ====================
/**
 * Salva dados no localStorage
 */
function salvarDados(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
    } catch (e) {
        console.error('Erro ao salvar dados:', e);
    }
}

/**
 * Recupera dados do localStorage
 */
function recuperarDados(chave) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : null;
    } catch (e) {
        console.error('Erro ao recuperar dados:', e);
        return null;
    }
}

// ==================== VALIDAÇÃO ====================
/**
 * Valida se uma entrada não está vazia
 */
function validarEntrada(valor) {
    return valor && valor.trim() !== '';
}

/**
 * Limpa o valor de um input
 */
function limparInput(idInput) {
    const input = document.getElementById(idInput);
    if (input) {
        input.value = '';
    }
}

// ==================== NOTIFICAÇÕES ====================
/**
 * Mostra notificação tipo toast (moderno)
 */
function mostrarNotificacao(mensagem, tipo = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // Limpar classes anteriores
    toast.className = 'toast show ' + tipo;
    toast.textContent = mensagem;
    
    // Remover notificação após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Alerta antigo (mantido para compatibilidade)
 */
function mostrarAlerta(mensagem, tipo = 'sucesso') {
    console.log(`[${tipo.toUpperCase()}] ${mensagem}`);
    mostrarNotificacao(mensagem, tipo === 'sucesso' ? 'success' : tipo === 'erro' ? 'error' : 'warning');
}