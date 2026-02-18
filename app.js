const API = '/api/board';

let state = null;

const byId = (id) => document.getElementById(id);

function nowStamp() {
  const d = new Date();
  return d.toLocaleString();
}

function setDailyDate() {
  const d = new Date();
  const date = d.toISOString().slice(0, 10);
  state.daily.date = date;
  byId('daily-date').textContent = date;
}

function renderDaily(listId, items) {
  const ul = byId(listId);
  ul.innerHTML = '';
  items.filter(x => x && x.trim() !== '').forEach((text, idx) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = text;
    span.onclick = () => {
      const next = prompt('Edit item', text);
      if (next === null) return;
      items[idx] = next.trim();
      render();
    };
    const del = document.createElement('button');
    del.textContent = '✕';
    del.onclick = () => { items.splice(idx, 1); render(); };
    li.appendChild(span);
    li.appendChild(del);
    ul.appendChild(li);
  });
}

function renderBoard() {
  const board = byId('board');
  board.innerHTML = '';
  state.columns.forEach(col => {
    const colDiv = document.createElement('div');
    colDiv.className = 'column';
    const h = document.createElement('h3');
    h.textContent = col.name;
    colDiv.appendChild(h);

    const cards = state.cards.filter(c => c.column === col.id);
    cards.forEach(card => {
      const c = document.createElement('div');
      c.className = 'card';
      const text = document.createElement('div');
      text.className = 'text';
      text.textContent = card.text;
      text.onclick = () => {
        const next = prompt('Edit card', card.text);
        if (next === null) return;
        card.text = next.trim();
        render();
      };

      const controls = document.createElement('div');
      controls.className = 'controls';

      const left = document.createElement('button');
      left.textContent = '◀';
      left.onclick = () => moveCard(card, -1);
      const right = document.createElement('button');
      right.textContent = '▶';
      right.onclick = () => moveCard(card, 1);
      const del = document.createElement('button');
      del.textContent = '✕';
      del.onclick = () => { state.cards = state.cards.filter(x => x.id !== card.id); render(); };

      controls.appendChild(left);
      controls.appendChild(right);
      controls.appendChild(del);

      c.appendChild(text);
      c.appendChild(controls);
      colDiv.appendChild(c);
    });

    const add = document.createElement('button');
    add.className = 'add';
    add.textContent = '+ Add';
    add.onclick = () => {
      const text = prompt('New card');
      if (!text) return;
      const id = 'c' + Math.random().toString(36).slice(2, 8);
      state.cards.push({ id, column: col.id, text: text.trim(), owner: 'shared' });
      render();
    };
    colDiv.appendChild(add);

    board.appendChild(colDiv);
  });
}

function moveCard(card, dir) {
  const idx = state.columns.findIndex(c => c.id === card.column);
  const nextIdx = idx + dir;
  if (nextIdx < 0 || nextIdx >= state.columns.length) return;
  card.column = state.columns[nextIdx].id;
  render();
}

function render() {
  byId('board-title').textContent = state.meta.title || 'Lucas + Clue Board';
  state.meta.updated = nowStamp();
  byId('board-meta').textContent = `Updated: ${state.meta.updated}`;
  setDailyDate();
  renderDaily('daily-lucas', state.daily.lucas);
  renderDaily('daily-clue', state.daily.clue);
  renderBoard();
}

async function load() {
  const res = await fetch(API);
  state = await res.json();
  // cleanup empty starter items
  state.daily.lucas = state.daily.lucas.filter(x => x && x.trim() !== '');
  state.daily.clue = state.daily.clue.filter(x => x && x.trim() !== '');
  render();
}

async function save() {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state, null, 2)
  });
  if (!res.ok) alert('Save failed');
}

function wireButtons() {
  document.querySelectorAll('button.add').forEach(btn => {
    btn.onclick = () => {
      const target = btn.dataset.add;
      const text = prompt('Add item');
      if (!text) return;
      if (target === 'daily-lucas') state.daily.lucas.push(text.trim());
      if (target === 'daily-clue') state.daily.clue.push(text.trim());
      render();
    };
  });
  byId('save').onclick = save;
  byId('refresh').onclick = load;
}

load().then(wireButtons).catch(err => {
  console.error(err);
  alert('Failed to load board');
});
