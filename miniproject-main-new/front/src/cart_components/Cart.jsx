import {useState, useEffect, useContext} from 'react';
import {useNavigate} from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";


function Cart() {
  const { isLogin, loading } = useContext(AuthContext); 
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  const [items, setItems] = useState([]);
  const [checkItem,setCheckItem] = useState([]);
  const navigate = useNavigate();

  // 로그인 확인 + 장바구니 불러오기
  useEffect(() => {
    if (!loading && !isLogin) {  // 서버 확인 끝난 후 로그인 안된 경우
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (isLogin) {
      fetchCart();
    }
  }, [isLogin, loading, navigate]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`http://localhost:8080/cart/${userId}`);
      
      if (!response.ok) {
        throw new Error('장바구니 조회 실패');
      }
      
      const data = await response.json();
    
      const cartItems = Array.isArray(data[0]) ? data[0] : data;
      setItems(cartItems);
      setCheckItem(cartItems.map(item => item.id));
    } catch (error) {
      console.error('장바구니 조회 실패:', error);
      setItems([]);
    }
  };
  
  const checkProduct = (id) =>{
    setCheckItem(prev=>prev.includes(id)
      ? prev.filter(item=>item!==id)
      : [...prev, id]);
  };

  const allCheckProduct = (e)=>{
    if(e.target.checked){
      const avliableItems = items
      .filter(item => item.stock > 0)
      .map(item => item.id);
      setCheckItem(items.map(item=>item.id));
    } else{
      setCheckItem([]);
    }
  };

  const cartDelete = async (pId) => {
    try {
      const response = await fetch('http://localhost:8080/cart/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pId, userId }),
      });
      const result = await response.json();
      if (result.result) {
        fetchCart();
      }
    } catch (error) {
      console.error('장바구니 삭제 실패:', error);
    }
  };

    async function updateAmount(id, newAmount) {
    try{
      const response = await fetch('http://localhost:8080/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pId: id, 
          amount: newAmount,
          userId: userId}),
      });
      const result = await response.json();
      if (result.result) {
        fetchCart();
      }else{
        alert(result.message || result.error);
      }
      
    }catch(error){
      console.error('수량 변경 실패:', error);
    }
  };

  const totalAmount = items
    .filter(item => checkItem.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.amount, 0);

    const checkedCount = checkItem.length;

  const order = () => {
    if(checkedCount === 0){
      alert('주문할 상품을 선택해주세요');
      return;
    }
    const selectedItems = items.filter(item => checkItem.includes(item.id));
    const outStock = selectedItems.filter(item => item.stock === 0 || item.stock < item.amount);

    if(outStock.length > 0){
      const itemNames = outStock.map(item => item.name).join(', ');
      alert(`재고가 부족합니다:\n${itemNames}\n\n 품절상태`)
      return;
    }
    navigate('/order', { state: { selectedItems: selectedItems } });
  }
return (
    <div style={{maxWidth:'800px', margin:'0 auto'}}>
      <h2 style={{textAlign:'center', margin:'30px 0'}}>장바구니</h2>
      
      {items.length === 0 ? (
        <div style={{textAlign:'center', padding:'50px', backgroundColor:'#f9f9f9', borderRadius:'10px'}}>
          <p>장바구니가 비었습니다.</p>
          <button className="btn" style={{marginTop:'20px'}} onClick={()=>navigate('/')}>쇼핑하러 가기</button>
        </div>
      ):(
        <>
          <div style={{marginBottom:'15px', padding:'10px', borderBottom:'2px solid var(--main-color)'}}>
            <label style={{fontWeight:'bold', cursor:'pointer'}}>
              <input type="checkbox" onChange={allCheckProduct} checked={checkedCount === items.length} style={{marginRight:'10px'}}/>
              전체선택 ({checkedCount}/{items.length})
            </label>
          </div>

          <ul style={{padding:0}}>
            {items.map((item)=>(
              <li key={item.id} style={{display:'flex', gap:'20px', padding:'20px', borderBottom:'1px solid #eee', alignItems:'center'}}>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                  <input type="checkbox" 
                    checked={checkItem.includes(item.id)} 
                    onChange={() => checkProduct(item.id)}/>
                  <img src={item.image} alt={item.name}
                  style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  opacity: item.stock === 0 ? 0.5 : 1
                  }}/>
                </div>
                <div>
                  {item.stock === 0 ? (
                      <p style={{ color: 'red', fontWeight: 'bold' }}>❌ 일시 품절</p>
                    ) : item.stock < item.amount ? (
                      <p style={{ color: 'orange', fontWeight: 'bold' }}>
                        ⚠️ 재고 부족 (재고: {item.stock}개)
                      </p>
                    ) : item.stock <= 5 ? (
                    <p style={{ color: 'orange' }}>🔥품절 임박🔥<br/>재고: {item.stock}개</p>
                    ) : (
                    <p style={{ color: 'green' }}></p>
                    )}
                </div>
                <div style={{flex:1}}>
                  <h4 style={{margin:'0 0 5px 0'}}>{item.name}</h4>
                  <p style={{fontWeight:'bold', color:'var(--main-color)'}}>{item.price.toLocaleString()}원</p>
                </div>
                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'10px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                    <button className="btn" style={{padding:'2px 8px', backgroundColor:'#ddd', color:'black'}} 
                        onClick={() => updateAmount(item.id, item.amount - 1)} disabled={item.amount <= 1}>-</button>
                    <span style={{minWidth:'20px', textAlign:'center'}}>{item.amount}</span>
                    <button className="btn" style={{padding:'2px 8px', backgroundColor:'#ddd', color:'black'}} 
                        onClick={() => updateAmount(item.id, item.amount + 1)}>+</button>
                  </div>
                  <button className="btn" style={{backgroundColor:'#ff6b6b', fontSize:'12px', padding:'5px 10px'}} onClick={() => cartDelete(item.id)}>삭제</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {items.length > 0 && (
          <div style={{marginTop:'40px', padding:'30px', backgroundColor:'#f0f8ff', borderRadius:'10px', textAlign:'center'}}>
            <h3>총 결제 금액: <span style={{color:'var(--main-color)', fontSize:'28px'}}>{totalAmount.toLocaleString()}원</span></h3>
            <button className="btn" style={{marginTop:'20px', padding:'15px 50px', fontSize:'18px'}} onClick={order}>주문하기</button>
          </div>
      )}
    </div>
  )
}


export default Cart 















// import {useState, useEffect} from 'react';
// import {useNavigate} from "react-router-dom";



// function Cart() {
//   const userId = localStorage.getItem('userId');
//   const userName = localStorage.getItem('userName');

//   const [items, setItems] = useState([]);
//   const [checkItem,setCheckItem] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!userId) {
//       alert('로그인이 필요합니다.');
//       navigate('/login');
//       return;
//     }
//     fetchCart();
//   }, []);
  
//   const fetchCart = async () => {
//     try {
//       const response = await fetch(`http://localhost:8080/cart/${userId}`);
      
//       if (!response.ok) {
//         throw new Error('장바구니 조회 실패');
//       }
      
//       const data = await response.json();
    
//       const cartItems = Array.isArray(data[0]) ? data[0] : data;
//       setItems(cartItems);
//       setCheckItem(cartItems.map(item => item.id));
//     } catch (error) {
//       console.error('장바구니 조회 실패:', error);
//       setItems([]);
//     }
//   };
  
//   const checkProduct = (id) =>{
//     setCheckItem(prev=>prev.includes(id)
//       ? prev.filter(item=>item!==id)
//       : [...prev, id]);
//   };

//   const allCheckProduct = (e)=>{
//     if(e.target.checked){
//       const avliableItems = items
//       .filter(item => item.stock > 0)
//       .map(item => item.id);
//       setCheckItem(items.map(item=>item.id));
//     } else{
//       setCheckItem([]);
//     }
//   };

//   const cartDelete = async (pId) => {
//     try {
//       const response = await fetch('http://localhost:8080/cart/delete', {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ pId, userId }),
//       });
//       const result = await response.json();
//       if (result.result) {
//         fetchCart();
//       }
//     } catch (error) {
//       console.error('장바구니 삭제 실패:', error);
//     }
//   };

//     async function updateAmount(id, newAmount) {
//     try{
//       const response = await fetch('http://localhost:8080/cart/update', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           pId: id, 
//           amount: newAmount,
//           userId: userId}),
//       });
//       const result = await response.json();
//       if (result.result) {
//         fetchCart();
//       }else{
//         alert(result.message || result.error);
//       }
      
//     }catch(error){
//       console.error('수량 변경 실패:', error);
//     }
//   };

//   const totalAmount = items
//     .filter(item => checkItem.includes(item.id))
//     .reduce((sum, item) => sum + item.price * item.amount, 0);

//     const checkedCount = checkItem.length;

//   const order = () => {
//     if(checkedCount === 0){
//       alert('주문할 상품을 선택해주세요');
//       return;
//     }
//     const selectedItems = items.filter(item => checkItem.includes(item.id));
//     const outStock = selectedItems.filter(item => {
//       return item.stock === 0 || item.stock < item.amount;
//     });
//     if(outStock.length > 0){
//       const itemNames = outStock.map(item => item.name).join(', ');
//       alert(`재고가 부족합니다:\n${itemNames}\n\n품절 상태입니다.`);
//       return;
//     }
//     navigate('/order', { state: { selectedItems: selectedItems } });
//   }
//   return (
//     <div style={{maxWidth:'800px', margin:'0 auto'}}>
//       <h2 style={{textAlign:'center', margin:'30px 0'}}>장바구니</h2>
      
//       {items.length === 0 ? (
//         <div style={{textAlign:'center', padding:'50px', backgroundColor:'#f9f9f9', borderRadius:'10px'}}>
//           <p>장바구니가 비었습니다.</p>
//           <button className="btn" style={{marginTop:'20px'}} onClick={()=>navigate('/')}>쇼핑하러 가기</button>
//         </div>
//       ):(
//         <>
//           <div style={{marginBottom:'15px', padding:'10px', borderBottom:'2px solid var(--main-color)'}}>
//             <label style={{fontWeight:'bold', cursor:'pointer'}}>
//               <input type="checkbox" onChange={allCheckProduct} checked={checkedCount === items.length} style={{marginRight:'10px'}}/>
//               전체선택 ({checkedCount}/{items.length})
//             </label>
//           </div>

//           <ul style={{padding:0}}>
//             {items.map((item)=>(
//               <li key={item.id} style={{display:'flex', gap:'20px', padding:'20px', borderBottom:'1px solid #eee', alignItems:'center'}}>
//                 <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
//                   <input type="checkbox" 
//                     checked={checkItem.includes(item.id)} 
//                     onChange={() => checkProduct(item.id)}/>
//                   <img src={item.image} alt={item.name}
//                   style={{
//                   width: '100px',
//                   height: '100px',
//                   objectFit: 'cover',
//                   opacity: item.stock === 0 ? 0.5 : 1
//                   }}/>
//                 </div>
//                 <div>
//                   {item.stock === 0 ? (
//                       <p style={{ color: 'red', fontWeight: 'bold' }}>❌ 일시 품절</p>
//                     ) : item.stock < item.amount ? (
//                       <p style={{ color: 'orange', fontWeight: 'bold' }}>
//                         ⚠️ 재고 부족 (재고: {item.stock}개)
//                       </p>
//                     ) : item.stock <= 5 ? (
//                     <p style={{ color: 'orange' }}>🔥품절 임박🔥<br/>재고: {item.stock}개</p>
//                     ) : (
//                     <p style={{ color: 'green' }}></p>
//                     )}
//                 </div>
//                 <div style={{flex:1}}>
//                   <h4 style={{margin:'0 0 5px 0'}}>{item.name}</h4>
//                   <p style={{fontWeight:'bold', color:'var(--main-color)'}}>{item.price.toLocaleString()}원</p>
//                 </div>
//                 <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'10px'}}>
//                   <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
//                     <button className="btn" style={{padding:'2px 8px', backgroundColor:'#ddd', color:'black'}} 
//                         onClick={() => updateAmount(item.id, item.amount - 1)} disabled={item.amount <= 1}>-</button>
//                     <span style={{minWidth:'20px', textAlign:'center'}}>{item.amount}</span>
//                     <button className="btn" style={{padding:'2px 8px', backgroundColor:'#ddd', color:'black'}} 
//                         onClick={() => updateAmount(item.id, item.amount + 1)}>+</button>
//                   </div>
//                   <button className="btn" style={{backgroundColor:'#ff6b6b', fontSize:'12px', padding:'5px 10px'}} onClick={() => cartDelete(item.id)}>삭제</button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </>
//       )}

//       {items.length > 0 && (
//           <div style={{marginTop:'40px', padding:'30px', backgroundColor:'#f0f8ff', borderRadius:'10px', textAlign:'center'}}>
//             <h3>총 결제 금액: <span style={{color:'var(--main-color)', fontSize:'28px'}}>{totalAmount.toLocaleString()}원</span></h3>
//             <button className="btn" style={{marginTop:'20px', padding:'15px 50px', fontSize:'18px'}} onClick={order}>주문하기</button>
//           </div>
//       )}
//     </div>
//   )
// }


// export default Cart 