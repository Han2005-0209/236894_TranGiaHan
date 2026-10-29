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
    console.error('Error fetching food detail:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thông tin chi tiết món ăn',
      error: error.message,
    });
  }
});

// POST /api/foods
// Thêm món ăn mới với đầy đủ xác thực các trường bắt buộc và chống trùng foodId
router.post('/', async (req, res) => {
  try {
    const { foodId, name, category, cuisine, ingredients, price, quantity, description, imageUrl } = req.body;

    // Validate required fields
    if (!foodId || !name || !category || !cuisine || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: foodId, name, category, cuisine, price',
      });
    }

    const cleanFoodId = foodId.trim().toUpperCase();

    // Check duplicate foodId
    const existing = await Food.findOne({ foodId: cleanFoodId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Mã món ăn '${cleanFoodId}' đã tồn tại trong hệ thống. Vui lòng chọn mã khác.`,
      });
    }

    // Process ingredients list
    let processedIngredients = [];
    if (Array.isArray(ingredients)) {
      processedIngredients = ingredients;
    } else if (typeof ingredients === 'string' && ingredients.trim() !== '') {
      processedIngredients = ingredients.split(',').map(s => s.trim()).filter(Boolean);
    }

    const newFood = new Food({
      foodId: cleanFoodId,
      name: name.trim(),
      category: category.trim(),
      cuisine: cuisine.trim(),
      ingredients: processedIngredients,
      price: Number(price),
      quantity: quantity !== undefined ? Number(quantity) : 0,
      description: description ? description.trim() : '',
      imageUrl: imageUrl ? imageUrl.trim() : '',
    });

    const saved = await newFood.save();
    return res.status(201).json({
      success: true,
      message: 'Thêm món ăn mới thành công',
      data: saved,
    });
  } catch (error) {
    console.error('Error creating food:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Mã món ăn (foodId) đã tồn tại',
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi tạo mới món ăn',
    });
  }
});

// PUT /api/foods/:id
// Cập nhật thông tin món ăn theo id (ObjectId hoặc foodId)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, cuisine, ingredients, price, quantity, description, imageUrl } = req.body;

    let filter = {};
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      filter = { _id: id };
    } else {
      filter = { foodId: id.toUpperCase() };
    }

    let processedIngredients = undefined;
    if (ingredients !== undefined) {
      if (Array.isArray(ingredients)) {
        processedIngredients = ingredients;
      } else if (typeof ingredients === 'string') {
        processedIngredients = ingredients.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (cuisine !== undefined) updateData.cuisine = cuisine.trim();
    if (processedIngredients !== undefined) updateData.ingredients = processedIngredients;
    if (price !== undefined) updateData.price = Number(price);
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (description !== undefined) updateData.description = description.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();

    const updated = await Food.findOneAndUpdate(filter, updateData, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy món ăn với định danh '${id}' để cập nhật`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin món ăn thành công',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating food:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật món ăn',
    });
  }
});

// DELETE /api/foods/:id
// Xóa một món ăn khỏi hệ thống
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let filter = {};
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      filter = { _id: id };
    } else {
      filter = { foodId: id.toUpperCase() };
    }

    const deleted = await Food.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy món ăn với định danh '${id}' để xóa`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Đã xóa thành công món ăn '${deleted.name}' (${deleted.foodId})`,
      data: deleted,
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
