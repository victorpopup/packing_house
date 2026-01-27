/* filepath: d:\Documents\meus_projetos\packing_house\js\utils\helpers.js */
/**
 * Funções auxiliares e utilitários
 */

// Formatar data/hora
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

// Salvar dados no localStorage
function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

// Recuperar dados do localStorage
function recuperarDados(chave) {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : null;
}

// Validar entrada vazia
function validarEntrada(valor) {
    return valor && valor.trim() !== '';
}

// Limpar input
function limparInput(idInput) {
    document.getElementById(idInput).value = '';
}

// Mostrar alerta customizado
function mostrarAlerta(mensagem, tipo = 'sucesso') {
    console.log(`[${tipo.toUpperCase()}] ${mensagem}`);
}