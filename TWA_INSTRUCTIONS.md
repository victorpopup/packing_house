# 📱 Transformar em Trusted Web Activity (TWA)

## 🚀 Passos para Publicar na Google Play Store

### 1. Pré-requisitos
- Node.js instalado
- Conta de desenvolvedor Google Play ($25)
- Android Studio (opcional)

### 2. Instalar Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

### 3. Gerar o Projeto Android
```bash
# No diretório do projeto
bubblewrap init --manifest=manifest.json
```

### 4. Configurar o Projeto
Responda às perguntas:
- **Application ID**: `com.packinghouse.app`
- **Version**: `1.0.0`
- **Display name**: `Packing House`
- **Package name**: `com.packinghouse.app`

### 5. Build do APK
```bash
# Build para debug
bubblewrap build

# Build para release
bubblewrap build --release
```

### 6. Assinar o APK
```bash
# Gerar keystore
keytool -genkey -v -keystore packing-house.keystore -alias packing-house -keyalg RSA -keysize 2048 -validity 10000

# Assinar
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore packing-house.keystore app-release-unsigned.apk packing-house

# Otimizar
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

### 7. Publicar na Play Store
1. Acesse [Google Play Console](https://play.google.com/console)
2. Crie novo aplicativo
3. Faça upload do `app-release.apk`
4. Preencha informações da loja
5. Aguarde aprovação

## 📋 Arquivos Criados

### ✅ Manifest Web (`manifest.json`)
- Configurações do PWA/TWA
- Ícones e metadados
- Modo standalone

### ✅ Asset Links (`.well-known/assetlinks.json`)
- Validação de domínio
- Conexão app-site
- Substituir `SHA256` pelo seu certificado

### ✅ Build Android (`twa-build.gradle`)
- Configurações do projeto Android
- Dependências TWA
- Versões SDK

## 🔧 Configurações Adicionais

### Atualizar Asset Links
1. Gere seu certificado SHA256:
```bash
keytool -list -v -keystore packing-house.keystore -alias packing-house
```
2. Substitua no `assetlinks.json`

### Personalizar Ícones
- Crie ícones 192x192 e 512x512
- Atualize `manifest.json`

### Testar Localmente
```bash
# Servir localmente
npx serve -s . -p 8000

# Testar no Android
bubblewrap build --debug
adb install app-debug.apk
```

## ⚠️ Importante

- **Domínio**: Precisa de HTTPS válido
- **Asset Links**: Deve estar acessível em `https://seudominio.com/.well-known/assetlinks.json`
- **Certificado**: Use o mesmo certificado para futuras atualizações

## 🎯 Benefícios do TWA

✅ **Experiência Nativa** - Integração total com Android
✅ **Play Store** - Distribuição oficial
✅ **Performance** - Chrome otimizado
✅ **Segurança** - Sandbox do Chrome
✅ **Atualizações** - Web sempre atualizado

---

**Seu sistema Packing House está pronto para se tornar um aplicativo Android profissional!** 🚀
