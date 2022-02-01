import Express from "express";
import AdminController from "../controllers/AdminController.js";
import AdminMiddleware from "../middlewares/AdminMiddleware.js";

const AdminRouter = Express.Router();

AdminRouter.post("/login", AdminController.AdminLoginAccount);
AdminRouter.post("/code", AdminController.ValidateAdminCode);
AdminRouter.post("/addadmin", AdminMiddleware, AdminController.AddAdminControl);

AdminRouter.get("/users", AdminMiddleware, AdminController.GetAllUsers);
AdminRouter.get("/users/:userId", AdminMiddleware, AdminController.GetOneUser);
AdminRouter.post("/users/:userId", AdminMiddleware, AdminController.AcceptOneUser);
AdminRouter.delete("/users/:userId", AdminMiddleware, AdminController.DeleteOneUser);


export default {
    path: "/api/admin",
    router: AdminRouter,
};
