const isExcelDateSerial = (value: unknown): boolean => {
  if (typeof value !== "number") return false;
  return value > 10000;
};

const excelSerialToDate = (serial: number): Date => {
  const excelEpoch = new Date(1899, 11, 30);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return new Date(excelEpoch.getTime() + serial * millisecondsPerDay);
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatCellValue = (value: unknown, columnName: string) => {
  if (value === null || value === undefined) return "-";

  const isDateColumn =
    columnName.toLowerCase().includes("date") ||
    columnName.toLowerCase().includes("dob") ||
    columnName.toLowerCase().includes("end");

  if (isDateColumn && typeof value === "number" && isExcelDateSerial(value)) {
    try {
      const date = excelSerialToDate(value);
      return formatDate(date);
    } catch {
      return String(value);
    }
  }
  return String(value);
};
