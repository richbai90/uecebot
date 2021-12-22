import fetch, { Headers } from 'node-fetch';
const getCrossListings = (course: any) =>
  fetch(`https://utah.kuali.co/api/v1/catalog/course/6000afce403c68001bca5f0b/${course.pid}`).then((d) => d.json());

export const getCourse = (course: string) =>
  fetch(`https://utah.kuali.co/api/v1/catalog/search/6000afce403c68001bca5f0b?q=${course.replace(/\s/g, '')}&limit=6`)
    .then((d) => d.json())
    .then((d) => d[0]);

const courseOverlaps = async (course: string) => {
  let courseDetails;
  const formattedCourse = course.replace(/\s/g, '').toLowerCase();
  if ((courseDetails = await getCourse(formattedCourse))) {
    return (((await getCrossListings(courseDetails))?.jointlyOffered as any[]) ?? []).length > 0;
  }
  return false;
};

export default courseOverlaps;
