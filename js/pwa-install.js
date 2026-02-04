/* filepath: d:\Documents\meus_projetos\packing_house\js\pwa-install.js */
/**
 * PWA Install Prompt
 */

let deferredPrompt;
let installButton;

// Detectar se o PWA pode ser instalado
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar botão de instalação
    mostrarBotaoInstalacao();
});

// Mostrar botão de instalação
function mostrarBotaoInstalacao() {
    // Criar botão flutuante de instalação
    if (!document.getElementById('installButton')) {
        const installBtn = document.createElement('button');
        installBtn.id = 'installButton';
        installBtn.innerHTML = '📱 Instalar App';
        installBtn.className = 'install-btn';
        installBtn.onclick = instalarPWA;
        
        // Adicionar estilos
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            z-index: 1000;
            transition: all 0.3s ease;
            animation: slideInUp 0.5s ease;
        `;
        
        // Adicionar hover
        installBtn.onmouseover = () => {
            installBtn.style.transform = 'translateY(-2px)';
            installBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
        };
        
        installBtn.onmouseout = () => {
            installBtn.style.transform = 'translateY(0)';
            installBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        };
        
        document.body.appendChild(installBtn);
        
        // Esconder após 10 segundos se não clicar
        setTimeout(() => {
            if (document.getElementById('installButton')) {
                installBtn.style.animation = 'slideOutDown 0.5s ease';
                setTimeout(() => {
                    if (document.getElementById('installButton')) {
                        installBtn.remove();
                    }
                }, 500);
            }
        }, 10000);
    }
}

// Instalar PWA
async function instalarPWA() {
    if (!deferredPrompt) {
        mostrarNotificacao('App já está instalado ou não disponível para instalação', 'warning');
        return;
    }
    
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        mostrarNotificacao('🎉 App instalado com sucesso!', 'success');
        
        // Remover botão de instalação
        const installBtn = document.getElementById('installButton');
        if (installBtn) {
            installBtn.remove();
        }
        
        // Mostrar mensagem de boas-vindas
        setTimeout(() => {
            mostrarNotificacao('✨ O Packing House agora está no seu dispositivo!', 'success');
        }, 2000);
    } else {
        mostrarNotificacao('Instalação cancelada', 'info');
    }
    
    deferredPrompt = null;
}

// Detectar se o app já está instalado
window.addEventListener('appinstalled', () => {
    mostrarNotificacao('✅ Obrigado por instalar o Packing House!', 'success');
    
    // Remover botão se existir
    const installBtn = document.getElementById('installButton');
    if (installBtn) {
        installBtn.remove();
    }
});

// Adicionar CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutDown {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100%);
            opacity: 0;
        }
    }
    
    .install-btn:hover {
        transform: translateY(-2px) !important;
    }
`;
document.head.appendChild(style);
