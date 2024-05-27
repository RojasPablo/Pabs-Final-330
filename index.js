const keys = require("./config/keys");
const server = require("./server");
const mongoose = require("mongoose");

const port = process.env.PORT || 4000;

mongoose
  .connect(keys.mogodb.dbURI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}`);
    });
  })
  .catch((e) => {
    console.error('Failed to start server', e)
});
