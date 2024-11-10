import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';

import { useReaderStore } from '@/store/readerStore';
import WindowButtons from '@/components/WindowButtons';
import Dropdown from '@/components/Dropdown';
import SidebarToggler from './SidebarToggler';
import BookmarkToggler from './BookmarkToggler';
import NotebookToggler from './NotebookToggler';
import ViewMenu from './ViewMenu';

interface HeaderBarProps {
  bookKey: string;
  bookTitle: string;
  isHoveredAnim: boolean;
  onCloseBook: (bookKey: string) => void;
  onSetSettingsDialogOpen: (open: boolean) => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  bookKey,
  bookTitle,
  isHoveredAnim,
  onCloseBook,
  onSetSettingsDialogOpen,
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { hoveredBookKey, isSideBarVisible, setHoveredBookKey } = useReaderStore();

  const handleToggleDropdown = (isOpen: boolean) => {
    setIsDropdownOpen(isOpen);
    if (!isOpen) setHoveredBookKey('');
  };

  return (
    <div
      ref={headerRef}
      className={clsx(
        `header-bar absolute top-0 z-10 flex h-11 w-full items-center px-4`,
        `shadow-xs bg-base-100 rounded-window-top-right transition-opacity duration-300`,
        !isSideBarVisible && 'rounded-window-top-left',
        isHoveredAnim && 'hover-bar-anim',
        hoveredBookKey === bookKey || isDropdownOpen ? `visible` : `opacity-0`,
        isDropdownOpen && 'header-bar-pinned',
      )}
      onMouseEnter={() => setHoveredBookKey(bookKey)}
      onMouseLeave={() => setHoveredBookKey('')}
    >
      <div className='sidebar-bookmark-toggler flex h-full items-center'>
        <SidebarToggler bookKey={bookKey} />
        <BookmarkToggler bookKey={bookKey} />
      </div>

      <div className='header-title flex flex-1 items-center justify-center'>
        <h2 className='line-clamp-1 max-w-[80%] text-center text-xs font-semibold'>{bookTitle}</h2>
      </div>

      <div className='flex h-full items-center space-x-2'>
        <NotebookToggler bookKey={bookKey} />
        <Dropdown
          className='dropdown-bottom dropdown-end'
          buttonClassName='btn btn-ghost h-8 min-h-8 w-8 p-0'
          toggleButton={<PiDotsThreeVerticalBold size={16} />}
          onToggle={handleToggleDropdown}
        >
          <ViewMenu bookKey={bookKey} onSetSettingsDialogOpen={onSetSettingsDialogOpen} />
        </Dropdown>

        <WindowButtons
          className='window-buttons flex h-full items-center'
          headerRef={headerRef}
          showMinimize={false}
          showMaximize={false}
          onClose={() => onCloseBook(bookKey)}
        />
      </div>
    </div>
  );
};

export default HeaderBar;
