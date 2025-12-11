const express = require('express');
const cors = require('cors');
const path = require('path');

const session = require('express-session')

const cartRouter = require('./cart');
const orderRouter = require('./order');
const userRouter = require('./users');
const mainRouter = require('./main');
const productRouter = require('./pro');


const app = express();


// 전역 미들웨어
app.use(cors({ origin: "http://localhost:5173", // 프론트 주소 제대로
   credentials: true  // 쿠키 허용
  })); 
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: 'lax' }
}));

app.use(express.json());  // http 요청의 Body를 JSON 형태로 자동으로 파싱해주는 미들웨어
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우터 연결
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/users', userRouter);
app.use('/main', mainRouter);
app.use('/pro', productRouter);


app.get('/', (req, res) => {
  res.json('서버 응답');
});

app.listen(8080, () => {
    console.log("potato server running on port 8080")
})
