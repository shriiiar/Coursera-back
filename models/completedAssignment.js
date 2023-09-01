const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const CompletedAssignmentSchema = new Schema(
	{
		courseId:
		{
			type: Schema.Types.ObjectId,
			ref: "courses",
		},
		milestoneId:
		{
			type: Schema.Types.ObjectId,
			ref: "milestones",
		},
		moduleId:
		{
			type: Schema.Types.ObjectId,
			ref: "modules",
		},
		videoId:
		{
			type: Schema.Types.ObjectId,
			ref: "videos",
		},
		assignmentId:
		{
			type: Schema.Types.ObjectId,
			ref: "assignments",
		},
		markId:
		{
			type: Schema.Types.ObjectId,
			ref: "marks",
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users",
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: "users",
		},
		pdf:
		{
			name: String,
			mimeType: String,
			id: String
		},
	},
	{
		timestamps: true,
	}
);

// Export Course model
const CompletedAssignment = mongoose.model("completedAssignments", CompletedAssignmentSchema);
module.exports = CompletedAssignment;