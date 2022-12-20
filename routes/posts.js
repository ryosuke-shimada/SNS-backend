const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//投稿作成する
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

//投稿を更新する
router.put("/:id", async (req, res) => {
    try {
        //投稿したidを取得
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("投稿編集に成功しました");
        } else {
            res.status(403).json("他の人の投稿を編集することは出来ません");
        }
    } catch (err) {
        res.status(403).json(err);
    }
});

//投稿を削除する
router.delete("/:id", async (req, res) => {
    try {
        //投稿したidを取得
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("投稿を削除しました");
        } else {
            res.status(403).json("あなたは他の人の投稿を削除出来ません");
        }
    } catch (err) {
        res.status(403).json(err);
    }
});

//特定の投稿情報を取得する
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
});

//投稿にいいねを押す
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        //まだ投稿にいいねが押されていなかったら
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("投稿にいいねをしました");
            //すでにいいねが押されていたら
        } else {
            //いいねしているユーザーを取り除く
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("いいねをやめました");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//フォローしている人の投稿をタイムラインに表示
router.get("/timeline/all", async (req, res) => {
    try {
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        // currentUserで取得した人の投稿を全て引っ張ってくる
        // 自分がフォローしている友達の投稿内容を全て取得
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userId: friendId });
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts));
        // concat　配列を組み合わせる
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get("/", (req, res) => {
    console.log("post page");
});

module.exports = router;
