// ======================
// UTIL
// ======================
const $ = (sel) => document.querySelector(sel);
const uid = () => crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

const STORAGE_KEY = "studyfy_data_v1";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ======================
// MENU MOBILE
// ======================
const openMenu = $("#openMenu");
const closeMenu = $("#closeMenu");
const mobileMenu = $("#mobileMenu");
const overlay = $("#overlay");

function setMenu(open){
  if (!mobileMenu || !overlay) return;
  mobileMenu.classList.toggle("is-open", open);
  overlay.hidden = !open;

  if (openMenu) openMenu.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
}

if (openMenu) openMenu.addEventListener("click", () => setMenu(true));
if (closeMenu) closeMenu.addEventListener("click", () => setMenu(false));
if (overlay) overlay.addEventListener("click", () => setMenu(false));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// ======================
// ESTADO INICIAL
// ======================
const defaults = {
  tasks: [
    { id: uid(), text: "Estudar Direito Constitucional", time: "08:00", done: false },
    { id: uid(), text: "Estudar Direito Administrativo", time: "10:00", done: false },
    { id: uid(), text: "Revisar apostila de Direito Ambiental", time: "13:00", done: false },
    { id: uid(), text: "Fazer exercícios de Direito Penal", time: "15:00", done: false },
    { id: uid(), text: "Revisão rápida (mapa mental)", time: "18:00", done: false },
  ],
  events: [
    { id: uid(), title: "Aula de Direito Penal", day: 17, time: "19:00 — 21:00" },
    { id: uid(), title: "Prova de Direito Ambiental", day: 27, time: "10:00" },
  ],
  notes: [
    { id: uid(), text: "Entregar trabalho de Direito Tributário, até sexta." },
    { id: uid(), text: "Estudar para a prova de Direito Ambiental." },
    { id: uid(), text: "Comprar novo caderno para anotações." },
  ],
};

let state = loadData() || defaults;
saveData(state);

// ======================
// ELEMENTOS
// ======================
const lista = $("#lista");
const pendentesEl = $("#pendentes");
const bar = $("#bar");
const pill = $("#pill");

const mini = $("#mini");

const eventosLista = $("#eventosLista");
const addEventBtn = $("#addEventBtn");

const notesList = $("#notesList");
const addNoteBtn = $("#addNoteBtn");

// Modais
const taskModal = $("#taskModal");
const taskForm = $("#taskForm");
const taskModalTitle = $("#taskModalTitle");
const taskId = $("#taskId");
const taskName = $("#taskName");
const taskTime = $("#taskTime");
const addTaskBtn = $("#addTaskBtn");
const addTaskFooter = $("#addTaskFooter");

const eventModal = $("#eventModal");
const eventForm = $("#eventForm");
const eventModalTitle = $("#eventModalTitle");
const eventId = $("#eventId");
const eventTitle = $("#eventTitle");
const eventDay = $("#eventDay");
const eventTime = $("#eventTime");

const noteModal = $("#noteModal");
const noteForm = $("#noteForm");
const noteModalTitle = $("#noteModalTitle");
const noteId = $("#noteId");
const noteText = $("#noteText");

// ======================
// RENDER: TAREFAS
// ======================
function renderTasks() {
  if (!lista) return;
  lista.innerHTML = "";

  state.tasks
    .sort((a,b) => a.time.localeCompare(b.time))
    .forEach(t => {
      const li = document.createElement("li");
      li.className = "tarefa";
      li.dataset.id = t.id;

      li.innerHTML = `
        <label class="check">
          <input type="checkbox" ${t.done ? "checked" : ""}>
          <span class="box"></span>
          <span class="texto">${escapeHtml(t.text)}</span>
        </label>

        <span class="hora">${escapeHtml(t.time)}</span>

        <div class="actions">
          <button class="action-btn" data-action="edit">Editar</button>
          <button class="action-btn danger" data-action="delete">Excluir</button>
        </div>
      `;
      lista.appendChild(li);
    });

  atualizarProgresso();
}

function atualizarProgresso(){
  const total = state.tasks.length;
  const feitas = state.tasks.filter(t => t.done).length;
  const pend = total - feitas;
  const pct = total === 0 ? 0 : Math.round((feitas / total) * 100);

  if (pendentesEl) pendentesEl.textContent = pend;
  if (bar) bar.style.width = `${pct}%`;
  if (pill) pill.textContent = `${pct}%`;
}

// Delegação de eventos (checkbox + editar + excluir)
if (lista) {
  lista.addEventListener("click", (e) => {
    const li = e.target.closest(".tarefa");
    if (!li) return;
    const id = li.dataset.id;
    const actionBtn = e.target.closest("button[data-action]");
    const checkbox = e.target.closest("input[type='checkbox']");

    if (checkbox) {
      const t = state.tasks.find(x => x.id === id);
      if (!t) return;
      t.done = checkbox.checked;
      saveData(state);
      atualizarProgresso();
      return;
    }

    if (!actionBtn) return;
    const action = actionBtn.dataset.action;

    if (action === "delete") {
      state.tasks = state.tasks.filter(x => x.id !== id);
      saveData(state);
      renderTasks();
      return;
    }

    if (action === "edit") {
      const t = state.tasks.find(x => x.id === id);
      if (!t) return;
      taskModalTitle.textContent = "Editar tarefa";
      taskId.value = t.id;
      taskName.value = t.text;
      taskTime.value = t.time;
      taskModal.showModal();
      return;
    }
  });
}

// Abrir modal de criar tarefa
function openNewTaskModal() {
  taskModalTitle.textContent = "Adicionar tarefa";
  taskId.value = "";
  taskName.value = "";
  taskTime.value = "08:00";
  taskModal.showModal();
}
if (addTaskBtn) addTaskBtn.addEventListener("click", openNewTaskModal);
if (addTaskFooter) addTaskFooter.addEventListener("click", openNewTaskModal);

// Salvar tarefa (criar/editar)
if (taskForm) {
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = taskName.value.trim();
    const time = taskTime.value;

    if (!name) return;

    const id = taskId.value;

    if (id) {
      const t = state.tasks.find(x => x.id === id);
      if (t) {
        t.text = name;
        t.time = time;
      }
    } else {
      state.tasks.push({ id: uid(), text: name, time, done: false });
    }

    saveData(state);
    renderTasks();
    taskModal.close();
  });
}

// ======================
// RENDER: EVENTOS
// ======================
function renderEvents() {
  if (!eventosLista) return;
  eventosLista.innerHTML = "";

  state.events
    .sort((a,b) => a.day - b.day)
    .forEach(ev => {
      const row = document.createElement("div");
      row.className = "evento-row";
      row.dataset.id = ev.id;

      row.innerHTML = `
        <div class="data">${escapeHtml(String(ev.day))}</div>
        <div class="info">
          <b>${escapeHtml(ev.title)}</b>
          <span>${escapeHtml(ev.time)}</span>
        </div>
        <div class="actions">
          <button class="action-btn" data-action="edit">Editar</button>
          <button class="action-btn danger" data-action="delete">Excluir</button>
        </div>
      `;

      eventosLista.appendChild(row);
    });

  renderMiniCalendar();
}

if (eventosLista) {
  eventosLista.addEventListener("click", (e) => {
    const row = e.target.closest(".evento-row");
    if (!row) return;
    const id = row.dataset.id;

    const actionBtn = e.target.closest("button[data-action]");
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;

    if (action === "delete") {
      state.events = state.events.filter(x => x.id !== id);
      saveData(state);
      renderEvents();
      return;
    }

    if (action === "edit") {
      const ev = state.events.find(x => x.id === id);
      if (!ev) return;

      eventModalTitle.textContent = "Editar evento";
      eventId.value = ev.id;
      eventTitle.value = ev.title;
      eventDay.value = ev.day;
      eventTime.value = ev.time;
      eventModal.showModal();
      return;
    }
  });
}

function openNewEventModal() {
  eventModalTitle.textContent = "Criar evento";
  eventId.value = "";
  eventTitle.value = "";
  eventDay.value = 17;
  eventTime.value = "";
  eventModal.showModal();
}
if (addEventBtn) addEventBtn.addEventListener("click", openNewEventModal);

if (eventForm) {
  eventForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = eventTitle.value.trim();
    const day = Number(eventDay.value);
    const time = eventTime.value.trim();

    if (!title || !time || !(day >= 1 && day <= 30)) return;

    const id = eventId.value;

    if (id) {
      const ev = state.events.find(x => x.id === id);
      if (ev) {
        ev.title = title;
        ev.day = day;
        ev.time = time;
      }
    } else {
      state.events.push({ id: uid(), title, day, time });
    }

    saveData(state);
    renderEvents();
    eventModal.close();
  });
}

// ======================
// RENDER: NOTAS
// ======================
function renderNotes() {
  if (!notesList) return;
  notesList.innerHTML = "";

  state.notes.forEach(n => {
    const li = document.createElement("li");
    li.className = "note-item";
    li.dataset.id = n.id;

    li.innerHTML = `
      <div class="note-text">${escapeHtml(n.text)}</div>
      <div class="actions">
        <button class="action-btn" data-action="edit">Editar</button>
        <button class="action-btn danger" data-action="delete">Excluir</button>
      </div>
    `;

    notesList.appendChild(li);
  });
}

if (notesList) {
  notesList.addEventListener("click", (e) => {
    const item = e.target.closest(".note-item");
    if (!item) return;
    const id = item.dataset.id;

    const actionBtn = e.target.closest("button[data-action]");
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;

    if (action === "delete") {
      state.notes = state.notes.filter(x => x.id !== id);
      saveData(state);
      renderNotes();
      return;
    }

    if (action === "edit") {
      const n = state.notes.find(x => x.id === id);
      if (!n) return;

      noteModalTitle.textContent = "Editar nota";
      noteId.value = n.id;
      noteText.value = n.text;
      noteModal.showModal();
      return;
    }
  });
}

function openNewNoteModal() {
  noteModalTitle.textContent = "Adicionar nota";
  noteId.value = "";
  noteText.value = "";
  noteModal.showModal();
}
if (addNoteBtn) addNoteBtn.addEventListener("click", openNewNoteModal);

if (noteForm) {
  noteForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = noteText.value.trim();
    if (!text) return;

    const id = noteId.value;

    if (id) {
      const n = state.notes.find(x => x.id === id);
      if (n) n.text = text;
    } else {
      state.notes.push({ id: uid(), text });
    }

    saveData(state);
    renderNotes();
    noteModal.close();
  });
}

// ======================
// MINI CALENDÁRIO
// ======================
function renderMiniCalendar(){
  if (!mini) return;
  const diasNoMes = 30;
  mini.innerHTML = "";

  const markedDays = new Set(state.events.map(e => Number(e.day)).filter(d => d >= 1 && d <= diasNoMes));

  for (let d = 1; d <= diasNoMes; d++) {
    const el = document.createElement("div");
    el.className = "dia" + (markedDays.has(d) ? " mark" : "");
    el.textContent = d;
    mini.appendChild(el);
  }
}

// Ano automático no footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ======================
// SAFE HTML
// ======================
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ======================
// INIT
// ======================
renderTasks();
renderEvents();
renderNotes();
renderMiniCalendar();