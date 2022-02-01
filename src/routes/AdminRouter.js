import Express from "express";
import AdminController from "../controllers/AdminController.js";
import AdminMiddleware from "../middlewares/AdminMiddleware.js";

const AdminRouter = Express.Router();

AdminRouter.post("/login", AdminController.AdminLoginAccount);
AdminRouter.post("/code", AdminController.ValidateAdminCode);
AdminRouter.post("/addadmin", AdminMiddleware, AdminController.AddAdminControl);
AdminRouter.post("/users", AdminMiddleware, AdminController.AcceptOneUser);

AdminRouter.get("/users", AdminMiddleware, AdminController.GetAllUsers);
AdminRouter.get("/users/:userId", AdminMiddleware, AdminController.GetAllUsers);

export default {
    path: "/api/admin",
    router: AdminRouter,
};
