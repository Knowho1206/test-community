import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import Layout from "../components/Layout";

export default function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        client.get(`/posts/${id}`)
            .then(res => {
                setTitle(res.data.title);
                setContent(res.data.content);
            })
            .catch(err => {
                console.error(err);
                alert("게시글 불러오기 실패");
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await client.put(`/posts/${id}`, { title, content });
            navigate(`/posts/${id}`);
        } catch (err) {
            console.error(err);
            alert("수정 실패");
        }
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">글 수정</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    className="w-full p-2 border rounded"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="제목"
                />
                <textarea
                    className="w-full p-2 border rounded"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="내용"
                    rows={6}
                />
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                    수정 완료
                </button>
            </form>
        </Layout>
    );
}
