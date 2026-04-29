# 💰API de Gestão Financeira (Django REST Framework)

API REST para controle de finanças pessoais, permitindo registrar entradas e saídas, calcular saldo automaticamente e filtrar dados por diferentes critérios.

- 🚀 Funcionalidades
- 📥 Cadastro de entradas
- 📤 Cadastro de saídas
- 📊 Cálculo automático de saldo
- 🔍 Filtros por:
 tipo (entrada / saida)
 data específica
 intervalo de datas
- 📈 Consulta de saldo por período

# ------------------------------------------------

# ⚙️ Como rodar o projeto

# Clonar repositório
git clone <url>

# Entrar na pasta
cd <nome-do-projeto>

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Rodar migrações
python manage.py migrate

# Iniciar servidor
python manage.py runserver

# ------------------------------------------------

# 📌 Próximas melhorias ( Em desenvolvimento )
- 🔐 Autenticação de usuários (JWT)
- 👤 Dados por usuário
- 📄 Paginação
- 📊 Dashboard com gráficos

# ------------------------------------------------

# 🧠 Aprendizados

Este projeto cobre:

- Criação de APIs REST com Django
- Uso de ViewSets
- Serializers e validação
- Query params e filtros dinâmicos
- Agregações com ORM (Sum)
- Lógica de negócio (cálculo de saldo)

#📎 Autor : 
Desenvolvido por Arthur 🚀
