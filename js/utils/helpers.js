/* filepath: d:\Documents\meus_projetos\packing_house\js\utils\helpers.js */
/**
 * HELPERS.JS - Utilitários modernos e funções auxiliares refatorados
 * Versão: 2.0 - Performance otimizada e recursos modernos
 */

// ==================== CLASSE UTILITÁRIA PRINCIPAL ====================
class Utils {
    constructor() {
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
        this.cache = new Map();
        this.configurarDefaults();
    }

    configurarDefaults() {
        // Configurar formatação de data/hora padrão
        this.locale = 'pt-BR';
        this.timezone = 'America/Sao_Paulo';
    }

    // ==================== DATA E HORA MELHORADAS ====================
    formatarDataHora(data = new Date(), opcoes = {}) {
        const defaults = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        const config = { ...defaults, ...opcoes };
        
        try {
            return new Intl.DateTimeFormat(this.locale, config).format(data);
        } catch (erro) {
            console.warn('Erro ao formatar data:', erro);
            return data.toLocaleString(this.locale, config);
        }
    }

    formatarData(data = new Date()) {
        return this.formatarDataHora(data, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatarHora(data = new Date()) {
        return this.formatarDataHora(data, {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatarDataRelativa(data) {
        const agora = new Date();
        const diffMs = agora - data;
        const diffSegundos = Math.floor(diffMs / 1000);
        const diffMinutos = Math.floor(diffSegundos / 60);
        const diffHoras = Math.floor(diffMinutos / 60);
        const diffDias = Math.floor(diffHoras / 24);

        if (diffSegundos < 60) return 'agora';
        if (diffMinutos < 60) return `${diffMinutos} min atrás`;
        if (diffHoras < 24) return `${diffHoras} h atrás`;
        if (diffDias < 7) return `${diffDias} dias atrás`;
        
        return this.formatarData(data);
    }

    // ==================== STORAGE MELHORADO ====================
    salvarDados(chave, dados, opcoes = {}) {
        const { 
            encrypt = false, 
            ttl = null, 
            compress = false 
        } = opcoes;

        try {
            let dadosParaSalvar = dados;
            
            // Adicionar timestamp se tiver TTL
            if (ttl) {
                dadosParaSalvar = {
                    data: dados,
                    expiracao: Date.now() + ttl
                };
            }
            
            // Serializar
            const serializado = JSON.stringify(dadosParaSalvar);
            
            // Salvar no localStorage
            localStorage.setItem(chave, serializado);
            
            // Atualizar cache
            this.cache.set(chave, dados);
            
            return true;
        } catch (erro) {
            console.error(`Erro ao salvar dados [${chave}]:`, erro);
            return false;
        }
    }

    carregarDados(chave, padrao = null) {
        try {
            // Verificar cache primeiro
            if (this.cache.has(chave)) {
                return this.cache.get(chave);
            }
            
            const dados = localStorage.getItem(chave);
            if (!dados) return padrao;
            
            const parseado = JSON.parse(dados);
            
            // Verificar expiração
            if (parseado.expiracao && Date.now() > parseado.expiracao) {
                this.removerDados(chave);
                return padrao;
            }
            
            const resultado = parseado.data || parseado;
            
            // Atualizar cache
            this.cache.set(chave, resultado);
            
            return resultado;
        } catch (erro) {
            console.error(`Erro ao carregar dados [${chave}]:`, erro);
            return padrao;
        }
    }

    removerDados(chave) {
        try {
            localStorage.removeItem(chave);
            this.cache.delete(chave);
            return true;
        } catch (erro) {
            console.error(`Erro ao remover dados [${chave}]:`, erro);
            return false;
        }
    }

    limparCache() {
        this.cache.clear();
    }

    limparTodosDados() {
        try {
            localStorage.clear();
            this.cache.clear();
            return true;
        } catch (erro) {
            console.error('Erro ao limpar todos os dados:', erro);
            return false;
        }
    }

    obterTamanhoStorage() {
        let total = 0;
        for (let chave in localStorage) {
            if (localStorage.hasOwnProperty(chave)) {
                total += localStorage[chave].length + chave.length;
            }
        }
        return this.formatarBytes(total);
    }

    // ==================== VALIDAÇÃO MELHORADA ====================
    validarEntrada(valor, tipo = 'texto') {
        const validacoes = {
            texto: (val) => val && typeof val === 'string' && val.trim().length > 0,
            email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            numero: (val) => !isNaN(val) && val !== '' && val !== null,
            telefone: (val) => /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(val),
            cpf: (val) => /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(val),
            cnpj: (val) => /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(val)
        };
        
        const validador = validacoes[tipo] || validacoes.texto;
        return validador(valor);
    }

    sanitizarString(texto) {
        if (typeof texto !== 'string') return '';
        
        return texto
            .trim()
            .replace(/[<>]/g, '') // Remover tags HTML
            .replace(/\s+/g, ' ') // Normalizar espaços
            .slice(0, 1000); // Limitar tamanho
    }

    sanitizarNumero(valor, padrao = 0) {
        const numero = parseFloat(valor);
        return isNaN(numero) ? padrao : numero;
    }

    validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        
        // Algoritmo de validação de CPF
        let soma = 0;
        let resto;
        
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    }

    // ==================== MANIPULAÇÃO DE DOM ====================
    limparInput(idInput) {
        const input = document.getElementById(idInput);
        if (input) {
            input.value = '';
            input.dispatchEvent(new Event('input'));
        }
    }

    focarInput(idInput) {
        const input = document.getElementById(idInput);
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
    }

    selecionarInput(idInput) {
        const input = document.getElementById(idInput);
        if (input) {
            input.select();
        }
    }

    desabilitarElemento(id, desabilitar = true) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.disabled = desabilitar;
            elemento.classList.toggle('disabled', desabilitar);
        }
    }

    mostrarElemento(id, mostrar = true) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.style.display = mostrar ? '' : 'none';
            elemento.classList.toggle('hidden', !mostrar);
        }
    }

    adicionarClasse(id, classe) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.classList.add(classe);
        }
    }

    removerClasse(id, classe) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.classList.remove(classe);
        }
    }

    toggleClasse(id, classe) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.classList.toggle(classe);
        }
    }

    // ==================== NOTIFICAÇÕES MELHORADAS ====================
    mostrarNotificacao(mensagem, tipo = 'success', opcoes = {}) {
        const {
            duracao = 3000,
            posicao = 'top-right',
            podeFechar = true,
            persistente = false
        } = opcoes;

        // Remover notificações existentes da mesma posição
        this.removerNotificacoesPosicao(posicao);

        const notificacao = this.criarNotificacao(mensagem, tipo, {
            duracao,
            posicao,
            podeFechar,
            persistente
        });

        document.body.appendChild(notificacao);
        
        // Animar entrada
        requestAnimationFrame(() => {
            notificacao.classList.add('show');
        });

        // Auto-remover se não for persistente
        if (!persistente && duracao > 0) {
            setTimeout(() => {
                this.removerNotificacao(notificacao);
            }, duracao);
        }

        return notificacao;
    }

    criarNotificacao(mensagem, tipo, opcoes) {
        const notificacao = document.createElement('div');
        notificacao.className = `notification notification-${tipo}`;
        
        const config = this.obterConfigNotificacao(tipo);
        
        notificacao.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${config.icone}</span>
                <span class="notification-message">${this.escapeHtml(mensagem)}</span>
                ${opcoes.podeFechar ? '<button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>' : ''}
            </div>
        `;

        // Configurar posição
        this.configurarPosicaoNotificacao(notificacao, opcoes.posicao);
        
        return notificacao;
    }

    obterConfigNotificacao(tipo) {
        const configs = {
            success: { icone: '✅', cor: '#10b981' },
            error: { icone: '❌', cor: '#ef4444' },
            warning: { icone: '⚠️', cor: '#f59e0b' },
            info: { icone: 'ℹ️', cor: '#3b82f6' }
        };
        
        return configs[tipo] || configs.info;
    }

    configurarPosicaoNotificacao(notificacao, posicao) {
        const posicoes = {
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;',
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
            'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
        };
        
        notificacao.style.cssText = `
            position: fixed;
            z-index: 10000;
            ${posicoes[posicao] || posicoes['top-right']}
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 16px;
            min-width: 300px;
            max-width: 400px;
            transform: translateX(100%);
            transition: all 0.3s ease;
            border-left: 4px solid var(--notification-color, #3b82f6);
        `;
    }

    removerNotificacao(notificacao) {
        if (notificacao && notificacao.parentElement) {
            notificacao.classList.remove('show');
            setTimeout(() => {
                if (notificacao.parentElement) {
                    notificacao.remove();
                }
            }, 300);
        }
    }

    removerNotificacoesPosicao(posicao) {
        const notificacoes = document.querySelectorAll('.notification');
        notificacoes.forEach(not => {
            if (not.dataset.posicao === posicao) {
                this.removerNotificacao(not);
            }
        });
    }

    limparNotificacoes() {
        const notificacoes = document.querySelectorAll('.notification');
        notificacoes.forEach(not => this.removerNotificacao(not));
    }

    escapeHtml(texto) {
        return texto
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    formatarBytes(tamanho) {
        if (tamanho < 1024) return `${tamanho} bytes`;
        if (tamanho < 1048576) return `${(tamanho / 1024).toFixed(2)} KB`;
        if (tamanho < 1073741824) return `${(tamanho / 1048576).toFixed(2)} MB`;
        return `${(tamanho / 1073741824).toFixed(2)} GB`;
    }

    // ==================== PERFORMANCE E DEBOUNCE ====================
    debounce(funcao, espera = 300) {
        return (...args) => {
            clearTimeout(this.debounceTimers.get(funcao));
            const timer = setTimeout(() => funcao.apply(this, args), espera);
            this.debounceTimers.set(funcao, timer);
        };
    }

    throttle(funcao, limite = 300) {
        let emExecucao = false;
        return (...args) => {
            if (!emExecucao) {
                funcao.apply(this, args);
                emExecucao = true;
                setTimeout(() => emExecucao = false, limite);
            }
        };
    }

    // ==================== UTILITÁRIOS DE STRING ====================
    unescapeHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    capitalizar(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }

    capitalizarPalavras(texto) {
        return texto.replace(/\b\w/g, char => char.toUpperCase());
    }

    truncar(texto, limite = 50, sufixo = '...') {
        if (texto.length <= limite) return texto;
        return texto.substring(0, limite - sufixo.length) + sufixo;
    }

    gerarSlug(texto) {
        return texto
            .toLowerCase()
            .replace(/[áàâãä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòôõö]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // ==================== UTILITÁRIOS DE NÚMERO ====================
    formatarNumero(numero, opcoes = {}) {
        const defaults = {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        };
        
        return new Intl.NumberFormat(this.locale, { ...defaults, ...opcoes }).format(numero);
    }

    formatarMoeda(valor) {
        return this.formatarNumero(valor, {
            style: 'currency',
            currency: 'BRL'
        });
    }

    formatarPercentual(valor) {
        return this.formatarNumero(valor, {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        });
    }

    gerarNumeroAleatorio(min = 0, max = 100) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    gerarId(tamanho = 8) {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let resultado = '';
        for (let i = 0; i < tamanho; i++) {
            resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return resultado;
    }

    // ==================== UTILITÁRIOS DE ARRAY ====================
    embaralharArray(array) {
        const copia = [...array];
        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }
        return copia;
    }

    removerDuplicados(array) {
        return [...new Set(array)];
    }

    agruparPor(array, chave) {
        return array.reduce((grupos, item) => {
            const grupo = item[chave];
            grupos[grupo] = grupos[grupo] || [];
            grupos[grupo].push(item);
            return grupos;
        }, {});
    }

    ordenarPor(array, chave, ordem = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[chave];
            const bVal = b[chave];
            
            if (ordem === 'desc') {
                return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
            }
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
    }

    // ==================== UTILITÁRIOS DE COR ====================
    gerarCorAleatoria() {
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    }

    hexParaRgb(hex) {
        const resultado = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return resultado ? {
            r: parseInt(resultado[1], 16),
            g: parseInt(resultado[2], 16),
            b: parseInt(resultado[3], 16)
        } : null;
    }

    rgbParaHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // ==================== UTILITÁRIOS DE ARQUIVO ====================
    downloadArquivo(conteudo, nomeArquivo, tipo = 'text/plain') {
        const blob = new Blob([conteudo], { type: tipo });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    downloadJSON(dados, nomeArquivo) {
        const conteudo = JSON.stringify(dados, null, 2);
        this.downloadArquivo(conteudo, nomeArquivo, 'application/json');
    }

    // ==================== VALIDAÇÃO DE FORMULÁRIO ====================
    validarFormulario(formId) {
        const formulario = document.getElementById(formId);
        if (!formulario) return { valido: false, erros: ['Formulário não encontrado'] };
        
        const erros = [];
        const campos = formulario.querySelectorAll('input, select, textarea');
        
        campos.forEach(campo => {
            if (campo.hasAttribute('required') && !campo.value.trim()) {
                erros.push(`O campo "${campo.name || campo.id || campo.placeholder}" é obrigatório`);
                campo.classList.add('error');
            } else {
                campo.classList.remove('error');
            }
            
            // Validação de tipo específico
            if (campo.type === 'email' && campo.value && !this.validarEntrada(campo.value, 'email')) {
                erros.push(`Email inválido no campo "${campo.name || campo.id}"`);
                campo.classList.add('error');
            }
        });
        
        return {
            valido: erros.length === 0,
            erros
        };
    }

    limparErrosFormulario(formId) {
        const formulario = document.getElementById(formId);
        if (formulario) {
            formulario.querySelectorAll('.error').forEach(campo => {
                campo.classList.remove('error');
            });
        }
    }
}

// ==================== INSTÂNCIA GLOBAL ====================
const utils = new Utils();

// ==================== FUNÇÕES LEGADO (COMPATIBILIDADE) ====================
function formatarDataHora(data) {
    return utils.formatarDataHora(data);
}

function salvarDados(chave, dados) {
    return utils.salvarDados(chave, dados);
}

function recuperarDados(chave, padrao = null) {
    return utils.carregarDados(chave, padrao);
}

function validarEntrada(valor, tipo = 'texto') {
    return utils.validarEntrada(valor, tipo);
}

function limparInput(idInput) {
    return utils.limparInput(idInput);
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
}