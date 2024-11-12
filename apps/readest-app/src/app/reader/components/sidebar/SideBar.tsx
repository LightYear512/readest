import clsx from 'clsx';
import React, { useState } from 'react';

import { useEnv } from '@/context/EnvContext';
import { useReaderStore } from '@/store/readerStore';
import SidebarHeader from './Header';
import SidebarContent from './Content';
import TabNavigation from './TabNavigation';
import BookCard from './BookCard';
import useSidebar from '../../hooks/useSidebar';
import useDragBar from '../../hooks/useDragBar';

const MIN_SIDEBAR_WIDTH = 0.05;
const MAX_SIDEBAR_WIDTH = 0.45;

const SideBar: React.FC<{
  onGoToLibrary: () => void;
}> = ({ onGoToLibrary }) => {
  const { envConfig } = useEnv();
  const { sideBarBookKey, settings } = useReaderStore();
  const { saveSettings, getBookData } = useReaderStore();
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
          'sidebar-container bg-base-200 z-20 h-full min-w-60 select-none',
          'rounded-window-top-left rounded-window-bottom-left',
          !isSideBarPinned && 'shadow-2xl',
        )}
        style={{
          width: `${sideBarWidth}`,
          maxWidth: `${MAX_SIDEBAR_WIDTH * 100}%`,
          position: isSideBarPinned ? 'relative' : 'absolute',
        }}
      >
        <SidebarHeader
          isPinned={isSideBarPinned}
          onGoToLibrary={onGoToLibrary}
          handleTogglePin={handleSideBarTogglePin}
        />
        <div className='border-b px-3'>
          <BookCard cover={book.coverImageUrl!} title={book.title} author={book.author} />
        </div>
        <SidebarContent activeTab={activeTab} bookDoc={bookDoc} sideBarBookKey={sideBarBookKey!} />
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
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
