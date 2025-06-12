
import React, { useState } from 'react';
import { Plus, Check, X, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface ProgressManagerProps {
  contestId: string;
  currentProgress: number;
  onProgressUpdate: (progress: number) => void;
}

const ProgressManager: React.FC<ProgressManagerProps> = ({ 
  contestId, 
  currentProgress, 
  onProgressUpdate 
}) => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: '아이디어 기획', completed: true },
    { id: '2', title: '팀원 모집', completed: true },
    { id: '3', title: '기획서 작성', completed: false },
    { id: '4', title: '디자인 시안 제작', completed: false },
    { id: '5', title: '최종 검토', completed: false },
    { id: '6', title: '제출', completed: false }
  ]);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const updateProgress = (updatedTasks: Task[]) => {
    const completedTasks = updatedTasks.filter(task => task.completed).length;
    const progress = Math.round((completedTasks / updatedTasks.length) * 100);
    onProgressUpdate(progress);
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    updateProgress(updatedTasks);
  };

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      updateProgress(updatedTasks);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    updateProgress(updatedTasks);
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

        {/* 새 작업 추가 */}
        {isAddingTask ? (
          <div className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="새 작업 입력..."
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              autoFocus
            />
            <Button size="sm" onClick={addTask}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsAddingTask(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsAddingTask(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            작업 추가
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressManager;
