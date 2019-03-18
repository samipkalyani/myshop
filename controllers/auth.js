//GLOBAL MODULES
const crypto = require('crypto');
//CUSTOM MODULES AND MODELS
const User = require('../models/user');
const bcrypt=require('bcryptjs');
const nodemailer =require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'odecode004@gmail.com',
    pass: '**********'
  }
});
exports.getLogin = (req, res, next) => {
  let message =req.flash('error');
  if(message.length >0){
    message=message[0];
  }
  else{
    message=null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage:message
  });
};

exports.getSignup = (req, res, next) => {
  let message =req.flash('error');
  if(message.length >0){
    message=message[0];
  }
  else{
    message=null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage:message
  });
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Password does not match!');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash(
          'error',
          'E-Mail exists already, please pick a different one.'
        );
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
          var mailOptions = {
            from: 'odecode004@gmail.com',
            to: email,
            subject: 'Welcome to your new myshop account',
            text: `Hi ${email},\n\nWe're so glad you decided to try out myshop. Here are a few tips to get you up and running fast.\n\nHappy shopping!\n\nEnjoy your new account,\n\nadmin@myshop.in`
          };
          return transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};


exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset =(req,res,next)=>{
  let message =req.flash('error');
  if(message.length >0){
    message=message[0];
  }
  else{
    message=null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Rest',
    errorMessage:message
  });
};

exports.postReset =(req,res,next)=>{
  crypto.randomBytes(32,(err,buffer)=>{
    if(err){
      console.log(err);
      return res.redirect('/login');
    }
    User.findOne({email:email}).then(user=>{
      if(!user){
        req.flash('error','No account found with that email ID.');
        return res.redirect('/login');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    }).then(result =>{
      res.redirect('/');
      var mailOptions = {
        from: 'odecode004@gmail.com',
        to: email,
        subject: 'Welcome to your new myshop account',
        text: `Hi ${email},\nI’m so glad you decided to try out myshop. Here are a few tips to get you up and running fast.\n\nHappy shopping!\n\nEnjoy your new account,\n\nadmin@myshop.in`
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    })
    .catch(err=>{
      console.log(err);
    })
  })
}