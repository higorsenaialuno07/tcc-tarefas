import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

function Products() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  useEffect(() => { fetchProducts() }, [])

  async function handleAddProduct(e) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let imageUrl = ""

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        
        imageUrl = publicUrl
      }

      const { error } = await supabase.from('products').insert([
        { name, price: parseFloat(price), stock: parseInt(stock), image_url: imageUrl, user_id: user.id }
      ])

      if (error) throw error

      setName(''); setPrice(''); setStock(''); setImageFile(null)
      fetchProducts()
      alert("Produto cadastrado com sucesso!")

    } catch (error) {
      alert("Erro: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(product) {
  const confirmDelete = window.confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`);
  
  if (confirmDelete) {
    try {
      // 1. Se o produto tiver imagem, vamos apagá-la do Storage primeiro
      if (product.image_url) {
        // Extraímos o nome do arquivo da URL
        const fileName = product.image_url.split('/').pop();
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase.storage
          .from('product-images')
          .remove([`${user.id}/${fileName}`]);
      }

      // 2. Apagar o produto do Banco de Dados
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      alert("Produto removido!");
      fetchProducts(); // Atualiza a lista automaticamente
    } catch (error) {
      alert("Erro ao excluir: " + error.message);
    }
  }
}


  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-layout">
        <Header />
        <main className="dashboard-content">
          <h2>📦 Gerenciar Produtos</h2>

          {/* FORMULÁRIO - O campo de foto fica aqui */}
          <form className="task-form" onSubmit={handleAddProduct}>
            <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required />
            <input type="number" step="0.01" placeholder="Preço" value={price} onChange={e => setPrice(e.target.value)} required />
            <input type="number" placeholder="Estoque" value={stock} onChange={e => setStock(e.target.value)} required />
            
            <div className="input-group">
              <input 
                type="file" 
                id="foto-produto"
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files[0])} 
                className="file-input-hidden" 
                style={{ display: 'none' }} // Escondemos o padrão
              />
              <label htmlFor="foto-produto" className="custom-file-upload" style={{
                display: 'inline-block',
                padding: '10px',
                background: '#eff6ff',
                border: '1px dashed #3b82f6',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                {imageFile ? `✅ ${imageFile.name}` : "📁 Selecionar Foto"}
              </label>
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Cadastrar'}
            </button>
          </form>

          {/* TABELA - Mostra apenas o resultado */}
          <div className="table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Ações</th>
                  <th>Estoque</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                      ) : (
                        <div style={{ width: '50px', height: '50px', background: '#f0f0f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                      )}
                    </td>
                    <td><strong>{product.name}</strong></td>
                    <td>R$ {product.price.toFixed(2)}</td>
                    <td>{product.stock} un</td>
                    <td>
  <button 
    onClick={() => handleDelete(product)}
    style={{
      backgroundColor: '#ff4d4d',
      color: 'white',
      border: 'none',
      padding: '5px 10px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    }}
  >
    🗑️ Excluir
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Products