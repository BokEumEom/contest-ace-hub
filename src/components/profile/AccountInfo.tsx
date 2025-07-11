import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface AccountInfoProps {
  email?: string;
  joinDate: string;
  lastLogin: string;
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  email,
  joinDate,
  lastLogin
}) => {
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-white/20">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl">
            <Shield className="h-5 w-5 text-white" />
          </div>
          계정 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">이메일</Label>
            <p className="text-gray-900 font-medium">{email}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">가입일</Label>
            <p className="text-gray-900 font-medium">{joinDate}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">마지막 로그인</Label>
            <p className="text-gray-900 font-medium">{lastLogin}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">계정 상태</Label>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200">
              활성
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountInfo; 