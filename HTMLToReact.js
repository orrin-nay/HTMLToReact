const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2)
class modules {
  constructor() {
    this.HTMLPages = [];
    this.dirtyHTMLPages = [];
    this.Components = [];
  }
  findComponents(){
    if(this.HTMLPages.length > 1){
      //Find Similar Divs
      for(let i=0; i < this.HTMLPages.length; i++){
        let divIndex = 0;
        while(this.HTMLPages[i].indexOf("<div", divIndex + "<div".length) != -1){
          let divsFound = 1;
          let firstOpenDiv = this.HTMLPages[i].indexOf("<div", divIndex + "<div".length);
          let currentOpenDiv = firstOpenDiv;
          let currentCloseDiv = firstOpenDiv;
          while(divsFound != 0){
            if((this.HTMLPages[i].indexOf("<div", currentOpenDiv + "<div".length) < this.HTMLPages[i].indexOf("</div>", currentCloseDiv + "</div>".length))
             && this.HTMLPages[i].indexOf("<div", currentOpenDiv + "<div".length) != -1){
              currentOpenDiv = this.HTMLPages[i].indexOf("<div", currentOpenDiv + "<div".length);
              divsFound++;
            }
            else{
              divsFound--;
              if(divsFound != 0){
                  currentCloseDiv = this.HTMLPages[i].indexOf("</div>", currentCloseDiv + "</div>".length);
                }
              }
            }
            let newCompCandidate = this.HTMLPages[i].substring(firstOpenDiv, currentCloseDiv + "</div>".length);
            if(this.addComponent(newCompCandidate)){
              divIndex = currentCloseDiv + "</div>".length;
            }
            else {
              divIndex = firstOpenDiv + "<div".length;
            }
          }
        }
      }
    }
    // true = componet has already been added or was just added or that it had les that 15 tags AKA skip this section
    // false means that it wasn't found
    addComponent(newCompCandidate){
      let toReturn = false;
      if(newCompCandidate.split("<").length > 15){
        this.Components.forEach((comp) => {
          if(newCompCandidate.indexOf(comp) != -1 || comp.indexOf(newCompCandidate) != -1){
            toReturn = true;
          }
        });
        let foundOn = -1;
        for(let currentPage=0; currentPage < this.HTMLPages.length; currentPage++){
          if(this.HTMLPages[currentPage].indexOf(newCompCandidate) && currentPage != 1){
            foundOn = currentPage;
            break;
          };
        }
        if(foundOn != -1){
          this.Components.push(newCompCandidate);
          toReturn = true;
        }
      }
      return toReturn;
    }
  addHTMLPage(HTMLPage){
    this.dirtyHTMLPages.push(HTMLPage);
    HTMLPage = HTMLPage.replace(new RegExp(" ", "g"), "");
    HTMLPage = HTMLPage.replace(new RegExp("\n", "g"), "");
    HTMLPage = HTMLPage.replace(new RegExp("\r", "g"), "");
    this.HTMLPages.push(HTMLPage);
    this.findComponents();
  }
}
let inputDir = args[0];
let outputDir = args[1];
let Links = [];
const mods = new modules();
let beginingIndexHead = `
<!DOCTYPE html>
<html lang="en"
    <head>
        <meta charset="utf-8"/>
        <title>title</title>
`;

let clientjsImports = `
import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, IndexRoute, hashHistory } from "react-router";

import Layout from "./pages/Layout";`;

let clientjsRoutes = `
const app = document.getElementById('app');

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={Layout}>`;

const copyFile = (source, target) => {
  let data = fs.createReadStream(source);
  let newFile = fs.createWriteStream(target);
  data.pipe(newFile);
};
const getAllFiles = (inputDirectory, outDir, OldDirectory = false) =>{
  const stepDown = (Dir) => {
    fs.readdir(Dir, (err, filesList) => {
      if(err == null){
        filesList.forEach(file => {
          if(path.extname(file) == ""){
            if (!fs.existsSync((outDir + Dir.replace(inputDirectory,"") + "\\" + file))){
              fs.mkdirSync((outDir + Dir.replace(inputDirectory,"") + "\\" + file));
            }
            stepDown(Dir + "\\" + file);
          }
          else if(path.extname(file) == ".html" && OldDirectory){
            addHtmlToProject(Dir + "\\" + file);
          }
          else{
            copyFile((Dir + "\\" + file), (outDir + Dir.replace(inputDirectory,"") + "\\" + file));
          }
        });
      };
    });
  }
  stepDown(inputDirectory);
};


const addHtmlToProject = (file) =>{
  let data = fs.readFileSync(file, 'utf-8');
  let htmlSplit = data.split("<body>");
  let unCleanBody = (htmlSplit[1]).split("</body>")[0];
  let fileName = file.substring(file.lastIndexOf("\\") + 1, file.indexOf(".html"));
    let lastPos = 0;
    let newPos = 0;
    let newLink = "";
    let hrefHolder = 0;
    let linkHolder = "";
    while(data.indexOf("<link" , lastPos) > 0){
      lastPos = data.indexOf("<link", lastPos);
      newPos = data.indexOf(">", lastPos) + 1;
      newLink = data.substring(lastPos, newPos);
      hrefHolder = newLink.indexOf("href=\"");
      linkHolder = newLink.substring(hrefHolder + 6, newLink.indexOf("\"", hrefHolder + 6));
      if(Links.indexOf(linkHolder) == -1){
        Links.push(linkHolder);
        beginingIndexHead += newLink + "\n";
      }
      lastPos = newPos;
    }

    lastPos = 0;
    newPos = 0;
    let newScript = "";
    while(data.indexOf("<script" , lastPos) > 0){
      lastPos = data.indexOf("<script", lastPos);
      newPos = data.indexOf("</script>", lastPos) + 9;
      newScript = data.substring(lastPos, newPos);
      unCleanBody = unCleanBody.replace(newScript, "");
      unCleanBody += "\n" + newScript;
      lastPos = newPos;
    }

    lastPos = 0;
    newPos = 0;
    let newComment = "";
    while(data.indexOf("<!--" , lastPos) > 0){
      lastPos = data.indexOf("<!--", lastPos);
      newPos = data.indexOf("-->", lastPos) + 3;
      newComment = data.substring(lastPos, newPos);
      unCleanBody = unCleanBody.replace(newComment, "");
      lastPos = newPos;
    }
    lastPos = 0;
    newPos = 0;
    let newImg = "";
    while(data.indexOf("<img" , lastPos) > 0){
      lastPos = data.indexOf("<img", lastPos);
      newPos = data.indexOf(">", lastPos) + 1;
      newImg = data.substring(lastPos, newPos);
      unCleanBody = unCleanBody.replace(newImg, newImg + "</img>");
      lastPos = newPos;
    }

    lastPos = 0;
    newPos = 0;
    let newInput = "";
    while(data.indexOf("<input" , lastPos) > 0){
      lastPos = data.indexOf("<input", lastPos);
      newPos = data.indexOf(">", lastPos) + 1;
      newInput = data.substring(lastPos, newPos);
      unCleanBody = unCleanBody.replace(newInput, newInput + "</input>");
      lastPos = newPos;
    }

    lastPos = 0;
    newPos = 0;
    newLink = "";
    hrefHolder = "";
    newLocation = "";
    let toName = "";
    while(data.indexOf("<a" , lastPos) > 0){
      lastPos = data.indexOf("<a", lastPos);
      newPos = data.indexOf("</a>", lastPos) + 4;
      newLink = data.substring(lastPos, newPos);
      hrefHolder = newLink.substring(newLink.indexOf("href=\"") + 6, newLink.indexOf("\"" , newLink.indexOf("href=\"")+6));
      if(hrefHolder.indexOf("http") == -1 && hrefHolder.indexOf(".html") != -1){
        toName = hrefHolder.substring((hrefHolder.lastIndexOf("\\") == -1)?0:hrefHolder.lastIndexOf("\\"), hrefHolder.indexOf(".html"));
        if(toName.toUpperCase() == "INDEX"){

          newLocation = newLink.replace("<a", "<IndexLink");
          newLocation = newLocation.replace("</a>", "</IndexLink>");
          newLocation = newLocation.replace("href=\"" + hrefHolder + "\"", "to=\"/\"");
        }
        else{
          newLocation = newLink.replace("<a", "<Link");
          newLocation = newLocation.replace("</a>", "</Link>");
          newLocation = newLocation.replace("href=\"" + hrefHolder + "\"", "to=\"" +toName+ "\"");
        }
        unCleanBody = unCleanBody.replace(newLink, newLocation);
    }
      lastPos = newPos;
    }

    let newValue = `import React from "react";
    import { IndexLink, Link } from "react-router";


    export default class `+ fileName +` extends React.Component {
      render() {
        return (
          <div>` + unCleanBody + `    </div>
              );
            }
          }`;
    fs.writeFileSync(outputDir + "\\src\\js\\pages\\" + fileName + ".js", newValue, 'utf-8');

    clientjsImports += `\nimport ` + fileName + ` from "./pages/` + fileName + `";`
    clientjsRoutes += "\n" + ((fileName.toUpperCase() == "INDEX")?('<IndexRoute component={' + fileName +
    '}></IndexRoute>'): (`<Route path="` + fileName + `" name="` + fileName + `" component={` + fileName + `}></Route>`));
    fs.writeFileSync(outputDir + "\\src\\js\\client.js", clientjsImports + clientjsRoutes + `

      </Route>
    </Router>,
    app);`, 'utf-8');
    fs.writeFileSync(outputDir + "\\src\\index.html", beginingIndexHead +

`</head>
<body>
  <div id="app"></div>
  <script src="client.min.js"></script>
  </body>
</html>`, 'utf-8');
mods.addHTMLPage(newValue);
}



getAllFiles(".\\imports", outputDir);

if (!fs.existsSync(outputDir + "\\src")){
  fs.mkdirSync(outputDir + "\\src");
}
if (!fs.existsSync(outputDir + "\\src\\js")){
  fs.mkdirSync(outputDir + "\\src\\js");
}
if (!fs.existsSync(outputDir + "\\src\\js\\pages")){
  fs.mkdirSync(outputDir + "\\src\\js\\pages");
}
getAllFiles(inputDir, outputDir + "\\src", true);
