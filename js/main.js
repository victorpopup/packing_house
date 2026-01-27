/* filepath: d:\Documents\meus_projetos\packing_house\js\main.js */
/**
 * Script principal - Controle de navegação
 */

// Mostrar/ocultar telas
function mostrarTela(telaNome) {
    // Ocultar todas as telas
    document.querySelectorAll('.tela').forEach(tela => {
        tela.classList.add('hidden');
    });

    // Ocultar imagem central
    const imagemCentral = document.getElementById('telaInicial');
    if (imagemCentral) {
        imagemCentral.classList.add('hidden');
    }

    // Mostrar tela selecionada
    if (telaNome === 'inicial') {
        if (imagemCentral) {
            imagemCentral.classList.remove('hidden');
        }
    } else {
        const tela = document.getElementById(telaNome);
        if (tela) {
            tela.classList.remove('hidden');
        }
    }
}

// Inicializar ao carregar página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏭 Packing House iniciado');
});