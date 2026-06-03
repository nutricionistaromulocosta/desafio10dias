import { useState, useRef } from "react";

const HABITS = [
  { id: "treino",   label: "Treino",          desc: "Musculacao ou treino de forca",      points: 10, icon: "🏋️" },
  { id: "cardio",   label: "Cardio",           desc: "Corrida, bike, caminhada, natacao",  points: 10, icon: "🏃" },
  { id: "alcool",   label: "Sem Alcool",       desc: "Zero bebida alcoolica no dia",       points: 10, icon: "🚫", noPhoto: true },
  { id: "doce",     label: "Sem Doce",         desc: "Sem acucar, doces ou sobremesas",    points: 10, icon: "🍬", noPhoto: true },
  { id: "vegetais", label: "Vegetais",         desc: "Pelo menos 3 porcoes de vegetais",  points: 5,  icon: "🥦" },
  { id: "frutas",   label: "Frutas",           desc: "Pelo menos 2 porcoes de frutas",    points: 5,  icon: "🍎" },
  { id: "agua",     label: "Agua",             desc: "Pelo menos 2 litros no dia",        points: 5,  icon: "💧" },
  { id: "insta",    label: "Post no Instagram",desc: "Postou e marcou no @desafio",       points: 5,  icon: "📸" },
];

const DAYS = Array.from({ length: 10 }, (_, i) => i + 1);
const MAX_DAY = HABITS.reduce((s, h) => s + h.points, 0);
const MAX_TOTAL = MAX_DAY * 10;
const STORAGE_KEY = "desafio10d_v2";
const START_DATE = new Date(2026, 5, 10);
const ADMIN_USER = "rithelle";
const ADMIN_PASS = "admin123";

function getCurrentChallengeDay() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 0;
  if (diff >= 10) return 11;
  return diff + 1;
}

function isDayLocked(d) { return d !== getCurrentChallengeDay(); }

function load() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : { patients: {}, me: null }; }
  catch { return { patients: {}, me: null }; }
}
function save(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

function calcScore(records) {
  if (!records) return 0;
  return Object.values(records).reduce((sum, day) =>
    sum + HABITS.reduce((s, h) => s + (day[h.id]?.done ? h.points : 0), 0), 0);
}

function medal(i) { return ["🥇","🥈","🥉"][i] ?? `${i+1}o`; }

// ── HABIT CARD (read-only for admin) ─────────────────────
function HabitCard({ habit, entry, onToggle, onPhoto, onRemovePhoto, locked, readOnly }) {
  const fileRef = useRef();
  const done = !!entry?.done;
  const photo = entry?.photo || null;

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onPhoto(habit.id, ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div style={{ background: locked ? "#F5F5F5" : done ? "#F5EDE4" : "#fff", border: `1.5px solid ${locked ? "#E0E0E0" : done ? "#B8895A" : "#E0E0E0"}`, borderRadius: 14, padding: "14px 14px 12px", marginBottom: 10, opacity: locked ? 0.6 : 1, transition: "all 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>{habit.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Georgia', serif" }}>{habit.label}</div>
          <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>{habit.desc}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: done ? "#6B3A22" : "#aaa" }}>+{habit.points}pts</span>
          <button
            onClick={() => !locked && !readOnly && onToggle(habit.id)}
            disabled={locked || readOnly}
            style={{ width: 32, height: 32, borderRadius: "50%", background: done ? "#6B3A22" : "#fff", border: `2px solid ${done ? "#6B3A22" : "#ccc"}`, color: done ? "#fff" : "#ccc", fontSize: 16, cursor: (locked || readOnly) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}
          >{done ? "✓" : "○"}</button>
        </div>
      </div>

      {!habit.noPhoto && !locked && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, paddingTop: 10, borderTop: "1px solid #eee" }}>
          {!readOnly && <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />}
          {photo
            ? <div style={{ position: "relative", width: 56, height: 56, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                <img src={photo} alt="comprovante" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {!readOnly && <button onClick={() => onRemovePhoto(habit.id)} style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>x</button>}
              </div>
            : null}
          {!readOnly && (
            <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1.5px dashed #ccc", background: "transparent", color: "#888", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              📸 {photo ? "Trocar foto" : "Registrar foto"}
            </button>
          )}
          {photo && <span style={{ fontSize: 11, color: "#B8895A" }}>✓ Foto registrada</span>}
          {!photo && readOnly && <span style={{ fontSize: 11, color: "#ccc" }}>Sem foto</span>}
        </div>
      )}

      {locked && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #eee", fontSize: 11, color: "#aaa", textAlign: "center" }}>
          🔒 Check-in disponivel apenas no dia correspondente
        </div>
      )}
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────
function LoginScreen({ onLoginPatient, onLoginAdmin }) {
  const [name, setName] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");

  function handlePatient() { const n = name.trim(); if (n) onLoginPatient(n); }
  function handleAdmin() {
    if (adminUser === ADMIN_USER && adminPass === ADMIN_PASS) onLoginAdmin();
    else setAdminError("Usuario ou senha incorretos.");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAF5F0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "44px 36px", textAlign: "center", maxWidth: 360, width: "90%", boxShadow: "0 2px 24px rgba(0,0,0,0.07)" }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🌿</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#3B2314", margin: "0 0 6px" }}>Desafio Alvra - 10 Dias</h1>

        {!showAdmin ? (
          <>
            <p style={{ color: "#888", fontSize: 14, margin: "0 0 24px" }}>Digite seu nome para entrar</p>
            <input style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8D5C0", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12, color: "#1a1a1a" }} placeholder="Seu nome ou apelido" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handlePatient()} autoFocus />
            <button onClick={handlePatient} style={{ width: "100%", padding: 13, borderRadius: 10, background: "#6B3A22", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", marginBottom: 16 }}>Entrar →</button>
            <button onClick={() => setShowAdmin(true)} style={{ background: "none", border: "none", color: "#C9A87D", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Acesso administrador</button>
          </>
        ) : (
          <>
            <p style={{ color: "#888", fontSize: 14, margin: "0 0 20px" }}>Login de administrador</p>
            <input style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8D5C0", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10, color: "#1a1a1a" }} placeholder="Usuario" value={adminUser} onChange={e => { setAdminUser(e.target.value); setAdminError(""); }} />
            <input type="password" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8D5C0", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10, color: "#1a1a1a" }} placeholder="Senha" value={adminPass} onChange={e => { setAdminPass(e.target.value); setAdminError(""); }} onKeyDown={e => e.key === "Enter" && handleAdmin()} />
            {adminError && <p style={{ color: "#c0392b", fontSize: 12, marginBottom: 8 }}>{adminError}</p>}
            <button onClick={handleAdmin} style={{ width: "100%", padding: 13, borderRadius: 10, background: "#3B2314", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", marginBottom: 12 }}>Entrar como Admin</button>
            <button onClick={() => { setShowAdmin(false); setAdminError(""); }} style={{ background: "none", border: "none", color: "#C9A87D", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>← Voltar</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── ADMIN SCREEN ──────────────────────────────────────────
function AdminScreen({ data, onLogout, onDeletePatient }) {
  const [tab, setTab] = useState("ranking");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const currentDay = getCurrentChallengeDay();

  const ranking = Object.entries(data.patients)
    .map(([name, rec]) => ({ name, score: calcScore(rec) }))
    .sort((a, b) => b.score - a.score);

  const patientNames = Object.keys(data.patients);
  const patientRecords = selectedPatient ? (data.patients[selectedPatient] || {}) : {};
  const dayKey = `day${selectedDay}`;
  const dayData = patientRecords[dayKey] || {};
  const dayScore = HABITS.reduce((s, h) => s + (dayData[h.id]?.done ? h.points : 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF5F0", fontFamily: "'Georgia', serif", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "#3B2314", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>👑</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Admin — Desafio Alvra</span>
        </div>
        <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#ccc", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Sair</button>
      </div>

      {/* Status */}
      <div style={{ background: "#4A2E1A", padding: "12px 18px", color: "#C9A87D", fontSize: 12, textAlign: "center" }}>
        {currentDay === 0 && "⏳ Desafio ainda nao iniciou — inicio: 10/06/2026"}
        {currentDay === 11 && "🏁 Desafio encerrado — Ranking final"}
        {currentDay >= 1 && currentDay <= 10 && `📅 Dia ${currentDay} de 10 em andamento — ${ranking.length} participante(s)`}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "1.5px solid #F5EDE4" }}>
        {[["ranking","Ranking"],["checkin","Check-in"],["pontos","Pontuacao"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "12px 0", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 700 : 500, fontFamily: "inherit", color: tab === id ? "#3B2314" : "#888", borderBottom: tab === id ? "2.5px solid #6B3A22" : "2.5px solid transparent" }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: "16px 14px 60px" }}>

        {/* RANKING */}
        {tab === "ranking" && <>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#3B2314", marginBottom: 14 }}>Ranking Completo</h2>
          {ranking.length === 0 && <p style={{ color: "#aaa", textAlign: "center", padding: 32 }}>Nenhum participante ainda.</p>}
          {ranking.map((r, i) => {
            const records = data.patients[r.name] || {};
            const daysWithActivity = Object.values(records).filter(d => HABITS.reduce((s, h) => s + (d[h.id]?.done ? h.points : 0), 0) > 0).length;
            return (
              <div key={r.name} style={{ background: "#fff", border: "1.5px solid #E8D5C0", borderRadius: 14, padding: "14px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 24, minWidth: 36, textAlign: "center" }}>{medal(i)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#3B2314" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{daysWithActivity} dia(s) com atividade</div>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#6B3A22" }}>{r.score} pts</span>
                  <button
                    onClick={() => setConfirmDelete(r.name)}
                    style={{ background: "none", border: "1.5px solid #e0c0b0", borderRadius: 7, color: "#c0392b", fontSize: 14, cursor: "pointer", padding: "4px 8px", flexShrink: 0 }}
                    title="Excluir participante"
                  >🗑️</button>
                </div>
                <div style={{ height: 6, background: "#F5EDE4", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${(r.score / MAX_TOTAL) * 100}%`, background: "#6B3A22", borderRadius: 99 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#B8895A" }}>
                  <span>{Math.round((r.score / MAX_TOTAL) * 100)}% do total</span>
                  <span>{r.score} / {MAX_TOTAL} pts</span>
                </div>
              </div>
            );
          })}
          <div style={{ background: "#3B2314", borderRadius: 14, padding: 16, marginTop: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#C9A87D", marginBottom: 12 }}>🏆 Premiacao Final</div>
            {[["🥇 1° lugar","Grande premio"],["🥈 2° lugar","2° premio"],["🥉 3° lugar","3° premio"]].map(([pos, prize]) => (
              <div key={pos} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: "#fff" }}>
                <span>{pos}</span><span style={{ color: "#C9A87D" }}>{prize}</span>
              </div>
            ))}
          </div>

          {/* Confirm delete modal */}
          {confirmDelete && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", maxWidth: 300, width: "90%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#3B2314", marginBottom: 8 }}>Excluir participante?</div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Todos os dados de <strong>{confirmDelete}</strong> serão removidos permanentemente.</div>
                <button
                  onClick={() => { onDeletePatient(confirmDelete); setConfirmDelete(null); setSelectedPatient(null); }}
                  style={{ width: "100%", padding: "11px", borderRadius: 10, background: "#c0392b", color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}
                >Sim, excluir</button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  style={{ width: "100%", padding: "11px", borderRadius: 10, background: "#F5EDE4", color: "#3B2314", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}
                >Cancelar</button>
              </div>
            </div>
          )}
        </>}

        {/* CHECK-IN DO PACIENTE */}
        {tab === "checkin" && <>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#3B2314", marginBottom: 14 }}>Check-in por Paciente</h2>

          {/* Selecionar paciente */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Selecione o paciente:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {patientNames.length === 0 && <p style={{ color: "#aaa", fontSize: 13 }}>Nenhum paciente ainda.</p>}
              {patientNames.map(n => (
                <button key={n} onClick={() => setSelectedPatient(n)} style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${selectedPatient === n ? "#6B3A22" : "#E8D5C0"}`, background: selectedPatient === n ? "#6B3A22" : "#fff", color: selectedPatient === n ? "#fff" : "#3B2314", fontSize: 13, fontWeight: selectedPatient === n ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>{n}</button>
              ))}
            </div>
          </div>

          {selectedPatient && <>
            {/* Pontuacao total do paciente */}
            <div style={{ background: "#4A2E1A", borderRadius: 12, padding: "12px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#C9A87D", fontSize: 13 }}>{selectedPatient}</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{calcScore(patientRecords)} / {MAX_TOTAL} pts</span>
            </div>

            {/* Seletor de dia */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, marginBottom: 14 }}>
              {DAYS.map(d => {
                const dk = `day${d}`;
                const dd = patientRecords[dk] || {};
                const ds = HABITS.reduce((s, h) => s + (dd[h.id]?.done ? h.points : 0), 0);
                const active = d === selectedDay;
                return (
                  <button key={d} onClick={() => setSelectedDay(d)} style={{ minWidth: 44, height: 52, borderRadius: 10, flexShrink: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, border: active ? "2px solid #6B3A22" : "1.5px solid #E8D5C0", background: active ? "#6B3A22" : ds > 0 ? "#F5EDE4" : "#fff" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: active ? "#fff" : "#3B2314" }}>{d}</span>
                    {ds > 0 && <span style={{ fontSize: 9, color: active ? "#D4B896" : "#B8895A" }}>{ds}pts</span>}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#3B2314" }}>Dia {selectedDay}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#B8895A" }}>{dayScore} / {MAX_DAY} pts</span>
            </div>

            {HABITS.map(h => (
              <HabitCard key={h.id} habit={h} entry={dayData[h.id]} onToggle={() => {}} onPhoto={() => {}} onRemovePhoto={() => {}} locked={false} readOnly={true} />
            ))}
          </>}
        </>}

        {/* TABELA DE PONTOS */}
        {tab === "pontos" && <>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#3B2314", marginBottom: 14 }}>Tabela de Pontos</h2>
          {HABITS.map(h => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "#fff", border: "1.5px solid #F5EDE4", marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{h.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{h.label}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{h.desc}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6B3A22", background: "#F5EDE4", padding: "4px 10px", borderRadius: 99 }}>{h.points} pts/dia</span>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, background: "#3B2314", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#C9A87D", fontSize: 13 }}>Maximo por dia</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>{MAX_DAY} pts</span>
          </div>
          <div style={{ marginTop: 6, padding: "10px 14px", borderRadius: 10, background: "#4A2E1A", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#C9A87D", fontSize: 13 }}>Maximo em 10 dias</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>{MAX_TOTAL} pts</span>
          </div>
        </>}

      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(load);
  const [isAdmin, setIsAdmin] = useState(false);
  const currentDay = getCurrentChallengeDay();
  const [day, setDay] = useState(() => currentDay >= 1 && currentDay <= 10 ? currentDay : 1);
  const [tab, setTab] = useState("checkin");

  const me = data.me;
  const myRecords = data.patients[me] || {};

  function persist(next) { setData(next); save(next); }
  function loginPatient(name) { persist({ ...data, me: name, patients: { ...data.patients, [name]: data.patients[name] || {} } }); }
  function loginAdmin() { setIsAdmin(true); }
  function logout() { setIsAdmin(false); persist({ ...data, me: null }); }

  function deletePatient(name) {
    const { [name]: _, ...rest } = data.patients;
    persist({ ...data, patients: rest });
  }

  function toggle(habitId) {
    if (isDayLocked(day)) return;
    const dk = `day${day}`;
    const prev = myRecords[dk]?.[habitId] || {};
    persist({ ...data, patients: { ...data.patients, [me]: { ...myRecords, [dk]: { ...myRecords[dk], [habitId]: { ...prev, done: !prev.done } } } } });
  }

  function setPhoto(habitId, src) {
    if (isDayLocked(day)) return;
    const dk = `day${day}`;
    const prev = myRecords[dk]?.[habitId] || {};
    persist({ ...data, patients: { ...data.patients, [me]: { ...myRecords, [dk]: { ...myRecords[dk], [habitId]: { ...prev, photo: src } } } } });
  }

  function removePhoto(habitId) {
    if (isDayLocked(day)) return;
    const dk = `day${day}`;
    const prev = myRecords[dk]?.[habitId] || {};
    const { photo, ...rest } = prev;
    persist({ ...data, patients: { ...data.patients, [me]: { ...myRecords, [dk]: { ...myRecords[dk], [habitId]: rest } } } });
  }

  if (!me && !isAdmin) return <LoginScreen onLoginPatient={loginPatient} onLoginAdmin={loginAdmin} />;
  if (isAdmin) return <AdminScreen data={data} onLogout={logout} onDeletePatient={deletePatient} />;

  const myScore = calcScore(myRecords);
  const dayKey = `day${day}`;
  const dayData = myRecords[dayKey] || {};
  const dayScore = HABITS.reduce((s, h) => s + (dayData[h.id]?.done ? h.points : 0), 0);
  const locked = isDayLocked(day);
  const notStarted = currentDay === 0;
  const finished = currentDay === 11;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF5F0", fontFamily: "'Georgia', serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: "#3B2314", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌿</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Desafio Alvra - 10 Dias</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#C9A87D", fontSize: 13 }}>{me}</span>
          <button onClick={logout} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#ccc", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Sair</button>
        </div>
      </div>

      <div style={{ background: "#4A2E1A", padding: "18px 18px 14px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <span style={{ fontSize: 34 }}>🌿</span>
          <div>
            <div style={{ fontSize: 11, color: "#C9A87D", textTransform: "uppercase", letterSpacing: 1 }}>Minha Pontuacao</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{myScore} <span style={{ fontSize: 14, color: "#C9A87D", fontWeight: 400 }}>/ {MAX_TOTAL} pts</span></div>
          </div>
        </div>
        <div style={{ height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 99 }}>
          <div style={{ height: "100%", width: `${(myScore / MAX_TOTAL) * 100}%`, background: "#C9A87D", borderRadius: 99, transition: "width 0.4s" }} />
        </div>
        {notStarted && <div style={{ marginTop: 10, fontSize: 12, color: "#D4B896", textAlign: "center" }}>⏳ O desafio comeca em 10/06/2026</div>}
        {finished && <div style={{ marginTop: 10, fontSize: 12, color: "#D4B896", textAlign: "center" }}>🏁 Desafio encerrado!</div>}
        {!notStarted && !finished && <div style={{ marginTop: 10, fontSize: 12, color: "#D4B896", textAlign: "center" }}>📅 Dia {currentDay} de 10 em andamento</div>}
      </div>

      <div style={{ display: "flex", background: "#fff", borderBottom: "1.5px solid #F5EDE4" }}>
        {[["checkin","Check-in"],["pontos","Pontuacao"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "12px 0", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 700 : 500, fontFamily: "inherit", color: tab === id ? "#3B2314" : "#888", borderBottom: tab === id ? "2.5px solid #6B3A22" : "2.5px solid transparent" }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: "16px 14px 60px" }}>
        {tab === "checkin" && <>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, marginBottom: 14 }}>
            {DAYS.map(d => {
              const dk = `day${d}`; const dd = myRecords[dk] || {};
              const ds = HABITS.reduce((s, h) => s + (dd[h.id]?.done ? h.points : 0), 0);
              const active = d === day; const isLocked = isDayLocked(d);
              return (
                <button key={d} onClick={() => setDay(d)} style={{ minWidth: 44, height: 52, borderRadius: 10, flexShrink: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, border: active ? "2px solid #6B3A22" : "1.5px solid #E8D5C0", background: active ? "#6B3A22" : ds > 0 ? "#F5EDE4" : isLocked ? "#F5F5F5" : "#fff", opacity: isLocked && !active ? 0.5 : 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: active ? "#fff" : isLocked ? "#aaa" : "#3B2314" }}>{d}</span>
                  {ds > 0 && <span style={{ fontSize: 9, color: active ? "#D4B896" : "#B8895A" }}>{ds}pts</span>}
                  {isLocked && ds === 0 && <span style={{ fontSize: 9 }}>🔒</span>}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#3B2314" }}>Dia {day} {locked ? "🔒" : ""}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#B8895A" }}>{dayScore} / {MAX_DAY} pts</span>
          </div>
          {HABITS.map(h => (
            <HabitCard key={h.id} habit={h} entry={dayData[h.id]} onToggle={toggle} onPhoto={setPhoto} onRemovePhoto={removePhoto} locked={locked} readOnly={false} />
          ))}
        </>}

        {tab === "pontos" && <>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#3B2314", marginBottom: 14 }}>Tabela de Pontos</h2>
          {HABITS.map(h => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "#fff", border: "1.5px solid #F5EDE4", marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{h.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{h.label}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{h.desc}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6B3A22", background: "#F5EDE4", padding: "4px 10px", borderRadius: 99 }}>{h.points} pts/dia</span>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, background: "#3B2314", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#C9A87D", fontSize: 13 }}>Maximo por dia</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>{MAX_DAY} pts</span>
          </div>
          <div style={{ marginTop: 6, padding: "10px 14px", borderRadius: 10, background: "#4A2E1A", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#C9A87D", fontSize: 13 }}>Maximo em 10 dias</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>{MAX_TOTAL} pts</span>
          </div>
        </>}
      </div>
    </div>
  );
}
