# MIME 타입 오류 해결 가이드

## 문제 상황

파일 업로드 시 다음과 같은 오류가 발생하는 경우:

```
Error uploading file to storage: 
{statusCode: '400', error: 'InvalidRequest', message: 'mime type application/pdf is not supported'}
```

이는 Supabase Storage 버킷 설정에서 해당 MIME 타입이 허용되지 않았기 때문입니다.

## 해결 방법

### 1. Supabase 대시보드에서 Storage 버킷 설정 확인

1. **Supabase 대시보드 로그인**
   - https://supabase.com/dashboard 에서 프로젝트 선택

2. **Storage 메뉴로 이동**
   - 왼쪽 사이드바에서 "Storage" 클릭

3. **contest-files 버킷 선택**
   - Storage 버킷 목록에서 "contest-files" 클릭

4. **Settings 탭 클릭**
   - 버킷 상세 페이지에서 "Settings" 탭 선택

5. **Allowed MIME types 확인 및 수정**
   - "Allowed MIME types" 섹션에서 다음 MIME 타입들이 모두 포함되어 있는지 확인:

### 2. 필요한 MIME 타입 목록

다음 MIME 타입들을 모두 추가해야 합니다:

#### 문서 파일
```
application/pdf
application/msword
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.ms-powerpoint
application/vnd.openxmlformats-officedocument.presentationml.presentation
application/vnd.ms-excel
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
application/vnd.oasis.opendocument.text
application/vnd.oasis.opendocument.spreadsheet
application/vnd.oasis.opendocument.presentation
text/plain
text/csv
text/rtf
```

#### 이미지 파일
```
image/jpeg
image/jpg
image/png
image/gif
image/webp
image/bmp
image/svg+xml
image/tiff
```

#### 비디오 파일
```
video/mp4
video/webm
video/ogg
video/avi
video/mov
video/wmv
video/flv
video/mkv
video/m4v
video/3gp
```

#### 오디오 파일
```
audio/mpeg
audio/mp3
audio/wav
audio/ogg
audio/aac
audio/flac
audio/m4a
audio/wma
audio/opus
```

#### 압축 파일
```
application/zip
application/x-rar-compressed
application/x-7z-compressed
application/x-tar
application/gzip
application/x-bzip2
```

#### 코드 파일
```
text/javascript
text/typescript
text/html
text/css
application/json
application/xml
text/x-python
text/x-java-source
text/x-c++src
text/x-php
```

### 3. MIME 타입 추가 방법

1. **Supabase 대시보드에서 Storage > contest-files > Settings로 이동**

2. **"Allowed MIME types" 섹션에서 "Edit" 클릭**

3. **각 MIME 타입을 한 줄씩 추가**
   - 예: `application/pdf` 입력 후 Enter
   - 예: `application/msword` 입력 후 Enter
   - 모든 필요한 MIME 타입을 위의 목록에서 복사하여 추가

4. **"Save" 클릭하여 변경사항 저장**

### 4. 주의사항

- **대소문자 구분**: MIME 타입은 정확히 일치해야 합니다
  - ✅ `application/pdf` (올바름)
  - ❌ `application/PDF` (잘못됨)
  - ❌ `APPLICATION/PDF` (잘못됨)

- **공백 주의**: MIME 타입 앞뒤에 공백이 없어야 합니다

- **쉼표 구분**: 여러 MIME 타입은 쉼표로 구분하거나 각각 새 줄에 입력

### 5. 테스트

설정 변경 후 다음을 테스트해보세요:

1. **PDF 파일 업로드 테스트**
2. **Word 문서 업로드 테스트**
3. **Excel 파일 업로드 테스트**
4. **PowerPoint 파일 업로드 테스트**

### 6. 여전히 문제가 발생하는 경우

1. **브라우저 캐시 삭제**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

2. **Supabase 프로젝트 재시작**
   - Supabase 대시보드에서 프로젝트 설정 > General > Restart project

3. **Storage 정책 확인**
   - Storage > contest-files > Policies에서 모든 정책이 올바르게 설정되어 있는지 확인

4. **로그 확인**
   - 브라우저 개발자 도구 > Console에서 오류 메시지 확인
   - Supabase 대시보드 > Logs에서 서버 로그 확인

### 7. 추가 지원

문제가 지속되는 경우:

1. **Supabase 커뮤니티 포럼**에서 도움 요청
2. **프로젝트 관리자**에게 문의
3. **Supabase 지원팀**에 문의

## 예방 조치

향후 유사한 문제를 방지하기 위해:

1. **정기적인 MIME 타입 검토**
2. **새로운 파일 형식 지원 시 즉시 MIME 타입 추가**
3. **파일 업로드 테스트 자동화 고려** 