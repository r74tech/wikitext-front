import { useMemo } from "react";
import { API_BASE_URL } from "../config/api";
import { ApiClient } from "../infra/apiClient";

export function useApiClient() {
    return useMemo(() => new ApiClient(API_BASE_URL), []);
}
