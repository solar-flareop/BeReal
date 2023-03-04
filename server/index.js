const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");

require("./dbConfig");

//local imports
const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/posts");

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

app.listen(5000, () => {
  console.log("Backend server running!");
});
