/* Sistema de Gerenciamento de Usuários - Packing House */

// Mostrar formulário de adicionar usuário (admin)
function mostrarFormularioAdicionarUsuario() {
    const formularioHtml = `
        <div style="display: grid; gap: 15px;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Usuário</label>
                <input type="text" id="adminNovoUsuario" class="form-input" placeholder="Nome de usuário" required>
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Senha</label>
                <input type="password" id="adminNovaSenha" class="form-input" placeholder="Senha (mínimo 6 caracteres)" required>
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nível de Acesso</label>
                <select id="adminNovoNivel" class="form-input" required onchange="atualizarPermissoesAdmin()">
                    <option value="">Selecione o nível</option>
                    <option value="admin">Administrador</option>
                    <option value="gerente">Gerente</option>
                    <option value="operador">Operador</option>
                    <option value="visualizador">Visualizador</option>
                </select>
            </div>
        </div>
        <div style="margin-top: 20px;">
            <h5>Configurar Permissões</h5>
            <div id="permissoesAdminContainer" style="display: grid; gap: 10px; margin-top: 10px;">
                <!-- Permissões serão adicionadas dinamicamente -->
            </div>
        </div>
    `;

    mostrarModal(
        '➕ Adicionar Novo Usuário',
        'Preencha os dados para criar um novo usuário',
        formularioHtml,
        'confirmacao',
        () => {
            const dadosUsuario = {
                usuario: document.getElementById('adminNovoUsuario').value,
                nome: document.getElementById('adminNovoUsuario').value,
                senha: document.getElementById('adminNovaSenha').value,
                nivel: document.getElementById('adminNovoNivel').value,
                permissoes: obterPermissoesAdminForm()
            };

            if (criarUsuarioAdmin(dadosUsuario)) {
                // Limpar formulário
                limparCamposModal();
                
                // Atualizar lista rápida
                atualizarListaUsuariosRapida();
            }
        }
    );

    // Inicializar permissões após abrir o modal
    setTimeout(() => atualizarPermissoesAdmin(), 100);
}

// Função para limpar campos do modal
function limparCamposModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        const inputs = modal.querySelectorAll('input[type="text"], input[type="password"], select');
        inputs.forEach(input => {
            if (input.type === 'text' || input.type === 'password') {
                input.value = '';
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            }
        });
    }
}

// Atualizar permissões no formulário do admin
function atualizarPermissoesAdmin() {
    const nivel = document.getElementById('adminNovoNivel').value;
    const container = document.getElementById('permissoesAdminContainer');
    
    if (!container) return;

    const permissoesPadrao = getPermissoesPorNivel(nivel);
    
    let html = '';
    const paginas = ['dashboard', 'estoque', 'qualidade', 'recepcao', 'producao', 'configuracao'];
    
    paginas.forEach(pagina => {
        const permissao = permissoesPadrao[pagina] || { ver: false, editar: false };
        const nomePagina = pagina.charAt(0).toUpperCase() + pagina.slice(1);
        
        html += `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                <label style="flex: 1; margin: 0; font-weight: normal;">
                    <input type="checkbox" data-pagina="${pagina}" data-acao="ver" 
                           ${permissao.ver ? 'checked' : ''} style="margin-right: 5px;">
                    Ver ${nomePagina}
                </label>
                <label style="margin: 0; font-weight: normal;">
                    <input type="checkbox" data-pagina="${pagina}" data-acao="editar" 
                           ${permissao.editar ? 'checked' : ''} style="margin-right: 5px;">
                    Editar
                </label>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Obter permissões do formulário do admin
function obterPermissoesAdminForm() {
    const permissoes = {};
    const checkboxes = document.querySelectorAll('#permissoesAdminContainer input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        const pagina = checkbox.dataset.pagina;
        const acao = checkbox.dataset.acao;
        
        if (!permissoes[pagina]) {
            permissoes[pagina] = { ver: false, editar: false };
        }
        
        permissoes[pagina][acao] = checkbox.checked;
    });
    
    return permissoes;
}

// Criar usuário como administrador
function criarUsuarioAdmin(dadosUsuario) {
    // Validações
    if (!dadosUsuario.usuario || !dadosUsuario.senha || !dadosUsuario.nivel) {
        mostrarNotificacao('Preencha todos os campos obrigatórios', 'error');
        return false;
    }
    
    if (dadosUsuario.senha.length < 6) {
        mostrarNotificacao('A senha deve ter pelo menos 6 caracteres', 'error');
        return false;
    }
    
    // Verificar se usuário já existe
    const usuarios = JSON.parse(localStorage.getItem('auth_usuarios') || '{}');
    if (usuarios[dadosUsuario.usuario]) {
        mostrarNotificacao('Usuário já existe', 'error');
        return false;
    }
    
    // Criar usuário
    const novoUsuario = {
        usuario: dadosUsuario.usuario,
        nome: dadosUsuario.usuario,
        senha: dadosUsuario.senha,
        nivel: dadosUsuario.nivel,
        permissoes: dadosUsuario.permissoes,
        criadoEm: new Date().toISOString(),
        criadoPor: window.usuarioAtual?.usuario || 'admin'
    };
    
    // Salvar
    usuarios[dadosUsuario.usuario] = novoUsuario;
    localStorage.setItem('auth_usuarios', JSON.stringify(usuarios));
    
    mostrarNotificacao(`Usuário "${dadosUsuario.usuario}" criado com sucesso`, 'success');
    return true;
}

// Mostrar lista completa de usuários com edição
function mostrarListaUsuariosCompleta() {
    const usuarios = JSON.parse(localStorage.getItem('auth_usuarios') || '{}');
    const usuariosArray = Object.values(usuarios);
    
    if (usuariosArray.length === 0) {
        mostrarModal(
            '📋 Lista de Usuários',
            'Nenhum usuário cadastrado',
            '<p style="text-align: center; padding: 20px;">Nenhum usuário encontrado no sistema.</p>',
            'info',
            null
        );
        return;
    }
    
    let tabelaHtml = `
        <div style="max-height: 400px; overflow-y: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>Nível</th>
                        <th>Criado Em</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    usuariosArray.forEach(usuario => {
        const dataCriacao = new Date(usuario.criadoEm).toLocaleDateString('pt-BR');
        tabelaHtml += `
            <tr>
                <td><strong>${usuario.usuario}</strong></td>
                <td><span class="badge" style="background: ${getCorNivel(usuario.nivel)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.875rem;">${usuario.nivel.toUpperCase()}</span></td>
                <td>${dataCriacao}</td>
                <td>
                    <button class="btn btn-sm" onclick="editarUsuarioAdmin('${usuario.usuario}')" style="margin-right: 5px;">✏️ Editar</button>
                    ${usuario.usuario !== window.usuarioAtual?.usuario ? `<button class="btn btn-sm btn-danger" onclick="excluirUsuarioAdmin('${usuario.usuario}')">🗑️</button>` : ''}
                </td>
            </tr>
        `;
    });
    
    tabelaHtml += '</tbody></table></div>';
    
    mostrarModal(
        '📋 Lista de Usuários',
        `Total: ${usuariosArray.length} usuário(s) cadastrado(s)`,
        tabelaHtml,
        'info',
        null
    );
}

// Editar usuário
function editarUsuarioAdmin(usuario) {
    const usuarios = JSON.parse(localStorage.getItem('auth_usuarios') || '{}');
    const usuarioData = usuarios[usuario];
    
    if (!usuarioData) {
        mostrarNotificacao('Usuário não encontrado', 'error');
        return;
    }
    
    const formularioHtml = `
        <div style="display: grid; gap: 15px;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Usuário</label>
                <input type="text" id="editUsuario" class="form-input" value="${usuarioData.usuario}" readonly>
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nova Senha (deixe em branco para manter atual)</label>
                <input type="password" id="editSenha" class="form-input" placeholder="Nova senha opcional">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nível de Acesso</label>
                <select id="editNivel" class="form-input" onchange="atualizarPermissoesEdit()">
                    <option value="admin" ${usuarioData.nivel === 'admin' ? 'selected' : ''}>Administrador</option>
                    <option value="gerente" ${usuarioData.nivel === 'gerente' ? 'selected' : ''}>Gerente</option>
                    <option value="operador" ${usuarioData.nivel === 'operador' ? 'selected' : ''}>Operador</option>
                    <option value="visualizador" ${usuarioData.nivel === 'visualizador' ? 'selected' : ''}>Visualizador</option>
                </select>
            </div>
        </div>
        <div style="margin-top: 20px;">
            <h5>Configurar Permissões</h5>
            <div id="permissoesEditContainer" style="display: grid; gap: 10px; margin-top: 10px;">
                <!-- Permissões serão adicionadas dinamicamente -->
            </div>
        </div>
    `;

    mostrarModal(
        '✏️ Editar Usuário',
        `Editando: ${usuario}`,
        formularioHtml,
        'confirmacao',
        () => {
            const dadosAtualizados = {
                nivel: document.getElementById('editNivel').value,
                permissoes: obterPermissoesEditForm()
            };
            
            const novaSenha = document.getElementById('editSenha').value;
            if (novaSenha) {
                dadosAtualizados.senha = novaSenha;
            }
            
            if (atualizarUsuarioAdmin(usuario, dadosAtualizados)) {
                atualizarListaUsuariosRapida();
            }
        }
    );

    // Carregar permissões atuais
    setTimeout(() => carregarPermissoesEdit(usuarioData), 100);
}

// Carregar permissões para edição
function carregarPermissoesEdit(usuarioData) {
    atualizarPermissoesEdit();
    
    // Marcar permissões atuais
    Object.keys(usuarioData.permissoes).forEach(pagina => {
        const permissao = usuarioData.permissoes[pagina];
        
        const checkboxVer = document.querySelector(`#permissoesEditContainer input[data-pagina="${pagina}"][data-acao="ver"]`);
        const checkboxEditar = document.querySelector(`#permissoesEditContainer input[data-pagina="${pagina}"][data-acao="editar"]`);
        
        if (checkboxVer) checkboxVer.checked = permissao.ver;
        if (checkboxEditar) checkboxEditar.checked = permissao.editar;
    });
}

// Atualizar permissões na edição
function atualizarPermissoesEdit() {
    const nivel = document.getElementById('editNivel').value;
    const container = document.getElementById('permissoesEditContainer');
    
    if (!container) return;

    const permissoesPadrao = getPermissoesPorNivel(nivel);
    
    let html = '';
    const paginas = ['dashboard', 'estoque', 'qualidade', 'recepcao', 'producao', 'configuracao'];
    
    paginas.forEach(pagina => {
        const permissao = permissoesPadrao[pagina] || { ver: false, editar: false };
        const nomePagina = pagina.charAt(0).toUpperCase() + pagina.slice(1);
        
        html += `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                <label style="flex: 1; margin: 0; font-weight: normal;">
                    <input type="checkbox" data-pagina="${pagina}" data-acao="ver" 
                           ${permissao.ver ? 'checked' : ''} style="margin-right: 5px;">
                    Ver ${nomePagina}
                </label>
                <label style="margin: 0; font-weight: normal;">
                    <input type="checkbox" data-pagina="${pagina}" data-acao="editar" 
                           ${permissao.editar ? 'checked' : ''} style="margin-right: 5px;">
                    Editar
                </label>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Obter permissões do formulário de edição
function obterPermissoesEditForm() {
    const permissoes = {};
    const checkboxes = document.querySelectorAll('#permissoesEditContainer input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        const pagina = checkbox.dataset.pagina;
        const acao = checkbox.dataset.acao;
        
        if (!permissoes[pagina]) {
            permissoes[pagina] = { ver: false, editar: false };
        }
        
        permissoes[pagina][acao] = checkbox.checked;
    });
    
    return permissoes;
}

// Atualizar usuário
function atualizarUsuarioAdmin(usuario, dadosAtualizados) {
    const usuarios = JSON.parse(localStorage.getItem('auth_usuarios') || '{}');
    
    if (!usuarios[usuario]) {
        mostrarNotificacao('Usuário não encontrado', 'error');
        return false;
    }
    
    // Atualizar dados
    usuarios[usuario].nivel = dadosAtualizados.nivel;
    usuarios[usuario].permissoes = dadosAtualizados.permissoes;
    
    if (dadosAtualizados.senha) {
        usuarios[usuario].senha = dadosAtualizados.senha;
    }
    
    usuarios[usuario].atualizadoEm = new Date().toISOString();
    usuarios[usuario].atualizadoPor = window.usuarioAtual?.usuario || 'admin';
    
    // Salvar
    localStorage.setItem('auth_usuarios', JSON.stringify(usuarios));
    
    mostrarNotificacao(`Usuário "${usuario}" atualizado com sucesso`, 'success');
    return true;
}

// Excluir usuário
function excluirUsuarioAdmin(usuario) {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${usuario}"? Esta ação não pode ser desfeita.`)) {
        return;
    }
    
    const usuarios = JSON.parse(localStorage.getItem('auth_usuarios') || '{}');
    
    if (!usuarios[usuario]) {
        mostrarNotificacao('Usuário não encontrado', 'error');
        return;
    }
    
    delete usuarios[usuario];
    localStorage.setItem('auth_usuarios', JSON.stringify(usuarios));
    
    mostrarNotificacao(`Usuário "${usuario}" excluído com sucesso`, 'success');
    atualizarListaUsuariosRapida();
    
    // Fechar e reabrir a lista
    fecharModal();
    setTimeout(() => mostrarListaUsuariosCompleta(), 100);
}

// Atualizar lista rápida de usuários
function atualizarListaUsuariosRapida() {
    const usuarios = JSON.parse(localStorage.getItem('auth_usuarios') || '{}');
    const usuariosArray = Object.values(usuarios);
    const container = document.getElementById('listaUsuariosRapida');
    
    if (!container) return;
    
    if (usuariosArray.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhum usuário cadastrado</p>';
        return;
    }
    
    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';
    
    usuariosArray.forEach(usuario => {
        const corNivel = getCorNivel(usuario.nivel);
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                <span><strong>${usuario.usuario}</strong></span>
                <span style="background: ${corNivel}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">${usuario.nivel.toUpperCase()}</span>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Atualizar contador
    const contadorElement = document.getElementById('configTotalUsuarios');
    if (contadorElement) {
        contadorElement.textContent = usuariosArray.length;
    }
}

// Obter cor para o nível
function getCorNivel(nivel) {
    const cores = {
        admin: '#dc3545',
        gerente: '#28a745',
        operador: '#ffc107',
        visualizador: '#6c757d'
    };
    return cores[nivel] || '#6c757d';
}

// Mostrar notificação (função auxiliar)
function mostrarNotificacaoUsuarios(mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${tipo === 'success' ? '#28a745' : tipo === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
    `;
    notificacao.textContent = mensagem;
    
    document.body.appendChild(notificacao);
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.parentNode.removeChild(notificacao);
        }
    }, 3000);
}

// Adicionar funções ao escopo global
window.mostrarFormularioAdicionarUsuario = mostrarFormularioAdicionarUsuario;
window.mostrarListaUsuariosCompleta = mostrarListaUsuariosCompleta;
window.editarUsuarioAdmin = editarUsuarioAdmin;
window.excluirUsuarioAdmin = excluirUsuarioAdmin;
window.atualizarListaUsuariosRapida = atualizarListaUsuariosRapida;
window.limparCamposModal = limparCamposModal;

// Inicializar lista rápida quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se está na página de configuração
    setTimeout(() => {
        if (document.getElementById('listaUsuariosRapida')) {
            atualizarListaUsuariosRapida();
        }
    }, 500);
});
