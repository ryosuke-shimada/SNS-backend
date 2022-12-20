const router = require("express").Router();
const User = require("../models/User");

//ユーザー情報の更新
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("ユーザー情報が更新されました");
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("自分のアカウント情報のみを更新出来ます");
    }
});

//ユーザー情報の消去
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("アカウントが削除されました");
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("自分のアカウントのみ削除できます");
    }
});

//ユーザー情報を取得
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { passward, updatedAt, ...other } = user._doc;
        //パスワードと必要ない項目を表示しない
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

//ユーザーをフォローする
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            //フォロワーにいなかったらフォローできる
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({
                    $push: { followers: req.body.userId },
                });
                await currentUser.updateOne({
                    $push: { followings: req.params.id },
                });
                res.status(200).json("フォローしました");
            } else {
                return res
                    .status(403)
                    .json("このユーザーをすでにフォローしています");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(500).json("自分自身をフォローできません");
    }
});

//フォロー解除
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            //フォロワーにいたらフォロー外せる
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({
                    $pull: { followings: req.params.id },
                });
                res.status(200).json("フォロー解除しました");
            } else {
                return res
                    .status(403)
                    .json("このユーザーはフォロー解除できません");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(500).json("自分自身をフォロー解除できません");
    }
});

module.exports = router;
