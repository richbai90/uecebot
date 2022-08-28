import fetch, { Headers } from 'node-fetch';
import formatCourse from './formatCourse';
const getCrossListings = (course: any) : any =>
  fetch(`https://utah.kuali.co/api/v1/catalog/course/619684b0ad08592661eff73a/${course.pid}`).then((d) => d.json());

export const getCourse = (course: string): Promise<Record<string, unknown> | undefined> =>
  fetch(`https://utah.kuali.co/api/v1/catalog/search/619684b0ad08592661eff73a?q=${course.replace(/\s/g, '')}&limit=6`)
    .then((d) => d.json())
    .then((d) => { 
      return d[0];
    });

const courseOverlaps = async (course: string) => {
  let courseDetails;
  const formattedCourse = formatCourse(course);
  try {
    if ((courseDetails = await getCourse(formattedCourse))) {
      return (((await getCrossListings(courseDetails))?.jointlyOffered as any[]) ?? []).length > 0;
    }
  } catch {}
  return false;
};

export default courseOverlaps;
