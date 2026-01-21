export function sessionMiddleware(req, res, next) {
  if (!req.session) return next();
  if (!req.session.id) {
    req.session.id = Math.random().toString(36).slice(2, 12);
    req.session.createdAt = Date.now();
    req.session.uploadCount = 0;
  }
  next();
}