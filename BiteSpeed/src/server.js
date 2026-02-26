const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { route_identity } = require("./routes/routeidentity");

dotenv.config();

const app = express();   // 👈 app created first

app.use(cors());         // 👈 then use cors
app.use(express.json());

app.use("/", route_identity);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server active on port ${PORT}`);
});