import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Schedule } from '@/services/contestDetailService';

interface ScheduleManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedules: Schedule[];
  newSchedule: { title: string; date: string; description: string };
  setNewSchedule: (schedule: { title: string; date: string; description: string }) => void;
  onAddSchedule: () => void;
  onRemoveSchedule: (id: string) => void;
}

export const ScheduleManagementModal: React.FC<ScheduleManagementModalProps> = ({
  open,
  onOpenChange,
  schedules,
  newSchedule,
  setNewSchedule,
  onAddSchedule,
  onRemoveSchedule
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>일정 관리</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>등록된 일정 ({schedules.length}개)</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{schedule.title}</div>
                      <div className="text-sm text-muted-foreground">{schedule.date}</div>
                      {schedule.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {schedule.description}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveSchedule(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {schedules.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  등록된 일정이 없습니다.
                </p>
              )}
            </div>
          </div>
          <div className="border-t pt-4">
            <Label>새 일정 추가</Label>
            <div className="space-y-2 mt-2">
              <Input
                placeholder="일정 제목"
                value={newSchedule.title}
                onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
              />
              <Input
                type="date"
                value={newSchedule.date}
                onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
              />
              <Textarea
                placeholder="일정 설명 (선택사항)"
                value={newSchedule.description}
                onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                rows={2}
              />
            </div>
            <Button 
              onClick={onAddSchedule} 
              className="w-full mt-2"
              disabled={!newSchedule.title || !newSchedule.date}
            >
              <Plus className="h-4 w-4 mr-2" />
              일정 추가
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 