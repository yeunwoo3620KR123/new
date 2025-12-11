const express = require('express');
const pool = require('./db');
const router = express.Router();

// [GET /products] 상품 전체 목록
router.get('/products', async (req, res) => {
  try {
    const rows = await pool.query("SELECT pId, pName, pPrice, description, pcategory, img, stock, brand FROM products");
    const products = rows.map(row => ({
      id: row.pId,
      name: row.pName,
      price: row.pPrice,
      description: row.description,
      category: row.pcategory,
      image: `http://localhost:8080${row.img}`,
      stock: row.stock,
      brand: row.brand
    }));
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// [GET /products/:pId] 상품 상세
router.get('/products/:pId', async (req, res) => {
  try {
    const productId = req.params.pId;
    const rows = await pool.query("SELECT pId, pName, pPrice, description, pcategory,img, stock, brand FROM products WHERE pId = ?", [productId]);

    if (rows.length === 0) return res.status(404).json({});

    const product = rows[0];
    res.json({
      id: product.pId,
      name: product.pName,
      price: product.pPrice,
      description: product.description,
      category: product.pcategory,
      image: `http://localhost:8080${product.img}`,
      stock: product.stock,
      brand: product.brand
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({});
  }
});



// GET /reviews 리뷰 전체 목록 
router.get('/reviews', async (req, res) => {
  try {
    // user 테이블 JOIN해서 gender 
    const query = `
      SELECT 
        r.review_id,
        r.id AS id, 
        r.pId, 
        r.content, 
        r.date, 
        r.rating,
        u.nickname,
        u.gender 
      FROM review r
      LEFT JOIN users u ON r.id = u.id
      ORDER BY r.date DESC
    `;

    const rows = await pool.query(query);

    const reviews = rows.map(row => ({
      review_id: row.review_id,
      id: row.id,
      pId: row.pId,
      content: row.content,
      userName: row.nickname,
      date: row.date,
      gender: row.gender,
      rating: row.rating //별점 일단 고정
    }));

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// [POST /addreview] 리뷰 저장 (저장 후 불러올 때도 성별 포함 ✨)
router.post('/addreview', async (req, res) => {
  const { productId, content, userId, userName, rating } = req.body;
  const safeDate = new Date().toISOString().slice(0, 10);

  try {
    // 1. 리뷰 저장 (컬럼명 주의: nickname은 users에 있으므로 review에는 저장 안 함, 필요 시 review 테이블 수정)
    // 현재 review 테이블: review_id, id, nickname, pId, content, date
    await pool.query(
      "INSERT INTO review (id, nickname, pId, content, date,rating) VALUES (?, ?,?, ?, ?, ?)",
      [userId, userName, productId, content, safeDate,rating]
    );

    // 2. 최신 목록 다시 불러오기
    const query = `
      SELECT 
        r.review_id, r.id AS id, r.pId, r.content, r.date, r.rating,
        u.nickname, u.gender 
      FROM review r
      LEFT JOIN users u ON r.id = u.id
      ORDER BY r.date DESC
    `;

    const rows = await pool.query(query);

    const updatedReviews = rows.map(row => ({
      review_id: row.review_id,
      id: row.id,
      pId: row.pId,
      content: row.content,
      userName: row.nickname,
      date: row.date,
      gender: row.gender,
      rating:row.rating
    }));

    res.status(201).json(updatedReviews);
  } catch (err) {
    console.error("리뷰 저장 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { pId, id, amount, img, pName, pPrice } = req.body;

    console.log('장바구니 추가 요청:', { pId, id, amount, pName, pPrice });

    const existing = await pool.query(
      'SELECT * FROM cart WHERE id = ? AND pId = ?',
      [id, pId]
    );

    if (existing.length > 0) {
      // 이미 있으면 수량 증가
      await pool.query(
        'UPDATE cart SET amount = amount + ? WHERE id = ? AND pId = ?',
        [amount, id, pId]
      );
    } else {
      // 없으면 새로 추가
      await pool.query(
        'INSERT INTO cart (id, pId, pName, pPrice, amount, img) VALUES (?, ?, ?, ?, ?, ?)',
        [id, pId, pName, pPrice, amount, img]
      );
    }

    res.json({ result: true, message: '장바구니에 추가되었습니다' });
  } catch (error) {
    console.error('장바구니 추가 오류:', error);
    res.status(500).json({ result: false, error: '장바구니 추가 실패' });
  }
});

router.post('/buynow', async (req,res) =>{
  try{
    const { pId, id, amount, img, pName, pPrice } = req.body;

    const existing = await pool.query(
      'SELECT * FROM cart WHERE id = ? AND pId = ?',
      [id, pId]
    );
    if (existing.length > 0) {
      await pool.query(
        'UPDATE cart SET amount = amount + ? WHERE id = ? AND pId = ?',
        [amount, id, pId]
      );
    } else {
      await pool.query(
        'INSERT INTO cart (id, pId, pName, pPrice, amount, img) VALUES (?, ?, ?, ?, ?, ?)',
        [id, pId, pName, pPrice, amount, img]
      );
    }
    res.json({ result: true, message: '장바구니에 추가되었습니다' });
  } catch (error) {
    res.status(500).json({ result: false, error: '장바구니 추가 실패' });
  }
});


module.exports = router;