import Express from "express";
import UserController from "../controllers/UserController.js";

const UserRouter = Express.Router();

UserRouter.post("/account", UserController.UserCreateAccount);

export default {
    path: "/api/users",
    router: UserRouter,
};
