import connectMongoDB from './db/connectMongoDB.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
  connectMongoDB();
});
