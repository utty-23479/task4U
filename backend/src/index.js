const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/db");
const port = process.env.PORT || 5000;

const app = express();
const usersRouter = require("./routes/usersRouter");
const usersRouterSupa = require("./routes/usersRouterSupa");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(
//   cors({
//     origin: ["http://localhost:5000", "http://localhost:5173"],
//     credentials: true,
//   }),
// );

app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN_DEV, process.env.CLIENT_ORIGIN_PROD],
    credentials: true,
  }),
);

app.use((req, res, next) => {
  console.log(
    "CORS Origin Allowed:",
    process.env.CLIENT_ORIGIN_DEV,
    process.env.CLIENT_ORIGIN_PROD,
  );
  next();
});

// app.use("/api/users", usersRouter);
app.use("/api/users/", usersRouterSupa);
app.listen(port, () => console.log(`Server listening on port ${port}`));
