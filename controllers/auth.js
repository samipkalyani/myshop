//GLOBAL MODULES
const crypto = require('crypto');
//CUSTOM MODULES AND MODELS
const User = require('../models/user');
const bcrypt=require('bcryptjs');
const { validationResult } = require('express-validator/check');
const nodemailer =require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'odecode004@gmail.com',
    pass: 'hellothere1234'
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
    errorMessage:message,
    oldInput :{email:"",password:""},
    validationErrors:[]
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
    errorMessage:message,
    oldInput :{email:"",password:"",confirmPassword:""},
    validationErrors:[]
  });
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'login',
      errorMessage: errors.array()[0].msg,
      oldInput :{email:email,password:password},
      validationErrors :errors.array()
    });
  }
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', '');
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'login',
          errorMessage: 'Invalid email or password',
          oldInput :{email:email,password:password},
          validationErrors : []
        });
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
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'login',
            errorMessage: 'Password does not match!',
            oldInput :{email:email,password:password},
            validationErrors : []
          });
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
  const confirmPassword =req.body.confirmPassword;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput :{email:email,password:password,confirmPassword:confirmPassword},
      validationErrors :errors.array()
    });
  }
      bcrypt
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
  const email =req.body.email;
  crypto.randomBytes(32,(err,buffer)=>{
    if(err){
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email:email}).then(user=>{
      if(!user){
        req.flash('error','No account found with that email ID.');
        return res.redirect('/reset');
      }
      //console.log(token);
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    }).then(result =>{
      res.redirect('/');
      var mailOptionsReset = {
        from: 'odecode004@gmail.com',
        to: email,
        subject: 'Password Reset',
        html:  `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
      `
      };
      transporter.sendMail(mailOptionsReset, function(error, info){
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

exports.getNewPassword =(req,res,next)=>{
  const token=req.params.token;
  User.findOne({resetToken:token,resetTokenExpiration:{$gt:Date.now()}})
      .then(user =>{
        let message =req.flash('error');
        if(message.length >0){
        message=message[0];
        }
        else{
          message=null;
          }
        res.render('auth/new-password',{
        path:'/new',
        pageTitle:'Reset Password',
        errorMessage:message,
        userId:user._id.toString(),
        passwordToken:token
        });
      })
      .catch()
  
}

exports.postNewPassword = (req,res,next)=>{
  const newPassword =req.body.password;
  const userId = req.body.userId;
  const passwordToken =req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken:passwordToken,
    resetTokenExpiration:{$gt:Date.now()},
    _id:userId
  })
  .then(user =>{
    resetUser =user
    return bcrypt.hash(newPassword,12);
  })
  .then(hashedPassword=>{
    resetUser.password=hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration= undefined;
    return resetUser.save();
  })
  .then(result=>{
    res.redirect('/login');
  })
  .catch(err =>{
    console.log(err);
  })

}