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

            if (isUserExist)
                res.status(400).json({
                    ok: false,
                    message: "User already exists",
                });

            let user = await req.db.users.create({
                first_name: first_name,
                last_name: last_name,
                user_phone: user_phone,
            });

            const gen = RN.generator({
                min: 10000,
                max: 99999,
                integer: true,
            });

            const genNumber = gen();

            // let messageID = uuidv4();

            let attempt = await req.db.attempts.create({
                user_code: genNumber,
                user_id: user.user_id,
            });

            res.status(201).json({
                ok: true,
                message: "CODE IS SENDED TO YOUR DEVICE",
                data: {
                    id: attempt.dataValues.attempt_id,
                    code: genNumber,
                },
            });
        } catch (error) {
            console.log(error);
            if (!error.statusCode) error = new res.error(400, "Invalid inputs");
            next(error);
        }
    }

    static async ValidateUserCode(req, res, next) {
        try {
            let validationId = req.headers["code-validation-id"];

            if (!validationId)
                res.status(400).json({
                    ok: false,
                    message: "Invalid validation token",
                });

            let attempt = await req.db.attempts.findOne({
                where: {
                    attempt_id: validationId,
                },
                include: {
                    model: req.db.users,
                },
            });

            if (!attempt)
                res.status(400).json({
                    ok: false,
                    message: "Validation code incorrect",
                });
            let { validation_code } = await (
                await Validations.ValidateUserCodeValidation()
            ).validateAsync(req.body);

            res.status(200).json({
                ok: true
            })

            console.log(validation_code);
        } catch (error) {
            console.log(error);
        }
    }
}
