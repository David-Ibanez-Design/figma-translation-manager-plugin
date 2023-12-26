import React, {useState, useEffect} from "react";
import * as ReactDOM from "react-dom";
import './scss/global.scss';
import styles from './ui.module.scss'
import PageText from "../pageText/pageText";
import SelectFromDictionaries from "../dictionaries/selectFromDictionaries";
import t from '../applicationTranslations'
import { LANG } from '../globalConst'

function App() {

  const [childrenActive, setChildrenActive] = useState(false);
  const [dictionaryTermIsSelected, setDictionaryTermIsSelected] = useState(false);
  const [selectedLayers, SetSelectedLayers] = useState();
  const [textNodeValues, setTextNodeValues] = useState();
  const [pages, setPages] = useState();
  const [dictionaries, setDictionaries] = useState();
  const [isProcessing, SetProcessing] = useState(false);

  useEffect(() => {

    onmessage = event => {
        if(event.data.pluginMessage.name === "textNodes"){
          setTextNodeValues(event.data.pluginMessage.data);
          setPages(event.data.pluginMessage.pages);
          setDictionaries(event.data.pluginMessage.dictionaries);
        }
        if(event.data.pluginMessage.name === "updateTextNodes"){
          setTextNodeValues(event.data.pluginMessage.data);
        }
        if(event.data.pluginMessage.eventName === "processing-status"){
          SetProcessing(false);
        }

        if(event.data.pluginMessage.eventName === "processing-dictionaries"){
          SetProcessing(false);
        }

        if(event.data.pluginMessage.eventName === "term-deleted"){
          SetProcessing(false);
        }
    }
}, [isProcessing]);

    const handleGenerateDictionaryVariables = () =>{

      SetProcessing(true);

      parent.postMessage(
          { pluginMessage: { 
              type: "generate-dictionary-variables"
            } },
          "*"
      );       
    }


  return (
    <>
    {
      dictionaries ? (
        <div className="d-flex">
        {isProcessing && <div className={styles.loadingOverlay}><h1>{t.updating[LANG]}</h1></div>}
          <PageText 
            dictionaryTermIsSelected={dictionaryTermIsSelected}
            textNodeValues={textNodeValues}
            pages={pages}
            dictionaries={dictionaries}
            isProcessing={SetProcessing}
            setDictionaryTermIsSelected={setDictionaryTermIsSelected}
            SetSelectedLayers={SetSelectedLayers}
            selectedLayers={selectedLayers}
            setIsActive={(newActive) => setChildrenActive(newActive)}
            className="w-100 bg-light overflow-scroll vh-100"
          />
          <div className={styles.containerSidePanel}>
            { !childrenActive  ?
                <div className="h-100 d-flex align-items-center justify-content-center">
                  <h2>{t.select_term[LANG]}</h2>
                </div>
            :
               <SelectFromDictionaries 
                  dictionaries={dictionaries}
                  dictionaryTermTrigger={setDictionaryTermIsSelected}
                  setStatusFromAddNew={SetSelectedLayers}
                  setIsActive={setChildrenActive} 
                  isProcessing={SetProcessing}
                  selectedLayers={selectedLayers}
                  SetSelectedLayers={SetSelectedLayers}
                  className="p0"
                />
            }

          </div>
      </div>       
      ) : (
        <>
        {isProcessing && <div className={styles.loadingOverlay}><h1>{t.generateDictionary[LANG]}</h1></div>}
        <div className="h-100 d-flex align-items-center justify-content-center">
              <a className="ml-2"
                style={{fontSize:12 + "px"}}
                href="#" 
                onClick={handleGenerateDictionaryVariables} >{t.generateDictionary[LANG]}
              </a>
      </div>
        </>
      )
    }
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("react-page"));