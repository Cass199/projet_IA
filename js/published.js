async function fetchJson(url){ const r = await fetch(url); if(!r.ok) throw new Error('Fetch error'); return r.json(); }

function fmtDate(iso){ try{return new Date(iso).toLocaleString(); }catch(e){return iso;} }

async function renderList(){
  const listEl = document.getElementById('list');
  listEl.innerHTML = '<p>Chargement…</p>';
  try{
    const items = await fetchJson('/api/submissions');
    // admin status control
    const adminAuth = sessionStorage.getItem('adminAuth');
    const adminBar = document.createElement('div');
    adminBar.style.marginBottom = '8px';
    const adminStatus = document.createElement('span');
    adminStatus.style.marginRight = '8px';
    adminStatus.textContent = adminAuth ? 'Connecté (admin)' : 'Non connecté (admin)';
    const loginBtn = document.createElement('button'); loginBtn.textContent = adminAuth ? 'Déconnexion' : 'Connexion admin';
    loginBtn.addEventListener('click', ()=>{
      if(sessionStorage.getItem('adminAuth')){ sessionStorage.removeItem('adminAuth'); renderList(); return; }
      const user = prompt('Admin user:'); if(user === null) return;
      const pass = prompt('Admin password:'); if(pass === null) return;
      const token = btoa(user+':'+pass);
      sessionStorage.setItem('adminAuth', token);
      renderList();
    });
    adminBar.appendChild(adminStatus); adminBar.appendChild(loginBtn);
    // clear and show admin bar first
    listEl.innerHTML = '';
    listEl.appendChild(adminBar);
    if(!items.length) { const p = document.createElement('p'); p.textContent = 'Aucune fiche publiée.'; listEl.appendChild(p); return; }
    const ul = document.createElement('ul');
    items.forEach(it => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${it.role || 'Sans titre'}</strong> — ${it.name || 'Anonyme'} <em>(${fmtDate(it.timestamp)})</em> `;
      const btn = document.createElement('button'); btn.textContent = 'Voir'; btn.addEventListener('click', ()=>showDetail(it.id));
      const link = document.createElement('a'); link.href = `/submissions/${encodeURIComponent(it.id)}`;
      link.textContent = 'Permalien';
      link.style.marginLeft = '8px';
      link.target = '_blank';
      li.appendChild(btn);
      li.appendChild(link);
      // only show delete when admin token present
      const token = sessionStorage.getItem('adminAuth');
      if(token){
        const del = document.createElement('button'); del.textContent = 'Supprimer'; del.style.marginLeft = '8px';
        del.addEventListener('click', async ()=>{
          if(!confirm('Confirmer la suppression de cette fiche ?')) return;
          try{
            const r = await fetch('/api/submissions/'+encodeURIComponent(it.id), { method: 'DELETE', headers: { 'Authorization': 'Basic '+token } });
            if(!r.ok){ if(r.status===401) alert('Non autorisé : identifiants admin invalides'); else throw new Error('Delete failed'); }
            // refresh list and clear detail if showing this id
            renderList();
            const detail = document.getElementById('detail'); if(detail) detail.innerHTML='';
          }catch(e){ alert('Erreur suppression'); console.error(e); }
        });
        li.appendChild(del);
      }
      ul.appendChild(li);
    });
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
      <p>
        <button id="back">Retour à la liste</button>
        <button id="delete" style="margin-left:8px;">Supprimer</button>
      </p>
    `;
    document.getElementById('back').addEventListener('click', ()=>{ document.getElementById('detail').innerHTML=''; });
    document.getElementById('delete').addEventListener('click', async ()=>{
      if(!confirm('Confirmer la suppression de cette fiche ?')) return;
      try{
        const token = sessionStorage.getItem('adminAuth');

const r = await fetch('/api/submissions/' + encodeURIComponent(id), {
  method: 'DELETE',
  headers: {
    'Authorization': 'Basic ' + token
  }
});
        if(!r.ok) throw new Error('Delete failed');
        renderList();
        document.getElementById('detail').innerHTML = '';
      }catch(e){ alert('Erreur suppression'); console.error(e); }
    });
  }catch(e){ detail.innerHTML = '<p>Impossible de charger la fiche.</p>'; console.error(e); }
}

window.addEventListener('DOMContentLoaded', ()=>{ renderList(); });
