//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require('lodash');
const fileUpload = require("express-fileupload");


var homeStartingContent = "“All our dreams can come true, if we have the courage to pursue them.” —Walt Disney";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const app = express();

//Ejs Package 
app.set('view engine', 'ejs');

//Body parser
app.use(bodyParser.urlencoded({
  extended: true
}));

//use of Public folder(Like images and Css files included)
app.use(express.static("public"));
app.use(fileUpload());




//All post are Append in this posts array
let posts = [];
let users = [];



var userDetails = "";
//Home route
app.get("/", function (req, res) {
  res.render("home", {
    startingContent: homeStartingContent,
    posts: posts,

  });
});


//About Page 
app.get("/about", function (req, res) {
  res.render("about", {
    aboutPara: aboutContent
  });
});

//Contact page get Form Details
app.get("/contact", function (req, res) {

  res.render("contact", {
    contactPara: contactContent,
  });
});


//Conatct page Post form
app.post("/contact", function (req, res) {
  userDetails = {
    Email: req.body.mail,
    userName: req.body.uname,
    userAge: req.body.uage,
    userComments: req.body.ucomment,
    userAddress: req.body.uaddress
  }

  users.push(userDetails);
  console.log(userDetails);
  res.redirect("/userdetails");
});




//Get userDetailsPage 
app.get("/userdetails", function (req, res) {
  const uName = userDetails.userName;
  console.log(uName)
  res.render("userdetails", {
    userName: uName
  });
});





//Compose page getting in this route
app.get("/compose", function (req, res) {
  res.render("compose");
});

//Please compose your posts to this form. It will automatically added in poat section
app.post("/compose", function (req, res) {
  // let uploadPath = __dirname + sampleFile.name;
  const post = {
    title: req.body.title,
    content: req.body.content
  }
  posts.push(post);
  res.redirect("/");
})

//getting files in this route
app.get("/upload", function (req, res) {

})

//Below code is refer to the url params. It will create new page for each posts
app.get("/posts/:postName", function (req, res) {

  const requestedTitle = _.lowerCase(req.params.postName);
  posts.forEach(function (post) {
    const storedTitle = _.lowerCase(post.title)
    // const convert = JSON.parse(string);
    if (storedTitle === requestedTitle) {
      res.render("post", {
        title: post.title,
        content: post.content
      });
    }
  });

});













app.listen(3000, function () {
  console.log("Server started on port 3000");
});

//   function truncateText(content, maxLength) {
//     var element = document.querySelector(content),
//         truncated = element.innerText;

//     if (truncated.length > maxLength) {
//         truncated = truncated.substr(0,maxLength) + '...';
//     }
//     return truncated;
// }
// //You can then call the function with this
// document.querySelector('p').innerText = truncateText('p', 107)

// });

// posts.forEach(function(post) {
//   const string = post.content.substring(0, 99);
//   if(post.title === "" ) {
//    alert("enter the title")
//     console.log("Enter the tile");
//     res.redirect("/compose");
//   } else if(post.content.length >= 100) {
//     console.log( string + "...")
//   } else {
//     console.log("end!");
//   }

// })