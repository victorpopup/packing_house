/* filepath: d:\Documents\meus_projetos\packing_house\js\modules\auth.js */
/**
 * Módulo de Autenticação e Controle de Acesso
 */

class AuthSystem {
    constructor() {
        this.usuarios = this.carregarUsuarios();
        this.usuarioAtual = this.carregarUsuarioAtual();
        this.inicializar();
    }

    inicializar() {
        // Não criar usuário admin padrão - o usuário vai criar manualmente
        if (!this.usuarios || Object.keys(this.usuarios).length === 0) {
            console.log('Nenhum usuário cadastrado ainda. O admin precisará criar o primeiro usuário.');
        }

        // Verificar se há usuário logado
        if (this.usuarioAtual) {
            this.mostrarSistema();
        } else {
            this.mostrarLogin();
        }
    }

    criarAdminPadrao() {
        const adminPadrao = {
            usuario: 'admin',
            senha: 'admin123',
            nome: 'Administrador',
            nivel: 'admin',
            permissoes: {
                dashboard: { ver: true, editar: true },
                estoque: { ver: true, editar: true },
                qualidade: { ver: true, editar: true },
                recepcao: { ver: true, editar: true },
                producao: { ver: true, editar: true },
                configuracao: { ver: true, editar: true }
            },
            criadoEm: new Date().toISOString()
        };

        this.usuarios = { admin: adminPadrao };
        this.salvarUsuarios();
        console.log('Usuário admin padrão criado: admin/admin123');
    }

    carregarUsuarios() {
        return recuperarDados('auth_usuarios') || {};
    }

    salvarUsuarios() {
        salvarDados('auth_usuarios', this.usuarios);
    }

    carregarUsuarioAtual() {
        return recuperarDados('auth_usuario_atual');
    }

    salvarUsuarioAtual(usuario) {
        salvarDados('auth_usuario_atual', usuario);
    }

    login(usuario, senha) {
        const userData = this.usuarios[usuario];
        
        if (!userData) {
            mostrarNotificacao('Usuário não encontrado', 'error');
            return false;
        }

        if (userData.senha !== senha) {
            mostrarNotificacao('Senha incorreta', 'error');
            return false;
        }

        this.usuarioAtual = userData;
        this.salvarUsuarioAtual(userData);
        
        mostrarNotificacao(`Bem-vindo, ${userData.nome}!`, 'success');
        this.mostrarSistema();
        return true;
    }

    logout() {
        this.usuarioAtual = null;
        localStorage.removeItem('auth_usuario_atual');
        mostrarNotificacao('Logout realizado com sucesso', 'success');
        this.mostrarLogin();
    }

    mostrarLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainSystem').style.display = 'none';
    }

    mostrarSistema() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainSystem').style.display = 'block';
        
        // Atualizar informações do usuário
        this.atualizarInfoUsuario();
        
        // Aplicar permissões
        this.aplicarPermissoes();
        
        // Mostrar página inicial permitida
        this.mostrarPaginaInicial();
    }

    atualizarInfoUsuario() {
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        
        if (userInfo && this.usuarioAtual) {
            userName.textContent = this.usuarioAtual.nome;
            
            // Adicionar nível de acesso
            const nivelText = {
                'admin': 'Administrador',
                'gerente': 'Gerente',
                'operador': 'Operador',
                'visualizador': 'Visualizador'
            };
            
            userName.title = `Nível: ${nivelText[this.usuarioAtual.nivel] || this.usuarioAtual.nivel}`;
        }
    }

    aplicarPermissoes() {
        if (!this.usuarioAtual || this.usuarioAtual.nivel === 'admin') {
            return; // Admin tem acesso a tudo
        }

        const permissoes = this.usuarioAtual.permissoes;
        
        // Esconder itens do menu sem permissão
        Object.keys(permissoes).forEach(pagina => {
            const permissao = permissoes[pagina];
            const menuItem = document.querySelector(`[data-menu="${pagina}"]`);
            
            if (menuItem && !permissao.ver) {
                menuItem.style.display = 'none';
            }
        });

        // Desabilitar botões de edição/adicionar conforme permissão
        this.aplicarPermissoesBotoes(permissoes);
    }

    aplicarPermissoesBotoes(permissoes) {
        // Estoque
        if (permissoes.estoque && !permissoes.estoque.editar) {
            const botoesEstoque = [
                'button[onclick="adicionarMaterial()"]',
                'button[onclick="movimentar(\'entrada\')"]',
                'button[onclick="movimentar(\'saida\')"]',
                'button[onclick*="deletarMaterial"]'
            ];
            
            botoesEstoque.forEach(selector => {
                const btn = document.querySelector(selector);
                if (btn) btn.disabled = true;
            });

            // Desabilitar inputs
            const inputsEstoque = [
                '#nomeMaterial',
                '#materialMov',
                '#quantidadeMov'
            ];
            
            inputsEstoque.forEach(selector => {
                const input = document.querySelector(selector);
                if (input) input.disabled = true;
            });
        }

        // Qualidade
        if (permissoes.qualidade && !permissoes.qualidade.editar) {
            const botoesQualidade = [
                'button[onclick="adicionarProblema()"]',
                'button[onclick="registrarCaixa()"]',
                'button[onclick="gerarRelatorioPDF()"]'
            ];
            
            botoesQualidade.forEach(selector => {
                const btn = document.querySelector(selector);
                if (btn) btn.disabled = true;
            });

            // Desabilitar inputs
            const inputsQualidade = [
                '#qualColhedora',
                '#qualEmbaladora',
                '#qualTipoProblema',
                '#qualQuantidadeProblema'
            ];
            
            inputsQualidade.forEach(selector => {
                const input = document.querySelector(selector);
                if (input) input.disabled = true;
            });
        }

        // Configuração
        if (permissoes.configuracao && !permissoes.configuracao.editar) {
            const btnLimparHistorico = document.querySelector('button[onclick="mostrarConfirmacaoLimparHistorico()"]');
            if (btnLimparHistorico) btnLimparHistorico.disabled = true;
        }
    }

    mostrarPaginaInicial() {
        if (!this.usuarioAtual) return;

        if (this.usuarioAtual.nivel === 'admin') {
            mostrarTela('dashboard');
        } else {
            // Encontrar primeira página permitida
            const permissoes = this.usuarioAtual.permissoes;
            
            for (const [pagina, permissao] of Object.entries(permissoes)) {
                if (permissao.ver) {
                    mostrarTela(pagina);
                    break;
                }
            }
        }
    }

    verificarPermissao(pagina, acao = 'ver') {
        if (!this.usuarioAtual) return false;
        if (this.usuarioAtual.nivel === 'admin') return true;
        
        const permissoes = this.usuarioAtual.permissoes;
        return permissoes[pagina] && permissoes[pagina][acao];
    }

    // Métodos para administração de usuários
    adicionarUsuario(dadosUsuario) {
        if (!this.verificarPermissao('configuracao', 'editar')) {
            mostrarNotificacao('Você não tem permissão para adicionar usuários', 'error');
            return false;
        }

        if (this.usuarios[dadosUsuario.usuario]) {
            mostrarNotificacao('Usuário já existe', 'error');
            return false;
        }

        this.usuarios[dadosUsuario.usuario] = {
            ...dadosUsuario,
            criadoEm: new Date().toISOString(),
            criadoPor: this.usuarioAtual.usuario
        };

        this.salvarUsuarios();
        mostrarNotificacao(`Usuário "${dadosUsuario.usuario}" adicionado com sucesso`, 'success');
        return true;
    }

    editarUsuario(usuario, dadosAtualizados) {
        if (!this.verificarPermissao('configuracao', 'editar')) {
            mostrarNotificacao('Você não tem permissão para editar usuários', 'error');
            return false;
        }

        if (!this.usuarios[usuario]) {
            mostrarNotificacao('Usuário não encontrado', 'error');
            return false;
        }

        // Não permitir editar o próprio nível de acesso
        if (usuario === this.usuarioAtual.usuario && dadosAtualizados.nivel) {
            delete dadosAtualizados.nivel;
        }

        this.usuarios[usuario] = {
            ...this.usuarios[usuario],
            ...dadosAtualizados,
            atualizadoEm: new Date().toISOString(),
            atualizadoPor: this.usuarioAtual.usuario
        };

        this.salvarUsuarios();
        mostrarNotificacao(`Usuário "${usuario}" atualizado com sucesso`, 'success');
        return true;
    }

    removerUsuario(usuario) {
        if (!this.verificarPermissao('configuracao', 'editar')) {
            mostrarNotificacao('Você não tem permissão para remover usuários', 'error');
            return false;
        }

        if (usuario === 'admin') {
            mostrarNotificacao('Não é possível remover o usuário admin', 'error');
            return false;
        }

        if (usuario === this.usuarioAtual.usuario) {
            mostrarNotificacao('Não é possível remover seu próprio usuário', 'error');
            return false;
        }

        if (!this.usuarios[usuario]) {
            mostrarNotificacao('Usuário não encontrado', 'error');
            return false;
        }

        delete this.usuarios[usuario];
        this.salvarUsuarios();
        mostrarNotificacao(`Usuário "${usuario}" removido com sucesso`, 'success');
        return true;
    }

    listarUsuarios() {
        if (!this.verificarPermissao('configuracao', 'ver')) {
            mostrarNotificacao('Você não tem permissão para ver usuários', 'error');
            return [];
        }

        return Object.entries(this.usuarios).map(([usuario, dados]) => ({
            usuario,
            ...dados
        }));
    }
}

// Instância global
const auth = new AuthSystem();
