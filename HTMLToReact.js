const fs = require('fs');
const path = require('path')

const args = process.argv.slice(2)

let inputDir = args[0];
let outputDir = args[1];

let files = [];

const copyFile = (source, target) => {

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  const done = (err = "") => {
    if(err != ""){
      console.log(err);
    }
    return;
  };
};
const getAllFiles = (inputDirectory) =>{
  fs.readdir(inputDirectory, (err, filesList) => {
    if(err == null){
      filesList.forEach(file => {
        files.push(inputDirectory.replace(inputDir,"") + "\\" + file)
        if(path.extname(file) == ""){
          if (!fs.existsSync((outputDir + inputDirectory.replace(inputDir,"") + "\\" + file))){
            fs.mkdirSync((outputDir + inputDirectory.replace(inputDir,"") + "\\" + file));
          }
          getAllFiles(inputDirectory + "\\" + file);
        }
        else{
          copyFile((inputDirectory + "\\" + file), (outputDir + inputDirectory.replace(inputDir,"") + "\\" + file));
        }
      });
    };
  });
};


getAllFiles(inputDir);
