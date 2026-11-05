/* ---- MOCK API: real jaisi hi signatures ---- */
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const CL=[{id:1,name:'CSE-3A',subject:'Data Structures',time:'9:00 AM - 10:00 AM',count:45},{id:2,name:'CSE-3B',subject:'Web Development',time:'11:00 AM - 12:00 PM',count:38},{id:3,name:'CSE-5A',subject:'Database Management',time:'1:00 PM - 2:00 PM',count:42},{id:4,name:'CSE-5B',subject:'Operating Systems',time:'3:00 PM - 4:00 PM',count:36}];
const ST=[['220101','Pranav Arora'],['220102','Riya Sharma'],['220103','Aaditya Singh'],['220104','Neha Gupta'],['220105','Karan Verma'],['220106','Muskan Jain'],['220107','Arpit Soni'],['220108','Tanya Mehta']].map((s,i)=>({id:i+1,rollNo:s[0],name:s[1],className:'CSE-3A'}));
const SUBJ=CL.map((c,i)=>({id:i+1,name:c.subject,code:'CS'+(301+i)}));
const ANN=[{id:1,title:'Internal Exam Schedule',text:'Internal exams will be conducted from 15th Oct onwards.',ago:'2 days ago'},{id:2,title:'Library Timings',text:'Library stays open until 8 PM during exams.',ago:'5 days ago'}];
const saved={};
const mock={
  async login(d){await wait(300);if(!d.identifier||!d.password)throw new Error('Enter your email or roll number and password.');
    return /^\d+$/.test(d.identifier)?{token:'mock',user:{id:1,name:'Pranav Arora',role:'student',rollNo:d.identifier,className:'CSE-3A'}}:{token:'mock',user:{id:99,name:'Prof. Sharma',role:'teacher'}}},
  async dashboard(o={}){await wait(200);const w=o.range==='last'?[80,85,82,90,87,84]:[84,80,88,93,91,90];
    return{stats:{classes:4,students:128,avg:92,pending:2},today:CL,week:['Mon','Tue','Wed','Thu','Fri','Sat'].map((day,i)=>({day,pct:w[i]})),
    activity:[{type:'check',text:'You marked attendance for Data Structures',time:'2 hours ago'},{type:'plus',text:'New student Rahul Mehta added to CSE-3A',time:'4 hours ago'},{type:'doc',text:'Attendance report generated for CSE-5A',time:'6 hours ago'}]}},
  async classes(){await wait(150);return CL},
  async students(){await wait(150);return ST},
  async subjects(){await wait(150);return SUBJ},
  async announcements(){await wait(150);return ANN},
  async classAttendance(id,date){await wait(200);const k=id+date;return ST.map((s,i)=>({studentId:s.id,rollNo:s.rollNo,name:s.name,status:(saved[k]||{})[s.id]||([5,3].includes(i)?'A':'P')}))},
  async saveAttendance(id,date,rec){await wait(300);saved[id+date]=Object.fromEntries(rec.map(r=>[r.studentId,r.status]));return{ok:true}},
  async report(q){await wait(250);const p=[92,89,79,95,85,88,76,90];const rows=ST.map((s,i)=>({rollNo:s.rollNo,name:s.name,total:39,present:Math.round(39*p[i]/100),pct:p[i]}));
    return{avg:92,count:8,low:3,rows}},
  async studentOverview(){await wait(200);const sb=['Data Structures','Web Development','Database Management','Operating Systems'];
    return{pct:92,attended:36,total:39,missed:3,subjects:[{name:sb[0],pct:92},{name:sb[1],pct:89},{name:sb[2],pct:95},{name:sb[3],pct:85}],announcements:ANN,
    history:sb.concat(sb).map((s,i)=>({date:`${2+Math.floor(i/4)} Oct 2026`,subject:s,status:i===5?'A':'P'})),
    timetable:['Mon','Tue','Wed','Thu','Fri'].map((day,i)=>({day,slots:[{time:'9:00 AM',subject:sb[i%4]},{time:'11:00 AM',subject:sb[(i+1)%4]},{time:'1:00 PM',subject:sb[(i+2)%4]}]}))}},
};
