
export const extractRollFromEmail = (email) => {
 
  const part = email.split("@")[0];
  const roll = part.split(".")[1];
  return roll.toUpperCase();
};
