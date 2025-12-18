import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

import { useAccountContext } from 'frontend/contexts';
import { TaskService } from 'frontend/services';
import { Task } from 'frontend/types/task';
import TaskList from 'frontend/components/task/TaskList';
import TaskForm from 'frontend/components/task/TaskForm';

const taskService = new TaskService();

const TasksPage: React.FC = () => {
    const { accountDetails: account } = useAccountContext();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });

    const fetchTasks = useCallback(async (page = 1) => {
        if (!account) return;
        setIsLoading(true);
        try {
            const response = await taskService.getTasks(account.id, page, pagination.size);
            if (response.data) {
                setTasks(response.data.items);
                setPagination(prev => ({
                    ...prev,
                    page: response.data!.paginationParams.page,
                    total: response.data!.totalCount
                }));
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch tasks');
        } finally {
            setIsLoading(false);
        }
    }, [account, pagination.size]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleCreateTask = async (task: { title: string; description: string }) => {
        if (!account) return;
        try {
            await taskService.createTask(account.id, task);
            toast.success('Task created successfully');
            setIsFormOpen(false);
            fetchTasks();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create task');
        }
    };

    const handleUpdateTask = async (task: { title: string; description: string }) => {
        if (!account || !editingTask) return;
        try {
            await taskService.updateTask(account.id, editingTask.id, task);
            toast.success('Task updated successfully');
            setIsFormOpen(false);
            setEditingTask(null);
            fetchTasks();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!account) return;
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await taskService.deleteTask(account.id, taskId);
            toast.success('Task deleted successfully');
            fetchTasks();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete task');
        }
    };

    const openCreateForm = () => {
        setEditingTask(null);
        setIsFormOpen(true);
    };

    const openEditForm = (task: Task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
                <button
                    onClick={openCreateForm}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
                >
                    Add Task
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">Loading...</div>
            ) : (
                <TaskList tasks={tasks} onEdit={openEditForm} onDelete={handleDeleteTask} />
            )}

            {isFormOpen && (
                <TaskForm
                    initialData={editingTask || undefined}
                    onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
};

export default TasksPage;
