const express = require("express");
const { fn_ident } = require("../logic/logicidentity");

const router = express.Router();

router.post("/identify", async (req, res) => {
  try {
    const result = await fn_ident(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

module.exports = { route_identity: router };