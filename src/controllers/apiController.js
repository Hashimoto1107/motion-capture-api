const asyncHandler = require("express-async-handler");
const { exec, execSync } = require("child_process");
const { stderr } = require("process");
const fileSystem = require("fs");
const path = require("path");
const { response } = require("express");
const moment = require("moment/moment");
const { result } = require("lodash");

// Test user datas
const users = [
  { id:1,  username: 'user1', password: 'qwer1234', token: 'token1234'}
];

let records = [
  { userid: 1, type:'image', name: '7f45e8_1694532520128_rendered.jpg', date:'2023-09-19 12:20:15'},
  { userid: 1, type:'image', name: '7f45e8_1695091078022_rendered.jpg', date:'2023-09-19 12:20:17'},
  { userid: 1, type:'image', name: '7f45e8_1695091565694_rendered.jpg', date:'2023-09-19 12:20:52'},
  { userid: 1, type:'video', name: '258a85_1695092212640.mp4', date:'2023-09-19 12:20:24'},
  { userid: 1, type:'video', name: '258a85_1695635169953.mp4', date:'2023-09-25 12:20:21'},
  { userid: 1, type:'video', name: 'bb0c57_1695694558128.mp4', date:'2023-09-26 10:32:43'},
  { userid: 1, type:'video', name: 'bb0c57_1695693359505.mp4', date:'2023-09-26 10:33:03'},
];

/**
 * Login process
 */
exports.login_controller = asyncHandler(async (req, res, next) => {
  const  { username, password } = req.body;
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    res.status(200).json({ token: user.token, message: 'Login successful!' });
    
  } else {
    res.status(401).json({ message: 'Invalid credentials!' });
  }
});

/**
 * Get records list
 */
exports.records = asyncHandler(async (req, res, next) => {
  try {
    if(!req.query || !req.query.token ) {
      res.status(404).send({
          message: 'Invalid request'
      });
      return;
    }

    let user = users.find(obj => obj.token === req.query.token);
    if (user === undefined) {
      res.status(404).send({
          message: 'Invalid token'
      });
      return;
    }

    let user_recrods = records.filter(obj => obj.userid === user.id);
    res.status(200).send(user_recrods);
  } catch(err) {
    res.status(404).send({
      message: 'The file is not exist'
    });
    //res.status(500).send(err);
  }
});

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function processVideo(video, user) {
  let black_bg = ""; //" --disable_blending 1 "; // 0 or 1

  let extension = video.name.split('.').pop();
  let upload_name = new Date().getTime() + "_" + video.md5.substring(0, 6);

  var upload_dir = path.join(__dirname, `\\..\\..\\uploads\\${user.id}`);
  if (!fileSystem.existsSync(upload_dir)) {
    fileSystem.mkdirSync(upload_dir);
  }
  var output_dir = path.join(__dirname, `\\..\\..\\output\\${user.id}`);
  if (!fileSystem.existsSync(output_dir)) {
    fileSystem.mkdirSync(output_dir);
  }
  await video.mv(`./uploads/${user.id}/` + upload_name + "." + extension);

  var filePath = path.join(__dirname, `\\..\\..\\output\\${user.id}\\${upload_name}.avi`);
  var mpgFilePath = path.join(__dirname, `\\..\\..\\output\\${user.id}\\${upload_name}.mp4`);

  // for windows command 
  //execSync(`del output\\${user.id}\\* /Q`);

  const stdout = execSync(`engine\\bin\\OpenPoseDemo.exe --video uploads\\${user.id}\\${upload_name}.${extension} --write_video "${filePath}" ${black_bg} --model_folder engine\\models\\`);
  //const stdout = execSync(`engine\\bin\\OpenPoseDemo.exe --video uploads\\${upload_name}.${extension} --write_json output --model_folder engine\\models\\`);
  const stdout2 = execSync(`engine\\ffmpeg.exe -i output\\${user.id}\\${upload_name}.avi -strict -2 output\\${user.id}\\${upload_name}.mp4`);
  //execSync(`del uploads\\${user.id}\\* /Q`);

  let new_record = {
    userid: user.id, 
    type:'video', 
    name: `${upload_name}.mp4`, 
    date: moment(new Date()).format('yyyy-MM-DD HH:mm:ss')
  };
  records.push(new_record);

  console.log(new_record);
}

/**
 * Processing a video
 */
exports.upload_video = (req, res, next) => {
  try {
    console.log(req.body);
    if(!req.body || !req.body.token ) {
      res.status(404).send({
          message: 'Invalid request'
      });
      return;
    }

    let user = users.find(obj => obj.token === req.body.token);
    if (user === undefined) {
      res.status(404).send({
          message: 'Invalid token'
      });
      return;
    }

    if(!req.files) {
        res.send({
            status: false,
            message: 'No image file uploaded'
        });
        return;
    } 


    let video = req.files.video;

    // process video after response
    processVideo(video, user);
    
    // const promise = new Promise((resolve, reject) => {
    //   try {
    //     processVideo(user, upload_name, extension);
    //     resolve("processing video is ok");
    //   } catch (error) {
    //     reject(error);
    //   }
    // });
    // promise.then((result) => {
    //   console.log(result);
    // }).catch((err) => {
    //   console.error(err);
    // });

    res.status(200).send({
      filename: `Uploaded successfully`
    });

  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

/**
 *  Processing an image
 */
exports.upload_image = asyncHandler(async (req, res, next) => {
  try {
    if(!req.body || !req.body.token ) {
      res.status(404).send({
          message: 'Invalid request'
      });
      return;
    }

    let user = users.find(obj => obj.token === req.body.token);
    if (user === undefined) {
      res.status(404).send({
          message: 'Invalid token'
      });
      return;
    }

    if(!req.files) {
        res.send({
            status: false,
            message: 'No image file uploaded'
        });
        return;
    } 
    
    let photo = req.files.photo;
    let extension = photo.name.split('.').pop();
    let upload_name = photo.md5.substring(0, 6) + "_" + new Date().getTime();

    var upload_dir = path.join(__dirname, `\\..\\..\\uploads\\${user.id}`);
    if (!fileSystem.existsSync(upload_dir)) {
      fileSystem.mkdirSync(upload_dir);
    }
    var output_dir = path.join(__dirname, `\\..\\..\\output\\${user.id}`);
    if (!fileSystem.existsSync(output_dir)) {
      fileSystem.mkdirSync(output_dir);
    }
    
    await photo.mv(`./uploads/${user.id}/` + upload_name + "." + extension);

    processVideo();

    // for windows command 
    //execSync(`del output\\${user.id}\\* /Q`);
    /**
     * Options
     * --disable_blending 1 (If enabled, it will render the results on a black background)
     */
    const stdout = execSync(`engine\\bin\\OpenPoseDemo.exe --image_dir uploads\\${user.id} --write_images output\\${user.id} --model_folder engine\\models\\ --write_images_format jpg`);
    //execSync(`del uploads\\${user.id}\\* /Q`);

    const rendered_name = upload_name + "_rendered.jpg";
    records.push({
      userid: user.id, 
      type:'image', 
      name: rendered_name, 
      date: moment(new Date()).format('yyyy-MM-dd HH:mm:ss')
    });
    
    res.status(200).send({
      filename: rendered_name
    });
    console.log("Processing image succeded. " + moment(new Date()).format('yyyy-MM-dd HH:mm:ss'));

  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

/**
 * Download a video
 */
exports.download_video = asyncHandler(async (req, res, next) => {
  try {
    if(!req.query || !req.query.token ) {
      res.status(404).send({
          message: 'Invalid request'
      });
      return;
    }

    let user = users.find(obj => obj.token === req.query.token);
    if (user === undefined) {
      res.status(404).send({
          message: 'Invalid token'
      });
      return;
    }

    let extension = req.query.filename.split('.').pop();
    var filePath = path.join(__dirname, `\\..\\..\\output\\${user.id}\\${req.query.filename}`);
    var stat = fileSystem.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': `video/${extension}`,
      'Content-Length': stat.size
    });
    var readStream = fileSystem.createReadStream(filePath);
    readStream.pipe(res);
  } catch (err) {
    res.status(404).send({
      message: 'The file is not exist'
    });
    //res.status(500).send(err);
  }
});

/**
 * Download an image
 */
exports.download_image = asyncHandler(async (req, res, next) => {
  try {
    if(!req.query || !req.query.token ) {
      res.status(404).send({
          message: 'Invalid request'
      });
      return;
    }

    let user = users.find(obj => obj.token === req.query.token);
    if (user === undefined) {
      res.status(404).send({
          message: 'Invalid token'
      });
      return;
    }

    let extension = req.query.filename.split('.').pop();
    var filePath = path.join(__dirname, `\\..\\..\\output\\${user.id}\\${req.query.filename}`);
    var stat = fileSystem.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': `image/${extension}`,
      'Content-Length': stat.size
    });
    var readStream = fileSystem.createReadStream(filePath);
    readStream.pipe(res);
  } catch (err) {
    res.status(404).send({
      message: 'The file is not exist'
    });
    //res.status(500).send(err);
  }
});