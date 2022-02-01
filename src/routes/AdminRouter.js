import Express from "express"
import AdminController from "../controllers/AdminController"

const AdminRouter = Express.Router()

AdminRouter.get("/", AdminController.GetAllUsers)


export default {
    path: "/api/admin",
    router: AdminRouter
}