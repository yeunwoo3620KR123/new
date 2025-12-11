import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

function Header() {
    const { isLogin, user, logout } = useContext(AuthContext); // Context 사용
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    // 상품 데이터 로드
    useEffect(() => {
        async function fetchProducts() {
            const response = await fetch('http://localhost:8080/pro/products');
            const result = await response.json();
            setData(Array.isArray(result[0]) ? result[0] : result);
        }
        fetchProducts();
    }, []);


    // 로그아웃 핸들러
    const handleLogout = async () => {
        await logout();  // ✅ Context logout 함수 호출
        alert('로그아웃 되었습니다.');
        navigate('/'); // 홈으로 이동
    };

    // 검색 필터링
    const filterData = data.filter(item =>
        (item.name || "").toLowerCase().includes((search || "").toLowerCase())
    );

    const onClickSearch = () => {
        console.log(
            "검색 결과:",
            data.filter(item =>
                (item.name || "").toLowerCase().includes((search || "").toLowerCase())
            )
        );
    };

function onClick() {
        const filterData = data.filter(item =>
        (item.pName || "").toLowerCase().includes((search || "").toLowerCase())// 화면에 나오게
    );

    navigate(`/search?keyword=${search}`);
    setSearchResult(filterData);
    }


    return (
        <>
            <header id="Header">

                <div className="logo">
                   <Link to="/" style={{textDecoration:'none', color:'var(--main-color)'}}>SORA MARKET</Link>                    
                </div>

                 <div style={{display:'flex', gap:'5px', flexGrow: 1, maxWidth:'400px', margin:'0 20px'}}>

                     <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)} 
                        placeholder="상품 검색하세요" 
                    />
                    <button className="btn" value={search} onClick={onClickSearch}>🔍</button>
                 </div>



                <div className="nav">
                    <ul>
                        {isLogin ? (
                            <>
                                <span style={{ fontWeight: 'bold', color: 'var(--main-color)' }}>{user?.nickname || "사용자"}님</span>
                                <li><button className="btn" style={{padding: '5px 10px', fontSize: '12px'}} onClick={handleLogout}>로그아웃</button></li>
                                <li><Link to="/cart">장바구니</Link></li>
                                <li><Link to="/mainpage">마이페이지</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/login">로그인</Link></li>
                                <li><Link to="/regist">회원가입</Link></li>
                                <li><Link to="/cart">장바구니</Link></li>
                            </>
                        )}
                    </ul>
                </div>
              
                
           
            </header>
        </>
    )
}

export default Header;

















// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";

// function Header({ isLoggedIn, userName, onLogout }) {
//     const [search, setSearch] = useState("");
//     const [data, setData] = useState([]);
//     const [searchResult, setSearchResult] = useState([]);
//     const navigate = useNavigate();

//     useEffect(() => {
//         async function fetchProducts() {
//             const response = await fetch('http://localhost:8080/pro/products');
//             const result = await response.json();
//             setData(Array.isArray(result[0]) ? result[0] : result);
//         }
//         fetchProducts();
//     }, []);

//     const handleLogout = () => {
//         onLogout();
//         alert('로그아웃 되었습니다.');
//         navigate('/');
//     };

//     function onClick() {
//         const filterData = data.filter(item =>
//         (item.pName || "").toLowerCase().includes((search || "").toLowerCase())// 화면에 나오게
//     );

//     navigate(`/search?keyword=${search}`);
//     setSearchResult(filterData);
//     }

//     return (

//         <header className="header">
//             <div className="logo">
//                 <Link to="/" style={{textDecoration:'none', color:'var(--main-color)'}}>SORA MARKET</Link>
//             </div>
//             <div style={{display:'flex', gap:'5px', flexGrow: 1, maxWidth:'400px', margin:'0 20px'}}>
//                 <input 
//                     type="text" 
//                     className="input"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)} 
//                     placeholder="상품을 검색하세요" />
//                 <button className="btn" value={search} onClick={onClick}>🔍</button> 
//             </div>
//             <nav className="nav">
//                 {isLoggedIn ? (
//                     <>
//                         <span style={{ fontWeight: 'bold', color:'var(--main-color)' }}>{userName}님</span>
//                         <Link to="/cart">장바구니</Link>
//                         <Link to="/settings">마이페이지</Link>
//                         <button className="btn" style={{padding:'5px 10px', fontSize:'12px'}} onClick={handleLogout}>로그아웃</button>
//                     </>
//                 ) : (
//                     <>
//                         <Link to="/login">로그인</Link>
//                         <Link to="/regist">회원가입</Link>
//                         <Link to="/cart">장바구니</Link>
//                     </>
//                 )}
//             </nav>
//         </header>
//     )
// }
// export default Header;