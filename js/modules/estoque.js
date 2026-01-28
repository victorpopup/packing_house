/* filepath: d:\Documents\meus_projetos\packing_house\js\modules\estoque.js */
/**
 * Módulo de Estoque
 * Extensões e utilitários para a classe Estoque
 */

// Extender a classe Estoque com métodos adicionais
if (typeof Estoque !== 'undefined') {
    Estoque.prototype.obterTotal = function() {
        return Object.values(this.materiais).reduce((a, b) => a + b, 0);
    };

    Estoque.prototype.obterMaterialComMaiorQuantidade = function() {
        let maior = { material: null, quantidade: 0 };
        Object.entries(this.materiais).forEach(([mat, qtd]) => {
            if (qtd > maior.quantidade) {
                maior = { material: mat, quantidade: qtd };
            }
        });
        return maior;
    };

    Estoque.prototype.gerarRelatorio = function() {
        return {
            total: this.obterTotal(),
            totalMateriais: Object.keys(this.materiais).length,
            totalTransacoes: this.transacoes.length,
            totalEntradas: this.transacoes.filter(t => t.tipo === 'entrada').length,
            totalSaidas: this.transacoes.filter(t => t.tipo === 'saida').length
        };
    };

    Estoque.prototype.exportarDados = function() {
        const dados = {
            materiais: this.materiais,
            transacoes: this.transacoes,
            dataSaida: new Date().toISOString()
        };
        return JSON.stringify(dados, null, 2);
    };
}