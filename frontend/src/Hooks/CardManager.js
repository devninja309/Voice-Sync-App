
import React, {useContext, useState, createContext} from 'react';

    const CardContext = createContext()
    const useCardContext = () => useContext(CardContext)
    
    const useContextValue = () => {
        const [overrideDND, setOverrideDND] = useState(false)
    
        return {
            overrideDND,
            setOverrideDND
        }
    }

    export const CardManagerProvider = ({ children }) => {
        const ctx = useContextValue()
    
        return (
            <CardContext.Provider value={ctx}>
                {children}
            </CardContext.Provider>
        )
    }

    export const useCardContextTools = () => {
        const cardContext = useCardContext()
        const overrideDND = cardContext?.overrideDND;
        const setOverrideDND = cardContext?.setOverrideDND;
        return { overrideDND, setOverrideDND}
    }
