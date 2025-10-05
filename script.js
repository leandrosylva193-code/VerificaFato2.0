const verificarBtn = document.getElementById('verificarBtn');
const resultadoDiv = document.getElementById('resultado');
const modoBtn = document.getElementById('modoBtn');
const noticiasLista = document.getElementById('noticiasLista');
const textarea = document.getElementById('texto');

// Base simples de verificação (expanda depois)
const noticiasBase = [
  {"texto":"Vacina COVID-19 causa magnetismo","veredito":"falsa","fonte":"https://www.aosfatos.org/noticia-exemplo"},
  {"texto":"5G causa coronavírus","veredito":"falsa","fonte":"https://www.lupa.com.br/exemplo"},
  {"texto":"Brasil vacina mais de 70% da população contra COVID-19","veredito":"verdadeira","fonte":"https://www.gov.br"},
  {"texto":"ONU alerta sobre aquecimento global","veredito":"verdadeira","fonte":"https://www.onu.org"}
];

// --- FUNÇÃO: buscar últimas notícias da NewsAPI ---
async function buscarNoticias() {
  try {
    const resp = await fetch('https://newsapi.org/v2/top-headlines?country=br&apiKey=01a660f970fb4645a134b7b880bc8c44');
    const dados = await resp.json();
    if (!dados.articles) throw new Error('Resposta inválida da API');
    noticiasLista.innerHTML = dados.articles.slice(0, 6).map((n, i) =>
      `<li data-index="${i}"><strong>${escapeHtml(n.title)}</strong><br><small>${n.source.name}</small></li>`
    ).join('');

    // Permitir clicar no item para copiar o título para o textarea
    document.querySelectorAll('#noticiasLista li').forEach((li, idx) => {
      li.addEventListener('click', () => {
        const artigos = dados.articles.slice(0,6);
        textarea.value = artigos[idx].title;
        textarea.focus();
      });
    });

  } catch (e) {
    noticiasLista.innerHTML = "<li>⚠️ Erro ao carregar notícias</li>";
    console.error(e);
  }
}

// --- FUNÇÃO: fala (text-to-speech) ---
function falar(texto) {
  if (!('speechSynthesis' in window)) return;
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  speechSynthesis.cancel();
  speechSynthesis.speak(fala);
}

// --- FUNÇÃO: verificação simples (simulada + base) ---
function verificarNoticia() {
  const texto = textarea.value.trim();
  if (!texto) {
    resultadoDiv.innerHTML = '<p class="amarelo">Digite ou cole uma notícia primeiro!</p>';
    return;
  }

  resultadoDiv.innerHTML = '<p>⏳ Analisando notícia...</p>';

  setTimeout(() => {
    // Primeiro tente encontrar correspondência direta na base
    const achado = noticiasBase.find(n => n.texto.toLowerCase() === texto.toLowerCase());

    if (achado) {
      const classe = achado.veredito === 'verdadeira' ? 'verde' : 'vermelho';
      resultadoDiv.innerHTML = `
        <div class="${classe}">
          <h3>Status: ${achado.veredito.toUpperCase()}</h3>
          <p>Fonte: <a href="${achado.fonte}" target="_blank" rel="noopener">${achado.fonte}</a></p>
        </div>
      `;
      falar(achado.veredito === 'verdadeira' ? 'Notícia parece verdadeira' : 'Atenção: notícia possivelmente falsa');
      return;
    }

    // Se não achar, usar verificação simulada probabilística (substituir por IA/ML depois)
    const r = Math.random();
    if (r < 0.28) {
      resultadoDiv.innerHTML = '<p class="verde">✅ Parece verdadeira!</p>';
      falar('A notícia parece verdadeira!');
    } else if (r < 0.62) {
      resultadoDiv.innerHTML = '<p class="amarelo">⚠️ Parcialmente confiável — verifique fontes.</p>';
      falar('Essa notícia tem partes duvidosas.');
    } else {
      resultadoDiv.innerHTML = '<p class="vermelho">❌ Notícia possivelmente falsa!</p>';
      falar('Cuidado! Essa notícia pode ser falsa.');
    }
  }, 1200);
}

// escape básico para evitar injeção ao inserir títulos
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// alterna modo claro/escuro
modoBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  modoBtn.textContent = document.body.classList.contains('dark') ? '☀️ Modo Claro' : '🌙 Modo Escuro';
});

// evento do botão verificar
verificarBtn.addEventListener('click', verificarNoticia);

// carrega notícias ao abrir a página
buscarNoticias();
