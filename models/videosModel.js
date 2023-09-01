const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const videosSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "users",
		},
		courseId: {
			type: Schema.Types.ObjectId,
			ref: "courses",
		},
		moduleId: {
			type: Schema.Types.ObjectId,
			ref: "modules",
		},
		assignments: {
			type: Schema.Types.Array,
			ref: "assignments"
		},
		name: {
			type: String,
			trim: true,
			required: true,
		},
		description: {
			type: String,
			trim: true,
		},
		url: {
			type: String,
			required: true,
		},
		totalTimes: {
			type: String,
			trim: true,
		},
		isQuiz: {
			type: Boolean,
			default: false,
		},
		contest: [
			{
				type: Schema.Types.ObjectId,
				ref: "contests",
			},
		],
		quizzes: [
			{
				type: Schema.Types.ObjectId,
				ref: "quizzes",
			},
		],
	},
	{
		timestamps: true,
	}
);

// Export videos model
const Videos = mongoose.model("videos", videosSchema);
module.exports = Videos;
