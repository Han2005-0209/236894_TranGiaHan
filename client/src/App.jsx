import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Cáº¥u hĂ¬nh URL Backend linh hoáº¡t tá»« biáº¿n mĂ´i trÆ°á»ng Ä‘Ă¡m mĂ¢y hoáº·c fallback
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/foods`
  : '/api/foods';

const initialFormState = {
  foodId: '',
  name: '',
  category: 'MĂ³n chĂ­nh',
  cuisine: 'Miá»n Nam',
  ingredients: '',
  price: '',
  quantity: '',
  description: '',
  imageUrl: '',
};

function App() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Search & Filter
  const [searchKeyword, setSearchKeyword] = useState('');

  // Form state
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  // Detail Modal
  const [selectedFood, setSelectedFood] = useState(null);

  // Auto clear message after 4s
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch foods list
  const fetchFoods = async (search = '') => {
    setLoading(true);
    try {
      const url = search ? `${API_BASE_URL}?search=${encodeURIComponent(search)}` : API_BASE_URL;
      const res = await axios.get(url);
      if (res.data && res.data.success) {
        setFoods(res.data.data || []);
      }
    } catch (err) {
      console.error('Lá»—i khi táº£i dá»¯ liá»‡u mĂ³n Äƒn:', err);
      setError(err.response?.data?.message || 'KhĂ´ng thá»ƒ káº¿t ná»‘i Ä‘áº¿n mĂ¡y chá»§ API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Handle Search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFoods(searchKeyword);
  };

  const handleResetSearch = () => {
    setSearchKeyword('');
    fetchFoods('');
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
    setShowFormModal(true);
  };

  // Open Edit Form
  const handleOpenEdit = (food) => {
    setFormData({
      foodId: food.foodId || '',
      name: food.name || '',
      category: food.category || 'MĂ³n chĂ­nh',
      cuisine: food.cuisine || 'Miá»n Nam',
      ingredients: Array.isArray(food.ingredients) ? food.ingredients.join(', ') : (food.ingredients || ''),
      price: food.price || '',
      quantity: food.quantity !== undefined ? food.quantity : '',
      description: food.description || '',
      imageUrl: food.imageUrl || '',
    });
    setIsEditing(true);
    setEditId(food._id || food.foodId);
    setShowFormModal(true);
  };

  // Submit Form (Create / Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        foodId: formData.foodId.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category.trim(),
        cuisine: formData.cuisine.trim(),
        ingredients: formData.ingredients,
        price: Number(formData.price),
        quantity: Number(formData.quantity) || 0,
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim(),
      };

      if (isEditing) {
        const res = await axios.put(`${API_BASE_URL}/${editId}`, payload);
        setSuccessMsg(res.data.message || 'Cáº­p nháº­t mĂ³n Äƒn thĂ nh cĂ´ng!');
      } else {
        const res = await axios.post(API_BASE_URL, payload);
        setSuccessMsg(res.data.message || 'ThĂªm mĂ³n Äƒn má»›i thĂ nh cĂ´ng!');
      }

      setShowFormModal(false);
      fetchFoods(searchKeyword);
    } catch (err) {
      console.error('Lá»—i lÆ°u mĂ³n Äƒn:', err);
      setError(err.response?.data?.message || 'Thao tĂ¡c khĂ´ng thĂ nh cĂ´ng, vui lĂ²ng kiá»ƒm tra láº¡i dá»¯ liá»‡u');
    } finally {
      setLoading(false);
    }
  };

  // Delete Food
  const handleDeleteFood = async (id, foodName, foodId) => {
    if (!window.confirm(`Báº¡n cĂ³ cháº¯c cháº¯n muá»‘n xĂ³a mĂ³n Äƒn '${foodName}' (MĂ£: ${foodId}) khĂ´ng?`)) {
      return;
    }
    setLoading(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/${id}`);
      setSuccessMsg(res.data.message || `ÄĂ£ xĂ³a thĂ nh cĂ´ng mĂ³n Äƒn '${foodName}'!`);
      if (selectedFood && (selectedFood._id === id || selectedFood.foodId === id)) {
        setSelectedFood(null);
      }
      fetchFoods(searchKeyword);
    } catch (err) {
      console.error('Lá»—i xĂ³a mĂ³n Äƒn:', err);
      setError(err.response?.data?.message || 'KhĂ´ng thá»ƒ xĂ³a mĂ³n Äƒn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <h1>Há»‡ Thá»‘ng Quáº£n LĂ½ MĂ³n Ä‚n</h1>
          <p className="subtitle">Há»c pháº§n Äiá»‡n toĂ¡n Ä‘Ă¡m mĂ¢y â€” Tráº§n Gia HĂ¢n (MSSV: 236894 - Lá»›p: DH23TIN08)</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          + ThĂªm MĂ³n Ä‚n Má»›i
        </button>
      </header>

      {/* Alert Notifications */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search and Action Bar */}
      <section className="search-section">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder="TĂ¬m kiáº¿m theo tĂªn mĂ³n Äƒn, loáº¡i mĂ³n, hoáº·c vĂ¹ng miá»n..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-search">TĂ¬m Kiáº¿m</button>
          {searchKeyword && (
            <button type="button" onClick={handleResetSearch} className="btn btn-secondary">
              Äáº·t láº¡i
            </button>
          )}
        </form>
        <div className="total-badge">
          Tá»•ng sá»‘: <strong>{foods.length}</strong> mĂ³n Äƒn
        </div>
      </section>

      {/* Loading state */}
      {loading && <div className="loading-state"><div className="spinner"></div> Äang táº£i dá»¯ liá»‡u...</div>}

      {/* Food Cards Grid */}
      <main className="food-grid">
        {!loading && foods.length === 0 && (
          <div className="empty-state">
            <p>KhĂ´ng tĂ¬m tháº¥y mĂ³n Äƒn nĂ o phĂ¹ há»£p vá»›i yĂªu cáº§u tĂ¬m kiáº¿m.</p>
          </div>
        )}

        {foods.map((food) => (
          <div key={food._id || food.foodId} className="food-card">
            <div className="food-image-container">
              {food.imageUrl ? (
                <img
                  src={food.imageUrl}
                  alt={food.name}
                  className="food-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
                  }}
                />
              ) : (
                <div className="food-placeholder">MĂ³n Ä‚n</div>
              )}
              <span className="badge-food-id">{food.foodId}</span>
            </div>

            <div className="food-card-body">
              <h2 className="food-name">{food.name}</h2>
              <div className="food-tags">
                <span className="tag category-tag">{food.category}</span>
                <span className="tag cuisine-tag">{food.cuisine}</span>
              </div>
              <p className="food-price">{Number(food.price).toLocaleString('vi-VN')} VND</p>
              <p className="food-quantity">Sá»‘ lÆ°á»£ng cĂ²n: <strong>{food.quantity}</strong></p>
              {food.description && (
                <p className="food-desc-preview">{food.description}</p>
              )}
            </div>

            <div className="food-card-actions">
              <button
                className="btn btn-sm btn-info"
                onClick={() => setSelectedFood(food)}
              >
                Chi tiáº¿t
              </button>
              <button
                className="btn btn-sm btn-warning"
                onClick={() => handleOpenEdit(food)}
              >
                Sá»­a
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteFood(food._id || food.foodId, food.name, food.foodId)}
              >
                XĂ³a
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Modal Xem Chi Tiáº¿t */}
      {selectedFood && (
        <div className="modal-overlay" onClick={() => setSelectedFood(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi Tiáº¿t MĂ³n Ä‚n: {selectedFood.name}</h2>
              <button className="btn-close" onClick={() => setSelectedFood(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {selectedFood.imageUrl && (
                <img src={selectedFood.imageUrl} alt={selectedFood.name} className="modal-detail-img" />
              )}
              <table className="detail-table">
                <tbody>
                  <tr>
                    <th>MĂ£ mĂ³n Äƒn:</th>
                    <td><strong>{selectedFood.foodId}</strong></td>
                  </tr>
                  <tr>
                    <th>TĂªn mĂ³n Äƒn:</th>
                    <td>{selectedFood.name}</td>
                  </tr>
                  <tr>
                    <th>Loáº¡i mĂ³n:</th>
                    <td>{selectedFood.category}</td>
                  </tr>
                  <tr>
                    <th>áº¨m thá»±c / VĂ¹ng miá»n:</th>
                    <td>{selectedFood.cuisine}</td>
                  </tr>
                  <tr>
                    <th>GiĂ¡ bĂ¡n:</th>
                    <td><strong className="text-price">{Number(selectedFood.price).toLocaleString('vi-VN')} VND</strong></td>
                  </tr>
                  <tr>
                    <th>Sá»‘ lÆ°á»£ng hiá»‡n cĂ³:</th>
                    <td>{selectedFood.quantity}</td>
                  </tr>
                  <tr>
                    <th>NguyĂªn liá»‡u:</th>
                    <td>
                      {Array.isArray(selectedFood.ingredients) && selectedFood.ingredients.length > 0 ? (
                        <div className="ingredient-list">
                          {selectedFood.ingredients.map((ing, idx) => (
                            <span key={idx} className="ingredient-chip">{ing}</span>
                          ))}
                        </div>
                      ) : (
                        'ChÆ°a cáº­p nháº­t nguyĂªn liá»‡u'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>MĂ´ táº£:</th>
                    <td>{selectedFood.description || 'KhĂ´ng cĂ³ mĂ´ táº£'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedFood(null)}>ÄĂ³ng</button>
              <button className="btn btn-warning" onClick={() => { const f = selectedFood; setSelectedFood(null); handleOpenEdit(f); }}>Chá»‰nh sá»­a</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ThĂªm / Sá»­a MĂ³n Ä‚n */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? `Cáº­p Nháº­t MĂ³n Ä‚n (${formData.foodId})` : 'ThĂªm MĂ³n Ä‚n Má»›i'}</h2>
              <button className="btn-close" onClick={() => setShowFormModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitForm} className="food-form">
              <div className="form-row">
                <div className="form-group">
                  <label>MĂ£ mĂ³n Äƒn (foodId) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VĂ­ dá»¥: F01, F02..."
                    value={formData.foodId}
                    onChange={(e) => setFormData({ ...formData, foodId: e.target.value })}
                    disabled={isEditing}
                  />
                  {isEditing && <small className="form-hint">MĂ£ mĂ³n Äƒn khĂ´ng Ä‘Æ°á»£c sá»­a</small>}
                </div>
                <div className="form-group">
                  <label>TĂªn mĂ³n Äƒn *</label>
                  <input
                    type="text"
                    required
                    placeholder="VĂ­ dá»¥: Phá»Ÿ BĂ² TĂ¡i, CÆ¡m Táº¥m..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loáº¡i mĂ³n Äƒn *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="MĂ³n chĂ­nh">MĂ³n chĂ­nh</option>
                    <option value="MĂ³n nÆ°á»›c">MĂ³n nÆ°á»›c</option>
                    <option value="MĂ³n khai vá»‹">MĂ³n khai vá»‹</option>
                    <option value="MĂ³n trĂ¡ng miá»‡ng">MĂ³n trĂ¡ng miá»‡ng</option>
                    <option value="Äá»“ uá»‘ng">Äá»“ uá»‘ng</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>áº¨m thá»±c / VĂ¹ng miá»n *</label>
                  <select
                    value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  >
                    <option value="Miá»n Báº¯c">Miá»n Báº¯c</option>
                    <option value="Miá»n Trung">Miá»n Trung</option>
                    <option value="Miá»n Nam">Miá»n Nam</option>
                    <option value="Quá»‘c táº¿">Quá»‘c táº¿</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>GiĂ¡ bĂ¡n (VND) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="VĂ­ dá»¥: 50000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Sá»‘ lÆ°á»£ng hiá»‡n cĂ³ *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="VĂ­ dá»¥: 50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Danh sĂ¡ch nguyĂªn liá»‡u (cĂ¡ch nhau bá»Ÿi dáº¥u pháº©y)</label>
                <input
                  type="text"
                  placeholder="VĂ­ dá»¥: Thá»‹t bĂ², BĂ¡nh phá»Ÿ, HĂ nh lĂ¡, Gá»«ng"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>ÄÆ°á»ng dáº«n hĂ¬nh áº£nh (imageUrl)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>MĂ´ táº£ mĂ³n Äƒn</label>
                <textarea
                  rows="3"
                  placeholder="MĂ´ táº£ chi tiáº¿t vá» hÆ°Æ¡ng vá»‹, cĂ¡ch cháº¿ biáº¿n..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>
                  Há»§y
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Äang lÆ°u...' : (isEditing ? 'LÆ°u Thay Äá»•i' : 'ThĂªm MĂ³n Ä‚n')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
