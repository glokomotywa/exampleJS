import { Router } from "express";

const router = Router();

router.get("/api/products", (req, res) => {
  console.log(req.headers.cookie); //req.headers.cookie returns a cookie from headers (not parsed tho !)
  console.log(req.cookies); // parsed (COOKIE PARSER REQUIRED)
  console.log(req.signedCookies.hello);
  if (req.signedCookies.hello && req.signedCookies.hello === "world")
    return res.send([{ id: 123, name: "dimpus", weight: "giant" }]);

  return res.status(403).send({ msg: "sorry you need the correct cookie" });
});

export default router;
