import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";


// 여기는 로그인하고 나서 쓸 메인 페이지


function MainPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userNickname, setUserNickname] = useState("");

// 이게 원본
    useEffect(() => {
        fetch("http://localhost:8080/users/", { credentials: 'include'}) // 쿠키 전송 허용
        .then(res => {
            if (!res.ok) throw new Error("로그인이 필요합니다");
            return res.json();
        })
        .then(data => setUser(data.user))
        .catch(err => {
                alert(err.message);
                navigate('/login'); // 로그인 페이지로 이동
            });
        }, [navigate]);
   

    function settingsClick () {
        navigate('/settings');
    }

    if (!user) return <div>Loading...</div>

    return (
         <div style={{maxWidth:'600px', margin:'50px auto', textAlign:'center'}}>
            <h1 style={{marginBottom:'10px'}}>마이 페이지</h1>
            {user.admin == 1? (
                 <p style={{color:'#666', marginBottom:'40px'}}>반갑습니다, 관리자 <strong>{user?.nickname}</strong>님!</p>
            ) : (
                <p style={{color:'#666', marginBottom:'40px'}}>반갑습니다, <strong>{user?.nickname}</strong>님!</p>
            )}  
            
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                <div className="card" style={{padding:'30px', cursor:'pointer'}} onClick={() => navigate('/settings')}>
                    <h3 style={{marginBottom:'10px'}}>⚙️ 회원 설정</h3>
                    <p style={{fontSize:'14px', color:'#888'}}>내 정보 수정 및 탈퇴</p>
                </div>

                <div className="card" style={{padding:'30px', cursor:'pointer'}} onClick={() => navigate('/cart')}>
                    <h3 style={{marginBottom:'10px'}}>🛒 장바구니</h3>
                    <p style={{fontSize:'14px', color:'#888'}}>담아둔 상품 확인</p>
                </div>

                 {/* ✅ 관리자 전용 버튼 */}
                {user.admin === 1 && (
                    <div
                        className="card"
                        style={{ padding:'30px', cursor:'pointer' }}
                        onClick={() => navigate('/admin')}
                    >
                        <h3>🛠 관리자 페이지</h3>
                        <p style={{ color:'#888' }}>상품 등록 및 관리</p>
                    </div>
                )}


            </div>
        </div>
    )
}

export default MainPage



