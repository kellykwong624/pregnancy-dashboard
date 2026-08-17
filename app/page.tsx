"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CircleHelp,
  HeartPulse,
  Plus,
  Sparkles,
  Baby,
  ChevronRight,
  ClipboardList,
  Clock3,
  X
} from "lucide-react";
import { Appointment, Cycle, Pregnancy, Question } from "../lib/types";
import { dueDateFromLmp, formatDate, gestationalAgeFromLmp } from "../lib/date";

const starterPregnancies: Pregnancy[] = [
  {
    id: "preg-1",
    label: "Pregnancy 1",
    status: "pregnant",
    lmp: "",
    dueDate: "",
    positiveTestDate: "",
    notes: ""
  }
];

const starterQuestions: Question[] = [
  {
    id: "q-1",
    pregnancyId: "preg-1",
    text: "What symptoms should make me call the office versus go to urgent care or the ER?",
    category: "symptoms",
    priority: "important"
  },
  {
    id: "q-2",
    pregnancyId: "preg-1",
    text: "Which medications and supplements should I continue, stop, or change?",
    category: "medications",
    priority: "important"
  },
  {
    id: "q-3",
    pregnancyId: "preg-1",
    text: "Are there any exercise restrictions specific to me?",
    category: "exercise",
    priority: "normal"
  }
];

function useLocalState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try { setState(JSON.parse(raw)); } catch {}
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (loaded) localStorage.setItem(key, JSON.stringify(state));
  }, [key, state, loaded]);

  return [state, setState] as const;
}

export default function Home() {
  const [pregnancies, setPregnancies] = useLocalState<Pregnancy[]>("pregnancies", starterPregnancies);
  const [appointments, setAppointments] = useLocalState<Appointment[]>("appointments", []);
  const [questions, setQuestions] = useLocalState<Question[]>("questions", starterQuestions);
  const [cycles, setCycles] = useLocalState<Cycle[]>("cycles", []);
  const [activeId, setActiveId] = useLocalState<string>("activePregnancy", "preg-1");
  const [modal, setModal] = useState<"appointment" | "question" | "cycle" | "pregnancy" | null>(null);

  const active = pregnancies.find(p => p.id === activeId) ?? pregnancies[0];
  const ga = gestationalAgeFromLmp(active?.lmp);
  const activeAppointments = appointments
    .filter(a => a.pregnancyId === active?.id)
    .sort((a,b) => a.date.localeCompare(b.date));
  const upcoming = activeAppointments.filter(a => !a.completed && a.date >= new Date().toISOString().slice(0,10))[0];
  const openQuestions = questions.filter(q => q.pregnancyId === active?.id && !q.answered);

  function updateActive(patch: Partial<Pregnancy>) {
    if (!active) return;
    setPregnancies(prev => prev.map(p => p.id === active.id ? {...p, ...patch} : p));
  }

  if (!active) return null;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandIcon"><Baby size={19}/></div>
          <div><strong>Pregnancy Log</strong><span>private timeline</span></div>
        </div>

        <nav>
          <a className="nav active" href="#overview"><HeartPulse size={17}/> Overview</a>
          <a className="nav" href="#appointments"><CalendarDays size={17}/> Appointments</a>
          <a className="nav" href="#questions"><CircleHelp size={17}/> Doctor Questions</a>
          <a className="nav" href="#cycles"><Sparkles size={17}/> Cycles</a>
        </nav>

        <div className="sideSection">
          <div className="sideTitle">TIMELINES</div>
          {pregnancies.map(p => (
            <button
              className={"timelineButton " + (p.id === active.id ? "selected" : "")}
              key={p.id}
              onClick={() => setActiveId(p.id)}
            >
              <span>{p.label}</span><small>{p.status}</small>
            </button>
          ))}
          <button className="ghost full" onClick={() => setModal("pregnancy")}><Plus size={15}/> New timeline</button>
        </div>
      </aside>

      <section className="content" id="overview">
        <header>
          <div>
            <div className="eyebrow">PREGNANCY DASHBOARD</div>
            <h1>{active.label || "Pregnancy"}</h1>
            <p>Appointments, cycles, questions, and week-by-week context in one place.</p>
          </div>
          <button className="primary" onClick={() => setModal("appointment")}><Plus size={17}/> Add appointment</button>
        </header>

        <div className="heroGrid">
          <article className="heroCard weekCard">
            <div className="cardLabel">CURRENT GESTATIONAL AGE</div>
            <div className="weekValue">{ga ? `${ga.weeks}w ${ga.days}d` : "Add LMP"}</div>
            <div className="muted">
              {active.dueDate ? `Estimated due date ${formatDate(active.dueDate)}` : "Enter your LMP to calculate week + due date"}
            </div>
            <div className="inlineFields">
              <label>
                Last menstrual period
                <input
                  type="date"
                  value={active.lmp || ""}
                  onChange={e => {
                    const lmp = e.target.value;
                    updateActive({ lmp, dueDate: dueDateFromLmp(lmp) });
                  }}
                />
              </label>
              <label>
                Estimated due date
                <input
                  type="date"
                  value={active.dueDate || ""}
                  onChange={e => updateActive({dueDate:e.target.value})}
                />
              </label>
            </div>
          </article>

          <article className="statCard">
            <div className="iconBubble"><CalendarDays size={18}/></div>
            <span>Next appointment</span>
            <strong>{upcoming ? formatDate(upcoming.date) : "None scheduled"}</strong>
            <small>{upcoming?.type || "Add your first visit"}</small>
          </article>

          <article className="statCard">
            <div className="iconBubble"><CircleHelp size={18}/></div>
            <span>Open questions</span>
            <strong>{openQuestions.length}</strong>
            <small>{openQuestions.filter(q => q.priority === "important").length} marked important</small>
          </article>
        </div>

        <section className="section" id="appointments">
          <div className="sectionHead">
            <div><div className="eyebrow">CARE TIMELINE</div><h2>Appointments</h2></div>
            <button className="ghost" onClick={() => setModal("appointment")}><Plus size={16}/> Add</button>
          </div>

          {activeAppointments.length ? (
            <div className="listCard">
              {activeAppointments.map(a => (
                <div className="row" key={a.id}>
                  <div className={"dateBadge " + (a.completed ? "done" : "")}>
                    <b>{new Date(`${a.date}T12:00:00`).toLocaleDateString("en-US",{month:"short"}).toUpperCase()}</b>
                    <strong>{new Date(`${a.date}T12:00:00`).getDate()}</strong>
                  </div>
                  <div className="grow">
                    <strong>{a.type}</strong>
                    <span>{[a.provider, a.time, a.location].filter(Boolean).join(" • ") || "Details not added"}</span>
                  </div>
                  <label className="check">
                    <input type="checkbox" checked={!!a.completed} onChange={() => setAppointments(prev => prev.map(x => x.id === a.id ? {...x, completed: !x.completed}:x))}/>
                    done
                  </label>
                </div>
              ))}
            </div>
          ) : <Empty text="No appointments yet." action="Add your first appointment" onClick={() => setModal("appointment")}/>}
        </section>

        <section className="section" id="questions">
          <div className="sectionHead">
            <div><div className="eyebrow">VISIT PREP</div><h2>Questions for the doctor</h2></div>
            <button className="ghost" onClick={() => setModal("question")}><Plus size={16}/> Add</button>
          </div>

          <div className="questionGrid">
            {questions.filter(q => q.pregnancyId === active.id).map(q => (
              <article className={"questionCard " + (q.answered ? "answered" : "")} key={q.id}>
                <div className="questionMeta">
                  <span className="pill">{q.category}</span>
                  {q.priority === "important" && <span className="important">important</span>}
                </div>
                <p>{q.text}</p>
                {q.answer && <div className="answer"><b>Answer:</b> {q.answer}</div>}
                <button className="textButton" onClick={() => {
                  const answer = prompt("Add the doctor's answer (leave blank to just mark answered):", q.answer || "");
                  if (answer !== null) setQuestions(prev => prev.map(x => x.id === q.id ? {...x, answered:true, answer}:x));
                }}>{q.answered ? "Edit answer" : "Mark answered"} <ChevronRight size={14}/></button>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="cycles">
          <div className="sectionHead">
            <div><div className="eyebrow">TTC HISTORY</div><h2>Cycles</h2></div>
            <button className="ghost" onClick={() => setModal("cycle")}><Plus size={16}/> Log cycle</button>
          </div>
          {cycles.length ? (
            <div className="listCard">
              {[...cycles].sort((a,b)=>b.startDate.localeCompare(a.startDate)).map(c => (
                <div className="row" key={c.id}>
                  <div className="iconBubble"><Clock3 size={18}/></div>
                  <div className="grow">
                    <strong>Cycle starting {formatDate(c.startDate)}</strong>
                    <span>
                      {[
                        c.endDate && `ended ${formatDate(c.endDate)}`,
                        c.ovulationDate && `ovulation ${formatDate(c.ovulationDate)}`,
                        c.positiveTestDate && `positive test ${formatDate(c.positiveTestDate)}`
                      ].filter(Boolean).join(" • ") || "No additional dates logged"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty text="No cycles logged yet." action="Log a cycle" onClick={() => setModal("cycle")}/>}
        </section>
      </section>

      {modal && (
        <Modal title={{
          appointment:"Add appointment",
          question:"Add doctor question",
          cycle:"Log cycle",
          pregnancy:"New pregnancy / TTC timeline"
        }[modal]} onClose={() => setModal(null)}>
          {modal === "appointment" && <AppointmentForm pregnancyId={active.id} onSave={a => {setAppointments(p=>[...p,a]);setModal(null)}}/>}
          {modal === "question" && <QuestionForm pregnancyId={active.id} onSave={q => {setQuestions(p=>[...p,q]);setModal(null)}}/>}
          {modal === "cycle" && <CycleForm onSave={c => {setCycles(p=>[...p,c]);setModal(null)}}/>}
          {modal === "pregnancy" && <PregnancyForm onSave={p => {setPregnancies(x=>[...x,p]);setActiveId(p.id);setModal(null)}}/>}
        </Modal>
      )}
    </main>
  );
}

function Empty({text, action, onClick}:{text:string;action:string;onClick:()=>void}) {
  return <div className="empty"><ClipboardList size={28}/><p>{text}</p><button className="textButton" onClick={onClick}>{action} <ChevronRight size={14}/></button></div>;
}

function Modal({title, children, onClose}:{title:string;children:React.ReactNode;onClose:()=>void}) {
  return <div className="modalBackdrop" onMouseDown={onClose}>
    <div className="modal" onMouseDown={e=>e.stopPropagation()}>
      <div className="modalHead"><h3>{title}</h3><button className="iconButton" onClick={onClose}><X size={18}/></button></div>
      {children}
    </div>
  </div>;
}

function AppointmentForm({pregnancyId,onSave}:{pregnancyId:string;onSave:(a:Appointment)=>void}) {
  const [date,setDate]=useState("");
  const [time,setTime]=useState("");
  const [type,setType]=useState("Prenatal visit");
  const [provider,setProvider]=useState("");
  const [location,setLocation]=useState("");
  return <form onSubmit={e=>{e.preventDefault();onSave({id:crypto.randomUUID(),pregnancyId,date,time,type,provider,location})}} className="form">
    <label>Date<input required type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
    <label>Time<input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label>
    <label>Visit type<input value={type} onChange={e=>setType(e.target.value)} placeholder="First prenatal, ultrasound, lab..."/></label>
    <label>Provider<input value={provider} onChange={e=>setProvider(e.target.value)} placeholder="Doctor / midwife"/></label>
    <label>Location<input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Clinic or hospital"/></label>
    <button className="primary" type="submit">Save appointment</button>
  </form>;
}

function QuestionForm({pregnancyId,onSave}:{pregnancyId:string;onSave:(q:Question)=>void}) {
  const [text,setText]=useState("");
  const [category,setCategory]=useState<Question["category"]>("appointment");
  const [priority,setPriority]=useState<Question["priority"]>("normal");
  return <form onSubmit={e=>{e.preventDefault();onSave({id:crypto.randomUUID(),pregnancyId,text,category,priority})}} className="form">
    <label>Question<textarea required value={text} onChange={e=>setText(e.target.value)} placeholder="What do I want to remember to ask?"/></label>
    <label>Category<select value={category} onChange={e=>setCategory(e.target.value as Question["category"])}>
      <option value="appointment">appointment</option><option value="symptoms">symptoms</option><option value="exercise">exercise</option>
      <option value="medications">medications</option><option value="testing">testing</option><option value="delivery">delivery</option><option value="other">other</option>
    </select></label>
    <label>Priority<select value={priority} onChange={e=>setPriority(e.target.value as Question["priority"])}>
      <option value="normal">normal</option><option value="important">important</option>
    </select></label>
    <button className="primary" type="submit">Save question</button>
  </form>;
}

function CycleForm({onSave}:{onSave:(c:Cycle)=>void}) {
  const [startDate,setStartDate]=useState("");
  const [endDate,setEndDate]=useState("");
  const [ovulationDate,setOvulationDate]=useState("");
  const [positiveTestDate,setPositiveTestDate]=useState("");
  return <form onSubmit={e=>{e.preventDefault();onSave({id:crypto.randomUUID(),startDate,endDate,ovulationDate,positiveTestDate})}} className="form">
    <label>Cycle start<input required type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}/></label>
    <label>Cycle end<input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}/></label>
    <label>Ovulation date<input type="date" value={ovulationDate} onChange={e=>setOvulationDate(e.target.value)}/></label>
    <label>Positive test date<input type="date" value={positiveTestDate} onChange={e=>setPositiveTestDate(e.target.value)}/></label>
    <button className="primary" type="submit">Save cycle</button>
  </form>;
}

function PregnancyForm({onSave}:{onSave:(p:Pregnancy)=>void}) {
  const [label,setLabel]=useState("");
  const [status,setStatus]=useState<Pregnancy["status"]>("trying");
  const [lmp,setLmp]=useState("");
  return <form onSubmit={e=>{e.preventDefault();onSave({id:crypto.randomUUID(),label:label || "Timeline",status,lmp,dueDate:dueDateFromLmp(lmp)})}} className="form">
    <label>Name<input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Pregnancy 2, TTC 2027..."/></label>
    <label>Status<select value={status} onChange={e=>setStatus(e.target.value as Pregnancy["status"])}>
      <option value="trying">trying</option><option value="pregnant">pregnant</option><option value="loss">loss</option><option value="postpartum">postpartum</option>
    </select></label>
    <label>LMP, if known<input type="date" value={lmp} onChange={e=>setLmp(e.target.value)}/></label>
    <button className="primary" type="submit">Create timeline</button>
  </form>;
}
