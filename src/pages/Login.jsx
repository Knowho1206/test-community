import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:3000/api/me", { withCredentials: true })
            .then(res => setUser(res.data))
            .catch(() => setUser(null));
    }, []);

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:3000/auth/google";
    };

    return (
        <div className="p-4">
            {user ? (
                <div>
                    <h1 className="text-xl font-bold">안녕하세요, {user.name}님!</h1>
                    <img src={user.picture} alt="profile" className="w-16 h-16 rounded-full mt-2" />
                </div>
            ) : (
                <button
                    onClick={handleGoogleLogin}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                >
                    구글로 로그인
                </button>
            )}
        </div>
    );
}