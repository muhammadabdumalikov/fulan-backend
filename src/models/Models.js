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
            working: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            birth_date: {
                type: Sequelize.DataTypes.DATEONLY,
                allowNull: false,
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
        });
    }
}
