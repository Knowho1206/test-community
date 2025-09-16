import { Link } from "react-router-dom";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            <nav className="bg-sky-500 text-white p-4 flex justify-between">
                <Link to="/" className="font-bold">Community</Link>
                <div className="space-x-4">
                    <Link to="/new">새 글</Link>
                    <Link to="/login">로그인</Link>
                </div>
            </nav>
            <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </div>
    );
}