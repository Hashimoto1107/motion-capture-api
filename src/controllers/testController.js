const asyncHandler = require("express-async-handler");

/**
 * Test Image Page
 */
exports.test_image = asyncHandler(async (req, res, next) => {
  res.send(`<!DOCTYPE html>
            <html>
            <head>
              <title>Skeleton Extracting API Test</title>
            </head>
            <body>
              <h2>Skeleton Extracting API Test - Image</h2>
              
              <form action="/api/upload/image" method="POST" enctype="multipart/form-data">
                <label for="file">Select a image:</label>
                <input type="file" id="photo" name="photo" required><br><br>
                <input hidden name="token" value="token1234"/>
                <input type="submit" value="Upload">
              </form>
            </body>
            </html>`);
});

/**
 * Test Video Page
 */
exports.test_video = asyncHandler(async (req, res, next) => {
  res.send(`<!DOCTYPE html>
            <html>
            <head>
              <title>Skeleton Extracting API Test</title>
            </head>
            <body>
              <h2>Skeleton Extracting API Test - Video</h2>
              <form action="http://146.19.207.28:3000/api/upload/video" method="POST" enctype="multipart/form-data">
                <label for="file">Select a video:</label>
                <input type="file" id="video" name="video" required><br><br>
                <input hidden name="token" value="token1234"/>
                <input type="submit" value="Upload">
              </form>
            </body>
            </html>`);  
});