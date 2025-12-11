import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [isLogin, setIsLogin] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // 서버 확인 중


    useEffect(() => {

        // 먼저 localStorage에 로그인 정보가 있으면 바로 사용
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsLogin(true);
            // setLoading(false);
            // return;
        }
         // ✅ 무조건 서버에 세션 확인
    fetch("http://localhost:8080/users", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            if (data.result && data.user) {
                setUser(data.user);
                setIsLogin(true);
                localStorage.setItem("user", JSON.stringify(data.user));
            } else {
                // 서버 세션 없으면 전부 초기화
                setUser(null);
                setIsLogin(false);
                localStorage.removeItem("user");
            }
        })
        .catch(err => {
            console.log(err);
            setUser(null);
            setIsLogin(false);
            localStorage.removeItem("user");
        })
        .finally(() => setLoading(false));
}, []);


    //     // 서버에 세션 확인 요청
    //     fetch("http://localhost:8080/users", { credentials: "include" })
    //         .then(res => {
    //             if (!res.ok) throw new Error("로그인이 필요합니다");
    //             return res.json();
    //         })
    //         .then(data => {
    //             if (data.user) {
    //                 setUser(data.user);
    //                 setIsLogin(true);
    //                 localStorage.setItem("user", JSON.stringify(data.user)); // localStorage 저장
    //             }
    //         })
    //         .catch(err => console.log(err))
    //         .finally(() => setLoading(false));
    // }, []);


   

    // 로그인 시 서버에 로그인 요청 + 유저 정보 가져오기
    const login = async (id, pw) => {
        try {
            const res = await fetch ("http://localhost:8080/users/login", {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                credentials: 'include',
                body: JSON.stringify({ id, pw }), // 서버에 로그인
            });
            const data = await res.json();

            if (data.result) {
                const userRes = await fetch ("http://localhost:8080/users", {
                 credentials: 'include',   
                });
                const userData = await userRes.json();

                if (userData?.user) {
                    setIsLogin(true);
                    setUser(userData.user); // 이 유저가 삭제하는 곳 등에서 즉시 사용 가능하게 해줌
                    localStorage.setItem("user", JSON.stringify(userData.user));
                }
            }
            return data.result;
        } catch (err) {
            console.log ("로그인 실패 , err");
            return false;
        }
    } ;





    const logout = async () => {
        const res = await fetch("http://localhost:8080/users/logout", {
            method: "POST",
            credentials: "include",
        });
        const data = await res.json();
        if (data.result) {
            alert("로그아웃 되었습니다");
            setIsLogin(false);
            setUser(null);
            localStorage.removeItem("user");
        }
    };

    return (
        <AuthContext.Provider value={{ isLogin, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
export { AuthContext };
