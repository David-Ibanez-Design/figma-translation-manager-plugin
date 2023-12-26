import { DICTIONARIES_COL, dictionaryContents } from '../globalConst';
import { cleanNames } from '../helpers';

export function setDictionaryAsVariables(){

    const localCollections =  figma.variables.getLocalVariableCollections();
    let dictionaryCollection = localCollections ?  localCollections.find(element => element.name === DICTIONARIES_COL) : null;
    const getStoredDictionaries = JSON.parse(figma.root.getPluginData(dictionaryContents));

    dictionaryCollection ? manageDictionariesVariables(dictionaryCollection, getStoredDictionaries, true) : manageDictionariesVariables(dictionaryCollection, getStoredDictionaries);
}

function manageDictionariesVariables (dictionaryCollection, getStoredDictionaries, isUpdate=null){

    let EnModeId = null;
    let jpModeId = null;

    if(!isUpdate){
        dictionaryCollection = figma.variables.createVariableCollection(DICTIONARIES_COL);
        EnModeId = dictionaryCollection.modes[0].modeId;
        dictionaryCollection.renameMode(EnModeId, "En");
        dictionaryCollection.addMode("Jp");
        jpModeId = dictionaryCollection.modes[1].modeId;
        
    }else{
        EnModeId = dictionaryCollection.modes[0].modeId;
        jpModeId =  dictionaryCollection.modes[1].modeId;   
    }

    const storeLibraryVariables = figma.variables.getLocalVariables();

    for (let storedDictionary in getStoredDictionaries) {

        for (let dictionaryName in getStoredDictionaries[storedDictionary]) {

                    let cleanDictionaryName = cleanNames(dictionaryName)
                    let hasVariable = storeLibraryVariables.find(obj => obj.name === storedDictionary+"/"+cleanDictionaryName);
                    
                    if (!hasVariable) {
                        const token = figma.variables.createVariable(storedDictionary+"/"+cleanDictionaryName, dictionaryCollection.id, "STRING");
                        token.setValueForMode(EnModeId, dictionaryName);
                        token.setValueForMode(jpModeId, getStoredDictionaries[storedDictionary][dictionaryName]);
                    }
        }   
    }
}

export function storedVariableFromLocalCollection(){
    const localLibraryCollections = figma.variables.getLocalVariableCollections();
    const localDictionaryCollection = localLibraryCollections ? localLibraryCollections.find(obj => obj.name === DICTIONARIES_COL) : null;
    const libraryCollection = figma.variables.getLocalVariables('STRING').filter(obj => obj.variableCollectionId === localDictionaryCollection.id);

    let dictionary = {};
    let currentFolder = "";

    if(libraryCollection){
        for (let variable in libraryCollection) {

            const [folder, name ] = libraryCollection[variable].name.split("/");
            const en = Object.values(libraryCollection[variable].valuesByMode)[0];
            const jp = Object.values(libraryCollection[variable].valuesByMode)[1];
    
            if(currentFolder != folder){dictionary[folder] = {};}
            dictionary[folder][en]= jp;
            currentFolder = folder;
        }
        return dictionary;
    }else{
        return null
    }


}