import APIService from 'frontend/services/api.service';
import { ApiResponse, Task } from 'frontend/types';
import { JsonObject } from 'frontend/types/common-types';
import { PaginationResult } from 'frontend/types/task';

export interface CreateTaskParams {
    title: string;
    description: string;
}

export interface UpdateTaskParams {
    title: string;
    description: string;
}

export default class TaskService extends APIService {
    getTasks = async (
        accountId: string,
        page: number = 1,
        size: number = 10,
    ): Promise<ApiResponse<PaginationResult<Task>>> => {
        const response = await this.apiClient.get<JsonObject>(
            `/accounts/${accountId}/tasks`,
            { params: { page, size } },
        );

        // Map JSON response to Task objects
        const data = response.data;
        const items = (data.items as JsonObject[]).map((item) => new Task(item));
        const paginationParams = data.pagination_params as JsonObject;

        const result: PaginationResult<Task> = {
            items,
            totalCount: data.total_count as number,
            paginationParams: {
                page: paginationParams.page as number,
                size: paginationParams.size as number,
            },
        };

        return new ApiResponse(result);
    };

    createTask = async (
        accountId: string,
        params: CreateTaskParams,
    ): Promise<ApiResponse<Task>> => {
        const response = await this.apiClient.post<JsonObject>(
            `/accounts/${accountId}/tasks`,
            params,
        );
        return new ApiResponse(new Task(response.data));
    };

    updateTask = async (
        accountId: string,
        taskId: string,
        params: UpdateTaskParams,
    ): Promise<ApiResponse<Task>> => {
        const response = await this.apiClient.patch<JsonObject>(
            `/accounts/${accountId}/tasks/${taskId}`,
            params,
        );
        return new ApiResponse(new Task(response.data));
    };

    deleteTask = async (
        accountId: string,
        taskId: string,
    ): Promise<ApiResponse<void>> =>
        this.apiClient.delete(`/accounts/${accountId}/tasks/${taskId}`);
}
