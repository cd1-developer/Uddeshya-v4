"use client";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { successToast } from "@/components/custom/SuccessToast";
import { ErrorToast } from "@/components/custom/ErrorToast";
import MembersTable from "../Members-Table/MembersTable";
import DialogCompo from "@/components/custom/Dialog-compo/DialogCompo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Role, Gender, EmployeeStatus } from "@/interfaces";
import { addMonths } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import axios from "axios";
import ThreeBodyLoader from "@/components/custom/Loader/ThreeBodyLoader";
import { setEmployee } from "@/libs/dataslice";
import { formatCellValue } from "@/helper/formatCellValue";
import { formatDate } from "@/helper/formatDate";
interface BulkTransitionProps {
  onDataLoaded?: (data: any[], columns: string[]) => void;
}

type Row = Record<string, unknown>;

const BulkTransition = ({ onDataLoaded }: BulkTransitionProps) => {
  const [isBulkTransitionOpen, setIsBulkTransitionOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [data, setData] = useState<Row[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isDataAdded, setIsDataAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  //!     <--------- Main Logic for getting sheet's data to convert into json formate to show on web ---------->

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setIsLoading(true);
    setFileName(file.name);

    try {
      const fileData = await file.arrayBuffer();
      const workbook = XLSX.read(fileData);

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Row[];

      if (jsonData.length > 0) {
        const cols = Object.keys(jsonData[0]);
        setColumns(cols);
        setData(jsonData);
        setIsDataAdded(false);

        if (onDataLoaded) {
          onDataLoaded(jsonData, cols);
        }
      }
    } catch (error) {
      ErrorToast("Failed to read file. Please check the format.");
      console.error("Error reading file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.match(/\.(xlsx|xls|csv)$/)) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] || null);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const resetDialog = () => {
    setData([]);
    setFileName(null);
    setIsDataAdded(false);
    setColumns([]);
    setIsProcessing(false);
  };

  //!       <-------------- Calling the API for inserting data in Bulk ------------->

  const currentEmployees = useSelector(
    (state: RootState) => state.dataSlice.employee
  );

  const handleAddData = async () => {
    if (data.length === 0) return;

    setIsLoading(true);

    try {
      const employees = data.map((row) => {
        const username =
          row["Username"] || row["username"] || row["Name"] || "";
        const email = row["email"] || row["Email"] || "";
        const gender = (row["Gender"] ||
          row["gender"] ||
          Gender.Male) as Gender;
        const role = (row["Role"] || row["role"] || Role.MEMBER) as Role;
        const dateOfBirthValue = formatDate(
          formatCellValue(row["Date of Birth"], "Date of Birth")
        );

        // row["Date of Birth"] || row["dateOfBirth"] || row["DOB"];
        const joiningDateValue = formatDate(
          formatCellValue(row["Joining Date"], "Joining Date")
        );
        const earnedLeaveBalance = Number(
          row["Earned Leave"] || row["earnedLeave"] || row["Earned leave"] || 0
        );
        const casualLeaveBalance = Number(
          row["Casual Leave"] || row["casualLeave"] || row["Casual leave"] || 0
        );

        const leaveBalanceInfo = [
          {
            policyName: "Earned Leave",
            balance: earnedLeaveBalance,
          },
          {
            policyName: "Casual Leave",
            balance: casualLeaveBalance,
          },
        ];

        console.log(earnedLeaveBalance, casualLeaveBalance, leaveBalanceInfo);
        // Convert joiningDate to Date object
        const joiningDate = new Date(String(joiningDateValue));

        // Calculate probation end (3 months from joining date)
        const probationEnd = addMonths(joiningDate, 3);

        const probationEndDate = new Date(probationEnd);
        const status =
          new Date() < probationEndDate
            ? EmployeeStatus.Probation
            : EmployeeStatus.Active;

        return {
          username: String(username),
          email: String(email),
          gender: gender,
          role: role,
          dateOfBirth: dateOfBirthValue,
          joiningDate: joiningDate,
          probationEnd: probationEnd,
          leaveBalanceInfo: leaveBalanceInfo,
          status: status,
        };
      });

      // console.log("Employees to process:", employees);

      // Step 1: Create users
      const userResults = await Promise.all(
        employees.map(async (employee) => {
          try {
            const signupResponse = await axios.post("/api/auth/signup", {
              username: employee.username,
              email: employee.email,
              gender: employee.gender,
              dateOfBirth: employee.dateOfBirth,
            });
            const { success, message, data } = signupResponse.data;

            if (!success) {
              ErrorToast(message);

              return null;
            }

            return {
              userId: signupResponse.data.user.id,
              employeeData: employee,
            };
          } catch (error: any) {
            console.error(
              `Failed to create user ${employee.username}:`,
              error.message
            );
            return null;
          }
        })
      );

      const successfulCreations = userResults.filter(
        (result) => result !== null
      );

      if (successfulCreations.length === 0) {
        ErrorToast("Failed to create any users");
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }

      // Step 2: Create employees
      const employeesCreation = successfulCreations.map(async (result) => {
        try {
          if (!result) return null;

          const employeeResponse = await axios.post(
            "/api/Employee/add-employee",
            {
              userId: result.userId,
              role: result.employeeData.role,
              joiningDate: result.employeeData.joiningDate,
              probationEnd: result.employeeData.probationEnd,
              status: result.employeeData.status,
              leaveBalanceInfo: result.employeeData.leaveBalanceInfo,
            }
          );

          if (!employeeResponse.data.success) {
            console.error(
              "Employee creation failed for",
              result.userId,
              ":",
              employeeResponse.data.message
            );
            return null;
          }

          return employeeResponse.data.data;
        } catch (error: any) {
          console.error(
            `Failed to create employee for user ${result?.userId}:`,
            error.message
          );
          return null;
        }
      });

      const employeeResults = await Promise.all(employeesCreation);
      const successfulEmployees = employeeResults.filter(
        (result) => result !== null
      );

      // Step 3: Update Redux store
      if (successfulEmployees.length > 0) {
        const updatedEmployees = [...currentEmployees, ...successfulEmployees];
        dispatch(setEmployee(updatedEmployees));
      }

      // Show results
      const totalProcessed = successfulEmployees.length;
      const totalFailed = employees.length - totalProcessed;

      if (totalProcessed > 0) {
        successToast(
          `Successfully added ${totalProcessed} employees${
            totalFailed > 0 ? `, ${totalFailed} failed` : ""
          }`
        );
        setIsDataAdded(true);
      } else {
        ErrorToast("Failed to add any employees");
      }
    } catch (error: any) {
      console.error("Error in bulk add:", error);
      ErrorToast(error.message || "Failed to add employees");
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };
  return (
    <div>
      {/* This is the button that opens the dialog */}
      <div
        onClick={() => setIsBulkTransitionOpen(true)}
        className="whitespace-nowrap gap-2 font-gilBold border-[1.5px] border-black rounded-sm px-4 py-2 cursor-pointer text-xs sm:text-sm transition hover:bg-black hover:text-white text-center"
      >
        Bulk Transition
      </div>
      <DialogCompo
        isOpen={isBulkTransitionOpen}
        onOpenChange={(open) => {
          if (isProcessing) {
            // Optionally show a message that operation is in progress
            ErrorToast("Please wait while employees are being added...");
            return; // Don't close the dialog
          }

          setIsBulkTransitionOpen(open);
          if (!open) resetDialog();
        }}
        className={
          data.length > 0 ? "min-w-[50vw] max-w-[90vw]" : "min-w-[30vw]"
        }
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          <h1 className="font-gilSemiBold text-lg">Add Members in Bulk</h1>

          {!fileName && data.length === 0 && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className={`${
                isDragging
                  ? "border-2 border-blue-500 bg-blue-50"
                  : "border-2 border-gray-300 bg-gray-50"
              } border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center hover:bg-gray-50 min-h-[180px]`}
            >
              {isLoading ? (
                <>
                  <div className="mb-2">
                    <ThreeBodyLoader />
                  </div>
                  <p className="font-gilSemiBold">Loading file...</p>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-2">📁</div>
                  <p className="font-gilSemiBold">
                    {isDragging
                      ? "Drop your file here"
                      : "Drag & drop your Excel file here"}
                  </p>
                  <p className="text-gray-600 mt-1">or click to browse files</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports .xlsx, .xls, .csv files
                  </p>
                </>
              )}

              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept=".xlsx,.xls,.csv"
                className="hidden"
                disabled={isLoading}
              />
            </div>
          )}

          {data.length > 0 && (
            <div className="space-y-6">
              <div className="bg-green-50 p-2.5 sm:p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:block sm:text-xl">✅</div>
                    <div>
                      <p className="font-gilSemiBold text-sm sm:text-base">
                        Loaded: {fileName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                        {data.length} employees ready to add
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetDialog}
                    className="h-8 text-xs mt-3 sm:mt-0 font-gilMedium"
                    disabled={isLoading || isProcessing}
                  >
                    Change File
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-800 text-white p-3 font-gilSemiBold text-xs sm:text-sm">
                  Data Preview
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                  <MembersTable data={data} columns={columns} />
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    handleAddData();
                    setIsBulkTransitionOpen(false);
                  }}
                  disabled={isDataAdded || isLoading || isProcessing}
                  className={`flex items-center gap-3 px-8 py-3 font-gilSemiBold rounded-lg cursor-pointer transition-all ${
                    isDataAdded
                      ? "bg-green-600 hover:bg-green-600 cursor-default"
                      : "bg-sky-500 hover:bg-sky-600"
                  } ${
                    isLoading || isProcessing
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading || isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adding {data.length} employees...</span>
                    </>
                  ) : isDataAdded ? (
                    <>
                      <span className="text-xs sm:text-sm">✅</span>
                      <span className="text-xs sm:text-sm">
                        Successfully Added {data.length} Employees!
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm">
                        Add {data.length} Employees to System
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogCompo>
    </div>
  );
};

export default BulkTransition;
