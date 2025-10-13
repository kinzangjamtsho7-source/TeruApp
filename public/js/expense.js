async function addExpense() {
  const title = document.querySelector('#title').value;
  const amount = document.querySelector('#amount').value;

  await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, amount })
  });

  alert('Expense added successfully!');
}
