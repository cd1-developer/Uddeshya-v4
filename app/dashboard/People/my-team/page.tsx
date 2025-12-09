"use client";
import { RootState } from "@/libs/store";
import React from "react";
import { useSelector } from "react-redux";
import { Employee, Role } from "@/interfaces";
import { useTeamView } from "@/hooks/useTeamViews";
import {
  Users,
  UserCog,
  UserCheck,
  UserX,
  Mail,
  UserPlus,
  Network,
} from "lucide-react";
import {
  AdminViewData,
  ReportManagerViewData,
  MemberViewData,
  TeamViewData,
} from "@/types/team.types";

//todo ============ VIEW COMPONENTS (Add these OUTSIDE the main component) ============

const AdminView = ({ data }: { data: AdminViewData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Unassigned Report Managers */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <UserCog className="" size={24} />
          <h2 className="text-xl font-gilSemiBold">
            Unassigned Report Managers
          </h2>
        </div>
      </div>
      <div className="p-6">
        {data.unassignedReportManagers.length === 0 ? (
          <EmptyState message="All report managers are properly assigned" />
        ) : (
          <MemberList members={data.unassignedReportManagers} />
        )}
      </div>
    </div>

    {/* Unassigned Members */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <UserX className="" size={24} />
          <h2 className="text-xl font-gilSemiBold">Unassigned Members</h2>
        </div>
      </div>
      <div className="p-6">
        {data.unassignedMembers.length === 0 ? (
          <EmptyState message="All members are assigned to managers" />
        ) : (
          <MemberList members={data.unassignedMembers} />
        )}
      </div>
    </div>
  </div>
);

const ReportManagerView = ({
  data,
  currentEmployee,
}: {
  data: ReportManagerViewData;
  currentEmployee: Employee;
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* My Direct Reports */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <Users className="text-neutral-700" size={24} />
          <h2 className="text-xl font-gilSemiBold text-neutral-700">
            My Direct Reports ({data.myTeamMembers.length})
          </h2>
        </div>
      </div>
      <div className="p-6">
        {data.myTeamMembers.length === 0 ? (
          <EmptyState message="You don't have any team members assigned yet" />
        ) : (
          <MemberList members={data.myTeamMembers} />
        )}
      </div>
    </div>

    {/* Available Unassigned Members */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <UserPlus className="text-neutral-700" size={24} />
          <h2 className="text-xl font-gilSemiBold text-neutral-700">
            Available Members
          </h2>
        </div>
      </div>
      <div className="p-6">
        {data.availableUnassignedMembers.length === 0 ? (
          <EmptyState message="No unassigned members available" />
        ) : (
          <MemberList members={data.availableUnassignedMembers} />
        )}
      </div>
    </div>
  </div>
);

const MemberView = ({
  data,
  currentEmployee,
}: {
  data: MemberViewData;
  currentEmployee: Employee;
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* My Manager */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <UserCog className="text-neutral-700" size={24} />
          <h2 className="text-xl font-gilSemiBold text-neutral-700">
            My Manager
          </h2>
        </div>
      </div>
      <div className="p-6">
        {data.myManager ? (
          <MemberList members={[data.myManager]} />
        ) : (
          <EmptyState message="You don't have a manager assigned" />
        )}
      </div>
    </div>

    {/* My Team Members */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <Network className="text-neutral-700" size={24} />
          <h2 className="text-xl font-gilSemiBold text-neutral-700">
            My Team Colleagues
          </h2>
        </div>
      </div>
      <div className="p-6">
        {data.teamMembers.length === 0 ? (
          <EmptyState message="No other team members under your manager" />
        ) : (
          <MemberList members={data.teamMembers} />
        )}
      </div>
    </div>
  </div>
);

// ============ REUSABLE COMPONENTS ============

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center flex flex-col items-center py-8">
    <UserCheck
      className="mx-auto text-gray-400 mb-3"
      strokeWidth={1.5}
      size={30}
    />
    <p className="text-gray-500 text-md font-gilMedium">{message}</p>
    {/* <img src="/cat.gif" className="w-28 " alt="" /> */}
  </div>
);

const MemberList = ({ members }: { members: Employee[] }) => (
  <div className="space-y-4">
    {members.map((member) => (
      <div
        key={member.id}
        className="border border-gray-200 flex items-center justify-between rounded-xl p-5 hover:border-sky-300 transition-colors duration-200"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center font-semibold text-md">
              {member.user?.username?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="font-gilSemiBold text-gray-900 text-md">
                {member.user?.username || "Unknown User"}
              </h3>
              <p className="text-gray-600 text-xs font-gilRegular">
                {member.user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-gilMedium bg-sky-100 text-sky-800">
            {member.role.replace("_", " ")}
          </span>
        </div>
      </div>
    ))}
  </div>
);

//todo ============ MAIN COMPONENT ============

const MyTeam = () => {
  const employees = useSelector((state: RootState) => state.dataSlice.employee);
  const currentUser = useSelector(
    (state: RootState) => state.dataSlice.userInfo
  );

  const currentEmployee = employees.find(
    (member) => member.userId === currentUser?.id
  ) as Employee;

  const viewData = useTeamView(employees, currentEmployee);

  // Type guards
  const isAdminView = (data: TeamViewData): data is AdminViewData => {
    return "unassignedMembers" in data && "unassignedReportManagers" in data;
  };

  const isReportManagerView = (
    data: TeamViewData
  ): data is ReportManagerViewData => {
    return "myTeamMembers" in data && "availableUnassignedMembers" in data;
  };

  const isMemberView = (data: TeamViewData): data is MemberViewData => {
    return "myManager" in data && "teamMembers" in data;
  };

  const renderContent = () => {
    switch (currentEmployee?.role) {
      case Role.ADMIN:
        return isAdminView(viewData) ? <AdminView data={viewData} /> : null;
      case Role.REPORT_MANAGER:
        return isReportManagerView(viewData) ? (
          <ReportManagerView
            data={viewData}
            currentEmployee={currentEmployee}
          />
        ) : null;
      case Role.MEMBER:
        return isMemberView(viewData) ? (
          <MemberView data={viewData} currentEmployee={currentEmployee} />
        ) : null;
      default:
        return isAdminView(viewData) ? <AdminView data={viewData} /> : null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Users className="" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-gilSemiBold text-gray-900">
                {viewData.title}
              </h1>
              <p className="text-gray-600 font-gilRegular mt-1">
                {viewData.description}
              </p>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default MyTeam;
