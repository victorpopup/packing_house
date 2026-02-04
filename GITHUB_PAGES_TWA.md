# 🚀 TWA com GitHub Pages

## 📋 Pré-requisitos
- Repositório GitHub
- GitHub Pages ativado
- Conta de desenvolvedor Google Play ($25)

## 🌐 Configurar GitHub Pages

### 1. Estrutura do Repositório
```
seu-usuario/
└── packing-house/
    ├── .well-known/
    │   └── assetlinks.json
    ├── css/
    ├── js/
    ├── index.html
    ├── manifest.json
    └── outros arquivos...
```

### 2. Ativar GitHub Pages
1. Vá para seu repositório
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: `main` + `/ (root)`
5. Salve

### 3. URL do Site
Seu site estará disponível em:
```
https://seu-usuario.github.io/packing-house/
```

## 🔗 Configurar Asset Links

### 1. Atualizar assetlinks.json
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.packinghouse.app",
    "sha256_cert_fingerprints":
    ["COLOQUE_AQUI_SEU_SHA256_AQUI"]
  }
}]
```

### 2. Gerar SHA256 do Certificado
```bash
# Gerar keystore
keytool -genkey -v -keystore packing-house.keystore -alias packing-house -keyalg RSA -keysize 2048 -validity 10000

# Obter SHA256
keytool -list -v -keystore packing-house.keystore -alias packing-house | grep SHA256
```

## 📱 Criar TWA com Bubblewrap

### 1. Instalar Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

### 2. Iniciar Projeto
```bash
# No diretório do projeto
bubblewrap init --manifest=https://seu-usuario.github.io/packing-house/manifest.json
```

### 3. Configurar
Responda às perguntas:
- **Application ID**: `com.packinghouse.app`
- **Display name**: `Packing House`
- **Package name**: `com.packinghouse.app`

### 4. Build
```bash
# Debug
bubblewrap build

# Release
bubblewrap build --release
```

## 🔐 Assinar APK

### 1. Assinar com Keystore
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore packing-house.keystore \
  app-release-unsigned.apk \
  packing-house

# Otimizar
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

## 📤 Publicar na Play Store

### 1. Google Play Console
1. Acesse [play.google.com/console](https://play.google.com/console)
2. Criar novo aplicativo
3. Upload do `app-release.apk`

### 2. Configurações da Loja
- **Nome**: Packing House
- **Descrição**: Sistema de Controle de Estoque Profissional
- **Categoria**: Produtividade
- **Conteúdo**: Para todas as idades

## ⚙️ Configurações Adicionais

### Manifest.json (já configurado)
```json
{
  "start_url": "/packing-house/",
  "scope": "/packing-house/",
  "display": "standalone"
}
```

### Service Worker (opcional)
Crie `sw.js` para offline:
```javascript
const CACHE_NAME = 'packing-house-v1';
const urlsToCache = [
  '/',
  '/packing-house/',
  '/packing-house/index.html',
  '/packing-house/css/style.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

## 🧪 Testar Localmente

### 1. Servir com HTTPS Local
```bash
# Usando mkcert (recomendado)
mkcert -install
mkcert localhost 127.0.0.1

# Servir com https
npx serve -s . -l 443 --ssl-cert localhost.pem --ssl-key localhost-key.pem
```

### 2. Testar no Android
```bash
# Instalar debug APK
adb install app-debug.apk
```

## 📋 Checklist Final

- [ ] GitHub Pages configurado
- [ ] Asset links acessível via HTTPS
- [ ] SHA256 do certificado configurado
- [ ] APK assinado corretamente
- [ ] Play Console configurado
- [ ] Screenshots preparadas
- [] Política de privacidade criada

## 🎯 Benefícios

✅ **Grátis** - GitHub Pages é gratuito
✅ **HTTPS** - Certificado SSL automático
✅ **CI/CD** - Deploy automático
✅ **Versionamento** - Controle com Git
✅ **Custom Domain** - Pode usar domínio próprio

---

**Seu TWA estará funcionando com GitHub Pages!** 🚀

## 🔗 Links Úteis

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)
- [TWA Best Practices](https://web.dev/trusted-web-activity-best-practices/)
