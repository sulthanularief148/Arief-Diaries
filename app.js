//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require('lodash');
const fileUpload = require("express-fileupload");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const translate = require("translate");
const https = require("https");

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
app.use(express.json());

//Connected MonogoDb
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect("mongodb://localhost:27017/poetryDb")
};

const poetrySchema = {
  title: {
    type: String,
    require: true
  },
  content: {
    type: String,
    require: true
  }
};

const Post = mongoose.model("poet", poetrySchema);




//All post are Append in this posts array
let posts = [];
let users = [];



var userDetails = "";
//Home route
app.get("/", function (req, res) {
  Post.find({}, function (err, posts) {
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts,

    });
  })


});


//Compose page getting in this route
app.get("/compose", function (req, res) {
  res.render("compose");
});

//Please compose your posts to this form. It will automatically added in poat section
app.post("/compose", function (req, res) {

  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
  // console.log(post.title);

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

  const firstName = req.body.fname;
  const lastName = req.body.lname;
  const userMail = req.body.email;
  const message = req.body.comment;
  const mobile = req.body.mobile
  const data = {
    members: [{
      email_address: userMail,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
        PHONE: mobile,
        MESSAGE: message
      }
    }]
  }
  const jsonData = JSON.stringify(data);
  const url = "https://us21.api.mailchimp.com/3.0/lists/eb31c7268e"
  const options = {
    method: "POST",
    auth: "key:c1423ac75d8de38c42b9986c50709db3-us21"
  }
  const request = https.request(url, options, function (response) {
    response.on("data", function (data) {
      console.log(JSON.parse(data));
      console.log(response.statusCode)
      if (response.statusCode != 200) {
        res.sendFile(__dirname + "/failure.html")

      } else {
        res.sendFile(__dirname + "/success.html");
      }
    })
  });

  request.write(jsonData);
  request.end();


});



//Footer section Post method section
app.post("/footer", function (req, res) {
  res.redirect("/userdetails")
})

//Get userDetailsPage 
app.get("/userdetails", function (req, res) {
  const uName = userDetails.userName;
  console.log(uName)
  res.render("userdetails", {
    userName: uName
  });
});






//getting files in this route
app.get("/upload", function (req, res) {

})

//Below code is refer to the url params. It will create new page for each posts
app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;
  Post.findOne({
    _id: requestedPostId
  }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });



});





//Get the page love.ejs 

// app.get("/love", function (req, res) {
//   res.render("love")
// });
app.get("/love", function (req, res) {
  res.render("love");
})


app.post("/love", function (req, res) {
  const loveCatagory = req.body.love;
  console.log(loveCatagory);
  res.redirect("/love")
})


app.get("/action", function (req, res) {
  res.render("action");
});


app.post("/action", function (req, res) {

  res.redirect("/action")
})


// Post.deleteMany({
//   posts
// }).then(function () {
//   console.log("Data deleted"); // Success
// }).catch(function (error) {
//   console.log(error); // Failure
// });








app.listen(3000, function () {
  console.log("Server started on port 3000");
});