// UI interactions for NotMonsterblue site
document.addEventListener('DOMContentLoaded', ()=>{
  // theme toggle - toggles class on body
  const toggles = document.querySelectorAll('.theme-toggle');
  toggles.forEach(t=>t.addEventListener('click', ()=>{
    const body = document.body;
    const next = body.classList.contains('theme-dark') ? 'theme-light' : 'theme-dark';
    body.classList.remove('theme-dark','theme-light');
    body.classList.add(next);
    localStorage.setItem('nm_theme', next);
  }));
  // restore theme
  const saved = localStorage.getItem('nm_theme') || 'theme-dark';
  document.body.classList.remove('theme-dark','theme-light');
  document.body.classList.add(saved);

  // booking simple
  const bookBtn = document.getElementById('bookBtn');
  if(bookBtn){
    bookBtn.addEventListener('click', ()=>{
      const name = document.getElementById('bookName').value.trim();
      const msg = document.getElementById('bookingMsg');
      if(!name){msg.textContent='Write project or owner name first.';return;}
      msg.textContent = 'Booking request sent (local demo): ' + name;
    });
  }

  // show/hide comment form based on auth (firebase auth will trigger custom event)
  window.addEventListener('authchanged', (e)=>{
    const uid = e.detail && e.detail.uid;
    const authLink = document.getElementById('authLink');
    if(uid){
      if(authLink) authLink.textContent = 'Account';
      const form = document.getElementById('commentForm');
      const notice = document.getElementById('commentAuthNotice');
      if(form){form.style.display='block';}
      if(notice) notice.style.display='none';
    } else {
      if(authLink) authLink.textContent = 'Login';
      const form = document.getElementById('commentForm');
      const notice = document.getElementById('commentAuthNotice');
      if(form) form.style.display='none';
      if(notice) notice.style.display='block';
    }
  });

  // comment send handler (uses firebase.postComment if available)
  const sendBtn = document.getElementById('sendComment');
  if(sendBtn){
    sendBtn.addEventListener('click', async ()=>{
      const input = document.getElementById('commentInput');
      const text = input.value.trim();
      if(!text) return alert('Write a comment first.');
      if(window.firebaseApp && window.postComment){
        await window.postComment({text, page: window.location.pathname});
        input.value='';
        loadComments();
      } else {
        alert('Comments require Firebase — configure firebase.js and sign in.');
      }
    });
  }

  // load comments if function exists
  async function loadComments(){
    const list = document.getElementById('commentsList');
    if(!list) return;
    list.innerHTML = 'Loading comments...';
    if(window.getComments){
      const comments = await window.getComments(window.location.pathname);
      if(!comments || comments.length===0){ list.innerHTML = '<div class="muted">No comments yet.</div>'; return; }
      list.innerHTML = '';
      comments.forEach(c=>{
        const d = document.createElement('div');
        d.className='comment';
        d.innerHTML = '<strong>'+escapeHtml(c.author||'Anon')+'</strong> <div class="muted">'+new Date(c.created).toLocaleString()+'</div><div>'+escapeHtml(c.text)+'</div>';
        list.appendChild(d);
      });
    } else {
      list.innerHTML = '<div class="muted">Comments disabled (no Firebase configured).</div>';
    }
  }
  loadComments();
});

function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, (m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m]); }
