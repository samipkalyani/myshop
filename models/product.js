const mongoose = require('mongoose');

const Schema=mongoose.Schema;

const productSchema= new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId:{
    type :Schema.Types.ObjectId,
    ref: 'User',
    required:true

  }     
});

module.exports =mongoose.model('Product',productSchema);


// const getDb =require('../util/database').getDb;
// const mongodb=require('mongodb');

// const ObjectId =mongodb.ObjectId;



// class Product {
//   constructor(title,price,description,imageUrl,id,userId){
//     this.title=title;
//     this.price=price;
//     this.description=description;
//     this.imageUrl=imageUrl;
//     this._id= id? new ObjectId(id):null;  
//     this.userId=userId;
//     /* If the object is created for the first time then object id is null
//     but if we do not have a ternary operation as shown above it will
//     still create an id because objects of null value can be created but 
//     due to above ternary operation this._id is null if a new product is added
//     and hence in save() method it goes to the else case(create a new product)*/
//   }
//   save(){
//     const db =getDb();
//     let dbOp;
//     if(this._id){
//       //UPDATE THE PRODUCT
//       dbOp =db.collection('products').updateOne({ _id: this._id },{ $set:this });
//     }else{
//       dbOp = db.collection('products').insertOne(this);
//     }
//     return dbOp
//     .then(result => {
//       console.log(result);
//     })
//     .catch(err =>{
//       console.log(err)
//     });
//   }

//   static fetchAll(){
//     const db =getDb();
//     return db.collection('products')
//     .find()
//     .toArray()
//     .then(products =>{
//       console.log(products);
//       return products;
//     })
//     .catch(err =>{
//       console.log(err)
//     });
//   }

//   static findById(prodId){
//     const db =getDb();
//     return db.collection('products')
//     .find({ _id: new ObjectId(prodId) })
//     .next()
//     .then(product =>{
//       console.log(product);
//       return product;
//     })
//     .catch(err =>{
//       console.log(err)
//     });
//   }
  

//   static deleteById(prodId){
//     const db =getDb();
//     return db.collection('products')
//     .deleteOne({ _id: new ObjectId(prodId) })
//     .then(result =>{
//       console.log('Deleted!');
//     })
//     .catch(err =>{
//       console.log(err)
//     });
//   }

// }


// module.exports = Product;
