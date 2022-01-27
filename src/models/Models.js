export default class Models {
    static async UserModel(sequelize, Sequelize) {
        return sequelize.define("users", {
            user_id: {
                type: Sequelize.DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            first_name: {
                type: Sequelize.DataTypes.STRING(32),
                allowNull: false,
            },
            last_name: {
                type: Sequelize.DataTypes.STRING(32),
                allowNull: false,
            },
            user_phone: {
                type: Sequelize.DataTypes.STRING(13),
                is: /^998[389][012345789][0-9]{7}$/,
                allowNull: false,
                unique: true,
            },
            user_second_phone: {
                type: Sequelize.DataTypes.STRING(13),
                is: /^998[389][012345789][0-9]{7}$/,
                allowNull: true,
            },
            address: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
            },
            working: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            birth_date: {
                type: Sequelize.DataTypes.DATEONLY,
                allowNull: true,
            },
            about_self: {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
            },
            provide_type: {
                type: Sequelize.DataTypes.ENUM,
                values: ["rasmiy", "norasmiy"],
                defaultValue: "norasmiy",
            },
            summ: {
                type: Sequelize.DataTypes.STRING(32),
                allowNull: false,
            },
            definition: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            user_role: {
                type: Sequelize.DataTypes.ENUM,
                values: ["superadmin", "admin", "user"],
                defaultValue: "user",
            },
            user_attempts: {
                type: Sequelize.DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0,
            },
            provided: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        });
    }

    static async SessionModel(sequelize, Sequelize) {
        return sequelize.define("sessions", {
            session_id: {
                type: Sequelize.DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.DataTypes.UUIDV4,
            },
            session_inet: {
                type: Sequelize.DataTypes.INET,
                allowNull: false,
            },
            session_user_agent: {
                type: Sequelize.DataTypes.STRING(128),
                allowNull: false,
            },
        });
    }

    static async PassportImage(sequelize, Sequelize) {
        return sequelize.define("passport_images", {
            photo_id: {
                type: Sequelize.DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            type: {
                type: Sequelize.DataTypes.ENUM,
                values: ["png", "jpg", "jpeg"],
                allowNull: false,
            },
        });
    }

    static async BanModel(sequelize, Sequelize) {
        return sequelize.define("bans", {
            ban_id: {
                type: Sequelize.DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            expireDate: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false,
            },
        });
    }

    static async AttemptsModel(sequelize, Sequelize) {
        return sequelize.define("attempts", {
            attempt_id: {
                type: Sequelize.DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            user_code: {
                type: Sequelize.DataTypes.STRING(6),
                allowNull: true,
            },
            user_attempts: {
                type: Sequelize.DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0,
            },
            isExpired: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false,
            },
        });
    }

    static async UserBansModel(sequelize, Sequelize) {
        return sequelize.define("user_bans", {
            ban_id: {
                type: Sequelize.DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            expireDate: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false,
            },
        });
    }

    static async Relations(db) {
        await db.users.hasMany(db.sessions, {
            foreignKey: {
                name: "user_id",
                allowNull: false,
            },
        });
        await db.sessions.belongsTo(db.users, {
            foreignKey: {
                name: "user_id",
                allowNull: false,
            },
        });
        await db.users.hasMany(db.attempts, {
            foreignKey: {
                name: "user_id",
                allowNull: false,
            },
        });
        await db.attempts.belongsTo(db.users, {
            foreignKey: {
                name: "user_id",
                allowNull: false,
            },
        });
        await db.users.hasMany(db.bans, {
            foreignKey: {
                name: "user_id",
                allowNull: false,
            },
        });
        await db.bans.belongsTo(db.users, {
            foreignKey: {
                name: "user_id",
                allowNull: false,
            },
        });
        await db.users.hasOne(db.passport_images, {
            foreignKey: {
                name: "user_id",
                allowNull: false,
            },
        });
        await db.passport_images.belongsTo(db.users, {
            foreignKey: {
                name: "user_id",
                allowNull: false,
            },
        });
        await db.users.hasMany(db.user_bans, {
            foreignKey: {
                name: "user_ban_id",
                allowNull: false,
            },
        });
        await db.user_bans.belongsTo(db.users, {
            foreignKey: {
                name: "user_ban_id",
                allowNull: false,
            },
        });
    }
}
