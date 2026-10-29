require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Food = require('./models/Food');

const sampleFoods = [
  {
    foodId: 'F01',
    name: 'Phở Bò Tái Nạm',
    category: 'Món nước',
    cuisine: 'Miền Bắc',
    ingredients: ['Bánh phở', 'Thịt bò tái', 'Nạm bò', 'Hành lá', 'Nước dùng xương bò hầm', 'Gừng', 'Hồi', 'Quế'],
    price: 55000,
    quantity: 50,
    description: 'Phở bò truyền thống Hà Nội với nước dùng trong, ngọt thanh từ xương bò hầm nhiều giờ kết hợp thịt bò tươi ngon.',
    imageUrl: 'https://files.catbox.moe/amupho.jpg',
  },
  {
    foodId: 'F02',
    name: 'Bún Bò Huế',
    category: 'Món nước',
    cuisine: 'Miền Trung',
    ingredients: ['Bún sợi to', 'Thịt bắp bò', 'Giò heo', 'Chả cua', 'Huyết', 'Mắm ruốc', 'Sả', 'Ớt sa tế'],
    price: 60000,
    quantity: 40,
    description: 'Món bún bò đặc sản cố đô Huế với hương vị đậm đà cay nồng của sả ớt và mắm ruốc truyền thống.',
    imageUrl: 'https://files.catbox.moe/svunkp.jpg',
  },
  {
    foodId: 'F03',
    name: 'Cơm Tấm Sườn Bì Chả',
    category: 'Món chính',
    cuisine: 'Miền Nam',
    ingredients: ['Gạo tấm', 'Sườn heo nướng', 'Bì heo', 'Chả trứng hấp', 'Mỡ hành', 'Đồ chua', 'Nước mắm chua ngọt'],
    price: 50000,
    quantity: 65,
    description: 'Cơm tấm đặc sản Sài Gòn với sườn nướng than thơm lừng, chả trứng béo ngậy và nước mắm chua ngọt đậm đà.',
    imageUrl: 'https://files.catbox.moe/4132uj.jpg',
  },
  {
    foodId: 'F04',
    name: 'Gỏi Cuốn Tôm Thịt',
    category: 'Món khai vị',
    cuisine: 'Miền Nam',
    ingredients: ['Bánh tráng', 'Tôm tươi', 'Thịt ba chỉ', 'Bún tươi', 'Rau sống', 'Hẹ', 'Tương chấm đậu phộng'],
    price: 35000,
    quantity: 80,
    description: 'Món khai vị thanh mát gồm tôm thịt luộc cuộn cùng rau sống tươi giòn và bún, chấm cùng tương đậu phộng.',
    imageUrl: 'https://files.catbox.moe/jjr9cm.jpg',
  },
];

const seedDatabase = async () => {
  try {
    console.log('[Seed] Đang kết nối tới cơ sở dữ liệu MongoDB Atlas...');
    await connectDB();

    console.log('[Seed] Xóa dữ liệu mẫu cũ nếu có...');
    await Food.deleteMany({});

    console.log('[Seed] Chèn danh sách món ăn mẫu...');
    const createdFoods = await Food.insertMany(sampleFoods);
    console.log(`[Seed Thành Công] Đã chèn ${createdFoods.length} món ăn mẫu vào collection 'foods':`);
    createdFoods.forEach(food => console.log(`  - [${food.foodId}] ${food.name} (${food.category} - ${food.cuisine}) - Giá: ${food.price} VND`));

    process.exit(0);
  } catch (error) {
    console.error('[Seed Thất Bại]', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { sampleFoods, seedDatabase };
