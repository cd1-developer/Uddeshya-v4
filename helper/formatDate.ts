export function formatDate(dateString: string) {
  const dateArray = dateString.split("/").map((dateInfo) => Number(dateInfo));
  const formatedDate = new Date(dateArray[2], dateArray[1], dateArray[0]);
  return formatedDate;
}
