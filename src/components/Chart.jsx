import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
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

  // Cores combinando com o seu sistema (Verde para concluídas, Azul/Cinza para pendentes)
  const COLORS = ['#10b981', '#3b82f6'];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip cursor={{fill: 'transparent'}} />
          <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Chart