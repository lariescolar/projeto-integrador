// ===== MENU MOBILE =====
const openMenu = document.getElementById("openMenu");
const closeMenu = document.getElementById("closeMenu");
const mobileMenu = document.getElementById("mobileMenu");
const overlay = document.getElementById("overlay");

function setMenu(open){
  if (!mobileMenu || !overlay) return;

  mobileMenu.classList.toggle("is-open", open);
  overlay.hidden = !open;

  if (openMenu) openMenu.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));

  // trava scroll do fundo quando menu abre
  document.body.style.overflow = open ? "hidden" : "";
}

if (openMenu) openMenu.addEventListener("click", () => setMenu(true));
if (closeMenu) closeMenu.addEventListener("click", () => setMenu(false));
if (overlay) overlay.addEventListener("click", () => setMenu(false));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

// ===== PROGRESSO (tarefas pendentes) =====
const lista = document.getElementById("lista");
const pendentes = document.getElementById("pendentes");
const bar = document.getElementById("bar");
const pill = document.getElementById("pill");

function atualizarProgresso() {
  if (!lista) return;

  const tarefas = [...lista.querySelectorAll("input[type='checkbox']")];
  const total = tarefas.length;
  const feitas = tarefas.filter(t => t.checked).length;

  const pend = total - feitas;
  const pct = total === 0 ? 0 : Math.round((feitas / total) * 100);

  if (pendentes) pendentes.textContent = pend;
  if (bar) bar.style.width = `${pct}%`;
  if (pill) pill.textContent = `${pct}%`;
}

if (lista) lista.addEventListener("change", atualizarProgresso);
atualizarProgresso();

// ===== MINI CALENDÁRIO (Abril/2024) =====
const mini = document.getElementById("mini");
if (mini) {
  const marcados = new Set([27]); // prova
  const diasNoMes = 30;

  mini.innerHTML = "";
  for (let d = 1; d <= diasNoMes; d++) {
    const el = document.createElement("div");
    el.className = "dia" + (marcados.has(d) ? " mark" : "");
    el.textContent = d;
    mini.appendChild(el);
  }
}