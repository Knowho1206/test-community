import { Link } from "react-router-dom";

export default function PostCards({ posts }) {
    return (
        <div className="space-y-4" onClick={() => console.log(posts)}>
            {posts.map((post) => (
                <Link
                    key={post.id}
                    to={`/posts/${post.id}`}
                    className="block p-4 bg-white rounded-lg shadow hover:bg-gray-100"
                >
                    <h2 className="text-lg font-semibold">{post.title}</h2>
                    <p className="text-gray-600">{post.excerpt}</p>
                </Link>
            ))}
        </div>
    );
}
