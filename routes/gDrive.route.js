const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { google } = require("googleapis");
const { Readable } = require("stream");
const AuthGuard = require("../middlewares/AuthGuard");
require("dotenv").config();

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Upload a file to the google drive folder
router.post("/upload", async (req, res) => {
  const file = req.files?.pdf;
  const fileName = file?.name;
  const mimeType = file?.mimetype;
  const buffer = file.data;

  // Upload to google drive
  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  const fileMetadata = {
    name: fileName,
    mimeType: mimeType,
    parents: ["1Cy-o8C1ReGrFzZ8jMoPvvNKmuthBvs8O"],
  };

  const media = {
    mimeType: mimeType,
    body: Readable.from(buffer),
  };
  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });
    const fileId = response.data.id;
    const addedPhoto = {
      id: fileId,
      name: fileName,
      mimeType: mimeType,
    };

    res.status(200).json({
      success: true,
      message: "Uploaded Successfully!",
      data: addedPhoto,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a file from the google drive
// router.delete(
//   "/:courseId/:materialId/:driveId",
//   adminTeacherGuard,
//   async (req, res) => {
//     const fileId = req.params.driveId;
//     try {
//       const drive = google.drive({
//         version: "v3",
//         auth: oauth2Client,
//       });
//       await drive.files.delete({ fileId: fileId });

//       const course = await Course.findById(req.params.courseId);
//       if (!course) {
//         res.status(404).json({ success: false, error: "Course not found" });
//         return;
//       }
//       // UPDATE course and remove material from course
//       const updatedCourse = await Course.findByIdAndUpdate(
//         req.params.courseId,
//         {
//           $pull: { materials: req.params.materialId },
//         },
//         { new: true }
//       );
//       if (!updatedCourse) {
//         res.status(404).json({ success: false, error: "Course not found" });
//         return;
//       }
//       // DELETE material
//       const material = await Material.findByIdAndDelete(req.params.materialId);
//       if (!material) {
//         res.status(404).json({ success: false, error: "Material not found" });
//         return;
//       }
//       res
//         .status(200)
//         .json({ success: true, message: "Material deleted successfully" });
//     } catch (error) {
//       res.status(500).json({ success: false, error: error.message });
//     }
//   }
// );

// Get all files from the google drive folder
// router.get("/files-folder", AuthGuard, async (req, res) => {
//   const folderId = req.query.folderId;
//   try {
//     const drive = google.drive({
//       version: "v3",
//       auth: oauth2Client,
//     });
//     const response = await drive.files.list({
//       q: `'${folderId}' in parents`,
//       fields: "files(id, name, mimeType, webViewLink, name)",
//     });
//     res.status(200).json({ success: true, data: response.data.files });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

router.get("/download/:id", AuthGuard, async (req, res) => {
  const fileId = req.params.id;
  try {
    const drive = google.drive({
      version: "v3",
      auth: oauth2Client,
    });
    const response = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );
    response.data
      .on("end", () => {
        console.log("Done");
      })
      .on("error", (err) => {
        console.log("Error", err);
      })
      .pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
