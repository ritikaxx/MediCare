const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });
const Post = require('../models/post');
const Question = require('../models/question');
const request = require("request");
const app = express();
const axios = require('axios')
const moment = require('moment')
app.locals.moment = moment;


router.get('/news',async(req,res)=>{
    try {
        var url = 'https://newsapi.org/v2/everything?' +
        'q=Health&' +
        'from=2021-11-23&' +
        'sortBy=popularity&' +
        'apiKey=f08a12a57b514b04915f6ee0d0cc819c';

        const news_get =await axios.get(url)
        res.render('news',{articles:news_get.data.articles})




    } catch (error) {
        if(error.response){
            console.log(error)
        }

    }
})

router.post('/search',async(req,res)=>{
    const search=req.body.search
    // console.log(req.body.search)

    try {
        var url = `http://newsapi.org/v2/everything?q=${search}&apiKey=f08a12a57b514b04915f6ee0d0cc819c`

        const news_get =await axios.get(url)
        res.render('news',{articles:news_get.data.articles})





    } catch (error) {
        if(error.response){
            console.log(error)
        }

    }
})




// GET ROUTES

router.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'robots.txt'));
});

router.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'sitemap.xml'));
});

router.get('/', (req, res) => {
  const data = {};
  data.user = req.user;
  data.NODE_ENV = process.env.NODE_ENV;
  res.render('home', { data });
});

router.get('/about', (req, res) => {
  const data = {};
  data.user = req.user;
  data.NODE_ENV = process.env.NODE_ENV;
  res.render('about', { data });
});

let hospital = [];
let hospital_array = [];
request("http://www.communitybenefitinsight.org/api/get_hospitals.php?state=NC", function(error, response, body) {
  hospital = JSON.parse(body);
  hospital.slice(0, 100);
});

router.get("/hospital", function(req, res) {
  res.render("hospital", {
    hospital_data: hospital,
  });
});

let hospitalCity;
let hospitalName;
router.post("/searchHospital",(req, res)=> {
  hospitalCity = req.body.city;
  hospitalName = req.body.hospitalName;

  let searchedHospital = [];
  for (let i = 0; i < hospital.length; i++) {
    if (hospital[i].city === hospitalCity) {
      searchedHospital.push(hospital[i]);
      break;
    }
  }

  for (let i = 0; i < hospital.length; i++) {
    if (hospital[i].name === hospitalName) {
      if (searchedHospital[0].name !== hospitalName) {
        searchedHospital.push(hospital[i]);
      }
      break;
    }
  }

  res.render("hospital", {
    hospital_data: searchedHospital,
  });

});

router.get("/ambulance",(req, res)=>{
  res.render("ambulance", {
    hospital_data: hospital
  });
});

router.post("/searchAmbulance", (req, res)=>{
  const city = req.body.city;
  let searchedHospital = [];
  for (let i = 0; i < hospital.length; i++) {
    if (hospital[i].city === city) {
      searchedHospital.push(hospital[i]);
      break;
    }
  }
  res.render("selectedAmbulance", {
    hospital_data: searchedHospital,
  });
});

router.get('/faq', (req, res) => {
  const data = {};
  data.user = req.user;
  data.NODE_ENV = process.env.NODE_ENV;
  res.render('faq', { data });
});

router.get("/emergency", function(req, res){
  const data = {};
  data.user = req.user;
  data.NODE_ENV = process.env.NODE_ENV;
  res.render('emergency', {data});
});

const locationSchema = {
  latitude: Number,
  longitude: Number
};


const Location = mongoose.model("Location", locationSchema);


router.post("/maps",(req,res)=>{
 const latitude=req.body.latitude;
 const longitude=req.body.longitude;

  const location=new Location({
    latitude:latitude,
    longitude:longitude
  });
  location.save(function(err) {
    if (!err) {
    }
  });
});


router.get("/maps",(req,res)=>{
res.render("map")
});


router.get("/Community", (req, res) =>{
  Post.find({}, function(err, posts) {
      res.render("Community", {
        posts: posts,
      });
  });
});

router.get("/question", (req, res)=> {
  Question.find({}, (err, questions)=> {
    res.render("question", {
      questions: questions
    });
  });
});

router.get("/ask", (req, res) =>{
  res.render("ask");
});

router.get("/post", (req, res) =>{
  res.render("post");
});

router.post("/post", (req, res) =>{
  const post = new Post({
    name: req.body.postName,
    email: req.body.postEmail,
    question: req.body.postQuestion,
    answer: req.body.postMessage,
    vote: 0
  });
  post.save((err) =>{
    if (!err) {
      res.redirect("/Community");
    }
  });
});

router.post("/vote", (req, res)=>{
  const type = req.body.vote;
  const id = req.body.button;
  if(type==="upvote"){
    Post.findOneAndUpdate({_id: id}, { $inc: { vote: 1 } }, function(err, posts){
      if(!err){
        res.redirect("/Community");
      } else {
        console.log(err);
      }
    });
  } else {
    Post.findOneAndUpdate({_id: id}, { $inc: { vote: -1 } }, function(err, posts){
      if(!err){
        res.redirect("/Community");
      } else {
        console.log(err);
      }
    });
  }

});


router.post("/ask", (req, res) =>{
  const question = new Question({
    person: req.body.questionName,
    question: req.body.questionMessage
  });
  question.save(function(err) {
    if (!err) {
      res.redirect("/question");
    }
  });
});

router.get("/question", (req, res)=> {
  Question.find({}, function(err, questions) {
    res.render("question", {
      questions: questions
    });
  });
});

router.post("/answerNow",(req, res)=>{
  const ques = req.body.button;
  res.render("answerNow", {
    question: ques,
  });
});

router.get("/forum", (req, res) =>{
  res.render("forum");
});

router.get("/fitness",(req, res) =>{
  const data = {};
  data.user = req.user;
  data.NODE_ENV = process.env.NODE_ENV;
  res.render('fitness', { data });
});

// calculate the score of medical fitness by using standard medical parameters
router.post("/fitness", (req, res)=>{
const name = req.body.name;

const bmi = parseInt(req.body.bmi);
const workout = parseInt(req.body.workout);
const yoga = parseInt(req.body.yoga);
const heartbeat = parseInt(req.body.heartbeat);
const bp = parseInt(req.body.bp);
const medication = parseInt(req.body.medication);
const covid = parseInt(req.body.covid);
const lungs = parseInt(req.body.lungs);
const pulse = parseInt(req.body.pulse);
const temp = parseInt(req.body.temp);
const score = bmi+workout+yoga+heartbeat+bp+medication+covid+lungs+pulse+temp;



res.render("fitness-result", {
score: score
})
});




router.get('/privacypolicy', (req, res) => {
  const data = {};
  data.user = req.user;
  data.NODE_ENV = process.env.NODE_ENV;
  res.render('privacypolicy', { data });
});

router.get('/services', (req, res) => {
  const data = {};
  data.user = req.user;
  data.NODE_ENV = process.env.NODE_ENV;
  res.render('services', { data });
});

router.get('/terms', (req, res) => {
  const data = {};
  data.user = req.user;
  data.NODE_ENV = process.env.NODE_ENV;
  res.render('terms', { data });
});

router.get('/view2', (req, res) => {
  const data = {};
  data.user = req.user;
  data.NODE_ENV = process.env.NODE_ENV;
  res.render('view2', { data });
});


// LOGOUT ROUTE
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
