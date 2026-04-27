import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*')
    setTasks(data)
  }

  async function addTask() {
    if (!title) return

    await supabase.from('tasks').insert([{ title, status: false }])
    setTitle('')
    fetchTasks()
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  async function toggleTask(id, status) {
    await supabase.from('tasks').update({ status: !status }).eq('id', id)
    fetchTasks()
  }

  useEffect(() => {
    fetchTasks()
  }, [])

 return (
  <div className="container">
    <h2>Minhas Tarefas</h2>

    <div style={{ marginBottom: '15px' }}>
      <input
        placeholder="Nova tarefa"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={addTask}>Adicionar</button>
    </div>

    {tasks.map(task => (
      <div className="task" key={task.id}>
        <span
          onClick={() => toggleTask(task.id, task.status)}
          style={{
            textDecoration: task.status ? 'line-through' : 'none',
            cursor: 'pointer'
          }}
        >
          {task.title}
        </span>

        <button onClick={() => deleteTask(task.id)}>
          Excluir
        </button>
      </div>
    ))}
  </div>
)
}

export default Dashboard