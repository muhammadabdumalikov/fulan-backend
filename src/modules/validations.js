import Joi from "joi";

export class Validations {
    static async UserCreateAccountValidation() {
        return Joi.object({
            user_phone: Joi.string()
                .required()
                .error(new Error("Phone number is incorrect"))
                .pattern(/^998[389][012345789][0-9]{7}$/),
        });
    }

    static async ValidateUserCodeValidation() {
        return Joi.object({
            validation_code: Joi.string()
                .required()
                .min(5)
                .max(5)
                .error(new Error("Invalid code")),
        });
    }

    static async UserLoginAccount() {
        return Joi.object({
            user_phone: Joi.string()
                .required()
                .error(new Error("Phone number is incorrect"))
                .pattern(/^998[389][012345789][0-9]{7}$/),
        });
    }

    static async EditUserAccount() {
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
            secondPhone: Joi.string()
                .error(new Error("Phone number is incorrect"))
                .pattern(/^998[389][012345789][0-9]{7}$/),
            address: Joi.string().required().min(3).max(124),
            working: Joi.boolean().required(),
            birthDate: Joi.date()
                .required()
                .error(new Error("You must be greater than *")),
                // .timestamp()
                // .greater("now"),
            aboutSelf: Joi.string().required(),
            summ: Joi.string().required(),
            definition: Joi.string().required(),
        });
    }
}
