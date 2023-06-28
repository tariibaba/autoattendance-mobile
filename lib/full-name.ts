export function getFullName(person: {
  firstName?: string;
  lastName?: string;
  otherNames?: string;
}) {
  const { firstName, lastName, otherNames } = person;

  return `${lastName}, ${firstName} ${otherNames ?? ''}`.trim();
}
