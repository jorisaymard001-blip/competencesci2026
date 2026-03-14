import { Router, type IRouter } from "express";
import healthRouter from "./health";
import schoolsRouter from "./schools";
import competitionsRouter from "./competitions";
import authRouter from "./auth";
import messagesRouter from "./messages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(schoolsRouter);
router.use(competitionsRouter);
router.use(authRouter);
router.use(messagesRouter);

export default router;
