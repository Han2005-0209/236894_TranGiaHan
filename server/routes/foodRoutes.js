const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// GET /api/foods & GET /api/foods?search=...
// Lấy danh sách món ăn hoặc tìm kiếm theo từ khóa (tên, loại món, vùng miền)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const keyword = search.trim();
      const regex = new RegExp(keyword, 'i');
      query = {
        $or: [
          { name: regex },
          { category: regex },
          { cuisine: regex },
          { foodId: regex },
          { description: regex },
        ],
      };
    }

    const foods = await Food.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      total: foods.length,
      data: foods,
    });
  } catch (error) {
    console.error('Error fetching foods:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách món ăn',
      error: error.message,
    });
  }
});

// GET /api/foods/:id
// Xem thông tin chi tiết một món ăn (hỗ trợ cả ObjectId và foodId)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let food = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      food = await Food.findById(id);
    }
    if (!food) {
      food = await Food.findOne({ foodId: id.toUpperCase() });
    }

    if (!food) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy món ăn với định danh '${id}'`,
      });
    }

    return res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    console.error('Error fetching food by ID:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tìm kiếm món ăn',
      error: error.message,
    });
  }
});

// POST /api/foods
// Thêm món ăn mới: kiểm tra dữ liệu đầu vào và ngăn trùng foodId
router.post('/', async (req, res) => {
  try {
    const { foodId, name, category, cuisine, ingredients, price, quantity, description, imageUrl } = req.body;

    // 1. Kiểm tra các trường bắt buộc
    if (!foodId || !name || !category || !cuisine || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ: foodId, name, category, cuisine, price là các trường bắt buộc',
      });
    }

    const cleanFoodId = String(foodId).trim().toUpperCase();
    if (!cleanFoodId) {
      return res.status(400).json({
        success: false,
        message: 'Mã món ăn foodId không được để trống',
      });
    }

    // 2. Kiểm tra không cho phép trùng mã món ăn foodId
    const existing = await Food.findOne({ foodId: cleanFoodId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Mã món ăn '${cleanFoodId}' đã tồn tại trong hệ thống. Vui lòng chọn mã khác`,
      });
    }

    // 3. Chuẩn hóa ingredients (hỗ trợ cả mảng và chuỗi ngăn cách bởi dấu phẩy)
    let parsedIngredients = [];
    if (Array.isArray(ingredients)) {
      parsedIngredients = ingredients.map(i => String(i).trim()).filter(Boolean);
    } else if (typeof ingredients === 'string' && ingredients.trim()) {
      parsedIngredients = ingredients.split(',').map(i => i.trim()).filter(Boolean);
    }

    const newFood = new Food({
      foodId: cleanFoodId,
      name: String(name).trim(),
      category: String(category).trim(),
      cuisine: String(cuisine).trim(),
      ingredients: parsedIngredients,
      price: Number(price),
      quantity: Number(quantity) >= 0 ? Number(quantity) : 0,
      description: description ? String(description).trim() : '',
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
    });

    const savedFood = await newFood.save();
    return res.status(201).json({
      success: true,
      message: 'Thêm món ăn mới thành công',
      data: savedFood,
    });
  } catch (error) {
    console.error('Error creating food:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Trùng mã món ăn foodId',
        error: error.message,
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Lỗi kiểm tra tính hợp lệ của dữ liệu',
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tạo món ăn',
      error: error.message,
    });
  }
});

// PUT /api/foods/:id
// Cập nhật thông tin món ăn
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { foodId, name, category, cuisine, ingredients, price, quantity, description, imageUrl } = req.body;

    let food = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      food = await Food.findById(id);
    }
    if (!food) {
      food = await Food.findOne({ foodId: id.toUpperCase() });
    }

    if (!food) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy món ăn với định danh '${id}' để cập nhật`,
      });
    }

    // Nếu đổi foodId, kiểm tra trùng
    if (foodId && foodId.trim().toUpperCase() !== food.foodId) {
      const cleanNewId = foodId.trim().toUpperCase();
      const duplicate = await Food.findOne({ foodId: cleanNewId });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Không thể đổi sang mã '${cleanNewId}' vì mã này đã tồn tại`,
        });
      }
      food.foodId = cleanNewId;
    }

    if (name !== undefined) food.name = String(name).trim();
    if (category !== undefined) food.category = String(category).trim();
    if (cuisine !== undefined) food.cuisine = String(cuisine).trim();
    if (price !== undefined) {
      const numPrice = Number(price);
      if (numPrice < 0) {
        return res.status(400).json({ success: false, message: 'Giá bán không được âm' });
      }
      food.price = numPrice;
    }
    if (quantity !== undefined) {
      const numQty = Number(quantity);
      if (numQty < 0) {
        return res.status(400).json({ success: false, message: 'Số lượng không được âm' });
      }
      food.quantity = numQty;
    }
    if (description !== undefined) food.description = String(description).trim();
    if (imageUrl !== undefined) food.imageUrl = String(imageUrl).trim();

    if (ingredients !== undefined) {
      if (Array.isArray(ingredients)) {
        food.ingredients = ingredients.map(i => String(i).trim()).filter(Boolean);
      } else if (typeof ingredients === 'string') {
        food.ingredients = ingredients.split(',').map(i => i.trim()).filter(Boolean);
      }
    }

    const updatedFood = await food.save();
    return res.status(200).json({
      success: true,
      message: 'Cập nhật món ăn thành công',
      data: updatedFood,
    });
  } catch (error) {
    console.error('Error updating food:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu cập nhật không hợp lệ',
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật món ăn',
      error: error.message,
    });
  }
});

// DELETE /api/foods/:id
// Xóa món ăn
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let food = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      food = await Food.findByIdAndDelete(id);
    }
    if (!food) {
      food = await Food.findOneAndDelete({ foodId: id.toUpperCase() });
    }

    if (!food) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy món ăn với định danh '${id}' để xóa`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Đã xóa thành công món ăn '${food.name}' (Mã: ${food.foodId})`,
      data: food,
    });
  } catch (error) {
    console.error('Error deleting food:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa món ăn',
      error: error.message,
    });
  }
});

module.exports = router;
