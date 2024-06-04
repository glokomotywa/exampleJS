export const createUserValidationSchema = {
    username: {
        isLength: {
            options: {
                min: 5,
                max: 32
            },
            errorMessage: "Username must be 5-32 characters long"
        },
        notEmpty: { 
            errorMessage: 'Username cannot be empty',
        },
        isString: {
            errorMessage: "Username must be a string!",
        },
    },
    displayName: {
        notEmpty: {
            errorMessage: 'Dsiplay name cannot be empty',
        },
    },
    password: {
        isLength: {
            options: {
                min: 1,
                max: 10
            },
            errorMessage: "Password must be 1-10 characters long"
        },
        notEmpty: {
            errorMessage: 'Password cannot be empty',
        },
        isString: {
            errorMessage: "Password must be a string!",
        },
    }
};

export const createQueryValidationSchema = {
    filter: {
        isString: {
            errorMessage: "Must be a string",
        },
        notEmpty: {
            errorMessage: "Must not be empty",
        },
        isLength: {
            options: {
                min: 3,
                max: 10,
            },
            errorMessage: "Must be 3 to 10 characters",
        },
    },
}