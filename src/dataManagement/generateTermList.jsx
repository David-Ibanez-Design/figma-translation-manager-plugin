import { getTranslationValues, findParentFrame, findPages } from '../helpers';
import { TRANS_IDENTIFIER,UNTRANSLATED } from '../globalConst';

export function getTextNodes(pages) { 
    let termNodes = []
    pages.forEach(page => {
        termNodes.push(page.findAllWithCriteria({types: ["TEXT"]}).filter(item => item.name.startsWith(TRANS_IDENTIFIER)));
    });
    return termNodes = [].concat(...termNodes);
}


export function storeTextValues(nodes) {
    let pageText = [];

    for (let i = 0; i < nodes.length; i++) {
        pageText.push({
            'layerID': nodes[i].id,
            'layerName': nodes[i].name,
            'parentFrame': findParentFrame(nodes[i]),
            'page': findPages(nodes[i].parent),
            'textValue': nodes[i].characters,
            'status': nodes[i].name === UNTRANSLATED ? 'Not translated' : getTranslationValues(nodes[i].name, "getStatus"),
            'dictionaryName': nodes[i].name === UNTRANSLATED ? 'Not translated' : getTranslationValues(nodes[i].name, "getDictionary"),
            'translation':  nodes[i].name === UNTRANSLATED ? 'Not translated' : getTranslationValues(nodes[i].name, "getTranslations"),
            "item":nodes[i].name === UNTRANSLATED ? '' : getTranslationValues(nodes[i].name, "getItem"),
        });
    }
    return pageText;
}