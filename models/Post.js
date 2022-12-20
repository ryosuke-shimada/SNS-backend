const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            max: 500,
        },
        img: {
            type: String,
        },
        likes: {
            type: Array,
            default: [],
        },
        // 誰がいいねしたか見る為の枠組み
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
