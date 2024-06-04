//routers are basically a way to group the requests by certain domains (endpoints)
//in this file ther requests will be from the user domain

import { Router } from "express";
import { validationResult, checkSchema, matchedData } from "express-validator";
import {
  createQueryValidationSchema,
  createUserValidationSchema,
} from "../utils/validationSchemas.mjs";
import { loggingMiddleware } from "../utils/middlewares.mjs";
import { User } from "../mongoose/schemas/user.mjs";
import mongoose from "mongoose";
import { hashPassword } from "../utils/helpers.mjs";

//router has basically all of the functions that app has (put, get, delete etc.)
const router = Router();

// middleware can be called globally or locally ! order matters, if you call the middleware AFTER a certain endpoint, it will not work for said endpoint !!
// you can also chain middlewares in app.use (in sequential order) !
router.use(loggingMiddleware); //globally

//GET
router.get(
  "/api/users",
  checkSchema(createQueryValidationSchema), //instead of all this code below :3
  // query('filter') //query function will validate the fields but will not throw any errors - you need to handle it yourself!
  // .isString()
  // .withMessage('Must be a string') //.withMessage works only for the previous middleware !
  // .notEmpty()
  // .withMessage('Must not be empty')
  // .isLength({ min: 3, max: 10})
  // .withMessage('Must be 3 to 10 characters'),
  async (req, res) => {
    console.log(req.session.id);
    req.sessionStore.get(req.session.id, (err, sessionData) => {
      if (err) {
        console.log(err);
        throw err;
      }
      console.log(sessionData);
    });
    //console.log(req['express-validator#contexts']);
    const result = validationResult(req); // extracts validation errors
    console.log(result);
    const { body } = req;
    console.log(body);

    //if(!result.isEmpty()) return res.status(400).send({ errors: result.array() }); // commented for checking if the endpoint works reasons

    console.log(req.query);
    const {
      query: { filter, value },
    } = req;

    let users;
    if (filter && value) {
      const query = {};
      query[filter] = new RegExp(value, "i");
      users = await User.find(query);
    } else {
      users = await User.find();
    }

    return res.send(users);
  }
);

router.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const findUser = await User.findById(id);
  if (!findUser) return res.sendStatus(404);
  return res.send(findUser);
});

//POST
router.post(
  "/api/users",
  checkSchema(createUserValidationSchema), //instead of all those commented lines below :)
  // [
  //     body('username')
  //         .notEmpty()
  //         .withMessage('Username cannot be empty')
  //         .isLength({min: 5, max: 32})
  //         .withMessage('Username must be 5-32 characters long')
  //         .isString()
  //         .withMessage('Username must be a string!'),
  //     body('displayName')
  //         .notEmpty()
  //         .withMessage('Display name cannot be empty')
  // ],
  async (req, res) => {
    const result = validationResult(req);
    console.log(result);

    if (!result.isEmpty())
      return res.status(400).send({ errors: result.array() }); // result.isEmpty() checks if there are no errors (true - no errors, false - errors). result.array returns the array of errors

    const data = matchedData(req); //returns validated data, use this instead of the body object (here its commented)
    console.log(data);
    //console.log(req.body); robi to co poprzedni wiersz
    //const { body } = req;
    data.password = hashPassword(data.password);
    console.log(data);
    const newUser = new User(data);
    try {
      const savedUser = await newUser.save();
      return res.status(201).send(savedUser);
    } catch (err) {
      console.log(err);
      return res.sendStatus(400);
    }
  }
);

//PUT
router.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  // Check if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: "Invalid User ID" });
  }
  const updatedUser = await User.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) return res.sendStatus(404); // Return 404 if user not found
  return res.send(updatedUser); // Send the updated user
});

//PATCH
router.patch("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  // Check if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: "Invalid User ID" });
  }
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!updatedUser) return res.sendStatus(404); // Return 404 if user not found
  return res.send(updatedUser); // Send the updated user
});

//DELETE
router.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params; 

  // Check if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: "Invalid User ID" });
  }
  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) return res.sendStatus(404); // Return 404 if user not found
  return res.sendStatus(200); // Send 200 OK status
});

export default router;
