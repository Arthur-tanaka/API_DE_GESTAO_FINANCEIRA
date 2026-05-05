# 💰 API de Gestão Financeira

API REST para controle de finanças pessoais desenvolvida com **Django + Django REST Framework**.  
Permite registrar entradas e saídas, calcular saldo automaticamente, filtrar transações e visualizar resumos financeiros por período.

---

## 🚀 Funcionalidades

### 💳 Transações
- Cadastro de entradas e saídas
- Listagem, atualização e exclusão
- Vinculação com categorias

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

### 🔐 Autenticação e Segurança
- Autenticação via JWT
- Isolamento de dados por usuário (multiusuário)
- Proteção contra acesso a dados de outros usuários

### 📄 Paginação e Documentação
- Paginação global nos endpoints
- Documentação interativa via Swagger (`/api/docs/`)

---

## ⚙️ Como rodar o projeto

**1. Clonar o repositório**
```bash
git clone https://github.com/Arthur-tanaka/API.git
cd API
```

**2. Criar e ativar ambiente virtual**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

**3. Instalar dependências**
```bash
pip install -r requirements.txt
```

**4. Rodar migrações**
```bash
python manage.py migrate
```

**5. Criar superusuário (opcional)**
```bash
python manage.py createsuperuser
```

**6. Iniciar servidor**
```bash
python manage.py runserver
```

---

## 📌 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/token/` | Login e geração de token JWT |
| GET/POST | `/api/transactions/` | Listar e criar transações |
| GET/PUT/DELETE | `/api/transactions/{id}/` | Detalhar, atualizar e deletar |
| GET/POST | `/api/categories/` | Listar e criar categorias |
| GET | `/api/dashboard/` | Resumo financeiro |
| GET | `/api/docs/` | Documentação Swagger |

### 🔑 Autenticação
Todas as rotas exigem token JWT no header:
```
Authorization: Bearer <seu_token>
```

### 🔍 Exemplos de Filtros
```
GET /api/transactions/?tipo=entrada
GET /api/transactions/?search=mercado
GET /api/transactions/?data_inicio=2026-01-01&data_fim=2026-12-31
GET /api/dashboard/?data_inicio=2026-01-01&data_fim=2026-05-31
```

---

## 🧪 Testes

Para rodar os testes automatizados:
```bash
python manage.py test transactions
```

Cobertura atual:
- ✅ CRUD de transações
- ✅ Autenticação e segurança
- ✅ Isolamento de dados por usuário
- ✅ Dashboard financeiro

---

## 🛠️ Tecnologias

- Python 3.13
- Django 6.0
- Django REST Framework
- Simple JWT
- drf-spectacular (Swagger)
- SQLite (desenvolvimento)

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
- Testes automatizados com APITestCase
- Controle de versão com Git e GitHub (branches e pull requests)
