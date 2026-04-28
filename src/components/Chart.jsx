import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

function Chart({ tasks }) {
  const data = [
    {
      name: 'Concluídas',
      valor: tasks.filter(t => t.status).length
    },
    {
      name: 'Pendentes',
      valor: tasks.filter(t => !t.status).length
    }
  ]

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="valor" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Chart