module.exports.requireRole = (role) => (req, res, next) => {
    if (req.user?.type !== role) {
        return res.status(403).json({ error: `Only ${role}s allowed` });
    }
    next();
};
