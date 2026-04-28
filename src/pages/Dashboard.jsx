import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Chart from '../components/Chart'

function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [taskTitle, setTaskTitle] = useState("") // Nome único para o input
  const [priority, setPriority] = useState("Média")
  const [dueDate, setDueDate] = useState("")
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  // 1. Verifica se o usuário está logado
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) navigate('/')
    }
    getUser()
  }, [navigate])

  // 2. Carrega as tarefas do banco
  async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
  
  if (error) console.error("Erro ao carregar:", error.message)
  else setTasks(data || [])
}
  useEffect(() => {
    fetchTasks()
  }, [])

  // 3. Adiciona nova tarefa
  async function handleAddTask(e) {
    e.preventDefault();
    if (!taskTitle) return alert("Digite um título!");

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
  .from('tasks')
  .insert([
    { 
      title: taskTitle, 
      user_id: user.id, // O ID que vem do auth.users
      status: false,
      priority: priority,
      due_date: dueDate || null
    }
  ]);
    if (error) {
      alert("Erro ao adicionar: " + error.message);
    } else {
      setTaskTitle(""); 
      setDueDate("");
      fetchTasks(); // Recarrega a lista
    }
  }

  // 4. Deleta tarefa
  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  // 5. Alterna entre concluída/pendente
  async function toggleTask(id, status) {
    await supabase.from('tasks')
      .update({ status: !status })
      .eq('id', id)

    fetchTasks()
  }

  // 6. Lógica de Filtro
  const filteredTasks = tasks.filter(task => {
    if (filter === 'done') return task.status
    if (filter === 'pending') return !task.status
    return true
  })

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-layout">
        <Header />

        <main className="dashboard-content">
          {/* RESUMO */}
          <div className="summary-container">
            <div className="summary-card">
              Total: <strong>{tasks.length}</strong>
            </div>
            <div className="summary-card">
              Concluídas: <strong>{tasks.filter(t => t.status).length}</strong>
            </div>
            <div className="summary-card">
              Pendentes: <strong>{tasks.filter(t => !t.status).length}</strong>
            </div>
          </div>

          {/* FILTROS */}
          <div className="filters-bar">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Todas</button>
            <button className={filter === 'done' ? 'active' : ''} onClick={() => setFilter('done')}>Concluídas</button>
            <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pendentes</button>
          </div>

          {/* GRÁFICO */}
          <div className="chart-box">
            <Chart tasks={tasks} />
          </div>

          {/* FORMULÁRIO */}
          <form className="task-form" onSubmit={handleAddTask}>
            <input 
              type="text" 
              placeholder="Nova tarefa..." 
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>

            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <button type="submit">Adicionar</button>
          </form>

          {/* LISTA DE TAREFAS */}
          <div className="task-list">
            {filteredTasks.length === 0 && <p style={{textAlign: 'center', color: '#667'}}>Nenhuma tarefa encontrada.</p>}
            
            {filteredTasks.map(task => (
              <div className="task-item" key={task.id}>
                <div className="task-main">
                  <input
                    type="checkbox"
                    checked={task.status}
                    onChange={() => toggleTask(task.id, task.status)}
                  />
                  <span className={task.status ? 'done' : ''}>
                    {task.title}
                  </span>
                </div>

                <div className="task-meta">
                  <span className={`badge ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  <small>{task.due_date || 'Sem data'}</small>
                  <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard