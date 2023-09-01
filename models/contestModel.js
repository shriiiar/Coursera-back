const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const contestSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "users"
        },
        videos: {
            type: Schema.Types.ObjectId,
            ref: "videos"
        },
        name: {
            type: String,
            trim: true,
            required: true,
        },
        description: {
            type: String,
            trim: true
        },
        link: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true,
    }
);

// Export contest model
const contest = mongoose.model("contest", contestSchema);
module.exports = contest;
