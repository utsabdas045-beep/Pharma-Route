import { Router, type IRouter } from "express";
import healthRouter from "./health";
import papersRouter from "./papers";
import graphRouter from "./graph";
import discoveriesRouter from "./discoveries";
import searchRouter from "./search";
import reportsRouter from "./reports";
import demoRouter from "./demo";

const router: IRouter = Router();

router.use(healthRouter);
router.use(papersRouter);
router.use(graphRouter);
router.use(discoveriesRouter);
router.use(searchRouter);
router.use(reportsRouter);
router.use(demoRouter);

export default router;
