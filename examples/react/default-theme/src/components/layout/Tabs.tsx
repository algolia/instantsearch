import React, { useEffect, useRef, useState } from 'react';

import { cx } from '../../cx';

import './Tabs.css';

export type TabProps = {
  children: React.ReactNode;
  title: string;
};

const getTabId = (index: number, suffix?: string) =>
  [`tab-${index}`, suffix].filter(Boolean).join('-');

export function Tabs({ children }: { children: React.ReactNode }) {
  const firstRender = useRef(true);
  const [currentTab, setCurrentTab] = useState(0);
  const tabsRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!firstRender.current && tabsRefs.current) {
      tabsRefs.current[currentTab].focus();
    }
  }, [currentTab]);

  useEffect(() => {
    firstRender.current = false;
  }, []);

  const onKeyDown = ({ key }: React.KeyboardEvent) => {
    if (key === 'ArrowLeft') {
      setCurrentTab(Math.max(0, currentTab - 1));
    } else if (key === 'ArrowRight') {
      setCurrentTab(
        Math.min(currentTab + 1, React.Children.count(children) - 1)
      );
    }
  };

  return (
    <div className="Tabs">
      <div role="tablist" className="Tabs-header">
        {React.Children.map(children, (child, index) => {
          const isSelected = currentTab === index;
          return (
            <button
              role="tab"
              aria-selected={isSelected}
              aria-controls={getTabId(index, 'item')}
              id={getTabId(index, 'title')}
              tabIndex={isSelected ? 0 : -1}
              className={cx('Tabs-title', isSelected && 'Tabs-title--active')}
              ref={(element) => (tabsRefs.current[index] = element!)}
              key={getTabId(index)}
              onClick={() => setCurrentTab(index)}
              onKeyDown={onKeyDown}
            >
              {(child as React.ReactElement<TabProps>).props.title}
            </button>
          );
        })}
      </div>
      <div className="Tabs-list">
        {React.Children.map(children, (child, index) => (
          <div
            tabIndex={0}
            role="tabpanel"
            id={getTabId(index, 'item')}
            aria-labelledby={getTabId(index, 'title')}
            hidden={currentTab !== index}
            key={getTabId(index)}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}
