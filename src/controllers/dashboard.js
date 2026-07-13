import { getClassesByTeacher, createClass } from "../models/class.js";
import { validationResult } from 'express-validator'

const showDashboard = async (req, res) => {
  const userId = req.session.user.id;
  if (!userId) {
    return res.redirect("/login");
  }

  try {
    const classes = await getClassesByTeacher(userId);

    res.render("dashboard", {
      title: "Student Report",
      classes: classes,
    });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    // req.flash("error", "Something went wrong. Please try again.");
    return res.redirect(`/login`);
  }
};

const processCreateClass = async (req, res) => {
  // const errors = validationResult(req);

  // if (!errors.isEmpty()) {
  //   errors.array().forEach((error) => {
  //     req.flash("error", error.msg);
  //   });
  //   return res.redirect("/login");
  // }

  const userId = req.session.user.id;
  if (!userId) {
    return res.redirect("/login");
  }

  const { className, classYear } = req.body;

  try {
    await createClass(className, classYear, userId);
    const classes = await getClassesByTeacher(userId);

    res.status(201).json({
      success: true,
      classes: classes,
      message: "Class created successfully",
    });
  } catch (error) {
    console.error("Error creating class:", error);
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A class with this name already exists for this year",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create class",
    });
  }
};

export { showDashboard, processCreateClass };
