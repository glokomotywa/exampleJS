import express from "express";
//validation can be used by chaining everytime - but it looks messy. for a cleaner look you can use a schema (messy code is commented)
//schema is in utils folder
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import mongoose from "mongoose";
import "./strategies/local-strategy.mjs";

const app = express();


mongoose
  .connect("mongodb://127.0.0.1/express_tutorial")
  .then(() => console.log("connected!"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(cookieParser("helloworld"));
app.use(
  session({
    secret: "meow", //use something less guessable and complicated - meow is just for studying purposes
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 60, // expiration in miliseconds
    },
  })
);

//passport is user authentication middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

const PORT = process.env.PORT || 3000;

// local middleware ver1

// app.get('/', loggingMiddleware,  (req, res) => {
//     res.status(201).send("meow:3");
// });
// GET
//local middleware ver2 + optionally you can call multiple middlewares sequentially!
app.get(
  "/",
  (req, res, next) => {
    console.log("Base URL");
    next();
  },
  (req, res, next) => {
    console.log("Base URL1");
    next();
  },
  (req, res, next) => {
    console.log("Base URL2");
    next();
  },
  (req, res) => {
    console.log(req.session);
    console.log(req.session.id);
    req.session.visited = true; //makes the session id the same for one user
    res.cookie("hello", "world", { maxAge: 30000, signed: true }); //cookie name, value, and when will it expire (in miliseconds)
    res.status(201).send({ msg: "meow:3" });
  }
);

app.post("/api/auth", passport.authenticate("local"), (req, res) => {
  res.sendStatus(200);
});

app.get("/api/auth/status", (req, res) => {
  console.log("inside status");
  console.log(req.user);
  console.log(req.session);
  if (req.user) return res.send(req.user);
  return res.sendStatus(401);
});

app.post("/api/auth/logout", (req, res) => {
  if (!req.user) return res.sendStatus(401);

  req.logout((err) => {
    if (err) return res.sendStatus(400);
    res.sendStatus(200);
  });
});

app.post("/api/cart", (req, res) => {
  if (!req.user) return res.sendStatus(401);

  const { body: item } = req;

  const { cart } = req.user;

  if (cart) {
    cart.push(item);
  } else {
    req.user.cart = [item];
  }
  return res.status(201).send(item);
});

app.get("/api/cart", (req, res) => {
  if (!req.user) return res.sendStatus(401);
  return res.send(req.user.cart ?? []);
});

app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});
