import { verifyJwtToken } from "../modules/jwt.js";

export default async function AdminMiddleware(request, response, next) {
    try {
        if (!request.headers["authorization"]) {
            response
                .status(403)
                .json({ ok: false, message: "Token not found" });
        }

        const data = verifyJwtToken(request.headers["authorization"]);

        if (!data)
            response.status(403).json({ ok: false, message: "Invalid token" });

        const session = await request.db.sessions.findOne({
            where: {
                session_id: data.session_id,
            },
            include: {
                model: request.db.users,
            },
        });

        const user_agent = request.headers["user-agent"];

        if (!session)
            response
                .status(403)
                .json({ ok: false, message: "Session already expired" });

        // if (session.dataValues.session_user_agent !== user_agent) {
        //     await request.db.sessions.destroy({
        //         where: {
        //             session_id: data.session_id,
        //         },
        //     });
        //     throw new response.error(403, "Session expired");
        // }

        if (
            !(
                session.user.user_role === "admin" ||
                session.user.user_role === "superadmin"
            )
        )
            response
                .status(403)
                .json({
                    ok: false,
                    message: "Permission denied! You are not an admin.",
                });

        request.session = session;

        next();
    } catch (error) {
        if (!error.statusCode)
            error = new response.error(403, "Invalid inputs");
        next(error);
    }
}
