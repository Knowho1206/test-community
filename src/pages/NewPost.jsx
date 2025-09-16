import { useState } from "react";
import client from "../api/client";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function NewPost() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await client.post("/posts", { title, content });
            const res = await client.post("/posts", { title, content });
            setMessage("✅ 게시글 작성 완료!");
            setTitle("");
            setContent("");
            navigate(`/posts/${res.data.id}`);
        } catch (err) {
            console.error(err);
            setMessage("❌ 게시글 작성 실패: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">새 게시글 작성</h1>
            {message && <p className="mb-4">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    className="w-full p-2 border rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목"
                    required
                />
                <textarea
                    className="w-full p-2 border rounded h-40"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="내용"
                    required
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "작성중..." : "게시글 작성"}
                </button>
            </form>
        </Layout>
    );
}
