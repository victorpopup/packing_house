# 🌳 Git Workflow - Packing House

## 📋 Estrutura de Branches

### 🌟 Main Branches
- `main` - Produção (GitHub Pages)
- `develop` - Desenvolvimento

### 🚀 Feature Branches
- `feature/auth-system` - Sistema de autenticação
- `feature/twa-config` - Configuração TWA
- `feature/ui-improvements` - Melhorias na interface
- `bugfix/login-validation` - Correções de bugs

## 🔄 Workflow Sugerido

### 1. Criar Branch de Desenvolvimento
```bash
git checkout -b develop main
git push -u origin develop
```

### 2. Criar Feature Branch
```bash
git checkout -b feature/nova-funcionalidade develop
```

### 3. Commits Semânticos
```bash
git add .
git commit -m "feat: adicionar sistema de autenticação"
git commit -m "fix: corrigir validação de login"
git commit -m "docs: atualizar README"
git commit -m "style: ajustar CSS do formulário"
git commit -m "refactor: otimizar código de usuários"
git commit -m "test: adicionar testes de login"
git commit -m "chore: atualizar dependências"
```

### 4. Merge para Develop
```bash
git checkout develop
git merge feature/nova-funcionalidade
git push origin develop
```

### 5. Release para Main
```bash
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

## 📝 Histórico de Commits Sugerido

### 🏗️ Setup Inicial
```bash
git commit -m "feat: estrutura inicial do projeto"
git commit -m "feat: sistema de controle de estoque"
git commit -m "feat: dashboard com estatísticas"
git commit -m "feat: módulo de qualidade"
```

### 🔐 Sistema de Autenticação
```bash
git commit -m "feat: implementar módulo de autenticação"
git commit -m "feat: criar tela de login personalizada"
git commit -m "feat: sistema de controle de acesso por níveis"
git commit -m "feat: gerenciamento de usuários admin"
git commit -m "feat: remover campo nome completo"
git commit -m "refactor: limpar código de autenticação"
```

### 📱 TWA Configuration
```bash
git commit -m "feat: adicionar manifest.json para PWA"
git commit -m "feat: configurar assetlinks.json para TWA"
git commit -m "feat: ajustar URLs para GitHub Pages"
git commit -m "docs: adicionar guia TWA GitHub Pages"
```

### 🧹 Limpeza e Otimização
```bash
git commit -m "chore: remover arquivos de teste desnecessários"
git commit -m "refactor: otimizar estrutura de arquivos"
git commit -m "style: melhorar organização do CSS"
```

## 🎯 Comandos Úteis

### Verificar Status
```bash
git status
git log --oneline --graph
git branch -a
```

### Reverter Commits
```bash
# Reverter último commit (mantendo mudanças)
git reset --soft HEAD~1

# Reverter último commit (descartando mudanças)
git reset --hard HEAD~1

# Reverter commit específico
git revert <commit-hash>
```

### Stash Mudanças
```bash
git stash
git stash list
git stash pop
```

### Limpar Branches
```bash
# Deletar branch local
git branch -d feature/nome-da-branch

# Deletar branch remoto
git push origin --delete feature/nome-da-branch
```

## 🏷️ Tags de Versão

### Semantic Versioning
- `v1.0.0` - Primeira versão estável
- `v1.1.0` - Novas funcionalidades
- `v1.1.1` - Correções de bugs
- `v2.0.0` - Mudanças quebrando compatibilidade

### Criar Tags
```bash
# Tag anotada
git tag -a v1.0.0 -m "Versão 1.0.0 - Sistema completo"

# Tag leve
git tag v1.0.1

# Push de tags
git push origin --tags
```

## 📋 Checklist Antes de Commit

- [ ] Código testado
- [ ] Mensagem de commit semântica
- [ ] Arquivos desnecessários removidos
- [ ] Documentação atualizada
- [ ] Sem segredos/credenciais no código

## 🔗 Integração com GitHub Pages

### Deploy Automático
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

---

**Seu projeto estará perfeitamente organizado!** 🚀
