const asyncHandler = require('express-async-handler');

const adminRoleMiddleware = (...allowedRoles) => {
    return asyncHandler((req,res,next) =>{
        if (!req.admin || !allowedRoles.includes(req.admin.role)) {
            return res.status(403).json({message: "Forbidden: You don't have access to this page!"});
        }
        next();
    })
}

module.exports = adminRoleMiddleware;