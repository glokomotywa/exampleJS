import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../mongoose/schemas/user.mjs";
import { comparePassword } from "../utils/helpers.mjs";

passport.serializeUser((user, done) => {
  console.log("inside Serialize user");
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log("inside deserialize");
  console.log(id);
  try {
    const findUser = await User.findById(id);
    if (!findUser) throw new Error("User not found");
    done(null, findUser);
  } catch (err) {
    done(err, null);
  }
});

//Strategy takes 2 variables, options and verify - options is used when the user is authenticated via for example email and not their username. {usernameField: 'email'}
export default passport.use(
  new Strategy(async (username, password, done) => {
    //check if user exists and if the password matches
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    try {
      const findUser = await User.findOne({ username });
      if (!findUser) throw new Error("user not found:(");
      if (!comparePassword(password, findUser.password)) throw new Error("bad credentials!");
      done(null, findUser);
    } catch (err) {
      done(err, null); //will move on to the next step
    }
  })
);
