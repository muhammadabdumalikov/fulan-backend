import { Sequelize } from "sequelize";
import Models from "../models/Models.js";

export async function postgres() {
    const sequelize = new Sequelize(process.env.DB_STRING, {
        logging: false,
        define: {
            freezeTableName: true,
        },
    });

    try {
        let db = {};
        db.users = await Models.UserModel(sequelize, Sequelize);
        db.sessions = await Models.SessionModel(sequelize, Sequelize);
        db.bans = await Models.BanModel(sequelize, Sequelize);
        db.attempts = await Models.AttemptsModel(sequelize, Sequelize);
        db.passport_images = await Models.PassportImage(sequelize, Sequelize);
        db.user_bans = await Models.UserBansModel(sequelize, Sequelize);

        await Models.Relations(db);

        // await db.click_payments.sync({
        // 	alter: true
        // })
        // await db.driver_trips.sync({force: true})

        await sequelize.authenticate();
        console.log("Connection has been established successfully.");

        await sequelize.sync({ force: true });

        return db;
    } catch (error) {
        console.log(error);
    }
}
