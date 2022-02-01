import { verifyJwtToken } from "../modules/jsonwebtoken.js";

export default async function AdminMiddleware(request, response, next) {
    try {
        if (!request.headers["authorization"]) {
            throw new response.error(403, "Token not found");
        }

        const data = verifyJwtToken(request.headers["authorization"]);

        if (!data) throw new response.error(403, "Invalid token");

        const session = await request.db.sessions.findOne({
            where: {
                session_id: data.session_id
            },
            include: {
                model: request.db.users
            }
        });

        const user_agent = request.headers["user-agent"];

        if (!session) throw new response.error(403, "Session already expired");

        // if (session.dataValues.session_user_agent !== user_agent) {
        //     await request.db.sessions.destroy({
        //         where: {
        //             session_id: data.session_id,
        //         },
        //     });
        //     throw new response.error(403, "Session expired");
        // }

        if (!(session.user.user_role === 'admin' || session.user.user_role === 'superadmin')) throw new response.error(405, "Permission denied! You are not an admin.")

        request.session = session;

        next();
    } catch (error) {
        if (!error.statusCode)
            error = new response.error(403, "Invalid inputs");
        next(error);
    }
}