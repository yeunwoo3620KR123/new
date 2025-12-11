import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function Search() {
    const [result, setResult] = useState([]);
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get("keyword") || "";

    useEffect(() => {
        async function load() {
            const response = await fetch(`http://localhost:8080/main/search?keyword=${keyword}`);
            const data = await response.json();
            setResult(data);
        }
        load();
    }, [keyword]);

    return (
        <>
            <h2>검색 하신 "{keyword}" 상품</h2>
            <div className="grid">
            {result.length === 0 && <p>검색 결과 없음</p>}
            {result.map(item => (
                <div key={item.pId} className="card">
                    <img 
                    src={item.img}
                    alt={item.pName} 
                    className="card-img"
                    />
                    <div className="card-body">
                        <div className="card-title">{item.pName}</div>
                        <div className="card-price">{Number(item.pPrice).toLocaleString()}원</div>
                    </div>
                </div>
            ))}
            </div>
        </>
    );
}

export default Search;