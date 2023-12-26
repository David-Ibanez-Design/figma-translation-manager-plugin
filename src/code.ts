import {
    checkForUpdates,
    handleUpdateTableRows,
    getTranslationFromStorage,
    deleteTermFromTable,
    generateCSV,
} from './dataManagement/translationTableManager';
import {generateTansTable } from './dataManagement/generateTable';
import { updateLayers, resetLayers, setViewPort, storeManualTranslation, deleteLayerFromTerms, manageLayersVariables, resetLayerVariable } from './dataManagement/layerManager';
import {getTextNodes, storeTextValues} from './dataManagement/generateTermList';
import { pluginUI, pluginUIHeight, pluginUIWidth, MANUAL_TRANSLATION} from './globalConst';
import { getNodeById, getDictionaryAndTerm, getTranslationTable, getDocumentPages} from './helpers';
import { fetchDictionaries } from './dictionaries/fetchDictionaries';
import { storedVariableFromLocalCollection, setDictionaryAsVariables } from './dataManagement/variableManager';

figma.skipInvisibleInstanceChildren = true;

// Plugin UI settings
figma.showUI(__html__, pluginUI);

// Trigger when then plugin runs
figma.on('run', ({}: RunEvent) => {

    const [pages, filteredPages] = getDocumentPages();
    // figma.root.setPluginData('dictionaries-content', "");
    const storedDictionaries = fetchDictionaries();
    setDictionaryAsVariables(); 
    const documentTerms = storeTextValues(getTextNodes(filteredPages));
    const storedDictionariesFromVar =  storedDictionaries && storedVariableFromLocalCollection();
    figma.ui.postMessage({name: "textNodes",data: documentTerms, dictionaries: storedDictionariesFromVar, pages: pages})
    !getTranslationTable() ? generateTansTable(documentTerms): checkForUpdates(documentTerms); 
   
});

// Trigger when specific messages are send
figma.ui.onmessage = (msg) => {
  
    switch (msg.type) {
      
        case "check-for-layer-updates":
        
            const layerToUpdate = getNodeById(msg.data.layerID);
            const [dictionaryName, term] = getDictionaryAndTerm(msg.data.status);
            updateLayers(msg.data, layerToUpdate, dictionaryName, term);
            handleUpdateTableRows(msg.data, "Update");
            manageLayersVariables(msg.data);
            dictionaryName === MANUAL_TRANSLATION && storeManualTranslation(msg.data);
            break;

        case "get-translation-from-storage":
            getTranslationFromStorage(msg.data);
            break;  

        case "reset-layer-name":
            const layerToReset = getNodeById(msg.data.layerID);
            resetLayers(layerToReset);
            handleUpdateTableRows(msg.data, "Reset");
            resetLayerVariable(msg.data);
            break;  

        case "navigate-to-layer":
            setViewPort(msg.item, msg.page);
            break;
        
        case "delete-term":
            deleteLayerFromTerms(msg.item);
            deleteTermFromTable(msg.item, "delete");
            resetLayerVariable(msg.item);
            figma.ui.postMessage({eventName: "term-deleted",pluginMessage: "Term deleted"});
            break;

        case "minimize-plugin-ui":
            figma.ui.resize(150,40);
            break;

        case "maximize-plugin-ui":
            figma.ui.resize(pluginUIWidth, pluginUIHeight);
        break;

        case "export-csv":
            generateCSV();
        break;

        default:
            break;
    }
};