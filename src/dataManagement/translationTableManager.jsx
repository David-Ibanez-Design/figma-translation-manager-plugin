import { COLUMNS, EMPTY_COL, displayTime, NOT_TRANSLATED, LANG } from '../globalConst'
import { loadFonts, findNodes, findIndexById, rgbColorConverter, getTranslationTable, isObjectEmpty, resetStorage, addMissingRowsToTable } from '../helpers'
const [termFrameName, dictionaryNodeName, enTermNodeName, jpTermNodeName] = COLUMNS;
import t from '../applicationTranslations'

export function deleteTermFromTable(data, type="check"){

    const translationTable = getTranslationTable();

    const [termFrame, DictionaryNode, EnTermNode, jpTermNode] = findNodes([
        termFrameName, dictionaryNodeName, enTermNodeName, jpTermNodeName], translationTable)    
    const termTextNodes = termFrame.findAllWithCriteria({types: ['TEXT']});

    if(type === "check"){
        for (const node of termTextNodes) {
            if (!data.find(item => item.textValue === node.characters) && node.characters != termFrameName) {
                const frameIndex = findIndexById(termFrame.children, node.parent.id);
                for (const node of [termFrame, DictionaryNode, EnTermNode, jpTermNode]) {
                    node.children[frameIndex].remove();
                }
            }
        }

        return termTextNodes;


    }else{
        for (const node of termTextNodes) {
            if (data.textValue === node.characters && node.characters != termFrameName) {
                const frameIndex = findIndexById(termFrame.children, node.parent.id);
                for (const node of [termFrame, DictionaryNode, EnTermNode, jpTermNode]) {
                    node.children[frameIndex].remove();
                }
            }
        }

        figma.notify(t.table_term_deleted[LANG], {timeout: displayTime, error: false});
    }
}

export function generateCSV(csvDownloadLink){

    const translationTable = getTranslationTable();
    const tableValues = {};
    let URL = 'https://www.figma.com/file/'+ figma.fileKey +'/'+ figma.root.name +'?type=design&node-id='

    const [termFrame, DictionaryNode, EnTermNode, jpTermNode] = findNodes([
        termFrameName, dictionaryNodeName, enTermNodeName, jpTermNodeName], translationTable); 

    const colCount = termFrame.children.length;
    for (let index = 0; index < colCount; index++) {tableValues[index] = [];}

    for (const [colIndex, colValue] of [termFrame, DictionaryNode, EnTermNode, jpTermNode].entries()) {

        const textNodes = colValue.findAllWithCriteria({types: ['TEXT']});
        for (const [cellIndex, cellValue] of textNodes.entries()) {

            if(cellValue.characters != textNodes[0].characters){
                    if(cellValue.hyperlink){
                        switch (cellValue.hyperlink.type) {
                            case "NODE":
                               tableValues[cellIndex].push("=HYPERLINK(\"\"" + URL+cellValue.hyperlink.value + "\"\", \"\"" + cellValue.characters +  "\"\")");
                                break;
                            case "URL":
                               tableValues[cellIndex].push("=HYPERLINK(\"\"" + cellValue.hyperlink.value + "\"\", \"\"" + cellValue.characters + "\"\")");
                                break; 
                                                  
                            default:
                                tableValues[cellIndex].push(cellValue.characters);
                                break;
                        }
                    }else{
                        tableValues[cellIndex].push(cellValue.characters);
                    }
            }else{
                tableValues[0].push(cellValue.characters)
            }
        }
    }

    //Convert data to CSV format
    let csvContent = '';
        for (const key in tableValues) {
        const row = tableValues[key].map(value => `"${value}"`).join(',');
        csvContent += `${row}\n`;
    }

    let csvData = "data:text/csv;charset=utf-8,";
    var encodedUri = encodeURI(csvData + csvContent);

    figma.ui.postMessage({
        name: "setDownload",
        data: encodedUri,
        pluginId: '*'
    });

}


export function checkForUpdates(data){

    const termTextNodes = deleteTermFromTable(data);
  
    // Check missing values in table and add them
    for (const item of data) {
      if (!termTextNodes.find(node => node.characters ===item.textValue)) {
            addMissingRowsToTable(item);
      }
    }
  
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

export function handleUpdateTableRows(data, type){

    const translationTable = getTranslationTable();

    const [termFrame, DictionaryNode, EnTermNode, jpTermNode] = findNodes([
        termFrameName, dictionaryNodeName, enTermNodeName, jpTermNodeName], translationTable)    
    const tableTextNodes = translationTable.findAllWithCriteria({types: ['TEXT']});
    
    const matchedNode = tableTextNodes.find(node => node.characters ===  data.textValue);
    const frameIndex = matchedNode && findIndexById(termFrame.children, matchedNode.parent.id);

    const updateTextNodes = (frameIndex, dictionary=EMPTY_COL, enTerm=EMPTY_COL, jpTerm=EMPTY_COL) => {

        if(dictionary === NOT_TRANSLATED){
            enTerm = EMPTY_COL;
            jpTerm = EMPTY_COL;
            dictionary = EMPTY_COL;
        }

        DictionaryNode.children[frameIndex].children[0].characters = dictionary;
        EnTermNode.children[frameIndex].children[0].characters = enTerm;
        jpTermNode.children[frameIndex].children[0].characters = jpTerm;
        
        // Set background color
        let color = dictionary === EMPTY_COL ||  dictionary === NOT_TRANSLATED ? "FFF6F6" : "ffffff";
        const fills = [{ type: 'SOLID', color: rgbColorConverter(color) }];

        for (const node of [termFrame, DictionaryNode, EnTermNode, jpTermNode]) {
            node.children[frameIndex].fills = fills;
        }

        figma.notify(t.layers_updated[LANG], {timeout: displayTime, error: false});
        figma.ui.postMessage({eventName: "processing-status",pluginMessage: "Layer updated"}); 
    };

    if(!matchedNode){
        addMissingRowsToTable(data);
    }else{
        loadFonts().then(function(){
            if(type === "Update"){
                updateTextNodes(frameIndex, data.dictionaryName, data.item, data.translation);
            }
            else{
                updateTextNodes(frameIndex);
                resetStorage(data);
            }      
        })
    }


    
}