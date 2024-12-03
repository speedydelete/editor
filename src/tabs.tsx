
import React, {type ReactNode, useState, useEffect, useContext, createContext} from 'react';

const TabContext: React.Context<[string, React.Dispatch<React.SetStateAction<string>>]> = createContext<[string, React.Dispatch<React.SetStateAction<string>>]>(['', () => {}]);

function Tab({name, displayName}: {name: string, displayName?: string}): ReactNode {
    const [selectedTab, setSelectedTab] = useContext(TabContext);
    return (
        <div
            className={selectedTab == name ? 'tab active-tab' : 'tab'}
            id={`editor-tab-${name}`}
            onClick={function () {
                setSelectedTab(name);
            }}
        >
            {displayName === undefined ? name : displayName}
        </div>
    );
}

function TabSpace(): ReactNode {
    return (
        <div className='tab tab-space'></div>
    );
}

function TabBar({children}: {children: ReactNode}): ReactNode {
    return (
        <div className='tab-bar'>{children}</div>
    );
}

function TabPanel({children, name}: {children: ReactNode, name: string}): ReactNode {
    const [selectedTab, setSelectedTab] = useContext(TabContext);
    return (
        <>
            {(selectedTab === name) && 
                <div className='tab-panel'>
                    {children}
                </div>
            }
        </>
    );
}

function TopBar({children}: {children: ReactNode}): ReactNode {
    return (
        <div className='top-bar'>{children}</div>
    );
}

function TabView({children, selected}: {children: ReactNode, selected?: string}): ReactNode {
    const [selectedTab, setSelectedTab] = useState(selected === undefined ? '' : selected);
    useEffect(() => {
        if (selected && selected !== selectedTab) {
            setSelectedTab(selected);
        }
    }, [selected]);
    return (
        <div className='tab-view'>
            <TabContext.Provider value={[selectedTab, setSelectedTab]}>
                {children}
            </TabContext.Provider>
        </div>
    );
}

export {
    Tab,
    TabSpace,
    TabBar,
    TabPanel,
    TopBar,
    TabView,
}
