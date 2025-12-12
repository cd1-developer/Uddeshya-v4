import { useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/store";
import axios from "axios";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { setEmployee, setEmployeeInfoEndCursor } from "@/libs/dataslice";

function useFetchEmployees() {
  const dispatch = useDispatch();
  const [hasMore, setHasMore] = useState(true);
  const [isPending, startTransition] = useTransition();

  const employeeInfoEndCursors = useSelector(
    (state: RootState) => state.dataSlice.employeeInfoEndCursor
  );

  const fetchEmployees = () => {
    let cursor =
      employeeInfoEndCursors.length > 0 ? employeeInfoEndCursors.at(-1) : 0;

    if (typeof cursor !== "number") return;
    if (!hasMore || isPending) return;

    startTransition(async () => {
      try {
        const res = await axios.get(
          `/api/Employee/get-employees?cursor=${cursor}&limit=9`
        );

        const { success, data, nextCursor, hasMore: more, message } = res.data;

        if (!success) {
          ErrorToast(message || "Failed to fetch members");
          return;
        }

        // Store next cursor no matter what
        dispatch(setEmployeeInfoEndCursor(nextCursor));

        // Backend tells whether more pages are available
        setHasMore(more);

        // Append new employees
        dispatch(setEmployee(data));
      } catch (err) {
        ErrorToast("Failed to load members");
      }
    });
  };

  return { fetchEmployees, isPending, hasMore };
}

export default useFetchEmployees;
