# 공모전 데이터 공유 서비스 구현

이 문서는 공모전 데이터를 모든 사용자가 공유할 수 있도록 시스템을 변경한 내용을 설명합니다.

## 주요 변경사항

### 1. 데이터베이스 정책 변경

**파일**: `supabase/migrations/20241201000019_enable_public_contests.sql`

- **기존**: 각 사용자는 자신의 공모전만 볼 수 있음
- **변경**: 모든 사용자가 모든 공모전을 볼 수 있음
- **보안**: 작성자만 수정/삭제 가능

```sql
-- 모든 사용자가 모든 공모전을 읽을 수 있음
CREATE POLICY "Users can read all contests" ON contests
  FOR SELECT USING (true);

-- 작성자만 수정/삭제 가능
CREATE POLICY "Users can update their own contests" ON contests
  FOR UPDATE USING (auth.uid() = user_id);
```

### 2. 서비스 레이어 변경

**파일**: `src/services/contestService.ts`

#### 새로운 메서드들:
- `getAllContests()`: 모든 공모전 조회
- `getMyContests()`: 현재 사용자의 공모전만 조회
- `getContestsByCategory()`: 카테고리별 공모전 조회
- `searchContests()`: 공모전 검색
- `getContestsByUser()`: 특정 사용자의 공모전 조회

### 3. 훅 변경

**파일**: `src/hooks/useContests.ts`

#### 반환값:
```typescript
{
  contests,        // 전체 공모전 (모든 사용자 공유)
  myContests,      // 개인 공모전 (현재 사용자만)
  loading,
  user,
  addContest,
  updateContest,
  deleteContest,
  getContestsByCategory,
  searchContests,
  getContestsByUser
}
```

### 4. UI 변경

#### 대시보드 (`src/pages/Index.tsx`)
- 개인 공모전 섹션과 전체 공모전 섹션 분리
- 로그인하지 않은 사용자도 전체 공모전 볼 수 있음

#### 공모전 목록 (`src/pages/Contests.tsx`)
- 탭으로 "전체 공모전"과 "내 공모전" 전환
- 작성자 정보 표시 (전체 공모전에서만)

#### 공모전 카드 (`src/components/ContestCard.tsx`)
- `showOwner` prop 추가로 작성자 정보 표시

## 마이그레이션 실행 방법

### 1. Supabase SQL Editor에서 실행

```sql
-- 마이그레이션 파일 실행
-- supabase/migrations/20241201000019_enable_public_contests.sql
```

### 2. 환경 변수 확인

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 보안 고려사항

### 1. 데이터 접근 권한
- **읽기**: 모든 사용자 (인증 불필요)
- **쓰기**: 인증된 사용자만
- **수정/삭제**: 작성자만

### 2. 개인정보 보호
- 사용자 ID는 일부만 표시 (8자리 + "...")
- 민감한 정보는 공개하지 않음

### 3. 스팸 방지
- 인증된 사용자만 공모전 등록 가능
- 작성자만 수정/삭제 가능

## 기능별 사용법

### 1. 전체 공모전 보기
```typescript
const { contests } = useContests();
// 모든 사용자가 등록한 공모전 목록
```

### 2. 내 공모전만 보기
```typescript
const { myContests } = useContests();
// 현재 로그인한 사용자의 공모전만
```

### 3. 카테고리별 검색
```typescript
const { getContestsByCategory } = useContests();
const itContests = await getContestsByCategory('IT/기술');
```

### 4. 텍스트 검색
```typescript
const { searchContests } = useContests();
const results = await searchContests('디자인');
```

## 테스트 시나리오

### 1. 비로그인 사용자
- [ ] 전체 공모전 목록 볼 수 있음
- [ ] 개인 공모전 섹션은 보이지 않음
- [ ] 공모전 등록 버튼이 로그인 페이지로 연결됨

### 2. 로그인 사용자
- [ ] 전체 공모전과 개인 공모전 모두 볼 수 있음
- [ ] 탭으로 전환 가능
- [ ] 자신의 공모전만 수정/삭제 가능
- [ ] 다른 사용자의 공모전은 읽기만 가능

### 3. 데이터 정합성
- [ ] 새로 등록한 공모전이 전체 목록에 즉시 반영됨
- [ ] 수정/삭제가 실시간으로 반영됨
- [ ] 작성자 정보가 올바르게 표시됨

## 향후 개선사항

1. **작성자 프로필 연동**: 사용자 ID 대신 실제 이름 표시
2. **좋아요/북마크 기능**: 관심 있는 공모전 저장
3. **댓글 시스템**: 공모전에 대한 의견 공유
4. **신고 기능**: 부적절한 공모전 신고
5. **필터링**: 상태, 카테고리, 마감일 등으로 필터링
6. **정렬**: 최신순, 인기순, 마감임박순 등

## 문제 해결

### 1. 마이그레이션 오류
```sql
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'contests';

-- 테이블 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'contests';
```

### 2. 권한 오류
- Supabase 대시보드에서 RLS 정책 확인
- 사용자 인증 상태 확인
- API 키 권한 확인

### 3. 데이터 불일치
- 브라우저 캐시 삭제
- 애플리케이션 새로고침
- 데이터베이스 직접 확인 