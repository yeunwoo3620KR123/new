import { useNavigate } from "react-router-dom"; 

function Settings() {
    const navigate = useNavigate();

    // function productclick() {
    //     navigate('/addmain')
    // }

    return (

    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '30px' }}>회원설정</h1>
        {/* <button className="btn" onClick={productclick}>상품등록창으로 이동</button> */}
        <button className="btn" onClick={() => navigate("/settings/edit")}>회원정보 수정</button> <br /> <br />
        <button className="btn" onClick={() => navigate("/settings/delete")}>회원정보 삭제</button>
    </div>
    );

}

export default Settings