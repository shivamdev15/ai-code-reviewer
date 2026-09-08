const reviewBtn = document.getElementById('reviewBtn');
const codeInput = document.getElementById('code');
const languageSelect = document.getElementById('language');
const output = document.getElementById('output');
const errorEl = document.getElementById('error');

function scoreClass(score) {
  if (score >= 8) return 'score-good';
  if (score >= 5) return 'score-warn';
  return 'score-bad';
}

function renderList(items) {
  if (!items || items.length === 0) {
    return '<ul><li class="empty">Nothing to report</li></ul>';
  }
  return '<ul>' + items.map((i) => `<li>${escapeHtml(i)}</li>`).join('') + '</ul>';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderReview(review) {
  output.innerHTML = `
    <span class="score-badge ${scoreClass(review.score)}">${review.score}/10</span>
    <p class="summary">${escapeHtml(review.summary || '')}</p>

    <div class="category">
      <h3>🐛 Bugs</h3>
      ${renderList(review.bugs)}
    </div>
    <div class="category">
      <h3>🔒 Security</h3>
      ${renderList(review.security)}
    </div>
    <div class="category">
      <h3>📖 Readability</h3>
      ${renderList(review.readability)}
    </div>
    <div class="category">
      <h3>💡 Suggestions</h3>
      ${renderList(review.suggestions)}
    </div>
  `;
}

reviewBtn.addEventListener('click', async () => {
  const code = codeInput.value;
  const language = languageSelect.value;
  errorEl.textContent = '';

  if (!code.trim()) {
    errorEl.textContent = 'Please paste some code first.';
    return;
  }

  reviewBtn.disabled = true;
  reviewBtn.textContent = 'Reviewing...';
  output.innerHTML = '<p class="placeholder">Analyzing your code...</p>';

  try {
    const res = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }

    renderReview(data);
  } catch (err) {
    errorEl.textContent = err.message;
    output.innerHTML = '<p class="placeholder">Your review will appear here.</p>';
  } finally {
    reviewBtn.disabled = false;
    reviewBtn.textContent = 'Review Code';
  }
});
