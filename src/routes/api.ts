import { Router } from 'express';
import rootRouter from './root-router';


// Export the base-router
const baseRouter = Router();

// Setup routers
baseRouter.use('/', rootRouter);

// Export default.
export default baseRouter;
