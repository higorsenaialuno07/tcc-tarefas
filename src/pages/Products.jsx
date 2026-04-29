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
  const [previewUrl, setPreviewUrl] = useState(null) // Para o preview da foto
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  useEffect(() => { fetchProducts() }, [])

  // Gerencia o preview da imagem selecionada
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  function startEdit(product) {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
    setStock(product.stock);
    setPreviewUrl(product.image_url); // Mostra a imagem atual no preview
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setName('');
    setPrice('');
    setStock('');
    setImageFile(null);
    setPreviewUrl(null);
    setEditingProduct(null);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let imageUrl = editingProduct?.image_url || ""; 

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const productData = { 
        name, 
        price: parseFloat(price), 
        stock: parseInt(stock), 
        image_url: imageUrl, 
        user_id: user.id 
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        alert("✅ Produto atualizado!");
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        alert("✅ Produto cadastrado!");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      alert("❌ Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(product) {
    if (window.confirm(`Deseja excluir permanentemente o produto "${product.name}"?`)) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', product.id);
        if (error) throw error;
        fetchProducts();
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
          <h2>📦 Gerenciar Estoque</h2>

          <form className="task-form" onSubmit={handleAddProduct} style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input placeholder="Nome do Produto" value={name} onChange={e => setName(e.target.value)} required />
              <input type="number" step="0.01" placeholder="Preço (R$)" value={price} onChange={e => setPrice(e.target.value)} required />
              <input type="number" placeholder="Quantidade em Estoque" value={stock} onChange={e => setStock(e.target.value)} required />
              
              <div style={{ textAlign: 'center' }}>
                <input type="file" id="foto-produto" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                <label htmlFor="foto-produto" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', height: '45px',
                  background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#64748b'
                }}>
                  {previewUrl ? "📷 Trocar Foto" : "📁 Selecionar Foto"}
                </label>
              </div>
            </div>

            {previewUrl && (
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <img src={previewUrl} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" disabled={loading} style={{ 
                flex: 2, background: editingProduct ? '#f59e0b' : '#2563eb', fontWeight: 'bold' 
              }}>
                {loading ? 'Processando...' : (editingProduct ? '💾 Salvar Alterações' : '➕ Cadastrar Produto')}
              </button>
              {editingProduct && (
                <button type="button" onClick={resetForm} style={{ flex: 1, background: '#94a3b8' }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="table-container" style={{ marginTop: '30px' }}>
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
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <img src={product.image_url || 'https://via.placeholder.com/50'} alt={product.name} 
                           style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px' }} />
                    </td>
                    <td><strong>{product.name}</strong></td>
                    <td style={{ color: '#059669', fontWeight: 'bold' }}>R$ {product.price.toFixed(2)}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                        background: product.stock <= 5 ? '#fee2e2' : '#dcfce7',
                        color: product.stock <= 5 ? '#dc2626' : '#16a34a'
                      }}>
                        {product.stock} un
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => startEdit(product)} style={{ padding: '6px', background: '#f59e0b', border: 'none', borderRadius: '6px', color: 'white' }}>✏️</button>
                        <button onClick={() => handleDelete(product)} style={{ padding: '6px', background: '#ef4444', border: 'none', borderRadius: '6px', color: 'white' }}>🗑️</button>
                      </div>
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