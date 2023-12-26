import attributes from './samples/attributes'
import countries from './samples/countries'
import buttons from './samples/buttons'
import login from './samples/login'
import { dictionaryContents } from '../globalConst'
import { isObjectEmpty } from '../helpers'

export const fetchDictionaries = () => {
    
    const storedDictionaryContentsIsSet = figma.root.getPluginData(dictionaryContents);
    const parsedDictionaryContentsIsSet = storedDictionaryContentsIsSet ? JSON.parse(figma.root.getPluginData(dictionaryContents)) : {};

    if(isObjectEmpty(parsedDictionaryContentsIsSet)) {
        const sampleDictionaries = {"attributes": attributes, "countries": countries, "buttons": buttons, "login": login};
        return figma.root.setPluginData(dictionaryContents, JSON.stringify(sampleDictionaries));
    }

    return parsedDictionaryContentsIsSet
}