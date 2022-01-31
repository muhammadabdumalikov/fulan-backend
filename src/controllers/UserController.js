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

            if (
                Number(validation_code) !== Number(attempt.dataValues.user_code)
            ) {
                const codeAttemptsVal = 3;
                const phoneAttemptsVal = 3;
                const banTime = 7200000;

                if (
                    Number(attempt.dataValues.user_attempts) >
                    codeAttemptsVal - 1
                ) {
                    await request.db.attempts.destroy({
                        where: {
                            attempt_id: validationId,
                        },
                    });

                    await request.db.users.update(
                        {
                            user_attempts:
                                attempt.dataValues.user.dataValues
                                    .user_attempts + 1,
                        },
                        {
                            where: {
                                user_id: attempt.dataValues.user_id,
                            },
                        }
                    );

                    if (
                        Number(
                            attempt.dataValues.user.dataValues.user_attempts
                        ) >=
                        phoneAttemptsVal - 1
                    ) {
                        await request.db.users.update(
                            {
                                user_attempts: 0,
                            },
                            {
                                where: {
                                    user_id: attempt.dataValues.user_id,
                                },
                            }
                        );

                        await request.db.bans.create({
                            user_id: attempt.dataValues.user_id,
                            expireDate: new Date(Date.now() + banTime),
                        });
                    }
                }
                res.status(400).json({
                    ok: false,
                    message: "You entered incorrect code!",
                });
            }

            res.status(200).json({
                ok: true,
            });

            console.log(validation_code, attempt.dataValues);
        } catch (error) {
            console.log(error);
        }
    }
}
