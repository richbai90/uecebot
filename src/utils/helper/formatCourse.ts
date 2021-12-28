function formatCourse(course: string) {
  return course.replace(/\s+/g, '').toLowerCase();
}

export default formatCourse;
