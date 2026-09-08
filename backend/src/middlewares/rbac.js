const authorize = (requiredPermissions = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access forbidden, user role unknown' });
    }

    const { role } = req.user;
    const userPermissions = role.permissions || [];

    // Super Admin has absolute wildcard access
    if (userPermissions.includes('*')) {
      return next();
    }

    // Convert single permission parameter to array if it is a string
    const permissionsToCheck = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

    // Check if the user has at least one of the required permissions
    const hasPermission = permissionsToCheck.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: 'Access forbidden, insufficient permissions' });
    }

    next();
  };
};

module.exports = { authorize };
