/* filepath: d:\Documents\meus_projetos\packing_house\js\relatorio-estoque.js */
/**
 * Relatório de Packing em PDF
 */

// Gerar relatório de packing em PDF
function gerarRelatorioEstoquePDF() {
    if (!auth.verificarPermissao('estoque', 'ver')) {
        mostrarNotificacao('Você não tem permissão para ver relatórios de packing', 'error');
        return;
    }

    // Verificar se existe jsPDF
    if (typeof jsPDF === 'undefined') {
        // Carregar jsPDF dinamicamente
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            gerarRelatorioEstoquePDF();
        };
        document.head.appendChild(script);
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Obter dados do estoque
    const materiais = estoque.materiais;
    const transacoes = estoque.transacoes;
    const dataAtual = formatarDataHora(new Date());
    const usuarioAtual = auth.usuarioAtual;

    // Configurações da página
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Função para adicionar texto com quebra automática
    function addText(text, x, y, maxWidth = 180) {
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line, index) => {
            doc.text(line, x, y + (index * 5));
        });
        return lines.length * 5;
    }

    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Relatorio de Packing', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Informações do relatório
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Data: ${dataAtual}`, 20, yPosition);
    doc.text(`Usuario: ${usuarioAtual.nome}`, pageWidth - 60, yPosition);
    yPosition += 10;

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 15;

    // Resumo do Packing
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Resumo do Packing', 20, yPosition);
    yPosition += 10;

    const totalItens = Object.values(materiais).reduce((a, b) => a + b, 0);
    const totalMateriais = Object.keys(materiais).length;
    const totalTransacoes = transacoes.length;
    const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').length;
    const totalSaidas = transacoes.filter(t => t.tipo === 'saida').length;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total de Materiais: ${totalMateriais}`, 20, yPosition);
    doc.text(`Total de Itens: ${totalItens}`, 100, yPosition);
    yPosition += 7;
    doc.text(`Total de Transacoes: ${totalTransacoes}`, 20, yPosition);
    doc.text(`Entradas: ${totalEntradas}`, 100, yPosition);
    yPosition += 7;
    doc.text(`Saidas: ${totalSaidas}`, 20, yPosition);
    yPosition += 15;

    // Tabela de Packing Atual
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Packing Atual', 20, yPosition);
    yPosition += 10;

    // Cabeçalho da tabela
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Material', 20, yPosition);
    doc.text('Quantidade', 100, yPosition);
    doc.text('Status', 150, yPosition);
    yPosition += 7;

    // Linha da tabela
    doc.setLineWidth(0.3);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;

    // Dados da tabela
    doc.setFont(undefined, 'normal');
    Object.entries(materiais).forEach(([material, quantidade]) => {
        if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
        }

        const status = quantidade > 10 ? '✅ Bom' : quantidade > 0 ? '⚠️ Baixo' : '❌ Esgotado';
        
        doc.text(material.substring(0, 25), 20, yPosition);
        doc.text(quantidade.toString(), 100, yPosition);
        doc.text(status, 150, yPosition);
        yPosition += 7;
    });

    // Últimas Transações
    yPosition += 15;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Ultimas Transacoes', 20, yPosition);
    yPosition += 10;

    // Cabeçalho da tabela de transações
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Data', 20, yPosition);
    doc.text('Material', 60, yPosition);
    doc.text('Tipo', 120, yPosition);
    doc.text('Qtd', 160, yPosition);
    yPosition += 7;

    // Linha da tabela
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;

    // Últimas 10 transações
    doc.setFont(undefined, 'normal');
    transacoes.slice().reverse().slice(0, 10).forEach(transacao => {
        if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
        }

        const data = formatarDataHora(new Date(transacao.data));
        const tipoIcon = transacao.tipo === 'entrada' ? '➕' : '➖';
        
        doc.text(data.substring(0, 16), 20, yPosition);
        doc.text(transacao.material.substring(0, 20), 60, yPosition);
        doc.text(tipoIcon + ' ' + transacao.tipo, 120, yPosition);
        doc.text(transacao.quantidade.toString(), 160, yPosition);
        yPosition += 7;
    });

    // Rodapé
    const rodapeY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('Gerado pelo Packing House - Sistema de Controle de Packing', pageWidth / 2, rodapeY, { align: 'center' });

    // Salvar o PDF
    const fileName = `relatorio-packing-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    mostrarNotificacao('📥 Relatório de packing gerado com sucesso!', 'success');
}

// Adicionar ao escopo global
window.gerarRelatorioEstoquePDF = gerarRelatorioEstoquePDF;
