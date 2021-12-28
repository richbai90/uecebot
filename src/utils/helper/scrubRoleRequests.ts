import formatCourse from './formatCourse';

const safeRequest = /^(?:ece|cs|math)\d+(\/(?:ece|cs|math)\d+)?$/;

const scrubRoleRequests = (requests: string[]): string[] =>
  requests.map((rr) => formatCourse(rr)).filter((rr) => safeRequest.test(rr));

export default scrubRoleRequests;
