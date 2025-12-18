import React from 'react';
import { Task } from 'frontend/types/task';

interface ITaskListProps {
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

const TaskList: React.FC<ITaskListProps> = ({ tasks, onEdit, onDelete }) => {
    if (tasks.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded border border-gray-200 text-gray-500">
                No tasks found. Create one to get started!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
                <div key={task.id} className="bg-white p-4 rounded shadow border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-gray-800 truncate" title={task.title}>{task.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${task.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {task.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm h-12">{task.description}</p>
                    <div className="flex justify-end space-x-2 border-t pt-3 mt-2">
                        <button
                            onClick={() => onEdit(task)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskList;
