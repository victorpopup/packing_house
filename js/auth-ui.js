/* filepath: d:\Documents\meus_projetos\packing_house\js\auth-ui.js */
/**
 * Interface de Usuário para Autenticação
 */

// Função de login
function fazerLogin(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('loginUsuario').value;
    const senha = document.getElementById('loginSenha').value;
    
    if (auth.login(usuario, senha)) {
        // Limpar formulário
        document.getElementById('loginForm').reset();
    }
}

// Função para criar o primeiro usuário
function criarPrimeiroUsuario(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('primeiroUsuario').value;
    const senha = document.getElementById('primeiraSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    
    // Validar senhas
    if (senha !== confirmarSenha) {
        mostrarNotificacao('As senhas não coincidem', 'error');
        return;
    }
    
    if (senha.length < 6) {
        mostrarNotificacao('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    const dadosUsuario = {
        usuario: usuario,
        nome: usuario, // Usar o nome de usuário como nome também
        senha: senha
    };
    
    if (auth.criarPrimeiroUsuario(dadosUsuario)) {
        // Fazer login automaticamente após criar
        auth.login(usuario, senha);
    }
}

// Função de logout
function fazerLogout() {
    const usuarioAtual = auth.usuarioAtual;
    const detalhes = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 3rem; margin-bottom: 15px;">👋</div>
            <p style="margin: 10px 0;"><strong>Usuário:</strong> ${usuarioAtual.nome}</strong></p>
            <p style="margin: 10px 0; color: var(--text-secondary);">Deseja realmente sair do sistema?</p>
            <p style="margin: 10px 0; font-size: 0.875rem; color: var(--text-secondary);">Você precisará fazer login novamente para acessar o sistema.</p>
        </div>
    `;

    mostrarModal(
        '🚪 Sair do Sistema',
        'Confirmar logout',
        detalhes,
        'exclusao',
        () => {
            auth.logout();
        }
    );
}

// Mostrar formulário de adicionar usuário
function mostrarFormularioUsuario() {
    // Verificação simples
    if (!auth.usuarioAtual) {
        return;
    }
    
    if (!auth.verificarPermissao('configuracao', 'editar')) {
        console.error('Sem permissão para adicionar usuários');
        return;
    }
    
    const formularioHtml = `
        <div style="display: grid; gap: 15px;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Usuário</label>
                <input type="text" id="novoUsuario" class="form-input" placeholder="Nome de usuário" required>
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Senha</label>
                <input type="password" id="novaSenha" class="form-input" placeholder="Senha" required>
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nível de Acesso</label>
                <select id="novoNivel" class="form-input" required>
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
            <div id="permissoesContainer" style="display: grid; gap: 10px; margin-top: 10px;">
                <!-- Permissões serão adicionadas via JavaScript -->
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
                usuario: document.getElementById('novoUsuario').value,
                nome: document.getElementById('novoUsuario').value,
                senha: document.getElementById('novaSenha').value,
                nivel: document.getElementById('novoNivel').value,
                permissoes: obterPermissoesDoFormulario()
            };

            if (auth.adicionarUsuario(dadosUsuario)) {
                // Limpar formulário
                document.getElementById('novoUsuario').value = '';
                document.getElementById('novaSenha').value = '';
                document.getElementById('novoNivel').value = '';
            }
        }
    );

    // Adicionar evento para atualizar permissões quando o nível mudar
    document.getElementById('novoNivel').addEventListener('change', atualizarPermissoesFormulario);
    
    // Inicializar permissões
    setTimeout(() => atualizarPermissoesFormulario(), 100);
}

// Atualizar permissões no formulário baseado no nível
function atualizarPermissoesFormulario() {
    const nivel = document.getElementById('novoNivel').value;
    const container = document.getElementById('permissoesContainer');
    
    if (!container) return;

    const permissoesPadrao = getPermissoesPadrao(nivel);
    
    let html = '';
    Object.keys(permissoesPadrao).forEach(pagina => {
        const permissao = permissoesPadrao[pagina];
        html += `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                <label style="flex: 1; margin: 0; font-weight: normal;">
                    <input type="checkbox" data-pagina="${pagina}" data-acao="ver" 
                           ${permissao.ver ? 'checked' : ''} style="margin-right: 5px;">
                    Ver ${pagina.charAt(0).toUpperCase() + pagina.slice(1)}
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

// Obter permissões do formulário
function obterPermissoesDoFormulario() {
    const permissoes = {};
    const checkboxes = document.querySelectorAll('#permissoesContainer input[type="checkbox"]');
    
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

// Obter permissões padrão baseado no nível
function getPermissoesPadrao(nivel) {
    const templates = {
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
            recepcao: { ver: true, editar: false },
            producao: { ver: true, editar: false },
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
    
    return templates[nivel] || templates.visualizador;
}

// Mostrar lista de usuários
function mostrarListaUsuarios() {
    if (!auth.verificarPermissao('configuracao', 'ver')) {
        mostrarNotificacao('Você não tem permissão para ver usuários', 'error');
        return;
    }

    const usuarios = auth.listarUsuarios();
    
    let tabelaHtml = `
        <div style="max-height: 400px; overflow-y: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>Nome</th>
                        <th>Nível</th>
                        <th>Criado em</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (usuarios.length === 0) {
        tabelaHtml += `
            <tr>
                <td colspan="5" style="text-align: center; color: #999;">Nenhum usuário encontrado</td>
            </tr>
        `;
    } else {
        usuarios.forEach(usuario => {
            const dataCriacao = new Date(usuario.criadoEm).toLocaleDateString('pt-BR');
            const nivelText = {
                'admin': 'Administrador',
                'gerente': 'Gerente',
                'operador': 'Operador',
                'visualizador': 'Visualizador'
            };
            
            tabelaHtml += `
                <tr>
                    <td>${usuario.usuario}</td>
                    <td>${usuario.nome}</td>
                    <td><span class="badge badge-info">${nivelText[usuario.nivel] || usuario.nivel}</span></td>
                    <td>${dataCriacao}</td>
                    <td>
                        ${usuario.usuario !== 'admin' ? `
                            <button class="btn btn-sm btn-warning" onclick="editarUsuario('${usuario.usuario}')">✏️</button>
                            <button class="btn btn-sm btn-danger" onclick="removerUsuario('${usuario.usuario}')">🗑️</button>
                        ` : '<span style="color: #999;">Admin</span>'}
                    </td>
                </tr>
            `;
        });
    }

    tabelaHtml += `
                </tbody>
            </table>
        </div>
    `;

    mostrarModal(
        '📋 Lista de Usuários',
        `Total de usuários: ${usuarios.length}`,
        tabelaHtml,
        'info'
    );
}

// Editar usuário
function editarUsuario(usuario) {
    if (!auth.verificarPermissao('configuracao', 'editar')) {
        mostrarNotificacao('Você não tem permissão para editar usuários', 'error');
        return;
    }

    const userData = auth.usuarios[usuario];
    if (!userData) return;

    const formularioHtml = `
        <div style="display: grid; gap: 15px;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Usuário</label>
                <input type="text" id="editUsuario" class="form-input" value="${usuario}" disabled>
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nova Senha (deixe em branco para manter atual)</label>
                <input type="password" id="editSenha" class="form-input" placeholder="Nova senha">
            </div>
            ${usuario !== auth.usuarioAtual.usuario ? `
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nível de Acesso</label>
                <select id="editNivel" class="form-input" required>
                    <option value="admin" ${userData.nivel === 'admin' ? 'selected' : ''}>Administrador</option>
                    <option value="gerente" ${userData.nivel === 'gerente' ? 'selected' : ''}>Gerente</option>
                    <option value="operador" ${userData.nivel === 'operador' ? 'selected' : ''}>Operador</option>
                    <option value="visualizador" ${userData.nivel === 'visualizador' ? 'selected' : ''}>Visualizador</option>
                </select>
            </div>
            ` : `
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nível de Acesso</label>
                <input type="text" class="form-input" value="${userData.nivel}" disabled>
                <small style="color: #666;">Você não pode alterar seu próprio nível de acesso</small>
            </div>
            `}
        </div>
        <div style="margin-top: 20px;">
            <h5>Permissões Atuais</h5>
            <div id="editPermissoesContainer" style="display: grid; gap: 10px; margin-top: 10px;">
                <!-- Permissões serão adicionadas via JavaScript -->
            </div>
        </div>
    `;

    mostrarModal(
        '✏️ Editar Usuário',
        `Editando usuário: ${usuario}`,
        formularioHtml,
        'confirmacao',
        () => {
            const dadosAtualizados = {
                nome: document.getElementById('editUsuario').value, // Manter o mesmo nome
                permissoes: obterPermissoesDoFormulario()
            };

            const novaSenha = document.getElementById('editSenha').value;
            if (novaSenha) {
                dadosAtualizados.senha = novaSenha;
            }

            if (usuario !== auth.usuarioAtual.usuario) {
                dadosAtualizados.nivel = document.getElementById('editNivel').value;
            }

            auth.editarUsuario(usuario, dadosAtualizados);
        }
    );

    // Adicionar evento para atualizar permissões quando o nível mudar
    const nivelSelect = document.getElementById('editNivel');
    if (nivelSelect) {
        nivelSelect.addEventListener('change', () => {
            atualizarPermissoesFormularioEdit(userData.permissoes);
        });
    }
    
    // Inicializar permissões
    setTimeout(() => atualizarPermissoesFormularioEdit(userData.permissoes), 100);
}

// Atualizar permissões no formulário de edição
function atualizarPermissoesFormularioEdit(permissoesAtuais) {
    const nivel = document.getElementById('editNivel')?.value || auth.usuarios[document.getElementById('editUsuario').value].nivel;
    const container = document.getElementById('editPermissoesContainer');
    
    if (!container) return;

    const permissoesPadrao = getPermissoesPadrao(nivel);
    
    let html = '';
    Object.keys(permissoesPadrao).forEach(pagina => {
        const permissaoPadrao = permissoesPadrao[pagina];
        const permissaoAtual = permissoesAtuais[pagina] || permissaoPadrao;
        
        html += `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                <label style="flex: 1; margin: 0; font-weight: normal;">
                    <input type="checkbox" data-pagina="${pagina}" data-acao="ver" 
                           ${permissaoAtual.ver ? 'checked' : ''} style="margin-right: 5px;">
                    Ver ${pagina.charAt(0).toUpperCase() + pagina.slice(1)}
                </label>
                <label style="margin: 0; font-weight: normal;">
                    <input type="checkbox" data-pagina="${pagina}" data-acao="editar" 
                           ${permissaoAtual.editar ? 'checked' : ''} style="margin-right: 5px;">
                    Editar
                </label>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Remover usuário
function removerUsuario(usuario) {
    if (!auth.verificarPermissao('configuracao', 'editar')) {
        mostrarNotificacao('Você não tem permissão para remover usuários', 'error');
        return;
    }

    const detalhes = `
        <p><strong>Usuário:</strong> ${usuario}</p>
        <p style="color: #ef4444;"><strong>⚠️ ATENÇÃO:</strong> Esta ação não pode ser desfeita!</p>
        <p>O usuário perderá acesso ao sistema permanentemente.</p>
    `;

    mostrarModal(
        '🗑️ Confirmar Remoção',
        `Tem certeza que deseja remover o usuário "${usuario}"?`,
        detalhes,
        'exclusao',
        () => auth.removerUsuario(usuario)
    );
}
