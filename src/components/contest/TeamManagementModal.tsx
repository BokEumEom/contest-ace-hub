import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Users, Plus, Trash2 } from 'lucide-react';
import { TeamMember } from '@/hooks/useContestDetail';

interface TeamManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers: TeamMember[];
  newMember: { name: string; role: string };
  setNewMember: (member: { name: string; role: string }) => void;
  onAddMember: () => void;
  onRemoveMember: (id: string) => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  open,
  onOpenChange,
  teamMembers,
  newMember,
  setNewMember,
  onAddMember,
  onRemoveMember
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Users className="h-4 w-4 mr-2" />
          팀원 관리
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>팀원 관리</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>현재 팀원 ({teamMembers.length}명)</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.role}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  등록된 팀원이 없습니다.
                </p>
              )}
            </div>
          </div>
          <div className="border-t pt-4">
            <Label>새 팀원 추가</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                placeholder="이름"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              />
              <Input
                placeholder="역할"
                value={newMember.role}
                onChange={(e) => setNewMember({...newMember, role: e.target.value})}
              />
            </div>
            <Button 
              onClick={onAddMember} 
              className="w-full mt-2"
              disabled={!newMember.name || !newMember.role}
            >
              <Plus className="h-4 w-4 mr-2" />
              팀원 추가
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 