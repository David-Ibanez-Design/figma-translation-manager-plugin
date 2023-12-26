import { 
    dictionaryContents, 
    NOT_TRANSLATED, 
    TRANS_IDENTIFIER, 
    MANUAL_TRANSLATION, 
    FONT_REGULAR, 
    FONT_BOLD, 
    COLUMNS, 
    EMPTY_COL,
    TRANS_SEPARATOR, 
 } from './globalConst'

export function rgbColorConverter(color) {
    return {
        r: parseInt(color.substr(0,2),16)/255, 
        g: parseInt(color.substr(2,2),16)/255, 
        b: parseInt(color.substr(4,2),16)/255
    }
}

export function isObjectEmpty(obj){
    return Object.keys(obj).length === 0
}

export function findIndexById(array, id) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].id === id) {
        return i; 
      }
    }
    return -1;
}

export function getDictionaryAndTerm(data){
    const rsl = data.replace(TRANS_IDENTIFIER, '');
    return rsl.split(TRANS_SEPARATOR);
}

export const getSelection = (targetNode, page) => {
        const pageIndex = figma.root.children.findIndex(obj => obj.id === page.pageId);
        figma.currentPage = figma.root.findOne(node => node.id === page.pageId);
        figma.root.children[pageIndex].selection = targetNode;
}

export const getNodeById = (nodeId) => {
        return figma.root.findOne(node => node.id === nodeId);
}

export const getNodes = (nodeType) => {
        return figma.root.findAllWithCriteria({types: [nodeType]})
}

// Merge this one with the one below
export function getTranslationValues(data, valueToReturn){

    const dictionaries = getDictionaries();
    const [dictionaryName, term] = getDictionaryAndTerm(data); 

    switch (valueToReturn) {
        case "getStatus":
            if(dictionaryName === MANUAL_TRANSLATION){
                return dictionaryName + TRANS_SEPARATOR + term;
            }
            else if (!dictionaries[dictionaryName]){
                return NOT_TRANSLATED;
            }else if(!dictionaries[dictionaryName][term]){
                return NOT_TRANSLATED;
            }else{
                return dictionaryName + TRANS_SEPARATOR + term;
            }
        case "getDictionary":
            return dictionaryName;
        case "getTranslations":
            if(dictionaryName === MANUAL_TRANSLATION && term === MANUAL_TRANSLATION){
                return MANUAL_TRANSLATION
            }else if (dictionaryName === MANUAL_TRANSLATION && term !== MANUAL_TRANSLATION){
                return term
            }else if (!dictionaries[dictionaryName]){
                return NOT_TRANSLATED
            }else if (!dictionaries[dictionaryName][term]){
                return NOT_TRANSLATED
            }
            else{
                return dictionaries[dictionaryName][term]; 
            }
            case "getItem":
                return term;
        default:
            break;
    }

}

export const loadFonts = async () => {
    await figma.loadFontAsync( FONT_REGULAR );
    await figma.loadFontAsync( FONT_BOLD );
};

export const findNodes = (nodeNames, translationTable) => {
    const nodeArray = [];
    nodeNames.map((value) => {
        nodeArray.push(translationTable.findOne((item) => item.name === value));
    });
    return nodeArray;
};

 export function setValues(loadFonts, element, data, clonedCell) {

    const [termFrameName, dictionaryNodeName, enTermNodeName, jpTermNodeName] = COLUMNS;
    loadFonts().then(() => {

        let color = data.status === NOT_TRANSLATED ? "FFF6F6" : "ffffff";
        const fills = [{ type: 'SOLID', color: rgbColorConverter(color) }];
       
        switch (element) {
          case termFrameName:
            clonedCell.children[0].characters  = data.textValue;
            clonedCell.children[0].hyperlink = { type: 'NODE', value: data.parentFrame.frameId },
            clonedCell.children[0].fills = [{ type: 'SOLID', color: rgbColorConverter("1971c2") }]
            if(data.status === NOT_TRANSLATED){
                clonedCell.fills = fills;
            }else{
                clonedCell.fills = fills;
            }
            break;
          case dictionaryNodeName:
            if(data.status !== NOT_TRANSLATED){
                clonedCell.children[0].characters = data.status.split(TRANS_SEPARATOR)[0]
                clonedCell.fills = fills;
            } else{
                clonedCell.children[0].characters = EMPTY_COL;
                clonedCell.fills = fills;
            }
            break;
          case enTermNodeName:
            if(data.status !== NOT_TRANSLATED){
                clonedCell.children[0].characters = data.status.split(TRANS_SEPARATOR)[1];
                clonedCell.fills = fills;
            } else{
                clonedCell.children[0].characters = EMPTY_COL;
                clonedCell.fills = fills;
            }
            break;
          case jpTermNodeName:
            if(data.status !== NOT_TRANSLATED){
                clonedCell.children[0].characters = data.translation;
                clonedCell.fills = fills;
            } else{
                clonedCell.children[0].characters = EMPTY_COL;
                clonedCell.fills = fills;
            }
            break;
        }
     })

}

export function getTranslationFromStorage(data){

    if(isObjectEmpty(figma.root.getPluginData("Translations"))){console.error("No translation storage found");
    }else{
        const storedTranslations = JSON.parse(figma.root.getPluginData("Translations"));
        figma.ui.postMessage({
            eventName: "tableTranslation",
            pluginMessage: storedTranslations[data.layerID],
            pluginId: '*'
        });
    }
    
}

export function createCollection(selectCollection){

    const dictionaryCollection = figma.variables.createVariableCollection(selectCollection);
    dictionaryCollection.renameMode(dictionaryCollection.modes[0].modeId, "En");
    dictionaryCollection.addMode("Jp");

    return dictionaryCollection;

}

export function cleanNames(str){
    return str.replace(/[{}]/g, "()").replace(/[.]/g, ":").replace(/[?]/g, " ").replace(/[\/]/g, "");
}

export function getDictionaries () {
    const hasDictionary = figma.root.getPluginData(dictionaryContents);
     return hasDictionary ? JSON.parse(figma.root.getPluginData(dictionaryContents)) : null;
}

export function getTranslationTable() {

    const getTranslationPage = !isObjectEmpty(figma.root.getPluginData("Translation page ID")) && JSON.parse(figma.root.getPluginData("Translation page ID"));
    const getTranslationTable = !isObjectEmpty(figma.root.getPluginData("Translation table ID")) && JSON.parse(figma.root.getPluginData("Translation table ID"));

    const getTranslationPageNode = getTranslationPage ? getNodeById(getTranslationPage): false;
    const getTranslationTableNode = getTranslationTable ? getNodeById(getTranslationTable): false;

    return (getTranslationPageNode && getTranslationTableNode) ? getTranslationTableNode : false;
}

export function setLayoutStroke() {
  return  [{
        "type": "SOLID",
        "visible": true,
        "opacity": 1,
        "blendMode": "NORMAL",
        "color":  rgbColorConverter('D5DFE5')
    }]
}

export const resetStorage = (data) => {
    const getStoredTrans = !isObjectEmpty(figma.root.getPluginData("Translations")) && JSON.parse(figma.root.getPluginData("Translations"));
    getStoredTrans && delete getStoredTrans[data.layerID];
};

export const getDocumentPages = () => {

    let pages = [];

    const getTranslationPage = figma.root.getPluginData("Translation page ID") != "" ? JSON.parse(figma.root.getPluginData("Translation page ID")) : null;
    const getTranslationPageNode = getTranslationPage ? getNodeById(getTranslationPage): false;

    const filteredPages =  getTranslationPageNode ? getNodes('PAGE').filter(node => node.name !== getTranslationPageNode.name).filter(node => !node.name.includes("!")) : getNodes('PAGE').filter(node => !node.name.includes("!"));
    filteredPages.forEach((elem) => {pages.push(elem.name)});

    return [pages, filteredPages];
}

export function findParentFrame(node, frameId=0, frameName= "") {
    switch (node.parent.type) {
        case "FRAME":
                return findParentFrame(node.parent, node.parent.id, node.parent.name);          
        case "PAGE":
            return {
                'frameId': frameId,
                'frameName': frameName,
            };
        case "SECTION":
            return {
                'frameId': frameId,
                'frameName': frameName,
            };
        case "DocumentNode":
            return false;
        default:
            return findParentFrame(node.parent, node.parent.id, node.parent.name);
    }
}

export function findPages(parent) {
    switch (parent.type) {
        case "PAGE":
            return { 'pageId': parent.id, 'pageName': parent.name };
        default:
            return findPages(parent.parent);
    }
}

export function addMissingRowsToTable(dataToRender) {

    const tableFrame = getTranslationTable();

    const cellTemplate = tableFrame.children[0].children[1];

    COLUMNS.forEach(element => {
        const clonedCell = cellTemplate.clone();
        clonedCell.name = "Cell";
        const node = tableFrame.findOne(node => node.name === element);
        node.insertChild(1, clonedCell);
        setValues(loadFonts, element,dataToRender, clonedCell);    
        loadFonts().then(() => {
            if(element === "Dictionary" || element === "EN term"){
                clonedCell.children[0].textAutoResize =  "WIDTH_AND_HEIGHT";
                clonedCell.counterAxisSizingMode = "AUTO";
                clonedCell.layoutAlign = "STRETCH"
            }
        })
    
    });  

}