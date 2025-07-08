import { apiKeyService } from '@/lib/supabase';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  static async saveApiKey(apiKey: string): Promise<void> {
    await apiKeyService.saveApiKey('gemini', apiKey);
  }

  static async getApiKey(): Promise<string | null> {
    return await apiKeyService.getApiKey('gemini');
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing Gemini API key');
      const response = await fetch(`${GEMINI_API_BASE_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello'
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          }
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing Gemini API key:', error);
      return false;
    }
  }

  async generateIdeas(
    contestTitle: string, 
    contestDescription: string,
    contestTheme?: string,
    submissionFormat?: string,
    prizeDetails?: string,
    precautions?: string
  ): Promise<string[]> {
    const prompt = `
당신은 공모전 아이디어 브레인스토밍 전문가입니다. 주어진 공모전 정보를 바탕으로 창의적이고 실현 가능한 아이디어를 생성해주세요.

## 공모전 정보
제목: ${contestTitle}
설명: ${contestDescription}
${contestTheme ? `공모 주제: ${contestTheme}` : ''}
${submissionFormat ? `출품 형식: ${submissionFormat}` : ''}
${prizeDetails ? `상금 상세: ${prizeDetails}` : ''}
${precautions ? `주의사항: ${precautions}` : ''}

## 아이디어 생성 가이드라인

### 1. 아이디어 품질 기준
- **혁신성**: 기존과 차별화된 새로운 접근법
- **실현 가능성**: 현재 기술과 자원으로 구현 가능
- **시장성**: 실제 수요와 시장 기회 존재
- **확장성**: 성공 시 추가 발전 가능성
- **지속가능성**: 환경적, 사회적 가치 고려

### 2. 아이디어 구성 요소
각 아이디어는 다음 요소를 포함해야 합니다:
- **핵심 개념**: 아이디어의 핵심 가치 제안
- **차별화 요소**: 경쟁사 대비 우위
- **기술적 접근**: 구현 방법과 기술적 고려사항
- **시장 기회**: 타겟 사용자와 시장 잠재력
- **실행 전략**: 구체적인 실행 단계

### 3. 카테고리별 접근법
공모전 주제에 따라 다음 관점을 고려하세요:
- **IT/기술**: 최신 기술 트렌드, 사용자 경험, 확장성
- **디자인**: 시각적 임팩트, 사용성, 브랜드 일관성
- **창업/비즈니스**: 수익 모델, 시장 검증, 성장 전략
- **마케팅**: 타겟 고객, 메시지 전달, 성과 측정
- **사회문제**: 사회적 임팩트, 지속가능성, 확산 가능성

### 4. 아이디어 다양성
다음과 같은 다양한 접근법을 포함하세요:
- **기술 중심**: AI, IoT, 빅데이터 등 최신 기술 활용
- **사용자 중심**: 사용자 경험과 니즈에 집중
- **비즈니스 중심**: 수익성과 시장 기회에 집중
- **사회적 가치**: 환경, 교육, 건강 등 사회 문제 해결
- **융합적 접근**: 여러 분야의 아이디어를 결합

## 응답 형식
다음 형식으로 5개의 아이디어를 제안해주세요:

1. [아이디어 제목] - [핵심 개념과 차별화 요소]
2. [아이디어 제목] - [핵심 개념과 차별화 요소]
3. [아이디어 제목] - [핵심 개념과 차별화 요소]
4. [아이디어 제목] - [핵심 개념과 차별화 요소]
5. [아이디어 제목] - [핵심 개념과 차별화 요소]

각 아이디어는 구체적이고 실행 가능하며, 공모전 주제와 밀접한 관련이 있어야 합니다.
`;

    try {
      const response = await fetch(`${GEMINI_API_BASE_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topP: 0.8,
            maxOutputTokens: 1000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text || '';
      
      console.log('Raw AI response:', text);
      
      // 아이디어를 배열로 분리 - 더 유연한 필터링
      const ideas = text.split('\n')
        .map(line => line.trim())
        .filter(line => {
          // 빈 줄 제거
          if (!line) return false;
          
          // 아이디어 관련 키워드가 포함된 줄만 포함
          const ideaKeywords = ['아이디어', 'idea', '1.', '2.', '3.', '4.', '5.'];
          return ideaKeywords.some(keyword => 
            line.toLowerCase().includes(keyword.toLowerCase())
          );
        })
        .map(line => {
          // 번호나 "아이디어" 접두사 제거
          return line.replace(/^(아이디어\s*\d*[.:]?\s*|\d+[.:]\s*)/, '').trim();
        })
        .filter(line => line.length > 10); // 너무 짧은 줄 제거

      console.log('Processed ideas:', ideas);
      return ideas;
    } catch (error) {
      console.error('Gemini API 호출 실패:', error);
      throw error;
    }
  }

  // AI를 활용한 URL에서 공모전 정보 추출
  async extractContestInfoFromUrl(url: string, pageContent: string): Promise<{
    title: string;
    organization: string;
    deadline: string;
    category: string;
    prize: string;
    description: string;
    contestUrl: string;
    contestTheme: string;
    submissionFormat: string;
    contestSchedule: string;
    submissionMethod: string;
    prizeDetails: string;
    resultAnnouncement: string;
    precautions: string;
  }> {
    const prompt = `
다음은 공모전 웹페이지의 내용입니다. 이 내용에서 공모전 정보를 정확히 추출해주세요.

특히 출품 형식(submissionFormat)은 파일 형식, 크기, 해상도, 용량 제한, 페이지 수 등을 구체적으로 포함해야 합니다.

웹페이지 URL: ${url}
페이지 내용:
${pageContent.substring(0, 3000)} // 내용이 너무 길면 앞부분만 사용

다음 JSON 형식으로 정확히 추출해주세요:
{
  "title": "공모전 제목",
  "organization": "주최/주관 기관명",
  "deadline": "YYYY-MM-DD 형식의 마감일",
  "category": "IT/기술, 디자인, 창업/비즈니스, 마케팅, 기타 중 하나",
  "prize": "상금 정보 (예: 대상 500만원, 우승 300만원)",
  "description": "공모전 설명 (100자 이내)",
  "contestUrl": "${url}",
  "contestTheme": "공모전 주제/테마",
  "submissionFormat": "제출 형식 (파일 형식, 크기, 해상도, 용량 제한, 페이지 수 등을 구체적으로 포함. 예: 이미지 형식: JPEG, JPG, PNG (300dpi 이상, 3:2 또는 2:3 비율, 30MB 이하), PDF: A4 10페이지 이하, 동영상: MP4, 3분 이하, 100MB 이하)",
  "contestSchedule": "공모전 일정",
  "submissionMethod": "제출 방법",
  "prizeDetails": "상금 상세 정보",
  "resultAnnouncement": "결과 발표일",
  "precautions": "주의사항"
}

만약 정보를 찾을 수 없다면 해당 필드는 빈 문자열로 설정해주세요.
JSON 형식으로만 응답해주세요.
`;

    try {
      const response = await fetch(`${GEMINI_API_BASE_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1, // 정확한 정보 추출을 위해 낮은 temperature 사용
            topP: 0.8,
            maxOutputTokens: 1000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text || '';
      
      // JSON 응답 파싱
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const contestInfo = JSON.parse(jsonMatch[0]);
          return {
            title: contestInfo.title || '크롤링된 공모전',
            organization: contestInfo.organization || '미상',
            deadline: contestInfo.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: contestInfo.category || '기타',
            prize: contestInfo.prize || '상금 미공개',
            description: contestInfo.description || '공모전 정보를 확인해주세요.',
            contestUrl: contestInfo.contestUrl || url,
            contestTheme: contestInfo.contestTheme || '',
            submissionFormat: contestInfo.submissionFormat || '',
            contestSchedule: contestInfo.contestSchedule || '',
            submissionMethod: contestInfo.submissionMethod || '',
            prizeDetails: contestInfo.prizeDetails || contestInfo.prize || '',
            resultAnnouncement: contestInfo.resultAnnouncement || '',
            precautions: contestInfo.precautions || ''
          };
        }
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
      }

      // JSON 파싱 실패 시 기본값 반환
      return {
        title: '크롤링된 공모전',
        organization: '미상',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: '기타',
        prize: '상금 미공개',
        description: '공모전 정보를 확인해주세요.',
        contestUrl: url,
        contestTheme: '',
        submissionFormat: '',
        contestSchedule: '',
        submissionMethod: '',
        prizeDetails: '',
        resultAnnouncement: '',
        precautions: ''
      };
    } catch (error) {
      console.error('AI 공모전 정보 추출 실패:', error);
      throw error;
    }
  }

  async reviewDocument(documentContent: string, documentType: string): Promise<string> {
    const prompt = `
다음 ${documentType} 문서를 검토해주세요:

${documentContent}

다음 관점에서 검토 의견을 제공해주세요:
1. 문법 및 맞춤법 오류
2. 문서 구조 및 논리적 흐름
3. 내용의 완성도
4. 개선 제안사항

구체적이고 실행 가능한 피드백을 제공해주세요.
`;

    try {
      const response = await fetch(`${GEMINI_API_BASE_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.9,
            maxOutputTokens: 1500,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '검토 결과를 생성할 수 없습니다.';
    } catch (error) {
      console.error('Gemini API 호출 실패:', error);
      throw error;
    }
  }
}
