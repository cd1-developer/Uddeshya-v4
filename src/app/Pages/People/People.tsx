"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React, { useState } from "react";
import { Network } from "lucide-react";
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
import z from "zod";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import GetMember from "./People-compo/GetMember";
import { Role, EmployeeStatus } from "@/interfaces";

const addEmployeeSchema = z.object({
  userId: z.string({ error: "userId is required" }),
  role: z.enum(Role, { error: "role is required" }),
  joiningDate: z.union(
    [z.string().transform((val) => new Date(val)), z.date()],
    { error: "joiningDate is required" }
  ),
  probitionEndMonthYear: z.string({
    error: "probitionEnd Month & Year is required",
  }),
  status: z.enum(["Active", "InActive", "Probation"], {
    error: "status is required",
  }),
});

type addPeopleFormValues = {
  userId: string;
  role: Role;
  joiningDate: string | Date;
  probitionEndMonthYear: string;
  status: "Active" | "InActive" | "Probation";
};

const People = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [isPending, startTransition] = useTransition();
  // const organisation = useSelector(
  //   (state: RootState) => state.dataSlice.organisation
  // );
  const orgMember = useSelector((state: RootState) => state.dataSlice.employee);
  // const reportMangers = useSelector(
  //   (state: RootState) => state.dataSlice.reportManager
  // );
  // const organisationId = organisation.id;

  const form = useForm<addPeopleFormValues>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      userId: "",
      role: Role.MEMBER,
      joiningDate: new Date(),
      probitionEndMonthYear: "",
      status: EmployeeStatus.InActive,
    },
  });

  const dispatch = useDispatch();
  // const currentMembers = useSelector(
  //   (state: RootState) => state.dataSlice.organisationMember
  // );

  const userData = useSelector((state: RootState) => state.dataSlice.userInfo);
  console.log(userData);

  const onSubmit = (memberData: addPeopleFormValues) => {
    startTransition(async () => {
      try {
        // const employeeInfo = [{
        //   userId:
        // }];

        const signupResponse = await axios.post("/api/auth/signup", {
          username: memberData.username,
          email: memberData.email,
        });

        const orgMemberResponse = await axios.post("/api/add-member", {
          // orgMembersInfo,
        });
      } catch {}
    });

    // startTransition(async () => {
    //   try {
    //     // const validatedData = addPeopleSchema.parse(memberData);
    //     const signupResponse = await axios.post("/api/signup", {
    //       username: memberData.username,
    //       email: memberData.email,
    //     });
    //     if (!signupResponse.data.success) {
    //       toast.error("Failed to create user account", {
    //         description: signupResponse.data.message,
    //         position: "bottom-right",
    //         duration: 3000,
    //         className: "bg-red-700 text-white border border-red-600",
    //         style: {
    //           backgroundColor: "#C1292E",
    //           color: "white",
    //           border: "1px solid #3E5692",
    //         },
    //       });
    //       return;
    //     }
    //     // console.log(signupResponse);
    //     const newUserId = signupResponse.data.user.id;
    //     const orgMembersInfo = [
    //       {
    //         userId: newUserId,
    //         gender: memberData.gender,
    //         role: memberData.role,
    //         organisationId,
    //         dateOfBirth: memberData.dateOfBirth,
    //         joiningDate: memberData.joiningDate,
    //       },
    //     ];
    //     const orgMemberResponse = await axios.post("/api/add-member", {
    //       orgMembersInfo,
    //     });
    //     const {
    //       success,
    //       message,
    //       data: newOrgMember,
    //       newReportManger,
    //     } = orgMemberResponse.data;
    //     if (success) {
    //       toast.success("Member has been added successfully", {
    //         position: "bottom-right",
    //         duration: 1500,
    //         className: "bg-green-700 text-white border border-green-600",
    //         style: {
    //           backgroundColor: "#285943",
    //           color: "white",
    //           border: "1px solid #3E5692",
    //         },
    //       });
    //       const updatedOrgMembers: OrganisationMember[] = [
    //         ...(currentMembers || []),
    //         ...newOrgMember,
    //       ];
    //       if (
    //         newReportManger.length > 0 &&
    //         memberData.role === "REPORT_MANAGER"
    //       ) {
    //         dispatch(setReportManager([...reportMangers, ...newReportManger]));
    //       }
    //       dispatch(setOrganisationMember(updatedOrgMembers));
    //       setIsOpen(false);
    //       form.reset();
    //     } else {
    //       toast.error("Failed to add member to organization", {
    //         description: orgMemberResponse.data.message,
    //       });
    //     }
    //   } catch (error: any) {
    //     console.error("Full error details:", error);
    //     console.error("Error response:", error.response?.data);
    //     const errorMessage =
    //       error.response?.data?.message || error.message || "Unknown error";
    //     toast.error("Something went wrong while adding the members", {
    //       description: errorMessage,
    //       position: "bottom-right",
    //       duration: 3000,
    //       className: "bg-red-700 text-white border border-red-600",
    //       style: {
    //         backgroundColor: "#C1292E",
    //         color: "white",
    //         border: "1px solid #3E5692",
    //       },
    //     });
    //   }
    // });
  };
  const userRole = useSelector(
    (state: RootState) => state.dataSlice.employee
  ).find((member) => member.role)?.role;

  return (
    <div className="transition-all duration-300">
      <header className="sm:absolute sm:right-3 sm:top-19 block">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-5 cursor-pointer org-chart">
            <i>
              <Network className="text-sky-700" size={15} strokeWidth={1.8} />
            </i>
            <span className="text-sky-700 text-sm font-gilBold">Org Chart</span>
          </div>
          <div className="flex items-center gap-2 font-gilBold border-[1.5px] border-black rounded-sm px-4 py-2 cursor-pointer text-sm transition">
            Bulk Transition
          </div>
          <div className=" adding-person">
            {/* {userRole === "ADMIN" ? (
              <Button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 font-gilBold border-[1.5px] text-white bg-black border-black rounded-sm px-4 py-2 cursor-pointer"
              >
                <span>Add new person</span>
              </Button>
            ) : null} */}

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
                            className="w-full border-1 border-[rgba(0,0,0,0.3)] font-gilMedium"
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
                        <FormLabel className="font-gilSemiBold">Role</FormLabel>
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
                              <SelectItem value="REPORT_MANAGER">
                                Report Manager
                              </SelectItem>
                              <SelectItem value="MEMBER">Member</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
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
                              value={field.value}
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
      </header>

      <div className="main">
        {/* <div className="Get-Member"></div> */}
        <GetMember />
      </div>
    </div>
  );
};

export default People;
