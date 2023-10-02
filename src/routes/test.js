const express = require("express");
const router = express.Router();

const test_controller = require("../controllers/testController");


router.get("/image", test_controller.test_image);

router.get("/video", test_controller.test_video);

module.exports = router;