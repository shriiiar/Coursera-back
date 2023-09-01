const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const quizzesSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        videos: {
            type: Schema.Types.ObjectId,
            ref: "videos",
        },
        question: {
            type: String,
            trim: true,
            required: true,
        },
        answers: [
            {
                name: String,
                answered: Boolean,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Export quizzes model
const Quizzes = mongoose.model("quizzes", quizzesSchema);
module.exports = Quizzes;
