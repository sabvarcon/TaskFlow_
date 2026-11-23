import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './styles.css';

const api = async (path, options = {}) => {
  const token = localStorage.getItem('taskflow_token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const response = await fetch(`/api${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.mensaje || 'Ocurrió un error al comunicarse con el servidor.');
  return data;
};

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const submit = async e => { e.preventDefault(); setBusy(true); setMessage(''); try {
    if (mode === 'register') { await api('/auth/register', { method: 'POST', body: JSON.stringify(form) }); setMessage('Cuenta creada. Ahora inicia sesión.'); setMode('login'); }
    else { const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: form.email, password: form.password }) }); localStorage.setItem('taskflow_token', data.token); onLogin(data.usuario); }
  } catch (err) { setMessage(err.message); } finally { setBusy(false); } };
  return <main className="auth-wrap"><section className="auth-card"><div className="logo"><span>✓</span><h1>TaskFlow</h1></div><p className="muted center">Organiza tus actividades y alcanza tus objetivos.</p><div className="tabs"><button className={mode==='login'?'selected':''} onClick={()=>{setMode('login');setMessage('')}}>Iniciar sesión</button><button className={mode==='register'?'selected':''} onClick={()=>{setMode('register');setMessage('')}}>Registrarse</button></div><form onSubmit={submit}><h2>{mode==='login'?'Bienvenido de nuevo':'Crea tu cuenta'}</h2>{mode==='register'&&<label>Nombre<input required minLength="2" maxLength="80" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>}<label>Correo electrónico<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Contraseña<input type="password" required minLength="8" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><button className="primary" disabled={busy}>{busy?'Procesando…':mode==='login'?'Iniciar sesión':'Crear cuenta'}</button></form>{message&&<p className="notice">{message}</p>}</section></main>;
}

function Dashboard({ user, onLogout }) {
  const [tasks,setTasks]=useState([]), [page,setPage]=useState(1), [pagination,setPagination]=useState({totalPages:1,total:0}), [search,setSearch]=useState(''), [filter,setFilter]=useState('all');
  const [title,setTitle]=useState(''), [description,setDescription]=useState(''), [editing,setEditing]=useState(null), [message,setMessage]=useState(''), [busy,setBusy]=useState(false);
  const [city,setCity]=useState('Durango'), [weather,setWeather]=useState(null), [weatherMessage,setWeatherMessage]=useState('');
  const [users,setUsers]=useState([]); const [showUsers,setShowUsers]=useState(false);
  const query=useMemo(()=>{const p=new URLSearchParams({page:String(page),limit:'8'});if(search.trim())p.set('search',search.trim());if(filter!=='all')p.set('completed',filter);return p.toString()},[page,search,filter]);
  const load=async()=>{try{const data=await api(`/tasks?${query}`);setTasks(data.tareas||[]);setPagination({...data.pagination,total:data.total||0});}catch(e){setMessage(e.message)}};
  useEffect(()=>{load()},[query]);
  const save=async e=>{e.preventDefault();setBusy(true);setMessage('');try{const payload={title,description};if(editing)await api(`/tasks/${editing}`,{method:'PUT',body:JSON.stringify(payload)});else await api('/tasks',{method:'POST',body:JSON.stringify(payload)});setTitle('');setDescription('');setEditing(null);await load();setMessage(editing?'Tarea actualizada.':'Tarea creada.')}catch(e){setMessage(e.message)}finally{setBusy(false)}};
  const edit=t=>{setEditing(t._id);setTitle(t.title);setDescription(t.description||'');window.scrollTo({top:0,behavior:'smooth'})};
  const toggle=async t=>{try{await api(`/tasks/${t._id}`,{method:'PUT',body:JSON.stringify({completed:!t.completed})});load()}catch(e){setMessage(e.message)}};
  const remove=async id=>{if(!confirm('¿Eliminar esta tarea?'))return;try{await api(`/tasks/${id}`,{method:'DELETE'});load()}catch(e){setMessage(e.message)}};
  const getWeather=async()=>{setWeatherMessage('Consultando…');setWeather(null);try{setWeather(await api(`/weather?city=${encodeURIComponent(city)}`));setWeatherMessage('')}catch(e){setWeatherMessage(e.message)}};
  const loadUsers=async()=>{try{const d=await api('/admin/users');setUsers(d.usuarios||[]);setShowUsers(true)}catch(e){setMessage(e.message)}};
  return <main className="dashboard"><header className="topbar"><div className="logo"><span>✓</span><h1>TaskFlow</h1></div><div className="user-actions"><span>Hola, {user?.name||'usuario'}</span><button className="outline" onClick={onLogout}>Cerrar sesión</button></div></header>
    <section className="intro"><div><p className="eyebrow">TU ESPACIO DE PRODUCTIVIDAD</p><h2>Mis tareas</h2><p className="muted">Organiza y administra tus actividades.</p></div><div className="stat"><strong>{pagination.total||tasks.length}</strong><span>Tareas encontradas</span></div></section>
    <section className="panel"><h3>{editing?'Editar tarea':'Agregar nueva tarea'}</h3><form className="task-form" onSubmit={save}><label>Título<input required maxLength="100" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ej. Terminar mi proyecto"/></label><label>Descripción<textarea maxLength="500" rows="3" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe tu actividad…"/></label><div className="form-actions"><button className="primary" disabled={busy}>{busy?'Guardando…':editing?'Guardar cambios':'Agregar tarea'}</button>{editing&&<button type="button" className="outline" onClick={()=>{setEditing(null);setTitle('');setDescription('')}}>Cancelar</button>}</div></form></section>
    <section className="panel"><div className="section-head"><div><h3>Listado de tareas</h3><p className="muted">Busca, filtra y actualiza tus actividades.</p></div></div><div className="filters"><input type="search" placeholder="Buscar por título…" value={search} onChange={e=>{setPage(1);setSearch(e.target.value)}}/><select value={filter} onChange={e=>{setPage(1);setFilter(e.target.value)}}><option value="all">Todos los estados</option><option value="false">Pendientes</option><option value="true">Completadas</option></select></div><div className="task-list">{tasks.length===0?<p className="empty">No hay tareas para mostrar.</p>:tasks.map(t=><article className={`task ${t.completed?'done':''}`} key={t._id}><button className="check" title="Cambiar estado" onClick={()=>toggle(t)}>{t.completed?'✓':''}</button><div className="task-copy"><strong>{t.title}</strong>{t.description&&<p>{t.description}</p>}<small>{t.completed?'Completada':'Pendiente'}</small></div><div className="task-actions"><button className="outline" onClick={()=>edit(t)}>Editar</button><button className="danger" onClick={()=>remove(t._id)}>Eliminar</button></div></article>)}</div><div className="pagination"><button className="outline" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Anterior</button><span>Página {page} de {Math.max(1,pagination.totalPages||1)}</span><button className="outline" disabled={page>=(pagination.totalPages||1)} onClick={()=>setPage(p=>p+1)}>Siguiente</button></div></section>
    <section className="panel weather"><div><h3>Clima de tu ciudad</h3><p className="muted">Consulta las condiciones actuales.</p></div><div className="weather-form"><input value={city} onChange={e=>setCity(e.target.value)} maxLength="80" placeholder="Nombre de ciudad"/><button className="primary" onClick={getWeather}>Consultar clima</button></div>{weatherMessage&&<p className="notice">{weatherMessage}</p>}{weather&&<div className="weather-result"><strong>{weather.ciudad}, {weather.pais}</strong><span>{Math.round(weather.temperatura)}°C · {weather.descripcion}</span><small>Sensación térmica: {Math.round(weather.sensacion)}°C · Humedad: {weather.humedad}%</small></div>}</section>
    {user?.role==='admin'&&<section className="panel"><div className="section-head"><h3>Administración</h3><button className="outline" onClick={loadUsers}>Ver usuarios</button></div>{showUsers&&<div className="user-list">{users.map(u=><p key={u._id}><strong>{u.name}</strong> · {u.email} · <span>{u.role}</span></p>)}</div>}</section>}
    {message&&<p className="notice">{message}</p>}
    <footer>TaskFlow · Gestión de tareas personales</footer>
  </main>;
}

function App(){const [user,setUser]=useState(null),[checking,setChecking]=useState(true);const navigate=useNavigate();useEffect(()=>{const token=localStorage.getItem('taskflow_token');if(!token){setChecking(false);return;}api('/tasks?limit=1').then(()=>{const stored=localStorage.getItem('taskflow_user');if(stored)setUser(JSON.parse(stored));else setUser({name:'Usuario'});}).catch(()=>localStorage.removeItem('taskflow_token')).finally(()=>setChecking(false));},[]);const login=u=>{localStorage.setItem('taskflow_user',JSON.stringify(u));setUser(u);navigate('/')};const logout=()=>{localStorage.removeItem('taskflow_token');localStorage.removeItem('taskflow_user');setUser(null)};if(checking)return <div className="loading">Cargando TaskFlow…</div>;return <Routes><Route path="/login" element={user?<Navigate to="/"/>:<AuthPage onLogin={login}/>}/><Route path="/" element={user?<Dashboard user={user} onLogout={logout}/>:<Navigate to="/login"/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes>}

createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
