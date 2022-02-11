import pkg, { Op } from "sequelize";
import { Validations } from "../modules/validations.js";
import { v4 as uuidv4 } from "uuid";
import RN from "random-number";
import { signJwtToken, verifyJwtToken } from "../modules/jwt.js";

export default class UserController {
    static async UserCreateAccount(req, res, next) {
        try {
            const { user_phone } = await (
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
            res.status(400).json({
                ok: false,
                message: error
            });
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
                    await req.db.attempts.destroy({
                        where: {
                            attempt_id: validationId,
                        },
                    });

                    await req.db.users.update(
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
                        await req.db.users.update(
                            {
                                user_attempts: 0,
                            },
                            {
                                where: {
                                    user_id: attempt.dataValues.user_id,
                                },
                            }
                        );

                        await req.db.bans.create({
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

            let userAgent = req.headers["user-agent"];
            let ipAddress =
                req.headers["x-forwarded-for"] || req.connection.remoteAddress;

            if (!(userAgent && ipAddress))
                res.status(400).json({
                    ok: false,
                    message: "Invalid device!",
                });

            const session = await req.db.sessions.create({
                user_id: attempt.dataValues.user_id,
                session_inet: ipAddress,
                session_user_agent: userAgent,
            });

            const token = signJwtToken({
                session_id: session.dataValues.session_id,
            });

            await req.db.attempts.destroy({
                where: {
                    user_id: attempt.dataValues.user_id,
                },
            });

            await req.db.attempts.update(
                {
                    user_attempts: 0,
                },
                {
                    where: {
                        user_id: attempt.dataValues.user_id,
                    },
                }
            );

            let userData = await req.db.users.findOne({
                where: {
                    user_id: attempt.dataValues.user_id,
                },
            });

            res.status(201).json({
                ok: true,
                message: "Successfully logged in!",
                data: {
                    token,
                    user: userData,
                },
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                ok: false,
            });
        }
    }

    static async UserLoginAccount(req, res, next) {
        try {
            const { user_phone } = await (
                await Validations.UserLoginAccount()
            ).validateAsync(req.body);

            const user = await req.db.users.findOne({
                where: {
                    user_phone: user_phone,
                },
                raw: true,
            });

            if (!user)
                res.status(400).json({
                    ok: false,
                    message: "User not found",
                });

            console.log(await user);

            const gen = RN.generator({
                min: 10000,
                max: 99999,
                integer: true,
            });

            const genNumber = gen();

            let messageID = uuidv4();

            // await sendSmsTo(phone, messageID, genNumber)

            let attempt = await req.db.attempts.create({
                user_code: genNumber,
                user_id: user.user_id,
            });

            res.status(200).json({
                ok: true,
                message:
                    "We`ve sent a sms with a confirmation code to your mobile phone. Please enter the 5-digit code below.",
                data: {
                    id: attempt.dataValues.attempt_id,
                    code: genNumber,
                },
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                ok: false,
            });
        }
    }

    static async EditUserAccount(req, res, next) {
        try {
            let token = req.headers["authorization"];

            let userToken = verifyJwtToken(token);

            if (!userToken)
                res.status(400).json({
                    ok: false,
                    message: "You have not a user token or invalid token",
                });

            let session = await req.db.sessions.findOne({
                where: {
                    session_id: userToken.session_id,
                },
            });

            let {
                firstName,
                lastName,
                secondPhone,
                address,
                working,
                birthDate,
                aboutSelf,
                summ,
                definition,
            } = await (
                await Validations.EditUserAccount()
            ).validateAsync(req.body);

            let user = await req.db.users.update(
                {
                    first_name: firstName,
                    last_name: lastName,
                    user_second_phone: secondPhone,
                    address: address,
                    working: working,
                    birth_date: birthDate,
                    about_self: aboutSelf,
                    summ: summ,
                    definition: definition,
                },
                {
                    where: {
                        user_id: session.dataValues.user_id,
                    },
                    returning: true,
                }
            );

            console.log(user[1]);
        } catch (error) {
            console.log(error);
            res.status(400).json({
                ok: false,
            });
        }
    }

    static async GetAllUsers(req, res, next) {
        try {
            const pageAsNumber = Number.parseInt(req.query.page);
            const sizeAsNumber = Number.parseInt(req.query.size);

            let page = 0;
            if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
                page = pageAsNumber;
            }

            let size = 50;
            if (
                !Number.isNaN(sizeAsNumber) &&
                sizeAsNumber > 0 &&
                sizeAsNumber < 50
            ) {
                size = sizeAsNumber;
            }

            const users = await req.db.users.findAndCountAll({
                where: {
                    user_role: "user",
                    accepted: true,
                },
                attributes: {
                    exclude: ["user_attempts", "user_role"],
                },
                limit: size,
                offset: page * size,
            });

            res.status(200).json({
                ok: true,
                data: users.rows,
                totalPages: Math.ceil(users.count / size),
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                ok: false,
            });
        }
    }
}
