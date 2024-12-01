
import React, {useState, useContext, createContext} from 'react';

const TabContext: React.Context<[string, React.Dispatch<React.SetStateAction<string>>]> = createContext<[string, React.Dispatch<React.SetStateAction<string>>]>(['', () => {}]);

function Tab({name, displayName}: {name: string, displayName?: string}) {
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

function TabSpace() {
    return (
        <div className='tab tab-space' style={{flexGrow: 1}}></div>
    );
}

function TabBar({children}: {children: React.ReactNode}) {
    return (
        <div className='tab-bar'>{children}</div>
    );
}

function TabPanel({children, name}: {children: React.ReactNode, name: string}) {
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

function TabView({children, selected}: {children: React.ReactNode, selected?: string}) {
    const [selectedTab, setSelectedTab] = useState(selected === undefined ? '' : selected);
    React.useEffect(() => {
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
    TabView,
}
