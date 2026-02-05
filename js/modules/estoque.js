/* filepath: d:\Documents\meus_projetos\packing_house\js\modules\packing.js */
/**
 * Módulo de Packing
 * Extensões e utilitários para a classe Packing
 */

// Extender a classe Packing com métodos adicionais
if (typeof Packing !== 'undefined') {
    Packing.prototype.obterTotal = function() {
        return Object.values(this.materiais).reduce((a, b) => a + b, 0);
    };

    Packing.prototype.obterMaterialComMaiorQuantidade = function() {
        let maior = { material: null, quantidade: 0 };
        Object.entries(this.materiais).forEach(([mat, qtd]) => {
            if (qtd > maior.quantidade) {
                maior = { material: mat, quantidade: qtd };
            }
        });
        return maior;
    };

    Packing.prototype.gerarRelatorio = function() {
        return {
            total: this.obterTotal(),
            totalMateriais: Object.keys(this.materiais).length,
            totalTransacoes: this.transacoes.length,
            totalEntradas: this.transacoes.filter(t => t.tipo === 'entrada').length,
            totalSaidas: this.transacoes.filter(t => t.tipo === 'saida').length
        };
    };

    Packing.prototype.exportarDados = function() {
        const dados = {
            materiais: this.materiais,
            transacoes: this.transacoes,
            dataSaida: new Date().toISOString()
        };
        return JSON.stringify(dados, null, 2);
    };
}