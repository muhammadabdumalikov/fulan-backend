import { Validations } from "../modules/validations.js";

export default class AdminController{
    static async GetAllUsers(req, res, next) {
      let users = await req.db.users.findAll({
          where: {
              user_role: "user"
          },
      })  
    }

    static async AcceptOneUser(req, res, next) {

    }
}