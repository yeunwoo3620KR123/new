import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Product() {
    const navigate = useNavigate();
    const [pName, setpName] = useState("")
    const [pPrice, setpPrice] = useState("")
    const [description, setdescription] = useState("")
    const [stock, setStock] = useState("")
    const [image, setImage] = useState(null);

    function saveProduct() {
        if (!pName.trim() || !pPrice.trim()) { alert("상품명, 가격은 필수 입력입니다"); return; }
        if (isNaN(pPrice.trim())) { alert ("가격은 숫자로 입력해주세요"); return; }
        if (stock && isNaN(stock.trim())) { alert ("재고는 숫자로 입력해주세요"); return; }

        const formData = new FormData();
        formData.append("pName", pName.trim());
        formData.append("pPrice", pPrice.trim());
        formData.append("description", description.trim() || "");
        formData.append("stock", stock.trim() || 0);
        if(image){ formData.append("image", image); }

        fetch("http://localhost:8080/main/addmain", {
            method: "POST",
            body: formData,
        })
            .then(res => res.json())
            .then(data => {
                alert("상품 등록 성공!");
                console.log("상품등록", data);
                navigate('/');
            })
            .catch(err => console.error("상품등록 에러:", err));
    }

    return (
        <div style={{maxWidth:'500px', margin:'50px auto'}}>
            <h1 style={{textAlign:'center', marginBottom:'30px'}}>상품 등록 (관리자)</h1>
            
            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                <div style={{textAlign:'center', padding:'20px', border:'2px dashed #ddd', borderRadius:'10px'}}>
                    {image ? (
                        <img src={URL.createObjectURL(image)} alt="미리보기" style={{width:'150px', height:'150px', objectFit:'cover', marginBottom:'10px', borderRadius:'10px'}} />
                    ) : <p style={{color:'#aaa'}}>이미지 미리보기</p>}
                    
                    <input type="file" className="input" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{marginTop:'10px'}}/>
                </div>

                <div>
                    <label style={{fontWeight:'bold'}}>상품명</label>
                    <input className="input" value={pName} onChange={(e) => setpName(e.target.value)} placeholder="상품명 입력"/>
                </div>
                
                <div>
                    <label style={{fontWeight:'bold'}}>가격</label>
                    <input className="input" type="number" value={pPrice} onChange={(e) => setpPrice(e.target.value)} placeholder="가격 입력 (숫자)"/>
                </div>

                <div>
                    <label style={{fontWeight:'bold'}}>재고수량</label>
                    <input className="input" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="재고 수량"/>
                </div>

                <div>
                    <label style={{fontWeight:'bold'}}>상품 설명</label>
                    <textarea className="input" value={description} onChange={(e) => setdescription(e.target.value)} placeholder="상품 상세 설명" style={{height:'100px'}}/>
                </div>

                <button className="btn" style={{marginTop:'20px'}} onClick={saveProduct}>상품 등록 완료</button>
            </div>
        </div>
    )
}

export default Product;