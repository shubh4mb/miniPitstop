// import { validationResult } from 'express-validator';

// export const validate = (validations) => {
//     return async (req, res, next) => {
//         // Run all validations
//         await Promise.all(validations.map(validation => validation.run(req)));

//         const errors = validationResult(req);
//         if (errors.isEmpty()) {
//             return next();
//         }

//         // Format errors nicely
//         const formattedErrors = errors.array().reduce((acc, error) => {
//             if (!acc[error.param]) {
//                 acc[error.param] = error.msg;
//             }
//             return acc;
//         }, {});

//         return res.status(400).json({
//             success: false,
//             errors: formattedErrors
//         });
//     };
// };
