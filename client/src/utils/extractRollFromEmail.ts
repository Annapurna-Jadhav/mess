export const extractRollFromEmail = (email: string) => {
  // student1.231cv208@nitk.edu.in
  const match = email.match(/\.([a-z0-9]+)@/i);
  return match ? match[1].toUpperCase() : null;
};
