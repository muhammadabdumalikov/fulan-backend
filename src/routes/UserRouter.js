import Express from "express";
import UserController from "../controllers/UserController.js";

const UserRouter = Express.Router();

UserRouter.post("/account", UserController.UserCreateAccount);
UserRouter.post("/login", UserController.UserLoginAccount)
UserRouter.post("/code", UserController.ValidateUserCode)

export default {
    path: "/api/users",
    router: UserRouter,
};
