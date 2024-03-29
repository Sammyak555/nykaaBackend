const express = require("express");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const { UserModel } = require("../Models/user.model");
const { AdminModel } = require("../../Admin/Models/admin.model");
const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  const query = req.query._limit;
  const pages = req.query._page;
  try {
    const users = await UserModel.find()
      .limit(query)
      .skip((pages - 1) * query);
    res.send(users);
  } catch (err) {
    res.send(err.message);
  }
});

userRouter.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const users = await UserModel.find({ _id: id });
    res.send(users);
  } catch (err) {
    res.send(err.message);
  }
});

userRouter.patch("/paymentSuccess/:id", async (req, res) => {
  const id = req.params.id;
  const payload = {
    cart: [],
    address: [],
  };
  try {
    const user = await UserModel.updateOne({ _id: id }, payload);
    res.send({
      message: "Payment Successfully",
    });
  } catch (err) {
    res.send({
      message: err.message,
    });
  }
});

userRouter.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (name && email && password && phone) {
    const validateEmail = await UserModel.findOne({ email: email });
    if (validateEmail) {
      res.send({
        message: "already registred user Please Login",
        userId: validateEmail._id,
      });
    } else {
      try {
        bcrypt.hash(password, 10, async (err, hash_password) => {
          if (err) {
            res.send({
              message: err.message,
            });
          } else {
            const newRegistration = new UserModel({
              name,
              email,
              password: hash_password,
              phone,
            });
            await newRegistration.save();
            console.log(newRegistration);
            await res.send({
              message: "new registration successfully",
            });
          }
        });
      } catch (err) {
        res.send({
          message: err.message,
        });
      }
    }
  } else {
    res.send({
      message: "Please fill the required fields",
    });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await UserModel.find({ email });
      if (user.length > 0) {
        bcrypt.compare(password, user[0].password, (err, result) => {
          if (result) {
            const token = jwt.sign({ userId: user[0]._id }, "masai");
            console.log(user);
            res.send({
              userId: user[0]._id,
              message: "Login successfully",
              token,
            });
          } else {
            res.send({
              message: "Wrong Password",
            });
          }
        });
      } else {
        res.send({
          message: "Email Address not found",
        });
      }
    } catch (err) {
      res.send({
        message: err.message,
      });
    }
  } else {
    res.send({
      message: "Please fill the required fields",
    });
  }
});

userRouter.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await UserModel.findByIdAndDelete({ _id: id });
    res.send("user deleted !");
  } catch (err) {
    res.send(err);
  }
});

module.exports = {
  userRouter,
};
