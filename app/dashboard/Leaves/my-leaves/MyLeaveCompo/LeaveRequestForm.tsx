import React, { useEffect, useMemo } from "react";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ConfigProvider, DatePicker, Space } from "antd";
import { LeaveSchema } from "@/schemas/leave.schema";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import { type UseFormReturn } from "react-hook-form";
import dayjs from "dayjs";
import { isSameDay } from "date-fns";
import z from "zod";
import { getBalance } from "@/helper/getBalance";
import {
  AbsentType,
  Employee,
  leavePolicy,
  EmployeeStatus,
} from "@/interfaces";
import axios from "axios";
import { successToast } from "@/components/custom/SuccessToast";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { setLeave } from "@/libs/dataslice";
import { useDispatch } from "react-redux";
import POLICIES from "@/constant/Policies";

type CreateLeaveFormValues = z.infer<typeof LeaveSchema>;

interface AbsentTypeDetails {
  key: AbsentType;
  value: string;
}

const AbsentTypes = [
  {
    key: AbsentType.FIRST_HALF,
    value: "First Half",
  },
  {
    key: AbsentType.SECOND_HALF,
    value: "Second Half",
  },
  {
    key: AbsentType.FULL_DAY,
    value: "Full Day",
  },
] as AbsentTypeDetails[];

const EndAbsentTypes = AbsentTypes.filter(
  (type) => type.key !== AbsentType.SECOND_HALF
);

interface LeaveRequestFormProp {
  form: UseFormReturn<CreateLeaveFormValues>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LeaveRequestForm = ({ form, setIsOpen }: LeaveRequestFormProp) => {
  const policyName = form.watch("policyName");
  const selectedLeaveType = form.watch("policyName");
  const startDate = form.watch("startDateTime");
  const startAbsentType = form.watch("startAbsentType");
  const endDate = form.watch("endDateTime") as Date;
  const endAbsentType = form.watch("endAbsentType");
  const isLeaveTypeSelected = policyName !== "" || policyName;
  const dispatch = useDispatch();

  useEffect(() => {
    if (startAbsentType === AbsentType.FIRST_HALF && startDate) {
      form.setValue("endDateTime", startDate);
    }
  }, [startDate, startAbsentType]);

  const { holidays, leaves, employees, currentUser } = useSelector(
    (state: RootState) => ({
      holidays: state.dataSlice.holiday,
      leaves: state.dataSlice.leave,
      employees: state.dataSlice.employee,
      currentUser: state.dataSlice.userInfo,
    })
  );

  const deductedBalance = useMemo(() => {
    const leaveInfo = POLICIES.find((data) => data.policyName === policyName);

    if (!startDate || !startAbsentType) return 0;

    const balance = getBalance({
      startDateTime: startDate,
      endDateTime: endDate as Date,
      startAbsentType,
      endAbsentType,
      leavePolicies: leaveInfo as leavePolicy,
      holidays,
    });
    return balance;
  }, [startDate, endDate, startAbsentType, endAbsentType]);

  const selectLeaveType = POLICIES.map((leave, index) => {
    return {
      leavetype: leave.policyName,
    };
  });

  const isEndDateDisabled = useMemo(() => {
    if (!startDate || !endDate) return true;

    return startAbsentType === AbsentType.FIRST_HALF;
  }, [startDate, startAbsentType]);

  const getEndDatePlaceholder = () => {
    if (!isLeaveTypeSelected) {
      return "Please select leave type first";
    }

    if (isEndDateDisabled) {
      return "Disabled for First Half leave";
    }

    if (!startDate) {
      return "Select start date first";
    }

    return "Select end date";
  };

  const getEndAbsentTypePlaceholder = () => {
    if (!isLeaveTypeSelected) {
      return "Select leave type first";
    }

    if (!startDate) {
      return "Select start date first";
    }

    if (isEndDateDisabled) {
      if (startAbsentType === AbsentType.FIRST_HALF) {
        return "Disabled for First Half leave";
      }
      return "Auto-set for same day";
    }

    return "Select absent type";
  };

  const employee = employees.find(
    (emp) => emp.userId === currentUser.id
  ) as Employee;
  console.log(employee);

  const onSubmit = async (leaveData: CreateLeaveFormValues) => {
    let { startAbsentType, endAbsentType } = leaveData;

    // const employee = employees.find(
    //   (member) => member.id === leaveData.employeeId
    // );

    const employee = employees.find(
      (emp) => emp.userId === currentUser.id
    ) as Employee;

    if (employee.status === EmployeeStatus.Probation) {
      ErrorToast("Oops! You're still on probation.");
      return;
    }
    // const casualLeaveBalance = (employee?.leaveBalances.find(balance => balance.policyName === ))
    const currentPolicy = POLICIES.find(
      (policy) => policy.policyName === leaveData.policyName
    );

    const currentBal = (employee?.leaveBalances.find(
      (leaveBalanceInfo) => leaveBalanceInfo.policyName === leaveData.policyName
    )?.balance || 0) as number;

    if (currentPolicy?.maxApply && deductedBalance > currentPolicy.maxApply) {
      ErrorToast(`You can't apply concurrent ${currentPolicy.maxApply} leaves`);
      return;
    }

    if (deductedBalance > currentBal) {
      ErrorToast(`Insufficiant leave balance ${currentBal}`);
      return;
    }

    const payload = {
      ...leaveData,
      startAbsentType,
      endAbsentType: endAbsentType,
    };

    try {
      const res = await axios.post("/api/leave/apply-leave", payload);
      const { success, message, data } = res.data;

      if (success) {
        successToast(message);
        dispatch(setLeave([...leaves, data]));
        setIsOpen(false);
        form.reset();
      } else {
        ErrorToast(message || "Something went wrong while creating leave.");
        dispatch(setLeave([]));
      }
    } catch (error: any) {
      console.error("Error creating leave:", error);
      ErrorToast(error);
    }
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit, (errors: any) => {
          console.log("Validation errors:", errors);
        })}
      >
        <FormField
          control={form.control}
          name="policyName"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel className="font-gilSemiBold text-neutral-800 text-md flex-1">
                Leave Type
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl className="w-full">
                  <SelectTrigger className="font-gilMedium bg-white border-[rgba(0,0,0,0.3)]">
                    <SelectValue placeholder="select leavetype" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent className="">
                  <SelectGroup className="font-gilRegular">
                    {selectLeaveType.map((Item, index) => (
                      <SelectItem value={Item.leavetype} key={index}>
                        <div>{Item.leavetype}</div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="space-y-2 mb-5">
          <FormLabel className="font-gilSemiBold text-neutral-800 text-md">
            Start Date
          </FormLabel>

          <div className="flex justify-between gap-4">
            <FormField
              control={form.control}
              name="startDateTime"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="">
                    <ConfigProvider
                      theme={{
                        token: {
                          fontFamily: "gilRegular",
                        },
                      }}
                    >
                      <Space
                        orientation="vertical"
                        className="custom-datepicker w-full"
                      >
                        <DatePicker
                          className="w-full h-9"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) =>
                            form.setValue(
                              "startDateTime",
                              (date as dayjs.Dayjs).toDate()
                            )
                          }
                          allowClear
                          disabled={!isLeaveTypeSelected}
                          placeholder={
                            !isLeaveTypeSelected
                              ? "Please select leave type first"
                              : "Select start date"
                          }
                        />
                      </Space>
                    </ConfigProvider>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Select
              onValueChange={(value) => {
                const absentType = AbsentType[value as keyof typeof AbsentType];

                form.setValue("startAbsentType", absentType);
              }}
              disabled={!isLeaveTypeSelected || !startDate}
              value={startAbsentType}
            >
              <FormControl className="">
                <SelectTrigger className="font-gilMedium text-neutral-800 bg-white border-[rgba(0,0,0,0.3)]">
                  <SelectValue
                    placeholder={
                      !startDate ? "Select start date first" : "Absent type"
                    }
                  />
                </SelectTrigger>
              </FormControl>

              <SelectContent className="">
                <SelectGroup className="font-gilMedium">
                  {AbsentTypes.map((type) => (
                    <SelectItem key={type.key} value={type.key}>
                      {type.value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <FormLabel className="font-gilSemiBold text-neutral-800 text-md">
            End Date
          </FormLabel>

          <div className="flex justify-between gap-4">
            <FormField
              name="endDateTime"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="">
                    <ConfigProvider
                      theme={{
                        token: {
                          fontFamily: "gilRegular",
                        },
                      }}
                    >
                      <Space
                        orientation="vertical"
                        className="custom-datepicker w-full"
                      >
                        <DatePicker
                          className="w-full h-9"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => {
                            form.setValue(
                              "endDateTime",
                              (date as dayjs.Dayjs).toDate()
                            );
                          }}
                          allowClear
                          disabled={!isLeaveTypeSelected || isEndDateDisabled}
                          placeholder={getEndDatePlaceholder()}
                        />
                      </Space>
                    </ConfigProvider>
                  </div>
                </FormItem>
              )}
            />

            <Select
              onValueChange={(value) => {
                const absentType =
                  value === AbsentType.FIRST_HALF
                    ? AbsentType.FIRST_HALF
                    : AbsentType.FULL_DAY;

                form.setValue("endAbsentType", absentType);
              }}
              disabled={
                !isLeaveTypeSelected ||
                isEndDateDisabled ||
                isSameDay(startDate, endDate)
              }
              value={endAbsentType}
            >
              <FormControl className="">
                <SelectTrigger className="font-gilMedium text-neutral-800 bg-white border-[rgba(0,0,0,0.3)]">
                  <SelectValue placeholder={getEndAbsentTypePlaceholder()} />
                </SelectTrigger>
              </FormControl>

              <SelectContent className="">
                <SelectGroup className="font-gilMedium">
                  {EndAbsentTypes.map((type) => (
                    <SelectItem key={type.key} value={type.key}>
                      {type.value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLeaveTypeSelected && (
          <h2>
            Balance Debit:{" "}
            <span className="text-red-700">{deductedBalance}</span>
          </h2>
        )}

        <FormField
          name="reason"
          control={form.control}
          render={({ field }) => (
            <FormItem className="">
              <FormLabel className="font-gilSemiBold text-neutral-800 text-md">
                Reason
              </FormLabel>
              <FormControl className="">
                <Textarea
                  {...field}
                  className="font-gilMedium"
                  placeholder="comments"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-6 btn">
          <Button
            type="button"
            onClick={() => {
              form.reset();
              setIsOpen(false);
            }}
            className="text-black bg-white cursor-pointer border-1 border-[rgba(0,0,0,0.3)] outline-1 px-4 py-1 text-sm font-gilSemiBold rounded-sm hover:text-white"
          >
            Cancel
          </Button>

          <div className="add">
            <Button
              type="submit"
              className="flex items-center gap-3 px-4 py-1 text-sm font-gilSemiBold rounded-sm text-white"
            >
              Create
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default LeaveRequestForm;

//todo      <------- Output Example (Success) -------->
// {
//   "success": true,
//   "data": {
//     "id": "leave789",
//     "employeeId": "emp123",
//     "policyName": "Sick Leave",
//     "startDateTime": "2024-01-15T09:00:00Z",
//     "startAbsentType": "FULL_DAY",
//     "endDateTime": "2024-01-16T18:00:00Z",
//     "endAbsentType": "FULL_DAY",
//     "reason": "Feeling unwell",
//     "status": "PENDING",
//     "createdAt": "2024-01-10T10:30:00Z"
//   },
//   "message": "Leave applied successfully"
// }
