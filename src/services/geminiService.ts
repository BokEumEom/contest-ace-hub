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
  private static API_KEY_STORAGE_KEY = 'gemini_api_key';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('Gemini API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
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

  async generateIdeas(contestTitle: string, contestDescription: string): Promise<string[]> {
    const prompt = `
공모전 정보:
제목: ${contestTitle}
설명: ${contestDescription}

위 공모전을 위한 창의적이고 실현 가능한 아이디어 5개를 제안해주세요. 
각 아이디어는:
1. 구체적이고 실행 가능해야 함
2. 공모전 주제와 밀접한 관련이 있어야 함
3. 차별화된 접근 방식을 포함해야 함

다음 형식 중 하나로 응답해주세요:
- "아이디어 N: [제목] - [간단한 설명]"
- "N. [제목] - [간단한 설명]"
- "[제목] - [간단한 설명]"

각 아이디어는 새로운 줄에 작성해주세요.
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
  "submissionFormat": "제출 형식 (예: PDF, PPT, 동영상 등)",
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
