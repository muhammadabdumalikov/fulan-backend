import Express from "express"
import AdminController from "../controllers/AdminController.js"

const AdminRouter = Express.Router()

AdminRouter.post('/login', AdminController.AdminLoginAccount)
AdminRouter.post('/code', AdminController.ValidateAdminCode)

AdminRouter.get("/users", AdminController.GetAllUsers)


export default {
    path: "/api/admin",
    router: AdminRouter
}