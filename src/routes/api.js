const express = require("express");
const router = express.Router();

const api_controller = require("../controllers/apiController");

router.post("/login", api_controller.login_controller);

router.post("/upload/video", api_controller.upload_video);
router.get("/download/video", api_controller.download_video);

router.post("/upload/image", api_controller.upload_image);
router.get("/download/image", api_controller.download_image);

router.get("/records", api_controller.records);

module.exports = router;