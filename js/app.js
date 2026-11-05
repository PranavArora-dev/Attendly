/* ============ UI ============ */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ini=n=>n.split(' ').map(w=>w[0]).slice(0,2).join('');
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),2200)}
const ICONS={home:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',check:'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',
users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
cls:'M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M9 21v-4h6v4M9 8h.01M15 8h.01M9 12h.01M15 12h.01',book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
chart:'M3 3v18h18M7 15l4-4 3 3 5-6',mega:'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12',
search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',bell:'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4',clock:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
open:'M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z',cal:'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
plus:'M12 5v14M5 12h14',doc:'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
x:'M18 6L6 18M6 6l12 12',tick:'M5 13l4 4L19 7',arrow:'M5 12h14M13 6l6 6-6 6',out:'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',dl:'M12 3v12M7 10l5 5 5-5M4 21h16',alert:'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'};
const ic=(n,s=18)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[n]}"/></svg>`;
const TILE=['#4da3ff','#22b573','#7c5cff','#ff9f2e'],TI=['cls','chart','users','book'];
const NAV=[['dashboard','Dashboard','home'],['mark','Mark Attendance','check'],['students','Students','users'],['classes','Classes','cls'],['subjects','Subjects','book'],['reports','Reports','chart'],['announcements','Announcements','mega']];
const greet=()=>{const h=new Date().getHours();return h<12?'Good Morning':h<17?'Good Afternoon':'Good Evening'};
const stat=(i,v,l,c)=>`<div class="card stat"><span class="tile ${c}">${ic(i,22)}</span><div><b>${v}</b><span>${l}</span></div></div>`;
const crow=(c,i)=>`<div class="crow"><span class="ctile" style="background:${TILE[i%4]}">${ic(TI[i%4],22)}</span><div class="cinfo"><b>${esc(c.subject)}</b><small>${esc(c.name)} • ${esc(c.time)}</small><small>${c.count} Students</small></div><button class="btn sm" data-mark="${c.id}">Mark Attendance</button></div>`;
const run=fn=>fn().catch(e=>{const m=$('#main');if(m)m.innerHTML=`<div class="card err" role="alert">${esc(e.message)}</div>`});
function go(v){state.view=v;if(v!=='students')state.q='';shell()}
function logout(){state.user=state.token=null;loginView()}

function loginView(){
  $('#app').innerHTML=`<div class="login"><div class="lform"><div class="logo">${ic('open',30)}Attendly</div><h1>Welcome Back</h1><p class="sub">Sign in to your account</p>
  <div><label for="id">Email or Roll No.</label><input id="id" autocomplete="username" placeholder="Enter your email or roll number"></div>
  <div><label for="pw">Password</label><div class="pw"><input id="pw" type="password" autocomplete="current-password" placeholder="Enter your password"><button type="button" id="eye" aria-label="Show password">${ic('eye',18)}</button></div></div>
  <div class="err" id="err" role="alert"></div><button class="btn" id="go" style="justify-content:center;padding:12px">Sign In</button>
  <p class="hint">Don't have an account? <a href="#" style="color:var(--blue);font-weight:600;text-decoration:none">Contact Admin</a><br>${CONFIG.USE_MOCK?'Demo: any email = teacher, digits (220101) = student':'Demo: prof@college.edu / teacher123 &middot; 220101 / student123'}</p></div>
  <div class="hero"><svg viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="600" height="800" fill="#6e93b8"/><rect y="520" width="600" height="280" fill="#2f4a2f"/><rect x="60" y="250" width="480" height="290" fill="#8d4a3a"/><rect x="60" y="230" width="480" height="30" fill="#5b2f27"/>${Array.from({length:24},(_,i)=>`<rect x="${90+(i%8)*55}" y="${285+Math.floor(i/8)*80}" width="30" height="46" fill="#d9e6f2" opacity=".8"/>`).join('')}<circle cx="40" cy="520" r="70" fill="#1f3a22"/><circle cx="570" cy="520" r="80" fill="#1f3a22"/></svg>
  <h1>Smart Attendance for a Smarter Tomorrow</h1><div>Track. Manage. Analyze.</div><hr></div></div>`;
  const submit=async()=>{$('#err').textContent='';$('#go').disabled=true;
    try{const r=await api.login({identifier:$('#id').value.trim(),password:$('#pw').value});state.token=r.token;state.user=r.user;state.view='dashboard';state.tab='overview';shell()}
    catch(e){$('#err').textContent=e.message;$('#go').disabled=false}};
  $('#go').addEventListener('click',()=>{submit()});
  ['#id','#pw'].forEach(s=>$(s).addEventListener('keydown',e=>{if(e.key==='Enter'){submit()}}));
  $('#eye').addEventListener('click',()=>{const p=$('#pw');p.type=p.type==='password'?'text':'password'});
  $('#id').focus();
}

function shell(){
  if(state.user.role==='student')return studentShell();
  const u=state.user;
  $('#app').innerHTML=`<div class="shell"><aside class="side"><div class="logo">${ic('open',28)}Attendly</div>
  ${NAV.map(n=>`<button class="nav ${state.view===n[0]?'on':''}" data-v="${n[0]}">${ic(n[2])}${n[1]}</button>`).join('')}
  <div class="me"><span class="av">${ini(u.name)}</span><div>${esc(u.name)}<small>Faculty</small></div><button class="icon-btn" id="out" aria-label="Sign out" title="Sign out">${ic('out')}</button></div></aside>
  <div><header class="topbar"><label class="search">${ic('search',16)}<input id="q" placeholder="Search students, classes..." value="${esc(state.q)}" aria-label="Search"></label><button class="bell" id="bell" aria-label="Notifications">${ic('bell',22)}<i class="dot"></i></button></header><main id="main">Loading…</main></div></div>`;
  $$('.nav[data-v]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.v)));
  $('#out').addEventListener('click',logout);
  $('#bell').addEventListener('click',()=>toast('No new notifications'));
  $('#q').addEventListener('keydown',e=>{if(e.key==='Enter'){state.q=e.target.value.trim();go('students')}});
  run(views[state.view]||views.dashboard);
}

const views={
  async dashboard(){
    const d=await api.dashboard({range:state.range}),s=d.stats,hi=d.week.reduce((a,w,i)=>w.pct>d.week[a].pct?i:a,0);
    const AI={check:['check','g'],plus:['plus','g'],doc:['doc','b']};
    $('#main').innerHTML=`<h2>${greet()}, ${esc(state.user.name)} 👋</h2><p class="sub">Here's an overview of your classes and attendance today.</p>
    <div class="grid g4">${stat('book',s.classes,'Total Classes','b')+stat('users',s.students,'Total Students','b')+stat('chart',s.avg+'%','Average Attendance','g')+stat('clock',s.pending,'Pending Attendance','r')}</div>
    <div class="grid g2" style="margin-top:18px"><div class="card"><div class="ch"><b>Today's Classes</b><button class="link" id="va">View All ${ic('arrow',14)}</button></div>${d.today.map(crow).join('')}</div>
    <div class="grid" style="align-content:start"><div class="card"><div class="ch"><b>Attendance Overview</b><select class="sm" id="rg" aria-label="Range"><option value="this">This Week</option><option value="last" ${state.range==='last'?'selected':''}>Last Week</option></select></div>
    <div class="chart"><div class="y">${[100,75,50,25,0].map(v=>`<span>${v}</span>`).join('')}</div>${[0,25,50,75,100].map(v=>`<i class="gl" style="top:${v}%"></i>`).join('')}
    <div class="cols">${d.week.map((w,i)=>`<div class="col ${i===hi?'hi':''}" tabindex="0"><em class="tip" style="bottom:calc(${w.pct}% + 6px)">${w.day}<b>${w.pct}%</b></em><span style="height:${w.pct}%"></span><small>${w.day}</small></div>`).join('')}</div></div></div>
    <div class="card"><div class="ch"><b>Recent Activity</b><button class="link" id="vn">View All ${ic('arrow',14)}</button></div>${d.activity.map(a=>`<div class="arow"><span class="tile ${(AI[a.type]||AI.doc)[1]}">${ic((AI[a.type]||AI.doc)[0],18)}</span><div>${esc(a.text)}<small>${esc(a.time)}</small></div></div>`).join('')}</div></div></div>`;
    $$('[data-mark]').forEach(b=>b.addEventListener('click',()=>{state.classId=+b.dataset.mark;go('mark')}));
    $('#va').addEventListener('click',()=>go('classes'));$('#vn').addEventListener('click',()=>go('announcements'));
    $('#rg').addEventListener('change',e=>{state.range=e.target.value;shell()});
  },
  async mark(){
    const cls=await api.classes();state.classId=state.classId||cls[0].id;
    const cl=cls.find(c=>c.id===state.classId)||cls[0],rows=await api.classAttendance(cl.id,state.date);
    const pill=p=>`${ic(p?'tick':'x',12)}${p?'Present':'Absent'}`;
    $('#main').innerHTML=`<h2>Mark Attendance</h2><p class="sub">${esc(cl.name)} &nbsp;|&nbsp; ${esc(cl.time)}</p>
    <div class="card"><div class="tools"><label class="field">${ic('cal',16)}<input type="date" id="dt" value="${state.date}" aria-label="Date"></label>
    <select id="cs" aria-label="Class">${cls.map(c=>`<option value="${c.id}" ${c.id===cl.id?'selected':''}>${esc(c.name)} · ${esc(c.subject)}</option>`).join('')}</select>
    <label class="search grow">${ic('search',16)}<input id="ms" placeholder="Search by name or roll number..." aria-label="Search students"></label></div>
    <div class="tw"><table class="tbl"><thead><tr><th><input type="checkbox" id="all" aria-label="Mark all present"></th><th>#</th><th>Roll No.</th><th>Name</th><th>Status</th></tr></thead><tbody>
    ${rows.map((r,i)=>`<tr data-id="${r.studentId}" data-k="${esc((r.name+' '+r.rollNo).toLowerCase())}"><td><input type="checkbox" class="ck" ${r.status==='P'?'checked':''} aria-label="Present"></td><td>${i+1}</td><td>${esc(r.rollNo)}</td><td>${esc(r.name)}</td><td><button class="st ${r.status}" data-s="${r.status}">${pill(r.status==='P')}</button></td></tr>`).join('')}</tbody></table></div></div>
    <div class="foot"><span id="cnt"></span><div><button class="btn ghost" id="cn">Cancel</button><button class="btn" id="sv">Save Attendance</button></div></div>`;
    const trs=()=>$$('tr[data-id]');
    const setRow=(tr,p)=>{tr.querySelector('.ck').checked=p;const b=tr.querySelector('.st');b.dataset.s=p?'P':'A';b.className='st '+(p?'P':'A');b.innerHTML=pill(p)};
    const count=()=>{const p=trs().filter(r=>r.querySelector('.ck').checked).length;$('#cnt').textContent=`${p} present, ${trs().length-p} absent`;$('#all').checked=p===trs().length};
    trs().forEach(tr=>{tr.querySelector('.ck').addEventListener('change',e=>{setRow(tr,e.target.checked);count()});tr.querySelector('.st').addEventListener('click',()=>{setRow(tr,tr.querySelector('.st').dataset.s!=='P');count()})});
    $('#all').addEventListener('change',e=>{trs().forEach(tr=>setRow(tr,e.target.checked));count()});
    $('#ms').addEventListener('input',e=>{const v=e.target.value.toLowerCase();trs().forEach(tr=>{tr.hidden=!tr.dataset.k.includes(v)})});
    $('#cs').addEventListener('change',e=>{state.classId=+e.target.value;shell()});$('#dt').addEventListener('change',e=>{state.date=e.target.value||state.date;shell()});
    $('#cn').addEventListener('click',()=>shell());
    $('#sv').addEventListener('click',async()=>{const rec=trs().map(tr=>({studentId:+tr.dataset.id,status:tr.querySelector('.st').dataset.s}));
      $('#sv').disabled=true;try{await api.saveAttendance(cl.id,state.date,rec);toast('Attendance saved')}catch(e){toast(e.message)}$('#sv').disabled=false});
    count();
  },
  async students(){
    const q=state.q.toLowerCase(),l=(await api.students()).filter(s=>(s.name+' '+s.rollNo+' '+s.className).toLowerCase().includes(q));
    $('#main').innerHTML=`<h2>Students</h2><p class="sub">${l.length} students${q?` matching "${esc(state.q)}"`:''}</p><div class="card tw"><table class="tbl"><thead><tr><th>Roll No.</th><th>Name</th><th>Class</th></tr></thead><tbody>${l.map(s=>`<tr><td>${esc(s.rollNo)}</td><td>${esc(s.name)}</td><td>${esc(s.className)}</td></tr>`).join('')||'<tr><td colspan="3">No students found. Try a different name or roll number.</td></tr>'}</tbody></table></div>`;
  },
  async classes(){
    const l=await api.classes();
    $('#main').innerHTML=`<h2>Classes</h2><p class="sub">Your classes this term.</p><div class="card">${l.map(crow).join('')}</div>`;
    $$('[data-mark]').forEach(b=>b.addEventListener('click',()=>{state.classId=+b.dataset.mark;go('mark')}));
  },
  async subjects(){
    const l=await api.subjects();
    $('#main').innerHTML=`<h2>Subjects</h2><p class="sub">${l.length} subjects</p><div class="card tw"><table class="tbl"><thead><tr><th>Code</th><th>Subject</th></tr></thead><tbody>${l.map(s=>`<tr><td>${esc(s.code)}</td><td>${esc(s.name)}</td></tr>`).join('')}</tbody></table></div>`;
  },
  async announcements(){
    const l=await api.announcements();
    $('#main').innerHTML=`<h2>Announcements</h2><p class="sub">Notices shared with students.</p><div class="card">${l.map(a=>`<div class="arow"><span class="tile a">${ic('mega',18)}</span><div><b>${esc(a.title)}</b><small>${esc(a.text)} · ${esc(a.ago)}</small></div></div>`).join('')}</div>`;
  },
  async reports(){
    const [cls,subs]=await Promise.all([api.classes(),api.subjects()]);let last;
    $('#main').innerHTML=`<div class="head"><div><h2>Attendance Reports</h2><p class="sub">View and export detailed attendance reports.</p></div><div><button class="btn ghost sm" id="pdf">${ic('dl',15)}Export PDF</button><button class="btn ghost sm" id="csv">${ic('dl',15)}Export CSV</button></div></div>
    <div class="tools"><div><label for="rc">Class</label><select id="rc">${[...new Set(cls.map(c=>c.name))].map(n=>`<option>${esc(n)}</option>`).join('')}</select></div>
    <div><label for="rs">Subject</label><select id="rs"><option value="">All Subjects</option>${subs.map(s=>`<option>${esc(s.name)}</option>`).join('')}</select></div>
    <div><label for="rr">Date Range</label><select id="rr"><option value="30">Last 30 Days</option><option value="7">Last 7 Days</option><option value="90">Last 90 Days</option></select></div><button class="btn" id="gen">Generate</button></div><div id="rep"></div>`;
    const gen=async()=>{last=await api.report({class:$('#rc').value,subject:$('#rs').value,days:$('#rr').value});
      $('#rep').innerHTML=`<div class="grid g3" style="margin-bottom:18px">${stat('chart',last.avg+'%','Average Attendance','g')+stat('users',last.count,'Total Students','b')+stat('alert',last.low,'Low Attendance (&lt; 75%)','r')}</div>
      <div class="card tw"><table class="tbl"><thead><tr><th>Roll No.</th><th>Name</th><th>Total Classes</th><th>Present</th><th>Attendance</th></tr></thead><tbody>${last.rows.map(r=>`<tr><td>${esc(r.rollNo)}</td><td>${esc(r.name)}</td><td>${r.total}</td><td>${r.present}</td><td><span class="st ${r.pct<75?'A':r.pct<85?'W':'P'}">${r.pct}%</span></td></tr>`).join('')}</tbody></table></div>`};
    $('#gen').addEventListener('click',()=>{gen().catch(e=>toast(e.message))});
    $('#pdf').addEventListener('click',()=>{try{window.print()}catch(e){toast('Printing is not available here')}});
    $('#csv').addEventListener('click',()=>{if(!last)return toast('Generate a report first');
      const csv='Roll No,Name,Total Classes,Present,Attendance %\n'+last.rows.map(r=>[r.rollNo,r.name,r.total,r.present,r.pct].join(',')).join('\n');
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='attendance-report.csv';a.click()});
    gen();
  }
};

/* ---- Student ---- */
const STABS=[['overview','Overview'],['history','My Attendance'],['timetable','Timetable'],['news','Announcements']];
function studentShell(){
  const u=state.user;
  $('#app').innerHTML=`<header class="stop"><div class="logo">${ic('open',26)}Attendly</div><button class="icon-btn" id="out" aria-label="Sign out" title="Sign out">${ic('out',20)}</button></header>
  <div class="sbody"><div class="who"><span class="av lg">${ini(u.name)}</span><div><h2>Hi, ${esc(u.name.split(' ')[0])}</h2><p>${esc(u.className)} &nbsp;|&nbsp; Roll No. ${esc(u.rollNo)}</p></div></div>
  <div class="tabs" role="tablist">${STABS.map(t=>`<button class="tab ${state.tab===t[0]?'on':''}" role="tab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div><div id="main">Loading…</div></div>`;
  $('#out').addEventListener('click',logout);
  $$('.tab').forEach(b=>b.addEventListener('click',()=>{state.tab=b.dataset.t;shell()}));
  run(async()=>{
    const o=await api.studentOverview(),m=$('#main');
    if(state.tab==='history')m.innerHTML=`<div class="card tw"><table class="tbl"><thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead><tbody>${o.history.map(h=>`<tr><td>${esc(h.date)}</td><td>${esc(h.subject)}</td><td><span class="st ${h.status}">${h.status==='P'?'Present':'Absent'}</span></td></tr>`).join('')}</tbody></table></div>`;
    else if(state.tab==='timetable')m.innerHTML=o.timetable.map(d=>`<div class="card" style="margin-bottom:12px"><b>${esc(d.day)}</b>${d.slots.map(s=>`<div class="arow"><span class="tile b">${ic('clock',16)}</span><div>${esc(s.subject)}<small>${esc(s.time)}</small></div></div>`).join('')}</div>`).join('');
    else if(state.tab==='news')m.innerHTML=`<div class="card">${o.announcements.map(a=>`<div class="arow"><span class="tile a">${ic('mega',18)}</span><div><b>${esc(a.title)}</b><small>${esc(a.text)} · ${esc(a.ago)}</small></div></div>`).join('')}</div>`;
    else m.innerHTML=`<div class="grid g3" style="grid-template-columns:repeat(3,1fr)"><div class="card mini"><div class="ring" style="--p:${o.pct}%"></div><b>${o.pct}%</b><small>Overall Attendance</small></div>
      <div class="card mini"><span class="tile" style="color:var(--green)">${ic('book',30)}</span><b>${o.attended}/${o.total}</b><small>Classes Attended</small></div>
      <div class="card mini"><span class="tile" style="color:var(--red)">${ic('cal',30)}</span><b>${o.missed}</b><small>Classes Missed</small></div></div>
      <div class="card" style="margin-top:16px"><div class="ch"><b>My Subjects</b></div>${o.subjects.map(s=>`<div style="display:flex;justify-content:space-between"><span>${esc(s.name)}</span><span>${s.pct}%</span></div><div class="bar"><i style="width:${s.pct}%;background:${s.pct<90?'var(--amber)':'var(--green)'}"></i></div>`).join('')}</div>
      <div class="card" style="margin-top:16px"><div class="ch"><b>Recent Announcements</b></div>${o.announcements.slice(0,1).map(a=>`<div class="arow"><span class="tile a">${ic('mega',18)}</span><div><b>${esc(a.title)}</b><small>${esc(a.text)} · ${esc(a.ago)}</small></div></div>`).join('')}</div>`;
  });
}
loginView();
