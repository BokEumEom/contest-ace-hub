
import React, { useState } from 'react';
import { Search, Globe } from 'lucide-react';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CrawlSetup from '@/components/CrawlSetup';
import ContestCrawler from '@/components/ContestCrawler';
import { CrawlService } from '@/services/crawlService';

const Explore = () => {
  const [showCrawlSetup, setShowCrawlSetup] = useState(!CrawlService.getApiKey());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            공모전 탐색
          </h2>
          <p className="text-muted-foreground">
            웹사이트를 크롤링하여 새로운 공모전을 찾아보세요.
          </p>
        </div>

        <div className="w-full">
          {showCrawlSetup ? (
            <CrawlSetup onSetupComplete={() => setShowCrawlSetup(false)} />
          ) : (
            <ContestCrawler />
          )}
        </div>
      </main>
    </div>
  );
};

export default Explore;
