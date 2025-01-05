import express, { Express } from 'express';
import problemRouter from './routes/problemRoutes';

const app: Express = express();
const PORT = 3000;

app.use(express.json());

app.use('/problems', problemRouter);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
