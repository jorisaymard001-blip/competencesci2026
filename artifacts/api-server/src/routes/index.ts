import { Router, type IRouter } from "express";
import healthRouter from "./health";
import schoolsRouter from "./schools";
import competitionsRouter from "./competitions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(schoolsRouter);
router.use(competitionsRouter);

export default router;
