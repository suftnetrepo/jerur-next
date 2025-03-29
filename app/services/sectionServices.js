const Section = require("../models/section");
const Course = require("../models/course");

// Create a new section and link it to a course
const createSection = async (sectionData) => {
  try {
    const newSection = new Section(sectionData);
    await newSection.save();

    // Update the Course to include the new section
    await Course.findByIdAndUpdate(sectionData.course, { $push: { sections: newSection._id } });

    return { success: true, section: newSection };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all sections for a course
const getSectionsByCourse = async (courseId) => {
  try {
    const sections = await Section.find({ course: courseId }).populate("lessons");
    return { success: true, sections };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get a single section by ID
const getSectionById = async (sectionId) => {
  try {
    const section = await Section.findById(sectionId).populate("lessons");
    if (!section) return { success: false, error: "Section not found" };
    return { success: true, section };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update a section
const updateSection = async (sectionId, updateData) => {
  try {
    const updatedSection = await Section.findByIdAndUpdate(sectionId, updateData, { new: true });
    if (!updatedSection) return { success: false, error: "Section not found" };
    return { success: true, section: updatedSection };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete a section and remove it from the course
const deleteSection = async (sectionId) => {
  try {
    const section = await Section.findById(sectionId);
    if (!section) return { success: false, error: "Section not found" };

    await Course.findByIdAndUpdate(section.course, { $pull: { sections: sectionId } });
    await Section.findByIdAndDelete(sectionId);

    return { success: true, message: "Section deleted successfully" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export {
  createSection,
  getSectionsByCourse,
  getSectionById,
  updateSection,
  deleteSection,
};
