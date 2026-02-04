/* Login Simplificado - Packing House */

// Usuário admin personalizado (coloque seu usuário e senha aqui)
const ADMIN_PADRAO = {
    usuario: 'Victor',
    senha: 'victor12345',
    nome: 'Administrador',
    nivel: 'admin',
    permissoes: {
        dashboard: { ver: true, editar: true },
        estoque: { ver: true, editar: true },
        qualidade: { ver: true, editar: true },
        recepcao: { ver: true, editar: true },
        producao: { ver: true, editar: true },
        configuracao: { ver: true, editar: true }
    }
};

// Variável global para o usuário atual
let usuarioAtual = null;

// Função para limpar formulário
function limparFormulario(formId) {
    const form = document.getElementById(formId);
    if (form) {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type === 'text' || input.type === 'password' || input.type === 'number') {
                input.value = '';
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            }
        });
    }
}

// Função para mostrar formulário de criação de usuário
function mostrarCriacaoUsuario() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('formCriacaoUsuario').style.display = 'block';
    // Limpar formulário ao abrir
    limparFormulario('formCriacaoUsuario');
}

// Função para voltar ao formulário de login
function mostrarLogin() {
    document.getElementById('formCriacaoUsuario').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    // Limpar formulário ao voltar
    limparFormulario('loginForm');
}

// Função para criar novo usuário
function criarNovoUsuario(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('novoUsuario').value;
    const senha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const nivel = document.getElementById('novoNivel').value;
    
    if (!usuario || !senha || !confirmarSenha || !nivel) {
        return false;
    }
    
    if (senha.length < 6) {
        return false;
    }
    
    if (senha !== confirmarSenha) {
        return false;
    }
    
    // Obter permissões baseadas no nível
    const permissoes = getPermissoesPorNivel(nivel);
    
    // Criar novo usuário
    const novoUsuario = {
        usuario: usuario,
        nome: usuario,
        senha: senha,
        nivel: nivel,
        permissoes: permissoes,
        criadoEm: new Date().toISOString(),
        criadoPor: usuarioAtual?.usuario || 'sistema'
    };
    
    // Salvar no localStorage
    const usuarios = JSON.parse(localStorage.getItem('auth_usuarios') || '{}');
    usuarios[usuario] = novoUsuario;
    localStorage.setItem('auth_usuarios', JSON.stringify(usuarios));
    
    // Limpar formulário e voltar ao login
    document.getElementById('novoUsuario').value = '';
    document.getElementById('novaSenha').value = '';
    document.getElementById('confirmarSenha').value = '';
    document.getElementById('novoNivel').value = '';
    
    mostrarLogin();
    
    return false;
}

// Obter permissões baseadas no nível
function getPermissoesPorNivel(nivel) {
    const permissoes = {
        admin: {
            dashboard: { ver: true, editar: true },
            estoque: { ver: true, editar: true },
            qualidade: { ver: true, editar: true },
            recepcao: { ver: true, editar: true },
            producao: { ver: true, editar: true },
            configuracao: { ver: true, editar: true }
        },
        gerente: {
            dashboard: { ver: true, editar: true },
            estoque: { ver: true, editar: true },
            qualidade: { ver: true, editar: true },
            recepcao: { ver: false, editar: false },
            producao: { ver: false, editar: false },
            configuracao: { ver: true, editar: false }
        },
        operador: {
            dashboard: { ver: true, editar: false },
            estoque: { ver: true, editar: true },
            qualidade: { ver: true, editar: true },
            recepcao: { ver: false, editar: false },
            producao: { ver: false, editar: false },
            configuracao: { ver: false, editar: false }
        },
        visualizador: {
            dashboard: { ver: true, editar: false },
            estoque: { ver: true, editar: false },
            qualidade: { ver: true, editar: false },
            recepcao: { ver: false, editar: false },
            producao: { ver: false, editar: false },
            configuracao: { ver: false, editar: false }
        }
    };
    
    return permissoes[nivel] || permissoes.visualizador;
}

// Função de login
function fazerLogin(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('loginUsuario').value;
    const senha = document.getElementById('loginSenha').value;
    
    if (!usuario || !senha) {
        return false;
    }
    
    // Verificar login admin padrão
    if (usuario === ADMIN_PADRAO.usuario && senha === ADMIN_PADRAO.senha) {
        usuarioAtual = { ...ADMIN_PADRAO };
        salvarUsuarioAtual();
        mostrarSistema();
        return false;
    }
    
    // Verificar usuários salvos
    const usuariosSalvos = JSON.parse(localStorage.getItem('auth_usuarios') || '{}');
    const usuarioEncontrado = usuariosSalvos[usuario];
    
    if (usuarioEncontrado && usuarioEncontrado.senha === senha) {
        usuarioAtual = usuarioEncontrado;
        salvarUsuarioAtual();
        mostrarSistema();
        return false;
    }
    
    return false;
}

// Salvar usuário atual no localStorage
function salvarUsuarioAtual() {
    localStorage.setItem('auth_usuario_atual', JSON.stringify(usuarioAtual));
}

// Carregar usuário atual do localStorage
function carregarUsuarioAtual() {
    const salvo = localStorage.getItem('auth_usuario_atual');
    if (salvo) {
        usuarioAtual = JSON.parse(salvo);
        return true;
    }
    return false;
}

// Mostrar sistema principal
function mostrarSistema() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainSystem').style.display = 'block';
    
    // Atualizar nome do usuário
    if (usuarioAtual) {
        document.getElementById('userName').textContent = usuarioAtual.nome || usuarioAtual.usuario;
    }
    
    // Inicializar sistema
    if (typeof inicializarSistema === 'function') {
        inicializarSistema();
    }
}

// Função de logout
function fazerLogout() {
    usuarioAtual = null;
    localStorage.removeItem('auth_usuario_atual');
    document.getElementById('mainSystem').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    
    // Limpar formulário de login de forma mais completa
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const inputs = loginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
            // Limpar também o autocomplete do navegador
            input.setAttribute('autocomplete', 'off');
        });
        // Resetar o formulário
        loginForm.reset();
    }
    
    // Garantir que o formulário de criação esteja escondido
    document.getElementById('formCriacaoUsuario').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    
    // Limpar também o formulário de criação se estiver visível
    const criacaoForm = document.getElementById('formCriacaoUsuario');
    if (criacaoForm) {
        const inputs = criacaoForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type === 'text' || input.type === 'password') {
                input.value = '';
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            }
        });
        criacaoForm.reset();
    }
}

// Verificar se já está logado ao carregar a página
function verificarLogin() {
    if (carregarUsuarioAtual()) {
        mostrarSistema();
    }
}

// Adicionar ao escopo global
window.fazerLogin = fazerLogin;
window.fazerLogout = fazerLogout;
window.mostrarCriacaoUsuario = mostrarCriacaoUsuario;
window.mostrarLogin = mostrarLogin;
window.criarNovoUsuario = criarNovoUsuario;
window.limparFormulario = limparFormulario;
window.usuarioAtual = usuarioAtual;

// Verificar login ao carregar
document.addEventListener('DOMContentLoaded', verificarLogin);
