import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeaveStatus, Employee } from "@/interfaces";
import { FileText } from "lucide-react";

interface LeaveBalancesProps {
  assignMembers: Employee[];
  setAssignMembers: React.Dispatch<React.SetStateAction<Employee[]>>;
}
const LeaveBalances = ({
  assignMembers,
  setAssignMembers,
}: LeaveBalancesProps) => {
  return (
    <section>
      <header>
        <h1 className="font-gilSemiBold text-lg">Leave Summary</h1>
      </header>
      <main className="mt-5 leave-data">
        <div className="space-y-5">
          {assignMembers && assignMembers.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <img
                  src="/not-found.png"
                  alt="No members found"
                  className="mx-auto mb-4 w-32 h-32 opacity-50"
                />
                <h3 className="font-gilMedium text-lg text-gray-500 mb-2">
                  No Team Members Found
                </h3>
                <p className="text-gray-400">
                  There are no team members to display leave information for.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="item-1"
            >
              {assignMembers.map((leave, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="font-gilMedium text-md">
                    <h2>{leave.user.username}</h2>

                    {/* <div className="text-right">
                      <p className="text-sm text-gray-500">Employee ID</p>
                      <p className="font-gilMedium">
                        {leave.employeId || "Not assigned"}
                      </p>
                    </div> */}
                  </AccordionTrigger>

                  <AccordionContent className="">
                    <div className="mb-6">
                      <h4 className="font-gilSemiBold text-lg text-gray-900 mb-4 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-lg" />
                        Leave Balances
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {leave.totalBalances.map((balance) => (
                          <Card key={balance.id} className="bg-gray-50">
                            <CardContent className="">
                              <div className="flex justify-between items-center">
                                <span className="font-gilMedium text-sm text-gray-700">
                                  {balance.policyName}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-gilSemiBold"
                                >
                                  {balance.balance}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-gilMedium text-lg">Leave Status</h4>
                      <div className="flex">
                        <h1>Approved :</h1>
                        {
                          leave.leaves.filter(
                            (leave) =>
                              leave.leaveStatus === LeaveStatus.Approved
                          ).length
                        }
                      </div>
                      <div className="flex">
                        <h1>Pending :</h1>
                        {
                          leave.leaves.filter(
                            (leave) => leave.leaveStatus === LeaveStatus.Pending
                          ).length
                        }
                      </div>
                      <div className="flex">
                        <h1>Rejected :</h1>
                        {
                          leave.leaves.filter(
                            (leave) =>
                              leave.leaveStatus === LeaveStatus.Rejected
                          ).length
                        }
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </main>
    </section>
  );
};

export default LeaveBalances;
