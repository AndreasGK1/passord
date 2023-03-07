const express = require("express");
const blog = require("./public/js/script");
const bodyParser = require("body-parser");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, setDoc, doc, collectionGroup } = require("firebase/firestore");
const SHA256 = require("crypto-js/sha256");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { stringify } = require("querystring");
require('dotenv').config()

const saltRounds = 10;

// ...
const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDj8-V3OgeeEJtbLnUeK32IktjeLmOnopM",
  authDomain: "passordhashing.firebaseapp.com",
  projectId: "passordhashing",
  storageBucket: "passordhashing.appspot.com",
  messagingSenderId: "167721416230",
  appId: "1:167721416230:web:4b202eedfc9923a7f458e7",
};

// Initialize Firebase
const fb = initializeApp(firebaseConfig);
const db = getFirestore(app);

app.use(express.urlencoded({ extended: true }));
let userloggedin = false

app.use(bodyParser.json());

app.listen(3000);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/logginn", (req, res) => {
  res.render("logginn");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/glemt", (req, res) => {
  res.render("glemt");
});

app.get("/velkommen", (req, res) => {
    res.render("velkommen");
    app.use( express.static("public"));
});

app.get("/notfound", (req, res) => {
    res.render("notfound");
    app.use( express.static("public"));
});
app.post("/register", (req, res) => {
  console.log("req body", req.body);
  let user = req.body.epost;
  console.log(user);
  bcrypt.hash(req.body.passord1, saltRounds, function(err, hash) {
    console.log(hash)
    saveUser(db, user, hash)
});

  
  res.send("check your vscode");
  
});

app.get("/nyttpassord", (req, res) => {
  // console.log(d)
  console.log(req.query)

  
  res.render("nyttpassord");
});

async function getBrukere(db, epost, passord) {
  const brukerCol = collection(db, "Brukere");
  const brukerSnapshot = await getDocs(brukerCol);
  const brukerList = brukerSnapshot.docs.map((doc) => doc.data());
  brukerList.forEach(element => {
    bcrypt.compare(passord, element.passord, function(err, result) {
      console.log("result:", passord, element.passord, result)
      if (result === true && (element.epost === epost)) {
        userloggedin = true
    console.log("it works! jippi jippi")
    
      } else {
    console.log("did not work")

    
      }
    
    })

  });



  return brukerList;
}

app.post("/logIn", async (req, res) => {
  console.log(req.body);
  
  let epost = req.body.epost;
  let passord = req.body.passord;

  await getBrukere(db, epost, passord).then(() => {
    console.log("userloggedin", userloggedin)
    if (userloggedin === true){

      //not working
        res.redirect ("velkommen")
    }
    else {
   res.redirect("notfound")
    }
  })

  
});

async function saveUser(db, epost, passord) {
  let hash = SHA256(epost).toString()
  console.log("hash", hash);
  const document = doc(db, "Brukere", hash);
  const data = {
epost: epost, 
passord: passord,
  };
  await setDoc(document, data)
  .then((result) => {
      console.log("bruker laget");
  })

  .catch((e) => {
      console.log(e);
  });
}



app.post("/glemt",(req, res) => {
  console.log(req.body);

  let email = req.body.email;
sendEmail(email)
})


// app.get("/nyttpassord", (req, res) => {

  
//   // console.log("req body", req.body);
//   // const url = require('url');
//   // const currentUrl = 'http://localhost:3000/nyttpassord?email=andreas.kjolso@gmail.com';
//   // const parsedUrl = url.parse(currentUrl, true);
  
//   // const pathArray = parsedUrl.query.email.split('=');
//   // console.log(pathArray);
//   // let user = pathArray;
//   // console.log(user);
//   // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//   // console.log(hash)
//   // updateUser(db, user, hash)
//   });

async function sendEmail(email) {
  let transport = nodemailer.createTransport({
    service:"gmail",
    host: "smtp.gmail.com",
    secure: true, // upgrade later with STARTTLS
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });



let info = await transport.sendMail({

  from: '"Passordtester" <andreas.kjolso@gmail.com', //sender addresse
  to: "andreas.kjolso@gmail.com", //liste av mottakere
  subject: "Nytt passord", //subjekt linje
  text: "Reset epost", // plain text body
  html: `Her er lenken hvor du kan lage deg et nytt passord: http://localhost:3000/nyttpassord?email=${email}`,

  
});

}

