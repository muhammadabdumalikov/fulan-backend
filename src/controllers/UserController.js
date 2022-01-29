import Express from "express";
import pkg, { Op } from "sequelize";
import { Validations } from "../modules/validations.js";
import { v4 as uuidv4 } from "uuid";
import RN from "random-number";

export default class UserController {
    static async UserCreateAccount(req, res, next) {
        try {
            const { first_name, last_name, user_phone } = await (
                await Validations.UserCreateAccountValidation()
            ).validateAsync(req.body);

            let isUserExist = await req.db.users.findOne({
                where: {
                    user_phone: {
                        [Op.iLike]: `%${user_phone}%`,
                    },
                },
            });

            if (isUserExist) throw new res.error(400, "User already exists");

            let user = await req.db.users.create({
                first_name: first_name,
                last_name: last_name,
                user_phone: user_phone,
            });

            console.log(first_name)

            const gen = RN.generator({
                min: 10000,
                max: 99999,
                integer: true,
            });

            const genNumber = gen();

            // let messageID = uuidv4();

            // let attempt = await request.db.attempts.create({
            //     user_code: genNumber,
            //     user_id: user.user_id,
            // });

            res.status(201).json({
                ok: true,
                message: "CODE IS SENDED TO YOUR DEVICE",
                data: {
                    // id: attempt.dataValues.attempt_id,
                    user,
                    code: genNumber,
                },
            });
        } catch (error) {
            console.log(error);
            if (!error.statusCode)
                error = new response.error(400, "Invalid inputs");
            next(error);
        }
    }
}
