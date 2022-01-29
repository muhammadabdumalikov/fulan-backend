import Express from "express"
import UserController from "../controllers/UserController";

const UserRouter = Express.Router()

UserRouter.post("/account", UserController.UserCreateAccount);
