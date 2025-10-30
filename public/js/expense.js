async function addExpense(event) {
  if (event) event.preventDefault();
  const title = document.querySelector('#title').value.trim();
  const amount = Number(document.querySelector('#amount').value);
  const category = document.querySelector('#category')?.value || null;
  const date = document.querySelector('#date')?.value || new Date().toISOString().slice(0,10);

  const res = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, amount, category, date })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    alert(data.message || 'Failed to add expense');
    return;
  }
  alert('Expense added successfully!');
  // optionally redirect to expenses list
  window.location.href = '/expenses';
}

async function loadExpenses() {
  const listEl = document.querySelector('#expense-list');
  if (!listEl) return;
  const res = await fetch('/api/expenses');
  const items = await res.json();
  listEl.innerHTML = items.map(e => `
    <div class="expense-card" data-id="${e.id}">
      <div class="expense-info">
        <div class="expense-icon ${e.category?.toLowerCase() || 'other'}"></div>
        <div class="expense-text">
          <h3>${e.title}</h3>
          <p>${e.date} ${e.category ? '• ' + e.category : ''}</p>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="expense-amount">Nu. ${Number(e.amount).toFixed(2)}</div>
        <button class="btn-edit" data-id="${e.id}" style="padding:6px 10px;border-radius:8px;border:1px solid #ccc;background:#fff;cursor:pointer">Edit</button>
        <button class="btn-delete" data-id="${e.id}" style="padding:6px 10px;border-radius:8px;border:1px solid #f44336;background:#fef2f2;color:#f44336;cursor:pointer">Delete</button>
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', onDeleteExpense));
  listEl.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', onEditExpense));

  // Update total
  const total = items.reduce((sum, it) => sum + Number(it.amount || 0), 0);
  const totalEl = document.getElementById('total-amount');
  if (totalEl) totalEl.textContent = `Nu. ${total.toFixed(2)}`;
}

async function loadReport() {
  const res = await fetch('/api/reports/summary');
  return res.json();
}

async function onDeleteExpense(e) {
  const id = e.currentTarget.getAttribute('data-id');
  if (!confirm('Delete this expense?')) return;
  const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    alert(data.message || 'Failed to delete');
    return;
  }
  await loadExpenses();
}

async function onEditExpense(e) {
  const id = e.currentTarget.getAttribute('data-id');
  const card = document.querySelector(`.expense-card[data-id="${id}"]`);
  const titleEl = card.querySelector('h3');
  const metaEl = card.querySelector('p');
  const amountEl = card.querySelector('.expense-amount');

  const currentTitle = titleEl.textContent;
  const currentAmount = Number(amountEl.textContent.replace(/[^0-9.]/g, ''));
  const dateMatch = metaEl.textContent.split('•')[0].trim();
  const categoryMatch = metaEl.textContent.includes('•') ? metaEl.textContent.split('•')[1].trim() : '';

  const title = prompt('Title', currentTitle);
  if (title == null) return;
  const amount = Number(prompt('Amount', currentAmount));
  if (Number.isNaN(amount)) return alert('Invalid amount');
  const date = prompt('Date (YYYY-MM-DD)', dateMatch) || dateMatch;
  const category = prompt('Category', categoryMatch) || null;

  const res = await fetch(`/api/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, amount, date, category })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    alert(data.message || 'Failed to update');
    return;
  }
  await loadExpenses();
}
