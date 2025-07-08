
import React from 'react';
import { Search, Globe, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContestCrawler from '@/components/ContestCrawler';
import VectorSearch from '@/components/VectorSearch';

const Explore = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            공모전 탐색
          </h2>
          <p className="text-muted-foreground">
            AI 기반 검색과 웹 크롤링을 통해 새로운 공모전을 찾아보세요.
          </p>
        </div>

        <div className="w-full">
          <Tabs defaultValue="vector-search" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vector-search" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI 검색
              </TabsTrigger>
              <TabsTrigger value="crawler" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                웹 크롤링
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                일반 검색
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vector-search" className="space-y-4">
              <VectorSearch />
            </TabsContent>

            <TabsContent value="crawler" className="space-y-4">
              <ContestCrawler />
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  일반 검색 기능
                </h3>
                <p className="text-muted-foreground mb-6">
                  키워드 기반 검색 기능이 준비 중입니다.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Explore;
