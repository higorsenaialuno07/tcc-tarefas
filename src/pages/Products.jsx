import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../styles/Products.css'

function Products() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
 

// 🔄 Buscar produtos
async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
  } else {
    setProducts(data || [])
  }
}

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchProducts()
}, [])

  // 📷 Preview imagem
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // ✏️ Editar produto
  function startEdit(product) {
    setEditingProduct(product)
    setName(product.name)
    setPrice(product.price)
    setStock(product.stock)
    setPreviewUrl(product.image_url)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 🔄 Reset form
  function resetForm() {
    setName('')
    setPrice('')
    setStock('')
    setImageFile(null)
    setPreviewUrl(null)
    setEditingProduct(null)
  }

  // ➕ Adicionar / Atualizar
  async function handleAddProduct(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      let imageUrl = editingProduct?.image_url || ""

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      const productData = {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url: imageUrl,
        user_id: user.id
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
        if (error) throw error
        alert("✅ Produto atualizado!")
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) throw error
        alert("✅ Produto cadastrado!")
      }

      resetForm()
      fetchProducts()

    } catch (error) {
      alert("❌ Erro: " + error.message)
    } finally {
      setLoading(false)
    }
  }

// 🗑️ Deletar
async function handleDelete(product) {
  if (window.confirm(`Excluir "${product.name}"?`)) {
    try {
      // eslint-disable-next-line no-unused-vars
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) throw error

      fetchProducts()
    } catch (error) {
      alert("Erro: " + error.message)
    }
  }
}

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-layout">
        <Header />

        <main className="dashboard-content">
          <h2 className="page-title">📦 Gerenciar Estoque</h2>

          {/* FORM */}
          <form className="product-form" onSubmit={handleAddProduct}>
            
            <div className="form-grid">
              <input
                placeholder="Nome do Produto"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />

              <input
                type="number"
                step="0.01"
                placeholder="Preço (R$)"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Quantidade em Estoque"
                value={stock}
                onChange={e => setStock(e.target.value)}
                required
              />

              <div className="file-input">
                <input
                  type="file"
                  id="foto-produto"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
                <label htmlFor="foto-produto">
                  {previewUrl ? "📷 Trocar Foto" : "Selecionar Foto"}
                </label>
              </div>
            </div>

            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="preview" />
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading
                  ? 'Processando...'
                  : editingProduct
                  ? '💾 Salvar Alterações'
                  : '➕ Cadastrar Produto'}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* TABELA */}
          <div className="table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <img
                          src={product.image_url || 'https://via.placeholder.com/50'}
                          onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className="product-img"
                        />
                      </td>

                      <td><strong>{product.name}</strong></td>

                      <td className="price">
                        R$ {Number(product.price || 0).toFixed(2)}
                      </td>

                      <td>
                        <span className={`stock-badge ${product.stock <= 5 ? 'low' : 'ok'}`}>
                          {product.stock} un
                        </span>
                      </td>

                      <td>
                        <div className="actions">
                          <button onClick={() => startEdit(product)} className="btn-edit">✏️</button>
                          <button onClick={() => handleDelete(product)} className="btn-delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  )
}

export default Products