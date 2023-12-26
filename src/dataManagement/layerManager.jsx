import { getNodeById, getSelection, cleanNames, createCollection, loadFonts } from '../helpers'
import { TRANS_IDENTIFIER, UNTRANSLATED,TRANS_SEPARATOR, displayTime, LANG, DEFAULT_LAYER_NAME, MANUAL_TRANSLATION } from '../globalConst'
import t from '../applicationTranslations'

export function updateLayers (data, layerToUpdate, dictionaryName, term){

    const DataTerm = !term ? data.item : term;

    layerToUpdate ? layerToUpdate.name  = TRANS_IDENTIFIER+dictionaryName+TRANS_SEPARATOR+DataTerm : null;
    
    figma.notify(t.layers_updated[LANG], {timeout: displayTime, error: false}); 
}

export function storeManualTranslation(data){
 
    const getStoredTrans = figma.root.getPluginData("Translations") !== "" ? JSON.parse(figma.root.getPluginData("Translations")) : null;

    if(getStoredTrans){
        getStoredTrans[data.layerID] = data.translation;
        figma.root.setPluginData("Translations", JSON.stringify(getStoredTrans));
    }
    else{
        let storeData = {};
        storeData[data.layerID] = data.translation;
        figma.root.setPluginData("Translations", JSON.stringify(storeData));    
    }
}

export function deleteLayerFromTerms(layerToUpdate){

    const layerToUpdateNode = getNodeById(layerToUpdate.layerID)
    layerToUpdateNode ? layerToUpdateNode.name = DEFAULT_LAYER_NAME : null;
    
    figma.notify(t.layers_deleted[LANG], {timeout: displayTime, error: false}); 

}

export function manageLayersVariables(data){
    const localVariables =  figma.variables.getLocalVariables();

    const hasVariable = localVariables.find(obj => obj.name === data.dictionaryName+"/"+cleanNames(data.textValue));
    const textNode = getNodeById(data.layerID);
    const selectCollection = data.dictionaryName === MANUAL_TRANSLATION ? "Translations" : "Dictionaries";
    const localCollections =  figma.variables.getLocalVariableCollections();
    let dictionaryCollection = localCollections.find(element => element.name === selectCollection);

    if(!hasVariable){
        if(!dictionaryCollection){ dictionaryCollection = createCollection(selectCollection)}
        const EnModeId = dictionaryCollection.modes[0].modeId;
        const jpModeId =  dictionaryCollection.modes[1].modeId;
        const token = figma.variables.createVariable(data.dictionaryName+"/"+cleanNames(data.textValue), dictionaryCollection.id ,"STRING");
        token.setValueForMode(EnModeId, data.textValue);
        token.setValueForMode(jpModeId, data.translation);
        textNode.setBoundVariable("characters", token.id);

        figma.notify(t.variable_created[LANG], {timeout: displayTime, error: false});

    }else{
        const EnModeId = dictionaryCollection.modes[0].modeId;
        const jpModeId = dictionaryCollection.modes[1].modeId;
        hasVariable.setValueForMode(EnModeId, data.textValue);
        hasVariable.setValueForMode(jpModeId, data.translation);
        textNode.setBoundVariable("characters", hasVariable.id);

        figma.notify(t.variable_bounded[LANG], {timeout: displayTime, error: false});
    }
}


export function resetLayers(layerToReset){

    layerToReset ? layerToReset.name = UNTRANSLATED : null;
    figma.notify(t.layers_updated[LANG], {timeout: displayTime, error: false});
  
}

export function resetLayerVariable(data){
    const textNode = getNodeById(data.layerID);
    const textNodeVariable = textNode.boundVariables["characters"];
    textNodeVariable ?  handleVariable : null;

    // Delete variable
    const handleVariable = () => {
        const localVariables = figma.variables.getLocalVariables();
        const getVariable = localVariables.find(obj => obj.id === textNodeVariable.id);
        getVariable.remove();
        // A hacky way to remove the bound variable until I more "official" way to do it
        const currentCharacters = textNode.characters;
        loadFonts().then(() => {
            textNode.characters = "";
            textNode.characters = currentCharacters;
        })

        figma.notify(t.variable_unbounded[LANG], {timeout: displayTime, error: false});
    }

}

export function setViewPort(item, page){
// Adding to an array because this need to be a array to work
    const targetNode = [];
    targetNode.push(getNodeById(item.layerID))
    getSelection(targetNode, page);
    figma.viewport.scrollAndZoomIntoView(targetNode);

}