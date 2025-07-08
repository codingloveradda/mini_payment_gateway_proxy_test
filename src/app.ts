import express, { Application, Request, Response } from 'express';
import chargeRouter from './routes/charge';
import transactionsRouter from './routes/transactions';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, world!');
});

app.use('/charge', chargeRouter);
app.use('/transactions', transactionsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
