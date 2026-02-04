/* filepath: js/modules/qualidade.js */
/**
 * QUALIDADE.JS - Módulo de Controle de Qualidade
 */

class Qualidade {
    constructor() {
        this.inspcoes = recuperarDados('qualidade_inspecoes') || [];
        this.problemasTemporarios = [];
        this.inicializar();
    }

    inicializar() {
        this.atualizarHistorico();
    }

    adicionarProblemaTemporario(tipo, quantidade) {
        if (!tipo || quantidade <= 0) {
            mostrarNotificacao('Selecione um tipo de problema e uma quantidade válida', 'error');
            return false;
        }

        // Verificar se o problema já existe
        const problemaExistente = this.problemasTemporarios.find(p => p.tipo === tipo);
        if (problemaExistente) {
            problemaExistente.quantidade += quantidade;
        } else {
            this.problemasTemporarios.push({ tipo, quantidade });
        }

        this.atualizarTabelaProblemas();
        document.getElementById('qualTipoProblema').value = '';
        document.getElementById('qualQuantidadeProblema').value = '1';
        mostrarNotificacao('Problema adicionado', 'success');
        return true;
    }

    removerProblemaTemporario(indice) {
        this.problemasTemporarios.splice(indice, 1);
        this.atualizarTabelaProblemas();
    }

    atualizarTabelaProblemas() {
        const tbody = document.getElementById('tabelaProblemas');
        const mensagem = document.getElementById('mensagemSemProblemas');
        
        tbody.innerHTML = '';

        if (this.problemasTemporarios.length === 0) {
            mensagem.style.display = 'block';
            return;
        }

        mensagem.style.display = 'none';

        this.problemasTemporarios.forEach((problema, indice) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${problema.tipo}</td>
                <td>${problema.quantidade}</td>
                <td>
                    <button onclick="qualidade.removerProblemaTemporario(${indice})" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;">🗑️ Remover</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    registrarInspecao() {
        const colhedora = document.getElementById('qualColhedora').value.trim();
        const embaladora = document.getElementById('qualEmbaladora').value.trim();

        if (!colhedora || !embaladora) {
            mostrarNotificacao('Preencha todos os campos obrigatórios', 'error');
            return false;
        }

        if (this.problemasTemporarios.length === 0) {
            mostrarNotificacao('Adicione pelo menos um problema', 'warning');
            return false;
        }

        const detalhes = `
            <p><strong>Colhedora:</strong> ${colhedora}</p>
            <p><strong>Embaladora:</strong> ${embaladora}</p>
            <p><strong>Total de Problemas:</strong> ${this.problemasTemporarios.reduce((sum, p) => sum + p.quantidade, 0)}</p>
        `;

        mostrarModal(
            'Confirmar Registro',
            'Deseja registrar esta inspeção de qualidade?',
            detalhes,
            'confirmacao',
            () => {
                const inspecao = {
                    id: Date.now(),
                    data: new Date().toLocaleString('pt-BR'),
                    colhedora,
                    embaladora,
                    problemas: JSON.parse(JSON.stringify(this.problemasTemporarios)),
                    totalProblemas: this.problemasTemporarios.reduce((sum, p) => sum + p.quantidade, 0)
                };

                this.inspcoes.push(inspecao);
                this.salvarInspecoes();
                this.atualizarHistorico();
                
                // Limpar formulário
                this.limparFormulario();
                
                mostrarNotificacao('Inspeção registrada com sucesso', 'success');
            }
        );
    }

    salvarInspecoes() {
        salvarDados('qualidade_inspecoes', this.inspcoes);
    }

    atualizarHistorico() {
        const tbody = document.getElementById('tabelaHistoricoQualidade');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.inspcoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 20px;">Nenhuma inspeção registrada</td></tr>';
            return;
        }

        // Mostrar em ordem reversa (mais recentes primeiro)
        [...this.inspcoes].reverse().forEach(inspecao => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${inspecao.data}</td>
                <td>${inspecao.colhedora}</td>
                <td>${inspecao.embaladora}</td>
                <td><strong>${inspecao.totalProblemas}</strong></td>
                <td>
                    <button onclick="qualidade.visualizarDetalhes(${inspecao.id})" class="btn btn-info" style="padding: 4px 8px; font-size: 12px;">👁️ Ver</button>
                    <button onclick="qualidade.deletarInspecao(${inspecao.id})" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;">🗑️ Deletar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    visualizarDetalhes(id) {
        const inspecao = this.inspcoes.find(i => i.id === id);
        if (!inspecao) return;

        let detalhesProblemas = inspecao.problemas.map(p => 
            `<li>${p.tipo}: ${p.quantidade} unidade${p.quantidade > 1 ? 's' : ''}</li>`
        ).join('');

        const detalhes = `
            <p><strong>Data:</strong> ${inspecao.data}</p>
            <p><strong>Colhedora:</strong> ${inspecao.colhedora}</p>
            <p><strong>Embaladora:</strong> ${inspecao.embaladora}</p>
            <p><strong>Problemas Encontrados:</strong></p>
            <ul>${detalhesProblemas}</ul>
            <p style="margin-top: 15px; font-weight: bold; color: var(--danger);">Total de Problemas: ${inspecao.totalProblemas}</p>
        `;

        mostrarModal(
            'Detalhes da Inspeção',
            `Informações da caixa ${inspecao.numeroCaixa}`,
            detalhes,
            'info'
        );
    }

    deletarInspecao(id) {
        const inspecao = this.inspcoes.find(i => i.id === id);
        if (!inspecao) return;

        const detalhes = `
            <p><strong>Data:</strong> ${inspecao.data}</p>
            <p><strong>Colhedora:</strong> ${inspecao.colhedora}</p>
            <p style="color: #ef4444;"><strong>Esta ação não pode ser desfeita</strong></p>
        `;

        mostrarModal(
            'Confirmar Exclusão',
            'Deseja deletar este registro de inspeção?',
            detalhes,
            'exclusao',
            () => {
                this.inspcoes = this.inspcoes.filter(i => i.id !== id);
                this.salvarInspecoes();
                this.atualizarHistorico();
                mostrarNotificacao('Inspeção deletada com sucesso', 'success');
            }
        );
    }

    limparFormulario() {
        document.getElementById('qualColhedora').value = '';
        document.getElementById('qualEmbaladora').value = '';
        document.getElementById('qualTipoProblema').value = '';
        document.getElementById('qualQuantidadeProblema').value = '1';
        this.problemasTemporarios = [];
        this.atualizarTabelaProblemas();
    }

    gerarRelatorioPDF() {
        if (this.inspcoes.length === 0) {
            mostrarNotificacao('Não há inspeções registradas para gerar o relatório', 'warning');
            return;
        }

        // Incluir biblioteca jsPDF dinamicamente
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        
        script.onload = () => {
            this.criarRelatorioPDF();
        };
        
        document.head.appendChild(script);
    }

    criarRelatorioPDF() {
        const { jsPDF } = window;
        const doc = new jsPDF();
        
        let yPos = 20;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 15;
        const maxWidth = pageWidth - (margin * 2);

        // Cabeçalho
        doc.setFontSize(18);
        doc.text('Relatório de Controle de Qualidade', margin, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(100);
        const dataAtual = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');
        doc.text(`Gerado em: ${dataAtual}`, margin, yPos);
        
        yPos += 15;
        doc.setTextColor(0);
        doc.setFontSize(11);
        
        // Resumo
        const totalInspecoes = this.inspcoes.length;
        const totalProblemas = this.inspcoes.reduce((sum, i) => sum + i.totalProblemas, 0);
        const inspecoesSemProblemas = this.inspcoes.filter(i => i.totalProblemas === 0).length;

        doc.setFontSize(10);
        doc.text(`Total de Inspeções: ${totalInspecoes}`, margin, yPos);
        yPos += 7;
        doc.text(`Total de Problemas Encontrados: ${totalProblemas}`, margin, yPos);
        yPos += 7;
        doc.text(`Inspeções sem Problemas: ${inspecoesSemProblemas}`, margin, yPos);
        
        yPos += 15;

        // Tabela de Inspeções
        doc.setFontSize(12);
        doc.text('Detalhes das Inspeções:', margin, yPos);
        yPos += 10;

        this.inspcoes.forEach((inspecao, index) => {
            // Verificar se precisa de nova página
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(10);
            doc.setTextColor(0);
            
            // Informações da inspeção
            doc.text(`${index + 1}. Inspeção de ${inspecao.data}`, margin, yPos);
            yPos += 6;
            
            doc.setFontSize(9);
            doc.text(`Colhedora: ${inspecao.colhedora} | Embaladora: ${inspecao.embaladora}`, margin + 5, yPos);
            yPos += 5;
            
            // Problemas
            if (inspecao.problemas.length > 0) {
                doc.text(`Problemas Encontrados:`, margin + 5, yPos);
                yPos += 5;
                
                inspecao.problemas.forEach(problema => {
                    doc.text(`• ${problema.tipo}: ${problema.quantidade} unidade${problema.quantidade > 1 ? 's' : ''}`, margin + 10, yPos);
                    yPos += 5;
                });
            } else {
                doc.setTextColor(0, 128, 0);
                doc.text(`✓ Sem problemas encontrados`, margin + 5, yPos);
                doc.setTextColor(0);
                yPos += 5;
            }
            
            doc.setTextColor(0, 0, 139);
            doc.text(`Total: ${inspecao.totalProblemas} problema${inspecao.totalProblemas !== 1 ? 's' : ''}`, margin + 5, yPos);
            doc.setTextColor(0);
            yPos += 10;
            
            // Linha separadora
            doc.setDrawColor(200);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 8;
        });

        // Rodapé
        yPos = pageHeight - 20;
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text('Packing House - Sistema de Controle de Qualidade', margin, yPos);
        doc.text(`Página 1 de 1`, pageWidth - margin - 20, yPos);

        // Salvar PDF
        const nomeArquivo = `Relatorio_Qualidade_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nomeArquivo);
        
        mostrarNotificacao('Relatório gerado com sucesso!', 'success');
    }
}

// Instanciar classe global
let qualidade;

document.addEventListener('DOMContentLoaded', () => {
    qualidade = new Qualidade();
});

// Funções wrapper para chamadas do HTML
function adicionarProblema() {
    const tipo = document.getElementById('qualTipoProblema').value;
    const quantidade = parseInt(document.getElementById('qualQuantidadeProblema').value) || 1;
    qualidade.adicionarProblemaTemporario(tipo, quantidade);
}

function registrarCaixa() {
    qualidade.registrarInspecao();
}

function limparFormulario() {
    qualidade.limparFormulario();
}

function gerarRelatorioPDF() {
    qualidade.gerarRelatorioPDF();
}
