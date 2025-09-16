import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import "./auth/google.js";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// 구글 로그인
app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => res.redirect("http://localhost:5173")
);

// 로그인된 유저 정보 확인
app.get("/api/me", (req, res) => {
    if (!req.user) return res.status(401).json({ message: "로그인 필요" });
    res.json(req.user);
});

// 게시글 작성
app.post("/api/posts", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "로그인 필요" });

    const { title, content } = req.body;
    try {
        const post = await prisma.post.create({
            data: { title, content, authorId: req.user.id },
        });
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "게시글 생성 실패", error: err.message });
    }
});

// 모든 게시글 가져오기
app.get("/api/posts", async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: { author: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "게시글 가져오기 실패", error: err.message });
    }
});

// 게시글 상세
app.get("/api/posts/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const post = await prisma.post.findUnique({
            where: { id: parseInt(id) },
            include: { author: true },
        });

        if (!post) return res.status(404).json({ message: "게시글이 존재하지 않습니다." });

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "게시글 조회 실패", error: err.message });
    }
});

// 글 수정
app.put("/api/posts/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "로그인 필요" });

    const { id } = req.params;
    const { title, content } = req.body;

    try {
        // 글 존재 확인
        const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
        if (!post) return res.status(404).json({ message: "게시글이 존재하지 않습니다." });

        // 작성자 확인
        if (post.authorId !== req.user.id) {
            return res.status(403).json({ message: "권한 없음" });
        }

        // 글 수정
        const updated = await prisma.post.update({
            where: { id: parseInt(id) },
            data: { title, content },
        });

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "글 수정 실패", error: err.message });
    }
});


// 글 삭제
app.delete("/api/posts/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "로그인 필요" });

    const { id } = req.params;

    try {
        const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
        if (!post) return res.status(404).json({ message: "게시글이 존재하지 않습니다." });

        // 작성자 확인
        if (post.authorId !== req.user.id) {
            return res.status(403).json({ message: "권한 없음" });
        }

        await prisma.post.delete({ where: { id: parseInt(id) } });
        res.json({ message: "게시글 삭제 완료" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "글 삭제 실패", error: err.message });
    }
});

app.post("/api/posts/:postId/comments", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "로그인 필요" });

    const { postId } = req.params;
    const { content, parentId } = req.body;

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                authorId: req.user.id,
                postId: parseInt(postId),
                parentId: parentId ? parseInt(parentId) : null,
            },
        });
        res.json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "댓글 작성 실패", error: err.message });
    }
});

app.put("/api/comments/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "로그인 필요" });

    const { id } = req.params;
    const { content } = req.body;

    try {
        const comment = await prisma.comment.findUnique({ where: { id: parseInt(id) } });
        if (!comment) return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
        if (comment.authorId !== req.user.id) return res.status(403).json({ message: "권한 없음" });

        const updated = await prisma.comment.update({
            where: { id: parseInt(id) },
            data: { content },
        });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "댓글 수정 실패", error: err.message });
    }
});

app.delete("/api/comments/:id", async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "로그인 필요" });

    const { id } = req.params;

    try {
        const comment = await prisma.comment.findUnique({ where: { id: parseInt(id) } });
        if (!comment) return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
        if (comment.authorId !== req.user.id) return res.status(403).json({ message: "권한 없음" });

        await prisma.comment.delete({ where: { id: parseInt(id) } });
        res.json({ message: "댓글 삭제 완료" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "댓글 삭제 실패", error: err.message });
    }
});

app.get("/api/posts/:postId/comments", async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await prisma.comment.findMany({
            where: { postId: parseInt(postId), parentId: null },
            include: { author: true, replies: { include: { author: true } } },
            orderBy: { createdAt: "asc" },
        });
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "댓글 조회 실패", error: err.message });
    }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));