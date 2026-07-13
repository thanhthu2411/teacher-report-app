import { getClassBySlug } from "../models/class.js";
import { getStudentByClass, addNewStudent } from "../models/student.js";

const showClassDetailPage = async (req, res, next) => {
  const classSlug = req.params.classSlug;
  if (!classSlug) {
    const err = new Error("Missing route parameters");
    err.status = 400;
    return next(err);
  }

  try {
    const cls = await getClassBySlug(classSlug);
    const students = await getStudentByClass(cls.id);

    res.render("class", {
      title: "Class",
      students: students,
      cls
    });
  } catch (error) {
    console.error("Error loading class:", error);
    // req.flash("error", "Something went wrong. Please try again.");
    return res.redirect(`/dashboard`);
  }
};

const processAddNewStudent = async (req, res) => {
  const classSlug = req.params.classSlug;
  if (!classSlug) {
    const err = new Error("Missing route parameters");
    err.status = 400;
    return next(err);
  }

  const { name, dob, gender } = req.body;

  try {
    const cls = await getClassBySlug(classSlug);
    await addNewStudent(name, dob, gender, cls.id);
    const students = await getStudentByClass(cls.id);

    res.status(200).json({
      success: true,
      students: students,
      cls,
      message: "Student added successfully",
    });
  } catch (error) {
    console.error("Error loading class:", error);
    // req.flash("error", "Something went wrong. Please try again.");
    res.status(500).json({
      success: false,
      message: "Failed to create student",
    });
  }
};

export { showClassDetailPage, processAddNewStudent };

// do class ejs and form -> then write frontend js