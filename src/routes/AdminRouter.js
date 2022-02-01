import Express from "express";
import AdminController from "../controllers/AdminController.js";
import AdminMiddleware from "../middlewares/AdminMiddleware.js";

const AdminRouter = Express.Router();

AdminRouter.post("/login", AdminMiddleware, AdminController.AdminLoginAccount);
AdminRouter.post("/code", AdminMiddleware, AdminController.ValidateAdminCode);
AdminRouter.post("/addadmin", AdminMiddleware, AdminController.AddAdminControl);

AdminRouter.get("/users", AdminMiddleware, AdminController.GetAllUsers);

export default {
    path: "/api/admin",
    router: AdminRouter,
};
