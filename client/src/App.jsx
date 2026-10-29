import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Cấu hình URL Backend linh hoạt từ biến môi trường đám mây hoặc fallback
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/foods`
  : '/api/foods';

const initialFormState = {
  foodId: '',
  name: '',
  category: 'Món chính',
  cuisine: 'Miền Nam',
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
      console.error('Lỗi khi tải dữ liệu món ăn:', err);
      setError(err.response?.data?.message || 'Không thể kết nối đến máy chủ API');
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
      category: food.category || 'Món chính',
      cuisine: food.cuisine || 'Miền Nam',
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
        setSuccessMsg(res.data.message || 'Cập nhật món ăn thành công!');
      } else {
        const res = await axios.post(API_BASE_URL, payload);
        setSuccessMsg(res.data.message || 'Thêm món ăn mới thành công!');
      }

      setShowFormModal(false);
      fetchFoods(searchKeyword);
    } catch (err) {
      console.error('Lỗi lưu món ăn:', err);
      setError(err.response?.data?.message || 'Thao tác không thành công, vui lòng kiểm tra lại dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Delete Food
  const handleDeleteFood = async (id, foodName, foodId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa món ăn '${foodName}' (Mã: ${foodId}) không?`)) {
      return;
    }
    setLoading(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/${id}`);
      setSuccessMsg(res.data.message || `Đã xóa thành công món ăn '${foodName}'!`);
      if (selectedFood && (selectedFood._id === id || selectedFood.foodId === id)) {
        setSelectedFood(null);
      }
      fetchFoods(searchKeyword);
    } catch (err) {
      console.error('Lỗi xóa món ăn:', err);
      setError(err.response?.data?.message || 'Không thể xóa món ăn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <h1>Hệ Thống Quản Lý Món Ăn</h1>
          <p className="subtitle">Học phần Điện toán đám mây — Trần Gia Hân (MSSV: 236894 - Lớp: DH23TIN08)</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          + Thêm Món Ăn Mới
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
            placeholder="Tìm kiếm theo tên món ăn, loại món, hoặc vùng miền..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-search">Tìm Kiếm</button>
          {searchKeyword && (
            <button type="button" onClick={handleResetSearch} className="btn btn-secondary">
              Đặt lại
            </button>
          )}
        </form>
        <div className="total-badge">
          Tổng số: <strong>{foods.length}</strong> món ăn
        </div>
      </section>

      {/* Loading state */}
      {loading && <div className="loading-state"><div className="spinner"></div> Đang tải dữ liệu...</div>}

      {/* Food Cards Grid */}
      <main className="food-grid">
        {!loading && foods.length === 0 && (
          <div className="empty-state">
            <p>Không tìm thấy món ăn nào phù hợp với yêu cầu tìm kiếm.</p>
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
                <div className="food-placeholder">Món Ăn</div>
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
              <p className="food-quantity">Số lượng còn: <strong>{food.quantity}</strong></p>
              {food.description && (
                <p className="food-desc-preview">{food.description}</p>
              )}
            </div>

            <div className="food-card-actions">
              <button
                className="btn btn-sm btn-info"
                onClick={() => setSelectedFood(food)}
              >
                Chi tiết
              </button>
              <button
                className="btn btn-sm btn-warning"
                onClick={() => handleOpenEdit(food)}
              >
                Sửa
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteFood(food._id || food.foodId, food.name, food.foodId)}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Modal Xem Chi Tiết */}
      {selectedFood && (
        <div className="modal-overlay" onClick={() => setSelectedFood(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi Tiết Món Ăn: {selectedFood.name}</h2>
              <button className="btn-close" onClick={() => setSelectedFood(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {selectedFood.imageUrl && (
                <img src={selectedFood.imageUrl} alt={selectedFood.name} className="modal-detail-img" />
              )}
              <table className="detail-table">
                <tbody>
                  <tr>
                    <th>Mã món ăn:</th>
                    <td><strong>{selectedFood.foodId}</strong></td>
                  </tr>
                  <tr>
                    <th>Tên món ăn:</th>
                    <td>{selectedFood.name}</td>
                  </tr>
                  <tr>
                    <th>Loại món:</th>
                    <td>{selectedFood.category}</td>
                  </tr>
                  <tr>
                    <th>Ẩm thực / Vùng miền:</th>
                    <td>{selectedFood.cuisine}</td>
                  </tr>
                  <tr>
                    <th>Giá bán:</th>
                    <td><strong className="text-price">{Number(selectedFood.price).toLocaleString('vi-VN')} VND</strong></td>
                  </tr>
                  <tr>
                    <th>Số lượng hiện có:</th>
                    <td>{selectedFood.quantity}</td>
                  </tr>
                  <tr>
                    <th>Nguyên liệu:</th>
                    <td>
                      {Array.isArray(selectedFood.ingredients) && selectedFood.ingredients.length > 0 ? (
                        <div className="ingredient-list">
                          {selectedFood.ingredients.map((ing, idx) => (
                            <span key={idx} className="ingredient-chip">{ing}</span>
                          ))}
                        </div>
                      ) : (
                        'Chưa cập nhật nguyên liệu'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>Mô tả:</th>
                    <td>{selectedFood.description || 'Không có mô tả'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedFood(null)}>Đóng</button>
              <button className="btn btn-warning" onClick={() => { const f = selectedFood; setSelectedFood(null); handleOpenEdit(f); }}>Chỉnh sửa</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa Món Ăn */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? `Cập Nhật Món Ăn (${formData.foodId})` : 'Thêm Món Ăn Mới'}</h2>
              <button className="btn-close" onClick={() => setShowFormModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitForm} className="food-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Mã món ăn (foodId) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: F01, F02..."
                    value={formData.foodId}
                    onChange={(e) => setFormData({ ...formData, foodId: e.target.value })}
                    disabled={isEditing}
                  />
                  {isEditing && <small className="form-hint">Mã món ăn không được sửa</small>}
                </div>
                <div className="form-group">
                  <label>Tên món ăn *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Phở Bò Tái, Cơm Tấm..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại món ăn *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Món chính">Món chính</option>
                    <option value="Món nước">Món nước</option>
                    <option value="Món khai vị">Món khai vị</option>
                    <option value="Món tráng miệng">Món tráng miệng</option>
                    <option value="Đồ uống">Đồ uống</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ẩm thực / Vùng miền *</label>
                  <select
                    value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  >
                    <option value="Miền Bắc">Miền Bắc</option>
                    <option value="Miền Trung">Miền Trung</option>
                    <option value="Miền Nam">Miền Nam</option>
                    <option value="Quốc tế">Quốc tế</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá bán (VND) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Ví dụ: 50000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Số lượng hiện có *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Ví dụ: 50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Danh sách nguyên liệu (cách nhau bởi dấu phẩy)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thịt bò, Bánh phở, Hành lá, Gừng"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Đường dẫn hình ảnh (imageUrl)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Mô tả món ăn</label>
                <textarea
                  rows="3"
                  placeholder="Mô tả chi tiết về hương vị, cách chế biến..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang lưu...' : (isEditing ? 'Lưu Thay Đổi' : 'Thêm Món Ăn')}
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
