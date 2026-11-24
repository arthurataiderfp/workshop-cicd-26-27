# Workshop CI/CD na Prática — CeSIUM

Neste workshop vais pôr uma pequena API Node.js a ser testada automaticamente pelo **GitHub Actions** sempre que abrires um Pull Request. No fim, a imagem Docker é publicada no GitHub Container Registry.

## Pré-requisitos

- Conta no [GitHub](https://github.com)
- [Git](https://git-scm.com) instalado
- *(Opcional)* [Node.js 20+](https://nodejs.org) para correres o projeto localmente

## O projeto

| Endpoint | Resposta |
|---|---|
| `GET /health` | `200` → `{ "status": "ok", "timestamp": "<ISO>" }` |
| `GET /sum?a=2&b=3` | `200` → `{ "result": 5 }` |
| `GET /sum?a=x` | `400` → `{ "error": "..." }` |

Para correres localmente (opcional):

```bash
npm ci          # instala dependências a partir do package-lock.json
npm run lint    # ESLint
npm test        # testes com node:test
npm start       # http://localhost:3000/health
```

---

## Guião

### Passo 1 — Fork e ativar o Actions

1. Carrega em **Fork** no canto superior direito deste repositório.
2. No teu fork, abre a aba **Actions** e carrega em **"I understand my workflows, go ahead and enable them"**.
3. Clona o teu fork:

```bash
git clone https://github.com/<o-teu-user>/<repo>.git
cd <repo>
```

### Passo 2 — Criar a pipeline de CI

Cria uma *branch* nova:

```bash
git checkout -b feat/ci-pipeline
```

Cria o ficheiro `.github/workflows/ci.yml` com este conteúdo:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'          # reaproveita a cache do npm entre execuções

      - name: Instalar dependências
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Testes
        run: npm test
```

Faz *commit* e *push*:

```bash
git add .github/workflows/ci.yml
git commit -m "ci: adicionar pipeline de lint e testes"
git push -u origin feat/ci-pipeline
```

### Passo 3 — Abrir um Pull Request

1. No GitHub, carrega em **Compare & pull request**.
2. **Atenção:** num fork, confirma que o *base repository* é o **teu fork** (e não o repositório original) e que a base é `main`.
3. Cria o PR e, no fundo da página, vê o *check* **CI / lint-and-test** a correr. Carrega em **Details** para veres os logs de cada passo.

### Passo 4 — Partir a pipeline de propósito

Escolhe **um** destes erros:

- **Lint:** em `src/app.js`, apaga um `;` no fim de uma linha.
- **Teste:** em `tests/app.test.js`, muda `assert.equal(body.result, 10);` para `11`.

```bash
git commit -am "teste: partir a pipeline de propósito"
git push
```

Volta ao PR: o *check* fica a **vermelho ❌**. Abre os logs e encontra a linha exata que falhou.

### Passo 5 — Corrigir e voltar ao verde

Desfaz o erro, faz *commit* e *push* outra vez:

```bash
git commit -am "fix: corrigir lint/teste"
git push
```

O *check* volta a **verde ✅** e o PR fica pronto para *merge*. 🎉

---

## Extra — Entrega contínua (CD)

A *branch* `step-3-cd-full` tem um `.github/workflows/cd.yml` que, em cada *push* para `main`:

1. corre o lint e os testes (*job* `test`);
2. só se estes passarem (`needs: test`), faz login no `ghcr.io` com o `GITHUB_TOKEN` e publica a imagem Docker com as tags `:latest` e `:<sha do commit>`.

A imagem fica visível em **Packages** no teu perfil. Para a correres:

```bash
docker run -p 3000:3000 ghcr.io/<o-teu-user>/<repo>:latest
```

## Branches de referência

| Branch | Conteúdo |
|---|---|
| `main` | Projeto base, sem workflows |
| `step-1-ci-basic` | CI básico (lint + testes) |
| `step-2-ci-cache` | CI com cache do npm |
| `step-3-cd-full` | CI + CD com publicação no `ghcr.io` |

Se te perderes, podes consultar a solução: `git checkout origin/step-2-ci-cache -- .github`.
