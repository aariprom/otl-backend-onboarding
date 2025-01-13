import express, { Express } from 'express';
import problemRouter from './routes/problemRoutes';
import employeeRouter from "./routes/employeeRoutes";

const app: Express = express();
const PORT = 3000;

app.use(express.json());

app.use('/problems', problemRouter);
app.use('/employee', employeeRouter);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
