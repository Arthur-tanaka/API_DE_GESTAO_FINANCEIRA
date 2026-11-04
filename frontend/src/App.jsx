import { useCallback, useEffect, useMemo, useState } from 'react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

async function apiRequest(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const details = data?.detalhes;
    const message = details
      ? Object.values(details).flat().join(' ')
      : data?.mensagem || data?.detail || data?.error || 'Não foi possível concluir a solicitação.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function getAllPages(path, token) {
  const results = [];
  let nextPath = path;
  while (nextPath) {
    const page = await apiRequest(nextPath, { token });
    if (Array.isArray(page)) return page;
    results.push(...(page?.results || []));
    if (!page?.next) break;
    const next = new URL(page.next, window.location.origin);
    nextPath = `${next.pathname}${next.search}`;
  }
  return results;
}

function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: toDateInput(start), end: toDateInput(end) };
}

function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function currency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
}

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    arrows: <><path d="M7 7h13l-3-3" /><path d="M17 17H4l3 3" /><path d="M20 7l-4 4" /><path d="M4 17l4-4" /></>,
    tag: <><path d="M20 13 13 20l-9-9V4h7z" /><circle cx="8.5" cy="8.5" r="1" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    close: <><path d="m18 6-12 12" /><path d="m6 6 12 12" /></>,
    edit: <><path d="m15 5 4 4" /><path d="M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z" /></>,
    trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5M14 11v5" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18" /><path d="M16 15h2" /><path d="M7 5V3h10v2" /></>,
    up: <><path d="m7 14 5-5 5 5" /><path d="M12 9v12" /></>,
    down: <><path d="m7 10 5 5 5-5" /><path d="M12 3v12" /></>,
  };
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    if (categories.length === 0) {
    setError('É necessário criar uma categoria antes de registrar uma transação.');
    return;
  }
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'register') {
        await apiRequest('/api/register/', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
      }
      const session = await apiRequest('/api/token/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      onAuthenticated(session.access, username);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration decor-one" />
      <div className="auth-decoration decor-two" />
      <section className="auth-card">
        <a className="brand auth-brand" href="#" aria-label="Conta Clara">
          <span className="brand-mark"><Icon name="wallet" size={22} /></span>
          <span>conta<span className="brand-light">clara</span></span>
        </a>
        <div className="auth-heading">
          <span className="eyebrow">SUAS FINANÇAS, EM EQUILÍBRIO</span>
          <h1>{mode === 'login' ? 'Bom ter você de volta.' : 'Comece a organizar.'}</h1>
          <p>{mode === 'login' ? 'Entre para acompanhar sua vida financeira.' : 'Crie sua conta e tenha mais clareza no dia a dia.'}</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <label>
            Usuário
            <input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required placeholder="Seu nome de usuário" />
          </label>
          <label>
            Senha
            <input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Sua senha" />
          </label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button button-primary auth-submit" disabled={busy}>
            {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar na minha conta' : 'Criar minha conta'}
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
          <button className="text-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Criar conta' : 'Fazer login'}
          </button>
        </p>
        <div className="auth-footnote"><span className="secure-dot" /> Seus dados são privados e protegidos.</div>
      </section>
      <aside className="auth-quote">
        <div className="quote-mark">“</div>
        <p>Pequenos hábitos financeiros criam grandes possibilidades.</p>
        <span>MAIS CLAREZA. MAIS TRANQUILIDADE.</span>
      </aside>
    </main>
  );
}

function Modal({ title, onClose, children, onSubmit, submitLabel = 'Salvar', busy, hideSubmit = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div><span className="eyebrow">CONTA CLARA</span><h2 id="modal-title">{title}</h2></div>
          <button className="icon-button" aria-label="Fechar" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-content">{children}</div>
          <div className="modal-actions">
            <button type="button" className="button button-quiet" onClick={onClose}>Cancelar</button>
            {!hideSubmit && <button className="button button-primary" disabled={busy}>{busy ? 'Salvando...' : submitLabel}</button>}
          </div>
        </form>
      </section>
    </div>
  );
}

function TransactionForm({ initial, categories, onSave, onClose, onCreateCategory }) {
  const [form, setForm] = useState({
    nome: initial?.nome || '',
    valor: initial?.valor || '',
    data: initial?.data || toDateInput(new Date()),
    tipo: initial?.tipo || 'saida',
    category: initial?.category || '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const editing = Boolean(initial?.id);

  async function submit(event) {
    event.preventDefault();
    if (categories.length === 0) return;
    setBusy(true);
    setError('');
    try {
      await onSave({ ...form, valor: Number(form.valor).toFixed(2), category: Number(form.category) });
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={editing ? 'Editar transação' : 'Nova transação'}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={editing ? 'Salvar alterações' : 'Adicionar transação'}
      busy={busy}
      hideSubmit={categories.length === 0}
    >
      {categories.length === 0 ? (
        <div className="category-empty">
          <p role="alert">É necessário criar uma categoria antes de registrar uma transação.</p>
          <button type="button" className="button button-primary" onClick={onCreateCategory}>Ir para categorias</button>
        </div>
      ) : (
        <>
          <div className="type-toggle" role="group" aria-label="Tipo da transação">
            <button type="button" className={form.tipo === 'saida' ? 'selected expense' : ''} onClick={() => setForm({ ...form, tipo: 'saida' })}><Icon name="down" size={17} /> Despesa</button>
            <button type="button" className={form.tipo === 'entrada' ? 'selected income' : ''} onClick={() => setForm({ ...form, tipo: 'entrada' })}><Icon name="up" size={17} /> Receita</button>
          </div>
          <div className="form-grid">
            <label className="field-wide">Descrição<input autoFocus minLength="3" maxLength="50" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} required placeholder="Ex.: Conta de luz" /></label>
            <label>Valor (R$)<input type="number" step="0.01" min="1" value={form.valor} onChange={(event) => setForm({ ...form, valor: event.target.value })} required placeholder="0,00" /></label>
            <label>Data<input type="date" max={toDateInput(new Date())} value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} required /></label>
            <label className="field-wide">Categoria
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}
              </select>
            </label>
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
        </>
      )}
    </Modal>
  );
}

function CategoryForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.nome || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave(name.trim());
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={initial ? 'Editar categoria' : 'Nova categoria'} onClose={onClose} onSubmit={submit} busy={busy} submitLabel="Salvar categoria">
      <label>Nome da categoria<input autoFocus minLength="3" maxLength="50" value={name} onChange={(event) => setName(event.target.value)} required placeholder="Ex.: Moradia" /></label>
      {error && <div className="form-error" role="alert">{error}</div>}
    </Modal>
  );
}

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('finance_access'));
  const [username, setUsername] = useState(() => sessionStorage.getItem('finance_username') || '');
  const [activePage, setActivePage] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ total_entradas: 0, total_saidas: 0, saldo: 0 });
  const [dateRange, setDateRange] = useState(monthRange);
  const [filter, setFilter] = useState({ tipo: '', search: '' });
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [toast, setToast] = useState('');
  const [transactionModal, setTransactionModal] = useState(null);
  const [categoryModal, setCategoryModal] = useState(null);
  const [busyCategory, setBusyCategory] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setPageError('');
    try {
      const dashboardParams = new URLSearchParams({ data_inicio: dateRange.start, data_fim: dateRange.end });
      const [transactionData, categoryData, dashboardData] = await Promise.all([
        getAllPages('/api/transactions/', token),
        getAllPages('/api/categories/', token),
        apiRequest(`/api/dashboard/?${dashboardParams}`, { token }),
      ]);
      setTransactions(transactionData);
      setCategories(categoryData);
      setSummary(dashboardData);
    } catch (error) {
      if (error.status === 401) {
        handleLogout();
      } else {
        setPageError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token, filter, dateRange]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function handleAuthenticated(access, user) {
    sessionStorage.setItem('finance_access', access);
    sessionStorage.setItem('finance_username', user);
    setToken(access);
    setUsername(user);
  }

  function handleLogout() {
    sessionStorage.removeItem('finance_access');
    sessionStorage.removeItem('finance_username');
    setToken(null);
    setUsername('');
    setTransactions([]);
    setCategories([]);
  }

  async function saveTransaction(data) {
    const isEditing = Boolean(transactionModal?.id);
    const path = isEditing ? `/api/transactions/${transactionModal.id}/` : '/api/transactions/';
    await apiRequest(path, { token, method: isEditing ? 'PUT' : 'POST', body: JSON.stringify(data) });
    setToast(isEditing ? 'Transação atualizada.' : 'Transação adicionada.');
    await loadData();
  }

  async function deleteTransaction(transaction) {
    if (!window.confirm(`Excluir "${transaction.nome}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await apiRequest(`/api/transactions/${transaction.id}/`, { token, method: 'DELETE' });
      setToast('Transação excluída.');
      await loadData();
    } catch (error) {
      setPageError(error.message);
    }
  }

  async function saveCategory(name) {
    const isEditing = Boolean(categoryModal?.id);
    const path = isEditing ? `/api/categories/${categoryModal.id}/` : '/api/categories/';
    await apiRequest(path, { token, method: isEditing ? 'PUT' : 'POST', body: JSON.stringify({ nome: name }) });
    setToast(isEditing ? 'Categoria atualizada.' : 'Categoria criada.');
    await loadData();
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Excluir a categoria "${category.nome}"?`)) return;
    setBusyCategory(true);
    try {
      await apiRequest(`/api/categories/${category.id}/`, { token, method: 'DELETE' });
      setToast('Categoria excluída.');
      await loadData();
    } catch (error) {
      setPageError(error.message);
    } finally {
      setBusyCategory(false);
    }
  }

  const recentTransactions = useMemo(() => [...transactions]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 6), [transactions]);

  const filteredTransactions = useMemo(() => {
    const search = filter.search.trim().toLocaleLowerCase('pt-BR');
    return transactions.filter((transaction) =>
      (!filter.tipo || transaction.tipo === filter.tipo)
      && (!search || transaction.nome.toLocaleLowerCase('pt-BR').includes(search)),
    );
  }, [transactions, filter]);

  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const monthTransactions = transactions.filter((item) => {
        const transactionDate = new Date(`${item.data}T12:00:00`);
        return transactionDate.getFullYear() === date.getFullYear() && transactionDate.getMonth() === date.getMonth();
      });
      return {
        label: MONTH_NAMES[date.getMonth()],
        income: monthTransactions.filter((item) => item.tipo === 'entrada').reduce((sum, item) => sum + Number(item.valor), 0),
        expense: monthTransactions.filter((item) => item.tipo === 'saida').reduce((sum, item) => sum + Number(item.valor), 0),
      };
    });
  }, [transactions]);

  if (!token) return <AuthScreen onAuthenticated={handleAuthenticated} />;

  const nav = [
    { key: 'dashboard', label: 'Visão geral', icon: 'grid' },
    { key: 'transactions', label: 'Transações', icon: 'arrows' },
    { key: 'categories', label: 'Categorias', icon: 'tag' },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setActivePage('dashboard'); }}>
          <span className="brand-mark"><Icon name="wallet" size={21} /></span>
          <span>conta<span className="brand-light">clara</span></span>
        </a>
        <div className="nav-caption">MENU PRINCIPAL</div>
        <nav className="side-nav" aria-label="Navegação principal">
          {nav.map((item) => (
            <button key={item.key} className={`nav-item ${activePage === item.key ? 'active' : ''}`} onClick={() => setActivePage(item.key)}>
              <Icon name={item.icon} size={19} /><span>{item.label}</span>
              {activePage === item.key && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-symbol">✳</div>
            <strong>Um passo de cada vez</strong>
            <p>Acompanhar é o primeiro passo para transformar.</p>
          </div>
          <button className="profile-button" onClick={handleLogout}>
            <span className="avatar">{username.slice(0, 1).toUpperCase() || 'U'}</span>
            <span className="profile-name"><strong>{username}</strong><small>Minha conta</small></span>
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Suas finanças <span>/</span> <strong>{nav.find((item) => item.key === activePage)?.label}</strong></div>
          <div className="topbar-date"><span className="live-dot" /> {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </header>

        <div className="content-wrap">
          {pageError && <div className="alert-banner" role="alert"><span>{pageError}</span><button aria-label="Fechar aviso" onClick={() => setPageError('')}><Icon name="close" size={17} /></button></div>}

          {activePage === 'dashboard' && (
            <>
              <section className="page-heading heading-row">
                <div><span className="eyebrow">SEU RESUMO FINANCEIRO</span><h1>Bom dia, {username} <span className="wave">✦</span></h1><p>Veja como está o seu dinheiro neste período.</p></div>
                <button className="button button-primary" disabled={loading} onClick={() => setTransactionModal({})}><Icon name="plus" size={18} /> Nova transação</button>
              </section>
              <div className="period-filter">
                <span>Período</span>
                <label>De <input type="date" value={dateRange.start} onChange={(event) => setDateRange({ ...dateRange, start: event.target.value })} /></label>
                <label>Até <input type="date" value={dateRange.end} onChange={(event) => setDateRange({ ...dateRange, end: event.target.value })} /></label>
              </div>
              <section className="summary-grid" aria-label="Resumo do período">
                <article className="summary-card balance-card">
                  <div className="summary-top"><span className="summary-label">Saldo do período</span><span className="summary-icon"><Icon name="wallet" /></span></div>
                  <strong className="summary-amount">{currency(summary.saldo)}</strong>
                  <span className="summary-caption">Entradas menos saídas</span>
                </article>
                <article className="summary-card">
                  <div className="summary-top"><span className="summary-label">Receitas</span><span className="summary-icon income-icon"><Icon name="up" /></span></div>
                  <strong className="summary-amount">{currency(summary.total_entradas)}</strong>
                  <span className="summary-caption">Total que entrou no período</span>
                </article>
                <article className="summary-card">
                  <div className="summary-top"><span className="summary-label">Despesas</span><span className="summary-icon expense-icon"><Icon name="down" /></span></div>
                  <strong className="summary-amount">{currency(summary.total_saidas)}</strong>
                  <span className="summary-caption">Total que saiu no período</span>
                </article>
              </section>
              <section className="dashboard-grid">
                <article className="panel chart-panel">
                  <div className="panel-heading"><div><h2>Movimentação</h2><p>Receitas e despesas dos últimos 6 meses</p></div><div className="chart-legend"><span><i className="legend-income" /> Receitas</span><span><i className="legend-expense" /> Despesas</span></div></div>
                  <div className="bar-chart">
                    <div className="chart-scale"><span>R$ 5 mil</span><span>R$ 2,5 mil</span><span>R$ 0</span></div>
                    <div className="chart-plot">
                      <div className="chart-gridlines"><i /><i /><i /></div>
                      {chartData.map((item) => {
                        const scale = Math.max(5000, ...chartData.flatMap((month) => [month.income, month.expense]));
                        return <div className="chart-month" key={item.label}>
                          <div className="bar-pair" title={`${item.label}: receitas ${currency(item.income)}, despesas ${currency(item.expense)}`}>
                            <span className="bar income-bar" style={{ height: `${Math.max(3, (item.income / scale) * 100)}%` }} />
                            <span className="bar expense-bar" style={{ height: `${Math.max(3, (item.expense / scale) * 100)}%` }} />
                          </div>
                          <small>{item.label}</small>
                        </div>;
                      })}
                    </div>
                  </div>
                </article>
                <article className="panel recent-panel">
                  <div className="panel-heading"><div><h2>Últimas transações</h2><p>Suas movimentações mais recentes</p></div><button className="link-button" onClick={() => setActivePage('transactions')}>Ver todas <span>→</span></button></div>
                  {recentTransactions.length ? <div className="recent-list">
                    {recentTransactions.map((transaction) => {
                      const category = categories.find((item) => item.id === transaction.category);
                      return <div className="recent-item" key={transaction.id}>
                        <span className={`transaction-symbol ${transaction.tipo}`}><Icon name={transaction.tipo === 'entrada' ? 'up' : 'down'} size={17} /></span>
                        <span className="recent-description"><strong>{transaction.nome}</strong><small>{category?.nome || 'Sem categoria'} · {formatDate(transaction.data)}</small></span>
                        <strong className={`recent-value ${transaction.tipo}`}>{transaction.tipo === 'entrada' ? '+' : '−'} {currency(transaction.valor)}</strong>
                      </div>;
                    })}
                  </div> : <EmptyState title="Ainda sem movimentações" description="Adicione sua primeira transação para começar." />}
                </article>
              </section>
              {loading && <div className="loading-note">Atualizando seus dados...</div>}
            </>
          )}

          {activePage === 'transactions' && (
            <>
              <section className="page-heading heading-row">
                <div><span className="eyebrow">ACOMPANHE CADA MOVIMENTO</span><h1>Transações</h1><p>Entradas e saídas em um só lugar.</p></div>
                <button className="button button-primary" onClick={() => setTransactionModal({})}><Icon name="plus" size={18} /> Nova transação</button>
              </section>
              <section className="panel transactions-panel">
                <div className="table-toolbar">
                  <div className="search-field"><Icon name="search" size={18} /><input value={filter.search} onChange={(event) => setFilter({ ...filter, search: event.target.value })} placeholder="Buscar transação..." /></div>
                  <select aria-label="Filtrar por tipo" value={filter.tipo} onChange={(event) => setFilter({ ...filter, tipo: event.target.value })}><option value="">Todos os tipos</option><option value="entrada">Receitas</option><option value="saida">Despesas</option></select>
                </div>
                <TransactionTable transactions={filteredTransactions} categories={categories} onEdit={setTransactionModal} onDelete={deleteTransaction} loading={loading} />
              </section>
            </>
          )}

          {activePage === 'categories' && (
            <>
              <section className="page-heading heading-row">
                <div><span className="eyebrow">ORGANIZE DO SEU JEITO</span><h1>Categorias</h1><p>Crie categorias para entender melhor seus hábitos.</p></div>
                <button className="button button-primary" onClick={() => setCategoryModal({})}><Icon name="plus" size={18} /> Nova categoria</button>
              </section>
              <section className="category-grid">
                {categories.map((category, index) => (
                  <article className="category-card" key={category.id}>
                    <span className={`category-icon category-tone-${index % 5}`}><Icon name="tag" size={20} /></span>
                    <div className="category-info"><h2>{category.nome}</h2><p>{transactions.filter((transaction) => transaction.category === category.id).length} transações</p></div>
                    <div className="category-actions">
                      <button className="icon-button" aria-label={`Editar ${category.nome}`} onClick={() => setCategoryModal(category)}><Icon name="edit" size={17} /></button>
                      <button className="icon-button danger-hover" aria-label={`Excluir ${category.nome}`} disabled={busyCategory} onClick={() => deleteCategory(category)}><Icon name="trash" size={17} /></button>
                    </div>
                  </article>
                ))}
                {!categories.length && <div className="panel category-empty"><EmptyState title="Nenhuma categoria por aqui" description="Crie categorias para organizar suas transações." /><button className="button button-primary" onClick={() => setCategoryModal({})}><Icon name="plus" size={18} /> Criar categoria</button></div>}
              </section>
            </>
          )}
        </div>
      </main>
      {transactionModal && <TransactionForm initial={transactionModal} categories={categories} onClose={() => setTransactionModal(null)} onSave={saveTransaction} onCreateCategory={() => { setTransactionModal(null); setActivePage('categories'); }} />}
      {categoryModal && <CategoryForm initial={categoryModal.id ? categoryModal : null} onClose={() => setCategoryModal(null)} onSave={saveCategory} />}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}

function TransactionTable({ transactions, categories, onEdit, onDelete, loading }) {
  if (loading && !transactions.length) return <div className="table-empty">Carregando transações...</div>;
  if (!transactions.length) return <EmptyState title="Nenhuma transação encontrada" description="Experimente mudar os filtros ou adicione uma transação." />;
  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>DESCRIÇÃO</th><th>CATEGORIA</th><th>DATA</th><th>TIPO</th><th>VALOR</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>
          {transactions.map((transaction) => {
            const category = categories.find((item) => item.id === transaction.category);
            return <tr key={transaction.id}>
              <td><div className="table-description"><span className={`transaction-symbol ${transaction.tipo}`}><Icon name={transaction.tipo === 'entrada' ? 'up' : 'down'} size={16} /></span><strong>{transaction.nome}</strong></div></td>
              <td><span className="category-pill">{category?.nome || 'Sem categoria'}</span></td>
              <td>{formatDate(transaction.data)}</td>
              <td><span className={`type-pill ${transaction.tipo}`}>{transaction.tipo === 'entrada' ? 'Receita' : 'Despesa'}</span></td>
              <td><strong className={`table-amount ${transaction.tipo}`}>{transaction.tipo === 'entrada' ? '+' : '−'} {currency(transaction.valor)}</strong></td>
              <td><div className="row-actions">
                <button className="icon-button" aria-label={`Editar ${transaction.nome}`} onClick={() => onEdit(transaction)}><Icon name="edit" size={17} /></button>
                <button className="icon-button danger-hover" aria-label={`Excluir ${transaction.nome}`} onClick={() => onDelete(transaction)}><Icon name="trash" size={17} /></button>
              </div></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ title, description }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="arrows" size={22} /></span><strong>{title}</strong><p>{description}</p></div>;
}

export default App;
