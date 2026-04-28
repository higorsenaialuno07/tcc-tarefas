import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Chart from '../components/Chart'

function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Média')
  const [date, setDate] = useState('')
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) navigate('/')
    }
    getUser()
  }, [navigate])

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*')
    setTasks(data || [])
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  async function addTask() {
    if (!title) return

    await supabase.from('tasks').insert([
      {
        title,
        status: false,
        priority,
        due_date: date
      }
    ])

    setTitle('')
    setDate('')
    fetchTasks()
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  async function toggleTask(id, status) {
    await supabase.from('tasks')
      .update({ status: !status })
      .eq('id', id)

    fetchTasks()
  }

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
              Total: {tasks.length}
            </div>

            <div className="summary-card">
              Concluídas: {tasks.filter(t => t.status).length}
            </div>

            <div className="summary-card">
              Pendentes: {tasks.filter(t => !t.status).length}
            </div>
          </div>

          {/* FILTROS */}
          <div className="filters-bar">
            <button onClick={() => setFilter('all')}>Todas</button>
            <button onClick={() => setFilter('done')}>Concluídas</button>
            <button onClick={() => setFilter('pending')}>Pendentes</button>
          </div>

          {/* GRÁFICO */}
          <div className="chart-box">
            <Chart tasks={tasks} />
          </div>

          {/* FORM */}
          <div className="task-form">

            <input
              type="text"
              placeholder="Nova tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>Média</option>
              <option>Alta</option>
              <option>Baixa</option>
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button onClick={addTask}>Adicionar</button>
          </div>

          {/* LISTA */}
          <div className="task-list">

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

                  <small>{task.due_date}</small>

                  <button onClick={() => deleteTask(task.id)}>
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