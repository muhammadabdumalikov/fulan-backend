import Joi from "joi";

export class Validations {
    static async UserCreateAccountValidation() {
        return Joi.object({
            firstName: Joi.string()
                .required()
                .error(
                    new Error(
                        "Firstname name should be minimum 3 and maximum 64"
                    )
                )
                .min(3)
                .max(24),
            lastName: Joi.string()
                .required()
                .error(new Error("Lastname should be minimum 3 and maximum 64"))
                .min(3)
                .max(24),
            user_phone: Joi.string()
                .required()
                .error(new Error("Phone number is incorrect"))
                .pattern(/^998[389][012345789][0-9]{7}$/),
            user_second_phone: Joi.string()
                .error(new Error("Phone number is incorrect"))
                .pattern(/^998[389][012345789][0-9]{7}$/),
            address: Joi.string().required().min(3).max(124),
            working: Joi.boolean().required(),
            birth_date: Joi.date()
                .required()
                .error(new Error("You must be greater than *"))
                .timestamp()
                .greater("now"),
            about_self: Joi.string(),
            summ: Joi.string().required(),
            definition: Joi.string().required(),
        });
    }
}
