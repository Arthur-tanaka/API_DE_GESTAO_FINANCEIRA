# 💰 API de Gestão Financeira

API REST para controle de finanças pessoais desenvolvida com **Django + Django REST Framework**.  
Permite registrar entradas e saídas, calcular saldo automaticamente, filtrar transações e visualizar resumos financeiros por período.

🌐 **API em produção:** [https://api-de-gestao-financeira.onrender.com](https://api-de-gestao-financeira-1.onrender.com)  
📖 **Documentação interativa:** [https://api-de-gestao-financeira.onrender.com/api/docs/](https://api-de-gestao-financeira.onrender.com/api/docs/)

---

## 🚀 Funcionalidades

### 💳 Transações
- Cadastro de entradas e saídas
- Listagem, atualização e exclusão
- Vinculação com categorias personalizadas

### 🔍 Filtros
- Por tipo (`entrada` / `saida`)
- Por data específica
- Por intervalo de datas (`data_inicio` e `data_fim`)
- Por nome (`?search=`)

### 📊 Dashboard Financeiro
- Total de entradas
- Total de saídas
- Saldo atual
- Filtro por período

### 🏷️ Categorias
- CRUD completo de categorias personalizadas por usuário
- Validação de categoria por dono — usuários não acessam categorias de outros

### 🔐 Autenticação e Segurança
- Registro de usuários via `/api/register/`
- Autenticação via JWT
- Isolamento completo de dados por usuário (multiusuário)
- Proteção contra acesso a dados de outros usuários (retorna 404)
- Validação de data futura — transações com data futura são bloqueadas

### 📄 Paginação e Documentação
- Paginação global nos endpoints
- Documentação interativa via Swagger (`/api/docs/`)
- Respostas de erro padronizadas com `status`, `mensagem` e `detalhes`

---

## 🌐 Testando em Produção

A API está disponível em produção. Para testar sem instalar nada:

**1. Criar conta**
```
POST https://api-de-gestao-financeira.onrender.com/api/register/
Body: { "username": "seu_usuario", "password": "sua_senha" }
```

**2. Fazer login e obter token**
```
POST https://api-de-gestao-financeira.onrender.com/api/token/
Body: { "username": "seu_usuario", "password": "sua_senha" }
```

**3. Usar o token nas requisições**
```
Authorization: Bearer <token_recebido>
```

> ⚠️ A instância gratuita do Render pode demorar até 50 segundos para responder após período de inatividade.

---

## ⚙️ Como rodar localmente

**1. Clonar o repositório**
```bash
git clone https://github.com/Arthur-tanaka/API_DE_GESTAO_FINANCEIRA.git
cd API_DE_GESTAO_FINANCEIRA
```

**2. Criar e ativar o ambiente virtual do backend**

Execute os comandos dentro de `API_GASTO`. O projeto usa Python 3.14 para instalar
as dependências listadas sem precisar compilá-las no Windows.

```bash
# Windows
cd API_GASTO
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1

# Linux/Mac
cd API_GASTO
python3 -m venv .venv
source .venv/bin/activate
```

**3. Instalar dependências**
```bash
python -m pip install -r requirements.txt
```

**4. Configurar variáveis de ambiente**

Ainda dentro de `API_GASTO`, copie `.env.example` para `.env` (`Copy-Item .env.example .env`
no PowerShell ou `cp .env.example .env` no Linux/Mac). Mantenha `DEBUG=True` e
`ALLOWED_HOSTS=localhost,127.0.0.1` para desenvolvimento local e substitua `SECRET_KEY`
por uma chave aleatória. Gere uma com:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

**5. Preparar o banco de dados**
```bash
python manage.py migrate
```

**6. Iniciar o backend**
```bash
python manage.py runserver
```

O backend ficará disponível em `http://127.0.0.1:8000` e a documentação Swagger em
`http://127.0.0.1:8000/api/docs/`. Para criar uma conta de administração opcional,
execute `python manage.py createsuperuser`.

**7. Iniciar o frontend**

Com o backend em execução, abra outro terminal na raiz do repositório:

```bash
cd frontend
npm install
npm run dev
```

Abra o endereço indicado pelo Vite (normalmente `http://localhost:5173`). O proxy
local do frontend encaminha as chamadas `/api` para `http://127.0.0.1:8000`. Para gerar
os arquivos de produção, execute `npm run build`; o resultado fica em `frontend/dist/`.
Ao hospedar frontend e API em domínios diferentes, configure `VITE_API_BASE_URL` com
a origem da API e habilite essa origem na política CORS do serviço da API.

Para produção, mantenha `DEBUG=False`, use uma `SECRET_KEY` forte e configure
`ALLOWED_HOSTS`. Se frontend e API estiverem em domínios distintos, configure
`CORS_ALLOWED_ORIGINS` com as origens exatas do frontend. Em hospedagens com proxy
HTTPS confiável (como o Render), configure `TRUST_X_FORWARDED_PROTO=True` e
`SECURE_SSL_REDIRECT=True`; habilite HSTS (`SECURE_HSTS_SECONDS`) apenas depois de
confirmar que todo o domínio funciona exclusivamente em HTTPS. As opções e exemplos
estão em `API_GASTO/.env.example`.

---

## 📌 Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/register/` | Criar conta | ❌ |
| POST | `/api/token/` | Login e geração de token JWT | ❌ |
| GET/POST | `/api/transactions/` | Listar e criar transações | ✅ |
| GET/PUT/DELETE | `/api/transactions/{id}/` | Detalhar, atualizar e deletar | ✅ |
| GET/POST | `/api/categories/` | Listar e criar categorias | ✅ |
| GET | `/api/dashboard/` | Resumo financeiro | ✅ |
| GET | `/api/docs/` | Documentação Swagger | ❌ |

### 🔍 Exemplos de Filtros
```
GET /api/transactions/?tipo=entrada
GET /api/transactions/?search=mercado
GET /api/transactions/?data_inicio=2026-01-01&data_fim=2026-12-31
GET /api/dashboard/?data_inicio=2026-01-01&data_fim=2026-05-31
```

### 📦 Exemplo de Resposta Padronizada
```json
{
  "status": 400,
  "mensagem": "Requisição inválida",
  "detalhes": {
    "nome": ["O nome deve ter pelo menos 3 caracteres."]
  }
}
```

---

## 🧪 Testes

```bash
python manage.py test transactions
```

Cobertura atual:
- ✅ CRUD de transações
- ✅ Autenticação e segurança
- ✅ Isolamento de dados por usuário
- ✅ Dashboard financeiro
- ✅ Validação de data futura

---

## 🛠️ Tecnologias

- Python 3.13
- Django 6.0
- Django REST Framework
- Simple JWT
- drf-spectacular (Swagger)
- PostgreSQL (produção) / SQLite (desenvolvimento)
- Gunicorn
- Render (deploy)

---

## 🧠 Aprendizados

Este projeto cobre na prática:

- Criação de APIs REST com Django e DRF
- Autenticação JWT e segurança multiusuário
- ViewSets, APIView e permissões customizadas
- Serializers com validações personalizadas
- Filtros dinâmicos com query params
- Agregações com ORM Django (`Sum`)
- Paginação global
- Documentação automática com Swagger
- Respostas de erro padronizadas com exception handler customizado
- Testes automatizados com APITestCase
- Controle de versão com Git e GitHub (branches e pull requests)
- Deploy em produção com Render e PostgreSQL
- Variáveis de ambiente com python-decouple
