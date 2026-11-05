/* ---- REAL API: har method ke upar response shape likha hai ---- */
async function http(method,path,body){
  const r=await fetch(CONFIG.BASE_URL+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+(state.token||'')},body:body?JSON.stringify(body):undefined});
  if(r.status===401&&state.token){state.token=state.user=null;loginView();throw new Error('Session expired. Please sign in again.')}
  if(!r.ok){let m='Request failed';try{m=(await r.json()).message||m}catch(e){}throw new Error(m)}
  return r.json();
}
const real={
  login:d=>http('POST','/auth/login',d),                // d:{identifier,password} -> {token,user:{id,name,role:'teacher'|'student',rollNo?,className?}}
  dashboard:o=>http('GET','/teacher/dashboard?range='+((o&&o.range)||'this')), // -> {stats:{classes,students,avg,pending},today:[Class],week:[{day,pct}],activity:[{type:'check'|'plus'|'doc',text,time}]}
  classes:()=>http('GET','/classes'),                   // -> [{id,name,subject,time,count}]
  students:()=>http('GET','/students'),                 // -> [{id,rollNo,name,className}]
  subjects:()=>http('GET','/subjects'),                 // -> [{id,name,code}]
  announcements:()=>http('GET','/announcements'),       // -> [{id,title,text,ago}]
  classAttendance:(id,date)=>http('GET',`/classes/${id}/attendance?date=${date}`), // -> [{studentId,rollNo,name,status:'P'|'A'}]
  saveAttendance:(id,date,records)=>http('POST',`/classes/${id}/attendance`,{date,records}), // records:[{studentId,status}]
  report:q=>http('GET','/reports?'+new URLSearchParams(q)), // q:{class,subject,days} -> {avg,count,low,rows:[{rollNo,name,total,present,pct}]}
  studentOverview:()=>http('GET','/student/overview'),  // -> {pct,attended,total,missed,subjects:[{name,pct}],announcements:[..],history:[{date,subject,status}],timetable:[{day,slots:[{time,subject}]}]}
};
