require("dotenv").config();
const connectDB = require('./config/db')


const app = require("./app");

connectDB().then(() => {

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });


})



