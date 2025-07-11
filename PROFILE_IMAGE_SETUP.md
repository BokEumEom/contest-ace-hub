# 프로필 이미지 업로드 기능 설정 가이드

이 프로젝트의 프로필 이미지 업로드 기능은 Supabase Storage를 사용하여 이미지를 저장합니다.

## 1. Supabase Storage 버킷 설정

### 1.1 Supabase 대시보드에서 Storage 버킷 생성

**중요**: Storage 버킷은 SQL로 생성할 수 없습니다. 반드시 Supabase 대시보드에서 생성해야 합니다.

1. Supabase 대시보드에 로그인
2. Storage 메뉴로 이동
3. "New bucket" 클릭
4. 다음 설정으로 버킷 생성:
   - **Name**: `profile-images`
   - **Public bucket**: 체크 (프로필 이미지 공개 접근을 위해)
   - **File size limit**: 5MB
   - **Allowed MIME types**: 아래 목록 참조

### 1.2 허용된 파일 타입

```
image/jpeg
image/jpg
image/png
image/gif
image/webp
```

### 1.3 Storage 정책 설정

**중요**: Storage 정책은 SQL Editor로 생성할 수 없습니다. 반드시 Supabase 대시보드에서 생성해야 합니다.

1. **Supabase 대시보드에서 Storage 메뉴로 이동**
2. **`profile-images` 버킷 클릭**
3. **"Policies" 탭 클릭**
4. **"New Policy" 클릭하여 각 정책 생성**

#### 정책 1: 업로드 권한
- **Policy Name**: `Users can upload their own profile images`
- **Allowed operation**: INSERT
- **Policy definition**:
```sql
bucket_id = 'profile-images'
```

#### 정책 2: 수정 권한
- **Policy Name**: `Users can update their own profile images`
- **Allowed operation**: UPDATE
- **Policy definition**:
```sql
bucket_id = 'profile-images'
```

#### 정책 3: 삭제 권한
- **Policy Name**: `Users can delete their own profile images`
- **Allowed operation**: DELETE
- **Policy definition**:
```sql
bucket_id = 'profile-images'
```

#### 정책 4: 읽기 권한 (공개)
- **Policy Name**: `Public can view profile images`
- **Allowed operation**: SELECT
- **Policy definition**:
```sql
bucket_id = 'profile-images'
```

## 2. 데이터베이스 테이블 확인

`user_profiles` 테이블이 이미 생성되어 있는지 확인:

```sql
-- 테이블 존재 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
);
```

테이블이 없다면 마이그레이션 파일을 실행하세요.

## 3. 환경 변수 설정

`.env` 파일에 Supabase 설정이 되어 있는지 확인:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 4. 기능 테스트

### 4.1 이미지 업로드 테스트

1. 애플리케이션 실행: `npm run dev`
2. 프로필 페이지로 이동
3. 아바타 옆의 카메라 버튼 클릭
4. "새 이미지 선택" 버튼 클릭
5. 이미지 파일 선택
6. 업로드 성공 시 토스트 메시지 확인

### 4.2 이미지 관리 테스트

- 이미지 업로드
- 이미지 삭제
- 이미지 미리보기
- 이미지 리사이징 (자동)

## 5. 문제 해결

### 5.1 이미지 업로드 실패

**증상**: 이미지 업로드 시 오류 발생

**해결 방법**:
1. Supabase Storage 버킷이 올바르게 설정되었는지 확인
2. Storage 정책이 올바르게 설정되었는지 확인
3. 브라우저 콘솔에서 오류 메시지 확인
4. 파일 크기가 5MB 이하인지 확인
5. 지원되는 이미지 형식인지 확인

### 5.2 이미지 삭제 실패

**증상**: 이미지 삭제 시 오류 발생

**해결 방법**:
1. Storage 정책에서 DELETE 권한 확인
2. 데이터베이스에서 프로필 정보가 올바르게 저장되었는지 확인

### 5.3 이미지 접근 권한 오류

**증상**: 이미지를 볼 수 없거나 다운로드할 수 없음

**해결 방법**:
1. Storage 버킷이 public으로 설정되었는지 확인
2. 이미지 URL이 올바른지 확인

## 6. 보안 고려사항

1. **파일 크기 제한**: 5MB로 설정되어 있음
2. **파일 타입 제한**: 이미지 파일만 업로드 가능
3. **사용자별 접근 제어**: 사용자는 자신의 이미지만 관리 가능
4. **공개 접근**: 프로필 이미지 공유를 위해 읽기 권한은 공개
5. **자동 리사이징**: 클라이언트 사이드에서 이미지 크기 자동 조정

## 7. 성능 최적화

1. **이미지 리사이징**: 클라이언트에서 400x400으로 자동 리사이징
2. **캐시 활용**: Supabase의 CDN 기능 활용
3. **품질 최적화**: JPEG 품질 80%로 압축

## 8. 추가 기능

1. **드래그 앤 드롭**: 이미지 드래그 앤 드롭 업로드
2. **진행률 표시**: 업로드 진행률 표시
3. **이미지 편집**: 기본적인 이미지 편집 기능
4. **썸네일 생성**: 다양한 크기의 썸네일 자동 생성
5. **이미지 압축**: 서버 사이드 이미지 압축

## 9. 사용법

### 9.1 이미지 업로드

1. 프로필 페이지에서 아바타 옆의 카메라 버튼 클릭
2. "새 이미지 선택" 버튼 클릭
3. 이미지 파일 선택
4. 자동으로 리사이징되고 업로드됨

### 9.2 이미지 삭제

1. 프로필 페이지에서 아바타 옆의 카메라 버튼 클릭
2. "현재 이미지 삭제" 버튼 클릭
3. 확인 후 이미지 삭제됨

### 9.3 지원되는 이미지 형식

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### 9.4 파일 크기 제한

- 최대 파일 크기: 5MB
- 자동 리사이징: 400x400 픽셀
- 품질: 80% 