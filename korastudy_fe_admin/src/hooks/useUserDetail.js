import { useState, useEffect, useCallback } from "react";
import userApi from "../api/userApi";

export const useUserDetail = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getUserDetail(userId);
      setUser(response.data);
    } catch (err) {
      console.error("Lỗi khi tải thông tin người dùng:", err);
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tải thông tin người dùng"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
};
