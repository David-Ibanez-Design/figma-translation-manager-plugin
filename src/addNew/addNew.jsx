import React, {useEffect, useState, useRef} from "react";
import styles from './addNew.modules.scss'
import { TRANS_IDENTIFIER, MANUAL_TRANSLATION, TRANS_SEPARATOR, NOT_TRANSLATED, LANG } from '../globalConst'
import t from '../applicationTranslations'

const addNew = ({setShowAddNew, isProcessing, selectedLayers, setStatusFromAddNew }) => {

    const [textareaValue, setTextareaValue] = useState(); 
    const searchRef = useRef(null);

    useEffect(() => {
        searchRef.current.focus();
      }, [searchRef]);

    useEffect(() => {

        handleDisplayValue();
        onmessage = event => {
            if(event.data.pluginMessage.eventName === "tableTranslation"){
                setTextareaValue(event.data.pluginMessage.pluginMessage);
            }
        }

    }, [selectedLayers]);

    const handleSaveClick = () => {

        selectedLayers.dictionaryName = MANUAL_TRANSLATION;
        selectedLayers.item = MANUAL_TRANSLATION;
        selectedLayers.translation = textareaValue;
        selectedLayers.status = MANUAL_TRANSLATION + TRANS_SEPARATOR + MANUAL_TRANSLATION;
        selectedLayers.layerName = TRANS_IDENTIFIER + MANUAL_TRANSLATION + TRANS_SEPARATOR + MANUAL_TRANSLATION;

        // trigger an update of the lits of terms
        setStatusFromAddNew(true);

        parent.postMessage(
            { pluginMessage: { 
                type: "check-for-layer-updates", 
                data: selectedLayers
             } },
            "*"
          );


        setShowAddNew(false);
        isProcessing(true);
    }



    const handleDisplayValue = () => {

        if(selectedLayers.dictionaryName === MANUAL_TRANSLATION){
            const trans = selectedLayers.translation;

            if(trans != "" && trans != MANUAL_TRANSLATION && trans != NOT_TRANSLATED){
                setTextareaValue(trans);
            }else{
                // Get translation from stored value instead
                parent.postMessage(
                    { pluginMessage: { 
                        type: "get-translation-from-storage", 
                        data: selectedLayers
                    } },
                    "*"
                );
            }
            
        }else{
            return textareaValue;
        }
    }

    const handleCancel = () => {
        setShowAddNew(false);
    }

    return(
        <div className={styles.addNew}>
            <h1 className="fs-4 py-2 px-3 mb-0">
                {selectedLayers.dictionaryName === MANUAL_TRANSLATION ? t.edit_translation[LANG] : t.add_new_translation[LANG]}
            </h1>
            <form className='py-2 px-3'>
                <textarea 
                    ref={searchRef} 
                    className="new-translation py-2 px-3 w-100 h-100" 
                    placeholder="input a translation..."
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                >
                </textarea>
            </form>
            <div className="action-bar">
                <button className="button theme-primary mr-2 size-small" onClick={() => handleSaveClick(textareaValue)} > {t.apply[LANG]} </button>
                <button className="button theme-secondary size-small" onClick={handleCancel} >{t.cancel[LANG]} </button>
            </div>

        </div>
    )

}

export default addNew;