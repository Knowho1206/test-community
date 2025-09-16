import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import PostDetail from "../pages/PostDetail";
import NewPost from "../pages/NewPost";
import Login from "../pages/Login";
import EditPost from "../pages/EditPost";

export const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/posts/:id", element: <PostDetail /> },
    { path: "/new", element: <NewPost /> },
    { path: "/login", element: <Login /> },
    { path: "/edit/:id", element: <EditPost /> },
]);