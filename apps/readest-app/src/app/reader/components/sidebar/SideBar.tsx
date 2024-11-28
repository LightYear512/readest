import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import { useEnv } from '@/context/EnvContext';
import { useSettingsStore } from '@/store/settingsStore';
import { useBookDataStore } from '@/store/bookDataStore';
import { useReaderStore } from '@/store/readerStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { BookSearchResult } from '@/types/book';
import { eventDispatcher } from '@/utils/event';
import SidebarHeader from './Header';
import SidebarContent from './Content';
import BookCard from './BookCard';
import useSidebar from '../../hooks/useSidebar';
import useDragBar from '../../hooks/useDragBar';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import useShortcuts from '@/hooks/useShortcuts';

const MIN_SIDEBAR_WIDTH = 0.05;
const MAX_SIDEBAR_WIDTH = 0.45;

const SideBar: React.FC<{
  onGoToLibrary: () => void;
}> = ({ onGoToLibrary }) => {
  const { envConfig } = useEnv();
  const { settings, saveSettings } = useSettingsStore();
  const { sideBarBookKey } = useSidebarStore();
  const { getBookData } = useBookDataStore();
  const { getView } = useReaderStore();
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<BookSearchResult[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(settings.globalReadSettings.sideBarTab);
  const {
    sideBarWidth,
    isSideBarPinned,
    isSideBarVisible,
    setSideBarVisible,
    handleSideBarResize,
    handleSideBarTogglePin,
  } = useSidebar(
    settings.globalReadSettings.sideBarWidth,
    settings.globalReadSettings.isSideBarPinned,
  );

  const onSearchEvent = async (event: CustomEvent) => {
    const { term } = event.detail;
    setSideBarVisible(true);
    setIsSearchBarVisible(true);
    setSearchTerm(term);
  };

  useEffect(() => {
    eventDispatcher.on('search', onSearchEvent);
    return () => {
      eventDispatcher.off('search', onSearchEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragMove = (e: MouseEvent) => {
    const widthFraction = e.clientX / window.innerWidth;
    const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, widthFraction));
    handleSideBarResize(`${Math.round(newWidth * 10000) / 100}%`);
  };
  const { handleMouseDown } = useDragBar(handleDragMove);

  const handleClickOverlay = () => {
    setSideBarVisible(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    settings.globalReadSettings.sideBarTab = tab;
    saveSettings(envConfig, settings);
  };

  const handleToggleSearchBar = () => {
    setIsSearchBarVisible((prev) => !prev);
    if (isSearchBarVisible) {
      setSearchResults(null);
      setSearchTerm('');
      getView(sideBarBookKey)?.clearSearch();
    }
  };

  useShortcuts({ onToggleSearchBar: handleToggleSearchBar }, [sideBarBookKey]);

  const handleSearchResultClick = (cfi: string) => {
    getView(sideBarBookKey)?.goTo(cfi);
  };

  if (!sideBarBookKey) return null;

  const bookData = getBookData(sideBarBookKey);
  if (!bookData || !bookData.book || !bookData.bookDoc) {
    return null;
  }
  const { book, bookDoc } = bookData;

  return isSideBarVisible ? (
    <>
      <div
        className={clsx(
          'sidebar-container bg-base-200 z-20 flex h-full min-w-60 flex-col',
          'rounded-window-top-left rounded-window-bottom-left select-none',
          !isSideBarPinned && 'shadow-2xl',
        )}
        style={{
          width: `${sideBarWidth}`,
          maxWidth: `${MAX_SIDEBAR_WIDTH * 100}%`,
          position: isSideBarPinned ? 'relative' : 'absolute',
        }}
      >
        <div className='flex-shrink-0'>
          <SidebarHeader
            isPinned={isSideBarPinned}
            isSearchBarVisible={isSearchBarVisible}
            onGoToLibrary={onGoToLibrary}
            onTogglePin={handleSideBarTogglePin}
            onToggleSearchBar={handleToggleSearchBar}
          />
          <div
            className={clsx('search-bar', {
              'search-bar-visible': isSearchBarVisible,
            })}
          >
            <SearchBar
              isVisible={isSearchBarVisible}
              bookKey={sideBarBookKey!}
              searchTerm={searchTerm}
              onSearchResultChange={setSearchResults}
            />
          </div>
          <div className='border-base-300/50 border-b px-3'>
            <BookCard cover={book.coverImageUrl!} title={book.title} author={book.author} />
          </div>
        </div>
        {isSearchBarVisible && searchResults ? (
          <SearchResults
            bookKey={sideBarBookKey!}
            results={searchResults}
            onSelectResult={handleSearchResultClick}
          />
        ) : (
          <SidebarContent
            activeTab={activeTab}
            bookDoc={bookDoc}
            sideBarBookKey={sideBarBookKey!}
            onTabChange={handleTabChange}
          />
        )}
        <div
          className='drag-bar absolute right-0 top-0 h-full w-0.5 cursor-col-resize'
          onMouseDown={handleMouseDown}
        ></div>
      </div>
      {!isSideBarPinned && (
        <div className='overlay fixed inset-0 z-10 bg-black/20' onClick={handleClickOverlay} />
      )}
    </>
  ) : null;
};

export default SideBar;
