import { config } from "dotenv";
config();

import mongoose from "mongoose";
import app from "./app";

const main = async () => {
  await mongoose.connect(process.env["MONGO_URI"]);
};

main()
  .then(() => {
    app.listen(process.env["USERS_SERVICE_PORT"], () => {
      console.log(
        `Users service is running on port ${process.env["USERS_SERVICE_PORT"]}`
      );
    });
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
