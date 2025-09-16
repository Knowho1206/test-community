import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import Layout from "../components/Layout";

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [replyContent, setReplyContent] = useState({});
    const [replyingTo, setReplyingTo] = useState(null); // 현재 답글 작성 중인 댓글 id

    const fetchData = async () => {
        try {
            const postRes = await client.get(`/posts/${id}`);
            setPost(postRes.data);

            const commentsRes = await client.get(`/posts/${id}/comments`);
            setComments(commentsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 글 가져오기
        client.get(`/posts/${id}`)
            .then(res => setPost(res.data))
            .catch(err => console.error(err));

        // 로그인 사용자 가져오기
        client.get("/me")
            .then(res => setMe(res.data))
            .catch(() => setMe(null))
            .finally(() => setLoading(false));

        fetchData();
    }, [id]);

    const handleDeletePost = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await client.delete(`/posts/${id}`);
            navigate("/"); // 삭제 후 홈으로 이동
        } catch (err) {
            console.error(err);
            alert("삭제 실패");
        }
    };

    // 댓글 작성
    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        try {
            await client.post(`/posts/${id}/comments`, { content: newComment });
            setNewComment("");
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    // 대댓글 작성
    const handleReplySubmit = async (parentId) => {
        if (!replyContent[parentId]?.trim()) return;
        try {
            await client.post(`/posts/${id}/comments`, {
                content: replyContent[parentId],
                parentId: parentId
            });
            setReplyContent(prev => ({ ...prev, [parentId]: "" }));
            setReplyingTo(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            await client.delete(`/comments/${commentId}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <Layout>⏳ 로딩 중...</Layout>;
    if (!post) return <Layout>게시글이 존재하지 않습니다.</Layout>;

    const isAuthor = me?.id === post.authorId;

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            <p className="text-gray-700 mb-4">{post.content}</p>
            <p className="text-sm text-gray-500">작성자: {post.author?.name ?? "알 수 없음"}</p>

            {isAuthor && (
                <div className="mt-4 space-x-2">
                    <button
                        className="px-4 py-2 bg-yellow-400 text-white rounded"
                        onClick={() => navigate(`/edit/${id}`)}
                    >
                        수정
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded"
                        onClick={handleDeletePost}
                    >
                        삭제
                    </button>
                </div>
            )}

            {/* 댓글 영역 */}
            <div className="mt-8">
                <h2 className="font-bold mb-2">댓글</h2>
                <div className="space-y-4">
                    {comments.map(comment => {
                        const isCommentAuthor = me?.id === comment.authorId;
                        return (
                            <div key={comment.id} className="border p-2 rounded">
                                <p>
                                    <strong>{comment.author.name}</strong>: {comment.content}
                                    {isCommentAuthor && (
                                        <button
                                            className="ml-2 text-red-500"
                                            onClick={() => handleDeleteComment(comment.id)}
                                        >
                                            삭제
                                        </button>
                                    )}
                                    <button
                                        className="ml-2 text-blue-500"
                                        onClick={() => setReplyingTo(comment.id)}
                                    >
                                        답글
                                    </button>
                                </p>

                                {/* 대댓글 */}
                                {comment.replies.map(reply => {
                                    const isReplyAuthor = me?.id === reply.authorId;
                                    return (
                                        <div key={reply.id} className="ml-4 border-l pl-2 mt-2">
                                            <p>
                                                <strong>{reply.author.name}</strong>: {reply.content}
                                                {isReplyAuthor && (
                                                    <button
                                                        className="ml-2 text-red-500"
                                                        onClick={() => handleDeleteComment(reply.id)}
                                                    >
                                                        삭제
                                                    </button>
                                                )}
                                            </p>
                                        </div>
                                    );
                                })}

                                {/* 답글 입력창 */}
                                {replyingTo === comment.id && (
                                    <div className="ml-4 mt-2">
                                        <textarea
                                            rows={2}
                                            className="w-full p-2 border rounded"
                                            value={replyContent[comment.id] || ""}
                                            onChange={(e) =>
                                                setReplyContent(prev => ({
                                                    ...prev,
                                                    [comment.id]: e.target.value
                                                }))
                                            }
                                            placeholder="답글 작성..."
                                        />
                                        <button
                                            className="mt-1 px-3 py-1 bg-blue-500 text-white rounded"
                                            onClick={() => handleReplySubmit(comment.id)}
                                        >
                                            답글 등록
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 새 댓글 작성 */}
                <div className="mt-4">
                    <textarea
                        className="w-full p-2 border rounded"
                        placeholder="댓글 작성..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                    />
                    <button
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                        onClick={handleCommentSubmit}
                    >
                        댓글 작성
                    </button>
                </div>
            </div>
        </Layout>
    );
}
