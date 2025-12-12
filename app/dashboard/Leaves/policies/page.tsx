"use client";
import POLICIES from "@/constant/Policies";
import { AccuralFrequency } from "@/interfaces";
import {
  BookOpenCheck,
  BriefcaseBusiness,
  Search,
  Smile,
  Trophy,
} from "lucide-react";
export default function LeavePoliciesPage() {
  const getPolicyIcon = (policyName: string) => {
    if (policyName.includes("Earned")) return <Trophy size={19} />;
    if (policyName.includes("Casual")) return <Smile size={19} />;
    if (policyName.includes("Exam")) return <BookOpenCheck size={19} />;
    if (policyName.includes("Un-Paid")) return <BriefcaseBusiness size={19} />;
    return <Smile size={19} />;
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "Monthly":
        return "bg-sky-100 text-sky-800";
      case "Quarterly":
        return "bg-zinc-200 text-zinc-800";
      default:
        return "bg-violet-100 text-violet-800";
    }
  };

  return (
    <div className=" bg-gray-50">
      {/* Header */}
      <div className="mb-8 header">
        <h1 className="font-gilSemiBold text-xl md:text-2xl mb-1">
          Leave Policies
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm font-gilRegular">
          Manage and review your organization's leave policies and accrual
          settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md mb-6">
            <div className="flex justify-between items-center border-b p-4 mb-6">
              <h2 className="text-lg font-gilMedium text-gray-800">
                All Policies
              </h2>
              <span className="bg-sky-100 text-sky-800 text-xs font-gilMedium px-3 rounded-full">
                {POLICIES.length} total
              </span>
            </div>

            {/* Policy List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto px-6 pb-5">
              {POLICIES.map((policy) => (
                <div key={policy.id}>
                  <div className="flex">
                    <div className="text-2xl mt-1 mr-4">
                      {getPolicyIcon(policy.policyName)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-gilSemiBold text-gray-900">
                          {policy.policyName}
                        </h3>
                        <span
                          className={`text-xs font-gilMedium px-2.5 py-0.5 rounded-full ${getFrequencyColor(
                            policy.accuralFrequency
                          )}`}
                        >
                          {policy.accuralFrequency}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs font-gilRegular">
                        {policy.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-xs font-gilMedium text-gray-900 mr-1">
                            {policy.accural}
                          </span>
                          <span className="text-xs font-gilMedium text-gray-500">
                            days
                          </span>
                        </div>

                        <span
                        // className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        //   getAccuralStatus(policy.accural).color
                        // }`}
                        >
                          {/* {getAccuralStatus(policy.accural).text} */}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {POLICIES.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">
                    <img src="/not-found.png" alt="not-found" />
                  </div>
                  <p className="text-gray-500 font-gilRegular">
                    No policies found matching your search
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          {/* <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Policy Summary</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-sky-700">
                  {POLICIES.filter((p) => p.accural > 0).length}
                </div>
                <div className="text-sm text-sky-600">Active Accrual</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {
                    POLICIES.filter(
                      (p) => p.accuralFrequency === AccuralFrequency.Monthly
                    ).length
                  }
                </div>
                <div className="text-sm text-green-600">Monthly</div>
              </div>
            </div>
          </div> */}
        </div>

        <div className="lg:col-span-2"></div>
      </div>
    </div>
  );
}

// "use client";
// import { useState } from 'react';
// import POLICIES from "@/constant/Policies";

// export default function LeavePoliciesPage() {
//   const [activePolicy, setActivePolicy] = useState(POLICIES[0]);
//   const [searchTerm, setSearchTerm] = useState('');

//   // Filter policies based on search
//   const filteredPolicies = POLICIES.filter(policy =>
//     policy.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     policy.description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Get policy icon based on type
//   const getPolicyIcon = (policyName) => {
//     if (policyName.includes('Earned')) return '🏆';
//     if (policyName.includes('Casual')) return '😊';
//     if (policyName.includes('Exam')) return '📚';
//     if (policyName.includes('Un-Paid')) return '💼';
//     return '📋';
//   };

//   // Get frequency color
//   const getFrequencyColor = (frequency) => {
//     switch(frequency) {
//       case 'Monthly': return 'bg-blue-100 text-blue-800';
//       case 'Quarterly': return 'bg-purple-100 text-purple-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Get accural status
//   const getAccuralStatus = (accural) => {
//     if (accural > 0) return { text: 'Active', color: 'bg-green-100 text-green-800' };
//     return { text: 'No Accural', color: 'bg-gray-100 text-gray-800' };
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Policies</h1>
//         <p className="text-gray-600">Manage and review your organization's leave policies and accrual settings</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Left Column - Policy List */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-semibold text-gray-800">All Policies</h2>
//               <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
//                 {POLICIES.length} total
//               </span>
//             </div>

//             {/* Search */}
//             <div className="mb-6">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <input
//                   type="text"
//                   className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                   placeholder="Search policies..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Policy List */}
//             <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
//               {filteredPolicies.map((policy) => (
//                 <div
//                   key={policy.id}
//                   className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${activePolicy.id === policy.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
//                   onClick={() => setActivePolicy(policy)}
//                 >
//                   <div className="flex items-start">
//                     <div className="text-2xl mr-4">{getPolicyIcon(policy.policyName)}</div>
//                     <div className="flex-1">
//                       <div className="flex justify-between items-start mb-1">
//                         <h3 className="font-semibold text-gray-900">{policy.policyName}</h3>
//                         <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getFrequencyColor(policy.accuralFrequency)}`}>
//                           {policy.accuralFrequency}
//                         </span>
//                       </div>
//                       <p className="text-gray-600 text-sm mb-2 line-clamp-2">{policy.description}</p>
//                       <div className="flex justify-between items-center">
//                         <div className="flex items-center">
//                           <span className="text-lg font-bold text-gray-900 mr-1">{policy.accural}</span>
//                           <span className="text-sm text-gray-500">days</span>
//                         </div>
//                         <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getAccuralStatus(policy.accural).color}`}>
//                           {getAccuralStatus(policy.accural).text}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               {filteredPolicies.length === 0 && (
//                 <div className="text-center py-8">
//                   <div className="text-5xl mb-4">🔍</div>
//                   <p className="text-gray-500">No policies found matching your search</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Summary Stats */}
//           <div className="bg-white rounded-xl shadow-md p-6">
//             <h3 className="font-semibold text-gray-800 mb-4">Policy Summary</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-blue-50 p-4 rounded-lg">
//                 <div className="text-2xl font-bold text-blue-700">{POLICIES.filter(p => p.accural > 0).length}</div>
//                 <div className="text-sm text-blue-600">Active Accrual</div>
//               </div>
//               <div className="bg-green-50 p-4 rounded-lg">
//                 <div className="text-2xl font-bold text-green-700">{POLICIES.filter(p => p.accuralFrequency === 'Monthly').length}</div>
//                 <div className="text-sm text-green-600">Monthly</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Policy Details */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-xl shadow-md p-6 h-full">
//             <div className="flex items-start justify-between mb-8">
//               <div>
//                 <div className="flex items-center mb-2">
//                   <span className="text-3xl mr-3">{getPolicyIcon(activePolicy.policyName)}</span>
//                   <h2 className="text-2xl font-bold text-gray-900">{activePolicy.policyName}</h2>
//                 </div>
//                 <p className="text-gray-600">{activePolicy.description}</p>
//               </div>
//               <div className={`text-sm font-medium px-3 py-1 rounded-full ${getAccuralStatus(activePolicy.accural).color}`}>
//                 {getAccuralStatus(activePolicy.accural).text}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//               {/* Accural Details */}
//               <div className="bg-gray-50 p-6 rounded-xl">
//                 <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
//                   <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
//                   </svg>
//                   Accrual Details
//                 </h3>
//                 <div className="flex items-center mb-2">
//                   <div className="text-4xl font-bold text-gray-900 mr-3">{activePolicy.accural}</div>
//                   <div className="text-gray-600">
//                     <div className="font-medium">Days per period</div>
//                     <div className="text-sm">Accrued {activePolicy.accuralFrequency}</div>
//                   </div>
//                 </div>
//                 <div className="mt-4">
//                   <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                     <div
//                       className="h-full bg-indigo-600 rounded-full"
//                       style={{ width: `${Math.min(activePolicy.accural * 10, 100)}%` }}
//                     ></div>
//                   </div>
//                   <div className="flex justify-between text-xs text-gray-500 mt-1">
//                     <span>0 days</span>
//                     <span>Max {activePolicy.accural * 4} days/year</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Frequency Details */}
//               <div className="bg-gray-50 p-6 rounded-xl">
//                 <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
//                   <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
//                   </svg>
//                   Frequency & Period
//                 </h3>
//                 <div className="flex items-center mb-4">
//                   <div className={`text-lg font-medium px-3 py-1.5 rounded-lg ${getFrequencyColor(activePolicy.accuralFrequency)}`}>
//                     {activePolicy.accuralFrequency}
//                   </div>
//                   <div className="ml-4">
//                     <div className="font-medium text-gray-900">Accrual Period</div>
//                     <div className="text-gray-600 text-sm">Policy resets each period</div>
//                   </div>
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Employees accrue <span className="font-semibold">{activePolicy.accural} days</span> every {activePolicy.accuralFrequency.toLowerCase()} period according to this policy.
//                 </div>
//               </div>
//             </div>

//             {/* Policy Notes */}
//             <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
//               <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
//                 <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                 </svg>
//                 Policy Notes
//               </h3>
//               <p className="text-blue-700">
//                 {activePolicy.accural > 0
//                   ? `This policy allows employees to accrue time off based on their tenure and employment status. Accrued leave can be carried over up to a maximum limit.`
//                   : `This policy provides leave without accrual. Eligibility and approval are subject to manager discretion and business needs.`
//                 }
//               </p>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
//               <button className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
//                 <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                 </svg>
//                 Edit Policy
//               </button>
//               <button className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center">
//                 <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                 </svg>
//                 View Usage
//               </button>
//               <button className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center">
//                 <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
//                 </svg>
//                 Export Data
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
