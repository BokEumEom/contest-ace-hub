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
import { Edit } from 'lucide-react';
import { EditForm } from '@/hooks/useContestDetail';

interface EditContestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: EditForm;
  setEditForm: (form: EditForm) => void;
  onSubmit: () => Promise<void>;
  onOpen: () => Promise<void>;
}

export const EditContestModal: React.FC<EditContestModalProps> = ({
  open,
  onOpenChange,
  editForm,
  setEditForm,
  onSubmit,
  onOpen
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          size="sm" 
          onClick={async () => await onOpen()}
        >
          <Edit className="h-4 w-4 mr-2" />
          정보 수정
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>공모전 정보 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="organization">주최기관</Label>
              <Input
                id="organization"
                value={editForm.organization}
                onChange={(e) => setEditForm({...editForm, organization: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deadline">마감일</Label>
              <Input
                id="deadline"
                type="date"
                value={editForm.deadline}
                onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="category">카테고리</Label>
              <Input
                id="category"
                value={editForm.category}
                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="prize">상금/혜택</Label>
            <Input
              id="prize"
              value={editForm.prize}
              onChange={(e) => setEditForm({...editForm, prize: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={editForm.description}
              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="contestTheme">공모주제</Label>
            <Textarea
              id="contestTheme"
              value={editForm.contestTheme}
              onChange={(e) => setEditForm({...editForm, contestTheme: e.target.value})}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="submissionFormat">제출형식</Label>
              <Input
                id="submissionFormat"
                value={editForm.submissionFormat}
                onChange={(e) => setEditForm({...editForm, submissionFormat: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="submissionMethod">제출방법</Label>
              <Input
                id="submissionMethod"
                value={editForm.submissionMethod}
                onChange={(e) => setEditForm({...editForm, submissionMethod: e.target.value})}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="contestSchedule">공모일정</Label>
            <Textarea
              id="contestSchedule"
              value={editForm.contestSchedule}
              onChange={(e) => setEditForm({...editForm, contestSchedule: e.target.value})}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="prizeDetails">시상내역</Label>
            <Textarea
              id="prizeDetails"
              value={editForm.prizeDetails}
              onChange={(e) => setEditForm({...editForm, prizeDetails: e.target.value})}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="resultAnnouncement">발표일정</Label>
            <Textarea
              id="resultAnnouncement"
              value={editForm.resultAnnouncement}
              onChange={(e) => setEditForm({...editForm, resultAnnouncement: e.target.value})}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="precautions">유의사항</Label>
            <Textarea
              id="precautions"
              value={editForm.precautions}
              onChange={(e) => setEditForm({...editForm, precautions: e.target.value})}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="contestUrl">공식사이트 URL</Label>
            <Input
              id="contestUrl"
              value={editForm.contestUrl}
              onChange={(e) => setEditForm({...editForm, contestUrl: e.target.value})}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={async () => await onSubmit()}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 