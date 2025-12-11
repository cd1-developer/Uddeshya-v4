"use client";
import React, { useEffect, useState, useRef } from "react";
import { HandFist, Network, SquareCheck } from "lucide-react";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormField,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/custom/Date-Picker/DatePicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DialogCompo from "@/components/custom/Dialog-compo/DialogCompo";
// import { setOrganisationMember, setReportManager } from "@/libs/Dataslice";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import z, { json, object } from "zod";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import { addMonths, format } from "date-fns";
import GetMember from "./People-compo/GetMember";
import { Role, EmployeeStatus, Gender, Employee } from "@/interfaces";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { successToast } from "@/components/custom/SuccessToast";
import { setEmployee } from "@/libs/dataslice";
import MembersTable from "./Members-Table/MembersTable";
import BulkTransition from "./Bulk-Transition-Compo/BulkTransition";

const addEmployeeSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string({ error: "Email is required" }),
  role: z.enum(Role, { error: "Role is required" }),
  gender: z.enum(Gender, { error: "Gender is required" }),
  dateOfBirth: z.date().optional(),
  joiningDate: z.union(
    [z.string().transform((val) => new Date(val)), z.date()],
    { error: "JoiningDate is required" }
  ),
  probationEnd: z.union([
    z.string().transform((val) => new Date(val)),
    z.date(),
  ]),
  status: z.enum([
    EmployeeStatus.Active,
    EmployeeStatus.InActive,
    EmployeeStatus.Probation,
  ]),
});

type addPeopleFormValues = {
  username: string;
  email: string;
  role: Role;
  gender: Gender;
  dateOfBirth?: Date;
  joiningDate: string | Date;
  probationEnd: string | Date;
  status: EmployeeStatus;
};

type Row = Record<string, unknown>;

const Members = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<Row[]>([]);
  const [bulkData, setBulkData] = useState<any[]>([]);
  const [bulkColumns, setBulkColumns] = useState<string[]>([]);

  const handleBulkDataLoaded = (data: any[], columns: string[]) => {
    setBulkData(data);
    setBulkColumns(columns);
  };
  useEffect(() => {
    const innerHight = window.innerHeight;
    console.log(innerHight);
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`/api/Employee/get-employees`);

      const { success, data, message } = response.data;

      if (!success) {
        ErrorToast(message || "Failed to fetch members");
        return;
      }
      console.log(response.data);

      dispatch(setEmployee(data));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error fetching members: ", errorMessage);
      ErrorToast("Failed to load members");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const currentEmployees = useSelector(
    (state: RootState) => state.dataSlice.employee
  );

  const currentUser = useSelector(
    (state: RootState) => state.dataSlice.userInfo
  );
  const currentEmp = currentEmployees.find(
    (emp) => emp.userId === currentUser.id
  );
  // console.log(currentEmp);

  const form = useForm<addPeopleFormValues>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      username: "",
      email: "",
      role: Role.MEMBER,
      gender: Gender.Male,
      dateOfBirth: undefined,
      joiningDate: new Date(),
      probationEnd: addMonths(new Date(), 3),
      status: EmployeeStatus.InActive,
    },
  });

  const dispatch = useDispatch();
  const joinDate = form.watch("joiningDate");

  useEffect(() => {
    if (!joinDate) return;

    const joiningDate = new Date(joinDate);
    const probationEndDate = addMonths(joiningDate, 3);
    const formateProbationEndDate = format(probationEndDate, "yyyy-MM-dd");

    form.setValue("probationEnd", formateProbationEndDate, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [joinDate, form]);

  const onSubmit = (memberData: addPeopleFormValues) => {
    startTransition(async () => {
      try {
        const signupResponse = await axios.post("/api/auth/signup", {
          username: memberData.username,
          email: memberData.email,
          gender: memberData.gender,
          dateOfBirth: memberData.dateOfBirth,
        });

        if (!signupResponse.data.success) {
          ErrorToast(signupResponse.data.message);
          return;
        }
        const newUserId = signupResponse.data.user.id;

        const probationEndDate = new Date(memberData.probationEnd);

        const status =
          new Date() < probationEndDate
            ? EmployeeStatus.Probation
            : EmployeeStatus.Active;

        const orgMembersInfo = {
          userId: newUserId,
          role: memberData.role,
          joiningDate: memberData.joiningDate,
          probationEnd: probationEndDate,
          status: status,
        };

        const orgMemberResponse = await axios.post(
          "/api/Employee/add-employee",

          orgMembersInfo
        );
        const { success, message, data: newEmployee } = orgMemberResponse.data;
        if (!success) {
          ErrorToast(message);
          return;
        }
        const updatedOrgMembers: Employee[] = [
          ...(currentEmployees || []),
          newEmployee,
        ];
        dispatch(setEmployee(updatedOrgMembers));
        setIsOpen(false);
        form.reset();
        successToast("Member has been added successfully.");
      } catch (error: any) {
        console.error("Full error details:", error);
        ErrorToast("Something went wrong while adding the members");
      }
    });
  };

  return (
    <div className="transition-all duration-300 space-y-3">
      <header className="sm:absolute sm:right-3 sm:top-19 block">
        {currentEmp?.role === Role.ADMIN && (
          <div className="flex items-center flex-wrap sm:flex-nowrap gap-2">
            <div className="flex items-center gap-2 mr-5 whitespace-nowrap px-4 py-2 rounded-sm cursor-pointer org-chart">
              <i>
                <Network className="text-sky-700" size={15} strokeWidth={1.8} />
              </i>
              <span className="text-sky-700 text-xs sm:text-sm font-gilBold">
                Org Chart
              </span>
            </div>
            <div className="bulk-transition flex-1 sm:flex-none">
              <BulkTransition onDataLoaded={handleBulkDataLoaded} />
            </div>
            <div className=" adding-person">
              <Button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 font-gilBold border-[1.5px] text-white bg-black border-black rounded-sm px-4 py-2 cursor-pointer"
              >
                <span>Add new person</span>
              </Button>

              <DialogCompo
                isOpen={isOpen}
                onOpenChange={() => setIsOpen(false)}
                title="Add new person"
              >
                <Form {...form}>
                  <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-gilSemiBold">
                            Username
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter member's username"
                              className="w-full border-[rgba(0,0,0,0.3)] border-1 font-gilMedium"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-gilSemiBold">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter member's email"
                              className="w-full border-1 border-[rgba(0,0,0,0.3)] font-gilMedium"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-gilSemiBold">
                            Gender
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger className="font-gilMedium bg-white py-5 border-[rgba(0,0,0,0.3)]">
                                <SelectValue placeholder="Select the gender" />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent className="">
                              <SelectGroup className="font-gilRegular">
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-gilSemiBold">
                            Role
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger className="font-gilMedium bg-white py-5 border-[rgba(0,0,0,0.3)]">
                                <SelectValue placeholder="Choose the role" />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              <SelectGroup className="font-gilRegular">
                                <SelectItem value={Role.REPORT_MANAGER}>
                                  Report Manager
                                </SelectItem>
                                <SelectItem value={Role.MEMBER}>
                                  Member
                                </SelectItem>
                                <SelectItem value={Role.ADMIN}>
                                  Admin
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-gilSemiBold">
                            Date of birth
                          </FormLabel>
                          <FormControl>
                            <div className="w-full">
                              <DatePicker
                                value={field.value}
                                onChange={field.onChange}
                                className="w-full"
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="joiningDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-gilSemiBold">
                            Joining Date
                          </FormLabel>
                          <FormControl>
                            <div className="w-full">
                              <DatePicker
                                value={
                                  typeof field.value === "string"
                                    ? new Date(field.value)
                                    : field.value
                                }
                                onChange={field.onChange}
                                className="w-full"
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="probationEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-gilSemiBold">
                            probation End
                          </FormLabel>
                          <FormControl>
                            <div className="w-full opacity-70 pointer-events-none">
                              <DatePicker
                                value={
                                  typeof field.value === "string"
                                    ? new Date(field.value)
                                    : field.value
                                }
                                onChange={field.onChange}
                                className="w-full"
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-end gap-6 btn">
                      <Button
                        type="button"
                        onClick={(e) => {
                          setIsOpen(false);
                          form.reset();
                        }}
                        className="text-black bg-white cursor-pointer border-1 border-[rgba(0,0,0,0.3)] outline-1 px-4 py-1 text-sm font-gilSemiBold rounded-sm hover:text-white"
                      >
                        Cancel
                      </Button>

                      <div className="add">
                        <Button
                          type="submit"
                          className="flex items-center gap-3 px-4 py-1 text-sm font-gilSemiBold rounded-sm text-white"
                          disabled={isPending}
                        >
                          {isPending ? "Adding..." : "Add"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </DialogCompo>
            </div>
          </div>
        )}
      </header>

      <div className="main">
        {/* <div className="Get-Member"></div> */}
        <GetMember bulkData={bulkData} bulkColumns={bulkColumns} />
        {/* {bulkData.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-gilBold text-lg">Bulk Uploaded Data</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkData([]);
                  setBulkColumns([]);
                }}
              >
                Clear
              </Button>
            </div>
            <MembersTable data={bulkData} columns={bulkColumns} />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Members;
