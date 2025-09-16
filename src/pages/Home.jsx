import { useEffect, useState } from "react";
import client from "../api/client";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const postsRes = await client.get("/posts");
                setPosts(postsRes.data);

                const meRes = await client.get("/me");
                setUser(meRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Layout>⏳ 로딩 중...</Layout>;

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">커뮤니티 홈</h1>

            <section className="space-y-4">
                {posts.length === 0 && <p>게시글이 없습니다.</p>}
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="p-4 border rounded hover:shadow-md transition"
                    >
                        <Link to={`/posts/${post.id}`}>
                            <h2 className="text-xl font-bold">{post.title}</h2>
                        </Link>
                        <p className="text-gray-600 text-sm">
                            작성자: {post.author?.name ?? "알 수 없음"}
                        </p>
                    </div>
                ))}
            </section>
        </Layout>
    );
}
