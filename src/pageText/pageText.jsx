import React, {useEffect, useState, useRef} from "react";
import PropTypes from 'prop-types';
import classNames from 'classNames'
import styles from './pageText.modules.scss'
import { TRANS_SEPARATOR, MANUAL_TRANSLATION, NOT_TRANSLATED, UNTRANSLATED, TRANS_IDENTIFIER, LANG } from '../globalConst'
import t from '../applicationTranslations'

const ShowPageText = ({className, pages, isProcessing, textNodeValues, setIsActive, SetSelectedLayers, setDictionaryTermIsSelected, selectedLayers, dictionaryTermIsSelected}) =>  {

    let [filteredItems, setList] = useState();
    const [selectedText, setSelectedText] = useState();
    const [checked, setChecked] = useState([]); 
    const [isTabActive, setTabActive] = useState(0); 
    const [showWithTranslation, setShowWithTranslations] = useState(true);
    const [showWithoutTranslations, setShowWithoutTranslations] = useState(true);
    const [pageNames, setPageNames] = useState();
    const [activePage, setActivePage] = useState();
    const [termCount, setTermCount] = useState();
    const [pluginWindowUIIsMaximized, setPluginWindowUIIsMaximized] = useState(true);
    const [linkData, setLinkData] = useState();
    const csvBTNRef = useRef(null);
    
    useEffect(() => {
        appendTranslation(textNodeValues);
        setTermCount(textNodeValues.length);
        pages = filterPages(pages, textNodeValues);
        setPageNames(pages);
        setList(textNodeValues);
        setChecked(new Array(textNodeValues.length).fill(false));
    }, [textNodeValues]);

    useEffect(() => {

        onmessage = event => {
            if(event.data.pluginMessage.name === "setDownload"){
                setLinkData(event.data.pluginMessage.data); 
            }
        }

    }, []);

    useEffect(() => { csvBTNRef && csvBTNRef.current.click();}, [csvBTNRef]);

    useEffect(() => {pageNames && setActivePage(pageNames[0]);}, [pageNames]);

    useEffect(() => {
        if(textNodeValues){
            filteredItems = textNodeValues.filter(item => {
                if (showWithTranslation && showWithoutTranslations) {
                    return textNodeValues;
                } else if (showWithTranslation) {
                    return item.status != NOT_TRANSLATED;
                } else if (showWithoutTranslations) {
                    return item.status === NOT_TRANSLATED;
                } else {
                    return;
                }
                });
                setList(filteredItems);
                setTermCount(filteredItems.length);
        }
    
    }, [showWithTranslation, showWithoutTranslations, termCount]);

    useEffect(() => {
    
        // Update name and statuses displayed in the list of terms
        if(dictionaryTermIsSelected){
            setList(prevList => {  
                const newList = [...prevList];
                newList[selectedText].dictionaryName = selectedLayers.dictionaryName;
                newList[selectedText].item = selectedLayers.item;
                newList[selectedText].layerName = dictionaryTermIsSelected && TRANS_IDENTIFIER + selectedLayers.dictionaryName + TRANS_SEPARATOR + selectedLayers.item;
                newList[selectedText].status = 
                    dictionaryTermIsSelected && selectedLayers.dictionaryName + TRANS_SEPARATOR + 
                     (selectedLayers.dictionaryName === MANUAL_TRANSLATION ? selectedLayers.translation : selectedLayers.item )
                newList[selectedText].translation = selectedLayers.translation;
                newList[selectedText].layerID = selectedLayers.layerID;
                return newList;
            })

            setDictionaryTermIsSelected(false);
        }

        if(dictionaryTermIsSelected){
            // Not sure why I need to post the message here and not in dictionary
            parent.postMessage(
                { pluginMessage: { 
                    type: "check-for-layer-updates", 
                    data: selectedLayers
                    } },
                "*"
            );
        }

    }, [selectedText, dictionaryTermIsSelected]);

    const appendTranslation = (values) => {

        values.map((item) => {
            if(item.status.includes(TRANS_SEPARATOR)){              
                const [dictionaryName, term] = item.status.split(TRANS_SEPARATOR);
                if(dictionaryName === MANUAL_TRANSLATION && term === MANUAL_TRANSLATION){ item.translation = MANUAL_TRANSLATION}
                else if(dictionaryName === NOT_TRANSLATED ){ item.translation = NOT_TRANSLATED}
            }
        });

        return values;
    }

    const filterPages = (pages, textNodeValues) => {
        return pages.filter(page =>
            textNodeValues.some(object => object["page"].pageName === page)
          );
    }

    const handleChange = (item, index) => (e) =>  {  
        setDictionaryTermIsSelected(false);
        SetSelectedLayers(item);
        setSelectedText(index); 
        setIsActive(true);
        setChecked((prevState) => {
            const newState = [...prevState];
            newState[index] = !newState[index];
            newState.fill(false); 
            newState[index] = true;
            return newState;
        });
    }; 

    const onClickReset = (index, item) => {
        setList(prevList => {
            const newList = [...prevList];
            newList[index].item = item.textValue;
            newList[index].dictionaryName = NOT_TRANSLATED;
            newList[index].layerName = UNTRANSLATED;
            newList[index].status = NOT_TRANSLATED;
            newList[index].translation = NOT_TRANSLATED;
            return newList;
        });

      parent.postMessage(
        { pluginMessage: { 
            type: "reset-layer-name", 
            data: item
         } },
        "*"
      );

      isProcessing(true);
    }

    const onNavigateTo = (item, page) => {
        parent.postMessage(
            { pluginMessage: { 
                type: "navigate-to-layer", 
                item: item,
                page: page
             } },
            "*"
          );
    }

    const groupByFrameNames = (prevItem, item, index) => {

        switch (index) {
            case 0:
                return <h4 className="fs-6 mt-3">{item.parentFrame.frameName}</h4>
            default:
                if(item.parentFrame.frameName !== prevItem.parentFrame.frameName){
                    return <h4 className="fs-6 mt-3">{ item.parentFrame.frameName}</h4>
                }
        }
    }

    const toggleWindowPluginUI = () => {
        if(pluginWindowUIIsMaximized){
            parent.postMessage({ pluginMessage: { type: "minimize-plugin-ui"} },"*");
            setPluginWindowUIIsMaximized(false);
        }else{
            parent.postMessage({ pluginMessage: { type: "maximize-plugin-ui"} },"*");
            setPluginWindowUIIsMaximized(true);
        }
    }

    const onDelete = (item, index) =>{

        isProcessing(true);
  
        setList((prevState) => {
            const newState = [...prevState]; 
            newState.splice(index, 1);
            return newState;
        });

        parent.postMessage(
            { pluginMessage: { 
                type: "delete-term", 
                item: item
             } },
            "*"
        );       
    }

    const handleGenerateCSV = () =>{
  
        parent.postMessage(
            { pluginMessage: { 
                type: "export-csv"
             } },
            "*"
        );       
    }

    const handleGenerateDictionaryVariables = () =>{

        isProcessing(true);
        parent.postMessage(
            { pluginMessage: { 
                type: "generate-dictionary-variables"
             } },
            "*"
        );      
    }

    return (
        <div className={classNames(className, styles.textList)}>
            <div onClick={toggleWindowPluginUI}  className={classNames(styles.overlay, "vh-100 vw-100",{"d-flex" : !pluginWindowUIIsMaximized})}>{t.maximize[LANG]}</div>
            <div className={classNames(styles.header, "d-flex flex-column")}>
                <div className="d-flex align-items-center justify-content-between mb-0">
                    <h3 className="fs-4 px-3 mt-2">{t.terms[LANG]}<span className="ml-1">({termCount})</span></h3>
                    <div className={classNames(
                            "align-items-center d-flex px-3", 
                            styles.filters)}>
                        <div className={classNames("mr-3", styles.chips)}>
                            <input 
                                className="mr-1" 
                                type="checkbox" 
                                id="withTranslations" 
                                name="withTranslations" 
                                checked={showWithTranslation} 
                                onChange={() => setShowWithTranslations(!showWithTranslation)}
                            />
                            <label htmlFor="withTranslations">{t.with_translation[LANG]}</label>
                        </div>

                        <div className={styles.chips}>
                            <input 
                                className="mr-1" 
                                type="checkbox" 
                                id="withoutTranslations" 
                                name="withoutTranslations" 
                                checked={showWithoutTranslations}
                                onChange={() => setShowWithoutTranslations(!showWithoutTranslations)}
                            />
                            <label htmlFor="withoutTranslations">{t.without_translation[LANG]}</label>
                        </div>
                        <div onClick={toggleWindowPluginUI} className={classNames("ml-2", styles.toggleWindow)}>{t.minimize[LANG]}</div>
                    </div>
                </div>

                <div className={classNames(styles.tabs,"d-flex flex-row px-3 align-items-center")}>                   
                    {pageNames && pageNames.map((page, index) => (
                        <div title={page} className={classNames("flex-fill text-truncate",styles.tab, {[styles.active] : isTabActive === index})}
                            onClick={() => { setActivePage(page); setTabActive(index);}}>
                                {page}
                        </div>
                    ))}
                </div>
            </div>
            <form className="py-2 px-3">
                <fieldset>
                    { filteredItems && filteredItems.map((item, index) =>{
                    return(
                        <>
                            <div key={index}className={classNames(
                                    "flex-column",
                                    item.page.pageName === activePage && "d-flex",[styles.labelContainer])}
                            >

                                {groupByFrameNames(filteredItems[index - 1], item, index)}
                                <label 
                                    htmlFor={index}
                                    onChange={handleChange(item, index)}
                                    className={classNames(
                                        item.status === "Not translated" ? styles.borderWarning : null,
                                        styles.terms,
                                        "justify-content-between d-flex",{
                                        [styles.checked] :  checked[index],
                                    })}
                                    key={index}
                                >
                                    <div className="d-flex text-truncate">
                                        <input type="radio" id={index} name="selector" checked={checked[index] && checked}  onChange={() => null}/>
                                        <div className="ml-2 text-truncate">
                                            <p title={item.textValue} className={classNames("mb-0 text-truncate" ,styles.textValue)}>
                                                {item.textValue}
                                            </p>
                                            <div title={item.status} className={classNames(item.status === "Not translated" ? styles.warning: null, styles.status, "text-truncate")}>
                                               {item.status}
                                            </div>

                                        </div>
                                    </div>
                                    <div className={classNames(
                                        "align-items-center", 
                                        styles.actionContainer,
                                        checked[index] && styles.actionContainerChecked
                                        )
                                        }>
                                       <a 
                                            className={classNames("mr-4",styles.danger)}
                                            href="#" 
                                            onClick={() => onDelete(item, index)}>
                                                {t.delete[LANG]}
                                        </a>                             
                                        <a  href="#" 
                                            className="mr-2"
                                            onClick={() => onClickReset(index, item)}
                                        >{t.reset[LANG]}</a>
                                        <a 
                                            href="#"  
                                            className="mr-2" 
                                            onClick={() => onNavigateTo(item, item.page)}>
                                                {t.view[LANG]}
                                        </a>
                                    </div>
                                </label>
                            </div>
                        </>
                    )
                    })
                    }
                </fieldset>
            </form>
            <div className="action-bar">
              <a className="mr-2"
                style={{fontSize:12 + "px"}}
                href={linkData} 
                download="testFile.csv" 
                ref={csvBTNRef}
                onClick={handleGenerateCSV} >{t.generateCSV[LANG]}
              </a>
              <a className="ml-2"
                style={{fontSize:12 + "px"}}
                href="#" 
                onClick={handleGenerateDictionaryVariables} >{t.generateDictionary[LANG]}
              </a>
            </div>
        </div>
    )

}

ShowPageText.propTypes = {
    className: PropTypes.string,
    checked: PropTypes.func
};
  


export default ShowPageText;