import Express from "express";
import UserController from "../controllers/UserController.js";

const UserRouter = Express.Router();

UserRouter.get("/", UserController.GetAllUsers)

UserRouter.post("/account", UserController.UserCreateAccount);
UserRouter.post("/login", UserController.UserLoginAccount)
UserRouter.post("/code", UserController.ValidateUserCode)

UserRouter.post("/edit", UserController.EditUserAccount)

export default {
    path: "/api/users",
    router: UserRouter,
};
