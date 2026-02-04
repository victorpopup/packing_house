// Script para criar usuários de exemplo
// Execute este script no console do navegador após fazer login como admin

function criarUsuariosExemplo() {
    // Gerente - pode ver tudo, editar estoque e qualidade
    auth.adicionarUsuario({
        usuario: 'gerente',
        nome: 'Gerente do Sistema',
        senha: 'gerente123',
        nivel: 'gerente',
        permissoes: {
            dashboard: { ver: true, editar: true },
            estoque: { ver: true, editar: true },
            qualidade: { ver: true, editar: true },
            recepcao: { ver: true, editar: false },
            producao: { ver: true, editar: false },
            configuracao: { ver: true, editar: false }
        }
    });

    // Operador de Estoque - só pode editar estoque
    auth.adicionarUsuario({
        usuario: 'operador',
        nome: 'Operador de Estoque',
        senha: 'operador123',
        nivel: 'operador',
        permissoes: {
            dashboard: { ver: true, editar: false },
            estoque: { ver: true, editar: true },
            qualidade: { ver: true, editar: true },
            recepcao: { ver: false, editar: false },
            producao: { ver: false, editar: false },
            configuracao: { ver: false, editar: false }
        }
    });

    // Visualizador - só pode ver informações
    auth.adicionarUsuario({
        usuario: 'visualizador',
        nome: 'Visualizador',
        senha: 'visual123',
        nivel: 'visualizador',
        permissoes: {
            dashboard: { ver: true, editar: false },
            estoque: { ver: true, editar: false },
            qualidade: { ver: true, editar: false },
            recepcao: { ver: false, editar: false },
            producao: { ver: false, editar: false },
            configuracao: { ver: false, editar: false }
        }
    });

    console.log('Usuários de exemplo criados com sucesso!');
    console.log('Login disponíveis:');
    console.log('- Admin: admin/admin123');
    console.log('- Gerente: gerente/gerente123');
    console.log('- Operador: operador/operador123');
    console.log('- Visualizador: visualizador/visual123');
}

// Executar a função
criarUsuariosExemplo();
