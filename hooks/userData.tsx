import { useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import { removeState, setUserInfo } from "@/libs/dataslice";
import { User } from "@/interfaces";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";

const useCurrentUser = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      //If status is unauthenticated then redirect the user to "/" page reset the redux state
      if (status === "unauthenticated") {
        dispatch(removeState());
        navigate.push("/");
      }
      if (status === "authenticated" && session?.user?.id) {
        try {
          const response = await axios.get(
            `/api/user/get-user?id=${session?.user?.id}`
          );

          const { success, message, user } = response.data;

          if (success && user) {
            setUser(user);
            dispatch(setUserInfo(user));
          } else {
            setError(message || "Failed to fetch user data");
          }
        } catch (error) {
          setError("An error occured while fetching user data");
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [status, session]);

  return {
    user,
    error,
    isAuthenticated: status === "authenticated",
    sessionStatus: status,
  };
};

export default useCurrentUser;
