import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', chatRouter);

app.listen(PORT, () => {
  console.log(`HR Assistant API running on http://localhost:${PORT}`);
});
