import { Validations } from "../modules/validations.js";
import RN from "random-number";
import { signJwtToken, verifyJwtToken } from "../modules/jwt.js";

export default class AdminController {
    static async AdminLoginAccount(req, res, next) {
        let { phone } = await (
            await Validations.AdminLoginAccount()
        ).validateAsync(req.body);

        const admin = await req.db.users.findOne({
            where: {
                user_phone: phone,
            },
            raw: true,
        });

        if (!admin)
            res.status(400).json({
                ok: false,
                message: "Admin not found",
            });

        const gen = RN.generator({
            min: 10000,
            max: 99999,
            integer: true,
        });

        const genNumber = gen();

        let attempt = await req.db.attempts.create({
            user_code: genNumber,
            user_id: admin.user_id,
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
    }

    static async ValidateAdminCode(req, res, next) {
        let validationId = req.headers["authorization"];

        if (!validationId)
            res.status(400).json({
                ok: false,
                message: "You have not a permission or token",
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
                message: "Validation is incorrect",
            });

        let { validation_code } = await (
            await Validations.ValidateAdminCode()
        ).validateAsync(req.body);

        if (Number(validation_code) !== Number(attempt.dataValues.user_code)) {
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
                            attempt.dataValues.user.dataValues.user_attempts +
                            1,
                    },
                    {
                        where: {
                            user_id: attempt.dataValues.user_id,
                        },
                    }
                );

                if (
                    Number(attempt.dataValues.user.dataValues.user_attempts) >=
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

        let adminData = await req.db.users.findOne({
            where: {
                user_id: attempt.dataValues.user_id,
            },
        });

        res.status(201).json({
            ok: true,
            message: "Successfully logged in!",
            data: {
                token,
                user: adminData,
            },
        });
    }

    static async AddAdminControl(req, res, next) {
        try {
            let token = req.headers["authorization"];

            let adminToken = verifyJwtToken(token);

            if (!adminToken)
                res.status(400).json({
                    ok: false,
                    message: "You have not a user token or invalid token",
                });

            let session = await req.db.sessions.findOne({
                where: {
                    session_id: adminToken.session_id,
                },
            });

            if (!session)
                res.status(400).json({
                    ok: false,
                    message: "You have not a user ten",
                });

            let superAdmin = await req.db.users.findOne({
                where: {
                    user_id: session.dataValues.user_id,
                },
                raw: true,
            });

            if (superAdmin.user_role !== "superadmin") {
                res.status(400).json({
                    ok: false,
                    message: "You have not a permission to make this operation",
                });
            }

            let { phone } = await (
                await Validations.AddAdminControlValidation()
            ).validateAsync(req.body);

            let newAdmin = await req.db.users.create({
                user_phone: phone,
                user_role: "admin",
            });

            res.status(200).json({
                ok: true,
                message: newAdmin,
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                ok: false,
            });
        }
    }

    static async GetAllUsers(req, res, next) {
        try {
            let users = await req.db.users.findAll({
                where: {
                    provided: false,
                    user_role: "user",
                },
            });

            res.status(200).json({
                ok: true,
                data: users,
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                ok: false,
            });
        }
    }

    static async GetAllUsers(req, res, next) {
        try {
            let { userId } = req.params;

            let user = await req.db.users.findOne({
                where: {
                    user_id: userId,
                },
            });

            res.status(200).json({
                ok: true,
                data: user,
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                ok: false,
            });
        }
    }

    static async AcceptOneUser(req, res, next) {
        try {
            let { userId } = req.body;

            await req.db.users.update(
                {
                    accepted: true,
                },
                {
                    where: {
                        user_id: userId,
                    },
                }
            );

            res.status(200).json({
                ok: true,
                message: "User has successfully been accepted",
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                ok: false,
            });
            next();
        }
    }
}
