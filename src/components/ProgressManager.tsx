
import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Task } from '@/types/contest';

interface ProgressManagerProps {
  contestId: string;
  currentProgress: number;
  tasks: Task[];
  onTasksUpdate: (tasks: Task[], progress: number) => void;
}

const defaultTasks: Task[] = [
  { id: '1', title: '아이디어 기획', completed: true },
  { id: '2', title: '팀원 모집', completed: true },
  { id: '3', title: '기획서 작성', completed: false },
  { id: '4', title: '디자인 시안 제작', completed: false },
  { id: '5', title: '최종 검토', completed: false },
  { id: '6', title: '제출', completed: false }
];

const ProgressManager: React.FC<ProgressManagerProps> = ({ 
  contestId, 
  currentProgress, 
  tasks: propTasks,
  onTasksUpdate
}) => {
  // tasks 상태를 prop에서 받아오고, 없으면 defaultTasks 사용
  const [tasks, setTasks] = useState<Task[]>(propTasks && propTasks.length > 0 ? propTasks : defaultTasks);

  useEffect(() => {
    // propTasks가 바뀌면 동기화
    if (propTasks && propTasks.length > 0) {
      setTasks(propTasks);
    }
  }, [propTasks]);

  const updateProgressAndSave = (updatedTasks: Task[]) => {
    const completedTasks = updatedTasks.filter(task => task.completed).length;
    const progress = Math.round((completedTasks / updatedTasks.length) * 100);
    setTasks(updatedTasks);
    onTasksUpdate(updatedTasks, progress);
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    updateProgressAndSave(updatedTasks);
  };

  const addTask = (title: string) => {
    if (title.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: title.trim(),
        completed: false
      };
      const updatedTasks = [...tasks, newTask];
      updateProgressAndSave(updatedTasks);
    }
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    updateProgressAndSave(updatedTasks);
  };

  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>진행 상황</span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount}/{tasks.length} 완료
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 진행률 바 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>전체 진행률</span>
            <span className="font-medium">{currentProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-contest-gradient h-3 rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        {/* 작업 목록 */}
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTask(task.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* 새 작업 추가 (간단 구현) */}
        {/* 필요시 구현 가능 */}
      </CardContent>
    </Card>
  );
};

export default ProgressManager;
