const createApp = require('./app');

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`TutorFlow API is running on http://localhost:${PORT}`);
});
