const Queue = require('bull');

const myQueue = new Queue('myQueue');

myQueue.process(async (job) => {
  const { video, user } = job.data;

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
  execSync(`del uploads\\${user.id}\\* /Q`);

  let new_record = {
    userid: user.id, 
    type:'video', 
    name: `${upload_name}.mp4`, 
    date: moment(new Date()).format('yyyy-MM-DD HH:mm:ss')
  };
  records.push(new_record);

  console.log(new_record);
});

module.exports = myQueue;