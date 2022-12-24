require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require('lodash');
const fileUpload = require("express-fileupload");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const translate = require("translate");
const https = require("https");
var formidable = require('formidable');
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
const session = require("express-session");
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require("passport");


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
//Session
app.use(session({
  secret: "process.env.SECRET",
  resave: false,
  saveUninitialized: true
}));
//passport
app.use(passport.initialize());
app.use(passport.session());

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
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
//passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

// I commented Below Encryption Because now i am using MD5 Hashing Encryption
// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["pass"]
// });


const User = mongoose.model("User", userSchema);

const Post = mongoose.model("poet", poetrySchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function (user, done) {
  done(null, user._id);
  // if you use Model.id as your idAttribute maybe you'd want
  // done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});



//All post are Append in this posts array
let posts = [];
let users = [];


/////////////////////////////////////////////////////////////////homeAuth route/////////////////////////////////////////////////////

app.route("/")
  .get((req, res) => {
    res.render("home");
    // User.find({}, (err, foundUserData) => {
    //   !err ? console.log(foundUserData) : console.log(err)
    // })
  })

/////////////////////////////////////////////////////////////////Register route//////////////////////////////////////////////////////
app.get("/register", (req, res) => {
  res.render("register")
});
app.post("/register", (req, res) => {
  User.register({
    username: req.body.username
  }, req.body.password, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/start")
      })
    }

  })
})



/////////////////////////////////////////////////////////////////Home route/////////////////////////////////////////////////////

app.route("/start")
  .get(function (req, res) {
    if (req.isAuthenticated) {
      Post.find({}, function (err, posts) {
        res.render("start", {
          startingContent: homeStartingContent,
          posts: posts,
        });
      });
    } else {
      res.redirect("/login")
    }

  })





/////////////////////////////////////////////////////////////////Login route//////////////////////////////////////////////////////
app.get("/login", (req, res) => {
  res.render("login")
});
app.post("/login", function (req, res) {
  const newuser = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(newuser, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/start")
      })
    }
  })
})


/////////////////////////////////////////////////////////////////Compose route//////////////////////////////////////////////////////

app.route("/compose")
  .get(function (req, res) {

    res.render("compose")
  })
  .post(function (req, res) {

    const post = new Post({
      title: req.body.title,
      content: req.body.content
    });
    post.save(function (err) {
      if (!err) {
        res.redirect("/start");
      }
    });

  })



/////////////////////////////////////////////////////////////////About route///////////////////////////////////////////////////////


app.route("/about")
  .get(function (req, res) {
    res.render("about", {
      aboutPara: aboutContent
    });
  })

/////////////////////////////////////////////////////////////////Contact route///////////////////////////////////////////////////////
app.route("/contact")
  .get(function (req, res) {
    res.render("contact", {
      contactPara: contactContent,
    });
  })
  .post(function (req, res) {

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
    const url = "process.ene.MAIL_CHIMP"
    const options = {
      method: "POST",
      auth: "key:process.env.API_KEY"
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


/////////////////////////////////////////////////////////////////Footer route///////////////////////////////////////////////////////
app.route("/footer").get()
  .post(function (req, res) {
    res.redirect("/userdetails")
  })

///////////////////////////Below code is refer to the url params. It will create new page for each posts//////////////////////////
app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;
  Post.findOne({
    _id: requestedPostId
  }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content,

    });
  });
});
app.get("/quotes", function (req, res) {
  res.render("quotes")
});



//////////////////////////////////////////////////////////Love Route/////////////////////////////////////////////////////////////

app.route("/love")
  .get(function (req, res) {
    res.render("love");
  })
  .post(function (req, res) {
    const loveCatagory = req.body.love;
    console.log(loveCatagory);
    res.redirect("/love")
  })




///////////////////////////////////////////////////////////////////Action Route///////////////////////////////////////////////////

app.route("/action")
  .get(function (req, res) {
    res.render("action");
  })
  .post(function (req, res) {
    res.redirect("/action")
  });



app.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// User.deleteMany({
//   posts
// }).then(function () {
//   console.log("Data deleted"); // Success`
// }).catch(function (error) {
//   console.log(error); // Failure
// });


app.listen(process.env.PORT, function () {
  console.log("Server started on port 3000");
});