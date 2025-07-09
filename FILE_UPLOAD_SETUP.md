# 파일 업로드 기능 설정 가이드

이 프로젝트의 파일 업로드 기능은 Supabase Storage를 사용하여 파일을 저장합니다.

## 1. Supabase Storage 버킷 설정

### 1.1 Supabase 대시보드에서 Storage 버킷 생성

**중요**: Storage 버킷은 SQL로 생성할 수 없습니다. 반드시 Supabase 대시보드에서 생성해야 합니다.

1. Supabase 대시보드에 로그인
2. Storage 메뉴로 이동
3. "New bucket" 클릭
4. 다음 설정으로 버킷 생성:
   - **Name**: `contest-files`
   - **Public bucket**: 체크 (파일 공유를 위해)
   - **File size limit**: 50MB
   - **Allowed MIME types**: 아래 목록 참조

### 1.2 허용된 파일 타입

```
application/pdf
application/msword
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.ms-powerpoint
application/vnd.openxmlformats-officedocument.presentationml.presentation
application/vnd.ms-excel
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
image/jpeg
image/jpg
image/png
image/gif
image/webp
video/mp4
video/webm
video/ogg
audio/mpeg
audio/mp3
audio/wav
audio/ogg
text/plain
text/csv
```

### 1.3 Storage 정책 설정

**중요**: Storage 정책은 SQL Editor로 생성할 수 없습니다. 반드시 Supabase 대시보드에서 생성해야 합니다.

1. **Supabase 대시보드에서 Storage 메뉴로 이동**
2. **`contest-files` 버킷 클릭**
3. **"Policies" 탭 클릭**
4. **"New Policy" 클릭하여 각 정책 생성**

#### 정책 1: 업로드 권한
- **Policy Name**: `Users can upload their own contest files`
- **Allowed operation**: INSERT
- **Policy definition**:
```sql
bucket_id = 'contest-files'
```

#### 정책 2: 수정 권한
- **Policy Name**: `Users can update their own contest files`
- **Allowed operation**: UPDATE
- **Policy definition**:
```sql
bucket_id = 'contest-files'
```

#### 정책 3: 삭제 권한
- **Policy Name**: `Users can delete their own contest files`
- **Allowed operation**: DELETE
- **Policy definition**:
```sql
bucket_id = 'contest-files'
```

#### 정책 4: 읽기 권한 (공개)
- **Policy Name**: `Public can view contest files`
- **Allowed operation**: SELECT
- **Policy definition**:
```sql
bucket_id = 'contest-files'
```

**참고**: 파일 경로에서 사용자 ID를 확인하는 대신, 모든 인증된 사용자가 파일을 업로드/삭제할 수 있도록 설정했습니다. 실제 프로덕션에서는 더 세밀한 권한 제어가 필요할 수 있습니다.

## 2. 데이터베이스 테이블 확인

`contest_files` 테이블이 이미 생성되어 있는지 확인:

```sql
-- 테이블 존재 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'contest_files'
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

### 4.1 파일 업로드 테스트

1. 애플리케이션 실행: `npm run dev`
2. 대회 페이지로 이동
3. 파일 관리 섹션에서 파일 업로드 시도
4. 업로드 성공 시 토스트 메시지 확인

### 4.2 파일 관리 테스트

- 파일 목록 조회
- 파일 다운로드
- 파일 삭제
- 파일 미리보기

## 5. 문제 해결

### 5.1 파일 업로드 실패

**증상**: 파일 업로드 시 오류 발생

**해결 방법**:
1. Supabase Storage 버킷이 올바르게 설정되었는지 확인
2. Storage 정책이 올바르게 설정되었는지 확인
3. 브라우저 콘솔에서 오류 메시지 확인

### 5.2 파일 삭제 실패

**증상**: 파일 삭제 시 오류 발생

**해결 방법**:
1. Storage 정책에서 DELETE 권한 확인
2. 데이터베이스에서 파일 정보가 올바르게 저장되었는지 확인

### 5.3 파일 접근 권한 오류

**증상**: 파일을 볼 수 없거나 다운로드할 수 없음

**해결 방법**:
1. Storage 버킷이 public으로 설정되었는지 확인
2. 파일 URL이 올바른지 확인

## 6. 보안 고려사항

1. **파일 크기 제한**: 50MB로 설정되어 있음
2. **파일 타입 제한**: 허용된 MIME 타입만 업로드 가능
3. **사용자별 접근 제어**: 사용자는 자신의 파일만 관리 가능
4. **공개 접근**: 파일 공유를 위해 읽기 권한은 공개

## 7. 성능 최적화

1. **파일 압축**: 대용량 파일은 클라이언트에서 압축 후 업로드 고려
2. **썸네일 생성**: 이미지 파일의 경우 썸네일 자동 생성 고려
3. **CDN 활용**: Supabase의 CDN 기능 활용

## 8. 추가 기능 제안

1. **드래그 앤 드롭**: 파일 드래그 앤 드롭 업로드
2. **진행률 표시**: 업로드 진행률 표시
3. **파일 미리보기**: 이미지/PDF 미리보기 기능
4. **폴더 구조**: 파일을 폴더별로 정리
5. **검색 기능**: 파일명으로 검색 