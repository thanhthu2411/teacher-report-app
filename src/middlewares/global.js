

const addLocalVariables = async (req, res, next) => {
  try {
    res.locals.currentYear = new Date().getFullYear();

    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || "production";

    res.locals.queryParams = { ...req.query };

    res.locals.isLoggedIn = false;
    res.locals.user = null;
    if (req.session && req.session.user) {
      res.locals.isLoggedIn = true;
      res.locals.user = req.session.user;
    }

    // setHeadAssetsFunctionality(res);

    next();
  } catch (err) {
    next(err);
  }
};


export { addLocalVariables };