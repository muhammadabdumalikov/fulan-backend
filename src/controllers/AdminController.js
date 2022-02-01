import { Validations } from "../modules/validations.js";
import RN from "random-number"

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
        let validateId = req.headers["authorization"]

        if (!validateId) res.status(400).json({
            ok: false,
            message: "You have not a permission or invalid token"
        })

    }

    static async GetAllUsers(req, res, next) {
        let token = req.headers["authorization"];
        console.log(token);

        let users = await req.db.users.findAll({
            where: {
                user_role: "user",
            },
        });
    }

    static async AcceptOneUser(req, res, next) {}
}
