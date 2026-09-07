
import React, { useMemo, useState } from "react";
import { conceptCards as baseConceptCards, conceptText as baseConceptText, menuItems as baseMenuItems, whiskeyLibrary as baseWhiskeyLibrary, checklist, employees, shifts } from "./data/mockData";

const LS={concept:"rai_concept",conceptCards:"rai_concept_cards",menu:"rai_menu",whiskey:"rai_whiskey"};
const load=(k,f)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

export default function App(){
  const [role,setRole]=useState("employee");
  const [screen,setScreen]=useState("home");
  const [concept,setConceptState]=useState(()=>load(LS.concept,baseConceptText));
  const [conceptCards,setConceptCardsState]=useState(()=>load(LS.conceptCards,baseConceptCards));
  const [menu,setMenuState]=useState(()=>load(LS.menu,baseMenuItems));
  const [whiskey,setWhiskeyState]=useState(()=>load(LS.whiskey,baseWhiskeyLibrary));
  const [toast,setToast]=useState("");
  const showToast=t=>{setToast(t);setTimeout(()=>setToast(""),1600)};
  const persist=(setter,key)=>(v)=>{setter(v);save(key,v)};
  const switchRole=()=>{setRole(r=>r==="employee"?"manager":"employee");setScreen("home")};

  return <div className="app">
    <header className="topbar">
      <div><div className="brand">RAI</div><div className="brandSub">Restaurant AI</div></div>
      <button className="rolePill" onClick={switchRole}>{role==="employee"?"Сотрудник":"Управляющий"} · сменить</button>
    </header>
    <main className="content">
      {role==="employee"
        ? <Employee screen={screen} setScreen={setScreen} conceptCards={conceptCards} whiskey={whiskey} menu={menu} showToast={showToast}/>
        : <Manager screen={screen} setScreen={setScreen} concept={concept} setConcept={persist(setConceptState,LS.concept)} conceptCards={conceptCards} setConceptCards={persist(setConceptCardsState,LS.conceptCards)} whiskey={whiskey} setWhiskey={persist(setWhiskeyState,LS.whiskey)} menu={menu} setMenu={persist(setMenuState,LS.menu)} />}
    </main>
    <BottomNav role={role} screen={screen} setScreen={setScreen}/>
    {toast&&<div className="toast">{toast}</div>}
  </div>
}

function BottomNav({role,screen,setScreen}){
  const items=role==="employee"
    ? [["home","Главная"],["training","Обучение"],["checklist","Чек-лист"],["profile","Профиль"]]
    : [["home","Команда"],["knowledge","База"],["training","Обучения"],["checklist","Чек-листы"],["analytics","Аналитика"]];
  return <nav className="bottomNav">{items.map(([id,label])=><button key={id} className={screen===id?"active":""} onClick={()=>setScreen(id)}><span className="navDot"/>{label}</button>)}</nav>
}

function Employee({screen,setScreen,conceptCards,whiskey,menu,showToast}){
  if(screen==="training")return <TrainingHub setScreen={setScreen}/>;
  if(screen==="quiz-concept")return <Quiz title="Концепция" cards={conceptCards} onBack={()=>setScreen("training")}/>;
  if(screen==="quiz-whiskey")return <Quiz title="Виски" cards={whiskey.map(w=>({question:w.question,answers:w.answers,correct:w.correct,note:`${w.brand} · ${w.region} · ${w.abv}`}))} onBack={()=>setScreen("training")}/>;
  if(screen==="quiz-menu")return <Quiz title="Меню" cards={menu.map((m)=>({question:`Что входит в «${m.name}»?`,answers:[m.description,...menu.filter(x=>x.id!==m.id).slice(0,3).map(x=>x.description)],correct:0}))} onBack={()=>setScreen("training")}/>;
  if(screen==="checklist")return <ChecklistScreen showToast={showToast}/>;
  if(screen==="profile")return <EmployeeProfile/>;
  if(screen==="attendance")return <Attendance showToast={showToast}/>;
  return <EmployeeHome setScreen={setScreen}/>;
}

function EmployeeHome({setScreen}){
  return <section><p className="eyebrow">Сегодня · 7 сентября</p><h1>Доброе утро, Алексей</h1><p className="muted">У тебя 3 действия до начала смены.</p>
    <div className="heroCard"><span className="badge">Обучение</span><h2>Продолжить концепцию</h2><p>7 из 10 карточек · 92% правильных</p><button className="primary" onClick={()=>setScreen("quiz-concept")}>Продолжить</button></div>
    <div className="grid2"><MiniCard title="Чек-лист" value="5 / 7" subtitle="открытие бара" onClick={()=>setScreen("checklist")}/><MiniCard title="Смена" value="09:53" subtitle="приход отмечен" onClick={()=>setScreen("attendance")}/></div>
    <SectionTitle title="На сегодня"/><ActionRow title="Повторить виски" meta="6 карточек · 8 минут" onClick={()=>setScreen("quiz-whiskey")}/><ActionRow title="Меню" meta="5 позиций · 6 минут" onClick={()=>setScreen("quiz-menu")}/><ActionRow title="Отметка смены" meta="QR · приход / уход" onClick={()=>setScreen("attendance")}/>
  </section>
}

function TrainingHub({setScreen}){return <section><p className="eyebrow">Обучение</p><h1>Твои программы</h1><TrainingTile title="Концепция RAI Atelier" progress={70} meta="10 карточек" onClick={()=>setScreen("quiz-concept")}/><TrainingTile title="База знаний · виски" progress={52} meta="6 карточек" onClick={()=>setScreen("quiz-whiskey")}/><TrainingTile title="Меню" progress={80} meta="5 позиций" onClick={()=>setScreen("quiz-menu")}/></section>}

function Quiz({title,cards,onBack}){
  const [index,setIndex]=useState(0),[choice,setChoice]=useState(null),[score,setScore]=useState(0);
  const card=cards[index]; if(!card)return null;
  const select=i=>{if(choice!==null)return;setChoice(i);if(i===card.correct)setScore(s=>s+1)};
  const next=()=>{if(index>=cards.length-1)return onBack();setIndex(i=>i+1);setChoice(null)};
  return <section><button className="back" onClick={onBack}>← Назад</button><div className="quizTop"><span>{title}</span><span>{index+1}/{cards.length}</span></div><div className="progress"><span style={{width:`${((index+1)/cards.length)*100}%`}}/></div>
    <div className="questionCard">{card.note&&<p className="eyebrow">{card.note}</p>}<h2>{card.question}</h2><div className="answers">{card.answers.map((a,i)=>{let cls="";if(choice!==null){if(i===card.correct)cls="correct";else if(i===choice)cls="wrong"}return <button key={i} className={cls} onClick={()=>select(i)}>{a}</button>})}</div>
    {choice!==null&&<div className="resultBox"><strong>{choice===card.correct?"Верно":"Неверно"}</strong><span>Счёт: {score}/{index+1}</span></div>}
    <button className="primary full" disabled={choice===null} onClick={next}>{index===cards.length-1?"Завершить":"Следующая"}</button></div>
  </section>
}

function ChecklistScreen({showToast}){
  const items=[...checklist.opening.map((x,i)=>({id:`o${i}`,group:"Открытие",text:x,time:`${9+Math.floor(i/3)}:${String((i%3)*10).padStart(2,"0")}`})),...checklist.closing.map((x,i)=>({id:`c${i}`,group:"Закрытие",text:x,time:`23:${String((i%6)*5).padStart(2,"0")}`}))];
  const [state,setState]=useState({}),[photo,setPhoto]=useState(null);
  const mark=(id,v)=>{setState(s=>({...s,[id]:v}));showToast(v==="done"?"Отмечено как выполнено":"Повторим через 10 минут")};
  return <section><p className="eyebrow">Чек-лист бармена</p><h1>Сегодня</h1>{["Открытие","Закрытие"].map(g=><div key={g}><SectionTitle title={g}/>{items.filter(x=>x.group===g).map(it=><div className="checkItem" key={it.id}><div className="time">{it.time}</div><div className="checkBody"><p>{it.text}</p><div className="checkActions"><button className={state[it.id]==="done"?"small done":"small"} onClick={()=>mark(it.id,"done")}>Сделал</button><button className={state[it.id]==="later"?"small later":"small ghost"} onClick={()=>mark(it.id,"later")}>Не сделал</button></div></div></div>)}</div>)}
    <div className="uploadBox"><strong>Фотоотчёт</strong><p>В демо фото хранится только локально.</p><label className="secondary fileLabel">{photo?"Фото выбрано ✓":"Добавить фото"}<input type="file" accept="image/*" onChange={e=>setPhoto(e.target.files?.[0]?.name||null)}/></label></div>
  </section>
}

function Attendance({showToast}){
  const [active,setActive]=useState(false),[status,setStatus]=useState("Приход отмечен в 09:53");
  const scan=()=>{setActive(true);setTimeout(()=>{setActive(false);setStatus("QR подтверждён · смена активна");showToast("Время записано")},900)};
  return <section><p className="eyebrow">Учёт смены</p><h1>Приход / уход</h1><div className="scanner"><div className={active?"scanLine active":"scanLine"}/><div className="qrMock">RAI</div></div><p className="center muted">{status}</p><button className="primary full" onClick={scan}>{active?"Сканируем...":"Сканировать QR"}</button><div className="salaryCard"><div><span>Ставка</span><strong>300 ₽/ч</strong></div><div><span>Вечер</span><strong>×1.2</strong></div><div><span>Выходной</span><strong>×1.5</strong></div></div></section>
}

function EmployeeProfile(){
  const e=employees[0];
  return <section><p className="eyebrow">Профиль</p><div className="profileHead"><div className="avatar large">{e.avatar}</div><div><h1>{e.name}</h1><p className="muted">{e.role} · с {e.hired}</p></div></div><div className="metricGrid"><Metric label="Обучение" value={`${e.training}%`}/><Metric label="Серия" value={`${e.streak} дн.`}/><Metric label="Часы" value={e.hours}/><Metric label="Зарплата" value={`${e.salary.toLocaleString("ru-RU")} ₽`}/></div><SectionTitle title="Последние смены"/>{shifts.map((s,i)=><div className="shiftRow" key={i}><span>{s.date}</span><span>{s.in} — {s.out||"..."}</span><strong>{s.factor>1?`×${s.factor}`:""}</strong></div>)}</section>
}

function Manager({screen,setScreen,concept,setConcept,conceptCards,setConceptCards,whiskey,setWhiskey,menu,setMenu}){
  if(screen==="knowledge")return <KnowledgeManager whiskey={whiskey} setWhiskey={setWhiskey}/>;
  if(screen==="training")return <TrainingManager concept={concept} setConcept={setConcept} cards={conceptCards} setCards={setConceptCards} menu={menu} setMenu={setMenu}/>;
  if(screen==="checklist")return <ChecklistManager/>;
  if(screen==="analytics")return <Analytics/>;
  if(screen==="employee-card")return <ManagerEmployeeCard setScreen={setScreen}/>;
  return <ManagerHome setScreen={setScreen}/>;
}

function ManagerHome({setScreen}){return <section><p className="eyebrow">Управление</p><h1>Команда</h1><div className="summaryStrip"><Metric label="Сотрудников" value="5"/><Metric label="Средний прогресс" value="70%"/><Metric label="На смене" value="3"/></div>{employees.map(e=><button className="employeeRow" key={e.id} onClick={()=>setScreen("employee-card")}><div className="avatar">{e.avatar}</div><div className="employeeMain"><strong>{e.name}</strong><span>{e.role} · {e.hours} ч</span></div><div className="employeeProgress"><strong>{e.training}%</strong><span className="miniProgress"><i style={{width:`${e.training}%`}}/></span></div></button>)}</section>}

function ManagerEmployeeCard({setScreen}){const e=employees[0];return <section><button className="back" onClick={()=>setScreen("home")}>← Команда</button><div className="profileHead"><div className="avatar large">{e.avatar}</div><div><h1>{e.name}</h1><p className="muted">{e.role}</p></div></div><div className="metricGrid"><Metric label="Обучение" value={`${e.training}%`}/><Metric label="Часы" value={e.hours}/><Metric label="Зарплата" value={`${e.salary.toLocaleString("ru-RU")} ₽`}/><Metric label="Серия" value={`${e.streak} дн.`}/></div><SectionTitle title="Программы обучения"/><TrainingTile title="Концепция" progress={100} meta="10/10"/><TrainingTile title="Виски" progress={83} meta="5/6"/><TrainingTile title="Меню" progress={80} meta="4/5"/></section>}

function TrainingManager({concept,setConcept,cards,setCards,menu,setMenu}){
  const [tab,setTab]=useState("concept");
  return <section><p className="eyebrow">Обучения</p><h1>Редактор</h1><div className="tabs"><button className={tab==="concept"?"active":""} onClick={()=>setTab("concept")}>Концепция</button><button className={tab==="menu"?"active":""} onClick={()=>setTab("menu")}>Меню</button></div>
    {tab==="concept"?<><label className="fieldLabel">Текст концепции</label><textarea className="editor" value={concept} onChange={e=>setConcept(e.target.value)}/><SectionTitle title="Карточки"/>{cards.map((c,idx)=><EditableQuizCard key={c.id} card={c} onChange={next=>{const copy=[...cards];copy[idx]=next;setCards(copy)}}/>)}</>:menu.map((m,idx)=><div className="editCard" key={m.id}><input value={m.name} onChange={e=>{const copy=[...menu];copy[idx]={...m,name:e.target.value};setMenu(copy)}}/><textarea value={m.description} onChange={e=>{const copy=[...menu];copy[idx]={...m,description:e.target.value};setMenu(copy)}}/><input type="number" value={m.price} onChange={e=>{const copy=[...menu];copy[idx]={...m,price:Number(e.target.value)};setMenu(copy)}}/></div>)}
  </section>
}
function EditableQuizCard({card,onChange}){return <div className="editCard"><input value={card.question} onChange={e=>onChange({...card,question:e.target.value})}/>{card.answers.map((a,i)=><div className="answerEdit" key={i}><input value={a} onChange={e=>{const answers=[...card.answers];answers[i]=e.target.value;onChange({...card,answers})}}/><button className={card.correct===i?"correctMark active":"correctMark"} onClick={()=>onChange({...card,correct:i})}>✓</button></div>)}</div>}

function KnowledgeManager({whiskey,setWhiskey}){
  const [selected,setSelected]=useState(whiskey[0]?.id); const item=whiskey.find(x=>x.id===selected); const patch=next=>setWhiskey(whiskey.map(x=>x.id===selected?{...x,...next}:x));
  return <section><p className="eyebrow">База знаний</p><h1>Виски</h1><div className="chipRow">{whiskey.map(w=><button key={w.id} className={selected===w.id?"chip active":"chip"} onClick={()=>setSelected(w.id)}>{w.brand}</button>)}</div>{item&&<div className="editCard"><label className="fieldLabel">Бренд</label><input value={item.brand} onChange={e=>patch({brand:e.target.value})}/><label className="fieldLabel">Регион</label><input value={item.region} onChange={e=>patch({region:e.target.value})}/><label className="fieldLabel">Крепость</label><input value={item.abv} onChange={e=>patch({abv:e.target.value})}/><label className="fieldLabel">Описание</label><textarea value={item.note} onChange={e=>patch({note:e.target.value})}/><label className="fieldLabel">Вопрос</label><input value={item.question} onChange={e=>patch({question:e.target.value})}/>{item.answers.map((a,i)=><div className="answerEdit" key={i}><input value={a} onChange={e=>{const answers=[...item.answers];answers[i]=e.target.value;patch({answers})}}/><button className={item.correct===i?"correctMark active":"correctMark"} onClick={()=>patch({correct:i})}>✓</button></div>)}</div>}</section>
}

function ChecklistManager(){return <section><p className="eyebrow">Чек-листы</p><h1>Бар · сегодня</h1><div className="summaryStrip"><Metric label="Выполнено" value="11/14"/><Metric label="Просрочено" value="2"/><Metric label="Фото" value="3"/></div><SectionTitle title="Открытие"/>{checklist.opening.map((x,i)=><div className="managerCheck" key={i}><span className={i<5?"status ok":"status pending"}>{i<5?"✓":"•"}</span><p>{x}</p><strong>{i<5?"готово":"ожидает"}</strong></div>)}<SectionTitle title="Закрытие"/>{checklist.closing.slice(0,4).map((x,i)=><div className="managerCheck" key={i}><span className="status pending">•</span><p>{x}</p><strong>23:{String(i*10).padStart(2,"0")}</strong></div>)}</section>}

function Analytics(){return <section><p className="eyebrow">Аналитика</p><h1>Сводка команды</h1><div className="metricGrid"><Metric label="Средний прогресс" value="70%"/><Metric label="Часы за месяц" value="747"/><Metric label="ФОТ" value="236 120 ₽"/><Metric label="На смене" value="3 / 5"/></div><SectionTitle title="Обучение"/>{employees.map(e=><div className="barRow" key={e.id}><span>{e.name.split(" ")[0]}</span><div className="bar"><i style={{width:`${e.training}%`}}/></div><strong>{e.training}%</strong></div>)}<SectionTitle title="Сигналы"/><ActionRow title="Никита Волков" meta="Обучение 34% · требуется внимание"/><ActionRow title="Полина Орлова" meta="2 незавершённых модуля"/></section>}

function MiniCard({title,value,subtitle,onClick}){return <button className="miniCard" onClick={onClick}><span>{title}</span><strong>{value}</strong><small>{subtitle}</small></button>}
function Metric({label,value}){return <div className="metric"><span>{label}</span><strong>{value}</strong></div>}
function SectionTitle({title}){return <h3 className="sectionTitle">{title}</h3>}
function ActionRow({title,meta,onClick}){return <button className="actionRow" onClick={onClick}><div><strong>{title}</strong><span>{meta}</span></div><b>›</b></button>}
function TrainingTile({title,progress,meta,onClick}){return <button className="trainingTile" onClick={onClick}><div><strong>{title}</strong><span>{meta}</span></div><div className="trainingRight"><b>{progress}%</b><span className="miniProgress"><i style={{width:`${progress}%`}}/></span></div></button>}
