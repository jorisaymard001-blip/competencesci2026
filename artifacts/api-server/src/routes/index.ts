import { Router, type IRouter } from "express";
import healthRouter from "./health";
import schoolsRouter from "./schools";
import competitionsRouter from "./competitions";
import authRouter from "./auth";
import messagesRouter from "./messages";
import notificationsRouter from "./notifications";
import pushRouter from "./push";
import resultatRouter from "./resultat";
import adminRouter from "./admin";
import assistantRouter from "./assistant";

const router: IRouter = Router();

router.use(healthRouter);
router.use(schoolsRouter);
router.use(competitionsRouter);
router.use(authRouter);
router.use(messagesRouter);
router.use("/notifications", notificationsRouter);
router.use(pushRouter);
router.use(resultatRouter);
router.use(adminRouter);
router.use("/assistant", assistantRouter);

export default router;
