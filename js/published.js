async function fetchJson(url){ const r = await fetch(url); if(!r.ok) throw new Error('Fetch error'); return r.json(); }

function fmtDate(iso){ try{return new Date(iso).toLocaleString(); }catch(e){return iso;} }

async function renderList(){
  const listEl = document.getElementById('list');
  listEl.innerHTML = '<p>Chargement…</p>';
  try{
    const items = await fetchJson('/api/submissions');
    if(!items.length) { listEl.innerHTML = '<p>Aucune fiche publiée.</p>'; return; }
    const ul = document.createElement('ul');
    items.forEach(it => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${it.role || 'Sans titre'}</strong> — ${it.name || 'Anonyme'} <em>(${fmtDate(it.timestamp)})</em> `;
      const btn = document.createElement('button'); btn.textContent = 'Voir'; btn.addEventListener('click', ()=>showDetail(it.id));
      const link = document.createElement('a'); link.href = "#";
link.addEventListener("click", (e) => {
  e.preventDefault();
  showDetail(it.id);
});
      link.textContent = 'Permalien';
      link.style.marginLeft = '8px';
      link.target = '_blank';
      li.appendChild(btn);
      li.appendChild(link);
      ul.appendChild(li);
    });
    listEl.innerHTML = '';
    listEl.appendChild(ul);
  }catch(e){ listEl.innerHTML = '<p>Erreur de chargement</p>'; console.error(e); }
}

async function showDetail(id){
  const detail = document.getElementById('detail');
  detail.innerHTML = '<p>Chargement…</p>';
  try{
    const obj = await fetchJson('/api/submissions/'+encodeURIComponent(id));
    detail.innerHTML = `<h2>${obj.data && obj.data.role ? obj.data.role : 'Sans titre'}</h2>
      <p><strong>Auteur:</strong> ${obj.data && obj.data.name ? obj.data.name : 'Anonyme'}</p>
      <p><strong>Publié:</strong> ${fmtDate(obj.timestamp)}</p>
      <div class="job-sheet">${obj.html || '<em>Aucun contenu HTML</em>'}</div>
      <p><button id="back">Retour à la liste</button></p>
    `;
    document.getElementById('back').addEventListener('click', ()=>{ document.getElementById('detail').innerHTML=''; });
  }catch(e){ detail.innerHTML = '<p>Impossible de charger la fiche.</p>'; console.error(e); }
}

window.addEventListener('DOMContentLoaded', ()=>{ renderList(); });
